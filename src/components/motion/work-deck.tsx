'use client';

import { ArrowUpRight } from 'lucide-react';
import { ViewTransition, useRef, type CSSProperties } from 'react';
import type { Project, Section } from '@/lib/content/schema';
import { readableOn } from '@/lib/content/select';
import { Media } from '@/components/site/media';
import { SiteLink } from '@/components/site/site-link';
import { gsap, LARGE, SMALL, useGSAP } from './gsap';
import { useMotionLevel } from './motion-provider';

function Scene({ project, index, total, priority }: { project: Project; index: number; total: number; priority?: boolean }) {
  const onColor = readableOn(project.color);
  const metric = project.metrics[0];
  const meta = [project.client, project.year].filter(Boolean).join(' · ');
  const style = { background: project.color, color: onColor } as CSSProperties;

  return (
    <ViewTransition name={`cover-${project.id}`} share="morph" default="none">
      <div className="deck-inner relative h-full w-full overflow-hidden will-change-transform" style={style}>
        <SiteLink href={`/work/${project.slug}`} data-cursor="View project" className="deck-link block h-full w-full" aria-label={project.title}>
          <div className="wrap relative z-10 pt-[clamp(84px,12vh,120px)]">
            <div className="deck-meta t-small mb-[clamp(16px,2.2vh,28px)] flex items-center justify-between gap-6 opacity-80">
              <span className="tabular-nums">
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <span>{meta}</span>
            </div>
            <div className="grid-12 items-start gap-y-3">
              <div className="col-span-12 lg:col-span-9">
                <h3 className="deck-title t-deck">{project.title}</h3>
                {project.summary ? <p className="deck-summary t-lead mt-3 max-w-[32em] opacity-80">{project.summary}</p> : null}
              </div>
              {metric?.value ? (
                <div className="deck-metric col-span-12 hidden text-right lg:col-span-3 lg:block">
                  <p className="t-figure whitespace-nowrap">{metric.value}</p>
                  <p className="t-small mt-1 opacity-80">{metric.label}</p>
                </div>
              ) : null}
            </div>
          </div>
          {project.cover.src ? (
            <div className="deck-art absolute inset-x-[-34%] bottom-0 h-[52%] will-change-transform md:inset-x-0 md:h-[60%]">
              <Media
                media={project.cover}
                fill
                fit={project.coverFit}
                position={project.coverFit === 'cover' ? 'center' : 'center bottom'}
                sizes="100vw"
                priority={priority}
              />
            </div>
          ) : null}
          <span aria-hidden className="deck-go absolute bottom-5 right-[var(--gutter)] z-10 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-[#1d1d1f] lg:hidden">
            <ArrowUpRight size={20} />
          </span>
        </SiteLink>
        <div aria-hidden className="deck-dim pointer-events-none absolute inset-0 z-20 bg-black opacity-0" />
      </div>
    </ViewTransition>
  );
}

/**
 * Selected work as a stack of full-screen scenes. The first project grows from a card
 * until it fills the screen; each next project then slides up over the last, which
 * shrinks and dims behind it. Sticky positioning does the pinning, so it stays smooth
 * on touch devices, and scroll position alone drives every value.
 */
export function WorkDeck({ projects, section }: { projects: Project[]; section: Section }) {
  const root = useRef<HTMLElement>(null);
  const level = useMotionLevel();

  useGSAP(
    () => {
      if (level !== 'full') return;
      const media = gsap.matchMedia();

      const build = (introScale: number) => {
        const scenes = gsap.utils.toArray<HTMLElement>('.deck-scene', root.current);

        scenes.forEach((scene, index) => {
          const inner = scene.querySelector('.deck-inner');
          const art = scene.querySelector('.deck-art');
          const title = scene.querySelector('.deck-title');
          const rest = scene.querySelectorAll('.deck-meta, .deck-summary, .deck-metric');
          const next = scenes[index + 1];

          if (index > 0) {
            const arriving = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: { trigger: scene, start: 'top bottom', end: 'top top', scrub: true },
            });
            if (art) arriving.fromTo(art, { yPercent: 38, scale: 0.88 }, { yPercent: 0, scale: 1 }, 0);
            if (title) arriving.fromTo(title, { yPercent: 70 }, { yPercent: 0 }, 0.15);
            if (rest.length) arriving.fromTo(rest, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.5);
          }

          if (next && inner) {
            const leaving = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
            });
            leaving.to(inner, { scale: 0.9, borderRadius: 32 }, 0);
            leaving.to(scene.querySelector('.deck-dim'), { opacity: 0.6 }, 0);
          }
        });

        // Opening move: the first card grows to fill the screen as the section title gives way.
        const first = scenes[0];
        const firstInner = first?.querySelector('.deck-inner');
        if (first && firstInner) {
          const opening = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: '.deck-first',
              start: 'top top',
              // Finishes just before the next project starts to slide over.
              end: () => `+=${window.innerHeight * 1.4}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
          opening.fromTo(firstInner, { scale: introScale, y: '26vh', borderRadius: 44 }, { scale: 1, y: 0, borderRadius: 0, duration: 1 }, 0);
          opening.fromTo('.deck-heading', { scale: 1, autoAlpha: 1 }, { scale: 0.86, autoAlpha: 0, duration: 0.55 }, 0);
          const firstArt = first.querySelector('.deck-art');
          if (firstArt) opening.fromTo(firstArt, { yPercent: 16 }, { yPercent: 0, duration: 1 }, 0);
        }
      };

      media.add(LARGE, () => build(0.56));
      media.add(SMALL, () => build(0.82));
      return () => media.revert();
    },
    { scope: root, dependencies: [level] },
  );

  if (projects.length === 0) return null;
  const [first, ...rest] = projects;

  return (
    <section ref={root} id="work" className="deck relative z-10 bg-page">
      <div className="deck-first relative">
        <div className="deck-sticky">
          <header className="deck-heading wrap">
            {section.title ? <h2 className="t-hero">{section.title}</h2> : null}
            {section.subtitle ? <p className="t-lead muted mt-4 max-w-[30em]">{section.subtitle}</p> : null}
          </header>
          <div className="deck-scene deck-scene-first">
            <Scene project={first} index={0} total={projects.length} priority />
          </div>
        </div>
      </div>
      {rest.map((project, index) => (
        <div key={project.id} className="deck-scene sticky top-0 h-[100svh] overflow-hidden" style={{ zIndex: index + 2 }}>
          <Scene project={project} index={index + 1} total={projects.length} />
        </div>
      ))}
    </section>
  );
}
