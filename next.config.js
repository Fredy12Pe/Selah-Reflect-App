/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'www.google.com', 'source.unsplash.com'],
  },
  // Ensure proper handling of client-side navigation
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  transpilePackages: ['undici'],
}

module.exports = nextConfig 