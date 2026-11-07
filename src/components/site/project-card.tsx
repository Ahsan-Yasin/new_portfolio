import { ArrowUpRight } from 'lucide-react';
import { ViewTransition, type CSSProperties } from 'react';
import type { Project } from '@/lib/content/schema';
import { Media } from './media';
import { SiteLink } from './site-link';

/** The coloured field behind a project's art. The same element morphs into the case study's hero. */
export function ProjectCover({
  project,
  sizes,
  priority,
  className = '',
  style,
}: {
  project: Project;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const cover = project.coverFit === 'cover';
  return (
    <ViewTransition name={`cover-${project.id}`} share="morph" default="none">
      <div className={`work-media ${className}`} style={{ background: project.color, ...style }}>
        {project.cover.src ? (
          <Media
            media={project.cover}
            fill
            fit={project.coverFit}
            position={cover ? 'center' : 'center bottom'}
            sizes={sizes}
            priority={priority}
          />
        ) : null}
        <span
          className="work-arrow absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#1d1d1f]"
          aria-hidden
        >
          <ArrowUpRight size={19} />
        </span>
      </div>
    </ViewTransition>
  );
}

export function ProjectCard({ project, large, priority }: { project: Project; large?: boolean; priority?: boolean }) {
  const metric = project.metrics[0];
  const meta = [project.year, project.role].filter(Boolean).join(' · ');
  return (
    <SiteLink href={`/work/${project.slug}`} className="block">
      <div className="settle">
        <ProjectCover
          project={project}
          priority={priority}
          sizes={large ? '(max-width: 1400px) 92vw, 1320px' : '(max-width: 768px) 92vw, 660px'}
          className={large ? 'aspect-[5/3] md:aspect-[16/8.2]' : 'aspect-[5/3]'}
        />
      </div>
      <div className={`mt-5 ${large ? 'grid-12 gap-y-3' : ''}`}>
        <div className={large ? 'col-span-12 md:col-span-7' : ''}>
          <h3 className="t-card">{project.title}</h3>
          {project.summary ? <p className="muted mt-2 max-w-[38em] text-pretty">{project.summary}</p> : null}
        </div>
        <div className={`t-small ${large ? 'col-span-12 md:col-span-4 md:col-start-9 md:text-right' : 'mt-3'}`}>
          {meta ? <p className="text-ink-3">{meta}</p> : null}
          {metric?.value ? (
            <p className="mt-0.5">
              <span className="font-semibold tabular-nums">{metric.value}</span>{' '}
              <span className="muted">{metric.label.toLowerCase()}</span>
            </p>
          ) : null}
        </div>
      </div>
    </SiteLink>
  );
}
