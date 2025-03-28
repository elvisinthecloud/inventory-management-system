import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'dist',
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: [],
  },
  reactStrictMode: true,
};

export default nextConfig; 