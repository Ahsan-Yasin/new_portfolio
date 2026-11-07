import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfolio',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
