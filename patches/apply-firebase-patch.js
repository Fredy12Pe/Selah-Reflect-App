/**
 * Main Firebase patch application script.
 * This script runs all Firebase-related patches to fix compatibility issues.
 */

const path = require('path');
const { execSync } = require('child_process');

console.log('Applying Firebase patches...');

try {
  // Run the Node imports patch for Firebase storage
  console.log('\n1. Applying Node.js import patches for Firebase Storage...');
  const storageFixPath = path.join(__dirname, 'firebase-storage-fix', 'patch-node-imports.js');
  execSync(`node ${storageFixPath}`, { stdio: 'inherit' });

  // Run the undici private fields patch
  console.log('\n2. Applying private fields patch for undici module...');
  const undiciFixPath = path.join(__dirname, 'firebase-undici-fix', 'patch-private-fields.js');
  execSync(`node ${undiciFixPath}`, { stdio: 'inherit' });

  console.log('\nAll Firebase patches applied successfully!');
} catch (error) {
  console.error('\nError applying Firebase patches:', error);
  process.exit(1);
} 