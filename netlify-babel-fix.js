/**
 * Netlify Build Script with Babel Fix
 * 
 * This script ensures that babel-plugin-module-resolver is installed
 * before running the build process for Netlify.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting Netlify build with Babel fix...');

// Install babel-plugin-module-resolver if it's not already installed
try {
  try {
    require.resolve('babel-plugin-module-resolver');
    console.log('✅ babel-plugin-module-resolver is already installed');
  } catch (err) {
    console.log('⚠️ babel-plugin-module-resolver not found, installing...');
    
    // Create a temporary package.json entry
    const pkgJsonPath = path.join(__dirname, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    
    if (!pkgJson.devDependencies) {
      pkgJson.devDependencies = {};
    }
    
    pkgJson.devDependencies['babel-plugin-module-resolver'] = '^5.0.0';
    
    // Write the updated package.json
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    
    // Install the package
    execSync('npm install babel-plugin-module-resolver --save-dev', { stdio: 'inherit' });
    console.log('✅ babel-plugin-module-resolver installed');
  }
  
  // Create or update .babelrc
  const babelrcPath = path.join(__dirname, '.babelrc');
  const babelrc = fs.existsSync(babelrcPath) 
    ? JSON.parse(fs.readFileSync(babelrcPath, 'utf8'))
    : { presets: ["next/babel"], plugins: [] };
  
  // Check if module-resolver is already in the plugins list
  let hasModuleResolver = false;
  if (babelrc.plugins) {
    for (const plugin of babelrc.plugins) {
      if (Array.isArray(plugin) && plugin[0] === 'module-resolver') {
        hasModuleResolver = true;
        break;
      } else if (plugin === 'module-resolver') {
        hasModuleResolver = true;
        break;
      }
    }
  } else {
    babelrc.plugins = [];
  }
  
  // Add module-resolver if not present
  if (!hasModuleResolver) {
    babelrc.plugins.push(["module-resolver", {
      "root": ["./"],
      "alias": {
        "@": "./"
      }
    }]);
    fs.writeFileSync(babelrcPath, JSON.stringify(babelrc, null, 2));
    console.log('✅ Updated .babelrc with module-resolver plugin');
  }
  
  // Now run the regular build process
  console.log('📦 Running Netlify build...');
  
  // First apply Firebase patches
  execSync('node patches/firebase-storage-fix/patch-node-imports.js', { stdio: 'inherit' });
  
  // Set environment variables
  process.env.NETLIFY = 'true';
  process.env.SKIP_FIREBASE_INIT_ON_BUILD = 'true';
  process.env.SKIP_API_ROUTES = 'true';
  process.env.SKIP_FIREBASE_ADMIN = 'true';
  
  // Run the build
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
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  
  // Try the emergency build as a fallback
  console.log('⚠️ Trying emergency build as fallback...');
  try {
    execSync('node netlify-emergency-build.js', { stdio: 'inherit' });
  } catch (emergencyError) {
    console.error('❌ Emergency build also failed:', emergencyError);
    
    // Final fallback to static page
    console.log('⚠️ Using static fallback as last resort...');
    execSync('node netlify-static-fallback.js', { stdio: 'inherit' });
  }
} 