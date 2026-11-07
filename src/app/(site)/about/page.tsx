import { AboutPage } from '@/components/site/about-page';
import { pageMetadata } from '@/lib/content/metadata';
import { getPublishedContent } from '@/lib/content/store';

export async function generateMetadata() {
  const content = await getPublishedContent();
  return pageMetadata(content, { title: 'About', description: content.about.intro, path: '/about' });
}

export default async function Page() {
  return <AboutPage content={await getPublishedContent()} />;
}
