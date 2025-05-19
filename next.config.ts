import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['example.com'], // Add actual image domains if needed
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
};

export default nextConfig;
