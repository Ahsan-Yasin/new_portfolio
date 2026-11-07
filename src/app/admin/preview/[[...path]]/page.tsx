import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AboutPage } from '@/components/site/about-page';
import { HomePage } from '@/components/site/home-page';
import { ProjectPage } from '@/components/site/project-page';
import { ResumePage } from '@/components/site/resume-page';
import { SiteShell } from '@/components/site/site-shell';
import { PostPage, WritingIndexPage } from '@/components/site/writing-pages';
import { requireAdmin } from '@/lib/auth/session';
import type { Content } from '@/lib/content/schema';
import { getDraftDocument } from '@/lib/content/store';

type Props = { params: Promise<{ path?: string[] }> };

export const metadata = { title: 'Preview', robots: { index: false, follow: false } };

function route(content: Content, path: string[]) {
  const [first, slug] = path;
  if (!first) return <HomePage content={content} />;
  if (first === 'about' && !slug) return <AboutPage content={content} />;
  if (first === 'resume' && !slug) return <ResumePage content={content} />;
  if (first === 'writing' && !slug) return <WritingIndexPage content={content} />;
  if (first === 'writing') {
    const post = content.posts.find((item) => item.slug === slug);
    return post ? <PostPage post={post} /> : null;
  }
  if (first === 'work') {
    const project = content.projects.find((item) => item.slug === slug);
    return project ? <ProjectPage content={content} project={project} /> : null;
  }
  return null;
}

/** Shows the saved draft exactly as the site would render it, including unpublished items. */
async function Preview({ params }: Props) {
  await requireAdmin();
  const { path = [] } = await params;
  const { draft } = await getDraftDocument();
  const page = route(draft, path);
  if (!page) notFound();
  return (
    <SiteShell content={draft} preview>
      {page}
    </SiteShell>
  );
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={null}>
      <Preview {...props} />
    </Suspense>
  );
}
