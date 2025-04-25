"use strict";
/**
 * Environment detection utilities to help with SSR/SSG issues
 * and prevent initialization errors during build time
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeFirebaseAccess = exports.runInBrowser = exports.shouldSkipFirebaseInit = exports.isBuildProcess = exports.shouldSkipFirebaseAdmin = exports.shouldSkipApiRoutes = exports.isNetlifyBuild = exports.isNetlify = exports.isBrowser = void 0;
// Check if we're in a browser environment
var isBrowser = function () { return typeof window !== 'undefined'; };
exports.isBrowser = isBrowser;
// Check if we're in a Netlify environment
exports.isNetlify = process.env.NETLIFY === 'true';
// Check if we're in a Netlify build environment (not runtime)
exports.isNetlifyBuild = exports.isNetlify &&
    process.env.NEXT_PUBLIC_NETLIFY_CONTEXT === 'production' &&
    !(0, exports.isBrowser)();
// Check if API routes should be skipped (build time)
exports.shouldSkipApiRoutes = process.env.SKIP_API_ROUTES === 'true';
// Check if Firebase Admin should be skipped (build time)
exports.shouldSkipFirebaseAdmin = process.env.SKIP_FIREBASE_ADMIN === 'true';
// Check if we're in a build process that should skip Firebase initialization
exports.isBuildProcess = process.env.NEXT_PUBLIC_IS_NETLIFY_BUILD === 'true' ||
    exports.isNetlifyBuild ||
    exports.shouldSkipApiRoutes;
// Check if Firebase initialization should be skipped (build time)
exports.shouldSkipFirebaseInit = (process.env.SKIP_FIREBASE_INIT_ON_BUILD === 'true' && !(0, exports.isBrowser)()) ||
    exports.isBuildProcess ||
    exports.shouldSkipFirebaseAdmin;
// Safe function to conditionally run code only in browser environment
var runInBrowser = function (callback) {
    if ((0, exports.isBrowser)()) {
        return callback();
    }
    return null;
};
exports.runInBrowser = runInBrowser;
// Helper function to safely access Firebase services
var safeFirebaseAccess = function (service, fallback) {
    if (!(0, exports.isBrowser)())
        return fallback;
    if (service === undefined)
        return fallback;
    return service;
};
exports.safeFirebaseAccess = safeFirebaseAccess;
