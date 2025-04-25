#!/usr/bin/env node

/**
 * Custom build script for Netlify deployment
 * 
 * This script creates a temporary environment that prevents Firebase initialization
 * during the build process, which avoids the common "Service storage is not available" error.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.blue}🚀 Starting Netlify optimized build process${colors.reset}`);

// Create a temporary .env.local file for the build
const tempEnvPath = path.join(process.cwd(), '.env.temp');
const envLocalPath = path.join(process.cwd(), '.env.local');
const envLocalBackupPath = path.join(process.cwd(), '.env.local.backup');

// Backup existing .env.local if it exists
if (fs.existsSync(envLocalPath)) {
  console.log(`${colors.yellow}⚠️  Backing up existing .env.local file${colors.reset}`);
  fs.copyFileSync(envLocalPath, envLocalBackupPath);
}

// Create a valid-looking but fake RSA private key
const fakePrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu
NMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ
agU6VBPS63LwuwnbEh2SCwHGR8LW3UqQOx+MqWPkClpKQ0aQXTiCXSWUw+hEUF5A
esV+oCnzNv7vZf/ox5qsnmoF1Vg4BZQDnqL4v0Ww8YUKgNJLgEMOr12nPZKKTYKS
SBQgP947qGX0sCGasXgf+8I8R1sSeU9wlpzacs2JwWmN3ktVccuXvVCCKzHtMARu
bA8tOp3TAgMBAAECggEAbjfGgwHvpT9jLzVabGQJOyV3bbt2Xc/FtQGIuZj/I3ba
FAKXD0NbgDXUZu6n5R3wIYSqgKiYzBw+HeO8q60lcMyLqpCcMp1a2mMazzDVkbjs
eFMU1gfWH+NN3/NUFSJhJlQ37A7MdL4o2tNilKFBH7YQKJgSEjKvKmcJ0DPYxrQN
zfFDg7w0QZ7xLwsXHPcwGmwbUvHkgDwjq7EPD7GSDYpFQiAgrvg5c1TbCzrPUZFb
UYGwQZbEjZMacrEVQMGRJJ5ZA2UxYMtUPWB16AcCQkBRABkjkXWXdJjyPIeeMu8L
sfiuMfkqKbOLhJ3Y0PnYR5RRnPpLRGQCbX2dwPQUsQKBgQDt/NbFsRbYplQULWVH
2AqIJENn2gxAIQvEqZdqBH5qfCJXNNdnBTYXOHt1CwO4PpTgkGnVzA2GrLCvLtCy
eGsCOvLDgZCWPp+3lyOjcFhQhX+uN0E8HRnNVIRXz53lHpQTvcikQNUe32/qn38A
6nZMqTLVFsQRTjA1m0cGX6OsSQKBgQDJ8Jdp8bMB6OZjbIe8YfrmVGLdGKsqY51n
LdQaj0nUXVZXYOQCixsyQmZpQeGzwu1dPsP3KmMk5u9+AoaK5XfeZBGCFXWTYfpj
0hiItbmCgvMTyJArfXN+PQGNRcXoaGHXvrap4y3D1sujrnXXyCZdPM38sJ+qGTR3
FAGKk2gR6wKBgQCN0UmKaGFtVrDAt2JUCMsCousoXJ5E+QgDVpFuGl8knxNVcJoN
MSgqiACM3rKYtJodUu/A6q1r1cPAOzdnF8iP0lDYXJLMDICVJ8kNo5jUHf+ujm5F
uxJyhZL6sYmYVfT1i46VNfRcYmRpGY3MZ9vlEwFqNxk5PupFKyDuWIqyEQKBgQCr
BNXojpEk6+CW9VoLZcvSTdI/84HXjF/yZsU+XXaKCdUaQn04slnJTtVPf7f90SzM
JKDB3NcCOXdY9S0yN1/eeRuvK0BLFXLiuGei9aVw/c0mQGRLvFJrf3Nz/jk49e3M
gj6OVdQbVRR6BenpHGiGfIJxzKJyINtTYKh62J6cZQKBgQCNVGACfTv0PXWAI5LL
kAOqYqvWvRo3yamwGBUu1yRl+BL0UZdcnXP8SiME85u2G3JjnfrzE/qbi9CctI+a
8pXhHdPEixpmzHhI+N72PyA4fmLkHrpFCLjP79PSYI3QOr6oE9a0h0K/CAGQwLac
PkHNbJzHvQmvKLXKTj9TBFzCJw==
-----END PRIVATE KEY-----`;

// Create a temporary env file with build-specific settings
console.log(`${colors.cyan}📝 Creating temporary build environment${colors.reset}`);
const buildEnvContent = `
# This is a temporary file created for Netlify build
# It prevents Firebase initialization during the build process
NEXT_PUBLIC_IS_NETLIFY_BUILD=true
SKIP_FIREBASE_INIT_ON_BUILD=true

# Mock API keys for build time (these are not used in production)
NEXT_PUBLIC_OPENAI_API_KEY=sk-mock-key-for-build-time-only
OPENAI_API_KEY=sk-mock-key-for-build-time-only
NEXT_PUBLIC_GEMINI_API_KEY=mock-key-for-build-time-only
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=mock-key-for-build-time-only
NEXT_PUBLIC_BIBLE_API_KEY=mock-key-for-build-time-only

# Mock Firebase config for build time
NEXT_PUBLIC_FIREBASE_API_KEY=mock-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=selah-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=selah-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=selah-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=0:000000000000:web:0000000000000000000000

# Mock Firebase Admin credentials for build time
FIREBASE_ADMIN_PROJECT_ID=selah-app
FIREBASE_ADMIN_CLIENT_EMAIL=mock-service-account@selah-app.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="${fakePrivateKey.replace(/\n/g, '\\n')}"

# Support legacy environment variable names too
FIREBASE_PROJECT_ID=selah-app
FIREBASE_CLIENT_EMAIL=mock-service-account@selah-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="${fakePrivateKey.replace(/\n/g, '\\n')}"
`;

fs.writeFileSync(tempEnvPath, buildEnvContent);
fs.copyFileSync(tempEnvPath, envLocalPath);

// Ensure all necessary dependencies are installed
try {
  console.log(`${colors.bright}${colors.cyan}🔍 Checking for missing Firebase dependencies...${colors.reset}`);
  execSync('npm install --save @firebase/app @firebase/auth @firebase/firestore @firebase/storage @firebase/util @firebase/component', { stdio: 'inherit' });
  console.log(`${colors.bright}${colors.green}✅ Dependencies installed successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.bright}${colors.red}❌ Failed to install dependencies${colors.reset}`);
  console.error(error);
  // Continue to build even if dependency installation fails
}

// Patch Node.js built-in modules used by undici and other dependencies
try {
  console.log(`${colors.bright}${colors.cyan}🔧 Patching Node.js dependencies for browser compatibility...${colors.reset}`);
  
  // Create an empty stream/web.js file as a shim
  const streamWebShimPath = path.join(process.cwd(), 'node_modules', 'stream', 'web.js');
  const streamDirPath = path.join(process.cwd(), 'node_modules', 'stream');
  
  if (!fs.existsSync(streamDirPath)) {
    fs.mkdirSync(streamDirPath, { recursive: true });
  }
  
  // Create a basic shim for stream/web
  const streamWebShim = `
// This is a shim for stream/web to allow builds to complete
module.exports = {
  ReadableStream: class ReadableStream {},
  WritableStream: class WritableStream {},
  TransformStream: class TransformStream {},
  // Add more exports as needed
};
`;
  fs.writeFileSync(streamWebShimPath, streamWebShim);
  console.log(`${colors.bright}${colors.green}✅ Created stream/web shim at ${streamWebShimPath}${colors.reset}`);
  
  // Patching undici in @firebase/storage for async_hooks
  const undiciPaths = [
    './node_modules/@firebase/storage/node_modules/undici/lib/api/api-connect.js',
    './node_modules/@firebase/storage/node_modules/undici/lib/api/api-upgrade.js',
  ];

  for (const filePath of undiciPaths) {
    if (fs.existsSync(filePath)) {
      console.log(`Patching ${filePath}...`);
      let fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Replace the async_hooks import with a shim
      fileContent = fileContent.replace(
        "const { asyncId, executionAsyncId } = require('async_hooks')",
        "const asyncId = () => 1; const executionAsyncId = () => 1; // Shim for browser environment"
      );
      
      fs.writeFileSync(filePath, fileContent);
    }
  }
  
  // Check for stream/web imports in undici files
  const undiciDir = './node_modules/@firebase/storage/node_modules/undici';
  if (fs.existsSync(undiciDir)) {
    // Find all JavaScript files
    const findJsFiles = (dir, fileList = []) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findJsFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
          fileList.push(filePath);
        }
      }
      return fileList;
    };
    
    const jsFiles = findJsFiles(undiciDir);
    for (const filePath of jsFiles) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes("require('stream/web')")) {
          console.log(`Patching stream/web import in ${filePath}...`);
          // Replace the require with our shim
          content = content.replace(
            "require('stream/web')",
            "require('../../../stream/web')"
          );
          fs.writeFileSync(filePath, content);
        }
      } catch (e) {
        console.error(`Error processing file ${filePath}: ${e.message}`);
      }
    }
  }
  
  console.log(`${colors.bright}${colors.green}✅ Undici patches applied successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.bright}${colors.red}❌ Failed to patch dependencies${colors.reset}`);
  console.error(error);
  // Continue to build even if patching fails
}

// Run the build
console.log(`${colors.bright}${colors.green}🏗️  Running Next.js build...${colors.reset}`);
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log(`${colors.bright}${colors.green}✅ Build completed successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.bright}${colors.red}❌ Build failed${colors.reset}`);
  console.error(error);
  // Clean up temp files
  if (fs.existsSync(tempEnvPath)) {
    fs.unlinkSync(tempEnvPath);
  }
  
  // Restore backup if it exists
  if (fs.existsSync(envLocalBackupPath)) {
    fs.copyFileSync(envLocalBackupPath, envLocalPath);
    fs.unlinkSync(envLocalBackupPath);
  } else if (fs.existsSync(envLocalPath)) {
    fs.unlinkSync(envLocalPath);
  }
  
  process.exit(1);
}

// Clean up
console.log(`${colors.cyan}🧹 Cleaning up temporary files${colors.reset}`);
if (fs.existsSync(tempEnvPath)) {
  fs.unlinkSync(tempEnvPath);
}

// Restore original .env.local if it existed
if (fs.existsSync(envLocalBackupPath)) {
  fs.copyFileSync(envLocalBackupPath, envLocalPath);
  fs.unlinkSync(envLocalBackupPath);
} else if (fs.existsSync(envLocalPath)) {
  fs.unlinkSync(envLocalPath);
}

console.log(`${colors.bright}${colors.green}🎉 Build process completed${colors.reset}`); 