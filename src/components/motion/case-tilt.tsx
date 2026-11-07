'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, LARGE, SMALL, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/** Stands media up in 3D as it enters: it starts leaning back and levels out as it reaches the middle of the screen. */
export function CaseTilt({ children, className = '' }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      if (level !== 'full') return;
      const media = gsap.matchMedia();

      const build = (tilt: number, lift: number) => {
        gsap.fromTo(
          card.current,
          { rotateX: tilt, y: lift },
          {
            rotateX: 0,
            y: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'clamp(top 45%)', scrub: true },
          },
        );
      };

      media.add(LARGE, () => build(8, 72));
      media.add(SMALL, () => build(5, 28));
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  return (
    <div ref={root} className={`case-tilt ${className}`}>
      <div ref={card} className="case-tilt-card">
        {children}
      </div>
    </div>
  );
}
