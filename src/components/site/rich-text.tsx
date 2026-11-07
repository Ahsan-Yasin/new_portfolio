import { Fragment, type ReactNode } from 'react';
import { safeHref } from '@/lib/content/schema';

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;

/** Renders **bold**, *italic* and [links](url) as React elements, so stored text can never inject markup. */
export function Inline({ text }: { text: string }): ReactNode {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return <Fragment key={index}>{link[1]}</Fragment>;
      const external = /^https?:/.test(href);
      return (
        <a key={index} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
          {link[1]}
        </a>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

/** Paragraphs split on blank lines. */
export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  return (
    <div className={`prose-block ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>
          <Inline text={paragraph} />
        </p>
      ))}
    </div>
  );
}

/** Headings where *asterisks* mark the quieter half of a two-tone line. */
export function ToneText({ text }: { text: string }): ReactNode {
  return text.split(/(\*[^*]+\*)/g).map((part, index) =>
    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
      <span key={index} className="tone">
        {part.slice(1, -1)}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
