/**
 * Improved build script for Selah Reflect App
 * 
 * This script runs the Next.js build and copies all necessary files 
 * to create a complete static build output that can be deployed.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const NEXT_BUILD_DIR = '.next';
const OUTPUT_DIR = 'out';
const PUBLIC_DIR = 'public';
const HTML_PATHS = [
  '_next/data',
  'auth',
  'dashboard',
  'journal',
  'profile',
  'login',
  'signup',
];

console.log('🚀 Starting improved build process...');

try {
  // Step 1: Run Next.js build with environment variables
  console.log('📦 Running Next.js build...');
  execSync('SKIP_API_ROUTES=true SKIP_FIREBASE_ADMIN=true node patches/firebase-storage-fix/patch-node-imports.js && NETLIFY=true next build', { 
    stdio: 'inherit' 
  });
  console.log('✅ Next.js build completed successfully');

  // Step 2: Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
  } else {
    console.log(`📁 Using existing output directory: ${OUTPUT_DIR}`);
  }

  // Step 3: Copy static assets from .next/static to out/_next/static
  const staticDir = path.join(NEXT_BUILD_DIR, 'static');
  const outputStaticDir = path.join(OUTPUT_DIR, '_next/static');
  
  if (fs.existsSync(staticDir)) {
    copyDirRecursive(staticDir, outputStaticDir);
    console.log('📋 Copied static assets to output directory');
  } else {
    console.error('❌ Static directory not found, build may be incomplete');
  }

  // Step 4: Copy HTML files for various routes
  HTML_PATHS.forEach(htmlPath => {
    const outputHtmlDir = path.join(OUTPUT_DIR, htmlPath);
    if (!fs.existsSync(outputHtmlDir)) {
      fs.mkdirSync(outputHtmlDir, { recursive: true });
    }
    
    // Create index.html for each path
    const indexHtml = generateIndexHtml();
    fs.writeFileSync(path.join(outputHtmlDir, 'index.html'), indexHtml);
  });
  console.log('📋 Created HTML files for all routes');

  // Step 5: Copy root index.html
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), generateIndexHtml());
  console.log('📋 Created root index.html');

  // Step 6: Copy public files
  if (fs.existsSync(PUBLIC_DIR)) {
    copyDirRecursive(PUBLIC_DIR, OUTPUT_DIR);
    console.log('📋 Copied public files to output directory');
  } else {
    console.warn('⚠️ Public directory not found');
  }

  // Step 7: Create 404.html as a fallback
  fs.writeFileSync(path.join(OUTPUT_DIR, '404.html'), generateIndexHtml());
  console.log('📋 Created 404.html fallback');

  // Step 8: Create a README.md file explaining the build
  const readmeContent = `# Selah Reflect App - Static Build

This directory contains a hybrid static build of the Selah Reflect App.
It was generated using the improved-build.js script.

The build includes:
- Next.js static assets
- Public files
- HTML fallbacks for client-side routing

To deploy this build, simply upload the contents of this directory to your hosting provider.
`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readmeContent);
  console.log('📋 Created README.md');

  console.log('🎉 Build completed successfully! Output is in the ./out directory');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

/**
 * Helper function to copy a directory recursively
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Helper function to generate index.html content
 */
function generateIndexHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Selah Reflect App" />
    <title>Selah Reflect App</title>
    <link rel="stylesheet" href="/_next/static/css/app.css" />
    <script src="/firebase-patch.js"></script>
    <script src="/_next/static/chunks/main.js" defer></script>
    <script src="/_next/static/chunks/pages/_app.js" defer></script>
    <script src="/_next/static/chunks/pages/index.js" defer></script>
  </head>
  <body>
    <div id="__next"></div>
    <script>
      // Minimal routing script to handle client-side navigation
      window.__NEXT_DATA__ = {
        props: {},
        page: "/",
        query: {},
        buildId: "static-build"
      };
    </script>
  </body>
</html>`;
} 