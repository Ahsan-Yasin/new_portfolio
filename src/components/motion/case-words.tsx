'use client';

import { useRef, type ReactNode } from 'react';
import { FULL_MOTION, gsap, SplitText, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

type Props = {
  children: ReactNode;
  className?: string;
  /** Opacity of a word before the scroll reaches it. */
  dim?: number;
  start?: string;
  end?: string;
};

/**
 * Lights up every paragraph inside it word by word as it passes through the screen.
 * The text stays fully lit until this runs, so it can't be left dim without scripts or
 * with reduced motion. Clamped so the last words light up even at the very end of a page.
 */
export function CaseWords({ children, className, dim = 0.15, start = 'top 84%', end = 'bottom 58%' }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      if (level !== 'full') return;
      const media = gsap.matchMedia();
      media.add(FULL_MOTION, () => {
        const splits = gsap.utils.toArray<HTMLElement>('p', root.current).map((paragraph) => {
          const split = SplitText.create(paragraph, { type: 'words', tag: 'span', aria: 'none' });
          gsap.fromTo(
            split.words,
            { opacity: dim },
            {
              opacity: 1,
              ease: 'none',
              duration: 1,
              stagger: 0.1,
              scrollTrigger: {
                trigger: paragraph,
                start: `clamp(${start})`,
                end: `clamp(${end})`,
                scrub: true,
                // On a page too short to scroll, there's no way to reach the end of the range.
                onRefresh: (self) => {
                  if (self.end - self.start < 4) self.animation?.progress(1);
                },
              },
            },
          );
          return split;
        });
        return () => splits.forEach((split) => split.revert());
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [level, dim, start, end] },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
