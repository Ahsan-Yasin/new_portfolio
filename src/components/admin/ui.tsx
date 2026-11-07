'use client';

/* eslint-disable @next/next/no-img-element */

import { ChevronsUpDown, ImageIcon, Minus, Plus, X, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import {
  useCallback,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import type { Media } from '@/lib/content/schema';

export const spring = { type: 'spring', bounce: 0, duration: 0.35 } as const;

/* Browser state ------------------------------------------------------------ */

const NO_MATCH = () => false;

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (listener: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', listener);
      return () => list.removeEventListener('change', listener);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    NO_MATCH,
  );
}

const FLAG_EVENT = 'admin-flag-change';

function subscribeToFlags(listener: () => void) {
  window.addEventListener(FLAG_EVENT, listener);
  return () => window.removeEventListener(FLAG_EVENT, listener);
}

function readFlag(key: string) {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

/** A small per-device preference, such as a dismissed checklist. Off when storage is blocked. */
export function useLocalFlag(key: string): [boolean, (next: boolean) => void] {
  const value = useSyncExternalStore(subscribeToFlags, () => readFlag(key), NO_MATCH);
  const set = (next: boolean) => {
    try {
      if (next) localStorage.setItem(key, '1');
      else localStorage.removeItem(key);
    } catch {
      // The preference just won't persist.
    }
    window.dispatchEvent(new Event(FLAG_EVENT));
  };
  return [value, set];
}

/* Groups and rows ---------------------------------------------------------- */

export function Group({
  title,
  footnote,
  action,
  children,
}: {
  title?: string;
  footnote?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="a-group">
      {title || action ? (
        <div className="a-group-head">
          {title ? <h2 className="a-group-title">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      <div className="a-rows">{children}</div>
      {footnote ? <p className="a-foot">{footnote}</p> : null}
    </section>
  );
}

type RowProps = {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  stacked?: boolean;
  children: ReactNode;
};

export function Row({ label, htmlFor, hint, error, stacked, children }: RowProps) {
  return (
    <div className={`a-row${stacked ? ' is-stacked' : ''}`}>
      {htmlFor ? (
        <label className="a-row-label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : (
        <span className="a-row-label">{label}</span>
      )}
      <div className="a-row-control">{children}</div>
      {error ? (
        <p className="a-row-error" id={htmlFor ? `${htmlFor}-message` : undefined} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="a-row-hint" id={htmlFor ? `${htmlFor}-message` : undefined}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type TextProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: ReactNode;
  error?: string;
  stacked?: boolean;
  placeholder?: string;
  type?: 'text' | 'url' | 'email' | 'tel' | 'date';
  autoFocus?: boolean;
  onBlur?: () => void;
  list?: string;
  spellCheck?: boolean;
};

export function TextRow({
  label,
  value,
  onChange,
  hint,
  error,
  stacked,
  placeholder,
  type = 'text',
  autoFocus,
  onBlur,
  list,
  spellCheck,
}: TextProps) {
  const id = useId();
  return (
    <Row label={label} htmlFor={id} hint={hint} error={error} stacked={stacked}>
      <input
        id={id}
        className="a-input"
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onBlur={onBlur}
        list={list}
        spellCheck={spellCheck}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${id}-message` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Row>
  );
}

export function TextAreaRow({
  label,
  value,
  onChange,
  hint,
  placeholder,
  rows = 3,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: ReactNode;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
}) {
  const id = useId();
  return (
    <Row label={label} htmlFor={id} hint={hint} stacked>
      <textarea
        id={id}
        className="a-textarea"
        value={value ?? ''}
        rows={rows}
        style={{ minHeight: `calc(${rows} * 1.45em + 4px)` }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-describedby={hint ? `${id}-message` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Row>
  );
}

/** A label with an input directly beneath it, for compact items inside a list row. */
export function MiniField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoFocus,
  list,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: 'text' | 'url';
  autoFocus?: boolean;
  list?: string;
}) {
  const id = useId();
  return (
    <div className="a-mini">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="a-input is-left"
        value={value ?? ''}
        placeholder={placeholder}
        autoFocus={autoFocus}
        list={list}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/* Switches ----------------------------------------------------------------- */

export function Switch({
  value,
  onChange,
  id,
  label,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  id?: string;
  /** Needed when no visible label points at this switch. */
  label?: string;
}) {
  return (
    <span className="a-switch">
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span aria-hidden className="a-switch-track">
        <span className="a-switch-thumb" />
      </span>
    </span>
  );
}

export function ToggleRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <Row label={label} htmlFor={id} hint={hint}>
      <Switch id={id} value={value} onChange={onChange} />
    </Row>
  );
}

/* Segmented controls ------------------------------------------------------- */

export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (next: T) => void;
  options: readonly { value: T; label: string; icon?: LucideIcon }[];
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className="a-seg">
      {options.map((option) => {
        const on = option.value === value;
        const Icon = option.icon;
        return (
          <label key={option.value} className="a-seg-item" data-on={on}>
            <input
              className="a-sr"
              type="radio"
              name={id}
              checked={on}
              onChange={() => onChange(option.value)}
            />
            {on ? <motion.span layoutId={`${id}-thumb`} className="a-seg-thumb" transition={spring} /> : null}
            <span className="a-seg-text">
              {Icon ? <Icon size={14} aria-hidden /> : null}
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function SegmentedRow<T extends string>({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: ReactNode;
  value: T;
  onChange: (next: T) => void;
  options: readonly { value: T; label: string; icon?: LucideIcon }[];
}) {
  return (
    <Row label={label} hint={hint}>
      <Segmented label={label} value={value} onChange={onChange} options={options} />
    </Row>
  );
}

/* Colour wells ------------------------------------------------------------- */

const HEX = /^#[0-9a-fA-F]{6}$/;

export function ColorWell({
  label,
  value,
  onChange,
  allowEmpty,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  allowEmpty?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState(value);
  const [previous, setPrevious] = useState(value);
  if (previous !== value) {
    setPrevious(value);
    setText(value);
  }

  const onHex = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.trim();
    const next = raw && !raw.startsWith('#') ? `#${raw}` : raw;
    setText(next);
    if (HEX.test(next) || (allowEmpty && next === '')) onChange(next);
  };

  return (
    <span className="a-well">
      <span className="a-well-swatch" data-empty={!value} style={value ? { backgroundColor: value } : undefined}>
        <input
          type="color"
          aria-label={`${label}: colour picker`}
          value={HEX.test(value) ? value.toLowerCase() : '#ffffff'}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      <label className="a-sr" htmlFor={id}>
        {label}: hex value
      </label>
      <input
        id={id}
        className="a-well-hex"
        value={text}
        placeholder={allowEmpty ? 'None' : '#000000'}
        spellCheck={false}
        onChange={onHex}
        onBlur={() => setText(value)}
      />
      {allowEmpty && value ? (
        <IconButton icon={X} label={`Clear ${label.toLowerCase()}`} onClick={() => onChange('')} />
      ) : null}
    </span>
  );
}

export function ColorRow({
  label,
  value,
  onChange,
  hint,
  allowEmpty,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: ReactNode;
  allowEmpty?: boolean;
}) {
  return (
    <Row label={label} hint={hint}>
      <ColorWell label={label} value={value} onChange={onChange} allowEmpty={allowEmpty} />
    </Row>
  );
}

/* Steppers ----------------------------------------------------------------- */

/**
 * Text that usually holds a number, such as "2025" or "6 min". The buttons step the
 * number and leave the rest alone, and the field still takes anything, like "2023–24".
 */
export function StepperRow({
  label,
  value,
  onChange,
  hint,
  placeholder,
  startAt,
  suffix = '',
  min = 0,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: ReactNode;
  placeholder?: string;
  /** Where the first press lands when the field is empty. */
  startAt: () => number;
  suffix?: string;
  min?: number;
}) {
  const id = useId();
  const step = (delta: number) => {
    const match = /^(\D*)(\d+)(.*)$/.exec(value ?? '');
    if (!match) {
      onChange(`${startAt()}${suffix}`);
      return;
    }
    const next = Math.max(min, Number(match[2]) + delta);
    onChange(`${match[1]}${next}${match[3]}`);
  };
  return (
    <Row label={label} htmlFor={id} hint={hint}>
      <span className="a-stepper-wrap">
        <input
          id={id}
          className="a-input"
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="a-stepper">
          <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} onClick={() => step(-1)}>
            <Minus size={14} aria-hidden />
          </button>
          <span aria-hidden className="a-stepper-rule" />
          <button type="button" aria-label={`Increase ${label.toLowerCase()}`} onClick={() => step(1)}>
            <Plus size={14} aria-hidden />
          </button>
        </span>
      </span>
    </Row>
  );
}

/* Popup button ------------------------------------------------------------- */

export function SelectRow<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (next: T) => void;
  options: readonly { value: T; label: string }[];
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <Row label={label} htmlFor={id} hint={hint}>
      <span className="a-select">
        <select id={id} value={value} onChange={(event) => onChange(event.target.value as T)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronsUpDown size={13} aria-hidden />
      </span>
    </Row>
  );
}

/* Buttons ------------------------------------------------------------------ */

type ButtonVariant = 'tint' | 'gray' | 'plain' | 'danger';

export function Button({
  variant = 'gray',
  icon: Icon,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; icon?: LucideIcon }) {
  return (
    <button type="button" className={`a-button is-${variant} ${className}`} {...props}>
      {Icon ? <Icon size={15} aria-hidden /> : null}
      {children}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string }) {
  return (
    <button type="button" className={`a-icon-button ${className}`} aria-label={label} title={label} {...props}>
      <Icon size={16} aria-hidden />
    </button>
  );
}

/** The full-width tinted row at the end of a list, as in iOS. */
export function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="a-add-row" onClick={onClick}>
      <Plus size={16} aria-hidden />
      {label}
    </button>
  );
}

/* Empty states ------------------------------------------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="a-empty">
      <Icon size={26} strokeWidth={1.6} aria-hidden />
      <p className="a-empty-title">{title}</p>
      <p className="a-empty-text">{text}</p>
      {action ? <div className="a-empty-action">{action}</div> : null}
    </div>
  );
}

/* Tokens ------------------------------------------------------------------- */

export function TokenRow({
  label,
  value,
  onChange,
  placeholder = 'Add and press Return',
  hint,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: ReactNode;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const tokens = value ?? [];

  const add = (raw: string) => {
    const parts = raw
      .split(/[,\n]/)
      .map((part) => part.trim())
      .filter((part) => part && !tokens.includes(part));
    if (parts.length) onChange([...tokens, ...new Set(parts)]);
    setText('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === 'Enter' || event.key === ',') && text.trim()) {
      event.preventDefault();
      add(text);
    } else if (event.key === 'Backspace' && !text && tokens.length) {
      onChange(tokens.slice(0, -1));
    }
  };

  return (
    <Row label={label} htmlFor={id} hint={hint} stacked>
      <div className="a-tokens" onClick={() => inputRef.current?.focus()}>
        {tokens.map((token) => (
          <span key={token} className="a-token">
            {token}
            <button
              type="button"
              aria-label={`Remove ${token}`}
              onClick={(event) => {
                event.stopPropagation();
                onChange(tokens.filter((entry) => entry !== token));
              }}
            >
              <X size={12} aria-hidden />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          className="a-token-input"
          value={text}
          placeholder={tokens.length ? '' : placeholder}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(text)}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData('text');
            if (/[,\n]/.test(pasted)) {
              event.preventDefault();
              add(text + pasted);
            }
          }}
        />
      </div>
    </Row>
  );
}

/* Media thumbnails --------------------------------------------------------- */

export function Thumb({ media, color, size = 44 }: { media?: Media; color?: string; size?: number }) {
  const style = { width: size, height: size, backgroundColor: color || undefined };
  if (!media?.src) {
    return (
      <span className="a-thumb is-empty" style={style}>
        <ImageIcon size={Math.round(size * 0.42)} strokeWidth={1.6} aria-hidden />
      </span>
    );
  }
  return (
    <span className="a-thumb" style={style}>
      {media.kind === 'video' ? (
        <video src={media.src} muted playsInline preload="metadata" />
      ) : (
        <img src={media.src} alt="" loading="lazy" />
      )}
    </span>
  );
}
