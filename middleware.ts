import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken, COOKIE_NAME } from '@/lib/auth-verify-edge';

const PUBLIC_PATHS = ['/login'];
const PUBLIC_PREFIXES = ['/_next', '/api/auth'];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (pathname.startsWith('/favicon') || pathname.includes('.')) return true; // static
  return false;
}

export async function middleware(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  // No signing secret = no protection (e.g. local dev)
  if (!process.env.APP_PASSWORD && !process.env.COOKIE_SECRET) {
    return NextResponse.next();
  }
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = await verifyAuthToken(token);
  if (!valid) {
    const login = new URL('/login', request.url);
    login.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
