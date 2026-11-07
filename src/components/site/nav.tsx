'use client';

import { Moon, Search, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { gsap } from '@/components/motion/gsap';
import { safeHref, type NavItem, type Social } from '@/lib/content/schema';
import { OPEN_COMMAND_MENU } from './command-menu';
import { SiteLink } from './site-link';

export function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    // Without storage the choice simply lasts for this page view.
  }
}

type Props = {
  name: string;
  items: NavItem[];
  socials: Social[];
  contactLabel: string;
  contactHref: string;
  email: string;
  showThemeToggle: boolean;
  showCommandMenu: boolean;
};

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href);
}

function NavAnchor({
  href,
  children,
  ...props
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
  children: React.ReactNode;
}) {
  if (isExternal(href)) {
    return (
      <a href={href} {...props} {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {children}
      </a>
    );
  }
  return (
    <SiteLink href={href} {...props}>
      {children}
    </SiteLink>
  );
}

/**
 * A compact black pill that opens a full-height menu. Layers of colour sweep in from
 * the right, then the links rise into place one after another.
 */
export function Nav({ name, items, socials, contactLabel, contactHref, email, showThemeToggle, showCommandMenu }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const isHome = pathname === '/' || pathname === '/admin/preview';

  const links = items.flatMap((item) => {
    const href = safeHref(item.href);
    return href ? [{ id: item.id, label: item.label, href }] : [];
  });
  if (contactHref && contactLabel) links.push({ id: 'contact', label: contactLabel, href: contactHref });

  useEffect(() => {
    const root = panelRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layers = root.querySelectorAll('.menu-layer');
    const rows = root.querySelectorAll('.menu-row > *');
    const extras = root.querySelectorAll('.menu-extra');

    const tl = gsap.timeline({
      paused: true,
      onReverseComplete: () => {
        gsap.set(root, { visibility: 'hidden' });
      },
    });
    tl.set(root, { visibility: 'visible' });
    tl.fromTo(layers, { xPercent: 100 }, { xPercent: 0, duration: reduced ? 0.01 : 0.72, ease: 'power4.out', stagger: reduced ? 0 : 0.075 }, 0);
    tl.fromTo(rows, { yPercent: 130, rotate: 7 }, { yPercent: 0, rotate: 0, duration: reduced ? 0.01 : 1, ease: 'power4.out', stagger: reduced ? 0 : 0.07 }, reduced ? 0 : 0.26);
    tl.fromTo(extras, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: reduced ? 0.01 : 0.6, stagger: reduced ? 0 : 0.06 }, reduced ? 0 : 0.56);
    timeline.current = tl;
    return () => {
      tl.kill();
    };
  }, [links.length]);

  const close = useCallback(() => {
    setOpen(false);
    timeline.current?.timeScale(1.7).reverse();
  }, []);

  const toggle = () => {
    if (open) {
      close();
    } else {
      setOpen(true);
      timeline.current?.timeScale(1).play();
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <>
      <header className="no-print pointer-events-none fixed inset-x-0 top-[clamp(10px,1.6vh,18px)] z-[80] flex justify-center">
        <div
          {...(isHome ? { 'data-intro': true } : {})}
          className="site-nav-pill pointer-events-auto flex h-12 items-center gap-[clamp(28px,5vw,72px)] rounded-[14px] bg-[#111] pl-5 pr-1.5 text-[#f4f1ea] shadow-[0_12px_40px_rgba(0,0,0,.28)]"
        >
          <SiteLink href="/" data-cursor="Home" className="truncate text-[0.9375rem] font-semibold tracking-[-0.01em]" onClick={open ? close : undefined}>
            {name}
          </SiteLink>
          <button
            ref={buttonRef}
            type="button"
            data-magnetic
            onClick={toggle}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-9 w-11 cursor-pointer place-items-center rounded-[10px] bg-[#f4f1ea] text-[#111]"
          >
            <span aria-hidden className="relative block h-3 w-[18px]">
              <span className={`absolute left-0 h-[2px] w-full rounded bg-current transition-transform duration-300 ${open ? 'top-[5px] rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-[2px] w-full rounded bg-current transition-transform duration-300 ${open ? 'top-[5px] -rotate-45' : 'top-[10px]'}`} />
            </span>
          </button>
        </div>
      </header>

      <div ref={panelRef} id={menuId} className="no-print invisible fixed inset-y-0 right-0 z-[70] w-[min(100vw,640px)] overflow-hidden" {...(open ? {} : { inert: true })}>
        <div className="menu-layer absolute inset-0 bg-accent" />
        <div className="menu-layer absolute inset-0 bg-[#f4f1ea]" />
        <div className="menu-layer absolute inset-0 flex flex-col justify-between bg-[#111] px-[clamp(24px,4vw,56px)] pb-8 pt-[clamp(84px,13vh,120px)] text-[#f4f1ea]">
          <nav aria-label="Main">
            <ul>
              {links.map((link, index) => (
                <li key={link.id} className="menu-row overflow-hidden">
                  <NavAnchor href={link.href} onClick={close} className="group flex origin-[0_100%] items-baseline gap-4 py-1 will-change-transform">
                    <span className="t-micro w-6 flex-none tabular-nums text-accent">{String(index + 1).padStart(2, '0')}</span>
                    <span className="t-hero transition-transform duration-500 ease-out group-hover:translate-x-3 group-hover:text-accent">
                      {link.label}
                    </span>
                  </NavAnchor>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            {email ? (
              <a href={`mailto:${email}`} className="menu-extra t-small block font-medium underline underline-offset-4">
                {email}
              </a>
            ) : null}
            <ul className="menu-extra t-small mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((social) => {
                const href = safeHref(social.url);
                return href ? (
                  <li key={social.id}>
                    <a href={href} target="_blank" rel="noreferrer" className="text-[#a8a498] hover:text-[#f4f1ea]">
                      {social.label}
                    </a>
                  </li>
                ) : null;
              })}
            </ul>
            <div className="menu-extra mt-6 flex gap-2">
              {showCommandMenu ? (
                <button
                  type="button"
                  onClick={() => {
                    close();
                    window.dispatchEvent(new Event(OPEN_COMMAND_MENU));
                  }}
                  className="btn btn-small cursor-pointer bg-white/10 hover:bg-white/20"
                >
                  <Search size={15} aria-hidden />
                  Search
                </button>
              ) : null}
              {showThemeToggle ? (
                <button type="button" onClick={toggleTheme} className="btn btn-small cursor-pointer bg-white/10 hover:bg-white/20">
                  <Sun size={15} className="hidden dark:block" aria-hidden />
                  <Moon size={15} className="block dark:hidden" aria-hidden />
                  Appearance
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
