'use client';

import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Ellipsis,
  GripVertical,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion, Reorder, useDragControls } from 'motion/react';
import { useState, type ComponentType, type MouseEvent, type ReactNode } from 'react';
import { uid, type Media } from '@/lib/content/schema';
import { Sheet } from './sheet';
import { useStore, useValue, type Cursor } from './store';
import { AddRow, EmptyState, IconButton, spring, Thumb } from './ui';

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/* Sortable list ------------------------------------------------------------ */

export type RowTools = {
  handle: ReactNode;
  /** Move up and move down buttons. Hidden on phones, where the row's menu has them instead. */
  moves: ReactNode;
  canUp: boolean;
  canDown: boolean;
  up: () => void;
  down: () => void;
  index: number;
};

export function SortableList<T>({
  items,
  getKey,
  onReorder,
  renderItem,
  label,
}: {
  items: T[];
  getKey: (item: T, index: number) => string;
  onReorder: (next: T[]) => void;
  renderItem: (item: T, tools: RowTools) => ReactNode;
  label: string;
}) {
  return (
    <Reorder.Group as="ul" axis="y" values={items} onReorder={onReorder} className="a-rows a-sortable" aria-label={label}>
      {items.map((item, index) => (
        <SortableRow
          key={getKey(item, index)}
          item={item}
          index={index}
          count={items.length}
          onMove={(to) => onReorder(moveItem(items, index, to))}
          renderItem={renderItem}
        />
      ))}
    </Reorder.Group>
  );
}

function SortableRow<T>({
  item,
  index,
  count,
  onMove,
  renderItem,
}: {
  item: T;
  index: number;
  count: number;
  onMove: (to: number) => void;
  renderItem: (item: T, tools: RowTools) => ReactNode;
}) {
  const controls = useDragControls();
  const canUp = index > 0;
  const canDown = index < count - 1;
  const up = () => onMove(index - 1);
  const down = () => onMove(index + 1);

  return (
    <Reorder.Item
      as="li"
      value={item}
      layout="position"
      dragListener={false}
      dragControls={controls}
      className="a-sortable-item"
      transition={spring}
      whileDrag={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18)', zIndex: 5 }}
    >
      {renderItem(item, {
        handle: (
          <span
            aria-hidden
            className="a-grip"
            title="Drag to reorder"
            onPointerDown={(event) => controls.start(event)}
          >
            <GripVertical size={16} />
          </span>
        ),
        moves: <MoveButtons up={up} down={down} canUp={canUp} canDown={canDown} />,
        canUp,
        canDown,
        up,
        down,
        index,
      })}
    </Reorder.Item>
  );
}

export function MoveButtons({
  up,
  down,
  canUp,
  canDown,
}: {
  up: () => void;
  down: () => void;
  canUp: boolean;
  canDown: boolean;
}) {
  /** Moving a row can drop focus, so put it back for keyboard users. */
  const press = (event: MouseEvent<HTMLButtonElement>, move: () => void) => {
    const button = event.currentTarget;
    const group = button.parentElement;
    move();
    requestAnimationFrame(() => {
      if (!button.disabled) button.focus();
      else group?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    });
  };
  return (
    <span className="a-moves">
      <IconButton icon={ArrowUp} label="Move up" disabled={!canUp} onClick={(event) => press(event, up)} />
      <IconButton icon={ArrowDown} label="Move down" disabled={!canDown} onClick={(event) => press(event, down)} />
    </span>
  );
}

/* Phone action sheet ------------------------------------------------------- */

export type RowAction = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

