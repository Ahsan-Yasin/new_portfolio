'use client';

import { createContext, use, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { publishAction, readDraftAction, saveDraftAction, type SaveResult } from '@/app/admin/actions';
import { parseContent, type Content } from '@/lib/content/schema';
import type { DraftDocument } from '@/lib/content/store';
import type { StorageMode } from '@/lib/storage';
import { clearRecovery, readRecovery, writeRecovery, type Recovery } from './recovery';

const AUTOSAVE_MS = 1200;
const TOAST_MS = 5000;
const TOAST_ACTION_MS = 8000;

/* Paths -------------------------------------------------------------------- */

type Segment = string | number | { id: string };
type Element<T> = T extends readonly (infer E)[] ? E : never;
type Identified = { id: string };

function readPath(root: unknown, path: readonly Segment[]): unknown {
  let current = root;
  for (const segment of path) {
    if (current === null || current === undefined) return undefined;
    if (typeof segment === 'object') {
      current = (current as Identified[]).find((entry) => entry?.id === segment.id);
    } else {
      current = (current as Record<string | number, unknown>)[segment];
    }
  }
  return current;
}

function writePath(root: unknown, path: readonly Segment[], change: (previous: unknown) => unknown): unknown {
  if (path.length === 0) return change(root);
  const [head, ...rest] = path;

  if (Array.isArray(root)) {
    const index = typeof head === 'object' ? root.findIndex((entry: Identified) => entry?.id === head.id) : Number(head);
    if (index < 0 || index >= root.length) return root;
    const next = writePath(root[index], rest, change);
    if (next === root[index]) return root;
    const copy = root.slice();
    copy[index] = next;
    return copy;
  }

  const key = head as string;
  const record = (root ?? {}) as Record<string, unknown>;
  const next = writePath(record[key], rest, change);
  return next === record[key] ? root : { ...record, [key]: next };
}

/**
 * A typed pointer into the draft. List items are addressed by id, so a write that
 * lands after an upload still reaches the right item if the list was reordered.
 */
export class Cursor<T> {
  constructor(
    readonly store: DraftStore,
    readonly path: readonly Segment[],
  ) {}

  at<K extends keyof T>(key: K): Cursor<T[K]> {
    return new Cursor<T[K]>(this.store, [...this.path, key as string]);
  }

  item(id: string): Cursor<Element<T>> {
    return new Cursor<Element<T>>(this.store, [...this.path, { id }]);
  }

  index(index: number): Cursor<Element<T>> {
    return new Cursor<Element<T>>(this.store, [...this.path, index]);
  }

  /** Treats a union (such as Block) as one known member. */
  narrow<U extends T>(): Cursor<U> {
    return new Cursor<U>(this.store, this.path);
  }

  read(): T {
    return readPath(this.store.getState().draft, this.path) as T;
  }

  update(change: (previous: T) => T) {
    this.store.write(this.path, (previous) => change(previous as T));
  }

  set(next: T) {
    this.update(() => next);
  }
}

/* Comparison --------------------------------------------------------------- */

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => deepEqual(value, b[index]));
  }
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
    if (!deepEqual(left[key], right[key])) return false;
  }
  return true;
}

/* Store -------------------------------------------------------------------- */

export type SaveState =
  | { status: 'saved' }
  | { status: 'saving' }
  | { status: 'error'; message: string }
  | { status: 'unavailable' };

export type Toast = {
  id: number;
  message: string;
  tone?: 'error';
  undo?: () => void;
  link?: { label: string; href: string };
};

export type ConfirmRequest = {
  title: string;
  message?: string;
  confirmLabel: string;
  destructive?: boolean;
  resolve: (confirmed: boolean) => void;
};

export type PublishOutcome =
  | { status: 'live' }
  | { status: 'conflict' }
  | { status: 'failed'; message: string };

export type AdminState = {
  draft: Content;
  /** The last draft the server accepted. The preview follows this rather than unsaved edits. */
  saved: Content;
  published: Content;
  etag: string | null;
  save: SaveState;
  conflict: boolean;
  recovery: Recovery | null;
  previewNonce: number;
  toasts: Toast[];
  confirm: ConfirmRequest | null;
};

/** Reaches the upload route, which answers 401 before doing any work when signed out. */
async function sessionHasExpired() {
  try {
    const response = await fetch('/api/admin/upload', { method: 'POST', body: new FormData() });
    return response.status === 401;
  } catch {
    return false;
  }
}

export class DraftStore {
  readonly storage: StorageMode;
  readonly root: Cursor<Content> = new Cursor<Content>(this, []);

  private state: AdminState;
  private listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private saving: Promise<void> | null = null;
  private leaving = false;
  private toastId = 0;
  private comparedDraft: Content | null = null;
  private comparedPublished: Content | null = null;
  private comparison = false;

