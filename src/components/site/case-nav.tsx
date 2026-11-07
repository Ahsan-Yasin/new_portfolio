'use client';

import { useEffect, useState } from 'react';

export type CaseNavItem = { id: string; label: string };

/** A floating pill of section names, which tracks the reader's position in a long case study. */
export function CaseNav({ items }: { items: CaseNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const targets = items.flatMap((item) => {
      const element = document.getElementById(item.id);
      return element ? [element] : [];
    });
    if (targets.length === 0) return;

    const update = () => {
      let current = targets[0].id;
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= window.innerHeight * 0.4) current = target.id;
      }
      setActive(current);
      const first = targets[0].getBoundingClientRect().top;
      const end = document.getElementById('case-end')?.getBoundingClientRect().top ?? Infinity;
      setShown(first < window.innerHeight * 0.75 && end > window.innerHeight * 0.75);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Sections of this case study"
      className={`glass no-print fixed bottom-4 left-1/2 z-40 max-w-[calc(100vw-24px)] -translate-x-1/2 overflow-x-auto rounded-pill p-1 transition-[opacity,translate] duration-300 [scrollbar-width:none] ${shown ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
    >
      <ul className="flex gap-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? 'true' : undefined}
              tabIndex={shown ? 0 : -1}
              className={`block whitespace-nowrap rounded-pill px-3.5 py-2 text-[0.8125rem] leading-none transition-colors duration-200 ${active === item.id ? 'bg-ink text-page' : 'text-ink-2 hover:text-ink'}`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
