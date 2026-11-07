/** File types the admin accepts. SVG is left out on purpose: served from this origin it could run scripts. */
export const MEDIA_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'application/pdf': 'pdf',
};

export const MEDIA_ACCEPT = Object.keys(MEDIA_TYPES).join(',');

const TYPE_BY_EXTENSION: Record<string, string> = Object.fromEntries(
  Object.entries(MEDIA_TYPES).map(([type, extension]) => [extension, type]),
);

export function contentTypeForName(name: string) {
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  return TYPE_BY_EXTENSION[extension] ?? null;
}

/** Above this, an upload goes straight to storage because Vercel limits function request bodies to 4.5 MB. */
export const SERVER_UPLOAD_LIMIT = 4 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export function mediaKeyFromSrc(src: string) {
  return src.startsWith('/media/') ? `media/${src.slice('/media/'.length)}` : null;
}

export function srcFromMediaKey(key: string) {
  return `/${key}`;
}
