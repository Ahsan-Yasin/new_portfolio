import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The `.admin` scope is applied by each page rather than here, because the draft
 * preview also lives under /admin and has to render with the site's own styles.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
