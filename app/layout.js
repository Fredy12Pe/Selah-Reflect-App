"use client";

import React, { useEffect, useState } from 'react';
import "./globals.css";

export default function RootLayout({ children }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for Firebase initialization issues
    const timeout = setTimeout(() => {
      if (typeof window !== 'undefined' && !window.firebase) {
        console.warn('Firebase not initialized after 3 seconds');
        setError('Firebase not initialized');
      }
      setLoading(false);
    }, 3000);

    // Handle global errors
    const handleError = (event) => {
      console.error('Global error:', event.error || event.message);
      setError(event.error?.message || event.message || 'Unknown error');
    };

    window.addEventListener('error', handleError);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('error', handleError);
    };
  }, []);

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
          React.createElement('meta', { key: 'theme-color', name: 'theme-color', content: '#000000' }),
          React.createElement('link', { key: 'manifest', rel: 'manifest', href: '/manifest.json' }),
          React.createElement('script', { key: 'fix-node-modules', src: '/fix-node-modules.js' }),
          React.createElement('script', { key: 'firebase-fix', src: '/firebase-fix.js' }),
          React.createElement('script', { key: 'firebase-patch', src: '/firebase-patch.js' }),
          React.createElement('script', { key: 'debug', src: '/debug.js' }),
        ]
      ),
      React.createElement(
        'body',
        { key: 'body', className: 'bg-black text-white' },
        loading ? 
          React.createElement('div', { style: { 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            background: '#000',
            color: '#fff',
            zIndex: 9999 
          }}, [
            React.createElement('h1', { key: 'loading-text' }, 'Loading Selah...'),
            error && React.createElement('p', { key: 'error-text', style: { color: '#ff5555' } }, error)
          ])
        : children
      )
    ]
  );
}