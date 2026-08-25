import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // The verification harness reads the build manifest; keep output deterministic.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
