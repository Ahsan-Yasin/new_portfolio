import { z } from 'zod';

/**
 * The whole site is one document. Every field has a default, so a document saved
 * by an older version of the site still parses after new fields are added.
 */

const text = (fallback = '') => z.string().max(20000).default(fallback);
const flag = (fallback: boolean) => z.boolean().default(fallback);
const list = <T extends z.ZodType>(item: T) => z.array(item).max(500).default([]);
const hexColor = (fallback: string) =>
  z.string().regex(/^#[0-9a-fA-F]{6}$/).catch(fallback).default(fallback);

export const mediaSchema = z.object({
  src: text(),
  alt: text(),
  kind: z.enum(['image', 'video']).default('image'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  blur: z.string().max(4000).optional(),
});
export type Media = z.infer<typeof mediaSchema>;
const media = () => mediaSchema.default({ src: '', alt: '', kind: 'image' });

export const linkSchema = z.object({
  id: z.string(),
  label: text(),
  url: text(),
});
export type LinkItem = z.infer<typeof linkSchema>;

export const socialIcons = [
  'linkedin',
  'github',
  'x',
  'dribbble',
  'behance',
  'instagram',
  'youtube',
  'medium',
  'mail',
  'globe',
] as const;
export type SocialIcon = (typeof socialIcons)[number];

export const socialSchema = z.object({
  id: z.string(),
  label: text(),
  url: text(),
  icon: z.enum(socialIcons).catch('globe').default('globe'),
});
export type Social = z.infer<typeof socialSchema>;

export const metricSchema = z.object({
  id: z.string(),
  value: text(),
  label: text(),
});
export type Metric = z.infer<typeof metricSchema>;

const blockBase = { id: z.string() };

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ ...blockBase, type: z.literal('heading'), text: text() }),
  z.object({ ...blockBase, type: z.literal('text'), text: text() }),
  z.object({
    ...blockBase,
    type: z.literal('media'),
    media: media(),
    caption: text(),
    size: z.enum(['inset', 'wide', 'full']).default('wide'),
    color: z.string().default(''),
  }),
  z.object({
    ...blockBase,
    type: z.literal('gallery'),
    items: list(mediaSchema),
    caption: text(),
  }),
  z.object({ ...blockBase, type: z.literal('quote'), text: text(), cite: text() }),
  z.object({ ...blockBase, type: z.literal('metrics'), items: list(metricSchema) }),
  z.object({ ...blockBase, type: z.literal('list'), title: text(), items: list(z.string().max(2000)) }),
]);
export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block['type'];

export const projectSchema = z.object({
  id: z.string(),
  slug: z.string().default(''),
  title: text('Untitled project'),
  summary: text(),
  published: flag(true),
  cover: media(),
  coverFit: z.enum(['contain', 'cover']).default('contain'),
  color: hexColor('#1d1d1f'),
  year: text(),
  client: text(),
  role: text(),
  duration: text(),
  team: text(),
  tags: list(z.string().max(80)),
  metrics: list(metricSchema),
  links: list(linkSchema),
  blocks: list(blockSchema),
});
export type Project = z.infer<typeof projectSchema>;

export const skillGroupSchema = z.object({
  id: z.string(),
  title: text(),
  description: text(),
  items: list(z.string().max(120)),
  featured: flag(false),
});
export type SkillGroup = z.infer<typeof skillGroupSchema>;

export const experienceSchema = z.object({
  id: z.string(),
  company: text(),
  role: text(),
  start: text(),
  end: text(),
  location: text(),
  summary: text(),
  url: text(),
});
export type Experience = z.infer<typeof experienceSchema>;

export const testimonialSchema = z.object({
  id: z.string(),
  quote: text(),
  name: text(),
  role: text(),
  avatar: media(),
});
export type Testimonial = z.infer<typeof testimonialSchema>;

export const postSchema = z.object({
  id: z.string(),
  slug: z.string().default(''),
  title: text('Untitled post'),
  excerpt: text(),
  date: text(),
  readTime: text(),
  published: flag(true),
  cover: media(),
  /** Leave empty to publish the post on this site using `blocks`. */
  externalUrl: text(),
  blocks: list(blockSchema),
});
export type Post = z.infer<typeof postSchema>;

