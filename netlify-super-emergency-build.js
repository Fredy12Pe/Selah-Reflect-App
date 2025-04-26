/**
 * Super Emergency Netlify Build Script
 * 
 * This script provides an absolute minimal build approach when all else fails.
 * It creates completely static pages without any Firebase dependencies.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚨 Starting SUPER EMERGENCY build process...');

// Set environment variables
process.env.NETLIFY = 'true';
process.env.SKIP_API_ROUTES = 'true';
process.env.SKIP_FIREBASE_ADMIN = 'true';
process.env.SKIP_FIREBASE = 'true';
process.env.NODE_ENV = 'production';
process.env.DISABLE_TELEMETRY = '1';

console.log('🔧 Environment variables set for super emergency build');

// Create backup directory for original files
const backupDir = path.join(__dirname, 'emergency-backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Files to back up and replace
const filesToReplace = [
  'app/layout.tsx',
  'app/page.tsx',
  'next.config.js'
];

// Back up original files
console.log('📂 Backing up original files...');
filesToReplace.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    const backupPath = path.join(backupDir, path.basename(file));
    fs.copyFileSync(
      path.join(__dirname, file),
      backupPath
    );
    console.log(`✅ Backed up ${file} to ${backupPath}`);
  }
});

// Create emergency layout file
console.log('📄 Creating minimal static files...');

// Simplest possible layout without any dependencies
const minimalLayout = `
"use client";

import React from 'react';

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
        <meta charSet="utf-8" />
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
        </style>
      </head>
      <body>{children}</body>
    </html>
  );
}
`;

// Static page with no client-side JS needed
const minimalPage = `
"use client";

import React from 'react';

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '28rem',
        margin: '0 auto',
        textAlign: 'center',
        padding: '2rem',
        borderRadius: '0.5rem',
        backgroundColor: '#2d3748'
      }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Selah Reflect
        </h1>
        <p style={{ marginBottom: '1.5rem' }}>
          This is a minimal emergency version of the app. The full version will be restored soon.
        </p>
        
        <div style={{ 
          borderTop: '1px solid #4a5568',
          paddingTop: '1rem',
          marginTop: '1rem'
        }}>
          <p style={{ color: '#a0aec0', fontSize: '0.875rem' }}>
            If you're seeing this page, the site is currently being updated or experiencing technical difficulties.
          </p>
        </div>
      </div>
    </div>
  );
}
`;

// Minimal next.config.js
const minimalNextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    forceSwcTransforms: true
  }
};

module.exports = nextConfig;
`;

// Write the minimal files
fs.writeFileSync(path.join(__dirname, 'app/layout.tsx'), minimalLayout);
fs.writeFileSync(path.join(__dirname, 'app/page.tsx'), minimalPage);
fs.writeFileSync(path.join(__dirname, 'next.config.js'), minimalNextConfig);

console.log('✅ Created minimal static files without dependencies');
console.log('📦 Building Next.js app in minimal mode...');

// Run the build
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Super emergency build completed successfully!');
} catch (error) {
  console.error('❌ Super emergency build failed:', error);
  process.exit(1);
} finally {
  // Restore original files
  console.log('🔄 Restoring original files...');
  filesToReplace.forEach(file => {
    const backupPath = path.join(backupDir, path.basename(file));
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(
        backupPath,
        path.join(__dirname, file)
      );
      console.log(`✅ Restored ${file} from backup`);
    }
  });
} 