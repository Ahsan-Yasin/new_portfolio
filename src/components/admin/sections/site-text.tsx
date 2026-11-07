'use client';

import { Compass } from 'lucide-react';
import { uid, type NavItem } from '@/lib/content/schema';
import { ListEditor } from '../sortable';
import { useFields, useRoot, type Cursor } from '../store';
import { Group, MiniField, Switch, TextAreaRow, TextRow } from '../ui';

/* Contact and footer ------------------------------------------------------- */

export function ContactSection() {
  const root = useRoot();
  const contact = useFields(root.at('contact'));
  const footer = useFields(root.at('footer'));
  return (
    <>
      <Group title="Contact" footnote="Your email address comes from Profile.">
        <TextAreaRow label="Headline" rows={2} {...contact.field('headline')} />
        <TextAreaRow label="Message" rows={3} {...contact.field('body')} />
        <TextRow label="Button label" placeholder="Start a conversation" {...contact.field('ctaLabel')} />
        <TextRow label="Copy button label" placeholder="Copy email" {...contact.field('copyLabel')} />
      </Group>

      <Group title="Footer">
        <TextRow label="Note" placeholder="Designed and built in Lisbon." {...footer.field('note')} />
        <TextRow
          label="Copyright name"
          hint="Shown after the copyright sign and the year."
          {...footer.field('copyright')}
        />
      </Group>
    </>
  );
}

/* Navigation --------------------------------------------------------------- */

const TARGETS_ID = 'a-nav-targets';
const TARGETS = ['/', '/#work', '/#skills', '/#experience', '/#writing', '/#contact', '/about', '/writing', '/resume'];

function NavFields({ cursor, isNew }: { cursor: Cursor<NavItem>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <MiniField label="Label" placeholder="Work" autoFocus={isNew} {...field('label')} />
      <MiniField label="Link" placeholder="/about" list={TARGETS_ID} {...field('href')} />
    </>
  );
}

export function NavigationSection() {
  return (
    <>
      <datalist id={TARGETS_ID}>
        {TARGETS.map((target) => (
          <option key={target} value={target} />
        ))}
      </datalist>
      <Group
        title="Navigation items"
        footnote="Links can point to a page, like /about, a home page section, like /#work, or anywhere else with https://."
      >
        <ListEditor
          cursor={useRoot().at('nav')}
          noun="item"
          label="Navigation items"
          make={() => ({ id: uid(), label: '', href: '', visible: true })}
          Editor={NavFields}
          trailing={(item, cursor) => (
            <Switch
              label={`Show ${item.label || 'this item'} in the navigation`}
              value={item.visible}
              onChange={(visible) => cursor.at('visible').set(visible)}
            />
          )}
          empty={{ icon: Compass, title: 'No navigation yet', text: 'Add links to help people find their way around.' }}
        />
      </Group>
    </>
  );
}
