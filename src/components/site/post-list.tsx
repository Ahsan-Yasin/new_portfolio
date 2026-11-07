'use client';

import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useState } from 'react';
import type { Media as MediaData } from '@/lib/content/schema';
import { Media } from './media';
import { SiteLink } from './site-link';

export type PostRow = {
  id: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  readTime: string;
  href: string;
  external: boolean;
  cover: MediaData;
};

/** Rows on a single sheet. On pointer devices a preview of each post follows the cursor. */
export function PostList({ posts }: { posts: PostRow[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const followX = useSpring(x, { stiffness: 320, damping: 34, mass: 0.6 });
  const followY = useSpring(y, { stiffness: 320, damping: 34, mass: 0.6 });
  const active = posts.find((post) => post.id === activeId);

  const track = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    x.set(event.clientX + 24);
    y.set(event.clientY - 88);
  };

  return (
    <div className="relative" onPointerMove={track} onPointerLeave={() => setActiveId(null)}>
      <ul className="overflow-hidden rounded-large bg-tile">
        {posts.map((post, index) => {
          const inner = (
            <>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.0625rem] font-medium leading-snug tracking-[-0.012em] sm:text-[1.1875rem]">{post.title}</span>
                {post.excerpt ? <span className="t-small muted mt-1 block">{post.excerpt}</span> : null}
              </span>
              <span className="t-small flex flex-none items-center gap-3 tabular-nums text-ink-3 sm:gap-5">
                <span className="hidden sm:inline">{post.readTime}</span>
                <span>{post.dateLabel}</span>
                {post.external ? <ArrowUpRight size={15} aria-label="Opens on another site" /> : null}
              </span>
            </>
          );
          const className = `flex items-start justify-between gap-6 px-[clamp(20px,2.6vw,36px)] py-5 transition-colors duration-200 hover:bg-well sm:py-6 ${index ? 'border-t border-line' : ''}`;
          return (
            <li key={post.id} onPointerEnter={(event) => event.pointerType === 'mouse' && post.cover.src && setActiveId(post.id)}>
              {post.external ? (
                <a href={post.href} target="_blank" rel="noreferrer" className={className}>
                  {inner}
                </a>
              ) : (
                <SiteLink href={post.href} className={className}>
                  {inner}
                </SiteLink>
              )}
            </li>
          );
        })}
      </ul>
      <AnimatePresence>
        {active ? (
          <motion.div
            key="preview"
            className="post-preview hidden lg:block"
            style={{ x: followX, y: followY }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.28 }}
            aria-hidden
          >
            <Media media={{ ...active.cover, alt: '' }} fill sizes="280px" fit="cover" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
