import { notFound } from 'next/navigation';
import { PostPage } from '@/components/site/writing-pages';
import { pageMetadata } from '@/lib/content/metadata';
import { publishedPosts } from '@/lib/content/select';
import { getPublishedContent } from '@/lib/content/store';

type Props = { params: Promise<{ slug: string }> };

const onThisSite = (content: Awaited<ReturnType<typeof getPublishedContent>>) =>
  publishedPosts(content).filter((post) => !post.externalUrl.trim());

export async function generateStaticParams() {
  const posts = onThisSite(await getPublishedContent());
  // At least one entry is required when prerendering; an unknown slug resolves to the 404 page.
  return posts.length ? posts.map((post) => ({ slug: post.slug })) : [{ slug: 'none' }];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const content = await getPublishedContent();
  const post = onThisSite(content).find((item) => item.slug === slug);
  if (!post) return pageMetadata(content);
  return pageMetadata(content, {
    title: post.title,
    description: post.excerpt,
    path: `/writing/${post.slug}`,
    image: post.cover.kind === 'image' ? post.cover.src : undefined,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const content = await getPublishedContent();
  const post = onThisSite(content).find((item) => item.slug === slug);
  if (!post) notFound();
  return <PostPage post={post} />;
}
