'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

const PREVIEW_ROOT = '/admin/preview';

/** Keeps navigation inside the draft preview when the site is shown from the admin. */
export function useSitePath(href: string) {
  const pathname = usePathname();
  if (!pathname.startsWith(PREVIEW_ROOT) || !href.startsWith('/')) return href;
  return href === '/' ? PREVIEW_ROOT : `${PREVIEW_ROOT}${href}`;
}

export function SiteLink({ href, ...props }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const resolved = useSitePath(href);
  return <Link href={resolved} {...props} />;
}
