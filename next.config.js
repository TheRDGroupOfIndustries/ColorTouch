/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pure Turbopack configuration
  turbopack: {},
  
  // Headers for API caching
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;