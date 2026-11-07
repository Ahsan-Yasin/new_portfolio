'use client';

import { Download, History, LoaderCircle, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { listVersionsAction, readVersionAction } from '@/app/admin/actions';
import { contentSchema, type Content } from '@/lib/content/schema';
import type { VersionSummary } from '@/lib/content/store';
import { useStore } from '../store';
import { Button, EmptyState, Group } from '../ui';
import { formatBytes } from '../upload';

function displayTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function HistorySection() {
  const store = useStore();
  const [versions, setVersions] = useState<VersionSummary[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    listVersionsAction()
      .then((list) => {
        if (active) setVersions(list);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  /** Loads a whole document into the draft. It only reaches visitors after Publish. */
  const loadIntoDraft = (content: Content, message: string) => {
    const previous = store.getState().draft;
    store.replaceDraft(content);
    store.toast(message, { undo: () => store.replaceDraft(previous) });
  };

  const restore = async (version: VersionSummary) => {
    const confirmed = await store.confirm({
      title: 'Load this version into your draft?',
      message: `This replaces your draft with what was published on ${displayTime(version.publishedAt)}. Nothing goes live until you press Publish.`,
      confirmLabel: 'Load version',
    });
    if (!confirmed) return;
    setLoadingId(version.id);
    try {
      const content = await readVersionAction(version.id);
      if (content) loadIntoDraft(content, 'Version loaded. Review it, then publish when you’re ready.');
      else store.toast('That version couldn’t be found.', { tone: 'error' });
    } catch {
      store.toast('Couldn’t load that version. Try again.', { tone: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(store.getState().draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File | undefined) => {
    if (!file) return;
    setImportError(null);
    let data: unknown;
    try {
      data = JSON.parse(await file.text());
    } catch {
      setImportError(`${file.name} isn’t a backup file. Choose a .json file you exported from here.`);
      return;
    }
    const parsed = contentSchema.safeParse(data);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const where = issue?.path.length ? ` The problem is at “${issue.path.join(' / ')}”.` : '';
      setImportError(`${file.name} doesn’t match this site’s content, so nothing was changed.${where}`);
      return;
    }
    const confirmed = await store.confirm({
      title: 'Load this backup into your draft?',
      message: 'This replaces your draft with the backup. Nothing goes live until you press Publish.',
      confirmLabel: 'Load backup',
    });
    if (confirmed) loadIntoDraft(parsed.data, 'Backup loaded. Review it, then publish when you’re ready.');
  };

  return (
    <>
      <Group
        title="Published versions"
        footnote="Your last 30 publishes. Restoring loads a version into your draft for review, and nothing goes live until you press Publish."
      >
        {failed ? (
          <EmptyState icon={History} title="Couldn’t load your history" text="Check your connection and reload the page." />
        ) : !versions ? (
          <div className="a-loading" role="status">
            <LoaderCircle size={20} className="a-spin" aria-hidden />
            <span>Loading</span>
          </div>
        ) : versions.length === 0 ? (
          <EmptyState
            icon={History}
            title="No versions yet"
            text="Each time you publish, a copy is kept here so you can always go back."
          />
        ) : (
          versions.map((version, index) => (
            <div key={version.id} className="a-row">
              <span className="a-row-label a-version">
                <span>{displayTime(version.publishedAt)}</span>
                <small>
                  {index === 0 ? 'Latest, ' : ''}
                  {formatBytes(version.size)}
                </small>
              </span>
              <div className="a-row-control">
                <Button disabled={loadingId !== null} onClick={() => void restore(version)}>
                  {loadingId === version.id ? 'Loading…' : 'Restore'}
                </Button>
              </div>
            </div>
          ))
        )}
      </Group>

      <Group title="Backup" footnote="A backup holds all your text and settings. Uploaded files stay in your media library.">
        <div className="a-row">
          <span className="a-row-label">Download your content as a file</span>
          <div className="a-row-control">
            <Button icon={Download} onClick={exportBackup}>
              Export
            </Button>
          </div>
        </div>
        <div className="a-row">
          <span className="a-row-label">Load a backup into your draft</span>
          <div className="a-row-control">
            <Button icon={Upload} onClick={() => inputRef.current?.click()}>
              Import
            </Button>
          </div>
          {importError ? (
            <p className="a-row-error" role="alert">
              {importError}
            </p>
          ) : null}
        </div>
      </Group>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept="application/json,.json"
        aria-label="Import a backup file"
        onChange={(event) => {
          void importBackup(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </>
  );
}
