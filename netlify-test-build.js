#!/usr/bin/env node

/**
 * Local Netlify build test script
 * 
 * This script simulates the Netlify build environment locally to test for issues
 * before deploying to Netlify.
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

console.log(`${colors.bright}${colors.blue}🧪 Starting local Netlify build test${colors.reset}`);

// Create a temporary environment
const testDir = path.join(process.cwd(), '.netlify-test');
const shimDir = path.join(testDir, 'shims');

// Clean up existing test directory if it exists
if (fs.existsSync(testDir)) {
  console.log(`${colors.yellow}⚠️  Removing existing test directory${colors.reset}`);
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch (error) {
    console.error(`${colors.red}❌ Failed to remove test directory: ${error.message}${colors.reset}`);
  }
}

// Create test directory
fs.mkdirSync(testDir, { recursive: true });
fs.mkdirSync(shimDir, { recursive: true });

console.log(`${colors.cyan}📁 Created test directory at ${testDir}${colors.reset}`);

// Set up environment variables to simulate Netlify
process.env.NETLIFY = 'true';
process.env.NEXT_PUBLIC_NETLIFY_CONTEXT = 'production';
process.env.NEXT_PUBLIC_IS_NETLIFY_BUILD = 'true';
process.env.SKIP_FIREBASE_INIT_ON_BUILD = 'true';

// Copy shim files
const shimFiles = [
  { src: 'shims/util-types.js', dest: path.join(shimDir, 'util-types.js') },
  { src: 'shims/stream-web.js', dest: path.join(shimDir, 'stream-web.js') },
  { src: 'shims/worker-threads.js', dest: path.join(shimDir, 'worker-threads.js') },
];

for (const file of shimFiles) {
  if (fs.existsSync(file.src)) {
    fs.copyFileSync(file.src, file.dest);
    console.log(`${colors.green}✅ Copied ${file.src} to test directory${colors.reset}`);
  } else {
    console.error(`${colors.red}❌ Shim file ${file.src} not found${colors.reset}`);
  }
}

// Create a test node_modules directory for verifying module resolution
const testNodeModules = path.join(testDir, 'node_modules');
fs.mkdirSync(testNodeModules, { recursive: true });

// Test critical module resolution
const modulesToTest = [
  'util/types',
  'stream/web',
  'worker_threads',
  'console',
  'buffer',
];

// Create a mock for the Node.js version of Firestore for testing
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
console.log(`${colors.green}✅ Created Firestore Node.js mock for testing${colors.reset}`);

const importTestCode = `
const path = require('path');

module.exports = async function testImports() {
  const results = [];
  
  ${modulesToTest.map((mod, index) => `
  try {
    console.log('Testing import of ${mod}...');
    const mod${index} = require('${mod}');
    results.push({ module: '${mod}', success: true });
  } catch (error) {
    results.push({ module: '${mod}', success: false, error: error.message });
  }
  `).join('\n')}

  // Test Firebase imports
  try {
    console.log('Testing import of @firebase/app...');
    const firebase = require('@firebase/app');
    results.push({ module: '@firebase/app', success: true });
  } catch (error) {
    results.push({ module: '@firebase/app', success: false, error: error.message });
  }

  return results;
};
`

const testScriptPath = path.join(testDir, 'test-imports.js');
fs.writeFileSync(testScriptPath, importTestCode);

// Create test runner
const runnerCode = `
const testImports = require('./test-imports.js');

async function runTests() {
  console.log('🔍 Testing module imports...');
  
  const results = await testImports();
  
  console.log('\\n📊 Module Import Test Results:');
  console.log('------------------------------');
  
  let allPassed = true;
  
  for (const result of results) {
    if (result.success) {
      console.log('✅ ' + result.module + ': Successfully imported');
    } else {
      console.log('❌ ' + result.module + ': Failed to import');
      console.log('   Error: ' + result.error);
      allPassed = false;
    }
  }
  
  console.log('------------------------------');
  
  if (allPassed) {
    console.log('🎉 All modules imported successfully!');
    return 0;
  } else {
    console.log('⚠️  Some modules failed to import. Netlify build may fail.');
    return 1;
  }
}

runTests().then(process.exit).catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
`

const runnerPath = path.join(testDir, 'run-tests.js');
fs.writeFileSync(runnerPath, runnerCode);

console.log(`${colors.bright}${colors.cyan}🔍 Testing module imports...${colors.reset}`);

// Run the import tests
try {
  execSync(`node ${runnerPath}`, { stdio: 'inherit' });
  console.log(`${colors.bright}${colors.green}✅ Module import tests passed${colors.reset}`);
} catch (error) {
  console.error(`${colors.bright}${colors.red}❌ Module import tests failed${colors.reset}`);
  console.error(error.message);
}

// Attempt a dry run of the build
console.log(`${colors.bright}${colors.cyan}🏗️  Attempting a dry-run Next.js build...${colors.reset}`);
console.log(`${colors.yellow}Note: This will not actually write files but test the build process${colors.reset}`);

try {
  execSync('node netlify-build.js --dry-run', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      DRY_RUN: 'true',
      NETLIFY_TEST: 'true'
    }
  });
  console.log(`${colors.bright}${colors.green}✅ Build dry-run completed successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.bright}${colors.red}❌ Build dry-run failed${colors.reset}`);
  console.error(error.message);
}

// Clean up
console.log(`${colors.cyan}🧹 Cleaning up test files${colors.reset}`);
try {
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log(`${colors.green}✅ Test directory removed${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Failed to remove test directory: ${error.message}${colors.reset}`);
}

console.log(`${colors.bright}${colors.green}🎉 Netlify build test completed${colors.reset}`); 