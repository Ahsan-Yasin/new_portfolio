'use client';

import { ArrowRight, Copy, Moon, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toggleTheme } from './nav';
import { useSitePath } from './site-link';

export const OPEN_COMMAND_MENU = 'open-command-menu';

export type CommandItem = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  href: string;
};

type Row = CommandItem | { id: string; group: string; label: string; hint?: string; run: () => void; icon: 'copy' | 'theme' };

function hasHref(row: Row): row is CommandItem {
  return 'href' in row;
}

export function CommandMenu({ items, email }: { items: CommandItem[]; email: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const previewRoot = useSitePath('/');

  const close = useCallback(() => dialogRef.current?.close(), []);

  const open = useCallback(() => {
    setQuery('');
    setActive(0);
    setCopied(false);
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_COMMAND_MENU, open);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_COMMAND_MENU, open);
    };
  }, [close, open]);

  const rows = useMemo<Row[]>(() => {
    const actions: Row[] = [
      ...(email
        ? [{ id: 'copy-email', group: 'Actions', label: copied ? 'Copied' : 'Copy email address', hint: email, icon: 'copy' as const, run: () => {
            void navigator.clipboard.writeText(email);
            setCopied(true);
          } }]
        : []),
      { id: 'theme', group: 'Actions', label: 'Switch between light and dark', icon: 'theme' as const, run: () => toggleTheme() },
    ];
    const needle = query.trim().toLowerCase();
    const all: Row[] = [...items, ...actions];
    return needle ? all.filter((row) => `${row.label} ${row.hint ?? ''} ${row.group}`.toLowerCase().includes(needle)) : all;
  }, [items, email, query, copied]);

  const activate = (row: Row | undefined) => {
    if (!row) return;
    if (!hasHref(row)) {
      row.run();
      return;
    }
    close();
    if (/^https?:/.test(row.href)) {
      window.open(row.href, '_blank', 'noreferrer');
    } else {
      router.push(previewRoot === '/' ? row.href : row.href === '/' ? previewRoot : `${previewRoot}${row.href}`);
    }
  };

  const onInputKey = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActive((value) => (rows.length ? (value + delta + rows.length) % rows.length : 0));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      activate(rows[active]);
    }
  };

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let lastGroup = '';

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command menu"
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
      className="command-menu glass m-auto w-[min(600px,calc(100vw-32px))] overflow-hidden rounded-[20px] p-0 text-ink"
    >
      <div className="flex items-center gap-3 border-b border-line px-5">
        <Search size={17} className="flex-none text-ink-2" aria-hidden />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKey}
          placeholder="Search work, writing, and pages"
          aria-label="Search"
          className="h-14 w-full bg-transparent text-[1.0625rem] outline-none placeholder:text-ink-3"
        />
      </div>
      <ul ref={listRef} className="max-h-[min(420px,60vh)] overflow-y-auto p-2" role="listbox" aria-label="Results">
        {rows.length === 0 ? <li className="t-small muted px-3 py-8 text-center">Nothing matches “{query}”.</li> : null}
        {rows.map((row, index) => {
          const showGroup = row.group !== lastGroup;
          lastGroup = row.group;
          return (
            <li key={row.id} role="presentation">
              {showGroup ? <p className="t-micro px-3 pb-1 pt-3 font-semibold text-ink-3">{row.group}</p> : null}
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                data-active={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => activate(row)}
                className="flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-[0.9375rem] data-[active=true]:bg-[var(--icon-button)]"
              >
                <span className="min-w-0 flex-1 truncate">{row.label}</span>
                {row.hint ? <span className="t-small flex-none truncate text-ink-3">{row.hint}</span> : null}
                {hasHref(row) ? (
                  <ArrowRight size={15} className="flex-none text-ink-3" aria-hidden />
                ) : row.icon === 'copy' ? (
                  <Copy size={15} className="flex-none text-ink-3" aria-hidden />
                ) : (
                  <Moon size={15} className="flex-none text-ink-3" aria-hidden />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
