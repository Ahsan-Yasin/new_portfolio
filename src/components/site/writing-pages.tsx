import { CaseProgress } from '@/components/motion/case-progress';
import { CaseRows } from '@/components/motion/case-rows';
import { PageMotion } from '@/components/motion/page-motion';
import { safeHref, type Content, type Post } from '@/lib/content/schema';
import { formatPostDate, publishedPosts, sectionById } from '@/lib/content/select';
import { Blocks } from './blocks';
import { Media } from './media';
import { PostList } from './post-list';
import { SiteLink } from './site-link';
import './inner-pages.css';

export function WritingIndexPage({ content }: { content: Content }) {
  const section = sectionById(content, 'writing');
  const posts = publishedPosts(content);
  return (
    <div className="wrap writing-open">
      <PageMotion />
      <h1 data-lines="load" className="t-mega break-words">
        {section?.title || 'Writing'}
      </h1>
      {section?.subtitle ? (
        <p data-load="0.55" className="t-lead muted mt-[clamp(16px,2vw,28px)] max-w-[34em]">
          {section.subtitle}
        </p>
      ) : null}
      <div className="mt-[clamp(48px,7vw,112px)]">
        {posts.length ? (
          <CaseRows className="writing-list">
            <PostList
              posts={posts.map((post) => {
                const external = safeHref(post.externalUrl);
                return {
                  id: post.id,
                  title: post.title,
                  excerpt: post.excerpt,
                  dateLabel: formatPostDate(post.date),
                  readTime: post.readTime,
                  href: external ?? `/writing/${post.slug}`,
                  external: Boolean(external),
                  cover: post.cover,
                };
              })}
            />
          </CaseRows>
        ) : (
          <p className="muted">Nothing here yet.</p>
        )}
      </div>
    </div>
  );
}

export function PostPage({ post }: { post: Post }) {
  const meta = [formatPostDate(post.date), post.readTime].filter(Boolean).join(' · ');
  return (
    <article>
      <PageMotion />
      <CaseProgress endTrigger="#post-end" />

      <header className="wrap post-open">
        <div data-load="0.2">
          <SiteLink href="/writing" className="t-small muted hover:text-ink">
            ‹ All writing
          </SiteLink>
        </div>
        <h1 data-lines="load" className="t-hero mt-[clamp(16px,2vw,28px)] max-w-[16em]">
          {post.title}
        </h1>
        {meta || post.excerpt ? (
          <div data-load="0.6" className="mt-[clamp(20px,2.4vw,36px)]">
            {meta ? <p className="t-small tabular-nums text-ink-3">{meta}</p> : null}
            {post.excerpt ? <p className="t-lead muted mt-3 max-w-[34em]">{post.excerpt}</p> : null}
          </div>
        ) : null}
      </header>

      {post.cover.src ? (
        <div className="wrap mt-[clamp(36px,5vw,72px)]">
          <div data-media className="post-cover">
            <div className="absolute inset-0">
              <div data-parallax="6" className="post-cover-picture">
                <Media media={post.cover} fill sizes="(max-width: 1400px) 92vw, 1320px" priority />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="wrap post-text">
        <div className="post-body">
          <Blocks blocks={post.blocks} narrow />
        </div>
      </div>
      <div id="post-end" />
    </article>
  );
}
