/**
 * Fix Firebase Build Issues
 * 
 * This script helps diagnose and fix Firebase initialization issues during the Netlify build.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of pages to temporarily disable during build
const ADMIN_PAGES = [
  'app/admin/page.tsx',
  'app/admin/devotions/page.tsx',
  'app/admin/generate-devotions/page.tsx',
];

// List of routes to check and remove if they exist
const ROUTE_FILES = [
  'app/admin/route.js',
  'app/admin/route.ts',
  'app/admin/devotions/route.js',
  'app/admin/devotions/route.ts',
  'app/admin/generate-devotions/route.js',
  'app/admin/generate-devotions/route.ts',
];

// Function to clean up any existing route files
function cleanupRouteFiles() {
  console.log('Checking for and removing any existing route files...');
  
  ROUTE_FILES.forEach(routePath => {
    if (fs.existsSync(routePath)) {
      fs.unlinkSync(routePath);
      console.log(`Removed existing route file: ${routePath}`);
    }
  });
}

// Function to temporarily disable admin pages
function disableAdminPages() {
  console.log('Temporarily disabling admin pages...');
  
  ADMIN_PAGES.forEach(pagePath => {
    if (fs.existsSync(pagePath)) {
      const newPath = `${pagePath}.bak`;
      fs.renameSync(pagePath, newPath);
      console.log(`Renamed ${pagePath} to ${newPath}`);
      
      // Create a simple placeholder page
      const placeholderContent = `
"use client";

export default function AdminPlaceholder() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Area</h1>
        <p>This page is only available when logged in.</p>
      </div>
    </div>
  );
}
`;
      
      fs.writeFileSync(pagePath, placeholderContent);
      console.log(`Created placeholder for ${pagePath}`);
    }
  });
}

// Function to restore admin pages
function restoreAdminPages() {
  console.log('Restoring admin pages...');
  
  ADMIN_PAGES.forEach(pagePath => {
    const backupPath = `${pagePath}.bak`;
    if (fs.existsSync(backupPath)) {
      // Remove placeholder
      if (fs.existsSync(pagePath)) {
        fs.unlinkSync(pagePath);
      }
      
      // Restore original
      fs.renameSync(backupPath, pagePath);
      console.log(`Restored ${pagePath}`);
    }
  });
}

// Function to create a build environment file
function createBuildEnvFile() {
  console.log('Creating .env.build file...');
  
  const envContent = `
# Temporary environment file for build
NETLIFY=true
SKIP_FIREBASE_INIT_ON_BUILD=true
SKIP_API_ROUTES=true
SKIP_FIREBASE_ADMIN=true
SKIP_FIREBASE_PATCH=true
NEXT_PUBLIC_IS_NETLIFY_BUILD=true
NEXT_STATIC_EXPORT=false
  `.trim();
  
  fs.writeFileSync('.env.build', envContent);
  console.log('Created .env.build file');
}

// Main function to run the build
async function runBuild() {
  try {
    // Prepare build environment
    createBuildEnvFile();
    cleanupRouteFiles();
    disableAdminPages();
    
    // Add debug info to help troubleshoot build issues
    console.log('Environment variables set for build:');
    console.log('- NETLIFY:', process.env.NETLIFY);
    console.log('- SKIP_FIREBASE_INIT_ON_BUILD:', process.env.SKIP_FIREBASE_INIT_ON_BUILD);
    console.log('- SKIP_API_ROUTES:', process.env.SKIP_API_ROUTES);
    console.log('- SKIP_FIREBASE_ADMIN:', process.env.SKIP_FIREBASE_ADMIN);
    console.log('- SKIP_FIREBASE_PATCH:', process.env.SKIP_FIREBASE_PATCH);
    console.log('- NEXT_PUBLIC_IS_NETLIFY_BUILD:', process.env.NEXT_PUBLIC_IS_NETLIFY_BUILD);
    
    // Run the build with clean environment
    console.log('Running Next.js build...');
    
    // Use a try-catch block specifically for the build command
    try {
      execSync('next build', { 
        stdio: 'inherit',
        env: {
          ...process.env,
          NETLIFY: 'true',
          SKIP_FIREBASE_INIT_ON_BUILD: 'true',
          SKIP_API_ROUTES: 'true',
          SKIP_FIREBASE_ADMIN: 'true',
          SKIP_FIREBASE_PATCH: 'true',
          NEXT_PUBLIC_IS_NETLIFY_BUILD: 'true',
          NEXT_STATIC_EXPORT: 'false'
        }
      });
      console.log('Build completed successfully!');
    } catch (buildError) {
      console.error('Build command failed:');
      console.error('Error message:', buildError.message);
      console.error('Error code:', buildError.code);
      
      // Try a simpler build approach as fallback
      console.log('Trying fallback build approach...');
      
      execSync('SKIP_FIREBASE_INIT_ON_BUILD=true SKIP_API_ROUTES=true SKIP_FIREBASE_ADMIN=true next build', { 
        stdio: 'inherit'
      });
    }
  } catch (error) {
    console.error('Build script failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up
    restoreAdminPages();
    if (fs.existsSync('.env.build')) {
      fs.unlinkSync('.env.build');
      console.log('Removed .env.build file');
    }
  }
}

// Run the build
runBuild().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
}); 