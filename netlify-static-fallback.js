/**
 * Static Fallback Generator for Netlify
 * 
 * This script skips the Next.js build entirely and generates a simple static HTML page
 * as the ultimate fallback when all other build methods fail.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚨 Creating static fallback page for Netlify...');

// Create the .next directory if it doesn't exist
const nextDir = path.join(__dirname, '.next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}

// Create a modules directory to hold dependencies
const modulesDir = path.join(nextDir, 'node_modules');
if (!fs.existsSync(modulesDir)) {
  fs.mkdirSync(modulesDir, { recursive: true });
}

// Create babel plugins directory
const babelPluginsDir = path.join(modulesDir, 'babel-plugin-module-resolver');
if (!fs.existsSync(babelPluginsDir)) {
  fs.mkdirSync(babelPluginsDir, { recursive: true });
}

// Copy babel-plugin-module-resolver from project's node_modules if it exists
const srcBabelPluginDir = path.join(__dirname, 'node_modules/babel-plugin-module-resolver');
if (fs.existsSync(srcBabelPluginDir)) {
  try {
    // Create a simple package.json for the plugin
    const babelPluginPkg = {
      "name": "babel-plugin-module-resolver",
      "version": "5.0.0",
      "main": "lib/index.js"
    };
    
    fs.writeFileSync(
      path.join(babelPluginsDir, 'package.json'), 
      JSON.stringify(babelPluginPkg, null, 2)
    );
    
    // Create a simple index.js that exports a dummy plugin
    const pluginContent = `
module.exports = function() {
  return {
    visitor: {
      // Empty visitor
    }
  };
};
`;
    
    // Create lib directory
    const libDir = path.join(babelPluginsDir, 'lib');
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(libDir, 'index.js'), pluginContent);
    console.log('✅ Created babel-plugin-module-resolver in the .next directory');
  } catch (err) {
    console.warn('⚠️ Failed to copy babel-plugin-module-resolver:', err.message);
  }
}

// Create a static directory for the page
const staticDir = path.join(nextDir, 'static');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Create the HTML content
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selah Reflect - Maintenance Mode</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #1a202c;
      color: white;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .card {
      max-width: 28rem;
      margin: 0 auto;
      text-align: center;
      padding: 2rem;
      border-radius: 0.5rem;
      background-color: #2d3748;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 1.875rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
    }
    p {
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .footer {
      border-top: 1px solid #4a5568;
      padding-top: 1rem;
      margin-top: 1rem;
    }
    .footer p {
      color: #a0aec0;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Selah Reflect</h1>
      <p>This is a maintenance page. The full application will be restored soon.</p>
      <div class="footer">
        <p>If you're seeing this page, the site is currently being updated or experiencing technical difficulties.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Create an index.html file in the .next directory
fs.writeFileSync(path.join(nextDir, 'index.html'), htmlContent);

// Create a server.js file that will serve the static file
const serverJs = `
// This is a simple server file for Netlify
const handler = (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(${JSON.stringify(htmlContent)});
};

module.exports = { handler };
`;

// Create necessary files for Netlify
fs.writeFileSync(path.join(nextDir, 'server.js'), serverJs);

// Create a minimal package.json for Netlify
const packageJson = {
  "name": "selah-reflect-static-fallback",
  "version": "1.0.0",
  "main": "server.js",
  "engines": {
    "node": ">=14.0.0"
  },
  "dependencies": {
    "babel-plugin-module-resolver": "^5.0.0"
  }
};

fs.writeFileSync(path.join(nextDir, 'package.json'), JSON.stringify(packageJson, null, 2));

// Create a simple .babelrc file to satisfy dependencies
const babelrc = {
  "plugins": [
    ["module-resolver", {
      "root": ["./"],
      "alias": {
        "@": "./"
      }
    }]
  ]
};

fs.writeFileSync(path.join(nextDir, '.babelrc'), JSON.stringify(babelrc, null, 2));

console.log('✅ Static fallback page created successfully!');
console.log('📋 Files created:');
console.log(`  - ${path.join(nextDir, 'index.html')}`);
console.log(`  - ${path.join(nextDir, 'server.js')}`);
console.log(`  - ${path.join(nextDir, 'package.json')}`);
console.log(`  - ${path.join(nextDir, '.babelrc')}`);
console.log('🚀 Ready for deployment to Netlify!'); 