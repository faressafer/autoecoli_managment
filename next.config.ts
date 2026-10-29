import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Static export: Firebase Hosting serves the generated `out/` folder.
  output: 'export',
  images: {
    // next/image optimization needs a server, so it is disabled for static export.
    unoptimized: true,
  },
};

export default nextConfig;
