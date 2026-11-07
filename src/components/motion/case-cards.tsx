'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, LARGE, SMALL, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/** Black cards that turn into place in 3D, one after another. Visible and flat unless this has run. */
export function CaseCards({ children, className = '' }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      const host = root.current;
      if (level !== 'full' || !host) return;
      const q = gsap.utils.selector(host);
      const media = gsap.matchMedia();

      media.add(LARGE, () => {
        const cards = q('.award-card');
        if (!cards.length) return;
        gsap.fromTo(
          cards,
          { rotateY: -78, y: 80, opacity: 0, filter: 'blur(14px)', transformOrigin: '0% 50%' },
          {
            rotateY: 0,
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.4,
            stagger: 0.14,
            ease: 'expo.out',
            clearProps: 'filter',
            scrollTrigger: { trigger: host, start: 'top 84%', once: true },
          },
        );
      });

      media.add(SMALL, () => {
        (q('.award-card') as HTMLElement[]).forEach((card) => {
          gsap.fromTo(
            card,
            { rotateX: -32, y: 40, opacity: 0, filter: 'blur(10px)', transformOrigin: '50% 100%' },
            {
              rotateX: 0,
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.1,
              ease: 'expo.out',
              clearProps: 'filter',
              scrollTrigger: { trigger: card, start: 'top 92%', once: true },
            },
          );
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
