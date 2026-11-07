import { contentTypeForName } from '@/lib/media';
import { readFile, signedFileUrl } from '@/lib/storage';

const ONE_YEAR = 60 * 60 * 24 * 365;
const SIGNED_URL_LIFETIME = 60 * 60 * 1000;

/** Delivers uploads. Names are unique per upload, so each response can be cached indefinitely. */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const name = path.join('/');
  const contentType = contentTypeForName(name);
  if (!contentType || name.includes('..')) return new Response('Not found', { status: 404 });
  const key = `media/${name}`;

  if (!contentType.startsWith('image/')) {
    const signedUrl = await signedFileUrl(key, SIGNED_URL_LIFETIME);
    if (signedUrl) {
      return new Response(null, {
        status: 307,
        headers: {
          Location: signedUrl,
          // Expires well before the signed link does, so no cached redirect points at a dead URL.
          'Cache-Control': 'public, max-age=0, s-maxage=1800',
        },
      });
    }
  }

  const file = await readFile(key);
  if (!file) return new Response('Not found', { status: 404 });

  return new Response(file.stream, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': `public, max-age=${ONE_YEAR}, immutable`,
      'X-Content-Type-Options': 'nosniff',
      ...(file.size ? { 'Content-Length': String(file.size) } : {}),
    },
  });
}
