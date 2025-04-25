/**
 * Patch script to replace node: URI imports with regular imports
 * This fixes webpack build errors with node: imports
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const FIREBASE_STORAGE_DIR = path.join(process.cwd(), 'node_modules/@firebase/storage');
const FILES_TO_PATCH = [
  // Main culprits
  'node_modules/@firebase/storage/node_modules/@fastify/busboy/deps/dicer/lib/HeaderParser.js',
  'node_modules/@firebase/storage/node_modules/@fastify/busboy/deps/streamsearch/sbmh.js',
  // Additional files that might have similar imports
  'node_modules/@firebase/storage/node_modules/undici/lib/fetch/body.js',
  'node_modules/@firebase/storage/node_modules/undici/lib/fetch/index.js',
  'node_modules/@firebase/storage/node_modules/undici/index.js',
];

// Replacement patterns
const REPLACEMENTS = [
  { from: /require\(['"]node:events['"]\)/g, to: "require('events')" },
  { from: /require\(['"]node:util['"]\)/g, to: "require('util')" },
  { from: /require\(['"]node:stream['"]\)/g, to: "require('stream-browserify')" },
  { from: /from ['"]node:events['"]/g, to: "from 'events'" },
  { from: /from ['"]node:util['"]/g, to: "from 'util'" },
  { from: /from ['"]node:stream['"]/g, to: "from 'stream-browserify'" },
  // Handle individual imports from node:events
  { from: /const EventEmitter = require\(['"]node:events['"]\)\.EventEmitter/g, to: "const EventEmitter = require('events').EventEmitter" },
  { from: /const inherits = require\(['"]node:util['"]\)\.inherits/g, to: "const inherits = require('util').inherits" },
];

async function patchFile(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File does not exist: ${filePath}`);
      return false;
    }

    // Read file content
    const content = await readFile(filePath, 'utf8');
    
    // Apply replacements
    let newContent = content;
    let replaced = false;
    
    for (const { from, to } of REPLACEMENTS) {
      if (from.test(newContent)) {
        newContent = newContent.replace(from, to);
        replaced = true;
        console.log(`Replaced pattern in ${filePath}: ${from} -> ${to}`);
      }
    }
    
    // Save file if changes were made
    if (replaced) {
      await writeFile(filePath, newContent);
      console.log(`✅ Patched file: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ No replacements needed in: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error patching file ${filePath}:`, error);
    return false;
  }
}

async function findAndPatchFiles() {
  console.log('🔍 Scanning for files with node: imports...');
  
  // Process known problematic files
  for (const filePath of FILES_TO_PATCH) {
    await patchFile(filePath);
  }
  
  console.log('✅ Patching complete!');
}

findAndPatchFiles().catch(err => {
  console.error('❌ Patch script failed:', err);
  process.exit(1);
}); 