  constructor(initial: DraftDocument, storage: StorageMode) {
    this.storage = storage;
    this.state = {
      draft: initial.draft,
      saved: initial.draft,
      published: initial.published,
      etag: initial.etag,
      save: storage === 'none' ? { status: 'unavailable' } : { status: 'saved' },
      conflict: false,
      recovery: null,
      previewNonce: 0,
      toasts: [],
      confirm: null,
    };
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = () => this.state;

  private set(partial: Partial<AdminState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener());
  }

  isDirty() {
    return this.state.draft !== this.state.saved;
  }

  hasUnpublishedChanges() {
    const { draft, published } = this.state;
    if (draft !== this.comparedDraft || published !== this.comparedPublished) {
      this.comparedDraft = draft;
      this.comparedPublished = published;
      this.comparison = !deepEqual(draft, published);
    }
    return this.comparison;
  }

  /* Editing */

  write(path: readonly Segment[], change: (previous: unknown) => unknown) {
    const next = writePath(this.state.draft, path, change) as Content;
    if (next !== this.state.draft) this.commit(next);
  }

  /** Swaps in a whole document, such as a restored version or an imported backup. */
  replaceDraft(content: Content) {
    this.commit(content);
  }

  private commit(draft: Content) {
    this.set({ draft });
    this.scheduleSave();
  }

  /* Saving */

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private scheduleSave() {
    this.clearTimer();
    if (this.storage === 'none') {
      writeRecovery(this.state.draft);
      return;
    }
    if (this.state.conflict) return;
    if (this.state.save.status !== 'saving') this.set({ save: { status: 'saving' } });
    this.timer = setTimeout(() => void this.pump(), AUTOSAVE_MS);
  }

  /** Saves now, for Cmd+S and the retry button. */
  saveNow() {
    this.clearTimer();
    if (this.storage === 'none') return Promise.resolve();
    return this.pump();
  }

  private pump(): Promise<void> {
    this.clearTimer();
    if (!this.saving) {
      this.saving = this.runSaves().finally(() => {
        this.saving = null;
      });
    }
    return this.saving;
  }

  /** Saves never overlap: one runs at a time, and the loop picks up anything newer when it returns. */
  private async runSaves() {
    while (this.isDirty() && !this.state.conflict) {
      const snapshot = this.state.draft;
      if (this.state.save.status !== 'saving') this.set({ save: { status: 'saving' } });
      writeRecovery(snapshot);

      let result: SaveResult;
      try {
        result = await saveDraftAction(snapshot, this.state.etag);
      } catch {
        if (await sessionHasExpired()) {
          this.sessionExpired();
          return;
        }
        this.set({ save: { status: 'error', message: 'Check your connection and try again.' } });
        return;
      }

      if (result.status === 'saved') {
        this.set({ etag: result.etag, saved: snapshot, previewNonce: this.state.previewNonce + 1 });
        continue;
      }
      if (result.status === 'conflict') {
        this.set({ conflict: true, save: { status: 'error', message: 'This was changed in another tab.' } });
        return;
      }
      if (result.status === 'invalid') {
        this.set({ save: { status: 'error', message: result.message } });
        return;
      }
      this.set({ save: { status: 'unavailable' } });
      return;
    }

    if (!this.isDirty() && !this.state.conflict) {
      this.set({ save: { status: 'saved' } });
      clearRecovery();
    }
  }

  /** Keeps a copy of the work on this device, then sends the owner to sign in again. */
  sessionExpired() {
    writeRecovery(this.state.draft);
    this.leaving = true;
    // A full page load on purpose: this store lives outside React's router, and nothing here should survive.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign('/admin/login');
  }

  /* Conflicts */

  async reloadLatest() {
    try {
      const latest = await readDraftAction();
      this.clearTimer();
      clearRecovery();
      this.set({
        draft: latest.draft,
        saved: latest.draft,
        published: latest.published,
        etag: latest.etag,
        conflict: false,
        save: { status: 'saved' },
        previewNonce: this.state.previewNonce + 1,
      });
    } catch {
      await this.reportConflictFailure();
    }
  }

  async keepMine() {
    try {
      const latest = await readDraftAction();
      this.set({ etag: latest.etag, conflict: false });
      await this.saveNow();
    } catch {
      await this.reportConflictFailure();
    }
  }

  private async reportConflictFailure() {
    if (await sessionHasExpired()) {
      this.sessionExpired();
      return;
    }
    this.toast('Couldn’t reach the server. Check your connection and try again.', { tone: 'error' });
  }

  /* Publishing */

