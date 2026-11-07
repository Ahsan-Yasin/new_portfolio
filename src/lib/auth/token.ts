import { jwtVerify, SignJWT } from 'jose';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_DAYS = 7;

/**
 * The owner chose to keep the admin password in the code instead of an environment variable,
 * knowing the repo is public. To change it, edit this line and redeploy.
 */
export const ADMIN_PASSWORD = 'admin123456';

const encoder = new TextEncoder();

/** The signing key is derived from the password, so changing the password signs out every existing session. */
async function signingKey() {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`portfolio-admin-session:${ADMIN_PASSWORD}`));
  return new Uint8Array(digest);
}

export async function createSessionToken() {
  const key = await signingKey();
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key);
}

export async function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const key = await signingKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
