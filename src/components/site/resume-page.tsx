import { Download } from 'lucide-react';
import { safeHref, type Content } from '@/lib/content/schema';
import { PrintButton } from './small-client';

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid-12 gap-y-4 border-t border-line py-[clamp(24px,3vw,40px)]">
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

  return (
    <div className="resume-sheet sheet-hero pb-[clamp(56px,7vw,104px)] pt-[clamp(120px,16vh,168px)]">
      <div className="wrap">
        <header className="flex flex-wrap items-start justify-between gap-6 pb-[clamp(28px,3.5vw,48px)]">
          <div>
            <h1 className="t-display">{profile.name}</h1>
            <p className="t-lead muted mt-2">{profile.role}</p>
            <p className="t-small muted mt-3">{contact.join('  ·  ')}</p>
          </div>
          <div className="no-print flex flex-wrap gap-2">
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
          <ResumeSection title="Profile">
            <p className="max-w-[46em] text-pretty">{about.intro}</p>
          </ResumeSection>
        ) : null}

        {experience.length ? (
          <ResumeSection title="Experience">
            <ol className="grid gap-6">
              {experience.map((job) => (
                <li key={job.id} className="resume-entry">
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

        {skills.length ? (
          <ResumeSection title="Skills">
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
          <ResumeSection title="Education">
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
          <ResumeSection title={about.awardsTitle || 'Recognition'}>
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
