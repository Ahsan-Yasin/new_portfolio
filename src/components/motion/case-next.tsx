'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, LARGE, SMALL, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/**
 * The next project starts as a rounded card and grows to full bleed as you approach,
 * its art rising from the bottom edge and its title sharpening into place. It ends in
 * exactly the layout of that project's hero, so following the link is a continuous move.
 */
export function CaseNextScene({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      const host = root.current;
      if (level !== 'full' || !host) return;
      const q = gsap.utils.selector(host);
      const media = gsap.matchMedia();

      const build = (scale: number, radius: number, blur: number) => {
        const field = q('.case-field');
        const art = q('.case-art-scrub');
        const copy = q('.case-copy');
        if (!field.length) return;

        const timeline = gsap.timeline({
          defaults: { ease: 'none', duration: 1 },
          scrollTrigger: { trigger: host, start: 'top bottom', end: 'top top', scrub: true },
        });
        timeline.fromTo(
          field,
          { scale, clipPath: `inset(0% round ${radius}px)` },
          { scale: 1, clipPath: 'inset(0% round 0px)' },
          0,
        );
        if (art.length) timeline.fromTo(art, { yPercent: 62, scale: 0.8 }, { yPercent: 0, scale: 1 }, 0);
        if (copy.length) {
          timeline.fromTo(
            copy,
            { yPercent: 22, opacity: 0, filter: `blur(${blur}px)` },
            { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.72 },
            0.28,
          );
        }
      };

      media.add(LARGE, () => build(0.68, 72, 14));
      media.add(SMALL, () => build(0.88, 40, 8));
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  return (
    <aside ref={root} className="case-next">
      <div className="case-next-hold">{children}</div>
    </aside>
  );
}
