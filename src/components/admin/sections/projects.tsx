'use client';

import { ArrowDown, ArrowUp, BriefcaseBusiness, ChevronRight, Copy, Link2, Plus, TrendingUp, Trash2 } from 'lucide-react';
import { slugify, uid, type Project } from '@/lib/content/schema';
import { BlockEditor } from '../block-editor';
import { MediaField } from '../media-field';
import { goTo, sectionHref } from '../router';
import { LinkFields, MetricFields, newLink, newMetric, SlugRow, slugFollowsTitle, uniqueSlug } from '../shared-fields';
import { ActionSheetButton, ListEditor, SortableList } from '../sortable';
import { useFields, useRoot, useStore, useValue, type Cursor } from '../store';
import {
  Button,
  ColorRow,
  EmptyState,
  Group,
  IconButton,
  SegmentedRow,
  StepperRow,
  Switch,
  TextAreaRow,
  TextRow,
  Thumb,
  ToggleRow,
  TokenRow,
} from '../ui';
import { PushView } from './push-view';

const FALLBACK_SLUG = 'untitled-project';
/** Lets the editor finish sliding away before the project it's showing goes. */
const REMOVE_AFTER_PUSH_MS = 380;

export function ProjectsSection({ detail }: { detail: string | null }) {
  return (
    <PushView viewKey={detail ?? 'list'} isDetail={detail !== null}>
      {detail ? <ProjectEditor id={detail} /> : <ProjectList />}
    </PushView>
  );
}

function ProjectList() {
  const store = useStore();
  const cursor = useRoot().at('projects');
  const projects = useValue(cursor);

  const add = () => {
    const id = uid();
    const slug = uniqueSlug(
      FALLBACK_SLUG,
      projects.map((project) => project.slug),
    );
    const project: Project = {
      id,
      slug,
      title: '',
      summary: '',
      published: true,
      cover: { src: '', alt: '', kind: 'image' },
      coverVideo: { src: '', alt: '', kind: 'video' },
      coverFit: 'contain',
      color: '#1d1d1f',
      year: String(new Date().getFullYear()),
      client: '',
      role: '',
      duration: '',
      team: '',
      tags: [],
      metrics: [],
      links: [],
      blocks: [],
    };
    cursor.update((previous) => [project, ...previous]);
    goTo(sectionHref('projects', id));
  };

  const duplicate = (project: Project) => {
    const title = `${project.title || 'Untitled project'} copy`;
    const copy: Project = {
      ...structuredClone(project),
      id: uid(),
      title,
      slug: uniqueSlug(
        slugify(title),
        cursor.read().map((entry) => entry.slug),
      ),
    };
    cursor.update((previous) => {
      const index = previous.findIndex((entry) => entry.id === project.id);
      return [...previous.slice(0, index + 1), copy, ...previous.slice(index + 1)];
    });
    store.toast('Project duplicated');
  };

  const remove = (project: Project) => {
    const previous = cursor.read();
    cursor.set(previous.filter((entry) => entry.id !== project.id));
    store.toast('Project deleted', { undo: () => cursor.set(previous) });
  };

  if (projects.length === 0) {
    return (
      <Group title="Projects">
        <EmptyState
          icon={BriefcaseBusiness}
          title="No projects yet"
          text="Add the first piece of work you’d like people to see."
          action={
            <Button variant="tint" icon={Plus} onClick={add}>
              Add project
            </Button>
          }
        />
      </Group>
    );
  }

  return (
    <Group
      title="Projects"
      action={
        <Button variant="plain" icon={Plus} onClick={add}>
          Add project
        </Button>
      }
      footnote="Shown on your home page in this order. Switch one off to hide it from the site without deleting it."
    >
      <SortableList
        items={projects}
        label="Projects"
        getKey={(project) => project.id}
        onReorder={(next) => cursor.set(next)}
        renderItem={(project, tools) => {
          const title = project.title || 'Untitled project';
          return (
            <div className="a-entry">
              {tools.handle}
              <a className="a-entry-link" href={sectionHref('projects', project.id)}>
                <Thumb media={project.cover} color={project.color} size={44} />
                <span className="a-item-text">
                  <span className="a-item-title">{title}</span>
                  <span className="a-item-subtitle">{[project.client, project.year].filter(Boolean).join(', ')}</span>
                </span>
                <ChevronRight size={16} aria-hidden className="a-entry-chevron a-phone-only" />
              </a>
              <span className="a-entry-tools">
                <Switch
                  label={`Show ${title} on the site`}
                  value={project.published}
                  onChange={(published) => cursor.item(project.id).at('published').set(published)}
                />
                <span className="a-wide-only a-entry-buttons">
                  {tools.moves}
                  <IconButton icon={Copy} label={`Duplicate ${title}`} onClick={() => duplicate(project)} />
                  <IconButton icon={Trash2} label={`Delete ${title}`} onClick={() => remove(project)} />
                </span>
                <ActionSheetButton
                  title={title}
                  actions={[
                    { label: 'Move up', icon: ArrowUp, onClick: tools.up, disabled: !tools.canUp },
                    { label: 'Move down', icon: ArrowDown, onClick: tools.down, disabled: !tools.canDown },
                    { label: 'Duplicate', icon: Copy, onClick: () => duplicate(project) },
                    { label: 'Delete', icon: Trash2, onClick: () => remove(project), destructive: true },
                  ]}
                />
              </span>
            </div>
          );
        }}
      />
    </Group>
  );
}

