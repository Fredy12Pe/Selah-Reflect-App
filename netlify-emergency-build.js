/**
 * Emergency Netlify Build Script
 * 
 * This script provides a minimal failsafe build approach for Netlify
 * when other approaches fail. It avoids all Firebase initialization.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🆘 Starting emergency build process...');

// Check for and install necessary dependencies
console.log('📦 Checking for required dependencies...');
try {
  // Check if babel-plugin-module-resolver is installed
  try {
    require.resolve('babel-plugin-module-resolver');
    console.log('✅ babel-plugin-module-resolver is already installed');
  } catch (err) {
    console.log('⚠️ babel-plugin-module-resolver not found, installing...');
    execSync('npm install babel-plugin-module-resolver --save-dev', { stdio: 'inherit' });
    console.log('✅ babel-plugin-module-resolver installed');
  }
  
  // Create .babelrc if it doesn't exist
  const babelrcPath = path.join(__dirname, '.babelrc');
  if (!fs.existsSync(babelrcPath)) {
    console.log('⚠️ .babelrc not found, creating...');
    const babelrc = {
      "presets": ["next/babel"],
      "plugins": [
        ["module-resolver", {
          "root": ["./"],
          "alias": {
            "@": "./"
          }
        }]
      ]
    };
    fs.writeFileSync(babelrcPath, JSON.stringify(babelrc, null, 2));
    console.log('✅ .babelrc created');
  }
} catch (error) {
  console.warn('⚠️ Error checking dependencies:', error.message);
}

// Check versions if the check script exists
try {
  if (fs.existsSync(path.join(__dirname, 'scripts/check-versions.js'))) {
    console.log('📊 Checking Node.js and npm versions...');
    require('./scripts/check-versions');
  }
} catch (error) {
  console.warn('⚠️ Could not check versions:', error.message);
}

// Set environment variables
process.env.NETLIFY = 'true';
process.env.SKIP_API_ROUTES = 'true';
process.env.SKIP_FIREBASE_ADMIN = 'true';
process.env.SKIP_FIREBASE = 'true'; // Skip all Firebase initialization
process.env.NODE_ENV = 'production';
process.env.DISABLE_TELEMETRY = '1';

console.log('🔧 Environment variables set for emergency build');

// Create emergency fallback layout
console.log('📄 Creating emergency fallback layout...');

// First check if we need to back up the original layout
if (fs.existsSync(path.join(__dirname, 'app/layout.tsx')) && 
    !fs.existsSync(path.join(__dirname, 'app/layout.tsx.bak'))) {
  fs.copyFileSync(
    path.join(__dirname, 'app/layout.tsx'),
    path.join(__dirname, 'app/layout.tsx.bak')
  );
  console.log('✅ Original layout backed up');
}

// Create minimal emergency layout
const emergencyLayout = `
"use client";

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Selah Reflect - Emergency Mode</title>
        <meta name="description" content="Selah Reflect App - Emergency Mode" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
`;

// Create minimal emergency page
const emergencyPage = `
"use client";

import MinimalPage from "./minimal-page";

export default function Home() {
  return <MinimalPage />;
}
`;

// Write emergency files
fs.writeFileSync(path.join(__dirname, 'app/layout.tsx'), emergencyLayout);
fs.writeFileSync(path.join(__dirname, 'app/page.tsx'), emergencyPage);

console.log('✅ Emergency fallback pages created');
console.log('📦 Building Next.js app without Firebase patching...');

// Execute Next.js build
try {
  // Run next build directly without any patching scripts
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Emergency build completed successfully!');
} catch (error) {
  console.error('❌ Emergency build failed:', error);
  process.exit(1);
} finally {
  // Restore original layout if backup exists
  if (fs.existsSync(path.join(__dirname, 'app/layout.tsx.bak'))) {
    fs.copyFileSync(
      path.join(__dirname, 'app/layout.tsx.bak'),
      path.join(__dirname, 'app/layout.tsx')
    );
    fs.unlinkSync(path.join(__dirname, 'app/layout.tsx.bak'));
    console.log('🔄 Original layout restored');
  }
}