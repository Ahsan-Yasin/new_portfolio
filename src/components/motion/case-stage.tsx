'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, LARGE, SMALL, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/**
 * The opening move of a case study. Sticky positioning holds the hero in place while
 * the paper sheet rises over it: the art swells toward the viewer, the title drifts
 * off and blurs away, and the colour falls into shadow. Scroll position drives it all.
 */
export function CaseStage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      const host = root.current;
      if (level !== 'full' || !host) return;
      const q = gsap.utils.selector(host);
      const media = gsap.matchMedia();

      const build = (swell: number, drift: number, blur: number) => {
        const sheet = q('.case-sheet')[0];
        const copy = q('.case-copy');
        const art = q('.case-art-scrub');
        const dim = q('.case-dim');
        if (!sheet) return;

        const timeline = gsap.timeline({
          defaults: { ease: 'none', duration: 1 },
          scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top top', scrub: true },
        });
        if (copy.length) {
          timeline.fromTo(
            copy,
            { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)' },
            { yPercent: -drift, autoAlpha: 0, filter: `blur(${blur}px)`, duration: 0.8 },
            0,
          );
        }
        if (art.length) timeline.fromTo(art, { scale: 1, yPercent: 0 }, { scale: swell, yPercent: -7 }, 0);
        if (dim.length) timeline.fromTo(dim, { opacity: 0 }, { opacity: 0.5 }, 0);
      };

      media.add(LARGE, () => {
        build(1.36, 38, 16);

        // The art also leans toward the pointer while the hero is uncovered.
        const field = q('.case-field')[0];
        const lean = q('.case-art-lean')[0];
        if (!field || !lean || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const toY = gsap.quickTo(lean, 'rotateY', { duration: 1.1, ease: 'power3' });
        const toX = gsap.quickTo(lean, 'rotateX', { duration: 1.1, ease: 'power3' });
        const move = (event: PointerEvent) => {
          toY((event.clientX / window.innerWidth - 0.5) * 8);
          toX((event.clientY / window.innerHeight - 0.5) * -5);
        };
        field.addEventListener('pointermove', move as EventListener, { passive: true });
        return () => field.removeEventListener('pointermove', move as EventListener);
      });

      media.add(SMALL, () => build(1.16, 22, 8));
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  return (
    <div ref={root} className="case-stage">
      {children}
    </div>
  );
}
