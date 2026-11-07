'use client';

import { useRef } from 'react';
import { FULL_MOTION, gsap, scrollState, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="overflow-hidden py-[0.06em]">
      <div className="marquee-track" data-reverse={reverse ? 'true' : undefined}>
        {[0, 1, 2].map((copy) => (
          <span key={copy} aria-hidden={copy > 0} className="flex flex-none items-center">
            {items.map((item) => (
              <span key={item} className="flex items-center whitespace-nowrap">
                <span className="t-hero px-[0.32em]">{item}</span>
                <svg viewBox="0 0 48 48" className="h-[clamp(14px,2vw,30px)] w-[clamp(14px,2vw,30px)] flex-none text-accent" fill="currentColor" aria-hidden>
                  <path d="M24 0c1.7 13.6 8.4 20.3 24 24-15.6 3.7-22.3 10.4-24 24-1.7-13.6-8.4-20.3-24-24C15.6 20.3 22.3 13.6 24 0Z" />
                </svg>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Two rows of skills that drift in opposite directions, surge with scroll speed, and lean into it. */
export function TechMarquee({ items }: { items: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const level = useMotionLevel();
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half)];

  useGSAP(
    () => {
      if (level === 'off') return;
      const media = gsap.matchMedia();
      media.add(FULL_MOTION, () => {
        const tracks = gsap.utils.toArray<HTMLElement>('.marquee-track', root.current);
        const offsets = tracks.map(() => 0);
        const skewTo = tracks.map((track) => gsap.quickTo(track, 'skewX', { duration: 0.6, ease: 'power3' }));
        const tick = (_time: number, delta: number) => {
          const dt = Math.min(delta / 1000, 0.05);
          const velocity = scrollState.velocity;
          tracks.forEach((track, index) => {
            const width = track.scrollWidth / 3;
            if (!width) return;
            const direction = track.dataset.reverse ? 1 : -1;
            offsets[index] += direction * (60 + Math.abs(velocity) * 60) * dt;
            if (offsets[index] <= -width) offsets[index] += width;
            if (offsets[index] > 0) offsets[index] -= width;
            gsap.set(track, { x: offsets[index] });
            skewTo[index](gsap.utils.clamp(-9, 9, velocity * -0.5 * direction));
          });
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  if (items.length === 0) return null;

  return (
    <div ref={root} aria-hidden className="relative z-10 bg-page pb-[clamp(56px,8vw,120px)]">
      {rows.map((row, index) => (row.length ? <Row key={index} items={row} reverse={index === 1} /> : null))}
    </div>
  );
}
