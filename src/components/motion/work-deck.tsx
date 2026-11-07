'use client';

import { ArrowUpRight } from 'lucide-react';
import { ViewTransition, useRef, type CSSProperties, type ReactNode } from 'react';
import type { Media as MediaData, Project, Section } from '@/lib/content/schema';
import { Media } from '@/components/site/media';
import { SiteLink } from '@/components/site/site-link';
import { gsap, LARGE, SMALL, useGSAP } from './gsap';
import { LoopVideo } from './loop-video';
import { useMotionLevel } from './motion-provider';
import './work-deck.css';

/** Very long titles step down, so a title and its art always share one screen. */
function titleLength(title: string) {
  if (title.length > 90) return 'longest';
  return title.length > 48 ? 'long' : undefined;
}

function longestWord(text: string) {
  return Math.max(...text.split(/\s+/).map((word) => word.length));
}

/**
 * A full-page recording in a browser window that rises from the stage's sill and is cropped
 * by it. Reduced motion swaps it for the still cover in CSS alone, so nothing depends on render.
 */
export function CoverWindow({ video, title, still }: { video: MediaData; title: string; still: ReactNode }) {
  const ratio = video.width && video.height ? video.width / video.height : 1.6;

  return (
    <>
      <div className="lit-window" style={{ '--ratio': ratio } as CSSProperties}>
        <div aria-hidden className="lit-window-bar">
          <i />
          <i />
          <i />
          <span>{title}</span>
        </div>
        <LoopVideo className="lit-window-video" src={video.src} poster={video.poster || undefined} aria-label={video.alt || undefined} />
      </div>
      <div className="lit-still">{still}</div>
    </>
  );
}

function Scene({ project, index, total, priority }: { project: Project; index: number; total: number; priority?: boolean }) {
  const metric = project.metrics.find((item) => item.value);
  const facts = [project.client, project.year].filter(Boolean).join(' · ');
  const number = String(index + 1).padStart(2, '0');
  const style = { '--c': project.color } as CSSProperties;
  const video = project.coverVideo?.src && project.coverVideo.kind === 'video' ? project.coverVideo : null;
  const still = project.cover.src ? (
    <Media
      media={project.cover}
      fill
      fit={project.coverFit}
      position={project.coverFit === 'cover' ? 'center' : 'center bottom'}
      sizes="(max-width: 599px) 140vw, 80vw"
      priority={priority}
    />
  ) : null;

  return (
    <ViewTransition name={`cover-${project.id}`} share="morph" default="none">
      <div className="deck-inner lit" style={style}>
        <SiteLink href={`/work/${project.slug}`} data-cursor="View project" className="deck-link" aria-label={project.title}>
          <div className="wrap deck-copy">
            <div className="deck-meta deck-rail t-small">
              <span className="deck-index">
                {number} / {String(total).padStart(2, '0')}
              </span>
              <span aria-hidden className="lit-rule" />
              {facts ? <span>{facts}</span> : null}
            </div>
            <div className="deck-head">
              <h3 className="deck-title" data-length={titleLength(project.title)}>
                {project.title}
              </h3>
              {project.summary || project.tags.length ? (
                <div className="deck-about">
                  {project.summary ? <p className="deck-summary">{project.summary}</p> : null}
                  {project.tags.length ? (
                    <ul className="deck-meta deck-tags">
                      {project.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <div className="deck-stage">
            <div aria-hidden className="lit-wall" />
            {video ? (
              <div className="deck-art" data-fit="contain">
                <CoverWindow video={video} title={project.title} still={still} />
              </div>
            ) : still ? (
              <div className="deck-art" data-fit={project.coverFit}>
                {still}
              </div>
            ) : (
              <span aria-hidden className="deck-numeral">
                {number}
              </span>
            )}
            <div className="deck-plates">
              {metric ? (
                <div className="deck-metric lit-plate">
                  <div className="deck-metric-fit">
                    <p className="deck-metric-value" style={{ '--chars': longestWord(metric.value) } as CSSProperties}>
                      {metric.value}
                    </p>
                    {metric.label ? <p className="deck-metric-label">{metric.label}</p> : null}
                  </div>
                </div>
              ) : null}
              <span aria-hidden className="deck-go">
                View project
                <ArrowUpRight size={18} />
              </span>
            </div>
          </div>
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
        <div
          key={project.id}
          className={`deck-scene sticky top-0 h-[100svh] overflow-hidden${index === 0 ? ' deck-scene-linger' : ''}`}
          style={{ zIndex: index + 2 }}
        >
          <Scene project={project} index={index + 1} total={projects.length} />
        </div>
      ))}
    </section>
  );
}
