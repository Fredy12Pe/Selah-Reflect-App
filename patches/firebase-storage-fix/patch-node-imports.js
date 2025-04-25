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
  'node_modules/@firebase/storage/node_modules/undici/lib/core/util.js',
  'node_modules/@firebase/storage/node_modules/undici/lib/core/request.js',
  'node_modules/@firebase/storage/node_modules/undici/lib/core/connect.js',
  'node_modules/@firebase/storage/node_modules/undici/lib/client.js',
  'node_modules/@firebase/storage/node_modules/undici/lib/api/api-request.js',
  'node_modules/@firebase/storage/node_modules/undici/lib/api/api-stream.js',
  'node_modules/@firebase/storage/dist/index.esm2017.js',
  'node_modules/@firebase/storage/dist/index.browser.esm2017.js',
  // Check through more firebase modules
  'node_modules/firebase/storage/dist/index.esm.js',
  // Handle any possible undici instances in other places
  'node_modules/undici/lib/fetch/body.js',
  'node_modules/undici/lib/fetch/index.js',
  'node_modules/undici/index.js',
];

// Additional directories to recursively search
const DIRS_TO_SCAN = [
  'node_modules/@firebase/storage',
  'node_modules/undici',
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
  // Process.versions polyfill
  { from: /process\.versions\.node/g, to: "'16.0.0'" },
  // Handle other potential Node module imports
  { from: /require\(['"]node:buffer['"]\)/g, to: "require('buffer')" },
  { from: /require\(['"]node:path['"]\)/g, to: "require('path-browserify')" },
  { from: /from ['"]node:buffer['"]/g, to: "from 'buffer'" },
  { from: /from ['"]node:path['"]/g, to: "from 'path-browserify'" },
];

// Function to recursively find JS files in a directory
async function findJsFiles(dir) {
  const jsFiles = [];
  
  // Read directory contents
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      // Skip node_modules inside node_modules
      if (file === 'node_modules' && dir.includes('node_modules')) {
        continue;
      }
      // Recursively scan subdirectories
      const subDirFiles = await findJsFiles(fullPath);
      jsFiles.push(...subDirFiles);
    } else if (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs')) {
      jsFiles.push(fullPath);
    }
  }
  
  return jsFiles;
}

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
  
  // Scan additional directories for JS files
  for (const dir of DIRS_TO_SCAN) {
    try {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        console.log(`🔍 Scanning directory: ${dir}`);
        const jsFiles = await findJsFiles(dirPath);
        console.log(`Found ${jsFiles.length} JS files in ${dir}`);
        
        for (const filePath of jsFiles) {
          await patchFile(filePath);
        }
      } else {
        console.log(`Directory does not exist: ${dir}`);
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }
  
  console.log('✅ Patching complete!');
}

findAndPatchFiles().catch(err => {
  console.error('❌ Patch script failed:', err);
  process.exit(1);
}); 