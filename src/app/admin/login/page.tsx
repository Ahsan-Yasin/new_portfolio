import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/login-form';
import { isAuthenticated } from '@/lib/auth/session';
import { getPublishedContent } from '@/lib/content/store';

export const metadata: Metadata = { title: 'Sign in' };
export const instant = false;

export default function LoginPage() {
  return (
    <div className="admin a-login-page">
      <Suspense fallback={<div className="a-login-card a-login-card-empty" aria-hidden />}>
        <LoginGate />
      </Suspense>
    </div>
  );
}

async function LoginGate() {
  await connection();
  if (await isAuthenticated()) redirect('/admin');

  return <LoginForm siteName={await siteName()} />;
}

async function siteName() {
  try {
    const content = await getPublishedContent();
    return content.profile.name || 'Your portfolio';
  } catch {
    return 'Your portfolio';
  }
}
