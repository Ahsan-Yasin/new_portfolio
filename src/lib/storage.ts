import 'server-only';

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  BlobNotFoundError,
  BlobPreconditionFailedError,
  del,
  get,
  issueSignedToken,
  list,
  presignUrl,
  put,
} from '@vercel/blob';

/**
 * Where content and uploads live.
 * - blob: a private Vercel Blob store, used in production.
 * - file: the local `.data` folder, so `npm run dev` works with no setup.
 * - none: deployed to Vercel with no store connected. The site still renders its
 *   sample content, and the admin explains how to connect storage.
 */
export type StorageMode = 'blob' | 'file' | 'none';

export function storageMode(): StorageMode {
  if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) return 'blob';
  return process.env.VERCEL ? 'none' : 'file';
}

export class StorageConflictError extends Error {
  constructor() {
    super('The stored document changed since it was last read.');
    this.name = 'StorageConflictError';
  }
}

export class StorageUnavailableError extends Error {
  constructor() {
    super('No storage is connected to this deployment.');
    this.name = 'StorageUnavailableError';
  }
}

export type StoredFile = {
  key: string;
  size: number;
  uploadedAt: string;
};

const FILE_ROOT = path.join(process.cwd(), '.data');

function fileEtag(bytes: Uint8Array | string) {
  return createHash('sha1').update(bytes).digest('hex');
}

function resolveFilePath(key: string) {
  const resolved = path.resolve(FILE_ROOT, key);
  if (resolved !== FILE_ROOT && !resolved.startsWith(FILE_ROOT + path.sep)) {
    throw new Error('Invalid storage key');
  }
  return resolved;
}

async function streamToText(stream: ReadableStream<Uint8Array>) {
  return new Response(stream).text();
}

/** Always reads the latest version, bypassing the Blob CDN, so a save is visible immediately. */
export async function readJson<T>(key: string): Promise<{ data: T; etag: string } | null> {
  const mode = storageMode();
  if (mode === 'none') return null;

  if (mode === 'file') {
    try {
      const text = await fs.readFile(resolveFilePath(key), 'utf8');
      return { data: JSON.parse(text) as T, etag: fileEtag(text) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  const result = await get(key, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const text = await streamToText(result.stream);
  return { data: JSON.parse(text) as T, etag: result.blob.etag };
}

/**
 * Writes a JSON document. Pass `ifMatch` to fail with StorageConflictError when the
 * document changed since it was read, for example when edited in a second tab.
 * Pass `ifMatch: null` to require that the document doesn't exist yet.
 */
export async function writeJson(
  key: string,
  data: unknown,
  options: { ifMatch?: string | null } = {},
): Promise<{ etag: string }> {
  const mode = storageMode();
  if (mode === 'none') throw new StorageUnavailableError();
  const body = JSON.stringify(data, null, 2);

  if (mode === 'file') {
    const target = resolveFilePath(key);
    if (options.ifMatch !== undefined) {
      const current = await fs.readFile(target, 'utf8').catch(() => null);
      const currentEtag = current === null ? null : fileEtag(current);
      if (currentEtag !== options.ifMatch) throw new StorageConflictError();
    }
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body, 'utf8');
    return { etag: fileEtag(body) };
  }

  try {
    const result = await put(key, body, {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: options.ifMatch !== null,
      cacheControlMaxAge: 60,
      ...(options.ifMatch ? { ifMatch: options.ifMatch } : {}),
    });
    return { etag: result.etag };
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) throw new StorageConflictError();
    // With overwriting off, a document that already exists fails with a general error.
    if (options.ifMatch === null && /already exists/i.test(String((error as Error).message))) {
      throw new StorageConflictError();
    }
    throw error;
  }
}

export async function listFiles(prefix: string): Promise<StoredFile[]> {
  const mode = storageMode();
  if (mode === 'none') return [];

  if (mode === 'file') {
    const dir = resolveFilePath(prefix);
    const names = await fs.readdir(dir).catch(() => [] as string[]);
    const files = await Promise.all(
      names.map(async (name) => {
        const stat = await fs.stat(path.join(dir, name));
        return stat.isFile()
          ? {
              key: `${prefix.replace(/\/$/, '')}/${name}`,
              size: stat.size,
              uploadedAt: stat.mtime.toISOString(),
            }
          : null;
      }),
    );
    return files
      .filter((file): file is StoredFile => file !== null)
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }

  const files: StoredFile[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      files.push({
        key: blob.pathname,
        size: blob.size,
        uploadedAt: new Date(blob.uploadedAt).toISOString(),
      });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return files.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function removeFile(key: string) {
  const mode = storageMode();
  if (mode === 'none') throw new StorageUnavailableError();

  if (mode === 'file') {
    await fs.rm(resolveFilePath(key), { force: true });
    return;
  }

  try {
    await del(key);
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error;
  }
}

export async function saveFile(key: string, bytes: Uint8Array, contentType: string) {
  const mode = storageMode();
  if (mode === 'none') throw new StorageUnavailableError();

  if (mode === 'file') {
    const target = resolveFilePath(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
    return;
  }

  await put(key, Buffer.from(bytes), {
    access: 'private',
    contentType,
    addRandomSuffix: false,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
}

/**
 * A short-lived direct link to a stored file. Video and PDFs use this rather than
 * streaming through a function: it avoids the function response size limit and
 * gives Safari the byte-range requests it requires to play video.
 */
export async function signedFileUrl(key: string, lifetimeMs: number) {
  if (storageMode() !== 'blob') return null;
  const validUntil = Date.now() + lifetimeMs;
  const token = await issueSignedToken({ pathname: key, operations: ['get'], validUntil });
  const { presignedUrl } = await presignUrl(token, {
    operation: 'get',
    pathname: key,
    access: 'private',
    validUntil,
  });
  return presignedUrl;
}

/** Reads an upload for delivery through the /media route. */
export async function readFile(
  key: string,
): Promise<{ stream: ReadableStream<Uint8Array>; size: number | null; contentType: string | null } | null> {
  const mode = storageMode();
  if (mode === 'none') return null;

  if (mode === 'file') {
    try {
      const bytes = await fs.readFile(resolveFilePath(key));
      return { stream: new Response(bytes).body!, size: bytes.byteLength, contentType: null };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  const result = await get(key, { access: 'private' });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return {
    stream: result.stream,
    size: result.blob.size,
    contentType: result.blob.contentType,
  };
}
