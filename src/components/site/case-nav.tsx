'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type CaseNavItem = { id: string; label: string };

/**
 * A floating pill of section names that tracks the reader. An inverted copy of the list
 * sits on top, clipped to the active item, so the indicator slides between items and the
 * text flips colour exactly at its edge. Bows out before the end of the story, so it
 * never reaches the next project or the footer.
 */
export function CaseNav({ items }: { items: CaseNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [shown, setShown] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const ink = useRef<HTMLUListElement>(null);
  const meter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const targets = items.flatMap((item) => {
      const element = document.getElementById(item.id);
      return element ? [element] : [];
    });
    if (targets.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      let current = targets[0].id;
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= height * 0.4) current = target.id;
      }
      setActive(current);

      const first = targets[0].getBoundingClientRect().top;
      const end = document.getElementById('case-end')?.getBoundingClientRect().top ?? Infinity;
      setShown(first < height * 0.75 && end > height * 0.96);

      if (meter.current && Number.isFinite(end) && end > first) {
        const read = Math.min(1, Math.max(0, (height * 0.96 - first) / (end - first)));
        meter.current.style.transform = `scaleX(${read})`;
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [items]);

  const place = useCallback(() => {
    const host = track.current;
    const mask = ink.current;
    const link = host?.querySelector<HTMLElement>('a[aria-current="true"]');
    if (!host || !mask || !link) return;
    const right = host.offsetWidth - link.offsetLeft - link.offsetWidth;
    mask.style.clipPath = `inset(0 ${right}px 0 ${link.offsetLeft}px round var(--r-pill))`;

    // On a phone the pill scrolls sideways, keeping the active item in the middle.
    const box = scroller.current;
    if (box && box.scrollWidth > box.clientWidth) {
      box.scrollTo({ left: link.offsetLeft - (box.clientWidth - link.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, []);

  useLayoutEffect(() => {
    place();
  }, [active, place]);

  // Web fonts and resizes change the width of every item.
  useEffect(() => {
    if (!track.current) return;
    const observer = new ResizeObserver(place);
    observer.observe(track.current);
    return () => observer.disconnect();
  }, [place]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Sections of this case study" data-shown={shown} className="case-nav glass no-print">
      <div ref={scroller} className="case-nav-scroll">
        <div ref={track} className="case-nav-track">
          <ul className="case-nav-list">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'true' : undefined}
                  tabIndex={shown ? 0 : -1}
                  className="case-nav-link text-ink-2 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <ul ref={ink} aria-hidden className="case-nav-list case-nav-ink">
            {items.map((item) => (
              <li key={item.id} className="case-nav-link">
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <span aria-hidden className="case-nav-rail">
        <span ref={meter} className="case-nav-meter" />
      </span>
    </nav>
  );
}
