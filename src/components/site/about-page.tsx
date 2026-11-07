import { CaseCards } from '@/components/motion/case-cards';
import { CasePortrait } from '@/components/motion/case-portrait';
import { CasePrinciples } from '@/components/motion/case-principles';
import { CaseWords } from '@/components/motion/case-words';
import { PageMotion } from '@/components/motion/page-motion';
import { safeHref, type Content } from '@/lib/content/schema';
import { initials } from '@/lib/content/select';
import { ContactBand } from './home-page';
import { Media } from './media';
import { RichText, ToneText } from './rich-text';
import './inner-pages.css';

const NUMERAL_FILTER = 'principles-melt';
const counter = (value: number) => String(value + 1).padStart(2, '0');

/** Falls back to the profile photo, and then to a black card with initials, so the page always keeps its centrepiece. */
function PortraitCard({ content }: { content: Content }) {
  const { about, profile } = content;
  const media = about.portrait.src ? about.portrait : profile.avatar;
  return (
    <div className="about-perspective">
      <div className="about-card">
        {media.src ? (
          <div data-parallax="6" className="about-card-picture">
            <Media media={media} fill position="center top" sizes="(max-width: 900px) 82vw, 520px" priority />
          </div>
        ) : (
          <div aria-hidden className="about-card-blank">
            <span className="t-small">{profile.role}</span>
            <span className="about-card-initials">{initials(profile.name)}</span>
          </div>
        )}
        <span aria-hidden className="about-card-shine" />
      </div>
    </div>
  );
}

function Principles({ content }: { content: Content }) {
  const { about } = content;
  if (about.principles.length === 0) return null;
  return (
    <CasePrinciples filterId={NUMERAL_FILTER} className="principles on-inverse">
      <div className="wrap">
        {about.principlesTitle ? (
          <h2 data-lines className="t-hero max-w-[14em]">
            {about.principlesTitle}
          </h2>
        ) : null}
        <div className="principles-grid">
          <div aria-hidden className="principles-pin">
            <svg width="0" height="0" className="absolute">
              <defs>
                <filter id={NUMERAL_FILTER}>
                  <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
                </filter>
              </defs>
            </svg>
            <div className="principles-stack">
              {about.principles.map((principle, index) => (
                <span key={principle.id} className="principles-num">
                  {counter(index)}
                </span>
              ))}
            </div>
          </div>
          <ol className="principles-list">
            {about.principles.map((principle, index) => (
              <li key={principle.id} className="principle">
                <span aria-hidden data-rule className="case-rule absolute inset-x-0 top-0" />
                <span aria-hidden className="principle-index">
                  {counter(index)}
                </span>
                <div>
                  <h3 data-lines className="t-title">
                    {principle.title}
                  </h3>
                  {principle.text ? (
                    <p data-fade className="t-lead mt-[clamp(12px,1.4vw,20px)] max-w-[30em] text-on-inverse-2">
                      {principle.text}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </CasePrinciples>
  );
}

function Awards({ content }: { content: Content }) {
  const { about } = content;
  if (about.awards.length === 0) return null;
  return (
    <section className="about-awards">
      <div className="wrap">
        {about.awardsTitle ? (
          <h2 data-lines className="t-hero mb-[clamp(32px,4.5vw,64px)]">
            {about.awardsTitle}
          </h2>
        ) : null}
        <CaseCards className="grid gap-[clamp(12px,1.4vw,20px)] sm:grid-cols-2 lg:grid-cols-3">
          {about.awards.map((award) => {
            const href = safeHref(award.url);
            const inner = (
              <>
                <span className="award-year">{award.year}</span>
                <span>
                  <span className="t-card block">{award.title}</span>
                  {award.issuer ? <span className="t-small mt-1.5 block text-[#a8a498]">{award.issuer}</span> : null}
                </span>
              </>
            );
            return (
              <div key={award.id} className="award-slot">
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="award-card">
                    {inner}
                  </a>
                ) : (
                  <div className="award-card">{inner}</div>
                )}
              </div>
            );
          })}
        </CaseCards>
      </div>
    </section>
  );
}

export function AboutPage({ content }: { content: Content }) {
  const { about } = content;
  return (
    <>
      <PageMotion />

      <section className="about-open wrap">
        <h1 data-lines="load" className="t-closing">
          <ToneText text={about.headline} />
        </h1>
      </section>

      <CasePortrait className="about-story wrap grid-12">
        <div className="about-portrait-col">
          <PortraitCard content={content} />
        </div>
        <div className="about-text-col">
          {about.intro ? (
            <CaseWords className="case-lead">
              <p>{about.intro}</p>
            </CaseWords>
          ) : null}
          {about.body ? (
            <CaseWords className="mt-[clamp(32px,4vw,64px)]">
              <RichText text={about.body} className="about-body" />
            </CaseWords>
          ) : null}
          {about.facts.length ? (
            <dl className="mt-[clamp(48px,6vw,88px)] grid grid-cols-2 gap-x-[clamp(12px,1.6vw,24px)] gap-y-6 lg:grid-cols-3">
              {about.facts.map((fact) => (
                <div key={fact.id} className="relative pt-3.5">
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
        </div>
      </CasePortrait>

      <Principles content={content} />
      <Awards content={content} />
      <ContactBand content={content} />
    </>
  );
}
