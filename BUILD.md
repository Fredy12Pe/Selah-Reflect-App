# Selah Reflect App Build System

This document describes the build system for the Selah Reflect App, including the various build options, environment variables, and troubleshooting steps.

## Build Scripts

The application includes several build scripts to handle different scenarios:

| Script                  | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `build`                 | Standard Next.js build                            |
| `build:client`          | Netlify build with Firebase patching              |
| `build:client:no-patch` | Netlify build without Firebase patching           |
| `build:netlify-fix`     | Build with additional fixes for Firebase issues   |
| `build:emergency`       | Minimal emergency build that skips Firebase       |
| `build:super-emergency` | Ultra minimal build with no Firebase dependencies |
| `build:static-fallback` | Static HTML fallback (no Next.js build)           |
| `build:no-font`         | Build without Next.js font optimization           |
| `build:netlify-no-font` | Netlify build without Next.js font optimization   |

## Environment Variables

The build system uses several environment variables to control behavior:

| Variable                       | Description                               |
| ------------------------------ | ----------------------------------------- |
| `NETLIFY`                      | Set to `true` when building for Netlify   |
| `SKIP_API_ROUTES`              | Skip API routes during build              |
| `SKIP_FIREBASE_ADMIN`          | Skip Firebase Admin initialization        |
| `SKIP_FIREBASE_INIT_ON_BUILD`  | Skip Firebase initialization during build |
| `SKIP_FIREBASE_PATCH`          | Skip Firebase patching                    |
| `SKIP_FIREBASE`                | Skip all Firebase-related code            |
| `NEXT_PUBLIC_IS_NETLIFY_BUILD` | Indicates a Netlify build to client code  |
| `NEXT_STATIC_EXPORT`           | Controls static export option             |
| `STRICT_VERSION_CHECK`         | Enforce version requirements              |

## Netlify Build Chain

The Netlify build command in `netlify.toml` tries multiple build approaches in sequence:

```
npm run build:netlify-fix || npm run build:client:no-patch || npm run build:emergency || npm run build:super-emergency || npm run build:static-fallback
```

This creates a fallback chain:

1. First try the build with Firebase fixes
2. If that fails, try building without Firebase patches
3. If that fails, try the emergency build option
4. If that fails, try the super emergency build with minimal dependencies
5. If all else fails, generate a static HTML fallback page

## Firebase Patches

The application includes several patch scripts to handle Firebase compatibility issues:

### `patches/firebase-storage-fix/patch-node-imports.js`

Replaces `node:` URI imports with regular imports to fix webpack build errors.

### `lib/firebase/patch.js`

Adds missing functions that Firebase Auth expects on the window object.

## Troubleshooting

### Common Build Issues

1. **Firebase Initialization Errors**

   - Use `SKIP_FIREBASE_INIT_ON_BUILD=true` to bypass Firebase initialization
   - Check if the Firebase config environment variables are set correctly

2. **Font Loading Issues**

   - Use one of the `build:no-font` scripts to disable Next.js font optimization
   - This replaces the layout file with a version that doesn't use `next/font`

3. **Memory Issues**
   - The build uses `NODE_OPTIONS='--max-old-space-size=4096'` to increase available memory
   - Increase this value if you encounter out-of-memory errors

### Emergency Build Options

The app includes multiple emergency build options when the standard build fails:

#### 1. Emergency Build (`netlify-emergency-build.js`)

- Skips Firebase initialization
- Creates a simplified layout and page
- Still uses the Next.js build process

#### 2. Super Emergency Build (`netlify-super-emergency-build.js`)

- Creates completely static pages with no Firebase dependencies
- Replaces critical files with simplified versions
- Provides a barebones but functional app

#### 3. Static Fallback (`netlify-static-fallback.js`)

- Ultimate fallback option
- Skips the Next.js build entirely
- Generates a simple static HTML maintenance page
- Ensures the site is always available even when all build methods fail

Use these in order of preference, falling back to more drastic measures only when necessary.

## Version Requirements

The application requires:

- Node.js >= 20.11.1
- npm >= 10.2.4 (recommended)

Run `node scripts/check-versions.js` to verify your current versions.
