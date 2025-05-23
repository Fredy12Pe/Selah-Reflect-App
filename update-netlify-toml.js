const fs = require('fs');
const path = require('path');

const netlifyTomlContent = `[build]
  command = "node netlify-build.js"
  publish = ".next"

[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"
  NETLIFY = "true"
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
  # Explicitly set build mode to help with conditional rendering
  NEXT_PUBLIC_NETLIFY_CONTEXT = "production"
  # Skip Firebase initialization during build
  SKIP_FIREBASE_INIT_ON_BUILD = "true"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Set environment variables based on context
[context.production.environment]
  NEXT_PUBLIC_NETLIFY_CONTEXT = "production"

[context.deploy-preview.environment]
  NEXT_PUBLIC_NETLIFY_CONTEXT = "preview"

# Improve performance and security
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com https://source.unsplash.com; font-src 'self' data:; connect-src 'self' https://bible-api.com https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com;"

# Add caching headers for static assets
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# PWA manifest and icon files
[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/*.png"
  [headers.values]
    Cache-Control = "public, max-age=86400"

# For Service Worker in PWA
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

# Fix for Firebase auth redirects
[[redirects]]
  from = "/__/auth/*"
  to = "https://selah-app.firebaseapp.com/__/auth/:splat"
  status = 200

# Handle SPA fallback for client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;

const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml');

fs.writeFileSync(netlifyTomlPath, netlifyTomlContent);
console.log('netlify.toml has been updated successfully'); 