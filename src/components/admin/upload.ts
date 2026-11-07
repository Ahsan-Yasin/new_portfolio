import { contentTypeForName, MAX_UPLOAD_BYTES, MEDIA_TYPES, SERVER_UPLOAD_LIMIT } from '@/lib/media';
import type { StorageMode } from '@/lib/storage';

const MAX_LONG_SIDE = 2400;
const WEBP_QUALITY = 0.86;
const BLUR_WIDTH = 16;
const BLUR_MAX_LENGTH = 4000;

export class SessionExpiredError extends Error {
  constructor() {
    super('Your session has ended.');
    this.name = 'SessionExpiredError';
  }
}

export type UploadProgress = { phase: 'preparing' | 'uploading'; fraction: number };

export type UploadedFile = {
  src: string;
  size: number;
  kind: 'image' | 'video' | 'file';
  width?: number;
  height?: number;
  blur?: string;
};

export function kindFromSrc(src: string): UploadedFile['kind'] {
  const type = contentTypeForName(src) ?? '';
  if (type.startsWith('video/')) return 'video';
  return type === 'application/pdf' ? 'file' : 'image';
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This image couldn’t be opened.'));
    image.src = src;
  });
}

function drawCanvas(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser can’t prepare images for upload.');
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

/** A tiny preview shown while the real image loads. */
function makeBlur(source: CanvasImageSource, width: number, height: number) {
  try {
    const blurHeight = Math.min(32, Math.max(1, Math.round((BLUR_WIDTH * height) / width)));
    const url = drawCanvas(source, BLUR_WIDTH, blurHeight).toDataURL('image/webp', 0.5);
    return url.length <= BLUR_MAX_LENGTH ? url : undefined;
  } catch {
    return undefined;
  }
}

function renameTo(name: string, extension: string) {
  return `${name.replace(/\.[^.]+$/, '') || 'image'}.${extension}`;
}

/** Downscales, re-encodes to WebP, and measures an image in the browser before it's uploaded. */
async function prepareImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) throw new Error('This image couldn’t be opened.');
    const blur = makeBlur(image, width, height);

    if (file.type === 'image/gif') return { file, width, height, blur };

    const scale = Math.min(1, MAX_LONG_SIDE / Math.max(width, height));
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);
    const canvas = drawCanvas(image, targetWidth, targetHeight);
    const webp = await toBlob(canvas, 'image/webp', WEBP_QUALITY);

    // Browsers that can't encode WebP hand back a PNG instead. Keep the original then, unless it must shrink.
    if (!webp || webp.type !== 'image/webp') {
      if (scale === 1) return { file, width, height, blur };
      const jpeg = await toBlob(canvas, 'image/jpeg', WEBP_QUALITY);
      if (!jpeg) return { file, width, height, blur };
      return {
        file: new File([jpeg], renameTo(file.name, 'jpg'), { type: 'image/jpeg' }),
        width: targetWidth,
        height: targetHeight,
        blur,
      };
    }

    // Re-encoding a small WebP can only make it bigger.
    if (scale === 1 && file.type === 'image/webp' && webp.size >= file.size) return { file, width, height, blur };

    return {
      file: new File([webp], renameTo(file.name, 'webp'), { type: 'image/webp' }),
      width: targetWidth,
      height: targetHeight,
      blur,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function measureVideo(src: string) {
  return new Promise<{ width?: number; height?: number }>((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.onloadedmetadata = () => resolve({ width: video.videoWidth || undefined, height: video.videoHeight || undefined });
    video.onerror = () => resolve({});
    video.src = src;
  });
}

/** Measures a file that's already uploaded, for when it's picked from the library. */
export async function probeMedia(src: string): Promise<Pick<UploadedFile, 'kind' | 'width' | 'height' | 'blur'>> {
  const kind = kindFromSrc(src);
  if (kind === 'video') return { kind, ...(await measureVideo(src)) };
  if (kind === 'file') return { kind };
  try {
    const image = await loadImage(src);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    return { kind, width, height, blur: makeBlur(image, width, height) };
  } catch {
    return { kind };
  }
}

function postToServer(file: File, onProgress: (fraction: number) => void) {
  return new Promise<{ src: string; size: number }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);
    request.open('POST', '/api/admin/upload');
    request.responseType = 'json';
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onerror = () => reject(new Error('The upload stopped. Check your connection and try again.'));
    request.onload = () => {
      const body = request.response as { src?: string; size?: number; error?: string } | null;
      if (request.status === 401) reject(new SessionExpiredError());
      else if (request.status >= 200 && request.status < 300 && body?.src) {
        resolve({ src: body.src, size: body.size ?? file.size });
      } else reject(new Error(body?.error ?? 'The upload didn’t finish. Try again.'));
    };
    request.send(form);
  });
}

async function sendToBlob(file: File, onProgress: (fraction: number) => void) {
  const { uploadPresigned } = await import('@vercel/blob/client');
  const stem = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const pathname = `media/${crypto.randomUUID().slice(0, 12)}-${stem || 'file'}.${MEDIA_TYPES[file.type]}`;
  try {
    const result = await uploadPresigned(pathname, file, {
      access: 'private',
      handleUploadUrl: '/api/admin/upload/presign',
      contentType: file.type,
      onUploadProgress: ({ percentage }) => onProgress(percentage / 100),
    });
    return { src: `/${result.pathname}`, size: file.size };
  } catch {
    // The SDK hides the server's reason, so ask directly: this route answers 401 when signed out.
    const check = await fetch('/api/admin/upload', { method: 'POST', body: new FormData() }).catch(() => null);
    if (check?.status === 401) throw new SessionExpiredError();
    throw new Error('The upload didn’t finish. Check your connection and try again.');
  }
}

function explainType(file: File) {
  if (/heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
    return 'iPhone HEIC photos aren’t supported yet. Export it as JPEG first.';
  }
  if (/svg/i.test(file.type)) return 'SVG files aren’t supported, because they can run code. Use PNG or WebP.';
  return `${file.name} isn’t a supported file type. Use JPEG, PNG, WebP, AVIF, GIF, MP4, WebM or PDF.`;
}

/** Takes a chosen file all the way to storage. Throws an Error with a message that's safe to show. */
export async function uploadFile(
  input: File,
  storage: StorageMode,
  onProgress: (progress: UploadProgress) => void,
): Promise<UploadedFile> {
  if (storage === 'none') throw new Error('Connect a Vercel Blob store first. See Overview for the steps.');
  if (!MEDIA_TYPES[input.type]) throw new Error(explainType(input));

  let file = input;
  let measured: Pick<UploadedFile, 'width' | 'height' | 'blur'> = {};
  const isImage = input.type.startsWith('image/');
  const isVideo = input.type.startsWith('video/');

  if (isImage) {
    onProgress({ phase: 'preparing', fraction: 0 });
    const prepared = await prepareImage(input);
    file = prepared.file;
    measured = { width: prepared.width, height: prepared.height, blur: prepared.blur };
  } else if (isVideo) {
    const url = URL.createObjectURL(input);
    measured = await measureVideo(url);
    URL.revokeObjectURL(url);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`);
  }

  const report = (fraction: number) => onProgress({ phase: 'uploading', fraction });
  report(0);
  const stored =
    storage === 'blob' && file.size > SERVER_UPLOAD_LIMIT ? await sendToBlob(file, report) : await postToServer(file, report);

  return {
    src: stored.src,
    size: stored.size,
    kind: isImage ? 'image' : isVideo ? 'video' : 'file',
    ...measured,
  };
}
