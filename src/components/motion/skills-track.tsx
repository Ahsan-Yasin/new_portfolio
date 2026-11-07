'use client';

import { useRef, type CSSProperties } from 'react';
import type { Section, SkillGroup } from '@/lib/content/schema';
import { gsap, LARGE, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/** Vertical scrolling turns into a sideways journey through each discipline. On phones it's a simple swipeable row. */
export function SkillsTrack({ section, skills }: { section: Section; skills: SkillGroup[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      if (level !== 'full') return;
      const media = gsap.matchMedia();
      media.add(LARGE, () => {
        const strip = track.current;
        const host = root.current;
        if (!strip || !host) return;

        const distance = () => Math.max(0, strip.scrollWidth - window.innerWidth);
        const setHeight = () => {
          host.style.height = `${distance() + window.innerHeight}px`;
        };
        setHeight();

        const slide = gsap.to(strip, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: host,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
            onRefreshInit: setHeight,
          },
        });

        // Each panel tilts up into place as it enters from the right.
        gsap.utils.toArray<HTMLElement>('.skill-panel', strip).forEach((panel, index) => {
          if (index === 0) return;
          gsap.fromTo(
            panel,
            { scale: 0.9, rotate: 2.5, transformOrigin: '0% 100%' },
            {
              scale: 1,
              rotate: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: slide,
                start: 'left 100%',
                end: 'left 55%',
                scrub: true,
              },
            },
          );
        });

        return () => {
          host.style.height = '';
        };
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  if (skills.length === 0) return null;
  const ordered = [...skills.filter((group) => group.featured), ...skills.filter((group) => !group.featured)];

  return (
    <section ref={root} id="skills" className="skills relative z-10 bg-page">
      <div className="skills-stage flex flex-col justify-center overflow-hidden py-[clamp(72px,10vh,110px)]">
        <div ref={track} className="skills-strip flex w-max items-stretch gap-[clamp(12px,1.4vw,20px)] px-[var(--gutter)]">
          <header className="flex w-[min(80vw,540px)] flex-none flex-col justify-center pr-6">
            {section.title ? <h2 className="t-hero">{section.title}</h2> : null}
            {section.subtitle ? <p className="t-lead muted mt-4">{section.subtitle}</p> : null}
          </header>
          {ordered.map((group) => {
            const style: CSSProperties | undefined = group.featured
              ? { background: 'var(--accent)', color: 'var(--on-accent)' }
              : undefined;
            return (
              <article
                key={group.id}
                style={style}
                className={`skill-panel flex min-h-[clamp(380px,62vh,620px)] w-[min(84vw,620px)] flex-none flex-col justify-between rounded-sheet p-[clamp(24px,3vw,44px)] ${group.featured ? '' : 'bg-tile'}`}
              >
                <div>
                  <h3 className="t-subtitle">{group.title}</h3>
                  {group.description ? (
                    <p className={`mt-3 max-w-[26em] text-pretty ${group.featured ? 'opacity-85' : 'muted'}`}>{group.description}</p>
                  ) : null}
                </div>
                <ul className="mt-10">
                  {group.items.map((item) => (
                    <li key={item} className="border-t border-current/15 py-2.5 text-[clamp(1.0625rem,1rem+0.5vw,1.375rem)] font-medium tracking-[-0.015em]">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
