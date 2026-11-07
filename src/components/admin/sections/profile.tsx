'use client';

import { Share2 } from 'lucide-react';
import { useId } from 'react';
import { SocialIcon } from '@/components/site/social-icon';
import { socialIcons, uid, type Social, type SocialIcon as SocialIconName } from '@/lib/content/schema';
import { FileField, MediaField } from '../media-field';
import { LinkRow } from '../shared-fields';
import { ListEditor } from '../sortable';
import { useFields, useRoot, type Cursor } from '../store';
import { Group, Row, TextRow, ToggleRow } from '../ui';

const ICON_NAMES: Record<SocialIconName, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  x: 'X',
  dribbble: 'Dribbble',
  behance: 'Behance',
  instagram: 'Instagram',
  youtube: 'YouTube',
  medium: 'Medium',
  mail: 'Email',
  globe: 'Website',
};

function guessIcon(url: string): SocialIconName | null {
  const host = url.toLowerCase();
  if (host.startsWith('mailto:')) return 'mail';
  if (host.includes('twitter.com') || /(^|\/\/|\.)x\.com/.test(host)) return 'x';
  return socialIcons.find((icon) => icon !== 'x' && host.includes(`${icon}.`)) ?? null;
}

function IconPicker({ value, onChange }: { value: SocialIconName; onChange: (next: SocialIconName) => void }) {
  const name = useId();
  return (
    <Row label="Icon" stacked>
      <div role="radiogroup" aria-label="Icon" className="a-icon-picker">
        {socialIcons.map((icon) => (
          <label key={icon} className="a-icon-option" data-on={icon === value} title={ICON_NAMES[icon]}>
            <input
              className="a-sr"
              type="radio"
              name={name}
              checked={icon === value}
              aria-label={ICON_NAMES[icon]}
              onChange={() => onChange(icon)}
            />
            <SocialIcon icon={icon} size={18} />
          </label>
        ))}
      </div>
    </Row>
  );
}

function SocialFields({ cursor, isNew }: { cursor: Cursor<Social>; isNew: boolean }) {
  const { value, field } = useFields(cursor);
  return (
    <>
      <TextRow label="Label" placeholder="LinkedIn" autoFocus={isNew} {...field('label')} />
      <LinkRow
        label="Link"
        value={value.url}
        onChange={(url) => {
          const guess = value.icon === 'globe' ? guessIcon(url) : null;
          cursor.update((previous) => ({ ...previous, url, ...(guess ? { icon: guess } : {}) }));
        }}
      />
      <IconPicker {...field('icon')} />
    </>
  );
}

export function ProfileSection() {
  const profile = useRoot().at('profile');
  const { value, field } = useFields(profile);
  return (
    <>
      <Group title="About you">
        <TextRow label="Name" placeholder="Your full name" {...field('name')} />
        <TextRow label="Short name" placeholder="First name" hint="Used in the navigation and in smaller places." {...field('shortName')} />
        <TextRow label="Role" placeholder="Product designer" {...field('role')} />
        <TextRow label="Location" placeholder="City, country" {...field('location')} />
      </Group>

      <Group title="Contact details">
        <TextRow label="Email" type="email" placeholder="you@example.com" {...field('email')} />
        <TextRow label="Phone" type="tel" placeholder="Optional" {...field('phone')} />
      </Group>

      <Group title="Photo and resume">
        <MediaField label="Photo" cursor={profile.at('avatar')} hint="A square portrait works best." />
        <FileField label="Resume" cursor={profile.at('resumeFile')} hint="A PDF that visitors can download." />
      </Group>

      <Group title="Availability" footnote="A small note near the top of your home page, letting people know you’re open to work.">
        <ToggleRow label="Show availability" {...field('availabilityVisible')} />
        {value.availabilityVisible ? (
          <TextRow label="Message" placeholder="Taking on projects from January" {...field('availabilityLabel')} />
        ) : null}
      </Group>

      <Group title="Social links">
        <ListEditor
          cursor={profile.at('socials')}
          noun="link"
          label="Social links"
          make={() => ({ id: uid(), label: '', url: '', icon: 'globe' as const })}
          summary={(social) => ({ title: social.label || 'New link', subtitle: social.url })}
          trailing={(social) => (
            <span className="a-row-glyph">
              <SocialIcon icon={social.icon} size={17} />
            </span>
          )}
          Editor={SocialFields}
          empty={{
            icon: Share2,
            title: 'No social links yet',
            text: 'Add LinkedIn, GitHub, or wherever else people can find you.',
          }}
        />
      </Group>
    </>
  );
}
