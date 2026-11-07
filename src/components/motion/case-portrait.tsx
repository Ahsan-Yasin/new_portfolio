'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, LARGE, SMALL, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/** The portrait card swings round in 3D from nearly edge-on, then keeps turning slowly while the story beside it is read. */
export function CasePortrait({ children, className = '' }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      const host = root.current;
      if (level !== 'full' || !host) return;
      const q = gsap.utils.selector(host);
      const media = gsap.matchMedia();

      media.add(LARGE, () => {
        const card = q('.about-card');
        const shine = q('.about-card-shine');
        if (!card.length) return;
        // Swinging round takes the same distance however long the story beside it runs.
        const turning = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: host, start: 'top 96%', end: 'top 12%', scrub: true },
        });
        turning.fromTo(
          card,
          { rotateY: 70, rotateZ: -7, y: 120, scale: 0.86 },
          { rotateY: -8, rotateZ: 2.5, y: 0, scale: 1 },
          0,
        );
        if (shine.length) turning.fromTo(shine, { opacity: 0.65 }, { opacity: 0 }, 0);

        gsap.fromTo(
          card,
          { rotateY: -8, rotateZ: 2.5, y: 0 },
          {
            rotateY: 7,
            rotateZ: -1.5,
            y: -28,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: host, start: 'top 12%', end: 'bottom bottom', scrub: true },
          },
        );
      });

      media.add(SMALL, () => {
        const card = q('.about-card');
        if (!card.length) return;
        gsap.fromTo(
          card,
          { rotateY: 48, rotateZ: -5, y: 44 },
          {
            rotateY: -6,
            rotateZ: 1.5,
            y: 0,
            ease: 'none',
            scrollTrigger: { trigger: q('.about-perspective')[0], start: 'top 96%', end: 'center 45%', scrub: true },
          },
        );
      });

      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  return (
    <section ref={root} className={className}>
      {children}
    </section>
  );
}
