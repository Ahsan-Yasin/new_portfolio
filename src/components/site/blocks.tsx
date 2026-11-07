import type { CSSProperties, ReactNode } from 'react';
import { CaseTilt } from '@/components/motion/case-tilt';
import { CaseWords } from '@/components/motion/case-words';
import type { Block, Metric } from '@/lib/content/schema';
import { Media } from './media';
import { Inline, RichText } from './rich-text';
import './inner-pages.css';

export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const counter = (value: number) => String(value).padStart(2, '0');

/** Numbers as loud as the page allows, each sized to fit its own row however long it is. They run up as they arrive. */
export function BigMetrics({ items, className = '' }: { items: Metric[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <dl className={className}>
      {items.map((item) => (
        <div key={item.id} className="case-metric">
          <dt className="case-metric-label t-lead muted text-pretty">
            <span aria-hidden data-rule className="case-rule absolute inset-x-0 top-0" />
            {item.label}
          </dt>
          <dd className="case-metric-value">
            <span data-count className="case-figure" style={{ '--chars': item.value.length } as CSSProperties}>
              {item.value}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Media wipes open while it levels out in 3D, and the picture itself drifts slowly inside its frame. */
function Figure({ block, narrow }: { block: Extract<Block, { type: 'media' }>; narrow: boolean }) {
  const full = block.size === 'full' && !narrow;
  const video = block.media.kind === 'video';
  // Anything touching the edge of its frame needs spare picture, so the drift never exposes an edge.
  const flush = full || video;
  const placement = full
    ? 'relative left-1/2 col-span-12 w-screen -translate-x-1/2'
    : block.size === 'inset' && !narrow
      ? 'col-span-12 md:col-span-8 md:col-start-5'
      : 'col-span-12';
  const sizes = full
    ? '100vw'
    : narrow
      ? '(max-width: 768px) 92vw, 720px'
      : block.size === 'inset'
        ? '(max-width: 768px) 92vw, 880px'
        : '(max-width: 1400px) 92vw, 1320px';
  const padding = flush ? 0 : narrow ? 'clamp(12px, 2vw, 28px)' : 'clamp(16px, 3vw, 44px)';

  return (
    <figure className={`${placement} mt-[clamp(48px,6.5vw,104px)]`}>
      <CaseTilt>
        <div
          data-media
          className={`overflow-hidden ${full ? '' : 'rounded-large'}`}
          style={{ background: block.color || (full ? undefined : 'var(--well)') }}
        >
          <div style={{ padding }}>
            {flush ? (
              <div className="case-overscan">
                <div data-parallax="4">
                  <Media media={block.media} sizes={sizes} />
                </div>
              </div>
            ) : (
              <div data-parallax="4" className="mx-auto max-w-[1040px]">
                <Media media={block.media} sizes={sizes} />
              </div>
            )}
          </div>
        </div>
      </CaseTilt>
      {block.caption ? (
        <figcaption data-fade className={`t-small muted mt-3 text-pretty ${full ? 'wrap' : ''}`}>
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Lead({ text, narrow, className }: { text: string; narrow: boolean; className: string }) {
  const [lead, ...rest] = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!lead) return null;

  // On a reading page the words finish lighting before the eye gets to them.
  const words: { start?: string; end?: string } = narrow ? { start: 'top 92%', end: 'bottom 74%' } : {};
  return (
    <div className={className}>
      <CaseWords {...words}>
        <RichText text={lead} className={narrow ? '' : 'case-lead'} />
      </CaseWords>
      {rest.length ? (
        <div data-fade className={narrow ? 'mt-[1.1em]' : 'mt-[clamp(28px,3.5vw,48px)] max-w-[38em]'}>
          <RichText text={rest.join('\n\n')} />
        </div>
      ) : null}
    </div>
  );
}

const GALLERY_DRIFT = ['3', '-3', '5'];

/**
 * Lays case studies and posts out on the site's 12-column grid. Headings run the full
 * width, the first paragraph after each one lights up word by word, and media can break
 * out wider. With `narrow`, everything runs in one reading column at a calmer scale.
 */
export function Blocks({ blocks, narrow = false }: { blocks: Block[]; narrow?: boolean }) {
  const textColumn = narrow ? 'col-span-12' : 'col-span-12 md:col-span-9 md:col-start-3 lg:col-span-7 lg:col-start-3';
  const leadColumn = narrow ? 'col-span-12' : 'col-span-12 md:col-span-10 md:col-start-3';

  return (
    <div className="grid-12">
      {blocks.map((block, index): ReactNode => {
        const followsHeading = blocks[index - 1]?.type === 'heading';

        switch (block.type) {
          case 'heading':
            return (
              <div key={block.id} className={`relative col-span-12 ${narrow ? 'mt-[clamp(48px,6vw,80px)]' : 'case-block-head'}`}>
                {narrow ? null : (
                  <>
                    <span aria-hidden data-rule className="case-rule absolute inset-x-0 top-0" />
                    <span aria-hidden className="case-block-index t-small">
                      {counter(blocks.slice(0, index + 1).filter((item) => item.type === 'heading').length)}
                    </span>
                  </>
                )}
                <h2 id={headingId(block.text)} data-lines className={`${narrow ? 't-title' : 't-hero'} scroll-mt-28`}>
                  {block.text}
                </h2>
              </div>
            );
          case 'text':
            return followsHeading ? (
              <Lead
                key={block.id}
                text={block.text}
                narrow={narrow}
                className={`${leadColumn} ${narrow ? 'mt-5' : 'mt-[clamp(28px,4vw,64px)]'}`}
              />
            ) : (
              <div key={block.id} data-fade className={`${textColumn} ${index === 0 ? '' : 'mt-[clamp(24px,3vw,40px)]'}`}>
                <RichText text={block.text} />
              </div>
            );
          case 'media':
            return block.media.src ? <Figure key={block.id} block={block} narrow={narrow} /> : null;
          case 'gallery': {
            const items = block.items.filter((item) => item.src);
            if (items.length === 0) return null;
            return (
              <figure key={block.id} className="col-span-12 mt-[clamp(48px,6.5vw,104px)]">
                <div className={`grid gap-4 ${items.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  {items.map((item, itemIndex) => (
                    <div key={itemIndex} data-parallax={GALLERY_DRIFT[itemIndex % GALLERY_DRIFT.length]}>
                      <div data-media className="overflow-hidden rounded-large bg-well">
                        <div>
                          <Media media={item} sizes="(max-width: 640px) 92vw, 440px" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {block.caption ? (
                  <figcaption data-fade className="t-small muted mt-3">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          }
          case 'quote':
            return (
              <blockquote key={block.id} className="col-span-12 mt-[clamp(72px,10vw,168px)]">
                <CaseWords dim={0.12} start="top 86%" end={narrow ? 'bottom 72%' : 'bottom 52%'} className={narrow ? 't-title' : 'case-quote'}>
                  <p>“{block.text}”</p>
                </CaseWords>
                {block.cite ? (
                  <footer data-fade className="t-lead muted mt-[clamp(16px,2vw,28px)]">
                    {block.cite}
                  </footer>
                ) : null}
              </blockquote>
            );
          case 'metrics':
            return <BigMetrics key={block.id} items={block.items} className="col-span-12 mt-[clamp(56px,7.5vw,120px)]" />;
          case 'list':
            return (
              <div key={block.id} className={`${textColumn} mt-[clamp(40px,5vw,72px)]`}>
                {block.title ? (
                  <h3 data-fade className="t-card mb-[clamp(16px,2vw,28px)]">
                    {block.title}
                  </h3>
                ) : null}
                <ul data-stagger>
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="case-list-item">
                      <span aria-hidden data-rule className="case-rule absolute inset-x-0 top-0" />
                      <span aria-hidden className="t-small pt-[0.2em] tabular-nums text-ink-3">
                        {counter(itemIndex + 1)}
                      </span>
                      <span className={`text-pretty ${narrow ? '' : 'case-list-text'}`}>
                        <Inline text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
