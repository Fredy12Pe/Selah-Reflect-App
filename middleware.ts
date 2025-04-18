import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that don't require authentication
const PUBLIC_PATHS = [
  "/auth/login",
  "/_next",
  "/api",
  "/favicon.ico",
  "/manifest.json",
  "/images",
]

export async function middleware(request: NextRequest) {
  console.log('[Middleware] Processing request for:', request.nextUrl.pathname);

  // Check if the path is public
  const isPublicPath = PUBLIC_PATHS.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Get the session cookie
  const sessionCookie = request.cookies.get('session');

  // If there's no session cookie and the path is not public, redirect to login
  if (!sessionCookie && !isPublicPath) {
    console.log('[Middleware] No session cookie found, redirecting to login');
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If there's a session cookie and trying to access login page, redirect to home
  if (sessionCookie && request.nextUrl.pathname === '/auth/login') {
    console.log('[Middleware] Session cookie found on login page, redirecting to devotions');
    return NextResponse.redirect(new URL('/devotion/2025-04-18', request.url));
  }

  console.log('[Middleware] Proceeding with request');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 