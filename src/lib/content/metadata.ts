import type { Metadata } from 'next';
import type { Content } from './schema';
import { resolveSiteUrl } from './select';

type PageMeta = {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
};

/** Sample content is never indexed, so a fresh deployment can't appear in search under a made-up name. */
export function pageMetadata(content: Content, page: PageMeta = {}): Metadata {
  const siteTitle = content.site.title || content.profile.name;
  const title = page.title ? `${page.title} · ${content.profile.name}` : siteTitle;
  const description = page.description || content.site.description;
  const base = resolveSiteUrl(content);
  const hidden = content.isSample || content.site.noindex;
  const image = page.image || content.site.ogImage.src || '/og';

  return {
    metadataBase: new URL(base),
    title,
    description,
    alternates: page.path ? { canonical: page.path } : undefined,
    robots: hidden ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      siteName: content.profile.name,
      type: 'website',
      url: page.path,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}
