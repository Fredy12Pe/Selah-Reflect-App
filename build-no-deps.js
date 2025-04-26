// A simplified build script for Google Cloud Build
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting simplified Firebase build process...');

// Clean build directories
console.log('Cleaning output directories...');
try {
  execSync('rm -rf .next out', { stdio: 'inherit' });
  console.log('Cleaned output directories');
} catch (error) {
  console.error('Error cleaning directories:', error);
}

// Run Next.js build
console.log('Building Next.js application...');
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('Next.js build completed successfully!');
} catch (error) {
  console.error('Build error:', error);
  process.exit(1);
}

// Copy files from out to root for Firebase hosting
console.log('Copying files to root directory for Firebase hosting...');
try {
  if (fs.existsSync('out')) {
    const outDir = path.join(process.cwd(), 'out');
    const files = fs.readdirSync(outDir);
    
    files.forEach(file => {
      const sourcePath = path.join(outDir, file);
      const destPath = path.join(process.cwd(), file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        // Skip copying any directories that already exist at root
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        execSync(`cp -r ${sourcePath}/* ${destPath}/`, { stdio: 'inherit' });
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    });
    
    console.log('Files copied successfully!');
  } else {
    console.error('Output directory not found!');
    process.exit(1);
  }
} catch (error) {
  console.error('Error copying files:', error);
  process.exit(1);
}

console.log('Build process completed successfully!'); 