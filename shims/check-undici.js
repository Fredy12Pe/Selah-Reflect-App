#!/usr/bin/env node

/**
 * Undici Module Checker
 * 
 * This script scans through Undici's code to identify problematic imports
 * and helps diagnose module resolution errors on Netlify.
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for prettier output
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

console.log(`${colors.bright}${colors.blue}🔍 Undici Module Checker${colors.reset}`);
console.log(`${colors.cyan}Scanning for problematic imports in Undici-related modules...${colors.reset}\n`);

// Paths to check for undici installation
const undiciPaths = [
  path.join(process.cwd(), 'node_modules', 'undici'),
  path.join(process.cwd(), 'node_modules', '@firebase', 'storage', 'node_modules', 'undici'),
];

// Map of problematic imports to look for and their fixes
const problematicImports = {
  "require('stream/web')": { 
    problem: "Imports stream/web which doesn't exist in browser",
    fix: "Redirect to shim/stream-web.js"
  },
  "require('util/types')": {
    problem: "Imports util/types which doesn't exist in browser",
    fix: "Redirect to shim/util-types.js"
  },
  "require('worker_threads')": {
    problem: "Imports worker_threads which doesn't exist in browser",
    fix: "Redirect to shim/worker-threads.js"
  },
  "require('async_hooks')": {
    problem: "Imports async_hooks which doesn't exist in browser",
    fix: "Replace with inline shim"
  },
  "require('console')": {
    problem: "Imports console which can cause issues in some environments",
    fix: "Replace with global console"
  },
  "require('net')": {
    problem: "Imports 'net' Node.js module which doesn't exist in browser",
    fix: "Falls back to empty object in next.config.js"
  }
};

// Keep track of findings
const issues = [];

// Function to scan directories
function scanDirectory(dir, depth = 0) {
  if (!fs.existsSync(dir)) {
    console.log(`${colors.yellow}⚠️  Directory not found: ${dir}${colors.reset}`);
    return;
  }

  if (depth === 0) {
    console.log(`${colors.cyan}Scanning ${dir}${colors.reset}`);
  }

  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules within node_modules
      if (file !== 'node_modules') {
        scanDirectory(filePath, depth + 1);
      }
    } else if (stat.isFile() && file.endsWith('.js')) {
      checkFile(filePath);
    }
  }
}

// Function to check a single file for problematic imports
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fileHasIssues = false;
    
    for (const [importPattern, info] of Object.entries(problematicImports)) {
      if (content.includes(importPattern)) {
        issues.push({
          file: filePath,
          import: importPattern,
          ...info
        });
        fileHasIssues = true;
      }
    }
    
    if (fileHasIssues) {
      console.log(`${colors.yellow}⚠️  Issues found in: ${filePath}${colors.reset}`);
    }
  } catch (e) {
    console.error(`${colors.red}Error reading file ${filePath}: ${e.message}${colors.reset}`);
  }
}

// Main process
for (const undiciPath of undiciPaths) {
  scanDirectory(undiciPath);
}

// Report findings
console.log(`\n${colors.bright}${colors.blue}📊 Scan Results${colors.reset}`);
console.log(`${colors.cyan}Found ${issues.length} problematic imports${colors.reset}\n`);

if (issues.length > 0) {
  // Group by issue type
  const groupedIssues = {};
  
  for (const issue of issues) {
    if (!groupedIssues[issue.import]) {
      groupedIssues[issue.import] = [];
    }
    groupedIssues[issue.import].push(issue.file);
  }
  
  for (const [importPattern, files] of Object.entries(groupedIssues)) {
    const issue = issues.find(i => i.import === importPattern);
    
    console.log(`${colors.bright}${colors.yellow}Problem: ${importPattern}${colors.reset}`);
    console.log(`${colors.magenta}Description: ${issue.problem}${colors.reset}`);
    console.log(`${colors.green}Fix: ${issue.fix}${colors.reset}`);
    console.log(`${colors.blue}Files (${files.length}):${colors.reset}`);
    
    // Only show first 5 files if there are many
    const showFiles = files.length > 5 ? files.slice(0, 5) : files;
    showFiles.forEach(file => {
      console.log(`  - ${file.replace(process.cwd(), '.')}`);
    });
    
    if (files.length > 5) {
      console.log(`  ... and ${files.length - 5} more files`);
    }
    
    console.log('');
  }
  
  console.log(`${colors.bright}${colors.magenta}Recommendation:${colors.reset}`);
  console.log(`1. Ensure all shim files are correctly set up in the 'shims/' directory`);
  console.log(`2. Check next.config.js has proper fallbacks for Node.js built-in modules`);
  console.log(`3. Run the netlify-test-build.js script to verify fixes\n`);
  
  process.exit(1);
} else {
  console.log(`${colors.bright}${colors.green}✅ No problematic imports found!${colors.reset}`);
  console.log('Your app should work correctly on Netlify.');
  
  process.exit(0);
} 