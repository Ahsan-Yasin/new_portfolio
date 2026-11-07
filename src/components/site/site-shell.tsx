import type { CSSProperties, ReactNode } from 'react';
import { MotionProvider } from '@/components/motion/motion-provider';
import { safeHref, type Content } from '@/lib/content/schema';
import { publishedPosts, publishedProjects, readableOn, sectionById } from '@/lib/content/select';
import { CommandMenu, type CommandItem } from './command-menu';
import { Footer } from './footer';
import { Nav } from './nav';

/** Runs before first paint, so the theme and scroll stages are right from the very first frame. */
function themeScript(mode: string, font: string, motion: string, preview: boolean) {
  return `(function(){try{var d=document.documentElement;var s=${preview ? 'null' : "localStorage.getItem('theme')"};var m=s||${JSON.stringify(mode)};var k=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);d.dataset.theme=k?'dark':'light';d.classList.toggle('sf',${JSON.stringify(font)}==='system'&&/Mac|iPhone|iPad/.test(navigator.userAgent));var r=matchMedia('(prefers-reduced-motion: reduce)').matches;var l=${JSON.stringify(motion)};d.classList.toggle('motion-ready',!r&&l!=='off');d.classList.toggle('motion-full',!r&&l==='full')}catch(e){}})()`;
}

function commandItems(content: Content): CommandItem[] {
  return [
    { id: 'home', group: 'Pages', label: 'Home', href: '/' },
    ...content.nav
      .filter((item) => item.visible && item.href.startsWith('/') && !item.href.includes('#'))
      .map((item) => ({ id: `nav-${item.id}`, group: 'Pages', label: item.label, href: item.href })),
    ...publishedProjects(content).map((project) => ({
      id: `project-${project.id}`,
      group: 'Work',
      label: project.title,
      hint: project.client,
      href: `/work/${project.slug}`,
    })),
    ...publishedPosts(content).map((post) => ({
      id: `post-${post.id}`,
      group: 'Writing',
      label: post.title,
      href: safeHref(post.externalUrl) ?? `/writing/${post.slug}`,
    })),
    ...content.profile.socials.flatMap((social) => {
      const href = safeHref(social.url);
      return href ? [{ id: `social-${social.id}`, group: 'Elsewhere', label: social.label, href }] : [];
    }),
  ];
}

export function SiteShell({
  content,
  preview = false,
  children,
}: {
  content: Content;
  preview?: boolean;
  children: ReactNode;
}) {
  const { theme, profile } = content;
  const style = { '--accent': theme.accent, '--on-accent': readableOn(theme.accent) } as CSSProperties;
  const contactVisible = sectionById(content, 'contact')?.visible;
  const contactHref = contactVisible ? '/#contact' : profile.email ? `mailto:${profile.email}` : '';

  return (
    <div
      className="site"
      data-font={theme.font}
      data-corners={theme.corners}
      data-motion={theme.motion}
      data-surface={theme.surface}
      style={style}
    >
      <script dangerouslySetInnerHTML={{ __html: themeScript(theme.mode, theme.font, theme.motion, preview) }} />
      <MotionProvider level={theme.motion}>
        <Nav
          name={profile.name}
          items={content.nav.filter((item) => item.visible)}
          socials={profile.socials}
          contactLabel={content.contact.ctaLabel}
          contactHref={contactHref}
          email={profile.email}
          showThemeToggle={theme.showThemeToggle}
          showCommandMenu={theme.showCommandMenu}
        />
        {theme.showCommandMenu ? <CommandMenu items={commandItems(content)} email={profile.email} /> : null}
        <main className="site-main overflow-x-clip">{children}</main>
        <Footer content={content} />
      </MotionProvider>
    </div>
  );
}
