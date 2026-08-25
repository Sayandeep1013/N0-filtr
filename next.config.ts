import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // The verification harness reads the build manifest; keep output deterministic.
  productionBrowserSourceMaps: false,

  // verify:visual screenshots the dev server. The dev tools indicator paints a
  // floating badge over the bottom-left corner of every capture, which at 390
  // lands on top of real content. Off, so the contact sheet shows the page.
  devIndicators: false,
};

export default nextConfig;
