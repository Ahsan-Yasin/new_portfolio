import { SiteShell } from '@/components/site/site-shell';
import { pageMetadata } from '@/lib/content/metadata';
import { getPublishedContent } from '@/lib/content/store';

export async function generateMetadata() {
  return pageMetadata(await getPublishedContent());
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getPublishedContent();
  return <SiteShell content={content}>{children}</SiteShell>;
}
