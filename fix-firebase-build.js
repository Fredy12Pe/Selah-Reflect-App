/**
 * Firebase Build Fix Script
 * This script specifically addresses issues with private class fields in Firebase dependencies
 * for Cloud Run deployments.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Firebase build fix process...');

// Function to find all potential problematic files
function findProblematicFiles() {
  console.log('Scanning for files with private class fields...');
  
  const results = [];
  try {
    // Look for files containing private class fields in Firebase dependencies
    const command = `grep -r "#\\w\\+ in this" --include="*.js" node_modules/firebase node_modules/@firebase 2>/dev/null || true`;
    const output = execSync(command, { encoding: 'utf8' });
    
    if (output.trim()) {
      const lines = output.trim().split('\n');
      lines.forEach(line => {
        const filePath = line.split(':')[0];
        if (filePath && !results.includes(filePath)) {
          results.push(filePath);
        }
      });
    }
    
    console.log(`Found ${results.length} files with potential issues.`);
  } catch (error) {
    console.error('Error scanning for problematic files:', error);
  }
  
  return results;
}

// Function to patch a single file
function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  console.log(`Patching file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Create a backup of the original file
  if (!fs.existsSync(`${filePath}.original`)) {
    fs.writeFileSync(`${filePath}.original`, content, 'utf8');
  }
  
  // Replace private field access patterns
  let newContent = content
    // Replace #field in this with hasOwnProperty check
    .replace(/#(\w+)\s+in\s+this/g, 'Object.prototype.hasOwnProperty.call(this, "_$$$_$1")')
    // Replace this.#field with this._$$$_field
    .replace(/this\.#(\w+)/g, 'this._$$$_$1')
    // Replace #field = with _$$$_field =
    .replace(/#(\w+)\s*=/g, '_$$$_$1 =');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`- Successfully patched ${filePath}`);
    return true;
  } else {
    console.log(`- No changes needed for ${filePath}`);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Apply storage fix patch
    console.log('\nApplying Node.js import patches for Firebase Storage...');
    const storageFixPath = path.join(__dirname, 'patches', 'firebase-storage-fix', 'patch-node-imports.js');
    if (fs.existsSync(storageFixPath)) {
      execSync(`node ${storageFixPath}`, { stdio: 'inherit' });
    } else {
      console.log(`Warning: Storage fix patch not found at ${storageFixPath}`);
    }
    
    // Apply undici fix patch
    console.log('\nApplying private fields patch for undici module...');
    const undiciFixPath = path.join(__dirname, 'patches', 'firebase-undici-fix', 'patch-private-fields.js');
    if (fs.existsSync(undiciFixPath)) {
      execSync(`node ${undiciFixPath}`, { stdio: 'inherit' });
    } else {
      console.log(`Warning: Undici fix patch not found at ${undiciFixPath}`);
    }
    
    // Find and fix any remaining problematic files
    console.log('\nScanning for any remaining issues...');
    const problematicFiles = findProblematicFiles();
    
    if (problematicFiles.length > 0) {
      console.log(`Found ${problematicFiles.length} files that need patching:`);
      let patchedCount = 0;
      
      problematicFiles.forEach(file => {
        if (patchFile(file)) {
          patchedCount++;
        }
      });
      
      console.log(`Successfully patched ${patchedCount} out of ${problematicFiles.length} files.`);
    } else {
      console.log('No additional files with private class fields found.');
    }
    
    console.log('\nFix process completed successfully!');
  } catch (error) {
    console.error('Error during fix process:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 