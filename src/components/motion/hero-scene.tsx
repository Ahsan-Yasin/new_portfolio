'use client';

import { useRef } from 'react';
import type { Content } from '@/lib/content/schema';
import { initials, publishedProjects, sectionById } from '@/lib/content/select';
import { Media } from '@/components/site/media';
import { CurrentYear } from '@/components/site/small-client';
import { FULL_MOTION, gsap, LARGE, scrollState, SMALL, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="currentColor">
      <path d="M24 0c1.7 13.6 8.4 20.3 24 24-15.6 3.7-22.3 10.4-24 24-1.7-13.6-8.4-20.3-24-24C15.6 20.3 22.3 13.6 24 0Z" />
    </svg>
  );
}

function Bolt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 56" className={className} aria-hidden fill="currentColor">
      <path d="M21 0 0 32h12L8 56l24-34H19L21 0Z" />
    </svg>
  );
}

type OrbitItem = { key: string; media: Content['gallery'][number]; color: string };

function orbitItems(content: Content): OrbitItem[] {
  if (!sectionById(content, 'gallery')?.visible) return [];
  const gallery = content.gallery.map((item) => ({ key: item.id, media: item, color: item.color || '#141416' }));
  const covers = publishedProjects(content)
    .filter((project) => project.cover.src)
    .map((project) => ({
      key: project.id,
      media: { ...project.cover, id: project.id, color: project.color },
      color: project.color,
    }));
  // Alternate dark screens with colourful covers, so the ring has rhythm as it turns.
  const mixed: OrbitItem[] = [];
  for (let i = 0; i < Math.max(gallery.length, covers.length); i++) {
    if (covers[i]) mixed.push(covers[i]);
    if (gallery[i]) mixed.push(gallery[i]);
  }
  return mixed.slice(0, 10);
}

/**
 * The opening. The title comes into focus one line at a time, the portrait rises, the
 * navigation and small marks pop into place, then the work flies out from behind the
 * portrait into a slow orbit that passes behind and in front of the type in real 3D.
 * The ring can be grabbed and spun, and scrolling drives it faster as the scene dissolves.
 */
