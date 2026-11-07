import { safeHref, type Content } from '@/lib/content/schema';
import { Media } from './media';
import { ContactBand } from './home-page';
import { RichText, ToneText } from './rich-text';

export function AboutPage({ content }: { content: Content }) {
  const { about } = content;
  return (
    <>
      <section className="sheet-hero">
        <div className="wrap pb-[clamp(56px,7vw,104px)] pt-[clamp(128px,18vh,180px)]">
          <h1 className="t-display max-w-[16em]">
            <ToneText text={about.headline} />
          </h1>
          <div className="grid-12 mt-[clamp(40px,5vw,72px)] gap-y-10">
            {about.portrait.src ? (
              <div className="relative col-span-12 aspect-[4/5] overflow-hidden rounded-large bg-well md:col-span-4">
                <Media media={about.portrait} fill sizes="(max-width: 768px) 92vw, 440px" priority />
              </div>
            ) : null}
            <div className={`col-span-12 ${about.portrait.src ? 'md:col-span-7 md:col-start-6' : 'md:col-span-7 md:col-start-5'}`}>
              {about.intro ? <p className="t-subtitle text-balance">{about.intro}</p> : null}
              {about.body ? <RichText text={about.body} className="muted mt-6" /> : null}
              {about.facts.length ? (
                <dl className="mt-10 grid grid-cols-2 gap-x-[clamp(12px,1.6vw,24px)] gap-y-5 lg:grid-cols-3">
                  {about.facts.map((fact) => (
                    <div key={fact.id} className="border-t border-line pt-3">
                      <dt className="t-micro text-ink-3">{fact.label}</dt>
                      <dd className="t-small mt-1 text-pretty">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {about.principles.length ? (
        <section className="section">
          <div className="wrap grid-12 gap-y-8">
            <h2 className="t-title col-span-12 md:col-span-4">{about.principlesTitle}</h2>
            <ol className="col-span-12 md:col-span-7 md:col-start-6">
              {about.principles.map((principle) => (
                <li key={principle.id} className="border-t border-line py-[clamp(18px,2vw,26px)]">
                  <h3 className="t-card">{principle.title}</h3>
                  <p className="muted mt-2 text-pretty">{principle.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {about.awards.length ? (
        <section className="section-tight">
          <div className="wrap grid-12 gap-y-6">
            <h2 className="t-subtitle col-span-12 md:col-span-4">{about.awardsTitle}</h2>
            <ul className="col-span-12 md:col-span-7 md:col-start-6">
              {about.awards.map((award) => {
                const href = safeHref(award.url);
                const inner = (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{award.title}</span>
                      {award.issuer ? <span className="muted block">{award.issuer}</span> : null}
                    </span>
                    <span className="t-small flex-none tabular-nums text-ink-3">{award.year}</span>
                  </>
                );
                return (
                  <li key={award.id} className="border-t border-line">
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer" className="flex justify-between gap-6 py-4 hover:opacity-70">
                        {inner}
                      </a>
                    ) : (
                      <div className="flex justify-between gap-6 py-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <ContactBand content={content} />
    </>
  );
}
