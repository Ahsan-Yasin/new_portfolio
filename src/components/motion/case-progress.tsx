'use client';

import { useRef } from 'react';
import { FULL_MOTION, gsap, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/** A reading progress bar tied to the scroll position. It reaches the end when the reading does, not when the footer does. */
export function CaseProgress({ endTrigger }: { endTrigger: string }) {
  const bar = useRef<HTMLDivElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      if (level === 'off') return;
      const media = gsap.matchMedia();
      media.add(FULL_MOTION, () => {
        gsap.fromTo(
          bar.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: document.documentElement,
              start: 0,
              endTrigger,
              end: 'clamp(top bottom)',
              scrub: true,
            },
          },
        );
      });
      return () => media.revert();
    },
    { dependencies: [level, endTrigger] },
  );

  return <div ref={bar} aria-hidden className="case-progress no-print" />;
}
