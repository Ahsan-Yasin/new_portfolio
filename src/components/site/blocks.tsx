import type { Block } from '@/lib/content/schema';
import { Media } from './media';
import { Inline, RichText } from './rich-text';

export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function Figure({ block }: { block: Extract<Block, { type: 'media' }> }) {
  const full = block.size === 'full';
  const placement =
    block.size === 'inset'
      ? 'col-span-12 md:col-span-8 md:col-start-5'
      : 'col-span-12';
  const sizes = block.size === 'inset' ? '(max-width: 768px) 92vw, 880px' : '(max-width: 1400px) 92vw, 1320px';

  if (full) {
    return (
      <figure className="relative left-1/2 col-span-12 mt-[clamp(40px,5vw,72px)] w-screen -translate-x-1/2">
        <div style={{ background: block.color || undefined }}>
          <Media media={block.media} sizes="100vw" />
        </div>
        {block.caption ? <figcaption className="t-small muted wrap mt-3">{block.caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className={`${placement} mt-[clamp(40px,5vw,72px)]`}>
      <div
        className="overflow-hidden rounded-large"
        style={{
          background: block.color || 'var(--well)',
          padding: block.media.kind === 'video' ? 0 : 'clamp(16px, 3vw, 44px)',
        }}
      >
        <div className={block.media.kind === 'video' ? '' : 'mx-auto max-w-[1040px]'}>
          <Media media={block.media} sizes={sizes} />
        </div>
      </div>
      {block.caption ? <figcaption className="t-small muted mt-3 text-pretty">{block.caption}</figcaption> : null}
    </figure>
  );
}

/**
 * Lays case studies and posts out on the site's 12-column grid: headings hang in
 * the left margin, reading text sits to their right, and media can break out wider.
 * With `narrow`, everything runs in one reading column instead.
 */
export function Blocks({ blocks, narrow = false }: { blocks: Block[]; narrow?: boolean }) {
  const textColumn = narrow ? 'col-span-12' : 'col-span-12 md:col-span-7 md:col-start-5';

  return (
    <div className="grid-12">
      {blocks.map((block, index) => {
        const previous = blocks[index - 1];
        const followsHeading = previous?.type === 'heading';

        switch (block.type) {
          case 'heading':
            return (
              <h2
                key={block.id}
                id={headingId(block.text)}
                className={`t-subtitle scroll-mt-28 mt-[clamp(56px,7.5vw,112px)] ${narrow ? 'col-span-12' : 'col-span-12 md:col-span-4 md:pr-6'}`}
              >
                {block.text}
              </h2>
            );
          case 'text':
            return (
              <div
                key={block.id}
                className={`${textColumn} ${followsHeading ? (narrow ? 'mt-4' : 'mt-4 md:mt-[clamp(56px,7.5vw,112px)]') : index === 0 ? '' : 'mt-[clamp(24px,3vw,40px)]'}`}
              >
                <RichText text={block.text} />
              </div>
            );
          case 'media':
            if (!block.media.src) return null;
            return narrow ? (
              <figure key={block.id} className="col-span-12 mt-[clamp(32px,4vw,48px)]">
                <div className="overflow-hidden rounded-large" style={{ background: block.color || 'var(--well)', padding: 'clamp(12px, 2vw, 28px)' }}>
                  <Media media={block.media} sizes="(max-width: 768px) 92vw, 760px" />
                </div>
                {block.caption ? <figcaption className="t-small muted mt-3">{block.caption}</figcaption> : null}
              </figure>
            ) : (
              <Figure key={block.id} block={block} />
            );
          case 'gallery': {
            const items = block.items.filter((item) => item.src);
            if (items.length === 0) return null;
            return (
              <figure key={block.id} className="col-span-12 mt-[clamp(40px,5vw,72px)]">
                <div className={`grid gap-3 ${items.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  {items.map((item, itemIndex) => (
                    <div key={itemIndex} className="overflow-hidden rounded-large bg-well">
                      <Media media={item} sizes="(max-width: 640px) 92vw, 440px" />
                    </div>
                  ))}
                </div>
                {block.caption ? <figcaption className="t-small muted mt-3">{block.caption}</figcaption> : null}
              </figure>
            );
          }
          case 'quote':
            return (
              <blockquote key={block.id} className={`${textColumn} mt-[clamp(40px,5vw,72px)]`}>
                <p className="t-subtitle">“{block.text}”</p>
                {block.cite ? <footer className="t-small muted mt-3">{block.cite}</footer> : null}
              </blockquote>
            );
          case 'metrics':
            return (
              <dl key={block.id} className="col-span-12 mt-[clamp(40px,5vw,72px)] grid gap-x-[clamp(12px,1.6vw,24px)] gap-y-6 sm:grid-cols-3">
                {block.items.map((item) => (
                  <div key={item.id} className="border-t border-line pt-3">
                    <dd className="t-figure">{item.value}</dd>
                    <dt className="t-small muted mt-2">{item.label}</dt>
                  </div>
                ))}
              </dl>
            );
          case 'list':
            return (
              <div key={block.id} className={`${textColumn} mt-[clamp(24px,3vw,40px)]`}>
                {block.title ? <h3 className="mb-3 font-semibold tracking-[-0.012em]">{block.title}</h3> : null}
                <ul>
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="border-t border-line py-3 text-pretty">
                      <Inline text={item} />
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
