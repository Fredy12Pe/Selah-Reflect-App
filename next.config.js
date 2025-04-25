/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

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
    // Add NodePolyfillPlugin to handle node:* imports
    if (!isServer) {
      config.plugins.push(
        new NodePolyfillPlugin({
          excludeAliases: ['console']
        })
      );
      
      // Special case for handling node: prefixed imports
      // This needs to be prioritized over the NodePolyfillPlugin
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      
      // Add a rule to handle node: URI imports directly
      config.module.rules.push({
        test: /\.js$/,
        include: [
          /node_modules\/@firebase\/storage/,
          /node_modules\/firebase\/storage/,
          /node_modules\/@fastify\/busboy/,
          /node_modules\/undici/
        ],
        resolve: {
          alias: {
            'node:events': path.resolve(__dirname, 'shims/node-events.js'),
            'node:stream': path.resolve(__dirname, 'shims/node-stream.js'),
            'node:util': path.resolve(__dirname, 'shims/node-util.js')
          }
        }
      });
    }
    
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
        // Additional modules from error logs
        'perf_hooks': false,
        'diagnostics_channel': false,
        'http2': false,
        'dns': false,
        // Fix for node: URI imports
        'node:stream': path.resolve(__dirname, 'shims/node-stream.js'),
        'node:util': path.resolve(__dirname, 'shims/node-util.js'),
        'node:events': path.resolve(__dirname, 'shims/node-events.js'),
        events: require.resolve('events/'),
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
        // Handle Firestore Node.js bundle imports in the browser
        '@firebase/firestore/dist/index.node.mjs': path.resolve(__dirname, 'shims/firestore-browser.js'),
        // Additional Node.js modules from error logs
        'perf_hooks': path.resolve(__dirname, 'shims/perf-hooks.js'),
        'diagnostics_channel': path.resolve(__dirname, 'shims/diagnostics-channel.js'),
        'http2': path.resolve(__dirname, 'shims/http2.js'),
        'dns': path.resolve(__dirname, 'shims/dns.js'),
        // Alias node: prefixed imports to their browserify equivalents
        'node:stream': path.resolve(__dirname, 'shims/node-stream.js'),
        'node:util': path.resolve(__dirname, 'shims/node-util.js'),
        'node:events': path.resolve(__dirname, 'shims/node-events.js'),
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
      { message: /'_isFirebaseServerApp' is not exported from '@firebase\/app'/ },
      { message: /Attempted import error/ },
      { message: /Module not found: Can't resolve/ },
      // Additional warning patterns from error logs
      { message: /Can't resolve 'perf_hooks'/ },
      { message: /Can't resolve 'diagnostics_channel'/ },
      { message: /Can't resolve 'http2'/ },
      { message: /Can't resolve 'dns'/ },
      // Node URI import errors
      { message: /Can't resolve 'node:stream'/ },
      { message: /Can't resolve 'node:util'/ },
      { message: /Can't resolve 'node:events'/ },
      { message: /Can't resolve 'events'/ },
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
    '@firebase/component',
    'events'
  ],
}

module.exports = withPWA(nextConfig); 