import type { NextConfig } from "next"; 

const nextConfig: NextConfig = {
  // Enable static export for Electron production builds
  // Comment this out if you need SSR features in web deployment
  output: process.env.ELECTRON_BUILD === 'true' ? 'export' : undefined,
  
  // Disable image optimization for static export
  images: {
    unoptimized: process.env.ELECTRON_BUILD === 'true' ? true : false,
  },
};

export default nextConfig;


