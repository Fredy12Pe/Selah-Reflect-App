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
  "/firebase-fix.js",
  "/firebase-patch.js",
  "/icon-192.png",
  "/icon-512.png",
  "/splash.png",
  "/google.svg",
  "/sw.js",
  "/workbox-4754cb34.js",
  "/index.html",
  "/"
]

// List of static file extensions to ignore
const STATIC_EXTENSIONS = [
  "js", "css", "svg", "png", "jpg", "jpeg", "gif", "webp", 
  "ico", "json", "woff", "woff2", "ttf", "eot", "wav", 
  "mp3", "mp4", "webm"
];

// This middleware ensures proper handling of auth and dynamic routes on Netlify
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log('[Middleware] Processing request for:', path);

  // Check if the path is a static asset or public path
  const isPublicPath = PUBLIC_PATHS.some(publicPath => 
    path.startsWith(publicPath)
  );
  
  // Comprehensive static asset check that works with Netlify's URL patterns
  const isStaticAsset = (
    // Regular static assets ending with file extensions
    STATIC_EXTENSIONS.some(ext => path.endsWith(`.${ext}`)) ||
    // Next.js static chunks
    path.includes('/_next/static/') ||
    // Netlify hosted static files
    path.startsWith('/.netlify/') ||
    // Firebase related paths
    path.includes('/__/') ||
    // PWA assets
    path === '/sw.js' || 
    path === '/workbox-4754cb34.js' ||
    path === '/manifest.json' ||
    // Monitoring the path includes any hashed chunks
    /chunks|webpack|images/.test(path)
  );

  // Always allow static assets through without authentication
  if (isStaticAsset) {
    console.log('[Middleware] Static asset detected, skipping auth check:', path);
    return NextResponse.next();
  }

  // Get the session cookie
  const sessionCookie = request.cookies.get('session');

  // If there's no session cookie and the path is not public, redirect to login
  if (!sessionCookie && !isPublicPath) {
    console.log('[Middleware] No session cookie found, redirecting to login');
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }

  // If there's a session cookie and trying to access login page, redirect to home
  if (sessionCookie && path === '/auth/login') {
    console.log('[Middleware] Session cookie found on login page, redirecting to devotions');
    return NextResponse.redirect(new URL('/devotion/2025-04-18', request.url));
  }

  // For root path, redirect to today's devotion
  if (path === '/' && sessionCookie) {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    console.log('[Middleware] Root path with auth, redirecting to today\'s devotion');
    return NextResponse.redirect(new URL(`/devotion/${dateString}`, request.url));
  }

  console.log('[Middleware] Proceeding with request');
  return NextResponse.next();
}

// Configure paths that need middleware (fixed to avoid capturing groups)
export const config = {
  matcher: [
    // Application routes requiring auth checks
    '/devotion/:path*',
    '/admin/:path*',
    '/hymns/:path*',
    '/auth/:path*',
    '/'
  ],
} 