'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, LARGE, ScrollTrigger, SMALL, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/**
 * One huge numeral, held by sticky positioning, that melts into the next as each row
 * scrolls past. The melt is a pair of blurred numerals pushed through an alpha threshold.
 * The numeral is decoration: every row also carries its own number, which phones show large.
 */
export function CasePrinciples({ children, className = '', filterId }: { children: ReactNode; className?: string; filterId: string }) {
  const root = useRef<HTMLElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      const host = root.current;
      if (level !== 'full' || !host) return;
      const q = gsap.utils.selector(host);
      const media = gsap.matchMedia();

      media.add(LARGE, () => {
        const numerals = q('.principles-num') as HTMLElement[];
        const rows = q('.principle') as HTMLElement[];
        const stack = q('.principles-stack')[0] as HTMLElement | undefined;
        if (!stack || numerals.length < 2) return;

        const triggers: ScrollTrigger[] = [];

        // Adding every row's progress gives one position across the list, however it was reached.
        const render = () => {
          const position = triggers.reduce((sum, trigger) => sum + trigger.progress, 0);
          numerals.forEach((numeral, index) => {
            const share = gsap.utils.clamp(0, 1, 1 - Math.abs(position - index));
            const melting = share > 0.001 && share < 0.999;
            numeral.style.opacity = melting ? String(share ** 0.4) : String(Math.round(share));
            numeral.style.filter = melting ? `blur(${Math.min(8 / share - 8, 48)}px)` : 'none';
          });
          stack.style.filter = Math.abs(position - Math.round(position)) > 0.002 ? `url(#${filterId})` : 'none';
        };

        rows.slice(1).forEach((row) => {
          triggers.push(
            ScrollTrigger.create({
              trigger: row,
              start: 'top 74%',
              end: 'top 34%',
              onUpdate: render,
              onRefresh: render,
            }),
          );
        });
        render();

        return () => {
          gsap.set(numerals, { clearProps: 'opacity,filter' });
          gsap.set(stack, { clearProps: 'filter' });
        };
      });

      media.add(SMALL, () => {
        (q('.principle-index') as HTMLElement[]).forEach((numeral) => {
          gsap.fromTo(
            numeral,
            { opacity: 0.1, y: 40, filter: 'blur(14px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              ease: 'none',
              scrollTrigger: { trigger: numeral, start: 'top 94%', end: 'clamp(top 62%)', scrub: true },
            },
          );
        });
      });

      return () => media.revert();
    },
    { scope: root, dependencies: [level, filterId] },
  );

  return (
    <section ref={root} className={className}>
      {children}
    </section>
  );
}
