import { WritingIndexPage } from '@/components/site/writing-pages';
import { pageMetadata } from '@/lib/content/metadata';
import { getPublishedContent } from '@/lib/content/store';

export async function generateMetadata() {
  const content = await getPublishedContent();
  return pageMetadata(content, { title: 'Writing', path: '/writing' });
}

export default async function Page() {
  return <WritingIndexPage content={await getPublishedContent()} />;
}
