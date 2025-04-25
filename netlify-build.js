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

// Check if this is a dry run (for testing purposes)
const isDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';
const isNetlifyTest = process.env.NETLIFY_TEST === 'true';

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

console.log(`${colors.bright}${colors.blue}🚀 Starting ${isDryRun ? 'dry-run of ' : ''}Netlify optimized build process${colors.reset}`);
if (isDryRun) {
  console.log(`${colors.yellow}⚠️  Dry run mode: Will simulate the build process without actually building${colors.reset}`);
}

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
if (!isDryRun || isNetlifyTest) {
  try {
    console.log(`${colors.bright}${colors.cyan}🔍 Checking for missing dependencies...${colors.reset}`);
    execSync('npm install --save @firebase/app @firebase/auth @firebase/firestore @firebase/storage @firebase/util @firebase/component console-browserify buffer util path-browserify stream-browserify', { stdio: 'inherit' });
    console.log(`${colors.bright}${colors.green}✅ Dependencies installed successfully${colors.reset}`);
  } catch (error) {
    console.error(`${colors.bright}${colors.red}❌ Failed to install dependencies${colors.reset}`);
    console.error(error);
    // Continue to build even if dependency installation fails
  }
} else {
  console.log(`${colors.yellow}⚠️  Skipping dependency installation in dry-run mode${colors.reset}`);
}

// Ensure the shim directories exist
const shimDir = path.join(process.cwd(), 'shims');
if (!fs.existsSync(shimDir)) {
  console.log(`${colors.cyan}Creating shims directory...${colors.reset}`);
  fs.mkdirSync(shimDir, { recursive: true });
}

// Create shim files if they don't exist
const shimFiles = [
  {
    path: path.join(shimDir, 'util-types.js'),
    content: `// Shim for Node.js util/types module in the browser
module.exports = {
  isArrayBufferView: () => false,
  isUint8Array: (obj) => Object.prototype.toString.call(obj) === '[object Uint8Array]',
  isUint16Array: (obj) => Object.prototype.toString.call(obj) === '[object Uint16Array]',
  isUint32Array: (obj) => Object.prototype.toString.call(obj) === '[object Uint32Array]',
  isInt8Array: (obj) => Object.prototype.toString.call(obj) === '[object Int8Array]',
  isInt16Array: (obj) => Object.prototype.toString.call(obj) === '[object Int16Array]',
  isInt32Array: (obj) => Object.prototype.toString.call(obj) === '[object Int32Array]',
  isFloat32Array: (obj) => Object.prototype.toString.call(obj) === '[object Float32Array]',
  isFloat64Array: (obj) => Object.prototype.toString.call(obj) === '[object Float64Array]',
  isDate: (obj) => obj instanceof Date,
  isRegExp: (obj) => obj instanceof RegExp
};`
  },
  {
    path: path.join(shimDir, 'stream-web.js'),
    content: `// Shim for Node.js stream/web module in the browser
module.exports = {
  ReadableStream: typeof ReadableStream !== 'undefined' ? ReadableStream : class ReadableStream {},
  WritableStream: typeof WritableStream !== 'undefined' ? WritableStream : class WritableStream {},
  TransformStream: typeof TransformStream !== 'undefined' ? TransformStream : class TransformStream {},
  ByteLengthQueuingStrategy: typeof ByteLengthQueuingStrategy !== 'undefined' ? ByteLengthQueuingStrategy : class ByteLengthQueuingStrategy {},
  CountQueuingStrategy: typeof CountQueuingStrategy !== 'undefined' ? CountQueuingStrategy : class CountQueuingStrategy {}
};`
  },
  {
    path: path.join(shimDir, 'worker-threads.js'),
    content: `// Shim for Node.js worker_threads module in the browser
module.exports = {
  Worker: typeof Worker !== 'undefined' ? Worker : class Worker {},
  MessageChannel: typeof MessageChannel !== 'undefined' ? MessageChannel : class MessageChannel {},
  MessagePort: typeof MessagePort !== 'undefined' ? MessagePort : class MessagePort {},
  isMainThread: true
};`
  },
  {
    path: path.join(shimDir, 'firestore-browser.js'),
    content: `// Firestore browser shim to handle server-side imports
// This redirects to the browser version instead of the Node.js version

export * from '@firebase/firestore';

// Add a mock for _isFirebaseServerApp since it's missing from the browser version
export const _isFirebaseServerApp = false;`
  }
];

// Write all shim files
for (const file of shimFiles) {
  console.log(`${colors.cyan}Creating shim file: ${file.path}${colors.reset}`);
  fs.writeFileSync(file.path, file.content);
}

