import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import { MAX_UPLOAD_BYTES, MEDIA_TYPES, SERVER_UPLOAD_LIMIT, srcFromMediaKey } from '@/lib/media';
import { saveFile, storageMode } from '@/lib/storage';

function uniqueKey(name: string, type: string) {
  const stem = name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `media/${crypto.randomUUID().slice(0, 12)}${stem ? `-${stem}` : ''}.${MEDIA_TYPES[type]}`;
}

/** Saves an upload small enough to pass through a function. Larger ones use ./presign. */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Your session has ended. Sign in again.' }, { status: 401 });
  }
  if (storageMode() === 'none') {
    return NextResponse.json({ error: 'Connect a Vercel Blob store to upload files.' }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file was received.' }, { status: 400 });
  }
  if (!MEDIA_TYPES[file.type]) {
    return NextResponse.json({ error: `${file.type || 'This file type'} isn't supported.` }, { status: 415 });
  }
  const limit = storageMode() === 'blob' ? SERVER_UPLOAD_LIMIT : MAX_UPLOAD_BYTES;
  if (file.size > limit) {
    return NextResponse.json({ error: 'This file is too large to upload here.' }, { status: 413 });
  }

  const key = uniqueKey(file.name, file.type);
  await saveFile(key, new Uint8Array(await file.arrayBuffer()), file.type);
  return NextResponse.json({ src: srcFromMediaKey(key), size: file.size });
}
