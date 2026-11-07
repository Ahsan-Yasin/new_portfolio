'use client';

import { MediaField } from '../media-field';
import { useFields, useRoot, useValue } from '../store';
import { Group, TextAreaRow, TextRow, ToggleRow } from '../ui';

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

function clip(text: string, limit: number) {
  return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text;
}

function hostOf(url: string) {
  const value = url.trim();
  if (!value) return 'yoursite.com';
  try {
    return new URL(/^https?:\/\//.test(value) ? value : `https://${value}`).host;
  } catch {
    return value;
  }
}

export function SeoSection() {
  const root = useRoot();
  const site = root.at('site');
  const { value, field } = useFields(site);
  const name = useValue(root.at('profile').at('name'));
  const isSample = useValue(root.at('isSample'));
  const url = value.url ?? '';
  const urlInvalid = Boolean(url.trim()) && !/^https?:\/\/[^\s.]+\.[^\s]+$/.test(url.trim());
  const title = value.title || name || 'Your portfolio';

  return (
    <>
      <Group title="How you’ll look in Google">
        <div className="a-google" aria-label="Preview of your Google search result">
          <p className="a-google-host">{hostOf(url)}</p>
          <p className="a-google-title">{clip(title, TITLE_LIMIT)}</p>
          <p className="a-google-text">
            {clip(value.description || 'Add a description below, and it will appear here.', DESCRIPTION_LIMIT)}
          </p>
        </div>
      </Group>

      <Group title="Search">
        <TextRow
          label="Site title"
          stacked
          hint={`${value.title?.length ?? 0} of about ${TITLE_LIMIT} characters before Google cuts it off.`}
          {...field('title')}
        />
        <TextAreaRow
          label="Description"
          rows={3}
          hint={`${value.description?.length ?? 0} of about ${DESCRIPTION_LIMIT} characters.`}
          {...field('description')}
        />
        <TextRow
          label="Site address"
          type="url"
          placeholder="https://yourname.com"
          spellCheck={false}
          error={urlInvalid ? 'Use the full address, starting with https://' : undefined}
          hint="Your custom domain, if you have one. Used for sharing links and the sitemap."
          {...field('url')}
        />
        <ToggleRow
          label="Hide from search engines"
          hint={
            isSample
              ? 'Search engines are already asked to stay away until you first publish.'
              : 'Asks Google and others not to list your site.'
          }
          {...field('noindex')}
        />
      </Group>

      <Group title="Sharing" footnote="Shown when your link is shared in a message or on social media. A wide image, about 1200 by 630, works best. Leave empty to use an automatic one.">
        <MediaField label="Social image" cursor={site.at('ogImage')} />
      </Group>
    </>
  );
}