  async publish(): Promise<PublishOutcome> {
    this.clearTimer();
    if (this.saving) await this.saving;
    if (this.state.conflict) return { status: 'conflict' };

    const snapshot = this.state.draft;
    writeRecovery(snapshot);

    let result: SaveResult;
    try {
      result = await publishAction(snapshot, this.state.etag);
    } catch {
      if (await sessionHasExpired()) {
        this.sessionExpired();
        return { status: 'failed', message: 'Your session has ended.' };
      }
      return { status: 'failed', message: 'Couldn’t reach the server. Check your connection and try again.' };
    }

    if (result.status === 'conflict') {
      this.set({ conflict: true, save: { status: 'error', message: 'This was changed in another tab.' } });
      return { status: 'conflict' };
    }
    if (result.status === 'invalid') return { status: 'failed', message: result.message };
    if (result.status === 'unavailable') {
      return { status: 'failed', message: 'Connect a Vercel Blob store first. Nothing can go live until then.' };
    }

    const live = result.content ?? { ...snapshot, isSample: false };
    const unchanged = this.state.draft === snapshot;
    this.set({
      etag: result.etag,
      published: live,
      saved: live,
      draft: unchanged ? live : { ...this.state.draft, isSample: false },
      save: unchanged ? { status: 'saved' } : this.state.save,
      previewNonce: this.state.previewNonce + 1,
    });
    if (unchanged) clearRecovery();
    else this.scheduleSave();
    return { status: 'live' };
  }

  /* Recovery */

  private checkRecovery() {
    const recovery = readRecovery();
    if (!recovery) return;
    if (deepEqual(recovery.content, this.state.draft)) {
      clearRecovery();
      return;
    }
    this.set({ recovery });
  }

  restoreRecovery() {
    const recovery = this.state.recovery;
    if (!recovery) return;
    this.set({ recovery: null });
    try {
      this.replaceDraft(parseContent(recovery.content));
    } catch {
      clearRecovery();
      this.toast('That copy couldn’t be read, so it was discarded.', { tone: 'error' });
    }
  }

  discardRecovery() {
    clearRecovery();
    this.set({ recovery: null });
  }

  /* Toasts and confirmations */

  toast(message: string, options: Omit<Toast, 'id' | 'message'> = {}) {
    const id = ++this.toastId;
    this.set({ toasts: [...this.state.toasts.slice(-2), { id, message, ...options }] });
    const lifetime = options.undo || options.link ? TOAST_ACTION_MS : TOAST_MS;
    setTimeout(() => this.dismissToast(id), lifetime);
  }

  dismissToast(id: number) {
    if (this.state.toasts.some((toast) => toast.id === id)) {
      this.set({ toasts: this.state.toasts.filter((toast) => toast.id !== id) });
    }
  }

  confirm(options: Omit<ConfirmRequest, 'resolve'>) {
    return new Promise<boolean>((resolve) => {
      this.set({ confirm: { ...options, resolve } });
    });
  }

  resolveConfirm(confirmed: boolean) {
    this.state.confirm?.resolve(confirmed);
    this.set({ confirm: null });
  }

  /* Page lifecycle */

  attach() {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (this.isDirty() && !this.leaving) event.preventDefault();
    };
    const onPageHide = () => {
      if (this.isDirty()) writeRecovery(this.state.draft);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void this.saveNow();
      }
    };
    const onOnline = () => {
      if (this.state.save.status === 'error' && !this.state.conflict) void this.saveNow();
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('online', onOnline);
    this.checkRecovery();

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('online', onOnline);
    };
  }
}

/* React bindings ----------------------------------------------------------- */

const StoreContext = createContext<DraftStore | null>(null);

export function AdminProvider({
  initial,
  storage,
  children,
}: {
  initial: DraftDocument;
  storage: StorageMode;
  children: ReactNode;
}) {
  const [store] = useState(() => new DraftStore(initial, storage));
  useEffect(() => store.attach(), [store]);
  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useStore() {
  const store = use(StoreContext);
  if (!store) throw new Error('useStore must be used inside AdminProvider');
  return store;
}

/** Reads a part of the admin state. The selector has to return a stable value. */
export function useAdmin<T>(select: (state: AdminState) => T): T {
  const store = useStore();
  const read = () => select(store.getState());
  return useSyncExternalStore(store.subscribe, read, read);
}

export function useUnpublishedChanges() {
  const store = useStore();
  const read = () => store.hasUnpublishedChanges();
  return useSyncExternalStore(store.subscribe, read, read);
}

export function useRoot() {
  return useStore().root;
}

export function useValue<T>(cursor: Cursor<T>): T {
  const read = () => cursor.read();
  return useSyncExternalStore(cursor.store.subscribe, read, read);
}

/**
 * Binds an object's fields to form controls:
 *   const { field } = useFields(root.at('profile'));
 *   <TextRow label="Name" {...field('name')} />
 */
export function useFields<T extends object>(cursor: Cursor<T>) {
  const value = useValue(cursor) ?? ({} as T);
  const field = <K extends keyof T>(key: K) => ({
    value: value[key],
    onChange: (next: T[K]) => cursor.at(key).set(next),
  });
  return { value, field };
}