// Patch Node.js built-in modules used by undici and other dependencies
try {
  console.log(`${colors.bright}${colors.cyan}🔧 Patching Node.js dependencies for browser compatibility...${colors.reset}`);
  
  // Create a mock for the Node.js version of Firestore
  const firestoreNodeDir = path.join(process.cwd(), 'node_modules', '@firebase', 'firestore', 'dist');
  const firestoreNodePath = path.join(firestoreNodeDir, 'index.node.mjs');
  
  if (!fs.existsSync(firestoreNodeDir)) {
    fs.mkdirSync(firestoreNodeDir, { recursive: true });
  }
  
  const firestoreNodeContent = `
// Mock for the Node.js version of Firestore
// This file exists to prevent build errors on Netlify

// Re-export everything from the browser version
export * from '../index.esm2017.js';

// Add missing exports that the Node version has
export const _isFirebaseServerApp = false;
`;
  
  fs.writeFileSync(firestoreNodePath, firestoreNodeContent);
  console.log(`${colors.bright}${colors.green}✅ Created Firestore Node.js mock at ${firestoreNodePath}${colors.reset}`);
  
  // Create module shims for browser environment
  const modulesToShim = [
    {
      path: path.join(process.cwd(), 'node_modules', 'stream', 'web.js'),
      content: `
// This is a shim for stream/web to allow builds to complete
module.exports = {
  ReadableStream: class ReadableStream {},
  WritableStream: class WritableStream {},
  TransformStream: class TransformStream {},
  ByteLengthQueuingStrategy: class ByteLengthQueuingStrategy {},
  CountQueuingStrategy: class CountQueuingStrategy {}
};`
    },
    {
      path: path.join(process.cwd(), 'node_modules', 'util', 'types.js'),
      content: `
// This is a shim for util/types to allow builds to complete
module.exports = {
  isArrayBufferView: () => false,
  isUint8Array: () => false,
  isUint16Array: () => false,
  isUint32Array: () => false,
  isInt8Array: () => false,
  isInt16Array: () => false,
  isInt32Array: () => false,
  isFloat32Array: () => false,
  isFloat64Array: () => false
};`
    },
    {
      path: path.join(process.cwd(), 'node_modules', 'worker_threads', 'index.js'),
      content: `
// This is a shim for worker_threads to allow builds to complete
module.exports = {
  Worker: class Worker {},
  MessageChannel: class MessageChannel {},
  MessagePort: class MessagePort {},
  isMainThread: true
};`
    },
    {
      path: path.join(process.cwd(), 'node_modules', 'console', 'index.js'),
      content: `
// This is a shim for console to allow builds to complete
module.exports = console;`
    }
  ];
  
  // Create all shim modules
  for (const module of modulesToShim) {
    const dirPath = path.dirname(module.path);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(module.path, module.content);
    console.log(`${colors.bright}${colors.green}✅ Created shim at ${module.path}${colors.reset}`);
  }
  
  // Path for direct stream/web in root modules structure
  const rootStreamWebPath = path.join(process.cwd(), 'stream', 'web.js');
  const rootStreamDirPath = path.join(process.cwd(), 'stream');
  
  if (!fs.existsSync(rootStreamDirPath)) {
    fs.mkdirSync(rootStreamDirPath, { recursive: true });
  }
  
  // Copy the shim to root location too
  fs.copyFileSync(
    path.join(process.cwd(), 'node_modules', 'stream', 'web.js'),
    rootStreamWebPath
  );
  console.log(`${colors.bright}${colors.green}✅ Created stream/web shim at root level ${rootStreamWebPath}${colors.reset}`);
  
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
  
  // Process all JavaScript files in undici to fix path issues
  const processDirectory = (dir, callback) => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath, callback);
      } else if (stat.isFile() && file.endsWith('.js')) {
        callback(filePath);
      }
    }
  };
  
  // Process files to fix imports
  const processFile = (filePath) => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix stream/web imports
      if (content.includes("require('stream/web')")) {
        console.log(`Patching stream/web import in ${filePath}...`);
        content = content.replace(
          "require('stream/web')",
          `require('${path.relative(path.dirname(filePath), path.join(process.cwd(), 'shims', 'stream-web.js')).replace(/\\/g, '/')}')`
        );
        modified = true;
      }
      
      // Fix util/types imports
      if (content.includes("require('util/types')")) {
        console.log(`Patching util/types import in ${filePath}...`);
        content = content.replace(
          "require('util/types')",
          `require('${path.relative(path.dirname(filePath), path.join(process.cwd(), 'shims', 'util-types.js')).replace(/\\/g, '/')}')`
        );
        modified = true;
      }
      
      // Fix worker_threads imports
      if (content.includes("require('worker_threads')")) {
        console.log(`Patching worker_threads import in ${filePath}...`);
        content = content.replace(
          "require('worker_threads')",
          `require('${path.relative(path.dirname(filePath), path.join(process.cwd(), 'shims', 'worker-threads.js')).replace(/\\/g, '/')}')`
        );
        modified = true;
      }
      
      // Fix console imports
      if (content.includes("require('console')")) {
        console.log(`Patching console import in ${filePath}...`);
        content = content.replace(
          "require('console')",
          "typeof window !== 'undefined' ? window.console : console"
        );
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
      }
    } catch (e) {
      console.error(`Error processing file ${filePath}: ${e.message}`);
    }
  };
  
  // Process firebase and undici directories
  const dirsToProcess = [
    './node_modules/@firebase/storage/node_modules/undici',
    './node_modules/@firebase/storage',
    './node_modules/undici',
    './node_modules/@firebase/app',
    './node_modules/@firebase/firestore',
    './node_modules/@firebase/auth'
  ];
  
  for (const dir of dirsToProcess) {
    if (fs.existsSync(dir)) {
      console.log(`${colors.cyan}Processing ${dir} directory for module import fixes...${colors.reset}`);
      processDirectory(dir, processFile);
    }
  }
  
  console.log(`${colors.bright}${colors.green}✅ Node.js module patches applied successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.bright}${colors.red}❌ Failed to patch dependencies${colors.reset}`);
  console.error(error);
  // Continue to build even if patching fails
}

