'use client';

import { useRef, type ReactNode } from 'react';
import { FULL_MOTION, gsap, ScrollTrigger, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/** Rows of a list arrive from blur to sharp, in groups as the scroll reaches them. Only ever hidden once this is running. */
export function CaseRows({ children, className = '' }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      if (level === 'off') return;
      const media = gsap.matchMedia();
      media.add(FULL_MOTION, () => {
        const rows = gsap.utils.toArray<HTMLElement>('li', root.current);
        if (rows.length === 0) return;
        gsap.set(rows, { opacity: 0, y: 24, filter: 'blur(14px)' });
        ScrollTrigger.batch(rows, {
          start: 'top 94%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 1.15,
              stagger: 0.09,
              ease: 'expo.out',
              clearProps: 'filter',
            }),
        });
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
