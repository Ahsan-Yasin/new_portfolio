'use client';

import { useRef } from 'react';
import { safeHref, type Experience, type Section } from '@/lib/content/schema';
import { FULL_MOTION, gsap, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/** A career as a line of light. A glowing orb travels down it with the scroll, and each role lights up as the orb arrives. */
export function TimelineScene({ section, experience }: { section: Section; experience: Experience[] }) {
  const root = useRef<HTMLElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      if (level !== 'full') return;
      const media = gsap.matchMedia();
      media.add(FULL_MOTION, () => {
        const track = root.current?.querySelector('.tl-track');
        if (!track) return;
        const travel = { trigger: track, start: 'top 55%', end: 'bottom 55%', scrub: 0.4 };
        gsap.fromTo('.tl-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', transformOrigin: '50% 0%', scrollTrigger: travel });
        gsap.fromTo('.tl-orb', { top: '0%' }, { top: '100%', ease: 'none', scrollTrigger: travel });
        gsap.utils.toArray<HTMLElement>('.tl-row', root.current).forEach((row) => {
          gsap.fromTo(
            row,
            { opacity: 0.16, filter: 'blur(3px)' },
            {
              opacity: 1,
              filter: 'blur(0px)',
              ease: 'none',
              scrollTrigger: { trigger: row, start: 'top 72%', end: 'top 52%', scrub: 0.3 },
            },
          );
        });
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  if (experience.length === 0) return null;

  return (
    <section ref={root} id="experience" className="on-inverse relative z-10 overflow-hidden bg-black text-on-inverse">
      <div className="wrap py-[clamp(88px,12vw,168px)]">
        {section.title ? (
          <h2 data-lines className="t-hero mx-auto mb-[clamp(56px,8vw,112px)] max-w-[14em] text-center">
            {section.title}
          </h2>
        ) : null}
        <div className="tl-track relative">
          <span aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px bg-white/15 md:left-1/2" />
          <span aria-hidden className="tl-fill absolute bottom-0 left-[7px] top-0 w-px bg-accent md:left-1/2" />
          <span
            aria-hidden
            className="tl-orb absolute left-[7px] top-0 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_24px_6px_var(--accent),0_0_70px_16px_color-mix(in_srgb,var(--accent)_55%,transparent)] md:left-1/2"
          />
          <ol className="grid gap-[clamp(44px,6vw,88px)]">
            {experience.map((job) => {
              const href = safeHref(job.url);
              return (
                <li key={job.id} className="tl-row grid gap-x-[clamp(32px,5vw,80px)] gap-y-2 pl-9 md:grid-cols-2 md:pl-0">
                  <div className="md:pr-[clamp(32px,5vw,80px)] md:text-right">
                    <p className="t-figure tabular-nums">{job.start}</p>
                    <p className="t-card mt-2">{job.role}</p>
                    <p className="text-on-inverse-2">
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer" className="hover:text-on-inverse">
                          {job.company}
                        </a>
                      ) : (
                        job.company
                      )}
                    </p>
                  </div>
                  <div className="md:pl-[clamp(32px,5vw,80px)] md:pt-3">
                    <p className="t-small text-on-inverse-2 tabular-nums">{[job.start, job.end].filter(Boolean).join(' – ')}</p>
                    <p className="t-lead mt-2 max-w-[28em] text-on-inverse-2">{job.summary}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
