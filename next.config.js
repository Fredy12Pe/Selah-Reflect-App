/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

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
        async_hooks: false, // Explicitly set async_hooks to false for client-side
      };

      // Force resolving Firebase dependencies for client builds
      config.resolve.alias = {
        ...config.resolve.alias,
        '@firebase/app': require.resolve('@firebase/app'),
        '@firebase/auth': require.resolve('@firebase/auth'),
        '@firebase/firestore': require.resolve('@firebase/firestore'),
        '@firebase/storage': require.resolve('@firebase/storage'),
      };
    }

    // Handle module not found errors with Firebase
    config.ignoreWarnings = [
      { module: /firebase/ },
      { file: /firebase/ },
      { module: /undici/ },
      { file: /undici/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /Can't resolve 'async_hooks'/ },
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