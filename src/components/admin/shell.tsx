'use client';

/* eslint-disable @next/next/no-img-element */

import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CloudOff,
  LoaderCircle,
  LogOut,
  PanelRight,
  Search,
} from 'lucide-react';
import { motion, MotionConfig } from 'motion/react';
import { useLayoutEffect, useRef, useState, type ComponentType, type MouseEvent } from 'react';
import { logoutAction } from '@/app/admin/actions';
import { initials } from '@/lib/content/select';
import type { DraftDocument } from '@/lib/content/store';
import type { StorageMode } from '@/lib/storage';
import { PreviewPane } from './preview';
import {
  goTo,
  previewPathFor,
  sectionHref,
  SECTIONS,
  useRoute,
  type Route,
  type SectionKey,
  type SectionMeta,
} from './router';
import { AboutSection } from './sections/about';
import { DesignSection } from './sections/design';
import { HeroSection } from './sections/hero';
import { HistorySection } from './sections/history';
import { SectionsSection } from './sections/home-sections';
import { ExperienceSection, SkillsSection, TestimonialsSection } from './sections/lists';
import { MediaSection } from './sections/media';
import { OverviewSection } from './sections/overview';
import { ProfileSection } from './sections/profile';
import { ProjectsSection } from './sections/projects';
import { SeoSection } from './sections/seo';
import { ContactSection, NavigationSection } from './sections/site-text';
import { WritingSection } from './sections/writing';
import { CONTENT_AREAS, contentIssues } from './shared-fields';
import { ConfirmHost, Sheet, ToastHost } from './sheet';
import { AdminProvider, deepEqual, useAdmin, useStore, useUnpublishedChanges } from './store';
import { Button, spring, useLocalFlag, useMediaQuery } from './ui';

const VIEWS: Record<SectionKey, ComponentType<{ detail: string | null }>> = {
  overview: OverviewSection,
  profile: ProfileSection,
  hero: HeroSection,
  projects: ProjectsSection,
  sections: SectionsSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  testimonials: TestimonialsSection,
  writing: WritingSection,
  about: AboutSection,
  contact: ContactSection,
  navigation: NavigationSection,
  design: DesignSection,
  seo: SeoSection,
  media: MediaSection,
  history: HistorySection,
};

export function AdminApp({ initial, storage }: { initial: DraftDocument; storage: StorageMode }) {
  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <AdminProvider initial={initial} storage={storage}>
        <Shell />
      </AdminProvider>
    </MotionConfig>
  );
}

function Shell() {
  const route = useRoute();
  const isPhone = useMediaQuery('(max-width: 760px)');
  const saved = useAdmin((state) => state.saved);
  const nonce = useAdmin((state) => state.previewNonce);
  const [previewOpen, setPreviewOpen] = useLocalFlag('portfolio-admin-preview-open');

  // On a phone the section stays in place while it slides away after going back.
  const [lastSection, setLastSection] = useState<SectionKey>('overview');
  if (route.section && route.section !== lastSection) setLastSection(route.section);
  const shown = isPhone ? lastSection : (route.section ?? 'overview');
  const pushed = route.section !== null;

  const scrollerRef = useRef<HTMLElement>(null);
  const scrollMemory = useRef(new Map<string, number>());
  const scrollKey = `${shown}/${route.detail ?? ''}`;
  const currentKey = useRef(scrollKey);

  useLayoutEffect(() => {
    currentKey.current = scrollKey;
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollMemory.current.get(scrollKey) ?? 0;
  }, [scrollKey]);

  const View = VIEWS[shown];
  const detail = isPhone && !pushed ? null : route.detail;

  /** In-panel links stay real anchors, so they can still be opened in a new tab. */
  const onLinkClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = (event.target as Element).closest('a[href^="#"]')?.getAttribute('href');
    if (!href) return;
    event.preventDefault();
    goTo(href);
  };

  return (
    <div className="a-shell" data-pushed={pushed} data-preview={previewOpen} onClick={onLinkClick}>
      <Sidebar active={isPhone ? null : shown} inert={isPhone && pushed} />
      <motion.main
        ref={scrollerRef}
        layoutScroll
        className="a-main"
        inert={isPhone && !pushed}
        onScroll={(event) => scrollMemory.current.set(currentKey.current, event.currentTarget.scrollTop)}
      >
        <TopBar
          section={shown}
          detail={detail}
          previewOpen={previewOpen}
          onTogglePreview={() => setPreviewOpen(!previewOpen)}
        />
        <div className="a-content">
          <View detail={detail} />
        </div>
      </motion.main>
      <PreviewPane
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={previewPathFor(routeOf(shown, detail), saved)}
        nonce={nonce}
      />
      <GlobalSheets />
      <ToastHost />
    </div>
  );
}

