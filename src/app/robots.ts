import type { MetadataRoute } from 'next';
import { resolveSiteUrl } from '@/lib/content/select';
import { getPublishedContent } from '@/lib/content/store';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getPublishedContent();
  const hidden = content.isSample || content.site.noindex;
  return {
    rules: hidden ? { userAgent: '*', disallow: '/' } : { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: hidden ? undefined : `${resolveSiteUrl(content)}/sitemap.xml`,
  };
}
