'use client';

import { Check, Circle, ExternalLink, FolderOpen, HardDriveUpload, X } from 'lucide-react';
import { seedContent } from '@/lib/content/seed';
import { sectionHref, type SectionKey } from '../router';
import { useAdmin, useStore, useUnpublishedChanges } from '../store';
import { Group, IconButton, Row, useLocalFlag } from '../ui';

const DISMISSED = 'portfolio-admin-checklist-dismissed';

export function OverviewSection() {
  const store = useStore();
  const draft = useAdmin((state) => state.draft);
  const published = useAdmin((state) => state.published);
  const unpublished = useUnpublishedChanges();
  const [dismissed, setDismissed] = useLocalFlag(DISMISSED);

  const seedTitles = new Set(seedContent.projects.map((project) => project.title));
  const steps: { label: string; detail: string; done: boolean; section: SectionKey }[] = [
    {
      label: 'Add your name',
      detail: 'It appears in the navigation, the title of each page, and across the footer.',
      done: draft.profile.name !== seedContent.profile.name,
      section: 'profile',
    },
    {
      label: 'Add your photo',
      detail: 'Used on the opening screen and your About page.',
      done: Boolean(draft.profile.avatar.src) && !draft.profile.avatar.src.startsWith('/seed/'),
      section: 'profile',
    },
    {
      label: 'Replace the sample projects',
      detail: 'Edit them, or delete them and add your own.',
      done: !draft.projects.some((project) => seedTitles.has(project.title)),
      section: 'projects',
    },
    {
      label: 'Publish your site',
      detail: 'Until you do, search engines are asked to stay away.',
      done: !draft.isSample,
      section: 'overview',
    },
  ];

  const shownProjects = draft.projects.filter((project) => project.published).length;
  const shownPosts = draft.posts.filter((post) => post.published).length;

  return (
    <>
      {store.storage === 'none' ? (
        <div className="a-banner is-warning" role="alert">
          <HardDriveUpload size={20} aria-hidden />
          <div>
            <p className="a-banner-title">Connect storage to start saving</p>
            <p>Your edits can’t be saved until this site has somewhere to keep them. It takes about a minute:</p>
            <ol>
              <li>Open this project on vercel.com and go to the Storage tab.</li>
              <li>Choose Create database, then Blob, and pick Private access.</li>
              <li>Connect it to this project, then redeploy from the Deployments tab.</li>
            </ol>
            <p>Anything you change before then is kept in this browser only.</p>
          </div>
        </div>
      ) : null}

      {draft.isSample && !dismissed ? (
        <Group
          title="Replace the sample content"
          action={<IconButton icon={X} label="Dismiss this checklist" onClick={() => setDismissed(true)} />}
          footnote="Everything on the site right now is an example. Work through these and it becomes yours."
        >
          {steps.map((step) => (
            <a key={step.label} href={sectionHref(step.section)} className="a-check-row" data-done={step.done}>
              {step.done ? (
                <span className="a-check-done">
                  <Check size={13} strokeWidth={3} aria-hidden />
                </span>
              ) : (
                <Circle size={20} strokeWidth={1.5} aria-hidden className="a-check-todo" />
              )}
              <span className="a-item-text">
                <span className="a-item-title">
                  {step.label}
                  <span className="a-sr">{step.done ? ' (done)' : ' (to do)'}</span>
                </span>
                <span className="a-item-subtitle">{step.detail}</span>
              </span>
            </a>
          ))}
        </Group>
      ) : null}

      <Group title="Status">
        <Row label="Live site">
          <span className="a-status-value">
            <span className="a-dot" data-tone={published.isSample ? 'gray' : 'green'} aria-hidden />
            {published.isSample ? 'Showing sample content' : 'Published'}
          </span>
        </Row>
        <Row label="Your draft">
          <span className="a-status-value">
            <span className="a-dot" data-tone={unpublished ? 'orange' : 'green'} aria-hidden />
            {unpublished ? 'Unpublished changes' : 'Same as the live site'}
          </span>
        </Row>
        <Row label="Projects">
          <span className="a-status-value">
            {draft.projects.length}
            {shownProjects !== draft.projects.length ? `, ${shownProjects} shown` : ''}
          </span>
        </Row>
        <Row label="Posts">
          <span className="a-status-value">
            {draft.posts.length}
            {shownPosts !== draft.posts.length ? `, ${shownPosts} shown` : ''}
          </span>
        </Row>
      </Group>

      <Group title="Open">
        <a className="a-link-row" href="/" target="_blank" rel="noreferrer">
          Live site
          <ExternalLink size={15} aria-hidden />
        </a>
        <a className="a-link-row" href="/admin/preview" target="_blank" rel="noreferrer">
          Draft preview
          <ExternalLink size={15} aria-hidden />
        </a>
      </Group>

      {store.storage === 'file' ? (
        <p className="a-note">
          <FolderOpen size={14} aria-hidden />
          Saving to the local .data folder on this computer.
        </p>
      ) : null}
    </>
  );
}
