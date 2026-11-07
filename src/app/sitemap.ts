import type { MetadataRoute } from 'next';
import { publishedPosts, publishedProjects, resolveSiteUrl } from '@/lib/content/select';
import { getPublishedContent } from '@/lib/content/store';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getPublishedContent();
  const base = resolveSiteUrl(content);
  const posts = publishedPosts(content);
  const paths = [
    '',
    '/about',
    '/resume',
    ...(posts.length ? ['/writing'] : []),
    ...publishedProjects(content).map((project) => `/work/${project.slug}`),
    ...posts.filter((post) => !post.externalUrl.trim()).map((post) => `/writing/${post.slug}`),
  ];
  return paths.map((path) => ({ url: `${base}${path}` }));
}
