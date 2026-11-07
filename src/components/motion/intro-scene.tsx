'use client';

import { useRef } from 'react';
import { safeHref, type Content, type Section } from '@/lib/content/schema';
import { Media } from '@/components/site/media';
import { SiteLink } from '@/components/site/site-link';
import { SocialIcon } from '@/components/site/social-icon';
import { FULL_MOTION, gsap, LARGE, SMALL, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

/** A sheet slides up over the opening. A portrait card turns in 3D from edge-on to face the visitor. */
export function IntroScene({ content, section }: { content: Content; section: Section }) {
  const root = useRef<HTMLElement>(null);
  const level = useMotionLevel();
  const { hero, about, profile } = content;
  const portrait = about.portrait.src ? about.portrait : profile.avatar;
  const primaryHref = safeHref(hero.primaryHref);
  const secondaryHref = safeHref(hero.secondaryHref);

  useGSAP(
    () => {
      if (level !== 'full') return;
      const media = gsap.matchMedia();

      // The card starts face down, showing its back, and turns over as the visitor scrolls.
      const build = (endRotate: number, startScale: number) => () => {
        const turn = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top -20%', scrub: 0.8 },
        });
        turn.fromTo(
          '.intro-card',
          { transformPerspective: 1200, rotationY: -180, rotationZ: -8, scale: startScale, y: 114 },
          { rotationY: endRotate, rotationZ: 4, scale: 1, y: 0, duration: 1 },
          0,
        );
        turn.fromTo('.intro-shine', { opacity: 0.7, xPercent: -60 }, { opacity: 0, xPercent: 60, duration: 0.5 }, 0.5);
      };
      media.add(LARGE, build(-13, 0.5));
      media.add(SMALL, build(-8, 0.7));

      media.add(FULL_MOTION, () => {
        gsap.fromTo(
          '.intro-word',
          { autoAlpha: 0, filter: 'blur(22px)', y: 30 },
          {
            autoAlpha: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: 1.5,
            clearProps: 'filter',
            scrollTrigger: { trigger: root.current, start: 'top 60%', once: true },
          },
        );
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  return (
    <section
      ref={root}
      id="intro"
      className="intro relative z-10 rounded-t-sheet bg-sheet"
    >
      <div className="intro-stage grid min-h-[100svh] content-between gap-y-10 overflow-hidden lg:sticky lg:top-0 lg:h-[100svh]">
        <div className="wrap pt-[clamp(84px,12vh,120px)]">
          {section.title ? <h2 className="intro-word t-closing">{section.title}</h2> : null}
        </div>

        <div className="pointer-events-none px-[var(--gutter)] lg:absolute lg:inset-0 lg:grid lg:place-items-center lg:px-0">
          <div
            className="intro-card relative mx-auto aspect-[4/5] w-[min(68vw,300px)] will-change-transform lg:w-[clamp(240px,25vw,400px)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="flip-face overflow-hidden rounded-[clamp(14px,1.6vw,26px)] bg-[#111] shadow-[0_40px_100px_rgba(0,0,0,.34)]">
              <Media media={portrait} fill sizes="(max-width: 900px) 68vw, 400px" />
              <span aria-hidden className="intro-shine absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,.5)_50%,transparent_65%)] opacity-0" />
            </div>
            <div aria-hidden className="flip-face flip-back grid place-items-center overflow-hidden rounded-[clamp(14px,1.6vw,26px)] bg-accent text-on-accent shadow-[0_40px_100px_rgba(0,0,0,.34)]">
              <svg viewBox="0 0 48 48" className="w-[38%]" fill="currentColor">
                <path d="M24 0c1.7 13.6 8.4 20.3 24 24-15.6 3.7-22.3 10.4-24 24-1.7-13.6-8.4-20.3-24-24C15.6 20.3 22.3 13.6 24 0Z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="wrap grid-12 gap-y-7 pb-[clamp(32px,6vh,64px)]">
          <div className="col-span-12 lg:col-span-3">
            {hero.subheadline ? <p data-lines className="font-medium text-pretty">{hero.subheadline}</p> : null}
            {hero.facts.length ? (
              <dl data-stagger className="mt-5 grid gap-1">
                {hero.facts.map((fact) => (
                  <div key={fact.id} className="t-small flex gap-3">
                    <dt className="w-[4.5rem] flex-none text-ink-3">{fact.label}</dt>
                    <dd className="text-pretty">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          <div className="col-span-12 lg:col-span-3 lg:col-start-10">
            {about.intro ? <p data-lines className="muted t-small text-pretty">{about.intro}</p> : null}
            <div data-fade className="mt-5 flex flex-wrap items-center gap-2">
              {primaryHref && hero.primaryLabel ? (
                <SiteLink href={primaryHref} data-magnetic className="btn btn-primary btn-small">
                  {hero.primaryLabel}
                </SiteLink>
              ) : null}
              {secondaryHref && hero.secondaryLabel ? (
                <SiteLink href={secondaryHref} data-magnetic className="btn btn-quiet btn-small">
                  {hero.secondaryLabel}
                </SiteLink>
              ) : null}
              {hero.showSocials
                ? profile.socials.map((social) => {
                    const href = safeHref(social.url);
                    return href ? (
                      <a key={social.id} href={href} target="_blank" rel="noreferrer" aria-label={social.label} className="icon-btn !h-9 !w-9">
                        <SocialIcon icon={social.icon} size={16} />
                      </a>
                    ) : null;
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
