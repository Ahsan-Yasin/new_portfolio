import { ArrowUpRight } from 'lucide-react';
import { safeHref, type Content, type Project } from '@/lib/content/schema';
import { nextProject } from '@/lib/content/select';
import { Blocks, headingId } from './blocks';
import { CaseNav } from './case-nav';
import { ProjectCover } from './project-card';
import { SiteLink } from './site-link';

export function ProjectPage({ content, project }: { content: Content; project: Project }) {
  const next = nextProject(content, project.slug);
  const facts = [
    { label: 'Role', value: project.role },
    { label: 'Client', value: project.client },
    { label: 'Year', value: project.year },
    { label: 'Duration', value: project.duration },
    { label: 'Team', value: project.team },
  ].filter((fact) => fact.value);

  const sections = project.blocks.flatMap((block) =>
    block.type === 'heading' && block.text ? [{ id: headingId(block.text), label: block.text }] : [],
  );

  return (
    <article>
      <div aria-hidden className="progress-bar no-print fixed inset-x-0 top-0 z-[60] h-[2px] bg-accent" />

      <div className="wrap pt-[clamp(112px,15vh,160px)]">
        <SiteLink href="/#work" className="t-small muted hover:text-ink">
          ‹ All work
        </SiteLink>
        <h1 className="t-display mt-4 max-w-[17em]">{project.title}</h1>
        {project.summary ? <p className="t-lead muted mt-4 max-w-[34em]">{project.summary}</p> : null}
      </div>

      <div className="wrap mt-[clamp(32px,4vw,56px)]">
        <ProjectCover
          project={project}
          priority
          sizes="(max-width: 1400px) 92vw, 1320px"
          className="aspect-[5/3] md:aspect-[16/8.2]"
        />
      </div>

      <div className="wrap mt-[clamp(28px,3.5vw,48px)]">
        <dl className="grid grid-cols-2 gap-x-[clamp(12px,1.6vw,24px)] gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
          {facts.map((fact) => (
            <div key={fact.label} className="border-t border-line pt-3">
              <dt className="t-micro text-ink-3">{fact.label}</dt>
              <dd className="t-small mt-1 text-pretty">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {project.metrics.length ? (
          <dl className="mt-[clamp(44px,5.5vw,80px)] grid gap-x-[clamp(12px,1.6vw,24px)] gap-y-8 sm:grid-cols-3">
            {project.metrics.map((metric) => (
              <div key={metric.id}>
                <dd className="t-figure">{metric.value}</dd>
                <dt className="t-small muted mt-2">{metric.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}

        <Blocks blocks={project.blocks} />

        {project.links.length ? (
          <ul className="mt-[clamp(40px,5vw,72px)] flex flex-wrap gap-3">
            {project.links.map((link) => {
              const href = safeHref(link.url);
              return href ? (
                <li key={link.id}>
                  <a href={href} target="_blank" rel="noreferrer" className="btn btn-quiet">
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

      {next ? (
        <aside className="section">
          <div className="wrap">
            <p className="t-small muted mb-4">Next project</p>
            <SiteLink href={`/work/${next.slug}`} className="block">
              <ProjectCover project={next} sizes="(max-width: 1400px) 92vw, 1320px" className="aspect-[5/3] md:aspect-[16/7]" />
              <h2 className="t-title mt-5 max-w-[20em]">{next.title}</h2>
            </SiteLink>
          </div>
        </aside>
      ) : (
        <div className="section-tight" />
      )}

      <CaseNav items={sections} />
    </article>
  );
}