/** Row actions collapse into an iOS action sheet on phones, where a row can't fit them all. */
export function ActionSheetButton({ title, actions }: { title: string; actions: RowAction[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton icon={Ellipsis} label={`Actions for ${title}`} className="a-phone-only" onClick={() => setOpen(true)} />
      <Sheet open={open} onClose={() => setOpen(false)} title={title}>
        <div className="a-rows a-action-list">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                className={`a-action${action.destructive ? ' is-danger' : ''}`}
                disabled={action.disabled}
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
              >
                <Icon size={17} aria-hidden />
                {action.label}
              </button>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}

/* List editor -------------------------------------------------------------- */

type Summary = { title: string; subtitle?: string; media?: Media };

type ListEditorProps<T extends { id: string }> = {
  cursor: Cursor<T[]>;
  /** What one item is called, in lower case: "role", "metric". */
  noun: string;
  label: string;
  addLabel?: string;
  /** Creates a new item. Leave out for a fixed list that can only be reordered. */
  make?: () => T;
  Editor: ComponentType<{ cursor: Cursor<T>; isNew: boolean }>;
  /** A collapsed row with this summary opens to the editor. Without one, the editor sits in the row. */
  summary?: (item: T) => Summary;
  trailing?: (item: T, cursor: Cursor<T>) => ReactNode;
  empty?: { icon: LucideIcon; title: string; text: string };
};

/** Add, remove, reorder and edit a list of items, with Undo on removal. */
export function ListEditor<T extends { id: string }>({
  cursor,
  noun,
  label,
  addLabel,
  make,
  Editor,
  summary,
  trailing,
  empty,
}: ListEditorProps<T>) {
  const store = useStore();
  const items = useValue(cursor) ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const addText = addLabel ?? `Add ${noun}`;

  const add = () => {
    if (!make) return;
    const next = make();
    cursor.update((previous) => [...(previous ?? []), next]);
    setOpenId(next.id);
    setNewId(next.id);
  };

  const remove = (item: T) => {
    const previous = cursor.read();
    cursor.set(previous.filter((entry) => entry.id !== item.id));
    const name = noun.charAt(0).toUpperCase() + noun.slice(1);
    store.toast(`${name} removed`, { undo: () => cursor.set(previous) });
  };

  if (items.length === 0) {
    return (
      <div className="a-rows">
        {empty ? (
          <EmptyState
            icon={empty.icon}
            title={empty.title}
            text={empty.text}
            action={
              make ? (
                <button type="button" className="a-button is-tint" onClick={add}>
                  {addText}
                </button>
              ) : undefined
            }
          />
        ) : make ? (
          <AddRow label={addText} onClick={add} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="a-list">
      <SortableList
        items={items}
        label={label}
        getKey={(item) => item.id}
        onReorder={(next) => cursor.set(next)}
        renderItem={(item, tools) => {
          const itemCursor = cursor.item(item.id) as unknown as Cursor<T>;
          const removeButton = make ? (
            <IconButton icon={Trash2} label={`Remove ${noun}`} onClick={() => remove(item)} />
          ) : null;

          if (!summary) {
            return (
              <div className="a-inline-item">
                {tools.handle}
                <div className="a-inline-fields">
                  <Editor cursor={itemCursor} isNew={item.id === newId} />
                </div>
                <div className="a-inline-actions">
                  {trailing?.(item, itemCursor)}
                  {tools.moves}
                  {removeButton}
                </div>
              </div>
            );
          }

          const info = summary(item);
          const open = openId === item.id;
          return (
            <div className="a-item">
              <div className="a-item-head">
                {tools.handle}
                <button
                  type="button"
                  className="a-item-toggle"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  {info.media ? <Thumb media={info.media} size={36} /> : null}
                  <span className="a-item-text">
                    <span className="a-item-title">{info.title}</span>
                    {info.subtitle ? <span className="a-item-subtitle">{info.subtitle}</span> : null}
                  </span>
                  <motion.span animate={{ rotate: open ? 90 : 0 }} transition={spring} className="a-item-chevron">
                    <ChevronRight size={16} aria-hidden />
                  </motion.span>
                </button>
                {trailing?.(item, itemCursor)}
                <span className="a-wide-only a-item-actions">
                  {tools.moves}
                  {removeButton}
                </span>
              </div>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    className="a-item-reveal"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={spring}
                  >
                    <div className="a-item-body">
                      <Editor cursor={itemCursor} isNew={item.id === newId} />
                      <div className="a-phone-only a-item-foot">
                        {tools.moves}
                        {removeButton}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        }}
      />
      {make ? (
        <div className="a-rows a-list-add">
          <AddRow label={addText} onClick={add} />
        </div>
      ) : null}
    </div>
  );
}

/* Lists of plain text ------------------------------------------------------ */

type TextEntry = { key: string; text: string };

function sameText(rows: TextEntry[], value: string[]) {
  return rows.length === value.length && rows.every((row, index) => row.text === value[index]);
}

/** Plain strings have no id, so each row gets a key that lasts while it's being edited. */
export function StringList({
  value,
  onChange,
  noun,
  label,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  noun: string;
  label: string;
}) {
  const items = value ?? [];
  const [rows, setRows] = useState<TextEntry[]>(() => items.map((text) => ({ key: uid(), text })));
  const [newKey, setNewKey] = useState<string | null>(null);
  if (!sameText(rows, items)) setRows(items.map((text) => ({ key: uid(), text })));

  const commit = (next: TextEntry[]) => {
    setRows(next);
    onChange(next.map((row) => row.text));
  };

  return (
    <div className="a-list">
      {rows.length ? (
        <SortableList
          items={rows}
          label={label}
          getKey={(row) => row.key}
          onReorder={commit}
          renderItem={(row, tools) => (
            <div className="a-inline-item">
              {tools.handle}
              <div className="a-inline-fields">
                <label className="a-sr" htmlFor={row.key}>
                  {label} {tools.index + 1}
                </label>
                <input
                  id={row.key}
                  className="a-input is-left"
                  value={row.text}
                  autoFocus={row.key === newKey}
                  placeholder={`Write a ${noun}`}
                  onChange={(event) =>
                    commit(rows.map((entry) => (entry.key === row.key ? { ...entry, text: event.target.value } : entry)))
                  }
                />
              </div>
              <div className="a-inline-actions">
                {tools.moves}
                <IconButton
                  icon={Trash2}
                  label={`Remove ${noun}`}
                  onClick={() => commit(rows.filter((entry) => entry.key !== row.key))}
                />
              </div>
            </div>
          )}
        />
      ) : null}
      <div className={`a-rows${rows.length ? ' a-list-add' : ''}`}>
        <AddRow
          label={`Add ${noun}`}
          onClick={() => {
            const key = uid();
            setNewKey(key);
            commit([...rows, { key, text: '' }]);
          }}
        />
      </div>
    </div>
  );
}
