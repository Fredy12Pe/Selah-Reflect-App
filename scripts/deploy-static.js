/**
 * Deploy Static Fallback to Netlify
 * 
 * This script deploys a minimal static fallback page to Netlify
 * when all other build approaches fail.
 */
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}🚀 Deploying static fallback to Netlify...${colors.reset}`);

try {
  // Check if Netlify CLI is installed
  try {
    execSync('netlify --version', { stdio: 'pipe' });
    console.log(`${colors.green}✅ Netlify CLI is installed${colors.reset}`);
  } catch (error) {
    console.log(`${colors.yellow}⚠️ Netlify CLI not found, installing...${colors.reset}`);
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    console.log(`${colors.green}✅ Netlify CLI installed${colors.reset}`);
  }

  // Generate the static fallback
  console.log(`${colors.blue}📦 Generating static fallback...${colors.reset}`);
  execSync('node netlify-static-fallback.js', { stdio: 'inherit' });
  
  // Deploy to Netlify
  console.log(`${colors.blue}🚀 Deploying to Netlify...${colors.reset}`);
  
  // Check if this is a production deployment
  const isProd = process.argv.includes('--prod');
  
  if (isProd) {
    console.log(`${colors.magenta}📣 Production deployment${colors.reset}`);
    execSync('netlify deploy --dir=.next --prod', { stdio: 'inherit' });
  } else {
    console.log(`${colors.yellow}📣 Draft deployment${colors.reset}`);
    execSync('netlify deploy --dir=.next', { stdio: 'inherit' });
  }
  
  console.log(`${colors.green}✅ Deployment completed successfully!${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Deployment failed:${colors.reset}`, error.message);
  process.exit(1);
} 