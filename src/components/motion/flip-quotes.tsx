'use client';

import { useRef } from 'react';
import type { Section, Testimonial } from '@/lib/content/schema';
import { initials } from '@/lib/content/select';
import { Media } from '@/components/site/media';
import { FULL_MOTION, gsap, LARGE, SMALL, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/** Black cards arrive face down and turn over one after another as you scroll. */
export function FlipQuotes({ section, testimonials }: { section: Section; testimonials: Testimonial[] }) {
  const root = useRef<HTMLElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      if (level !== 'full') return;
      const media = gsap.matchMedia();

      media.add(LARGE, () => {
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: '.flip-row', start: 'top 92%', end: 'top 22%', scrub: 0.5 },
        });
        gsap.utils.toArray<HTMLElement>('.flip-inner', root.current).forEach((card, index) => {
          timeline.fromTo(
            card,
            { rotateY: 180, rotateZ: index % 2 ? 4 : -4, y: 110 },
            { rotateY: 0, rotateZ: 0, y: 0, duration: 1 },
            index * 0.22,
          );
        });
      });

      media.add(SMALL, () => {
        gsap.utils.toArray<HTMLElement>('.flip-inner', root.current).forEach((card) => {
          gsap.fromTo(
            card,
            { rotateY: 180 },
            { rotateY: 0, ease: 'none', scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 45%', scrub: 0.4 } },
          );
        });
      });

      media.add(FULL_MOTION, () => undefined);
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  if (testimonials.length === 0) return null;

  return (
    <section ref={root} id="testimonials" className="relative z-10 bg-page py-[clamp(88px,12vw,168px)]">
      <div className="wrap">
        {section.title ? (
          <h2 data-lines className="t-hero mb-[clamp(36px,5vw,72px)] max-w-[13em]">
            {section.title}
          </h2>
        ) : null}
        <div className="flip-row grid gap-[clamp(12px,1.4vw,20px)] md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.id} className="flip-card h-[clamp(340px,46vh,460px)]">
              <div className="flip-inner will-change-transform">
                <blockquote className="flip-face flex flex-col justify-between rounded-[clamp(18px,2vw,30px)] bg-[#111] p-[clamp(22px,2.4vw,36px)] text-[#f4f1ea]">
                  <p className="t-card">“{item.quote}”</p>
                  <footer className="mt-6 flex items-center gap-3">
                    <span className="relative grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-full bg-accent text-[0.8125rem] font-semibold text-on-accent">
                      {item.avatar.src ? <Media media={item.avatar} fill sizes="44px" /> : initials(item.name)}
                    </span>
                    <span className="t-small">
                      <cite className="block font-semibold not-italic">{item.name}</cite>
                      <span className="text-[#a8a498]">{item.role}</span>
                    </span>
                  </footer>
                </blockquote>
                <div aria-hidden className="flip-face flip-back grid place-items-center rounded-[clamp(18px,2vw,30px)] bg-[#111] text-accent">
                  <span className="t-hero">{initials(item.name)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
