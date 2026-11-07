import { notFound } from 'next/navigation';
import { ProjectPage } from '@/components/site/project-page';
import { pageMetadata } from '@/lib/content/metadata';
import { publishedProjects } from '@/lib/content/select';
import { getPublishedContent } from '@/lib/content/store';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = publishedProjects(await getPublishedContent());
  // At least one entry is required when prerendering; an unknown slug resolves to the 404 page.
  return projects.length ? projects.map((project) => ({ slug: project.slug })) : [{ slug: 'none' }];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const content = await getPublishedContent();
  const project = publishedProjects(content).find((item) => item.slug === slug);
  if (!project) return pageMetadata(content);
  return pageMetadata(content, {
    title: project.title,
    description: project.summary,
    path: `/work/${project.slug}`,
    image: project.cover.kind === 'image' ? project.cover.src : undefined,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const content = await getPublishedContent();
  const project = publishedProjects(content).find((item) => item.slug === slug);
  if (!project) notFound();
  return <ProjectPage content={content} project={project} />;
}
