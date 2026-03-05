import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required feature flag for 'use cache' directive in Next.js 16
  cacheComponents: true,
};

export default nextConfig;
