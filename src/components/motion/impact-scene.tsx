'use client';

import { useRef } from 'react';
import type { Metric, Section } from '@/lib/content/schema';
import { ToneText } from '@/components/site/rich-text';
import { FULL_MOTION, gsap, SplitText, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';
import { ShaderGlow } from './shader-glow';

/** A black stage that holds while the sentence lights up word by word, then the numbers land one at a time. */
export function ImpactScene({ section, metrics }: { section: Section; metrics: Metric[] }) {
  const root = useRef<HTMLElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      if (level !== 'full') return;
      const media = gsap.matchMedia();
      media.add(FULL_MOTION, () => {
        // The stage opens through a slanted window as it arrives, squaring up as it fills the screen.
        gsap.fromTo(
          '.impact-stage',
          { clipPath: 'polygon(26% 0%, 100% 0%, 74% 100%, 0% 100%)' },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top top', scrub: true },
          },
        );

        const split = SplitText.create('.impact-sentence', { type: 'words' });
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true },
        });
        timeline.fromTo(split.words, { opacity: 0.12 }, { opacity: 1, stagger: 0.09, duration: 0.5 }, 0);
        timeline.fromTo(
          '.impact-metric',
          { autoAlpha: 0, y: 70 },
          { autoAlpha: 1, y: 0, stagger: 0.35, duration: 0.7 },
          '-=0.2',
        );
        timeline.to({}, { duration: 0.5 });
        return () => split.revert();
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  return (
    <section ref={root} id="impact" className="impact on-inverse relative z-10 bg-page text-on-inverse">
      <div className="impact-stage flex flex-col justify-center overflow-hidden bg-black">
        <ShaderGlow />
        <div className="wrap relative py-[clamp(72px,10vh,120px)]">
          {section.title ? (
            <h2 className="impact-sentence t-hero max-w-[16em]">
              <ToneText text={section.title} />
            </h2>
          ) : null}
          {section.subtitle ? <p className="t-lead mt-5 max-w-[34em] text-on-inverse-2">{section.subtitle}</p> : null}
          {metrics.length ? (
            <dl className="mt-[clamp(40px,8vh,88px)] grid gap-x-[clamp(12px,1.6vw,24px)] gap-y-7 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.id} className="impact-metric border-t border-white/25 pt-4">
                  <dd className="t-figure whitespace-nowrap">{metric.value}</dd>
                  <dt className="t-small mt-2 text-on-inverse-2">{metric.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
