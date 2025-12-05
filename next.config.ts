import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable static optimization for pages that use Firebase auth
  // This prevents build-time errors when Firebase credentials aren't available
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
