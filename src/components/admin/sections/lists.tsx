'use client';

import { Building2, MessageSquareQuote, Wrench } from 'lucide-react';
import { uid, type Experience, type SkillGroup, type Testimonial } from '@/lib/content/schema';
import { MediaField } from '../media-field';
import { LinkRow } from '../shared-fields';
import { ListEditor } from '../sortable';
import { useFields, useRoot, type Cursor } from '../store';
import { Group, TextAreaRow, TextRow, ToggleRow, TokenRow } from '../ui';

/* Skills ------------------------------------------------------------------- */

function SkillFields({ cursor, isNew }: { cursor: Cursor<SkillGroup>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <TextRow label="Title" autoFocus={isNew} placeholder="AI products" {...field('title')} />
      <TextAreaRow label="Description" rows={2} {...field('description')} />
      <ToggleRow label="Featured" hint="Gives this group more room. Use it for the skills you most want noticed." {...field('featured')} />
      <TokenRow label="Skills" placeholder="Type a skill and press Return" {...field('items')} />
    </>
  );
}

export function SkillsSection() {
  return (
    <Group title="Skill groups" footnote="Mark your AI group as featured to give it pride of place.">
      <ListEditor
        cursor={useRoot().at('skills')}
        noun="group"
        label="Skill groups"
        make={() => ({ id: uid(), title: '', description: '', items: [], featured: false })}
        summary={(group) => ({
          title: group.title || 'New group',
          subtitle: `${group.featured ? 'Featured, ' : ''}${group.items.length} ${group.items.length === 1 ? 'skill' : 'skills'}`,
        })}
        Editor={SkillFields}
        empty={{ icon: Wrench, title: 'No skills yet', text: 'Group what you do, so people can see your range at a glance.' }}
      />
    </Group>
  );
}

/* Experience --------------------------------------------------------------- */

function ExperienceFields({ cursor, isNew }: { cursor: Cursor<Experience>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <TextRow label="Company" autoFocus={isNew} {...field('company')} />
      <TextRow label="Role" {...field('role')} />
      <TextRow label="Started" placeholder="2023" {...field('start')} />
      <TextRow label="Ended" placeholder="Present" {...field('end')} />
      <TextRow label="Location" {...field('location')} />
      <TextAreaRow label="Summary" rows={2} {...field('summary')} />
      <LinkRow label="Company link" {...field('url')} />
    </>
  );
}

export function ExperienceSection() {
  return (
    <Group title="Roles" footnote="Most recent first usually reads best.">
      <ListEditor
        cursor={useRoot().at('experience')}
        noun="role"
        label="Roles"
        make={() => ({ id: uid(), company: '', role: '', start: '', end: '', location: '', summary: '', url: '' })}
        summary={(entry) => ({
          title: entry.company || 'New role',
          subtitle: [entry.role, [entry.start, entry.end].filter(Boolean).join(' to ')].filter(Boolean).join(', '),
        })}
        Editor={ExperienceFields}
        empty={{ icon: Building2, title: 'No roles yet', text: 'Add where you’ve worked and what you did there.' }}
      />
    </Group>
  );
}

/* Testimonials ------------------------------------------------------------- */

function TestimonialFields({ cursor, isNew }: { cursor: Cursor<Testimonial>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <TextAreaRow label="Quote" rows={3} autoFocus={isNew} {...field('quote')} />
      <TextRow label="Name" {...field('name')} />
      <TextRow label="Role" placeholder="VP Product, Halo Health" {...field('role')} />
      <MediaField label="Photo" cursor={cursor.at('avatar')} hint="Optional. Their initials appear without one." />
    </>
  );
}

export function TestimonialsSection() {
  return (
    <Group title="Testimonials">
      <ListEditor
        cursor={useRoot().at('testimonials')}
        noun="testimonial"
        label="Testimonials"
        make={() => ({ id: uid(), quote: '', name: '', role: '', avatar: { src: '', alt: '', kind: 'image' as const } })}
        summary={(entry) => ({ title: entry.name || 'New testimonial', subtitle: entry.quote, media: entry.avatar })}
        Editor={TestimonialFields}
        empty={{
          icon: MessageSquareQuote,
          title: 'No testimonials yet',
          text: 'A sentence from someone you’ve worked with goes a long way.',
        }}
      />
    </Group>
  );
}