export function HeroScene({ content }: { content: Content }) {
  const root = useRef<HTMLElement>(null);
  const level = useMotionLevel();
  const { hero, profile } = content;
  const lines = hero.headline
    .replace('{photo}', '')
    .replace(/\*/g, '')
    .split(/\n|\s\/\s/)
    .map((line) => line.trim())
    .filter(Boolean);
  const items = orbitItems(content);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const ring = scope.querySelector<HTMLElement>('.orbit-ring');
      const stage = scope.querySelector<HTMLElement>('.orbit-stage');
      const cards = gsap.utils.toArray<HTMLElement>('.orbit-card', scope);
      const media = gsap.matchMedia();

      // Fits the title to the screen, so any wording works: as wide as it can go, without crowding the portrait.
      const title = scope.querySelector<HTMLElement>('.hero-title h1');
      const titleLines = gsap.utils.toArray<HTMLElement>('.hero-line', scope);
      const fitTitle = () => {
        if (!title || titleLines.length === 0) return;
        title.style.fontSize = '100px';
        const widest = Math.max(...titleLines.map((line) => line.offsetWidth));
        const byWidth = (100 * window.innerWidth * 0.86) / widest;
        const byHeight = (window.innerHeight * 0.5) / (titleLines.length * 0.92);
        title.style.fontSize = `${Math.min(byWidth, byHeight)}px`;
      };
      fitTitle();
      document.fonts?.ready.then(fitTitle);
      window.addEventListener('resize', fitTitle);

      // Phones get a sparser, steeper ring, so the title stays readable between the cards.
      const small = window.matchMedia('(max-width: 899.98px)').matches;
      const tilt = small ? -36 : -19;
      const activeCards = small ? cards.filter((_, index) => index % 2 === 0) : cards;
      cards.forEach((card) => {
        if (!activeCards.includes(card)) gsap.set(card, { display: 'none' });
      });
      const spacing = activeCards.length ? 360 / activeCards.length : 0;

      /** Position on the ring. GSAP moves before it rotates, so the circle is worked out with trigonometry. */
      const orbitSpot = (index: number, radius: number) => {
        const angle = index * spacing;
        const radians = (angle * Math.PI) / 180;
        return { rotateY: angle, x: Math.sin(radians) * radius, z: Math.cos(radians) * radius };
      };
      const placeCards = (radius: number) => {
        activeCards.forEach((card, index) => {
          gsap.set(card, { ...orbitSpot(index, radius), autoAlpha: 1 });
        });
      };
      const radiusFor = () => (small ? window.innerWidth * 0.58 : Math.min(window.innerWidth * 0.38, 580));

      // The nav lives outside this section, so it can't be found through the scoped selector.
      const navPill = document.querySelector('.site-nav-pill');

      const showStill = () => {
        gsap.set('[data-intro], .hero-star, .hero-bolt', { autoAlpha: 1 });
        if (navPill) gsap.set(navPill, { autoAlpha: 1 });
        gsap.set('.hero-bolt', { rotate: 16 });
        placeCards(radiusFor());
        if (ring) gsap.set(ring, { rotateX: tilt, rotateZ: -5 });
      };

      if (level !== 'full') {
        showStill();
        return () => window.removeEventListener('resize', fitTitle);
      }

      media.add('(prefers-reduced-motion: reduce)', showStill);

      media.add(FULL_MOTION, () => {
        const timeline = gsap.timeline({ delay: 0.3 });

        // The title resolves from a soft blur, one line after another.
        titleLines.forEach((line, index) => {
          timeline.fromTo(
            line,
            { autoAlpha: 0, filter: 'blur(26px)', y: 22, scale: 1.03 },
            { autoAlpha: 1, filter: 'blur(0px)', y: 0, scale: 1, duration: 1.6, ease: 'expo.out', clearProps: 'filter' },
            index * 0.3,
          );
        });
        timeline.fromTo(
          '.hero-portrait',
          { autoAlpha: 0, filter: 'blur(18px)', yPercent: 26 },
          { autoAlpha: 1, filter: 'blur(0px)', yPercent: 0, duration: 1.6, ease: 'expo.out', clearProps: 'filter' },
          0.8,
        );
        if (navPill) {
          timeline.fromTo(
            navPill,
            { autoAlpha: 0, y: -18, scale: 0.92 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: 'expo.out' },
            1.25,
          );
        }
        timeline.fromTo('.hero-star', { autoAlpha: 0, scale: 0, rotate: -140 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.3, ease: 'back.out(2.4)' }, 1.4);
        timeline.fromTo('.hero-bolt', { autoAlpha: 0, scale: 0, rotate: -50 }, { autoAlpha: 1, scale: 1, rotate: 16, duration: 1.3, ease: 'back.out(2.4)' }, 1.5);
        timeline.fromTo('.hero-label', { autoAlpha: 0, y: 14, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.09, clearProps: 'filter' }, 1.55);

        // The ring: each card launches from the centre out to its place in the orbit.
        const radius = radiusFor();
        activeCards.forEach((card, index) => {
          const spot = orbitSpot(index, radius);
          timeline.fromTo(
            card,
            { rotateY: spot.rotateY - 90, x: 0, z: 0, scale: 0.2, autoAlpha: 0 },
            { ...spot, scale: 1, autoAlpha: 1, duration: 1.9, ease: 'expo.out' },
            1.45 + index * 0.055,
          );
        });

        if (!ring) return;
        let angle = 0;
        let spin = 0;
        let dragging = false;
        let lastX = 0;
        const quickRing = () => {
          ring.style.transform = `rotateX(${tilt}deg) rotateZ(-5deg) rotateY(${angle}deg)`;
        };
        const tick = (_time: number, delta: number) => {
          if (scope.style.visibility === 'hidden') return;
          const dt = Math.min(delta / 1000, 0.05);
          if (!dragging) {
            spin += (0 - spin) * (1 - Math.exp(-1.6 * dt));
            angle += (11 + spin + Math.abs(scrollState.velocity) * 2.2) * dt;
          }
          quickRing();
        };
        gsap.ticker.add(tick);

        const onDown = (event: PointerEvent) => {
          if (event.button !== 0 || (event.target as HTMLElement).closest('a,button')) return;
          dragging = true;
          lastX = event.clientX;
          spin = 0;
        };
        const onMove = (event: PointerEvent) => {
          if (dragging) {
            const delta = event.clientX - lastX;
            lastX = event.clientX;
            angle += delta * 0.32;
            spin = delta * 7;
            quickRing();
          }
        };
        const onUp = () => {
          dragging = false;
        };
        scope.addEventListener('pointerdown', onDown);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);

        return () => {
          gsap.ticker.remove(tick);
          scope.removeEventListener('pointerdown', onDown);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        };
      });

      const exit = (titleLift: number) => () => {
        const leaving = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: scope,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            // Once covered by later sections it's hidden, which also stops the orbit using any processor time.
            onLeave: () => gsap.set(scope, { visibility: 'hidden' }),
            onEnterBack: () => gsap.set(scope, { visibility: 'visible' }),
          },
        });
        leaving.to('.hero-title', { yPercent: titleLift, scale: 0.9, autoAlpha: 0, filter: 'blur(14px)', duration: 0.8 }, 0);
        leaving.to('.hero-portrait', { yPercent: 32, scale: 1.08, duration: 1 }, 0);
        leaving.to('.hero-label', { autoAlpha: 0, duration: 0.4 }, 0);
        if (ring) leaving.to('.orbit-ring-scale', { scale: 1.8, autoAlpha: 0, duration: 1 }, 0);
      };
      media.add(LARGE, exit(-34));
      media.add(SMALL, exit(-22));

      // The whole scene leans gently toward the pointer.
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && stage) {
        const toRotateY = gsap.quickTo(stage, 'rotateY', { duration: 1.1, ease: 'power3' });
        const toRotateX = gsap.quickTo(stage, 'rotateX', { duration: 1.1, ease: 'power3' });
        const lean = (event: PointerEvent) => {
          toRotateY((event.clientX / window.innerWidth - 0.5) * 7);
          toRotateX((event.clientY / window.innerHeight - 0.5) * -5);
        };
        scope.addEventListener('pointermove', lean);
        return () => {
          scope.removeEventListener('pointermove', lean);
          window.removeEventListener('resize', fitTitle);
          media.revert();
        };
      }
      return () => {
        window.removeEventListener('resize', fitTitle);
        media.revert();
      };
    },
    { scope: root, dependencies: [level, items.length] },
  );

  return (
    <section ref={root} aria-label="Introduction" className="hero sticky top-0 z-0 h-[100svh] min-h-[560px] overflow-hidden bg-page">
      <div className="orbit-scene absolute inset-0">
        <div className="orbit-stage absolute inset-0 grid place-items-center">
          {items.length ? (
            <div aria-hidden className="orbit-ring-scale absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
              <div className="orbit-ring absolute inset-0" style={{ transform: 'rotateX(-19deg) rotateZ(-5deg)' }}>
                {items.map(({ key, media, color }) => (
                  <div key={key} data-intro className="orbit-card" style={{ background: color }}>
                    <Media media={{ ...media, alt: '' }} fill sizes="250px" fit="cover" className="pointer-events-none select-none" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="hero-title relative -mt-[6vh] select-none text-center" style={{ transform: 'translateZ(1px)' }}>
            <h1 className="t-mega" aria-label={lines.join(' ')}>
              {lines.map((line) => (
                <span key={line} data-intro aria-hidden className="hero-line mx-auto block w-max whitespace-nowrap">
                  {line}
                </span>
              ))}
            </h1>
            <Star className="hero-star absolute -left-[3.2vw] -top-[1.4vw] w-[clamp(26px,4.4vw,72px)] text-accent [visibility:hidden]" />
            <Bolt className="hero-bolt absolute -bottom-[2vw] -right-[2.6vw] w-[clamp(18px,2.9vw,46px)] text-accent [visibility:hidden]" />
          </div>
        </div>
      </div>

      <div
        data-intro
        className="hero-portrait absolute bottom-0 left-1/2 z-10 h-[min(62svh,46vw+160px)] w-[min(92vw,calc(min(62svh,46vw+160px)*0.8))] -translate-x-1/2"
      >
        {profile.avatar.src ? (
          // Sits on the bottom edge. A cut-out photo stands in front of the title; a regular photo works too.
          <Media media={profile.avatar} fill fit="contain" position="center top" sizes="(max-width: 900px) 92vw, 620px" priority />
        ) : (
          <span className="t-hero absolute inset-x-0 bottom-0 grid aspect-square place-items-center rounded-t-[22px] bg-[#111] text-white">
            {initials(profile.name)}
          </span>
        )}
      </div>

      <div className="wrap pointer-events-none absolute inset-x-0 bottom-[clamp(18px,3.4vh,34px)] z-20 flex items-end justify-between gap-6">
        <p data-intro className="hero-label t-subtitle whitespace-nowrap">
          ©<CurrentYear />
        </p>
        {profile.availabilityVisible && profile.availabilityLabel ? (
          <p data-intro className="hero-label t-small max-w-[27vw] text-right sm:max-w-none">
            <span className="mr-1.5 inline-block h-2 w-2 -translate-y-px rounded-full bg-accent" aria-hidden />
            {profile.availabilityLabel}
          </p>
        ) : null}
      </div>
    </section>
  );
}
