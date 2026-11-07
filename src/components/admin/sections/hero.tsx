'use client';

import { Rows3 } from 'lucide-react';
import { uid } from '@/lib/content/schema';
import { MediaListEditor } from '../media-field';
import { FactFields, LinkRow, newFact } from '../shared-fields';
import { ListEditor } from '../sortable';
import { useFields, useRoot } from '../store';
import { Group, TextAreaRow, TextRow, ToggleRow } from '../ui';

export function HeroSection() {
  const root = useRoot();
  const hero = root.at('hero');
  const { field } = useFields(hero);
  return (
    <>
      <Group title="Opening title">
        <TextAreaRow
          label="Title"
          rows={3}
          hint="Each line becomes one giant line on the opening screen, sized to fit automatically. One or two short words per line work best."
          {...field('headline')}
        />
        <TextAreaRow
          label="Introduction"
          rows={2}
          hint="Shown just below the opening, beside your portrait."
          {...field('subheadline')}
        />
      </Group>

      <Group title="Facts" footnote="A short list shown with your introduction.">
        <ListEditor
          cursor={hero.at('facts')}
          noun="fact"
          label="Facts"
          make={newFact}
          Editor={FactFields}
          empty={{
            icon: Rows3,
            title: 'No facts yet',
            text: 'Add a few quick details, like where you’re based or what you’re working on now.',
          }}
        />
      </Group>

      <Group title="Links" footnote="Shown with your introduction. Leave a button’s label empty to hide it.">
        <ToggleRow label="Show social links" {...field('showSocials')} />
        <TextRow label="First button" placeholder="See my work" {...field('primaryLabel')} />
        <LinkRow label="First button link" placeholder="/#work" {...field('primaryHref')} />
        <TextRow label="Second button" placeholder="Get in touch" {...field('secondaryLabel')} />
        <LinkRow label="Second button link" placeholder="/#contact" {...field('secondaryHref')} />
      </Group>

      <Group title="Orbiting images" footnote="These circle the opening title in 3D, alongside your project covers. Drop files onto this list to add them.">
        <MediaListEditor
          cursor={root.at('gallery')}
          label="Orbiting images"
          withColor
          make={(media) => ({ ...media, id: uid(), color: '' })}
        />
      </Group>
    </>
  );
}
