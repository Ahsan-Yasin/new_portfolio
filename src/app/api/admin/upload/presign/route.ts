import { issueSignedToken } from '@vercel/blob';
import { handleUploadPresigned, type HandleUploadPresignedBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import { MAX_UPLOAD_BYTES, MEDIA_TYPES } from '@/lib/media';

const TOKEN_LIFETIME = 15 * 60 * 1000;

/** Lets the browser send a large file directly to Blob storage, past the function body limit. */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadPresignedBody;

  try {
    const response = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!(await isAuthenticated())) throw new Error('Not signed in');
        if (!pathname.startsWith('media/')) throw new Error('Invalid upload path');

        const allowedContentTypes = Object.keys(MEDIA_TYPES);
        const token = await issueSignedToken({
          pathname,
          operations: ['put'],
          allowedContentTypes,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          validUntil: Date.now() + TOKEN_LIFETIME,
        });

        return {
          token,
          urlOptions: {
            allowedContentTypes,
            maximumSizeInBytes: MAX_UPLOAD_BYTES,
            addRandomSuffix: false,
            allowOverwrite: false,
            cacheControlMaxAge: 60 * 60 * 24 * 365,
          },
        };
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: message === 'Not signed in' ? 401 : 400 });
  }
}
