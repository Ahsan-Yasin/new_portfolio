import { jwtVerify, SignJWT } from 'jose';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_DAYS = 7;
export const MIN_PASSWORD_LENGTH = 12;

const encoder = new TextEncoder();

/**
 * The signing key is derived from the password, so a single environment variable is
 * enough and changing the password signs out every existing session.
 */
async function signingKey() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`portfolio-admin-session:${secret}`));
  return new Uint8Array(digest);
}

export async function createSessionToken() {
  const key = await signingKey();
  if (!key) throw new Error('ADMIN_PASSWORD is not set');
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key);
}

export async function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const key = await signingKey();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
