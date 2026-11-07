'use client';

import { ChevronRight, Copy, PenLine, Plus, Trash2 } from 'lucide-react';
import { slugify, uid, type Post } from '@/lib/content/schema';
import { BlockEditor } from '../block-editor';
import { MediaField } from '../media-field';
import { goTo, sectionHref } from '../router';
import { LinkRow, SlugRow, slugFollowsTitle, uniqueSlug } from '../shared-fields';
import { ActionSheetButton } from '../sortable';
import { useFields, useRoot, useStore, useValue, type Cursor } from '../store';
import {
  Button,
  EmptyState,
  Group,
  IconButton,
  StepperRow,
  Switch,
  TextAreaRow,
  TextRow,
  Thumb,
  ToggleRow,
} from '../ui';
import { PushView } from './push-view';

const FALLBACK_SLUG = 'untitled-post';
/** Lets the editor finish sliding away before the post it's showing goes. */
const REMOVE_AFTER_PUSH_MS = 380;

export function WritingSection({ detail }: { detail: string | null }) {
  return (
    <PushView viewKey={detail ?? 'list'} isDetail={detail !== null}>
      {detail ? <PostEditor id={detail} /> : <PostList />}
    </PushView>
  );
}

function PostList() {
  const store = useStore();
  const cursor = useRoot().at('posts');
  const posts = useValue(cursor);
  const sorted = posts.toSorted((a, b) => b.date.localeCompare(a.date));

  const add = () => {
    const id = uid();
    const post: Post = {
      id,
      slug: uniqueSlug(
        FALLBACK_SLUG,
        posts.map((entry) => entry.slug),
      ),
      title: '',
      excerpt: '',
      date: new Date().toISOString().slice(0, 10),
      readTime: '',
      published: true,
      cover: { src: '', alt: '', kind: 'image' },
      externalUrl: '',
      blocks: [],
    };
    cursor.update((previous) => [post, ...previous]);
    goTo(sectionHref('writing', id));
  };

  const duplicate = (post: Post) => {
    const title = `${post.title || 'Untitled post'} copy`;
    const copy: Post = {
      ...structuredClone(post),
      id: uid(),
      title,
      slug: uniqueSlug(
        slugify(title),
        cursor.read().map((entry) => entry.slug),
      ),
    };
    cursor.update((previous) => [copy, ...previous]);
    store.toast('Post duplicated');
  };

  const remove = (post: Post) => {
    const previous = cursor.read();
    cursor.set(previous.filter((entry) => entry.id !== post.id));
    store.toast('Post deleted', { undo: () => cursor.set(previous) });
  };

  if (posts.length === 0) {
    return (
      <Group title="Posts">
        <EmptyState
          icon={PenLine}
          title="No posts yet"
          text="Write here, or link to something you’ve published elsewhere."
          action={
            <Button variant="tint" icon={Plus} onClick={add}>
              Add post
            </Button>
          }
        />
      </Group>
    );
  }

  return (
    <Group
      title="Posts"
      action={
        <Button variant="plain" icon={Plus} onClick={add}>
          Add post
        </Button>
      }
      footnote="The site lists posts by date, newest first. Switch one off to hide it without deleting it."
    >
      {sorted.map((post) => {
        const title = post.title || 'Untitled post';
        return (
          <div key={post.id} className="a-entry is-plain">
            <a className="a-entry-link" href={sectionHref('writing', post.id)}>
              <Thumb media={post.cover} size={44} />
              <span className="a-item-text">
                <span className="a-item-title">{title}</span>
                <span className="a-item-subtitle">{[post.date, post.readTime].filter(Boolean).join(', ')}</span>
              </span>
              <ChevronRight size={16} aria-hidden className="a-entry-chevron a-phone-only" />
            </a>
            <span className="a-entry-tools">
              <Switch
                label={`Show ${title} on the site`}
                value={post.published}
                onChange={(published) => cursor.item(post.id).at('published').set(published)}
              />
              <span className="a-wide-only a-entry-buttons">
                <IconButton icon={Copy} label={`Duplicate ${title}`} onClick={() => duplicate(post)} />
                <IconButton icon={Trash2} label={`Delete ${title}`} onClick={() => remove(post)} />
              </span>
              <ActionSheetButton
                title={title}
                actions={[
                  { label: 'Duplicate', icon: Copy, onClick: () => duplicate(post) },
                  { label: 'Delete', icon: Trash2, onClick: () => remove(post), destructive: true },
                ]}
              />
            </span>
          </div>
        );
      })}
    </Group>
  );
}

function PostEditor({ id }: { id: string }) {
  const posts = useRoot().at('posts');
  const exists = useValue(posts).some((post) => post.id === id);
  if (!exists) {
    return (
      <Group title="Posts">
        <EmptyState
          icon={PenLine}
          title="This post isn’t here any more"
          text="It may have been deleted. Your other posts are still in the list."
          action={
            <a className="a-button is-tint" href={sectionHref('writing')}>
              Back to writing
            </a>
          }
        />
      </Group>
    );
  }
  return <PostFields id={id} cursor={posts.item(id)} />;
}

function PostFields({ id, cursor }: { id: string; cursor: Cursor<Post> }) {
  const store = useStore();
  const posts = useRoot().at('posts');
  const { value, field } = useFields(cursor);
  const taken = useValue(posts)
    .filter((post) => post.id !== id)
    .map((post) => post.slug);
  const isExternal = Boolean(value.externalUrl?.trim());

  const onTitle = (title: string) => {
    cursor.update((previous) => {
      if (!slugFollowsTitle(previous.slug, previous.title, FALLBACK_SLUG)) return { ...previous, title };
      return { ...previous, title, slug: uniqueSlug(slugify(title) || FALLBACK_SLUG, taken) };
    });
  };

  const onDelete = async () => {
    const confirmed = await store.confirm({
      title: 'Delete this post?',
      message: 'It leaves the site the next time you publish. You can undo this for a few seconds.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;
    goTo(sectionHref('writing'));
    setTimeout(() => {
      const previous = posts.read();
      posts.set(previous.filter((post) => post.id !== id));
      store.toast('Post deleted', { undo: () => posts.set(previous) });
    }, REMOVE_AFTER_PUSH_MS);
  };

  return (
    <>
      <Group title="Post">
        <TextRow label="Title" stacked value={value.title} onChange={onTitle} placeholder="A title worth clicking" />
        <SlugRow prefix="/writing/" taken={taken} {...field('slug')} />
        <TextAreaRow label="Excerpt" rows={2} hint="A sentence or two shown in the list of posts." {...field('excerpt')} />
        <ToggleRow label="Show on the site" {...field('published')} />
      </Group>

      <Group title="Details">
        <TextRow label="Date" type="date" {...field('date')} />
        <StepperRow label="Read time" placeholder="6 min" suffix=" min" startAt={() => 5} {...field('readTime')} />
      </Group>

      <Group title="Cover">
        <MediaField label="Cover" cursor={cursor.at('cover')} />
      </Group>

      <Group
        title="Published elsewhere?"
        footnote={isExternal ? 'The post links out to this address, so the page content below isn’t used.' : 'Leave this empty to publish the post here on your site.'}
      >
        <LinkRow label="External link" {...field('externalUrl')} />
      </Group>

      {isExternal ? null : <BlockEditor cursor={cursor.at('blocks')} />}

      <div className="a-danger-zone">
        <Button variant="plain" className="is-danger-text" icon={Trash2} onClick={onDelete}>
          Delete post
        </Button>
      </div>
    </>
  );
}
