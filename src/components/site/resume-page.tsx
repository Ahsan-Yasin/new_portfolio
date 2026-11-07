import { Download } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { safeHref, type Content } from '@/lib/content/schema';
import { publishedProjects } from '@/lib/content/select';
import { SiteLink } from './site-link';
import { PrintButton } from './small-client';
import './inner-pages.css';

/** Keeps the printed resume short. The order comes from the project list in the admin. */
const RESUME_PROJECTS = 6;

/** Places an element in the entrance sequence. The entrance is plain CSS, so printing and missing scripts can't interrupt it. */
const enter = (step: number) => ({ '--enter': step }) as CSSProperties;

function ResumeSection({ title, step, children }: { title: string; step: number; children: ReactNode }) {
  return (
    <section style={enter(step)} className="resume-enter grid-12 gap-y-4 border-t border-line py-[clamp(24px,3vw,40px)]">
      <h2 className="col-span-12 text-[1.0625rem] font-semibold tracking-[-0.012em] md:col-span-3">{title}</h2>
      <div className="col-span-12 md:col-span-9">{children}</div>
    </section>
  );
}

/** Generated from the same content as the rest of the site, and prints cleanly as a PDF. */
export function ResumePage({ content }: { content: Content }) {
  const { profile, experience, skills, about } = content;
  const contact = [profile.email, profile.phone, profile.location].filter(Boolean);
  const resumeHref = safeHref(profile.resumeFile);
  const work = publishedProjects(content).slice(0, RESUME_PROJECTS);

  return (
    <div className="resume-sheet sheet-hero pb-[clamp(56px,7vw,104px)] pt-[clamp(120px,16vh,168px)]">
      <div className="wrap">
        <header className="flex flex-wrap items-start justify-between gap-6 pb-[clamp(28px,3.5vw,48px)]">
          <div>
            <h1 style={enter(0)} className="resume-enter resume-name t-closing">
              {profile.name}
            </h1>
            <p style={enter(1)} className="resume-enter t-lead muted mt-2">
              {profile.role}
            </p>
            <p style={enter(2)} className="resume-enter t-small muted mt-3">
              {contact.join('  ·  ')}
            </p>
          </div>
          <div style={enter(2)} className="resume-enter no-print flex flex-wrap gap-2">
            {resumeHref ? (
              <a href={resumeHref} className="btn btn-primary btn-small">
                <Download size={15} aria-hidden />
                Download PDF
              </a>
            ) : null}
            <PrintButton label={resumeHref ? 'Print' : 'Print or save as PDF'} />
          </div>
        </header>

        {about.intro ? (
          <ResumeSection title="Profile" step={3}>
            <p className="max-w-[46em] text-pretty">{about.intro}</p>
          </ResumeSection>
        ) : null}

        {experience.length ? (
          <ResumeSection title="Experience" step={4}>
            <ol className="grid gap-6">
              {experience.map((job, index) => (
                <li key={job.id} style={enter(4.5 + Math.min(index, 5) * 0.5)} className="resume-enter resume-entry">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6">
                    <p className="font-semibold tracking-[-0.012em]">
                      {job.role}, {job.company}
                    </p>
                    <p className="t-small tabular-nums text-ink-3">{[job.start, job.end].filter(Boolean).join(' – ')}</p>
                  </div>
                  <p className="muted mt-1 max-w-[46em] text-pretty">{job.summary}</p>
                </li>
              ))}
            </ol>
          </ResumeSection>
        ) : null}

        {work.length ? (
          <ResumeSection title="Selected work" step={5}>
            <ul className="grid gap-5">
              {work.map((project) => (
                <li key={project.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6">
                    <SiteLink href={`/work/${project.slug}`} className="font-semibold tracking-[-0.012em] hover:underline">
                      {project.title}
                    </SiteLink>
                    <p className="t-small tabular-nums text-ink-3">{project.year}</p>
                  </div>
                  <p className="muted mt-1 max-w-[46em] text-pretty">{project.summary}</p>
                </li>
              ))}
            </ul>
          </ResumeSection>
        ) : null}

        {skills.length ? (
          <ResumeSection title="Skills" step={6}>
            <dl className="grid gap-3">
              {skills.map((group) => (
                <div key={group.id} className="grid gap-x-4 sm:grid-cols-[10rem_1fr]">
                  <dt className="font-medium">{group.title}</dt>
                  <dd className="muted">{group.items.join(', ')}</dd>
                </div>
              ))}
            </dl>
          </ResumeSection>
        ) : null}

        {about.education.length ? (
          <ResumeSection title="Education" step={7}>
            <ul className="grid gap-2">
              {about.education.map((item) => (
                <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-6">
                  <span>
                    <span className="font-medium">{item.school}</span>
                    <span className="muted">{item.degree ? `, ${item.degree}` : ''}</span>
                  </span>
                  <span className="t-small tabular-nums text-ink-3">{item.year}</span>
                </li>
              ))}
            </ul>
          </ResumeSection>
        ) : null}

        {about.awards.length ? (
          <ResumeSection title={about.awardsTitle || 'Recognition'} step={8}>
            <ul className="grid gap-2">
              {about.awards.map((award) => (
                <li key={award.id} className="flex flex-wrap items-baseline justify-between gap-x-6">
                  <span>
                    <span className="font-medium">{award.title}</span>
                    <span className="muted">{award.issuer ? `, ${award.issuer}` : ''}</span>
                  </span>
                  <span className="t-small tabular-nums text-ink-3">{award.year}</span>
                </li>
              ))}
            </ul>
          </ResumeSection>
        ) : null}
      </div>
    </div>
  );
}