function ProjectEditor({ id }: { id: string }) {
  const projects = useRoot().at('projects');
  const exists = useValue(projects).some((project) => project.id === id);
  if (!exists) {
    return (
      <Group title="Projects">
        <EmptyState
          icon={BriefcaseBusiness}
          title="This project isn’t here any more"
          text="It may have been deleted. Your other projects are still in the list."
          action={
            <a className="a-button is-tint" href={sectionHref('projects')}>
              Back to projects
            </a>
          }
        />
      </Group>
    );
  }
  return <ProjectFields id={id} cursor={projects.item(id)} />;
}

const FIT_OPTIONS = [
  { value: 'contain', label: 'Show all' },
  { value: 'cover', label: 'Fill card' },
] as const;

function ProjectFields({ id, cursor }: { id: string; cursor: Cursor<Project> }) {
  const store = useStore();
  const projects = useRoot().at('projects');
  const { value, field } = useFields(cursor);
  const taken = useValue(projects)
    .filter((project) => project.id !== id)
    .map((project) => project.slug);

  const onTitle = (title: string) => {
    cursor.update((previous) => {
      if (!slugFollowsTitle(previous.slug, previous.title, FALLBACK_SLUG)) return { ...previous, title };
      return { ...previous, title, slug: uniqueSlug(slugify(title) || FALLBACK_SLUG, taken) };
    });
  };

  const onDelete = async () => {
    const confirmed = await store.confirm({
      title: 'Delete this project?',
      message: 'It leaves the site the next time you publish. You can undo this for a few seconds.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;
    goTo(sectionHref('projects'));
    setTimeout(() => {
      const previous = projects.read();
      projects.set(previous.filter((project) => project.id !== id));
      store.toast('Project deleted', { undo: () => projects.set(previous) });
    }, REMOVE_AFTER_PUSH_MS);
  };

  return (
    <>
      <Group title="Project">
        <TextRow label="Title" stacked value={value.title} onChange={onTitle} placeholder="What you did, and what changed" />
        <SlugRow prefix="/work/" taken={taken} {...field('slug')} />
        <TextAreaRow label="Summary" rows={2} hint="One or two lines shown under the title." {...field('summary')} />
        <ToggleRow label="Show on the site" {...field('published')} />
      </Group>

      <Group title="Cover">
        <MediaField label="Cover" cursor={cursor.at('cover')} />
        <MediaField label="Cover video (optional)" cursor={cursor.at('coverVideo')} />
        <SegmentedRow label="Cover fit" options={FIT_OPTIONS} {...field('coverFit')} />
        <ColorRow label="Card colour" hint="The background of the project card." {...field('color')} />
      </Group>

      <Group title="Details">
        <StepperRow label="Year" startAt={() => new Date().getFullYear()} {...field('year')} />
        <TextRow label="Client" {...field('client')} />
        <TextRow label="Your role" {...field('role')} />
        <TextRow label="Duration" placeholder="8 months" {...field('duration')} />
        <TextRow label="Team" placeholder="2 designers, 5 engineers" {...field('team')} />
        <TokenRow label="Tags" placeholder="Type a tag and press Return" {...field('tags')} />
      </Group>

      <Group title="Metrics" footnote="The numbers that moved because of this work.">
        <ListEditor
          cursor={cursor.at('metrics')}
          noun="metric"
          label="Metrics"
          make={newMetric}
          Editor={MetricFields}
          empty={{ icon: TrendingUp, title: 'No metrics yet', text: 'Add the numbers that show what this work changed.' }}
        />
      </Group>

      <Group title="Links">
        <ListEditor
          cursor={cursor.at('links')}
          noun="link"
          label="Links"
          make={newLink}
          Editor={LinkFields}
          empty={{ icon: Link2, title: 'No links yet', text: 'Link to the live product, a launch post or press coverage.' }}
        />
      </Group>

      <BlockEditor cursor={cursor.at('blocks')} />

      <div className="a-danger-zone">
        <Button variant="plain" className="is-danger-text" icon={Trash2} onClick={onDelete}>
          Delete project
        </Button>
      </div>
    </>
  );
}
