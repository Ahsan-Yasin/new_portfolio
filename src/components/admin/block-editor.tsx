'use client';

import {
  Heading2,
  Images,
  ImageIcon,
  List,
  Pilcrow,
  Plus,
  Quote,
  Trash2,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { uid, type Block, type BlockType } from '@/lib/content/schema';
import { MediaField, MediaListEditor } from './media-field';
import { FORMAT_HINT, MetricFields, newMetric } from './shared-fields';
import { Sheet } from './sheet';
import { ListEditor, SortableList, StringList } from './sortable';
import { useFields, useStore, useValue, type Cursor } from './store';
import { Button, ColorRow, EmptyState, Group, IconButton, SegmentedRow, TextAreaRow, TextRow } from './ui';

const BLOCK_TYPES: { type: BlockType; label: string; description: string; icon: LucideIcon }[] = [
  { type: 'heading', label: 'Heading', description: 'A short title that starts a new part of the page', icon: Heading2 },
  { type: 'text', label: 'Text', description: 'One or more paragraphs', icon: Pilcrow },
  { type: 'media', label: 'Image or video', description: 'One picture or clip, with a caption', icon: ImageIcon },
  { type: 'gallery', label: 'Gallery', description: 'Several images side by side', icon: Images },
  { type: 'quote', label: 'Quote', description: 'Words from someone else, with their name', icon: Quote },
  { type: 'metrics', label: 'Metrics', description: 'A row of big numbers', icon: TrendingUp },
  { type: 'list', label: 'List', description: 'A short bulleted list with a title', icon: List },
];

function newBlock(type: BlockType): Block {
  const id = uid();
  switch (type) {
    case 'heading':
    case 'text':
      return { id, type, text: '' };
    case 'media':
      return { id, type, media: { src: '', alt: '', kind: 'image' }, caption: '', size: 'wide', color: '' };
    case 'gallery':
      return { id, type, items: [], caption: '' };
    case 'quote':
      return { id, type, text: '', cite: '' };
    case 'metrics':
      return { id, type, items: [] };
    case 'list':
      return { id, type, title: '', items: [] };
  }
}

/** The page body of a project or post, built from typed blocks. */
export function BlockEditor({ cursor }: { cursor: Cursor<Block[]> }) {
  const store = useStore();
  const blocks = useValue(cursor) ?? [];
  const [menuOpen, setMenuOpen] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);

  const add = (type: BlockType) => {
    const block = newBlock(type);
    setMenuOpen(false);
    setNewId(block.id);
    cursor.update((previous) => [...(previous ?? []), block]);
  };

  const remove = (block: Block) => {
    const previous = cursor.read();
    cursor.set(previous.filter((entry) => entry.id !== block.id));
    store.toast('Block removed', { undo: () => cursor.set(previous) });
  };

  const addButton = (
    <Button variant="tint" icon={Plus} onClick={() => setMenuOpen(true)}>
      Add block
    </Button>
  );

  return (
    <Group title="Page content" footnote="Blocks appear on the page in this order.">
      {blocks.length === 0 ? (
        <EmptyState
          icon={Pilcrow}
          title="This page is empty"
          text="Add a heading, some text or an image to start building it."
          action={addButton}
        />
      ) : (
        <SortableList
          items={blocks}
          label="Page content"
          getKey={(block) => block.id}
          onReorder={(next) => cursor.set(next)}
          renderItem={(block, tools) => {
            const meta = BLOCK_TYPES.find((entry) => entry.type === block.type) ?? BLOCK_TYPES[1];
            const Icon = meta.icon;
            return (
              <div className="a-block">
                <div className="a-block-head">
                  {tools.handle}
                  <Icon size={15} aria-hidden className="a-block-icon" />
                  <span className="a-block-label">{meta.label}</span>
                  <span className="a-block-actions">
                    {tools.moves}
                    <IconButton icon={Trash2} label={`Remove ${meta.label.toLowerCase()} block`} onClick={() => remove(block)} />
                  </span>
                </div>
                <div className="a-block-body">
                  <BlockFields block={block} cursor={cursor.item(block.id)} isNew={block.id === newId} />
                </div>
              </div>
            );
          }}
        />
      )}
      {blocks.length ? <div className="a-block-add">{addButton}</div> : null}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Add a block">
        <div className="a-rows a-action-list">
          {BLOCK_TYPES.map((entry) => {
            const Icon = entry.icon;
            return (
              <button key={entry.type} type="button" className="a-action is-described" onClick={() => add(entry.type)}>
                <Icon size={18} aria-hidden />
                <span>
                  <span className="a-action-title">{entry.label}</span>
                  <span className="a-action-description">{entry.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Sheet>
    </Group>
  );
}

type Of<T extends BlockType> = Extract<Block, { type: T }>;

function BlockFields({ block, cursor, isNew }: { block: Block; cursor: Cursor<Block>; isNew: boolean }) {
  switch (block.type) {
    case 'heading':
      return <HeadingFields cursor={cursor.narrow<Of<'heading'>>()} isNew={isNew} />;
    case 'text':
      return <TextFields cursor={cursor.narrow<Of<'text'>>()} isNew={isNew} />;
    case 'media':
      return <SingleMediaFields cursor={cursor.narrow<Of<'media'>>()} />;
    case 'gallery':
      return <GalleryFields cursor={cursor.narrow<Of<'gallery'>>()} />;
    case 'quote':
      return <QuoteFields cursor={cursor.narrow<Of<'quote'>>()} isNew={isNew} />;
    case 'metrics':
      return <MetricsFields cursor={cursor.narrow<Of<'metrics'>>()} />;
    case 'list':
      return <ListFields cursor={cursor.narrow<Of<'list'>>()} isNew={isNew} />;
  }
}

function HeadingFields({ cursor, isNew }: { cursor: Cursor<Of<'heading'>>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return <TextRow label="Heading" stacked autoFocus={isNew} placeholder="The problem" {...field('text')} />;
}

function TextFields({ cursor, isNew }: { cursor: Cursor<Of<'text'>>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return <TextAreaRow label="Text" rows={4} autoFocus={isNew} hint={FORMAT_HINT} {...field('text')} />;
}

const MEDIA_SIZES = [
  { value: 'inset', label: 'Inset' },
  { value: 'wide', label: 'Wide' },
  { value: 'full', label: 'Full' },
] as const;

function SingleMediaFields({ cursor }: { cursor: Cursor<Of<'media'>> }) {
  const { field } = useFields(cursor);
  return (
    <>
      <MediaField label="Image or video" cursor={cursor.at('media')} />
      <TextRow label="Caption" stacked placeholder="What this shows" {...field('caption')} />
      <SegmentedRow label="Size" {...field('size')} options={MEDIA_SIZES} />
      <ColorRow label="Background colour" allowEmpty {...field('color')} hint="Shown behind the image. Leave empty for none." />
    </>
  );
}

function GalleryFields({ cursor }: { cursor: Cursor<Of<'gallery'>> }) {
  const { field } = useFields(cursor);
  return (
    <>
      <div className="a-nested">
        <MediaListEditor cursor={cursor.at('items')} label="Gallery images" make={(media) => media} />
      </div>
      <TextRow label="Caption" stacked placeholder="What these show" {...field('caption')} />
    </>
  );
}

function QuoteFields({ cursor, isNew }: { cursor: Cursor<Of<'quote'>>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <TextAreaRow label="Quote" rows={2} autoFocus={isNew} {...field('text')} />
      <TextRow label="Who said it" stacked placeholder="Priya N., patient support lead" {...field('cite')} />
    </>
  );
}

function MetricsFields({ cursor }: { cursor: Cursor<Of<'metrics'>> }) {
  return (
    <div className="a-nested">
      <ListEditor
        cursor={cursor.at('items')}
        noun="metric"
        label="Metrics"
        make={newMetric}
        Editor={MetricFields}
      />
    </div>
  );
}

function ListFields({ cursor, isNew }: { cursor: Cursor<Of<'list'>>; isNew: boolean }) {
  const { field } = useFields(cursor);
  return (
    <>
      <TextRow label="Title" stacked autoFocus={isNew} placeholder="Three rules we held to" {...field('title')} />
      <div className="a-nested">
        <StringList noun="point" label="List points" {...field('items')} />
      </div>
    </>
  );
}