export const principleSchema = z.object({ id: z.string(), title: text(), text: text() });
export const factSchema = z.object({ id: z.string(), label: text(), value: text() });
export const awardSchema = z.object({
  id: z.string(),
  title: text(),
  issuer: text(),
  year: text(),
  url: text(),
});
export const educationSchema = z.object({
  id: z.string(),
  school: text(),
  degree: text(),
  year: text(),
  summary: text(),
});

export const sectionIds = [
  'intro',
  'gallery',
  'work',
  'impact',
  'skills',
  'experience',
  'testimonials',
  'writing',
  'contact',
] as const;
export type SectionId = (typeof sectionIds)[number];

export const sectionSchema = z.object({
  id: z.enum(sectionIds),
  visible: flag(true),
  title: text(),
  subtitle: text(),
});
export type Section = z.infer<typeof sectionSchema>;

export const navItemSchema = z.object({
  id: z.string(),
  label: text(),
  href: text(),
  visible: flag(true),
});
export type NavItem = z.infer<typeof navItemSchema>;

export const fontChoices = ['archivo', 'system', 'inter', 'manrope', 'geist', 'instrument'] as const;
export type FontChoice = (typeof fontChoices)[number];

export const themeSchema = z.object({
  mode: z.enum(['system', 'light', 'dark']).default('light'),
  surface: z.enum(['paper', 'apple', 'white']).catch('paper').default('paper'),
  accent: hexColor('#ff4d1f'),
  font: z.enum(fontChoices).catch('archivo').default('archivo'),
  corners: z.enum(['sharp', 'soft', 'round']).catch('round').default('round'),
  motion: z.enum(['full', 'subtle', 'off']).catch('full').default('full'),
  showThemeToggle: flag(true),
  showCommandMenu: flag(true),
});
export type Theme = z.infer<typeof themeSchema>;

export const contentSchema = z.object({
  isSample: flag(false),
  site: z
    .object({
      title: text(),
      description: text(),
      url: text(),
      ogImage: media(),
      noindex: flag(false),
    })
    .prefault({}),
  profile: z
    .object({
      name: text(),
      shortName: text(),
      role: text(),
      location: text(),
      email: text(),
      phone: text(),
      avatar: media(),
      resumeFile: text(),
      availabilityVisible: flag(true),
      availabilityLabel: text(),
      socials: list(socialSchema),
    })
    .prefault({}),
  nav: list(navItemSchema),
  hero: z
    .object({
      /** Supports *muted text* and a {photo} token that places the portrait inline. */
      headline: text(),
      subheadline: text(),
      facts: list(factSchema),
      showSocials: flag(true),
      primaryLabel: text(),
      primaryHref: text(),
      secondaryLabel: text(),
      secondaryHref: text(),
    })
    .prefault({}),
  sections: list(sectionSchema),
  gallery: list(mediaSchema.extend({ id: z.string(), color: z.string().default('') })),
  projects: list(projectSchema),
  impact: list(metricSchema),
  skills: list(skillGroupSchema),
  experience: list(experienceSchema),
  testimonials: list(testimonialSchema),
  posts: list(postSchema),
  about: z
    .object({
      headline: text(),
      intro: text(),
      portrait: media(),
      body: text(),
      principlesTitle: text(),
      principles: list(principleSchema),
      facts: list(factSchema),
      awardsTitle: text(),
      awards: list(awardSchema),
      education: list(educationSchema),
    })
    .prefault({}),
  contact: z
    .object({
      headline: text(),
      body: text(),
      ctaLabel: text(),
      copyLabel: text(),
    })
    .prefault({}),
  footer: z
    .object({
      note: text(),
      copyright: text(),
    })
    .prefault({}),
  theme: themeSchema.prefault({}),
});

export type Content = z.infer<typeof contentSchema>;

/** Parses stored or edited content, filling in anything missing with defaults. */
export function parseContent(input: unknown): Content {
  return contentSchema.parse(input);
}

export function uid() {
  return crypto.randomUUID().slice(0, 8);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Only allows link targets that are safe to render: web, mail, phone, or on-site paths. */
export function safeHref(value: string | undefined | null): string | undefined {
  const url = value?.trim();
  if (!url) return undefined;
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  if (/^(\/(?!\/)|#)/.test(url)) return url;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(url)) return `https://${url}`;
  return undefined;
}
