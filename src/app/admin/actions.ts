'use server';

import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  clearFailedLogins,
  endSession,
  isCorrectPassword,
  loginBlockedForSeconds,
  passwordStatus,
  recordFailedLogin,
  requireAdmin,
  startSession,
} from '@/lib/auth/session';
import { parseContent, type Content } from '@/lib/content/schema';
import {
  CONTENT_TAG,
  getDraftDocument,
  listVersions,
  publishContent,
  readVersion,
  saveDraft,
  type DraftDocument,
  type VersionSummary,
} from '@/lib/content/store';
import { mediaKeyFromSrc, srcFromMediaKey } from '@/lib/media';
import {
  listFiles,
  removeFile,
  StorageConflictError,
  StorageUnavailableError,
} from '@/lib/storage';

export type LoginState = { error?: string };

export async function loginAction(_previous: LoginState, form: FormData): Promise<LoginState> {
  const status = passwordStatus();
  if (status === 'missing') return { error: 'ADMIN_PASSWORD isn’t set on this deployment.' };
  if (status === 'too-short') return { error: 'ADMIN_PASSWORD must be at least 8 characters.' };

  const requestHeaders = await headers();
  const client = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';

  const blockedFor = loginBlockedForSeconds(client);
  if (blockedFor > 0) {
    return { error: `Too many attempts. Try again in ${Math.ceil(blockedFor / 60)} min.` };
  }

  const password = String(form.get('password') ?? '');
  if (!isCorrectPassword(password)) {
    recordFailedLogin(client);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { error: 'That password isn’t right.' };
  }

  clearFailedLogins(client);
  await startSession();
  redirect('/admin');
}

export async function logoutAction() {
  await endSession();
  redirect('/admin/login');
}

export type SaveResult =
  | { status: 'saved'; etag: string; content?: Content }
  | { status: 'conflict' }
  | { status: 'invalid'; message: string }
  | { status: 'unavailable' };

function describeProblem(error: unknown): SaveResult {
  if (error instanceof StorageConflictError) return { status: 'conflict' };
  if (error instanceof StorageUnavailableError) return { status: 'unavailable' };
  throw error;
}

function validate(input: unknown): Content | SaveResult {
  try {
    return parseContent(input);
  } catch (error) {
    console.error('Rejected invalid content:', error);
    return { status: 'invalid', message: 'Some content couldn’t be read, so nothing was saved.' };
  }
}

export async function saveDraftAction(input: unknown, etag: string | null): Promise<SaveResult> {
  await requireAdmin();
  const content = validate(input);
  if ('status' in content) return content;

  try {
    const saved = await saveDraft(content, etag);
    return { status: 'saved', etag: saved.etag };
  } catch (error) {
    return describeProblem(error);
  }
}

export async function publishAction(input: unknown, etag: string | null): Promise<SaveResult> {
  await requireAdmin();
  const content = validate(input);
  if ('status' in content) return content;

  try {
    const saved = await publishContent(content, etag);
    updateTag(CONTENT_TAG);
    return { status: 'saved', etag: saved.etag, content: saved.content };
  } catch (error) {
    return describeProblem(error);
  }
}

/** The latest stored draft, used to resolve a save conflict with another tab. */
export async function readDraftAction(): Promise<DraftDocument> {
  await requireAdmin();
  return getDraftDocument();
}

export async function listVersionsAction(): Promise<VersionSummary[]> {
  await requireAdmin();
  return listVersions();
}

export async function readVersionAction(id: string): Promise<Content | null> {
  await requireAdmin();
  return readVersion(id);
}

export type MediaFile = { src: string; size: number; uploadedAt: string };

export async function listMediaAction(): Promise<MediaFile[]> {
  await requireAdmin();
  const files = await listFiles('media/');
  return files.map((file) => ({
    src: srcFromMediaKey(file.key),
    size: file.size,
    uploadedAt: file.uploadedAt,
  }));
}

export async function deleteMediaAction(src: string) {
  await requireAdmin();
  const key = mediaKeyFromSrc(src);
  if (key) await removeFile(key);
}
