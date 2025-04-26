// A simplified build script for Firebase deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Firebase build process...');

// Clean build directories
console.log('Cleaning output directories...');
try {
  execSync('rm -rf .next out', { stdio: 'inherit' });
} catch (error) {
  console.error('Error cleaning directories:', error);
}

// Fix the problematic process/browser.js file
console.log('Replacing process module with custom shim...');
const processBrowserPath = path.join(process.cwd(), 'node_modules', 'process', 'browser.js');
const customShimPath = path.join(process.cwd(), 'shims', 'process-browser.js');

if (fs.existsSync(processBrowserPath) && fs.existsSync(customShimPath)) {
  // Create a backup
  if (!fs.existsSync(`${processBrowserPath}.bak`)) {
    fs.copyFileSync(processBrowserPath, `${processBrowserPath}.bak`);
  }
  
  // Replace with our custom version
  fs.copyFileSync(customShimPath, processBrowserPath);
  console.log('Process module replaced with custom shim');
}

// Create a custom webpack config to handle env-test page
console.log('Creating custom webpack config...');
const envTestPath = path.join(process.cwd(), 'app', 'env-test');
if (fs.existsSync(envTestPath)) {
  console.log('Temporarily moving env-test to avoid build issues...');
  fs.renameSync(envTestPath, `${envTestPath}.bak`);
}

// Set environment variables to skip problematic components
process.env.SKIP_API_ROUTES = 'true';
process.env.SKIP_FIREBASE_ADMIN = 'true';
process.env.NEXT_PUBLIC_IS_BUILD = 'true';

// Run Next.js export build for Firebase
console.log('Building Next.js application...');
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('Next.js build completed successfully!');
} catch (error) {
  console.error('Build error:', error);
  // Restore the env-test directory if it was moved
  if (fs.existsSync(`${envTestPath}.bak`)) {
    fs.renameSync(`${envTestPath}.bak`, envTestPath);
  }
  process.exit(1);
}

// Restore the env-test directory if it was moved
if (fs.existsSync(`${envTestPath}.bak`)) {
  fs.renameSync(`${envTestPath}.bak`, envTestPath);
}

// Create Firebase redirects if needed
console.log('Setting up Firebase hosting...');
const redirectsPath = path.join(process.cwd(), 'out', '_redirects');
if (!fs.existsSync(redirectsPath)) {
  fs.writeFileSync(redirectsPath, '/*  /index.html  200');
  console.log('Created _redirects file for SPA routing');
}

// Create robots.txt if it doesn't exist
const robotsPath = path.join(process.cwd(), 'out', 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow:');
  console.log('Created robots.txt file');
}

console.log('Firebase build completed successfully!');
console.log('You can now deploy with: firebase deploy --only hosting'); 