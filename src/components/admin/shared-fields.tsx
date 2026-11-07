'use client';

import { safeHref, slugify, uid, type Content, type LinkItem, type Metric } from '@/lib/content/schema';
import { useFields, type Cursor } from './store';
import { MiniField, TextRow } from './ui';

/** A link field that says so when the site would refuse to render what's typed. */
export function LinkRow({
  label,
  value,
  onChange,
  placeholder = 'https://',
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const invalid = Boolean(value?.trim()) && !safeHref(value);
  return (
    <TextRow
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      hint={hint}
      spellCheck={false}
      error={invalid ? 'This link won’t work. Start it with https://, mailto:, or a / for a page on this site.' : undefined}
    />
  );
}

export const FORMAT_HINT = '**bold**, *italic* and [links](https://…) all work. Leave a blank line to start a new paragraph.';
export const TONE_HINT = 'Wrap words in *asterisks* to set them in grey.';

export const newMetric = (): Metric => ({ id: uid(), value: '', label: '' });
export const newLink = (): LinkItem => ({ id: uid(), label: '', url: '' });
export const newFact = (): { id: string; label: string; value: string } => ({ id: uid(), label: '', value: '' });

export function MetricFields({ cursor, isNew }: { cursor: Cursor<Metric>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <MiniField label="Number" placeholder="+41%" autoFocus={isNew} {...field('value')} />
      <MiniField label="What it measures" placeholder="Weekly active users" {...field('label')} />
    </>
  );
}

export function LinkFields({ cursor, isNew }: { cursor: Cursor<LinkItem>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <MiniField label="Label" placeholder="Read the launch post" autoFocus={isNew} {...field('label')} />
      <MiniField label="Link" type="url" placeholder="https://" {...field('url')} />
    </>
  );
}

export function FactFields({
  cursor,
  isNew,
}: {
  cursor: Cursor<{ id: string; label: string; value: string }>;
  isNew: boolean;
}) {
  const { field } = useFields(cursor);
  return (
    <>
      <MiniField label="Label" placeholder="Based in" autoFocus={isNew} {...field('label')} />
      <MiniField label="Value" placeholder="Lisbon, Portugal" {...field('value')} />
    </>
  );
}

/* Slugs -------------------------------------------------------------------- */

export function uniqueSlug(base: string, taken: readonly string[]) {
  if (!taken.includes(base)) return base;
  let attempt = 2;
  while (taken.includes(`${base}-${attempt}`)) attempt += 1;
  return `${base}-${attempt}`;
}

/** A slug keeps following the title until someone edits it by hand. */
export function slugFollowsTitle(slug: string, title: string, fallback: string) {
  if (!slug) return true;
  const base = slugify(title) || fallback;
  const stem = slug.replace(/-\d+$/, '');
  return slug === base || stem === base || stem === fallback;
}

export function SlugRow({
  label = 'Address',
  value,
  prefix,
  taken,
  onChange,
}: {
  label?: string;
  value: string;
  prefix: string;
  taken: readonly string[];
  onChange: (next: string) => void;
}) {
  const duplicate = Boolean(value) && taken.includes(value);
  const error = duplicate
    ? 'Another page already uses this address. Choose a different one.'
    : !value
      ? 'A page needs an address to appear on the site.'
      : undefined;
  return (
    <TextRow
      label={label}
      value={value}
      spellCheck={false}
      error={error}
      hint={`The page will be at ${prefix}${value}`}
      onChange={(next) => onChange(next.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
      onBlur={() => onChange(slugify(value))}
    />
  );
}

/* Checks before going live ------------------------------------------------- */

export function contentIssues(content: Content): string[] {
  const issues: string[] = [];
  const check = (kind: string, entries: { title: string; slug: string; published: boolean }[]) => {
    const seen = new Set<string>();
    for (const entry of entries) {
      if (!entry.published) continue;
      const name = entry.title || `Untitled ${kind}`;
      if (!entry.slug) issues.push(`“${name}” has no address, so it won’t appear on the site.`);
      else if (seen.has(entry.slug)) issues.push(`“${name}” shares its address with another ${kind}.`);
      seen.add(entry.slug);
    }
  };
  check('project', content.projects);
  check('post', content.posts);
  return issues;
}

const AREA_LABELS: Record<Exclude<keyof Content, 'isSample'>, string> = {
  site: 'SEO',
  profile: 'Profile',
  nav: 'Navigation',
  hero: 'Home hero',
  sections: 'Sections',
  gallery: 'Home gallery',
  projects: 'Projects',
  impact: 'Impact numbers',
  skills: 'Skills',
  experience: 'Experience',
  testimonials: 'Testimonials',
  posts: 'Writing',
  about: 'About page',
  contact: 'Contact',
  footer: 'Footer',
  theme: 'Design',
};

export const CONTENT_AREAS = Object.entries(AREA_LABELS) as [Exclude<keyof Content, 'isSample'>, string][];
