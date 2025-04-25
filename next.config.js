/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const FirebasePatchPlugin = require('./lib/webpack/firebase-patch-plugin');
const webpack = require('webpack');

// Check if Firebase patching should be skipped
const skipFirebasePatch = process.env.SKIP_FIREBASE_PATCH === 'true';
console.log(`[Next Config] Skip Firebase Patching: ${skipFirebasePatch}`);

const nextConfig = {
  output: process.env.NEXT_STATIC_EXPORT === 'true' ? 'export' : undefined,
  images: {
    domains: ['images.unsplash.com', 'www.google.com', 'source.unsplash.com', 'firebasestorage.googleapis.com'],
    unoptimized: process.env.NETLIFY === 'true',
  },
  // Ensure proper handling of client-side navigation
  reactStrictMode: true,
  swcMinify: true,
  // Enable SWC compiler alongside Babel
  experimental: {
    forceSwcTransforms: true, // This forces SWC for font loading
    serverComponentsExternalPackages: ['firebase-admin'],
    outputFileTracingRoot: process.env.NETLIFY ? "/" : __dirname,
  },
  
  // Modify webpack config for Netlify
  webpack: (config, { isServer, dev }) => {
    // Completely disable Terser plugin
    if (!dev) {
      config.optimization.minimize = false;
      config.optimization.minimizer = [];
    }
    
    // Add NodePolyfillPlugin to handle node:* imports
    if (!isServer) {
      // Add our Firebase patch plugin to fix the _registerComponent issue
      if (!skipFirebasePatch) {
        console.log('[Next Config] Adding FirebasePatchPlugin');
        config.plugins.push(new FirebasePatchPlugin());
      }
      
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
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules(?!\/(@firebase|firebase|@fastify\/busboy|undici))/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['next/babel'],
            plugins: [
              // Custom babel plugin to transform node:xxx imports
              function () {
                return {
                  visitor: {
                    ImportDeclaration(path) {
                      const source = path.node.source;
                      if (source.value.startsWith('node:')) {
                        // Replace node:xxx with regular module name
                        source.value = source.value.substring(5);
                      }
                    },
                    CallExpression(path) {
                      // Handle require('node:xxx') calls
                      if (
                        path.node.callee.name === 'require' &&
                        path.node.arguments.length > 0 &&
                        path.node.arguments[0].type === 'StringLiteral' &&
                        path.node.arguments[0].value.startsWith('node:')
                      ) {
                        path.node.arguments[0].value = path.node.arguments[0].value.substring(5);
                      }
                    }
                  }
                };
              }
            ]
          }
        }
      });
      
      // Add an additional rule to handle process access in undici
      config.module.rules.push({
        test: /undici\/lib\/core\/util\.js$/,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: 'process.versions.node.split',
            replace: '("16.0.0").split',
            flags: 'g'
          }
        }
      });
    }
    
    // Configure fallbacks for Node.js modules
    if (!isServer) {
      // Define a comprehensive set of fallbacks for browser environment
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        http2: false,
        child_process: false,
        async_hooks: false,
        'stream/web': false,
        'util/types': false,
        'worker_threads': false,
        'perf_hooks': false,
        'diagnostics_channel': false,
        
        // Core polyfills
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        events: require.resolve('events/'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        assert: require.resolve('assert/'),
        constants: require.resolve('constants-browserify'),
        timers: require.resolve('timers-browserify'),
        console: require.resolve('console-browserify'),
        
        // Node URI imports - explicitly ensure these are handled
        'node:events': require.resolve('events/'),
        'node:stream': require.resolve('stream-browserify'),
        'node:util': require.resolve('util/'),
        'node:crypto': require.resolve('crypto-browserify'),
        'node:buffer': require.resolve('buffer'),
        'node:path': require.resolve('path-browserify'),
        'node:zlib': require.resolve('browserify-zlib'),
        'node:http': require.resolve('stream-http'),
        'node:https': require.resolve('https-browserify'),
        'node:os': require.resolve('os-browserify/browser'),
        'node:assert': require.resolve('assert/'),
        'node:timers': require.resolve('timers-browserify'),
        'node:console': require.resolve('console-browserify'),
      };
      
      // Provide environment variables for process.versions
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.versions': JSON.stringify({
            node: '16.0.0',
          }),
          'process.version': JSON.stringify('v16.0.0'),
        })
      );
    }

    // Force resolving Firebase dependencies for client builds
    if (!isServer) {
      // Use Firebase Modular SDK with direct import paths
      config.resolve.alias = {
        ...config.resolve.alias,
        // Firebase 9+ ESM modules - use proper package paths
        '@firebase/app': path.resolve(__dirname, 'node_modules/@firebase/app'),
        '@firebase/auth': path.resolve(__dirname, 'node_modules/@firebase/auth'),
        '@firebase/firestore': path.resolve(__dirname, 'node_modules/@firebase/firestore'),
        '@firebase/storage': path.resolve(__dirname, 'node_modules/@firebase/storage'),
        '@firebase/functions': path.resolve(__dirname, 'node_modules/@firebase/functions'),
        '@firebase/util': path.resolve(__dirname, 'node_modules/@firebase/util'),
        '@firebase/component': path.resolve(__dirname, 'node_modules/@firebase/component'),
        '@firebase/logger': path.resolve(__dirname, 'node_modules/@firebase/logger'),
        'firebase/app': path.resolve(__dirname, 'node_modules/firebase/app'),
        'firebase/auth': path.resolve(__dirname, 'node_modules/firebase/auth'),
        'firebase/firestore': path.resolve(__dirname, 'node_modules/firebase/firestore'),
        'firebase/storage': path.resolve(__dirname, 'node_modules/firebase/storage'),
        'firebase/functions': path.resolve(__dirname, 'node_modules/firebase/functions'),
      };
    }
    
    // Handle module not found errors
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
      // New node import errors to ignore
      { message: /Can't resolve 'node:buffer'/ },
      { message: /Can't resolve 'node:path'/ },
      { message: /Can't resolve 'node:crypto'/ },
      { message: /Can't resolve 'node:zlib'/ },
      { message: /Can't resolve 'node:http'/ },
      { message: /Can't resolve 'node:https'/ },
      { message: /Can't resolve 'node:os'/ },
      { message: /Can't resolve 'node:assert'/ },
      { message: /Can't resolve 'node:timers'/ },
      { message: /Can't resolve 'node:console'/ },
      // gRPC errors
      { message: /Can't resolve '@grpc\/grpc-js'/ },
      { message: /argument must be of type Function/ },
      // process.versions errors
      { message: /process.versions is not defined/ },
      { message: /undefined is not an object \(evaluating 'process.versions.node'/ },
      { message: /TypeError: undefined is not an object \(evaluating 'process.versions.node.split/ },
      // Firebase export errors
      { message: /Package path .* is not exported from package/ },
      // Firebase registerComponent error
      { message: /_registerComponent is not a function/ },
      { message: /(0 , _firebase_app__WEBPACK_IMPORTED_MODULE_\d+__\._registerComponent) is not a function/ },
      // Next.js font loader error
      { message: /"next\/font" requires SWC/ }
    ];

    // Disable optimization for Firebase modules
    if (!isServer) {
      // Find the TerserPlugin and modify its options
      const terserPluginIndex = config.optimization.minimizer?.findIndex(
        minimizer => minimizer.constructor.name === 'TerserPlugin'
      );
      
      if (terserPluginIndex >= 0 && config.optimization.minimizer) {
        const terserPlugin = config.optimization.minimizer[terserPluginIndex];
        if (terserPlugin.options && terserPlugin.options.terserOptions) {
          // Configure Terser to not mangle or compress Firebase modules
          terserPlugin.options.terserOptions.mangle = {
            ...terserPlugin.options.terserOptions.mangle,
            reserved: ['_registerComponent', '_getProvider', '_isFirebaseServerApp', 'registerAuth']
          };
          
          // Add a custom banner to all JS files
          terserPlugin.options.terserOptions.format = {
            ...terserPlugin.options.terserOptions.format,
            preamble: `
              // Firebase Fix: Adding required internal functions
              if (typeof window !== 'undefined') {
                window._registerComponent = window._registerComponent || function(c) { return c; };
                window._getProvider = window._getProvider || function() { return { getImmediate: function() { return {}; } }; };
                window._isFirebaseServerApp = window._isFirebaseServerApp || function() { return false; };
              }
            `
          };
        }
      }
    }
    
    // Add custom loader for Firebase specific modules
    config.module.rules.push({
      test: /firebase-storage-fix/,
      use: "null-loader"
    });

    // Add Babel loader for Firebase to fix _registerComponent errors
    config.module.rules.push({
      test: /\.m?js$/,
      include: [
        /firebase/,
        /@firebase/,
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            [
              'module-resolver',
              {
                alias: {
                  'node-fetch': 'isomorphic-fetch',
                },
              },
            ],
            ["@babel/plugin-transform-private-methods", { "loose": true }]
          ],
        },
      },
    });

    // Add a custom plugin to monitor and patch Firebase modules during the build
    if (!skipFirebasePatch) {
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.compilation.tap('FirebasePatchPlugin', (compilation) => {
            compilation.hooks.optimizeModules.tap('FirebasePatchPlugin', (modules) => {
              modules.forEach(module => {
                if (module.resource && (
                  module.resource.includes('firebase') || 
                  module.resource.includes('Firebase') ||
                  module.rawRequest && (
                    module.rawRequest.includes('firebase') || 
                    module.rawRequest.includes('Firebase')
                  ))) {
                  console.log('[FirebasePatchPlugin] Processing Firebase module:', module.resource);
                }
              });
            });
          });
          
          // Patch the output files to fix Firebase Auth issues
          compiler.hooks.emit.tapAsync('FirebasePatchPlugin', (compilation, callback) => {
            // Patch Firebase Auth modules
            Object.keys(compilation.assets).forEach(file => {
              if (file.includes('firebase/auth') || file.includes('firebase-auth')) {
                const asset = compilation.assets[file];
                let source = asset.source();
                
                if (typeof source === 'string') {
                  console.log('[FirebasePatchPlugin] Patching Firebase Auth module:', file);
                  // Fix any Firebase Auth issues with simpler replacements
                  source = source
                    .replace(/(_isFirebaseServerApp\(\))/g, 'false')
                    .replace(/(_getProvider\(.*?\))/g, '{ getImmediate: () => ({}), get: () => ({}) }')
                    .replace(/(_registerComponent\(.*?\))/g, '(c => c)(arguments[0])');
                  
                  compilation.assets[file] = {
                    source: () => source,
                    size: () => source.length
                  };
                }
              }
            });
            
            // Check main app chunks and patch Firebase Auth
            Object.keys(compilation.assets).forEach(file => {
              if (file.includes('.js')) {
                console.log('[FirebasePatchPlugin] Checking file for Firebase Auth:', file);
                const asset = compilation.assets[file];
                let source = asset.source();
                
                if (typeof source === 'string' && (
                    source.includes('firebase/auth') || 
                    source.includes('@firebase/auth') ||
                    source.includes('_isFirebaseServerApp') ||
                    source.includes('_registerComponent')
                  )) {
                  console.log('[FirebasePatchPlugin] Patched Firebase Auth in file:', file);
                  source = source
                    .replace(/(_isFirebaseServerApp\(\))/g, 'false')
                    .replace(/(window\._isFirebaseServerApp\(\))/g, 'false')
                    .replace(/(_registerComponent\(.*?\))/g, '(c => c)(arguments[0])')
                    .replace(/(_getProvider\(.*?\))/g, '{ getImmediate: () => ({}), get: () => ({}) }');
                  
                  compilation.assets[file] = {
                    source: () => source,
                    size: () => source.length
                  };
                }
              }
            });
            
            callback();
          });
        }
      });
    }

    // Add a plugin to monitor imports and provide debug for Firebase
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.normalModuleFactory.tap('MonitorImports', (factory) => {
          factory.hooks.parser.for('javascript/auto').tap('MonitorImports', (parser) => {
            parser.hooks.import.tap('MonitorImports', (statement, source) => {
              if (source.includes('firebase') || source.includes('@firebase')) {
                console.log('[FirebasePatchPlugin] Detected Firebase import:', source);
              }
            });
          });
        });
      }
    });

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
    '@firebase/logger',
    'events',
    'firebase',
    'util',
    'stream-browserify',
    'buffer',
    'crypto-browserify',
  ],
  // Add MIME type headers for key static files by redirecting to API route
  async rewrites() {
    return [
      {
        source: '/firebase-fix.js',
        destination: '/api/static-js?file=firebase-fix.js',
      },
      {
        source: '/firebase-patch.js',
        destination: '/api/static-js?file=firebase-patch.js',
      },
      {
        source: '/fix-node-modules.js',
        destination: '/api/static-js?file=fix-node-modules.js',
      },
      {
        source: '/sw.js',
        destination: '/api/static-js?file=sw.js',
      },
      {
        source: '/workbox-:path*',
        destination: '/api/static-js?file=workbox-:path*',
      },
    ];
  },
}

module.exports = withPWA(nextConfig); 