'use client';

/* eslint-disable @next/next/no-img-element */

import { FileText, Images, LoaderCircle, Trash2, Upload, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { listMediaAction, type MediaFile } from '@/app/admin/actions';
import type { Media } from '@/lib/content/schema';
import { MEDIA_TYPES } from '@/lib/media';
import { Sheet } from './sheet';
import { SortableList } from './sortable';
import { useFields, useStore, useValue, type Cursor } from './store';
import { Button, ColorWell, EmptyState, IconButton, TextRow, Thumb } from './ui';
import {
  kindFromSrc,
  probeMedia,
  SessionExpiredError,
  uploadFile,
  type UploadedFile,
  type UploadProgress,
} from './upload';

const VISUAL_ACCEPT = Object.keys(MEDIA_TYPES)
  .filter((type) => type !== 'application/pdf')
  .join(',');

export function toMedia(file: Pick<UploadedFile, 'src' | 'kind' | 'width' | 'height' | 'blur'>, alt = ''): Media {
  return {
    src: file.src,
    alt,
    kind: file.kind === 'video' ? 'video' : 'image',
    ...(file.width ? { width: file.width } : {}),
    ...(file.height ? { height: file.height } : {}),
    ...(file.blur ? { blur: file.blur } : {}),
  };
}

/* Upload state ------------------------------------------------------------- */

export function useUploader() {
  const store = useStore();
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<UploadedFile | null> => {
    setError(null);
    setProgress({ phase: 'preparing', fraction: 0 });
    try {
      return await uploadFile(file, store.storage, setProgress);
    } catch (problem) {
      if (problem instanceof SessionExpiredError) store.sessionExpired();
      else setError(problem instanceof Error ? problem.message : 'The upload didn’t finish. Try again.');
      return null;
    } finally {
      setProgress(null);
    }
  };

  return { upload, progress, error, setError };
}

export function UploadStatus({ progress, error }: { progress: UploadProgress | null; error: string | null }) {
  if (error) {
    return (
      <p className="a-upload-error" role="alert">
        {error}
      </p>
    );
  }
  if (!progress) return null;
  const preparing = progress.phase === 'preparing';
  return (
    <div className="a-upload-progress" role="status">
      <span>{preparing ? 'Preparing…' : `Uploading ${Math.round(progress.fraction * 100)}%`}</span>
      <progress max={1} value={preparing ? undefined : progress.fraction} aria-label="Upload progress" />
    </div>
  );
}

/* Library picker ----------------------------------------------------------- */

export function LibrarySheet({
  open,
  onClose,
  onPick,
  only,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (file: MediaFile) => void;
  only: 'visual' | 'pdf';
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      wide
      title="Choose from library"
      footer={<Button onClick={onClose}>Cancel</Button>}
    >
      <LibraryGrid onPick={onPick} only={only} />
    </Sheet>
  );
}

function LibraryGrid({ onPick, only }: { onPick: (file: MediaFile) => void; only: 'visual' | 'pdf' }) {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [failed, setFailed] = useState(false);

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

  if (failed) {
    return <EmptyState icon={Images} title="Couldn’t load the library" text="Check your connection and try again." />;
  }
  if (!files) {
    return (
      <div className="a-loading" role="status">
        <LoaderCircle size={20} className="a-spin" aria-hidden />
        <span>Loading</span>
      </div>
    );
  }

  const shown = files.filter((file) => (only === 'pdf') === (kindFromSrc(file.src) === 'file'));
  if (shown.length === 0) {
    return (
      <EmptyState
        icon={Images}
        title={only === 'pdf' ? 'No PDFs yet' : 'Nothing uploaded yet'}
        text="Files you upload anywhere in this panel appear here, ready to reuse."
      />
    );
  }

  return (
    <div className="a-library-grid">
      {shown.map((file) => (
        <button key={file.src} type="button" className="a-library-pick" onClick={() => onPick(file)}>
          <MediaPreview src={file.src} />
          <span className="a-sr">{file.src.split('/').pop()}</span>
        </button>
      ))}
    </div>
  );
}

export function MediaPreview({ src }: { src: string }) {
  const kind = kindFromSrc(src);
  if (kind === 'video') return <video src={src} muted playsInline preload="metadata" />;
  if (kind === 'file') {
    return (
      <span className="a-library-file">
        <FileText size={28} strokeWidth={1.6} aria-hidden />
      </span>
    );
  }
  return <img src={src} alt="" loading="lazy" />;
}

/* Media field -------------------------------------------------------------- */

/** Picks one image or video for a field: upload, reuse from the library, remove, and alt text. */
export function MediaField({ label, cursor, hint }: { label: string; cursor: Cursor<Media>; hint?: ReactNode }) {
  const store = useStore();
  const { value, field } = useFields(cursor);
  const { upload, progress, error, setError } = useUploader();
  const inputRef = useRef<HTMLInputElement>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const place = (file: Pick<UploadedFile, 'src' | 'kind' | 'width' | 'height' | 'blur'>) => {
    cursor.update((previous) => toMedia(file, previous?.alt ?? ''));
  };

  const take = async (file: File | undefined) => {
    if (!file) return;
    if (file.type === 'application/pdf') {
      setError('That’s a PDF. This spot needs an image or a video.');
      return;
    }
    const uploaded = await upload(file);
    if (uploaded) place(uploaded);
  };

  const remove = () => {
    const previous = cursor.read();
    cursor.update((current) => ({ src: '', alt: current?.alt ?? '', kind: 'image' }));
    store.toast(`${label} removed`, { undo: () => cursor.set(previous) });
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void take(event.dataTransfer.files[0]);
  };

  return (
    <>
      <div
        className="a-media"
        data-dragging={dragging}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <Thumb media={value} size={72} />
        <div className="a-media-main">
          <span className="a-media-label">{label}</span>
          {hint ? <span className="a-media-hint">{hint}</span> : null}
          <div className="a-media-actions">
            <Button icon={Upload} disabled={progress !== null} onClick={() => inputRef.current?.click()}>
              Upload
            </Button>
            <Button icon={Images} onClick={() => setLibraryOpen(true)}>
              Choose from library
            </Button>
            {value.src ? (
              <Button variant="plain" className="is-danger-text" onClick={remove}>
                Remove
              </Button>
            ) : null}
          </div>
          <UploadStatus progress={progress} error={error} />
        </div>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={VISUAL_ACCEPT}
          aria-label={`Upload ${label.toLowerCase()}`}
          onChange={(event) => {
            void take(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
      {value.src ? (
        <TextRow
          label="Alt text"
          {...field('alt')}
          placeholder="Describe what it shows"
          hint="Read aloud to people who can’t see it, and used by search engines."
        />
      ) : null}
      <LibrarySheet
        open={libraryOpen}
        only="visual"
        onClose={() => setLibraryOpen(false)}
        onPick={(file) => {
          setLibraryOpen(false);
          void probeMedia(file.src).then((measured) => place({ src: file.src, ...measured }));
        }}
      />
    </>
  );
}

/* PDF field ---------------------------------------------------------------- */

/** A document with no thumbnail, such as the resume PDF. */
export function FileField({ label, cursor, hint }: { label: string; cursor: Cursor<string>; hint?: ReactNode }) {
  const store = useStore();
  const value = useValue(cursor);
  const { upload, progress, error, setError } = useUploader();
  const inputRef = useRef<HTMLInputElement>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const take = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('This spot needs a PDF.');
      return;
    }
    const uploaded = await upload(file);
    if (uploaded) cursor.set(uploaded.src);
  };

  return (
    <div className="a-media">
      <span className="a-thumb is-empty" style={{ width: 44, height: 44 }}>
        <FileText size={20} strokeWidth={1.6} aria-hidden />
      </span>
      <div className="a-media-main">
        <span className="a-media-label">{label}</span>
        {value ? (
          <a className="a-media-file" href={value} target="_blank" rel="noreferrer">
            {value.split('/').pop()}
          </a>
        ) : hint ? (
          <span className="a-media-hint">{hint}</span>
        ) : null}
        <div className="a-media-actions">
          <Button icon={Upload} disabled={progress !== null} onClick={() => inputRef.current?.click()}>
            Upload PDF
          </Button>
          <Button icon={Images} onClick={() => setLibraryOpen(true)}>
            Choose from library
          </Button>
          {value ? (
            <Button
              variant="plain"
              className="is-danger-text"
              onClick={() => {
                const previous = value;
                cursor.set('');
                store.toast(`${label} removed`, { undo: () => cursor.set(previous) });
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <UploadStatus progress={progress} error={error} />
      </div>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept="application/pdf"
        aria-label={`Upload ${label.toLowerCase()}`}
        onChange={(event) => {
          void take(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <LibrarySheet
        open={libraryOpen}
        only="pdf"
        onClose={() => setLibraryOpen(false)}
        onPick={(file) => {
          setLibraryOpen(false);
          cursor.set(file.src);
        }}
      />
    </div>
  );
}

/* Lists of images ---------------------------------------------------------- */

function stableKeys(items: readonly (Media & { id?: string })[]) {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const base = item.id ?? (item.src || 'empty');
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}#${count}` : base;
  });
}

/** An ordered list of images: the home gallery and gallery blocks. */
export function MediaListEditor<T extends Media & { color?: string; id?: string }>({
  cursor,
  make,
  label,
  withColor,
  emptyIcon = Images,
}: {
  cursor: Cursor<T[]>;
  make: (media: Media) => T;
  label: string;
  withColor?: boolean;
  emptyIcon?: LucideIcon;
}) {
  const store = useStore();
  const items = useValue(cursor) ?? [];
  const keys = stableKeys(items);
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress, error, setError } = useUploader();
  const [queue, setQueue] = useState<{ done: number; total: number } | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const append = (media: Media) => cursor.update((previous) => [...(previous ?? []), make(media)]);

  const take = async (files: File[]) => {
    const visual = files.filter((file) => file.type !== 'application/pdf');
    if (visual.length === 0) {
      if (files.length) setError('This list holds images and videos, not PDFs.');
      return;
    }
    setQueue({ done: 0, total: visual.length });
    for (const [index, file] of visual.entries()) {
      setQueue({ done: index, total: visual.length });
      const uploaded = await upload(file);
      if (uploaded) append(toMedia(uploaded));
      else if (visual.length > 1) store.toast(`${file.name} couldn’t be uploaded.`, { tone: 'error' });
    }
    setQueue(null);
  };

  const patch = (index: number, change: Partial<T>) =>
    cursor.update((previous) => previous.map((item, position) => (position === index ? { ...item, ...change } : item)));

  const remove = (index: number) => {
    const previous = cursor.read();
    cursor.set(previous.filter((_, position) => position !== index));
    store.toast('Image removed', { undo: () => cursor.set(previous) });
  };

  const buttons = (
    <>
      <Button icon={Upload} disabled={queue !== null} onClick={() => inputRef.current?.click()}>
        Upload
      </Button>
      <Button icon={Images} onClick={() => setLibraryOpen(true)}>
        Choose from library
      </Button>
    </>
  );

  return (
    <div
      className="a-list"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void take([...event.dataTransfer.files]);
      }}
    >
      {items.length ? (
        <SortableList
          items={items}
          label={label}
          getKey={(_, index) => keys[index]}
          onReorder={(next) => cursor.set(next)}
          renderItem={(item, tools) => (
            <div className="a-inline-item">
              {tools.handle}
              <Thumb media={item} color={item.color} size={44} />
              <div className="a-inline-fields">
                <MediaAltField value={item.alt} onChange={(alt) => patch(tools.index, { alt } as Partial<T>)} />
                {withColor ? (
                  <ColorWell
                    label="Background"
                    allowEmpty
                    value={item.color ?? ''}
                    onChange={(color) => patch(tools.index, { color } as Partial<T>)}
                  />
                ) : null}
              </div>
              <div className="a-inline-actions">
                {tools.moves}
                <IconButton icon={Trash2} label="Remove image" onClick={() => remove(tools.index)} />
              </div>
            </div>
          )}
        />
      ) : (
        <div className="a-rows">
          <EmptyState
            icon={emptyIcon}
            title="No images yet"
            text="Upload a few, or drop them here. You can reorder them afterwards."
            action={<div className="a-media-actions is-centered">{buttons}</div>}
          />
        </div>
      )}
      {items.length ? <div className="a-media-actions a-list-buttons">{buttons}</div> : null}
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
        accept={VISUAL_ACCEPT}
        aria-label={`Upload to ${label.toLowerCase()}`}
        onChange={(event) => {
          void take([...(event.target.files ?? [])]);
          event.target.value = '';
        }}
      />
      <LibrarySheet
        open={libraryOpen}
        only="visual"
        onClose={() => setLibraryOpen(false)}
        onPick={(file) => {
          setLibraryOpen(false);
          void probeMedia(file.src).then((measured) => append(toMedia({ src: file.src, ...measured })));
        }}
      />
    </div>
  );
}

function MediaAltField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <label className="a-mini">
      <span>Alt text</span>
      <input
        className="a-input is-left"
        value={value ?? ''}
        placeholder="Describe what it shows"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
