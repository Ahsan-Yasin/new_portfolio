import 'server-only';

import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken, isValidSessionToken, MIN_PASSWORD_LENGTH, SESSION_COOKIE, SESSION_DAYS } from './token';

export type PasswordStatus = 'ok' | 'missing' | 'too-short';

export function passwordStatus(): PasswordStatus {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return 'missing';
  return password.length < MIN_PASSWORD_LENGTH ? 'too-short' : 'ok';
}

export function isCorrectPassword(attempt: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  // Hashing first gives equal-length buffers, so the comparison reveals nothing about length.
  const a = createHash('sha256').update(attempt).digest();
  const b = createHash('sha256').update(password).digest();
  return timingSafeEqual(a, b);
}

export async function isAuthenticated() {
  const store = await cookies();
  return isValidSessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAuthenticated())) redirect('/admin/login');
}

export async function startSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Slows repeated guesses. Serverless instances don't share memory, so this limits
 * each instance rather than the whole deployment. It can't protect a password that's
 * easy to guess, so a long, unusual one is still the real defence.
 */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function loginBlockedForSeconds(client: string) {
  const entry = attempts.get(client);
  if (!entry || entry.resetAt < Date.now() || entry.count < MAX_ATTEMPTS) return 0;
  return Math.ceil((entry.resetAt - Date.now()) / 1000);
}

export function recordFailedLogin(client: string) {
  const now = Date.now();
  const entry = attempts.get(client);
  if (!entry || entry.resetAt < now) attempts.set(client, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;

  if (attempts.size > 5000) {
    for (const [key, value] of attempts) if (value.resetAt < now) attempts.delete(key);
  }
}

export function clearFailedLogins(client: string) {
  attempts.delete(client);
}
