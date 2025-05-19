import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['example.com', 'market-assets.fra1.cdn.digitaloceanspaces.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  typescript: {
    // We'll handle type checking in CI or locally
    ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
  },
  eslint: {
    // We'll handle linting in CI or locally
    ignoreDuringBuilds: process.env.VERCEL_ENV === 'production',
  },
  // Add CORS header for loading 3D models
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
