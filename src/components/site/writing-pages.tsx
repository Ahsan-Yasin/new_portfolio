import { safeHref, type Content, type Post } from '@/lib/content/schema';
import { formatPostDate, publishedPosts, sectionById } from '@/lib/content/select';
import { Blocks } from './blocks';
import { Media } from './media';
import { PostList } from './post-list';
import { SiteLink } from './site-link';

export function WritingIndexPage({ content }: { content: Content }) {
  const section = sectionById(content, 'writing');
  const posts = publishedPosts(content);
  return (
    <div className="wrap pb-[clamp(72px,9vw,136px)] pt-[clamp(128px,18vh,180px)]">
      <h1 className="t-display">{section?.title || 'Writing'}</h1>
      {section?.subtitle ? <p className="t-lead muted mt-4 max-w-[34em]">{section.subtitle}</p> : null}
      <div className="mt-[clamp(40px,5vw,72px)]">
        {posts.length ? (
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
    <article className="wrap pb-[clamp(72px,9vw,136px)] pt-[clamp(112px,15vh,160px)]">
      <div className="mx-auto max-w-[46rem]">
        <SiteLink href="/writing" className="t-small muted hover:text-ink">
          ‹ All writing
        </SiteLink>
        <h1 className="t-title mt-4">{post.title}</h1>
        {meta ? <p className="t-small mt-4 tabular-nums text-ink-3">{meta}</p> : null}
        {post.excerpt ? <p className="t-lead muted mt-5">{post.excerpt}</p> : null}
        {post.cover.src ? (
          <div className="mt-8 overflow-hidden rounded-large bg-well p-[clamp(12px,2vw,28px)]">
            <Media media={post.cover} sizes="(max-width: 768px) 92vw, 736px" priority />
          </div>
        ) : null}
        <div className="mt-[clamp(32px,4vw,48px)]">
          <Blocks blocks={post.blocks} narrow />
        </div>
      </div>
    </article>
  );
}
