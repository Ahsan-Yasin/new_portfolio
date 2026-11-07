import { ResumePage } from '@/components/site/resume-page';
import { pageMetadata } from '@/lib/content/metadata';
import { getPublishedContent } from '@/lib/content/store';

export async function generateMetadata() {
  const content = await getPublishedContent();
  return pageMetadata(content, { title: 'Resume', path: '/resume' });
}

export default async function Page() {
  return <ResumePage content={await getPublishedContent()} />;
}
