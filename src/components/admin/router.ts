import {
  BriefcaseBusiness,
  Building2,
  Compass,
  Gauge,
  History,
  House,
  IdCard,
  Images,
  Mail,
  MessageSquareQuote,
  Palette,
  PenLine,
  Rows3,
  Search,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useSyncExternalStore } from 'react';
import type { Content } from '@/lib/content/schema';

export type SectionKey =
  | 'overview'
  | 'profile'
  | 'hero'
  | 'projects'
  | 'sections'
  | 'skills'
  | 'experience'
  | 'testimonials'
  | 'writing'
  | 'about'
  | 'contact'
  | 'navigation'
  | 'design'
  | 'seo'
  | 'media'
  | 'history';

export type SectionMeta = {
  key: SectionKey;
  label: string;
  icon: LucideIcon;
  /** The solid colour of the icon tile, as in System Settings. */
  color: string;
  /** Extra words the sidebar search should match. */
  keywords: string;
  group: 'start' | 'content' | 'site' | 'files';
};

export const SECTIONS: SectionMeta[] = [
  { key: 'overview', label: 'Overview', icon: Gauge, color: '#636366', keywords: 'status live draft start checklist', group: 'start' },
  { key: 'profile', label: 'Profile', icon: UserRound, color: '#0a84ff', keywords: 'name role email phone photo avatar resume cv pdf social links availability location', group: 'content' },
  { key: 'hero', label: 'Home hero', icon: House, color: '#30a46c', keywords: 'headline intro homepage facts buttons gallery ticker images', group: 'content' },
  { key: 'projects', label: 'Projects', icon: BriefcaseBusiness, color: '#f57c00', keywords: 'work case study portfolio cover blocks', group: 'content' },
  { key: 'sections', label: 'Sections', icon: Rows3, color: '#00a2c7', keywords: 'order reorder hide show home impact numbers titles', group: 'content' },
  { key: 'skills', label: 'Skills', icon: Wrench, color: '#6b7280', keywords: 'ai tools expertise groups', group: 'content' },
  { key: 'experience', label: 'Experience', icon: Building2, color: '#a2845e', keywords: 'jobs career companies roles work history', group: 'content' },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote, color: '#e0457b', keywords: 'quotes references reviews', group: 'content' },
  { key: 'writing', label: 'Writing', icon: PenLine, color: '#d9920a', keywords: 'blog posts articles', group: 'content' },
  { key: 'about', label: 'About page', icon: IdCard, color: '#0071e3', keywords: 'bio portrait principles awards education facts', group: 'content' },
  { key: 'contact', label: 'Contact and footer', icon: Mail, color: '#34a853', keywords: 'email call to action copyright', group: 'content' },
  { key: 'navigation', label: 'Navigation', icon: Compass, color: '#e5484d', keywords: 'menu links nav header', group: 'site' },
  { key: 'design', label: 'Design', icon: Palette, color: '#e0457b', keywords: 'theme colour color accent font corners motion dark light appearance', group: 'site' },
  { key: 'seo', label: 'SEO', icon: Search, color: '#636366', keywords: 'google search title description social image index', group: 'site' },
  { key: 'media', label: 'Media library', icon: Images, color: '#00a2c7', keywords: 'uploads files images videos photos', group: 'files' },
  { key: 'history', label: 'History and backup', icon: History, color: '#6b7280', keywords: 'versions restore export import json undo', group: 'files' },
];

export type Route = { section: SectionKey | null; detail: string | null };

export function parseHash(hash: string): Route {
  const [section, detail] = hash.replace(/^#\/?/, '').split('/');
  const known = SECTIONS.some((meta) => meta.key === section);
  return {
    section: known ? (section as SectionKey) : null,
    detail: known && detail ? decodeURIComponent(detail) : null,
  };
}

export function sectionHref(section: SectionKey, detail?: string) {
  return detail ? `#/${section}/${encodeURIComponent(detail)}` : `#/${section}`;
}

const ROUTE_EVENT = 'admin-route-change';

/**
 * Moves between sections through history.pushState rather than a plain anchor. Next's
 * router tracks the URL through pushState, and it writes its remembered URL back after a
 * revalidating action such as Publish, which would otherwise undo a hash it didn't see.
 */
export function goTo(href: string) {
  const { pathname, search } = window.location;
  window.history.pushState(null, '', href === '#' ? `${pathname}${search}` : href);
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

function subscribeToHash(listener: () => void) {
  window.addEventListener('hashchange', listener);
  window.addEventListener('popstate', listener);
  window.addEventListener(ROUTE_EVENT, listener);
  return () => {
    window.removeEventListener('hashchange', listener);
    window.removeEventListener('popstate', listener);
    window.removeEventListener(ROUTE_EVENT, listener);
  };
}

const readHash = () => window.location.hash;
const readNoHash = () => '';

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribeToHash, readHash, readNoHash);
  return useMemo(() => parseHash(hash), [hash]);
}

const PREVIEW_ROOT = '/admin/preview';

/** The preview page for what's being edited. Follows the saved draft, because that's what the preview renders. */
export function previewPathFor(route: Route, saved: Content): string {
  switch (route.section) {
    case 'projects': {
      const project = saved.projects.find((entry) => entry.id === route.detail);
      return project?.slug ? `${PREVIEW_ROOT}/work/${project.slug}` : `${PREVIEW_ROOT}#work`;
    }
    case 'writing': {
      const post = saved.posts.find((entry) => entry.id === route.detail);
      return post?.slug && !post.externalUrl ? `${PREVIEW_ROOT}/writing/${post.slug}` : `${PREVIEW_ROOT}/writing`;
    }
    case 'about':
      return `${PREVIEW_ROOT}/about`;
    case 'skills':
    case 'experience':
    case 'testimonials':
    case 'contact':
      return `${PREVIEW_ROOT}#${route.section}`;
    default:
      return PREVIEW_ROOT;
  }
}
