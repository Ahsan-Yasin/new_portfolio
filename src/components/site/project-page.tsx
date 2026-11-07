import { ArrowUpRight } from 'lucide-react';
import { ViewTransition, type CSSProperties, type ReactNode } from 'react';
import { CaseNextScene } from '@/components/motion/case-next';
import { CaseProgress } from '@/components/motion/case-progress';
import { CaseStage } from '@/components/motion/case-stage';
import { CaseWords } from '@/components/motion/case-words';
import { PageMotion } from '@/components/motion/page-motion';
import { CoverWindow } from '@/components/motion/work-deck';
import { safeHref, type Content, type Project } from '@/lib/content/schema';
import { nextProject } from '@/lib/content/select';
import { BigMetrics, Blocks, headingId } from './blocks';
import { CaseNav } from './case-nav';
import { Media } from './media';
import { SiteLink } from './site-link';
import '@/components/motion/work-deck.css';
import './inner-pages.css';

/** Very long titles step down, so a title and its art always share one screen. */
function titleLength(title: string) {
  if (title.length > 130) return 'longest';
  return title.length > 70 ? 'long' : undefined;
}

/**
 * A project's full-screen lit room. The hero of a case study and the "next project" panel of
 * the one before it share this layout, and the ViewTransition, so following that link feels
 * like one continuous move. The home page's scenes and other cards morph into it too.
 */
function ProjectField({ project, kicker, hero = false }: { project: Project; kicker: ReactNode; hero?: boolean }) {
  const meta = [project.client, project.year, project.role].filter(Boolean).join(' · ');
  const length = titleLength(project.title);
  const video = project.coverVideo?.src && project.coverVideo.kind === 'video' ? project.coverVideo : null;
  const still = project.cover.src ? (
    <Media
      media={project.cover}
      fill
      fit={project.coverFit}
      position={project.coverFit === 'cover' ? 'center' : 'center bottom'}
      sizes="(max-width: 599px) 140vw, 90vw"
      priority={hero}
    />
  ) : null;
  const art = video ? <CoverWindow video={video} title={project.title} still={still} /> : still;

  return (
    <ViewTransition name={`cover-${project.id}`} share="morph" default="none">
      <div className="case-field lit" style={{ '--c': project.color } as CSSProperties}>
        <div className="wrap case-copy">
          <div {...(hero ? { 'data-load': '0.3' } : {})} className="case-bar t-small">
            {kicker}
            <span aria-hidden className="lit-rule" />
            {meta ? <span>{meta}</span> : null}
          </div>
          {hero ? (
            <h1 data-lines="load" data-delay="0.12" data-length={length} className="case-title">
              {project.title}
            </h1>
          ) : (
            <h2 data-length={length} className="case-title">
              {project.title}
            </h2>
          )}
        </div>
        <div className="case-art" data-fit={video ? 'contain' : project.coverFit}>
          <div aria-hidden className="lit-wall" />
          {art ? (
            <div className="case-art-scrub">
              <div className="case-art-rise">
                <div className="case-art-lean">{art}</div>
              </div>
            </div>
          ) : null}
        </div>
        <div aria-hidden className="case-dim" />
      </div>
    </ViewTransition>
  );
}

/** The project's tags, running past at display size. Without full motion they simply sit in a row. */
function TagMarquee({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  const characters = tags.reduce((sum, tag) => sum + tag.length + 3, 0);
  // Enough copies to fill a wide screen even when there's only one short tag.
  const copies = Math.max(2, Math.ceil(90 / characters) + 1);
  const style = { '--marquee-time': `${Math.max(16, characters * 0.9)}s` } as CSSProperties;

  return (
    <div className="case-marquee" style={style}>
      {Array.from({ length: copies }, (_, copy) => (
        <ul key={copy} aria-hidden={copy > 0 || undefined} className="case-marquee-group">
          {tags.map((tag) => (
            <li key={tag} className="case-marquee-item">
              {tag}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export function ProjectPage({ content, project }: { content: Content; project: Project }) {
  const next = nextProject(content, project.slug);
  const facts = [
    { label: 'Role', value: project.role },
    { label: 'For', value: project.client },
    { label: 'Year', value: project.year },
    { label: 'Duration', value: project.duration },
    { label: 'Team', value: project.team },
  ].filter((fact) => fact.value);

  const sections = project.blocks.flatMap((block) => {
    const id = block.type === 'heading' ? headingId(block.text) : '';
    return block.type === 'heading' && id ? [{ id, label: block.text }] : [];
  });

  return (
    <article>
      <PageMotion />
      <CaseProgress endTrigger="#case-end" />

      <CaseStage>
        <div className="case-hero">
          <ProjectField
            project={project}
            hero
            kicker={
              <SiteLink href="/#work" className="case-back">
                ‹ All work
              </SiteLink>
            }
          />
        </div>

        <div className="case-sheet">
          <div className="wrap">
            {project.summary ? (
              <CaseWords start="top 94%" end="bottom 62%" className="case-lead mb-[clamp(40px,5.5vw,88px)] max-w-[24em]">
                <p>{project.summary}</p>
              </CaseWords>
            ) : null}

            {facts.length ? (
              <dl className="grid grid-cols-2 gap-x-[clamp(12px,1.6vw,24px)] gap-y-[clamp(20px,2.4vw,32px)] sm:grid-cols-3 lg:grid-cols-5">
                {facts.map((fact) => (
                  <div key={fact.label} className="relative pt-3.5">
                    <dt className="t-micro text-ink-3">
                      <span aria-hidden data-rule className="case-rule absolute inset-x-0 top-0" />
                      {fact.label}
                    </dt>
                    <dd data-fade className="t-lead mt-1.5 text-pretty">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <BigMetrics items={project.metrics} className="mt-[clamp(56px,7.5vw,120px)]" />
          </div>

          <TagMarquee tags={project.tags} />

          <div className="wrap">
            <Blocks blocks={project.blocks} />

            {project.links.length ? (
              <ul data-stagger className="mt-[clamp(48px,6vw,88px)] flex flex-wrap gap-3">
                {project.links.map((link) => {
                  const href = safeHref(link.url);
                  return href ? (
                    <li key={link.id}>
                      <a href={href} target="_blank" rel="noreferrer" data-magnetic className="btn btn-quiet">
                        {link.label}
                        <ArrowUpRight size={16} aria-hidden />
                      </a>
                    </li>
                  ) : null;
                })}
              </ul>
            ) : null}
          </div>

          <div id="case-end" />
        </div>
      </CaseStage>

      {next ? (
        <CaseNextScene>
          <SiteLink href={`/work/${next.slug}`} data-cursor="Next project" className="case-next-link">
            <ProjectField project={next} kicker={<span className="font-semibold">Next project</span>} />
          </SiteLink>
        </CaseNextScene>
      ) : null}

      <CaseNav items={sections} />
    </article>
  );
}
