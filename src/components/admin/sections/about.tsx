'use client';

import { Award, GraduationCap, Lightbulb, Rows3 } from 'lucide-react';
import { uid, type Content } from '@/lib/content/schema';
import { MediaField } from '../media-field';
import { FactFields, FORMAT_HINT, LinkRow, newFact, TONE_HINT } from '../shared-fields';
import { ListEditor } from '../sortable';
import { useFields, useRoot, type Cursor } from '../store';
import { Group, MiniField, TextAreaRow, TextRow } from '../ui';

type About = Content['about'];
type Principle = About['principles'][number];
type AwardEntry = About['awards'][number];
type Education = About['education'][number];

function PrincipleFields({ cursor, isNew }: { cursor: Cursor<Principle>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <TextRow label="Title" autoFocus={isNew} {...field('title')} />
      <TextAreaRow label="Explanation" rows={2} {...field('text')} />
    </>
  );
}

function AwardFields({ cursor, isNew }: { cursor: Cursor<AwardEntry>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <TextRow label="Title" autoFocus={isNew} {...field('title')} />
      <TextRow label="Given by" {...field('issuer')} />
      <TextRow label="Year" {...field('year')} />
      <LinkRow label="Link" {...field('url')} />
    </>
  );
}

function EducationFields({ cursor, isNew }: { cursor: Cursor<Education>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <MiniField label="School" autoFocus={isNew} {...field('school')} />
      <MiniField label="Degree" {...field('degree')} />
      <MiniField label="Year" {...field('year')} />
    </>
  );
}

export function AboutSection() {
  const about = useRoot().at('about');
  const { field } = useFields(about);
  return (
    <>
      <Group title="Introduction">
        <TextAreaRow label="Headline" rows={2} hint={TONE_HINT} {...field('headline')} />
        <TextAreaRow label="Intro" rows={3} {...field('intro')} />
        <MediaField label="Portrait" cursor={about.at('portrait')} />
        <TextAreaRow label="Your story" rows={6} hint={FORMAT_HINT} {...field('body')} />
      </Group>

      <Group title="How you work">
        <TextRow label="Section title" placeholder="How I work" {...field('principlesTitle')} />
      </Group>
      <Group>
        <ListEditor
          cursor={about.at('principles')}
          noun="principle"
          label="Principles"
          make={() => ({ id: uid(), title: '', text: '' })}
          summary={(entry) => ({ title: entry.title || 'New principle', subtitle: entry.text })}
          Editor={PrincipleFields}
          empty={{ icon: Lightbulb, title: 'No principles yet', text: 'What do you always do, whatever the project?' }}
        />
      </Group>

      <Group title="Facts" footnote="Quick details shown alongside your story.">
        <ListEditor
          cursor={about.at('facts')}
          noun="fact"
          label="Facts"
          make={newFact}
          Editor={FactFields}
          empty={{ icon: Rows3, title: 'No facts yet', text: 'Add a few, like your languages or who you work with.' }}
        />
      </Group>

      <Group title="Awards and recognition">
        <TextRow label="Section title" placeholder="Recognition" {...field('awardsTitle')} />
      </Group>
      <Group>
        <ListEditor
          cursor={about.at('awards')}
          noun="award"
          label="Awards"
          make={() => ({ id: uid(), title: '', issuer: '', year: '', url: '' })}
          summary={(entry) => ({
            title: entry.title || 'New award',
            subtitle: [entry.issuer, entry.year].filter(Boolean).join(', '),
          })}
          Editor={AwardFields}
          empty={{ icon: Award, title: 'No awards yet', text: 'Add prizes, talks or press mentions you’re proud of.' }}
        />
      </Group>

      <Group title="Education">
        <ListEditor
          cursor={about.at('education')}
          noun="school"
          label="Education"
          make={() => ({ id: uid(), school: '', degree: '', year: '' })}
          Editor={EducationFields}
          empty={{ icon: GraduationCap, title: 'No education yet', text: 'Add it if it’s useful to the people reading.' }}
        />
      </Group>
    </>
  );
}
