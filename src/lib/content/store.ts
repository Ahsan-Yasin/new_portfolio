import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { listFiles, readJson, removeFile, writeJson } from '@/lib/storage';
import { parseContent, type Content } from './schema';
import { seedContent } from './seed';

export const CONTENT_TAG = 'content';

const DRAFT_KEY = 'content/draft.json';
const PUBLISHED_KEY = 'content/published.json';
const HISTORY_PREFIX = 'content/history/';
const HISTORY_LIMIT = 30;

/** Reads the live document. Falls back to the sample content before anything is published. */
async function readPublished(): Promise<Content> {
  const stored = await readJson<unknown>(PUBLISHED_KEY);
  return stored ? parseContent(stored.data) : parseContent(seedContent);
}

/**
 * What visitors see. Pages render from this cache, so they stay static and fast
 * until a publish expires the tag.
 */
export async function getPublishedContent(): Promise<Content> {
  'use cache';
  cacheTag(CONTENT_TAG);

  try {
    const content = await readPublished();
    cacheLife('max');
    return content;
  } catch (error) {
    // A storage failure during a build shouldn't fail the deploy, so build with
    // the sample content and re-read shortly afterwards. At runtime, let the error
    // boundary handle it instead of showing a visitor sample content.
    if (process.env.NEXT_PHASE !== 'phase-production-build') throw error;
    console.error('Could not read content during the build:', error);
    cacheLife({ stale: 0, revalidate: 1, expire: 60 });
    return parseContent(seedContent);
  }
}

export type DraftDocument = {
  draft: Content;
  published: Content;
  /** Pass back when saving so edits from another tab aren't silently overwritten. */
  etag: string | null;
};

export async function getDraftDocument(): Promise<DraftDocument> {
  const [stored, published] = await Promise.all([readJson<unknown>(DRAFT_KEY), readPublished()]);
  return {
    draft: stored ? parseContent(stored.data) : published,
    published,
    etag: stored?.etag ?? null,
  };
}

export async function saveDraft(content: Content, etag: string | null) {
  const saved = await writeJson(DRAFT_KEY, content, { ifMatch: etag });
  return { etag: saved.etag };
}

/** Publishes the content, and keeps a copy so any earlier version can be brought back. */
export async function publishContent(content: Content, etag: string | null) {
  const live: Content = { ...content, isSample: false };
  const saved = await writeJson(DRAFT_KEY, live, { ifMatch: etag });
  await writeJson(PUBLISHED_KEY, live);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await writeJson(`${HISTORY_PREFIX}${stamp}.json`, live);

  const versions = await listFiles(HISTORY_PREFIX);
  await Promise.all(versions.slice(HISTORY_LIMIT).map((file) => removeFile(file.key)));

  return { etag: saved.etag, content: live };
}

export type VersionSummary = { id: string; publishedAt: string; size: number };

export async function listVersions(): Promise<VersionSummary[]> {
  const files = await listFiles(HISTORY_PREFIX);
  return files.map((file) => ({
    id: file.key.slice(HISTORY_PREFIX.length).replace(/\.json$/, ''),
    publishedAt: file.uploadedAt,
    size: file.size,
  }));
}

export async function readVersion(id: string): Promise<Content | null> {
  if (!/^[0-9TZ-]+$/.test(id)) return null;
  const stored = await readJson<unknown>(`${HISTORY_PREFIX}${id}.json`);
  return stored ? parseContent(stored.data) : null;
}
