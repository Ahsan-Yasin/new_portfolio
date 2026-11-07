import { NextResponse, type NextRequest } from 'next/server';
import { isValidSessionToken, SESSION_COOKIE } from '@/lib/auth/token';

/**
 * A fast first gate for the admin. Every admin page, server action and upload
 * route verifies the session again itself, so this only spares a render.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();

  const signedIn = await isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (signedIn) return NextResponse.next();
  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: ['/admin/:path*'],
};
