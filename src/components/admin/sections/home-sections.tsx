'use client';

import { TrendingUp } from 'lucide-react';
import { sectionIds, type Section, type SectionId } from '@/lib/content/schema';
import { sectionHref } from '../router';
import { MetricFields, newMetric, TONE_HINT } from '../shared-fields';
import { ListEditor } from '../sortable';
import { useFields, useRoot, useValue, type Cursor } from '../store';
import { AddRow, Group, Switch, TextAreaRow, TextRow } from '../ui';

const NAMES: Record<SectionId, string> = {
  intro: 'Intro',
  gallery: 'Image gallery',
  work: 'Selected work',
  impact: 'Impact numbers',
  skills: 'Skills',
  experience: 'Experience',
  testimonials: 'Testimonials',
  writing: 'Writing',
  contact: 'Contact',
};

const CONTENT_LINKS: Partial<Record<SectionId, { label: string; href: string }>> = {
  gallery: { label: 'Edit the images in Home hero', href: sectionHref('hero') },
  work: { label: 'Edit your projects', href: sectionHref('projects') },
  skills: { label: 'Edit your skills', href: sectionHref('skills') },
  experience: { label: 'Edit your experience', href: sectionHref('experience') },
  testimonials: { label: 'Edit your testimonials', href: sectionHref('testimonials') },
  writing: { label: 'Edit your posts', href: sectionHref('writing') },
  contact: { label: 'Edit the contact message', href: sectionHref('contact') },
};

function SectionFields({ cursor }: { cursor: Cursor<Section>; isNew: boolean }) {
  const { value, field } = useFields(cursor);
  const link = CONTENT_LINKS[value.id];
  return (
    <>
      <TextAreaRow label="Title" rows={1} hint={TONE_HINT} {...field('title')} />
      <TextRow label="Subtitle" stacked {...field('subtitle')} />
      {link ? (
        <a className="a-inline-link" href={link.href}>
          {link.label}
        </a>
      ) : null}
    </>
  );
}

export function SectionsSection() {
  const root = useRoot();
  const sections = useValue(root.at('sections'));
  // A document saved before a section type existed won't list it yet.
  const missing = sectionIds.filter((id) => !sections.some((section) => section.id === id));
  return (
    <>
      <Group
        title="Home page sections"
        footnote="Drag to change the order they appear in. Switch one off to hide it. Some sections look fine with no title at all."
      >
        <ListEditor
          cursor={root.at('sections')}
          noun="section"
          label="Home page sections"
          summary={(section) => ({
            title: NAMES[section.id],
            subtitle: section.title.replace(/\*/g, '') || 'No title',
          })}
          trailing={(section, cursor) => (
            <Switch
              label={`Show ${NAMES[section.id]}`}
              value={section.visible}
              onChange={(visible) => cursor.at('visible').set(visible)}
            />
          )}
          Editor={SectionFields}
        />
        {missing.map((id) => (
          <AddRow
            key={id}
            label={`Add ${NAMES[id]}`}
            onClick={() =>
              root.at('sections').update((previous) => [...previous, { id, visible: true, title: '', subtitle: '' }])
            }
          />
        ))}
      </Group>

      <Group title="Impact numbers" footnote="The big figures shown in the Impact numbers section.">
        <ListEditor
          cursor={root.at('impact')}
          noun="number"
          label="Impact numbers"
          make={newMetric}
          Editor={MetricFields}
          empty={{ icon: TrendingUp, title: 'No numbers yet', text: 'Add the results you’re proudest of.' }}
        />
      </Group>
    </>
  );
}
