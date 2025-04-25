/**
 * Environment detection utilities to help with SSR/SSG issues 
 * and prevent initialization errors during build time
 */

// Check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';

// Check if we're in a Netlify environment
export const isNetlify = process.env.NETLIFY === 'true';

// Check if we're in a Netlify build environment (not runtime)
export const isNetlifyBuild = 
  isNetlify && 
  process.env.NEXT_PUBLIC_NETLIFY_CONTEXT === 'production' && 
  !isBrowser;

// Check if we're in a build process that should skip Firebase initialization
export const isBuildProcess = 
  process.env.NEXT_PUBLIC_IS_NETLIFY_BUILD === 'true' || 
  isNetlifyBuild;

// Check if Firebase initialization should be skipped (build time)
export const shouldSkipFirebaseInit = 
  (process.env.SKIP_FIREBASE_INIT_ON_BUILD === 'true' && !isBrowser) || 
  isBuildProcess;

// Safe function to conditionally run code only in browser environment
export const runInBrowser = (callback: () => any) => {
  if (isBrowser) {
    return callback();
  }
  return null;
};

// Helper function to safely access Firebase services
export const safeFirebaseAccess = <T>(service: T | undefined, fallback: T): T => {
  if (!isBrowser) return fallback;
  if (service === undefined) return fallback;
  return service;
}; 