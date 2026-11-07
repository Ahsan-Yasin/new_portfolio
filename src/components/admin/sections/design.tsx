'use client';

import { Check, Monitor, Moon, Sun } from 'lucide-react';
import type { CSSProperties } from 'react';
import { readableOn } from '@/lib/content/select';
import type { FontChoice, Theme } from '@/lib/content/schema';
import { fontChoices } from '@/lib/content/schema';
import { useFields, useRoot } from '../store';
import { ColorWell, Group, Row, SegmentedRow, ToggleRow, useMediaQuery } from '../ui';

const MODES = [
  { value: 'system', label: 'Auto', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

const SURFACES = [
  { value: 'apple', label: 'Apple' },
  { value: 'paper', label: 'Paper' },
  { value: 'white', label: 'White' },
] as const;

const CORNERS = [
  { value: 'sharp', label: 'Sharp' },
  { value: 'soft', label: 'Soft' },
  { value: 'round', label: 'Round' },
] as const;

const MOTION = [
  { value: 'full', label: 'Full' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'off', label: 'Off' },
] as const;

const ACCENTS = [
  { value: '#ff4d1f', name: 'Signal orange' },
  { value: '#0071e3', name: 'Blue' },
  { value: '#1d1d1f', name: 'Graphite' },
  { value: '#00a676', name: 'Green' },
  { value: '#0e7490', name: 'Teal' },
  { value: '#d6246e', name: 'Magenta' },
  { value: '#b45309', name: 'Amber' },
];

const FONTS: Record<FontChoice, { name: string; family: string }> = {
  archivo: { name: 'Archivo', family: 'var(--font-archivo), "Arial Black", sans-serif' },
  system: { name: 'System', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  inter: { name: 'Inter', family: 'var(--font-inter), sans-serif' },
  manrope: { name: 'Manrope', family: 'var(--font-manrope), sans-serif' },
  geist: { name: 'Geist', family: 'var(--font-geist), sans-serif' },
  instrument: { name: 'Instrument Serif', family: 'var(--font-instrument), Georgia, serif' },
};

const SAMPLE_SURFACES: Record<Theme['surface'], { light: [string, string, string, string]; dark: [string, string, string, string] }> = {
  // page, tile, ink, secondary
  apple: { light: ['#f5f5f7', '#ffffff', '#1d1d1f', '#6e6e73'], dark: ['#000000', '#1d1d1f', '#f5f5f7', '#a1a1a6'] },
  paper: { light: ['#f4f1ea', '#faf7f3', '#111111', '#5f5c55'], dark: ['#0b0b0c', '#161617', '#f4f1ea', '#a8a498'] },
  white: { light: ['#ffffff', '#f5f5f7', '#1d1d1f', '#6e6e73'], dark: ['#000000', '#1d1d1f', '#f5f5f7', '#a1a1a6'] },
};

const SAMPLE_RADIUS: Record<Theme['corners'], { tile: number; pill: number }> = {
  sharp: { tile: 4, pill: 6 },
  soft: { tile: 10, pill: 980 },
  round: { tile: 14, pill: 980 },
};

function LiveSample({ theme }: { theme: Theme }) {
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const dark = theme.mode === 'dark' || (theme.mode === 'system' && systemDark);
  const [page, tile, ink, secondary] = SAMPLE_SURFACES[theme.surface][dark ? 'dark' : 'light'];
  const radius = SAMPLE_RADIUS[theme.corners];
  const font = FONTS[theme.font].family;
  const style: CSSProperties = { backgroundColor: page, color: ink, fontFamily: font };

  return (
    <div className="a-sample" style={style} aria-label="Live sample of your theme" role="img">
      <div className="a-sample-card" style={{ backgroundColor: tile, borderRadius: radius.tile }}>
        <p className="a-sample-title" style={{ fontWeight: theme.font === 'instrument' ? 400 : theme.font === 'archivo' ? 700 : 600 }}>
          Calm software for <span style={{ color: secondary }}>complicated work.</span>
        </p>
        <p className="a-sample-text" style={{ color: secondary }}>
          A small taste of how your site will look.
        </p>
        <span
          className="a-sample-button"
          style={{ backgroundColor: theme.accent, color: readableOn(theme.accent), borderRadius: radius.pill }}
        >
          Get in touch
        </span>
        <span className="a-sample-link" style={{ color: theme.accent }}>
          See my work
        </span>
      </div>
    </div>
  );
}

export function DesignSection() {
  const theme = useRoot().at('theme');
  const { value, field } = useFields(theme);
  const accent = field('accent');
  const font = field('font');
  const lowerAccent = value.accent?.toLowerCase();

  return (
    <>
      <Group title="Sample">
        <LiveSample theme={value} />
      </Group>

      <Group title="Appearance">
        <SegmentedRow label="Mode" hint="Auto follows each visitor’s device." options={MODES} {...field('mode')} />
        <SegmentedRow label="Surface" options={SURFACES} {...field('surface')} />
      </Group>

      <Group title="Accent colour">
        <div className="a-swatches" role="radiogroup" aria-label="Accent colour">
          {ACCENTS.map((option) => {
            const on = option.value === lowerAccent;
            return (
              <label key={option.value} className="a-swatch" title={option.name} style={{ backgroundColor: option.value }}>
                <input
                  className="a-sr"
                  type="radio"
                  name="a-accent"
                  aria-label={option.name}
                  checked={on}
                  onChange={() => accent.onChange(option.value)}
                />
                {on ? <Check size={15} strokeWidth={3} aria-hidden style={{ color: readableOn(option.value) }} /> : null}
              </label>
            );
          })}
        </div>
        <Row label="Custom colour">
          <ColorWell label="Custom colour" {...accent} />
        </Row>
      </Group>

      <Group title="Font">
        <div role="radiogroup" aria-label="Font">
          {fontChoices.map((choice) => {
            const on = choice === value.font;
            return (
              <label key={choice} className="a-font-option" data-on={on}>
                <input
                  className="a-sr"
                  type="radio"
                  name="a-font"
                  checked={on}
                  onChange={() => font.onChange(choice)}
                />
                <span style={{ fontFamily: FONTS[choice].family }}>{FONTS[choice].name}</span>
                {on ? <Check size={16} strokeWidth={2.5} aria-hidden className="a-font-check" /> : null}
              </label>
            );
          })}
        </div>
      </Group>

      <Group title="Feel">
        <SegmentedRow label="Corners" options={CORNERS} {...field('corners')} />
        <SegmentedRow label="Motion" hint="Visitors who ask their device to reduce motion always get less." options={MOTION} {...field('motion')} />
      </Group>

      <Group title="Extras">
        <ToggleRow label="Theme toggle" hint="Lets visitors switch between light and dark." {...field('showThemeToggle')} />
        <ToggleRow label="Command menu" hint="A quick-jump menu visitors can open with Cmd+K or Ctrl+K." {...field('showCommandMenu')} />
      </Group>
    </>
  );
}
