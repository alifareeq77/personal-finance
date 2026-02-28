/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Smaller client bundles: optimize barrel imports and enable compression
  experimental: {
    serverActions: { bodySizeLimit: '64kb' },
    optimizePackageImports: ['react', 'react-dom'],
  },
  // Compress output (gzip) for smaller transfer
  compress: true,
  // Generate smaller production build
  swcMinify: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
