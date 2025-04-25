/**
 * Netlify Deployment Script
 * 
 * Usage:
 * node scripts/deploy-netlify.js [--prod]
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if --prod flag is present
const isProd = process.argv.includes('--prod');

console.log('🚀 Deploying Selah app to Netlify...\n');

// Check if Netlify CLI is installed globally
try {
  execSync('netlify --version', { stdio: 'ignore' });
  console.log('✅ Netlify CLI is installed');
} catch (error) {
  console.log('⚠️ Netlify CLI is not installed globally');
  console.log('   Using local installation...');
}

// Run build
console.log('\n📦 Building the app...');
try {
  execSync('node netlify-build.js', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed. Aborting deployment.');
  process.exit(1);
}

// Check if user is logged in to Netlify
let isLoggedIn = false;
try {
  const output = execSync('npx netlify whoami', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
  isLoggedIn = !output.includes('You are not logged in');
  if (isLoggedIn) {
    console.log(`\n👤 Logged in to Netlify as: ${output}`);
  }
} catch (error) {
  console.log('\n⚠️ Not logged in to Netlify');
}

// Login if not already logged in
if (!isLoggedIn) {
  console.log('\n🔑 Please login to Netlify:');
  try {
    execSync('npx netlify login', { stdio: 'inherit' });
    console.log('✅ Successfully logged in to Netlify');
  } catch (error) {
    console.error('❌ Failed to login to Netlify. Aborting deployment.');
    process.exit(1);
  }
}

// Check if site is already configured
let siteConfigured = false;
try {
  execSync('npx netlify status', { stdio: 'ignore' });
  siteConfigured = true;
  console.log('\n🌐 Netlify site is already configured');
} catch (error) {
  console.log('\n⚠️ Netlify site is not configured');
}

// Initialize site if not configured
if (!siteConfigured) {
  console.log('\n🔧 Setting up your Netlify site:');
  try {
    execSync('npx netlify init', { stdio: 'inherit' });
    console.log('✅ Successfully set up Netlify site');
  } catch (error) {
    console.error('❌ Failed to initialize Netlify site. Aborting deployment.');
    process.exit(1);
  }
}

// Confirm deployment
const deploymentType = isProd ? 'PRODUCTION' : 'preview';
rl.question(`\n🚨 Ready to deploy to ${deploymentType}. Continue? (y/n) `, (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Deployment cancelled.');
    rl.close();
    return;
  }

  // Deploy to Netlify
  console.log(`\n🚀 Deploying to ${deploymentType}...`);
  try {
    const deployCommand = isProd 
      ? 'npx netlify deploy --prod' 
      : 'npx netlify deploy';
    
    execSync(deployCommand, { stdio: 'inherit' });
    console.log(`\n✅ Successfully deployed to ${deploymentType}`);
  } catch (error) {
    console.error(`\n❌ Deployment to ${deploymentType} failed.`);
    console.error(error);
  }

  rl.close();
}); 