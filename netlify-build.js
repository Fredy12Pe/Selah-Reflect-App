/**
 * Netlify Build Script
 * 
 * This script applies required patches and builds the Next.js app for Netlify deployment
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running pre-build patches...');

// Apply Firebase patches
try {
  console.log('Applying Firebase patches...');
  execSync('node patches/firebase-storage-fix/patch-node-imports.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error applying Firebase patches:', error);
  process.exit(1);
}

// Set environment variables
process.env.NETLIFY = 'true';
process.env.SKIP_FIREBASE_INIT_ON_BUILD = 'true';
process.env.SKIP_API_ROUTES = 'true';
process.env.SKIP_FIREBASE_ADMIN = 'true';

// Run the build
try {
  console.log('Building Next.js app for Netlify...');
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NETLIFY: 'true',
      SKIP_FIREBASE_INIT_ON_BUILD: 'true',
      SKIP_API_ROUTES: 'true',
      SKIP_FIREBASE_ADMIN: 'true'
    }
  });
} catch (error) {
  console.error('Build failed:', error);
  
  // If the build failed due to font loading issue, try the alternative approach
  if (error.message.includes('next/font') || error.message.includes('SWC')) {
    console.log('Detected font loading issue, trying alternative build...');
    
    try {
      // Check if the alternative layout file exists
      if (fs.existsSync(path.join(__dirname, 'app/layout-without-next-font.tsx'))) {
        // Backup original layout
        fs.copyFileSync(
          path.join(__dirname, 'app/layout.tsx'),
          path.join(__dirname, 'app/layout.tsx.bak')
        );
        
        // Replace layout with the no-font version
        fs.copyFileSync(
          path.join(__dirname, 'app/layout-without-next-font.tsx'),
          path.join(__dirname, 'app/layout.tsx')
        );
        
        // Try building again
        console.log('Trying build with alternative layout (no next/font)...');
        execSync('next build', { 
          stdio: 'inherit',
          env: {
            ...process.env,
            NETLIFY: 'true',
            SKIP_FIREBASE_INIT_ON_BUILD: 'true',
            SKIP_API_ROUTES: 'true',
            SKIP_FIREBASE_ADMIN: 'true'
          }
        });
        
        // Restore original layout
        fs.copyFileSync(
          path.join(__dirname, 'app/layout.tsx.bak'),
          path.join(__dirname, 'app/layout.tsx')
        );
        
        // Remove backup
        fs.unlinkSync(path.join(__dirname, 'app/layout.tsx.bak'));
        
        console.log('Build succeeded with alternative layout!');
      } else {
        console.error('Alternative layout file not found, cannot proceed with fallback build.');
        process.exit(1);
      }
    } catch (fallbackError) {
      console.error('Fallback build failed:', fallbackError);
      
      // Try to restore original layout if it exists
      if (fs.existsSync(path.join(__dirname, 'app/layout.tsx.bak'))) {
        fs.copyFileSync(
          path.join(__dirname, 'app/layout.tsx.bak'),
          path.join(__dirname, 'app/layout.tsx')
        );
        fs.unlinkSync(path.join(__dirname, 'app/layout.tsx.bak'));
      }
      
      process.exit(1);
    }
  } else {
    // For other errors, just exit
    process.exit(1);
  }
}

console.log('Build completed successfully!'); 