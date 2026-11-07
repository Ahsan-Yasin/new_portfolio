import type { Content, Post, Project, Section, SectionId } from './schema';

export function publishedProjects(content: Content): Project[] {
  return content.projects.filter((project) => project.published && project.slug);
}

export function publishedPosts(content: Content): Post[] {
  return content.posts
    .filter((post) => post.published && post.slug)
    .toSorted((a, b) => b.date.localeCompare(a.date));
}

export function visibleSections(content: Content): Section[] {
  return content.sections.filter((section) => section.visible);
}

export function sectionById(content: Content, id: SectionId) {
  return content.sections.find((section) => section.id === id);
}

export function nextProject(content: Content, slug: string): Project | null {
  const projects = publishedProjects(content);
  if (projects.length < 2) return null;
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatPostDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/**
 * Picks black or white text for a background colour. White is favoured on saturated
 * mid-tones, where it reads better at display sizes even when black measures a little higher.
 */
export function readableOn(hex: string) {
  const value = hex.replace('#', '');
  const channel = (start: number) => {
    const c = parseInt(value.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return luminance > 0.42 ? '#111111' : '#ffffff';
}

export function resolveSiteUrl(content: Content) {
  const configured = content.site.url.trim().replace(/\/$/, '');
  if (/^https?:\/\//.test(configured)) return configured;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : 'http://localhost:3000';
}
