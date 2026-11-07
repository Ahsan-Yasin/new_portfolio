'use client';

import { Check, Copy, Images, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { deleteMediaAction, listMediaAction, type MediaFile } from '@/app/admin/actions';
import { MEDIA_ACCEPT } from '@/lib/media';
import { MediaPreview, useUploader, UploadStatus } from '../media-field';
import { useRoot, useStore } from '../store';
import { Button, EmptyState, Group, IconButton } from '../ui';
import { formatBytes } from '../upload';

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export function MediaSection() {
  const store = useStore();
  const root = useRoot();
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<{ done: number; total: number } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress, error } = useUploader();
  const noStorage = store.storage === 'none';

  useEffect(() => {
    let active = true;
    listMediaAction()
      .then((list) => {
        if (active) setFiles(list);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const take = async (chosen: File[]) => {
    if (chosen.length === 0) return;
    setQueue({ done: 0, total: chosen.length });
    for (const [index, file] of chosen.entries()) {
      setQueue({ done: index, total: chosen.length });
      const uploaded = await upload(file);
      if (uploaded) {
        const entry: MediaFile = { src: uploaded.src, size: uploaded.size, uploadedAt: new Date().toISOString() };
        setFiles((previous) => [entry, ...(previous ?? [])]);
      } else if (chosen.length > 1) {
        store.toast(`${file.name} couldn’t be uploaded.`, { tone: 'error' });
      }
    }
    setQueue(null);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void take([...event.dataTransfer.files]);
  };

  const copy = async (src: string) => {
    try {
      await navigator.clipboard.writeText(new URL(src, window.location.origin).href);
      setCopied(src);
      setTimeout(() => setCopied((current) => (current === src ? null : current)), 1600);
    } catch {
      store.toast('Couldn’t copy the link.', { tone: 'error' });
    }
  };

  const remove = async (file: MediaFile) => {
    const inUse = JSON.stringify(root.read()).includes(`"${file.src}"`);
    const confirmed = await store.confirm({
      title: 'Delete this file?',
      message: inUse
        ? 'Your site is using this file right now. Deleting it will leave a gap on those pages, and it can’t be undone.'
        : 'Pages using it will break, including any older version you might restore. This can’t be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteMediaAction(file.src);
      setFiles((previous) => (previous ?? []).filter((entry) => entry.src !== file.src));
      store.toast('File deleted');
    } catch {
      store.toast('Couldn’t delete the file. Try again.', { tone: 'error' });
    }
  };

  const uploadButton = (
    <Button
      variant="tint"
      icon={Upload}
      disabled={queue !== null || noStorage}
      onClick={() => inputRef.current?.click()}
    >
      Upload
    </Button>
  );

  return (
    <div
      className="a-dropzone"
      data-dragging={dragging}
      onDragOver={(event) => {
        event.preventDefault();
        if (!noStorage) setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <Group
        title="Your uploads"
        action={files?.length ? uploadButton : undefined}
        footnote={noStorage ? 'Uploads start working once storage is connected. See Overview for the steps.' : 'Drop files anywhere on this page. Images are resized and compressed for you.'}
      >
        {failed ? (
          <EmptyState icon={Images} title="Couldn’t load your uploads" text="Check your connection and reload the page." />
        ) : !files ? (
          <div className="a-loading" role="status">
            <LoaderCircle size={20} className="a-spin" aria-hidden />
            <span>Loading</span>
          </div>
        ) : files.length === 0 ? (
          <EmptyState
            icon={Images}
            title="Nothing uploaded yet"
            text="Add images, video or PDFs here, then use them anywhere on the site."
            action={uploadButton}
          />
        ) : (
          <ul className="a-library">
            {files.map((file) => {
              const name = file.src.split('/').pop() ?? file.src;
              return (
                <li key={file.src} className="a-library-item">
                  <span className="a-library-frame">
                    <MediaPreview src={file.src} />
                  </span>
                  <span className="a-library-name" title={name}>
                    {name}
                  </span>
                  <span className="a-library-meta">
                    {formatBytes(file.size)}, {displayDate(file.uploadedAt)}
                  </span>
                  <span className="a-library-tools">
                    <IconButton
                      icon={copied === file.src ? Check : Copy}
                      label={copied === file.src ? 'Link copied' : `Copy link to ${name}`}
                      onClick={() => void copy(file.src)}
                    />
                    <IconButton icon={Trash2} label={`Delete ${name}`} onClick={() => void remove(file)} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Group>

      {queue ? (
        <p className="a-foot" role="status">
          File {queue.done + 1} of {queue.total}
        </p>
      ) : null}
      <UploadStatus progress={progress} error={error} />

      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept={MEDIA_ACCEPT}
        aria-label="Upload files"
        onChange={(event) => {
          void take([...(event.target.files ?? [])]);
          event.target.value = '';
        }}
      />
    </div>
  );
}
