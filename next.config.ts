import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.mindos.com',
      },
      {
        protocol: 'https',
        hostname: '*.mindos.com',
      },
    ],
  },
};

export default nextConfig;
