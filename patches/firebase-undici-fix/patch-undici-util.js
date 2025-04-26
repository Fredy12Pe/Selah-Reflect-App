/**
 * This script patches the undici module used by Firebase to replace private class fields
 * syntax (#target) with regular properties. This fixes compatibility issues with older
 * webpack/babel configurations.
 */

const fs = require('fs');
const path = require('path');

// Files that need patching
const filesToPatch = [
  'node_modules/firebase/node_modules/undici/lib/web/fetch/util.js',
  'node_modules/@firebase/auth/dist/node-esm/core/util/navigator.js',
  // Add more files as needed
];

// Additional directories to scan for JS files that might contain private fields
const dirsToScan = [
  'node_modules/firebase/node_modules/undici',
  'node_modules/@firebase/auth'
];

// Patterns to replace
const replacements = [
  {
    // Replace private field access
    pattern: /#(\w+)\s+in\s+this/g,
    replacement: 'Object.prototype.hasOwnProperty.call(this, "_$$$_$1")'
  },
  {
    // Replace private field declarations
    pattern: /#(\w+)\s*=/g,
    replacement: '_$$$_$1 ='
  },
  {
    // Replace private field access in other contexts
    pattern: /this\.#(\w+)/g,
    replacement: 'this._$$$_$1'
  }
];

// Function to find all JS files in a directory recursively
function findJsFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return [];
  }
  
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recurse into subdirectory
      results = results.concat(findJsFiles(filePath));
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Apply replacements to a file
function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  console.log(`Patching file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let madeChanges = false;
  
  replacements.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      madeChanges = true;
      console.log(`  - Applied replacement: ${pattern} -> ${replacement}`);
    }
  });
  
  if (madeChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  - File patched successfully`);
    return true;
  } else {
    console.log(`  - No changes needed`);
    return false;
  }
}

// Main function to run the patch
function main() {
  console.log('Starting to patch undici private fields...');
  let patchedFiles = 0;
  
  // First, patch the known files
  filesToPatch.forEach(filePath => {
    if (patchFile(filePath)) {
      patchedFiles++;
    }
  });
  
  // Then scan directories for additional files
  dirsToScan.forEach(dir => {
    console.log(`Scanning directory: ${dir}`);
    const jsFiles = findJsFiles(dir);
    console.log(`Found ${jsFiles.length} JS files in ${dir}`);
    
    jsFiles.forEach(filePath => {
      if (patchFile(filePath)) {
        patchedFiles++;
      }
    });
  });
  
  console.log(`Patching complete. ${patchedFiles} files were modified.`);
}

// Run the main function
main(); 