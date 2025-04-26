// A simplified build script for Firebase deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Firebase build process...');

// Clean build directories
console.log('Cleaning output directories...');
try {
  if (fs.existsSync('.next')) {
    console.log('Removing .next directory');
    fs.rmSync('.next', { recursive: true, force: true });
  }
  if (fs.existsSync('out')) {
    console.log('Removing out directory');
    fs.rmSync('out', { recursive: true, force: true });
  }
} catch (error) {
  console.error('Error cleaning directories:', error);
}

// Fix the problematic process/browser.js file if it exists
console.log('Checking process module...');
const processBrowserPath = path.join(process.cwd(), 'node_modules', 'process', 'browser.js');
const customShimPath = path.join(process.cwd(), 'shims', 'process-browser.js');

if (fs.existsSync(processBrowserPath) && fs.existsSync(customShimPath)) {
  console.log('Replacing process module with custom shim...');
  // Create a backup
  if (!fs.existsSync(`${processBrowserPath}.bak`)) {
    fs.copyFileSync(processBrowserPath, `${processBrowserPath}.bak`);
  }
  
  // Replace with our custom version
  fs.copyFileSync(customShimPath, processBrowserPath);
  console.log('Process module replaced with custom shim');
}

// Set environment variables to skip problematic components
process.env.SKIP_API_ROUTES = 'true';
process.env.SKIP_FIREBASE_ADMIN = 'true';
process.env.NEXT_PUBLIC_IS_BUILD = 'true';

// Run Next.js export build for Firebase
console.log('Building Next.js application...');
try {
  // Use native next build command that works in all environments
  console.log('Running next build...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('Next.js build completed successfully!');
} catch (error) {
  console.error('Build error:', error);
  process.exit(1);
}

// Create necessary files for hosting
console.log('Setting up Firebase hosting...');

// Create robots.txt if it doesn't exist
const robotsPath = path.join(process.cwd(), 'out', 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow:');
  console.log('Created robots.txt file');
}

console.log('Firebase build completed successfully!');
console.log('You can now deploy with: firebase deploy --only hosting'); 