// Skip the actual build in dry-run mode
if (isDryRun) {
  console.log(`${colors.bright}${colors.yellow}⚠️ Skipping actual build in dry-run mode${colors.reset}`);
  console.log(`${colors.cyan}Would run: npx next build${colors.reset}`);
  
  // Create a webpack test to check for module resolution issues
  console.log(`${colors.bright}${colors.cyan}🧪 Running webpack module resolution test...${colors.reset}`);
  
  // Create a temporary Next.js page for testing
  const testPageDir = path.join(process.cwd(), 'pages', '__netlify-test');
  const testPagePath = path.join(testPageDir, 'index.js');
  
  if (!fs.existsSync(testPageDir)) {
    fs.mkdirSync(testPageDir, { recursive: true });
  }
  
  // Create a test page that imports all problematic modules
  const testPageContent = `
// This is a temporary test page for checking module resolution
import React from 'react';

// Try importing a few problematic dependencies
const importModules = async () => {
  try {
    // Firebase imports
    const firebase = await import('@firebase/app');
    const firestore = await import('@firebase/firestore');
    
    // Node.js core modules that might cause issues
    const util = await import('util');
    const buffer = await import('buffer');
    
    console.log('All modules imported successfully!');
    return { success: true };
  } catch (error) {
    console.error('Module import error:', error);
    return { success: false, error };
  }
};

export default function NetlifyTest() {
  const [testResult, setTestResult] = React.useState(null);
  
  React.useEffect(() => {
    importModules().then(setTestResult);
  }, []);
  
  if (!testResult) return <div>Testing module imports...</div>;
  
  return (
    <div>
      <h1>Netlify Test Page</h1>
      {testResult.success ? (
        <p style={{ color: 'green' }}>✅ All module imports successful!</p>
      ) : (
        <div>
          <p style={{ color: 'red' }}>❌ Module import failed</p>
          <pre>{testResult.error?.toString()}</pre>
        </div>
      )}
    </div>
  );
}
`;

  fs.writeFileSync(testPagePath, testPageContent);
  
  try {
    console.log(`${colors.cyan}Running Next.js webpack test build...${colors.reset}`);
    execSync('npx next build --no-lint', {
      stdio: 'inherit',
      env: {
        ...process.env,
        SKIP_FULL_BUILD: 'true',
        ANALYZE: 'false'
      }
    });
    
    console.log(`${colors.bright}${colors.green}✅ Webpack module resolution test passed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.bright}${colors.red}❌ Webpack module resolution test failed${colors.reset}`);
    console.error(error.message);
  }
  
  // Clean up test page
  try {
    console.log(`${colors.cyan}Cleaning up test page...${colors.reset}`);
    fs.rmSync(testPageDir, { recursive: true, force: true });
  } catch (error) {
    console.error(`${colors.red}❌ Failed to clean up test page: ${error.message}${colors.reset}`);
  }
} else {
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

console.log(`${colors.bright}${colors.green}🎉 ${isDryRun ? 'Dry-run' : 'Build process'} completed${colors.reset}`); 