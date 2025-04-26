/**
 * Version Check Script
 * 
 * This script checks if the current Node.js and npm versions
 * match the required versions specified in package.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to get current versions
function getCurrentVersions() {
  try {
    const nodeVersion = process.version;
    const npmVersion = execSync('npm --version').toString().trim();
    
    return {
      node: nodeVersion,
      npm: npmVersion
    };
  } catch (error) {
    console.error('Error getting versions:', error);
    return {
      node: 'unknown',
      npm: 'unknown'
    };
  }
}

// Function to check if version meets requirement
function meetsRequirement(current, required) {
  if (!required) return true;
  
  // Remove 'v' prefix if present
  current = current.startsWith('v') ? current.substring(1) : current;
  required = required.replace(/[^0-9.]/g, ''); // Remove non-numeric chars except dots
  
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const requiredPart = requiredParts[i] || 0;
    
    if (currentPart > requiredPart) return true;
    if (currentPart < requiredPart) return false;
  }
  
  return true; // Versions are equal
}

// Main function
function checkVersions() {
  console.log('🔍 Checking Node.js and npm versions...');
  
  // Get package.json requirements
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  let requiredVersions = { node: null, npm: null };
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.engines) {
      requiredVersions.node = packageJson.engines.node;
      requiredVersions.npm = packageJson.engines.npm;
    }
  } catch (error) {
    console.error('Error reading package.json:', error);
  }
  
  // Get current versions
  const currentVersions = getCurrentVersions();
  
  // Output versions
  console.log(`Node.js: Current ${currentVersions.node}, Required ${requiredVersions.node || 'not specified'}`);
  console.log(`npm: Current ${currentVersions.npm}, Required ${requiredVersions.npm || 'not specified'}`);
  
  // Check if versions meet requirements
  let allRequirementsMet = true;
  
  if (requiredVersions.node && !meetsRequirement(currentVersions.node, requiredVersions.node)) {
    console.error(`❌ Node.js version ${currentVersions.node} does not meet requirement ${requiredVersions.node}`);
    allRequirementsMet = false;
  }
  
  if (requiredVersions.npm && !meetsRequirement(currentVersions.npm, requiredVersions.npm)) {
    console.error(`❌ npm version ${currentVersions.npm} does not meet requirement ${requiredVersions.npm}`);
    allRequirementsMet = false;
  }
  
  if (allRequirementsMet) {
    console.log('✅ All version requirements met');
    return true;
  } else {
    console.error('❌ Some version requirements not met');
    return false;
  }
}

// Run the check
const requirementsMet = checkVersions();

// Exit with error if requirements not met
if (!requirementsMet && process.env.STRICT_VERSION_CHECK === 'true') {
  process.exit(1);
}

module.exports = { checkVersions }; 