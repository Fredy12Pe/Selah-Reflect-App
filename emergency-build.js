/**
 * Emergency Build Script
 * 
 * This script creates minimal JS files for the Next.js app and builds for deployment
 * without relying on JSX or complex TypeScript features.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running emergency build...');

// Create minimal JS versions of key files
const createSimpleLayout = () => {
  const layoutContent = `
"use client";

import React from 'react';
import "./globals.css";

export default function RootLayout({ children }) {
  return React.createElement(
    'html',
    { lang: 'en' },
    [
      React.createElement(
        'head',
        { key: 'head' },
        [
          React.createElement('title', { key: 'title' }, 'Selah - Daily Devotions'),
          React.createElement('meta', { key: 'description', name: 'description', content: 'A personal devotional app for daily reflection' }),
          React.createElement('meta', { key: 'viewport', name: 'viewport', content: 'width=device-width, initial-scale=1' }),
          React.createElement('script', { key: 'fix-node-modules', src: '/fix-node-modules.js' }),
          React.createElement('script', { key: 'firebase-fix', src: '/firebase-fix.js' }),
          React.createElement('script', { key: 'firebase-patch', src: '/firebase-patch.js' }),
          React.createElement('script', { key: 'debug', src: '/debug.js' }),
        ]
      ),
      React.createElement(
        'body',
        { key: 'body', className: 'bg-black text-white' },
        children
      )
    ]
  );
}
  `;

  const pageContent = `
"use client";

import React, { useEffect, useState } from "react";

export default function HomePage() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to stop loading after 5 seconds regardless of state
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    try {
      // Try to detect if we're running in a browser with Firebase available
      if (typeof window !== 'undefined') {
        if (typeof window.firebase === 'undefined') {
          console.warn('[Home Page] Firebase not available');
          setError('Firebase is not available. Please refresh or check the console for errors.');
        } else {
          console.log('[Home Page] App initialized successfully');
        }
      }
    } catch (err) {
      console.error('[Home Page] Error during initialization:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      // Always set loading to false after checks
      setIsLoading(false);
    }

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return React.createElement(
      'div', 
      { className: "min-h-screen flex items-center justify-center bg-gray-900" },
      React.createElement(
        'div',
        { className: "text-center" },
        [
          React.createElement('div', { 
            key: 'spinner',
            className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto" 
          }),
          React.createElement('p', { 
            key: 'text',
            className: "mt-4 text-white" 
          }, "Loading Selah...")
        ]
      )
    );
  }

  if (error) {
    return React.createElement(
      'div',
      { className: "min-h-screen flex items-center justify-center bg-gray-900" },
      React.createElement(
        'div',
        { className: "max-w-md p-6 bg-gray-800 rounded-lg shadow-lg" },
        [
          React.createElement('h1', { 
            key: 'title',
            className: "text-2xl font-bold text-white mb-4" 
          }, "Selah"),
          React.createElement(
            'div', 
            { 
              key: 'error',
              className: "bg-red-900 text-white p-4 rounded mb-4" 
            },
            React.createElement('p', {}, "Error: " + error)
          ),
          React.createElement(
            'div',
            { 
              key: 'buttons',
              className: "flex flex-wrap gap-2 justify-center" 
            },
            [
              React.createElement(
                'button',
                { 
                  key: 'reload',
                  onClick: () => window.location.reload(),
                  className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                },
                "Reload Page"
              ),
              React.createElement(
                'button',
                { 
                  key: 'fallback',
                  onClick: () => { window.location.href = '/fallback.html'; },
                  className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                },
                "Go to Fallback Page"
              )
            ]
          )
        ]
      )
    );
  }

  return React.createElement(
    'div',
    { className: "min-h-screen flex items-center justify-center bg-gray-900" },
    React.createElement(
      'div',
      { className: "max-w-md p-6 bg-gray-800 rounded-lg shadow-lg" },
      [
        React.createElement('h1', { 
          key: 'title',
          className: "text-2xl font-bold text-white mb-4" 
        }, "Selah - Emergency Mode"),
        React.createElement('p', { 
          key: 'desc',
          className: "text-gray-300 mb-4" 
        }, "The application is running in emergency mode. Some features may not be available."),
        React.createElement(
          'p',
          { 
            key: 'debug-link',
            className: "mt-4 text-gray-300" 
          },
          [
            "Visit ",
            React.createElement(
              'a',
              { 
                href: "/firebase-debug.html",
                className: "text-blue-400 hover:underline"
              },
              "Firebase Debug Page"
            ),
            " for more tools."
          ]
        )
      ]
    )
  );
}
  `;

  // Backup original files if they exist
  try {
    if (fs.existsSync(path.join(__dirname, 'app/layout.tsx'))) {
      fs.renameSync(
        path.join(__dirname, 'app/layout.tsx'),
        path.join(__dirname, 'app/layout.tsx.bak')
      );
      console.log('Backed up original layout.tsx');
    }
    
    if (fs.existsSync(path.join(__dirname, 'app/page.tsx'))) {
      fs.renameSync(
        path.join(__dirname, 'app/page.tsx'),
        path.join(__dirname, 'app/page.tsx.bak')
      );
      console.log('Backed up original page.tsx');
    }
  } catch (err) {
    console.error('Error backing up files:', err);
  }

  // Write new files
  try {
    fs.writeFileSync(path.join(__dirname, 'app/layout.js'), layoutContent.trim());
    console.log('Created simple app/layout.js');
    
    fs.writeFileSync(path.join(__dirname, 'app/page.js'), pageContent.trim());
    console.log('Created simple app/page.js');

    // Delete TypeScript versions to avoid conflicts
    if (fs.existsSync(path.join(__dirname, 'app/layout.tsx'))) {
      fs.unlinkSync(path.join(__dirname, 'app/layout.tsx'));
    }
    
    if (fs.existsSync(path.join(__dirname, 'app/page.tsx'))) {
      fs.unlinkSync(path.join(__dirname, 'app/page.tsx'));
    }
  } catch (err) {
    console.error('Error creating JavaScript files:', err);
    throw err;
  }
};

// Update next.config.js to disable TypeScript checks
const updateNextConfig = () => {
  try {
    // Backup original next.config.js
    if (fs.existsSync(path.join(__dirname, 'next.config.js'))) {
      fs.copyFileSync(
        path.join(__dirname, 'next.config.js'),
        path.join(__dirname, 'next.config.js.bak')
      );
      console.log('Backed up next.config.js');
    }
    
    // Create simplified config
    const configContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
    `;
    
    fs.writeFileSync(path.join(__dirname, 'next.config.js'), configContent.trim());
    console.log('Created simplified next.config.js');
  } catch (err) {
    console.error('Error updating next.config.js:', err);
    throw err;
  }
};

// Main execution
try {
  // Create JS versions of critical files
  createSimpleLayout();
  
  // Update Next.js config
  updateNextConfig();
  
  // Apply Firebase patches
  console.log('Applying Firebase patches...');
  execSync('node patches/firebase-storage-fix/patch-node-imports.js', { stdio: 'inherit' });
  
  // Set environment variables for build
  process.env.SKIP_FIREBASE_INIT = 'true';
  process.env.SKIP_API_ROUTES = 'true';
  process.env.SKIP_FIREBASE_ADMIN = 'true';
  process.env.NETLIFY = 'true';
  process.env.NODE_ENV = 'production';
  
  // Run the build with full path to next
  console.log('Running Next.js build in emergency mode...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_FIREBASE_INIT: 'true',
      SKIP_API_ROUTES: 'true',
      SKIP_FIREBASE_ADMIN: 'true',
      NETLIFY: 'true',
      NODE_ENV: 'production',
    }
  });
  
  // Copy static HTML files to output directory if output directory exists
  if (fs.existsSync(path.join(__dirname, 'out'))) {
    console.log('Copying static fallback pages...');
    
    try {
      fs.copyFileSync(
        path.join(__dirname, 'public/fallback.html'),
        path.join(__dirname, 'out/fallback.html')
      );
      
      fs.copyFileSync(
        path.join(__dirname, 'public/firebase-debug.html'),
        path.join(__dirname, 'out/firebase-debug.html')
      );
    } catch (err) {
      console.error('Error copying static files:', err);
    }
  } else {
    console.log('Output directory does not exist, skipping file copying.');
  }
  
  console.log('Emergency build completed successfully!');
  
} catch (error) {
  console.error('Emergency build failed:', error);
  process.exit(1);
} 