function routeOf(section: SectionKey, detail: string | null): Route {
  return { section, detail };
}

/* Sidebar ------------------------------------------------------------------ */

const GROUPS: SectionMeta['group'][] = ['start', 'content', 'site', 'files'];

function Sidebar({ active, inert }: { active: SectionKey | null; inert: boolean }) {
  const store = useStore();
  const profile = useAdmin((state) => state.draft.profile);
  const [query, setQuery] = useState('');
  const search = query.trim().toLowerCase();
  const matches = search
    ? SECTIONS.filter((meta) => `${meta.label} ${meta.keywords}`.toLowerCase().includes(search))
    : SECTIONS;

  return (
    <nav className="a-side" aria-label="Sections" inert={inert}>
      <div className="a-side-inner">
        <h1 className="a-side-large-title a-phone-only">Settings</h1>

        <a className="a-side-account" href={sectionHref('profile')}>
          <span className="a-side-avatar">
            {profile.avatar.src ? <img src={profile.avatar.src} alt="" /> : initials(profile.name || 'Your name')}
          </span>
          <span className="a-item-text">
            <span className="a-item-title">{profile.name || 'Your name'}</span>
            <span className="a-item-subtitle">Your portfolio</span>
          </span>
        </a>

        <div className="a-side-search">
          <Search size={14} aria-hidden />
          <label className="a-sr" htmlFor="a-side-search">
            Search settings
          </label>
          <input
            id="a-side-search"
            type="search"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {search ? (
          matches.length ? (
            <ul className="a-side-group">
              {matches.map((meta) => (
                <SidebarItem key={meta.key} meta={meta} active={meta.key === active} />
              ))}
            </ul>
          ) : (
            <p className="a-side-none">Nothing matches “{query.trim()}”.</p>
          )
        ) : (
          GROUPS.map((group) => (
            <ul key={group} className="a-side-group">
              {SECTIONS.filter((meta) => meta.group === group).map((meta) => (
                <SidebarItem key={meta.key} meta={meta} active={meta.key === active} />
              ))}
            </ul>
          ))
        )}

        <form
          className="a-side-foot"
          action={async () => {
            await store.saveNow();
            await logoutAction();
          }}
        >
          <button type="submit" className="a-side-signout">
            <LogOut size={14} aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}

function SidebarItem({ meta, active }: { meta: SectionMeta; active: boolean }) {
  const Icon = meta.icon;
  return (
    <li>
      <a className="a-side-item" href={sectionHref(meta.key)} aria-current={active ? 'page' : undefined}>
        <span className="a-side-icon" style={{ backgroundColor: meta.color }}>
          <Icon size={14} aria-hidden />
        </span>
        <span className="a-side-label">{meta.label}</span>
        <ChevronRight size={15} aria-hidden className="a-side-chevron a-phone-only" />
      </a>
    </li>
  );
}

/* Top bar ------------------------------------------------------------------ */

function useDetailTitle(section: SectionKey, detail: string | null) {
  return useAdmin((state) => {
    if (!detail) return null;
    if (section === 'projects') {
      const project = state.draft.projects.find((entry) => entry.id === detail);
      return project ? project.title || 'Untitled project' : null;
    }
    if (section === 'writing') {
      const post = state.draft.posts.find((entry) => entry.id === detail);
      return post ? post.title || 'Untitled post' : null;
    }
    return null;
  });
}

function TopBar({
  section,
  detail,
  previewOpen,
  onTogglePreview,
}: {
  section: SectionKey;
  detail: string | null;
  previewOpen: boolean;
  onTogglePreview: () => void;
}) {
  const meta = SECTIONS.find((entry) => entry.key === section) ?? SECTIONS[0];
  const detailTitle = useDetailTitle(section, detail);
  const unpublished = useUnpublishedChanges();
  const isSample = useAdmin((state) => state.draft.isSample);
  const store = useStore();
  const [publishOpen, setPublishOpen] = useState(false);
  const canPublish = (unpublished || isSample) && store.storage !== 'none';

  return (
    <header className="a-topbar">
      {detail ? (
        <a className="a-back" href={sectionHref(section)}>
          <ChevronLeft size={18} aria-hidden />
          <span>{meta.label}</span>
        </a>
      ) : (
        <a className="a-back a-phone-only" href="#">
          <ChevronLeft size={18} aria-hidden />
          <span>Settings</span>
        </a>
      )}
      <h1 className="a-topbar-title">{detail ? (detailTitle ?? meta.label) : meta.label}</h1>
      <div className="a-topbar-tools">
        <SaveStatus />
        <button
          type="button"
          className="a-topbar-preview"
          aria-pressed={previewOpen}
          aria-label="Preview"
          onClick={onTogglePreview}
        >
          <PanelRight size={16} aria-hidden />
          <span className="a-wide-only">Preview</span>
        </button>
        <button
          type="button"
          className="a-publish"
          disabled={!canPublish}
          title={canPublish ? undefined : store.storage === 'none' ? 'Connect storage first' : 'Everything is live'}
          onClick={() => setPublishOpen(true)}
        >
          Publish
        </button>
      </div>
      <PublishSheet open={publishOpen} onClose={() => setPublishOpen(false)} />
    </header>
  );
}

function SaveStatus() {
  const store = useStore();
  const save = useAdmin((state) => state.save);

  if (save.status === 'saving') {
    return (
      <span className="a-save" role="status">
        <LoaderCircle size={14} className="a-spin" aria-hidden />
        <span className="a-save-text">Saving…</span>
      </span>
    );
  }
  if (save.status === 'error') {
    return (
      <span className="a-save is-error" role="alert" title={save.message}>
        <CircleAlert size={14} aria-hidden />
        <span className="a-save-text">Couldn’t save</span>
        <button type="button" onClick={() => void store.saveNow()}>
          Retry
        </button>
      </span>
    );
  }
  if (save.status === 'unavailable') {
    return (
      <span className="a-save is-error" title="Connect a Vercel Blob store to save. See Overview.">
        <CloudOff size={14} aria-hidden />
        <span className="a-save-text">Not connected</span>
      </span>
    );
  }
  return (
    <span className="a-save" role="status">
      <Check size={14} aria-hidden />
      <span className="a-save-text">Saved</span>
    </span>
  );
}

/* Publish ------------------------------------------------------------------ */

function PublishSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const draft = useAdmin((state) => state.draft);
  const published = useAdmin((state) => state.published);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed = open
    ? CONTENT_AREAS.filter(([key]) => !deepEqual(draft[key], published[key])).map(([, label]) => label)
    : [];
  const issues = open ? contentIssues(draft) : [];

  const publish = async () => {
    setPublishing(true);
    setError(null);
    const outcome = await store.publish();
    setPublishing(false);
    if (outcome.status === 'failed') {
      setError(outcome.message);
      return;
    }
    onClose();
    if (outcome.status === 'live') {
      store.toast('Your site is live', { link: { label: 'View site', href: '/' } });
    }
  };

  return (
    <Sheet
      open={open}
      onClose={() => {
        if (!publishing) onClose();
      }}
      title="Publish your site?"
      description={
        draft.isSample && !changed.length
          ? 'Visitors will see this content, and search engines will be allowed to list your site.'
          : 'These changes go live for everyone straight away.'
      }
      footer={
        <>
          <Button disabled={publishing} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="tint" disabled={publishing} onClick={() => void publish()}>
            {publishing ? 'Publishing…' : 'Publish'}
          </Button>
        </>
      }
    >
      {changed.length ? (
        <ul className="a-publish-list">
          {changed.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : null}
      {issues.length ? (
        <div className="a-publish-issues">
          <p>Worth checking first:</p>
          <ul>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? (
        <p className="a-upload-error" role="alert">
          {error}
        </p>
      ) : null}
    </Sheet>
  );
}

/* Sheets that can appear from anywhere ------------------------------------- */

function GlobalSheets() {
  const store = useStore();
  const conflict = useAdmin((state) => state.conflict);
  const recovery = useAdmin((state) => state.recovery);
  const [busy, setBusy] = useState(false);

  const resolve = async (action: () => Promise<void>) => {
    setBusy(true);
    await action();
    setBusy(false);
  };

  return (
    <>
      <ConfirmHost />
      <Sheet
        open={conflict}
        persistent
        onClose={() => undefined}
        title="This was changed in another tab"
        description="A newer version was saved while you were working here. You can load that version, which discards your edits in this tab, or keep yours, which replaces it."
        footer={
          <>
            <Button disabled={busy} onClick={() => void resolve(() => store.reloadLatest())}>
              Reload latest
            </Button>
            <Button variant="tint" disabled={busy} onClick={() => void resolve(() => store.keepMine())}>
              Keep mine
            </Button>
          </>
        }
      />
      <Sheet
        open={recovery !== null && !conflict}
        persistent
        onClose={() => undefined}
        title="Restore your unsaved work?"
        description={
          recovery
            ? `This device has edits from ${new Date(recovery.savedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} that didn’t reach the server.`
            : undefined
        }
        footer={
          <>
            <Button onClick={() => store.discardRecovery()}>Discard</Button>
            <Button variant="tint" onClick={() => store.restoreRecovery()}>
              Restore
            </Button>
          </>
        }
      />
    </>
  );
}
