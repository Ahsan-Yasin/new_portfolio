'use client';

import { useRef } from 'react';
import type { Content } from '@/lib/content/schema';
import { CopyEmail } from '@/components/site/small-client';
import { FULL_MOTION, gsap, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';
import { ShaderGlow } from './shader-glow';

const GLOW_ORIGIN: [number, number] = [0.5, -0.05];

/** The closing moment: a rounded panel opens out until it fills the screen, and the invitation scales up inside it. */
export function ContactScene({ content }: { content: Content }) {
  const root = useRef<HTMLElement>(null);
  const level = useMotionLevel();
  const { contact, profile } = content;

  useGSAP(
    () => {
      if (level !== 'full') return;
      const media = gsap.matchMedia();
      media.add(FULL_MOTION, () => {
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'top top', scrub: true },
        });
        timeline.fromTo('.contact-panel', { scale: 0.86, borderRadius: 56, y: 60 }, { scale: 1, borderRadius: 0, y: 0 }, 0);
        timeline.fromTo('.contact-headline', { scale: 0.74, yPercent: 26 }, { scale: 1, yPercent: 0 }, 0);
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  return (
    <section ref={root} id="contact" className="relative z-10 bg-page">
      <div className="contact-panel on-inverse relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-black text-on-inverse will-change-transform">
        <ShaderGlow origin={GLOW_ORIGIN} />
        <div className="wrap relative py-[clamp(96px,14vh,160px)]">
          <h2 className="contact-headline t-closing origin-[0_60%]">{contact.headline}</h2>
          {contact.body ? <p className="t-lead mt-6 max-w-[30em] text-on-inverse-2">{contact.body}</p> : null}
          {profile.email ? (
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href={`mailto:${profile.email}`} data-magnetic className="btn btn-light btn-large">
                {contact.ctaLabel || profile.email}
              </a>
              {contact.copyLabel ? (
                <CopyEmail email={profile.email} label={contact.copyLabel} className="btn-large bg-white/12 text-on-inverse hover:bg-white/20" />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
