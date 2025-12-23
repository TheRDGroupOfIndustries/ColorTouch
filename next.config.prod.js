/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard server mode
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Disable telemetry in production
  productionBrowserSourceMaps: false,
  // Optimize for Electron
  compress: false,
  // Ensure static assets are included
  assetPrefix: process.env.ASSET_PREFIX || '',
};

module.exports = nextConfig;
