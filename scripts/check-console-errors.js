// Script to check for console errors in the browser using Puppeteer
const puppeteer = require('puppeteer');
const http = require('http');

// Check if running in CI environment (like Netlify)
const isCI = process.env.CI === 'true' || process.env.NETLIFY === 'true';

// Check if server is running
function isServerRunning(url, callback) {
  const options = new URL(url);
  
  const req = http.request(options, (res) => {
    callback(true);
  });
  
  req.on('error', () => {
    callback(false);
  });
  
  req.setTimeout(5000, () => {
    req.destroy();
    callback(false);
  });
  
  req.end();
}

async function checkConsoleErrors() {
  console.log('Launching browser to check for console errors...');
  
  // If in CI environment, just log and exit early
  if (isCI) {
    console.log('⚠️ Running in CI environment, skipping browser checks');
    console.log('This script is designed to run locally for development purposes.');
    return;
  }
  
  // First check if the server is running
  return new Promise((resolve) => {
    isServerRunning('http://localhost:3000', async (running) => {
      if (!running) {
        console.error('❌ Server is not running at http://localhost:3000');
        console.log('Please start the development server with: npm run dev');
        return resolve();
      }
      
      let browser;
      
      try {
        // Configure browser with appropriate settings
        const launchOptions = {
          headless: 'new', // Use the new headless mode
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
          ],
          timeout: 60000 // 60 second timeout for browser launch
        };
        
        console.log('Launching browser with options:', JSON.stringify(launchOptions, null, 2));
        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        
        // Collect console messages
        const consoleMessages = [];
        page.on('console', msg => {
          consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
          });
        });
        
        // Collect errors
        page.on('pageerror', error => {
          consoleMessages.push({
            type: 'error',
            text: error.message,
          });
        });
        
        // Navigate to the app and wait for network idle
        console.log('Navigating to app...');
        await page.goto('http://localhost:3000', { 
          waitUntil: 'networkidle2',
          timeout: 60000 // Increase timeout to 60 seconds
        });
        
        // Wait a bit to ensure the app has time to load or fail
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Print all console messages
        console.log('\nBrowser Console Output:');
        if (consoleMessages.length === 0) {
          console.log('No console messages recorded.');
        } else {
          consoleMessages.forEach(msg => {
            console.log(`[${msg.type}] ${msg.text}`);
          });
        }
        
        // Check if we're stuck in loading
        const loadingElements = await page.$$('.loading, [data-loading="true"], .spinner');
        if (loadingElements.length > 0) {
          console.log('\nFound loading indicators still present on the page after timeout.');
        }
        
        // Take a screenshot
        await page.screenshot({ path: 'app-state.png' });
        console.log('\nScreenshot saved as app-state.png');
        
      } catch (error) {
        console.error('Error during browser check:', error);
        // Take a screenshot even if there was an error
        try {
          if (browser && browser.isConnected()) {
            const pages = await browser.pages();
            if (pages.length > 0) {
              await pages[0].screenshot({ path: 'error-state.png' });
              console.log('\nError screenshot saved as error-state.png');
            }
          }
        } catch (e) {
          console.error('Could not take error screenshot:', e.message);
        }
      } finally {
        if (browser) {
          try {
            await browser.close();
            console.log('Browser closed');
          } catch (e) {
            console.error('Error closing browser:', e.message);
          }
        }
        resolve();
      }
    });
  });
}

// Run the function and properly handle errors
checkConsoleErrors()
  .catch(error => {
    console.error('Unhandled error in script:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Script completed');
  }); 