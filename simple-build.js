/**
 * Simple Static Build Script
 * 
 * This creates a minimal set of static HTML files without requiring
 * any complex build process.
 */
const fs = require('fs');
const path = require('path');

console.log('Creating simple static build...');

// Create output directory
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Create a _next directory for static assets
const nextDir = path.join(outDir, '_next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}

// Create static directory
const staticDir = path.join(outDir, 'static');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Copy any public files if they exist
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  // List all files in public
  const publicFiles = fs.readdirSync(publicDir);
  
  // Copy each file to output
  publicFiles.forEach(file => {
    const sourcePath = path.join(publicDir, file);
    const destPath = path.join(outDir, file);
    
    // Skip directories
    if (fs.statSync(sourcePath).isDirectory()) {
      return;
    }
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to output`);
  });
}

// Create index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Selah - Daily Devotions</title>
    <meta name="description" content="A personal devotional app for daily reflection" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #1a202c;
        color: white;
        margin: 0;
        padding: 0;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .container {
        max-width: 28rem;
        margin: 4rem auto;
        text-align: center;
        padding: 2rem;
        border-radius: 0.5rem;
        background-color: #2d3748;
      }
      h1 {
        font-size: 1.875rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
      }
      .spinner {
        width: 3rem;
        height: 3rem;
        margin: 1rem auto;
        border-radius: 50%;
        border: 0.25rem solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .button {
        display: inline-block;
        padding: 0.5rem 1rem;
        margin: 0.5rem;
        border-radius: 0.25rem;
        font-size: 1rem;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
      }
      .button-primary {
        background-color: #4299e1;
        color: white;
      }
      .button-secondary {
        background-color: #48bb78;
        color: white;
      }
      .error {
        background-color: #742a2a;
        color: white;
        padding: 1rem;
        border-radius: 0.25rem;
        margin-bottom: 1rem;
      }
    </style>
    <script>
      // Simple redirect for debugging
      function goToFallback() {
        window.location.href = '/fallback.html';
      }
    </script>
  </head>
  <body class="bg-black text-white">
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
      <div class="container">
        <h1>Selah - Emergency Mode</h1>
        <p>The application is running in emergency mode. Some features may not be available.</p>
        <p>Loading status will be shown below.</p>
        
        <div class="spinner"></div>
        <p>We're experiencing some technical difficulties.</p>
        
        <div style="margin-top: 2rem;">
          <a href="/" class="button button-primary">Reload Page</a>
          <a href="/fallback.html" class="button button-secondary">Go to Fallback Page</a>
        </div>

        <p style="margin-top: 2rem; font-size: 0.875rem; color: #a0aec0;">
          Visit <a href="/firebase-debug.html" style="color: #4299e1;">Firebase Debug Page</a> for more tools.
        </p>
      </div>
    </div>
  </body>
</html>`;

// Create fallback.html if it doesn't exist in public
const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Selah - Fallback Page</title>
    <meta name="description" content="Fallback page for Selah application" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #1a202c;
        color: white;
        margin: 0;
        padding: 0;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .container {
        max-width: 28rem;
        margin: 4rem auto;
        text-align: center;
        padding: 2rem;
        border-radius: 0.5rem;
        background-color: #2d3748;
      }
      h1 {
        font-size: 1.875rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
      }
      .button {
        display: inline-block;
        padding: 0.5rem 1rem;
        margin: 0.5rem;
        border-radius: 0.25rem;
        font-size: 1rem;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
      }
      .button-primary {
        background-color: #4299e1;
        color: white;
      }
    </style>
  </head>
  <body>
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
      <div class="container">
        <h1>Selah - Fallback Page</h1>
        <p>This is a static fallback page that works without any JavaScript dependencies.</p>
        <p>The main application is currently unavailable.</p>
        
        <div style="margin-top: 2rem;">
          <a href="/" class="button button-primary">Return to Home</a>
        </div>
      </div>
    </div>
  </body>
</html>`;

// Create firebase-debug.html
const firebaseDebugHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Selah - Firebase Debug</title>
    <meta name="description" content="Firebase Debug Page" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #1a202c;
        color: white;
        margin: 0;
        padding: 0;
        min-height: 100vh;
      }
      .container {
        max-width: 40rem;
        margin: 2rem auto;
        padding: 2rem;
        border-radius: 0.5rem;
        background-color: #2d3748;
      }
      h1 {
        font-size: 1.875rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
      }
      h2 {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 1.5rem 0 0.75rem;
      }
      pre {
        background: #1a202c;
        padding: 1rem;
        border-radius: 0.25rem;
        overflow-x: auto;
        white-space: pre-wrap;
      }
      .button {
        display: inline-block;
        padding: 0.5rem 1rem;
        margin: 0.5rem;
        border-radius: 0.25rem;
        font-size: 1rem;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
      }
      .button-primary {
        background-color: #4299e1;
        color: white;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Firebase Debug Tools</h1>
      
      <h2>Environment Information</h2>
      <pre id="env-info">Loading environment info...</pre>
      
      <h2>Browser Information</h2>
      <pre id="browser-info">Loading browser info...</pre>
      
      <h2>Firebase Status</h2>
      <pre id="firebase-status">Checking Firebase status...</pre>
      
      <div style="margin-top: 2rem; text-align: center;">
        <a href="/" class="button button-primary">Return to Home</a>
      </div>
      
      <script>
        // Simple debug script
        document.getElementById('browser-info').textContent = 
          'User Agent: ' + navigator.userAgent + '\\n' +
          'Platform: ' + navigator.platform + '\\n' +
          'Window Dimensions: ' + window.innerWidth + 'x' + window.innerHeight;
        
        document.getElementById('env-info').textContent = 
          'Page URL: ' + window.location.href + '\\n' +
          'Timestamp: ' + new Date().toISOString();
        
        // Check Firebase
        document.getElementById('firebase-status').textContent = 
          'Firebase global object: ' + (typeof window.firebase !== 'undefined' ? 'Available' : 'Not available');
      </script>
    </div>
  </body>
</html>`;

// Write files
fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);
fs.writeFileSync(path.join(outDir, 'fallback.html'), fallbackHtml);
fs.writeFileSync(path.join(outDir, 'firebase-debug.html'), firebaseDebugHtml);

console.log('Static build complete! Files generated:');
console.log('- index.html');
console.log('- fallback.html');
console.log('- firebase-debug.html');
console.log(`\nOutput directory: ${outDir}`); 