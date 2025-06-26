import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'lapzen_auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const isAuthenticated = request.cookies.has(AUTH_COOKIE_NAME);

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
    
  if (pathname.startsWith('/login')) {
      const isAuthenticated = request.cookies.has(AUTH_COOKIE_NAME);
      if (isAuthenticated) {
          const adminUrl = new URL('/admin', request.url);
          return NextResponse.redirect(adminUrl);
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
