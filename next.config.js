/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const path = require('path');

const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'www.google.com', 'source.unsplash.com'],
    unoptimized: process.env.NETLIFY === 'true',
  },
  // Ensure proper handling of client-side navigation
  reactStrictMode: true,
  swcMinify: true,
  // Explicitly mark pages/components as client-side rendering only
  // This helps with build-time errors on Netlify
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
    outputFileTracingRoot: process.env.NETLIFY ? "/" : undefined,
  },
  // Modify webpack config for Netlify
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        console: require.resolve('console-browserify'),
        async_hooks: false,
        'stream/web': false,
        'util/types': false,
        'worker_threads': false,
        util: require.resolve('util/'),
      };

      // Force resolving Firebase dependencies for client builds
      config.resolve.alias = {
        ...config.resolve.alias,
        '@firebase/app': require.resolve('@firebase/app'),
        '@firebase/auth': require.resolve('@firebase/auth'),
        '@firebase/firestore': require.resolve('@firebase/firestore'),
        '@firebase/storage': require.resolve('@firebase/storage'),
        // Add aliases for deep node modules to handle relative path issues
        'util/types': path.resolve(__dirname, 'shims/util-types.js'),
        'stream/web': path.resolve(__dirname, 'shims/stream-web.js'),
        'worker_threads': path.resolve(__dirname, 'shims/worker-threads.js'),
      };
      
      // Add the Buffer polyfill for client-side
      if (!config.resolve.fallback.buffer) {
        config.resolve.fallback.buffer = require.resolve('buffer/');
      }
    }

    // Handle module not found errors with Firebase
    config.ignoreWarnings = [
      { module: /firebase/ },
      { file: /firebase/ },
      { module: /undici/ },
      { file: /undici/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /Can't resolve 'async_hooks'/ },
      { message: /Can't resolve 'stream\/web'/ },
      { message: /Can't resolve 'util\/types'/ },
      { message: /Can't resolve 'worker_threads'/ },
      { message: /Can't resolve 'console'/ },
    ];

    return config;
  },
  transpilePackages: [
    'undici', 
    '@firebase/app', 
    '@firebase/auth', 
    '@firebase/firestore', 
    '@firebase/storage', 
    '@firebase/functions', 
    '@firebase/database',
    '@firebase/util',
    '@firebase/component'
  ],
}

module.exports = withPWA(nextConfig); 