import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Optimize bundle size by ensuring heavy libraries are handled correctly
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion', 
      'recharts', 
      'ethers', 
      'viem'
    ],
  },
  // If the 'file:..' dependency is causing issues with scanning large directories,
  // we can try to exclude certain paths from being watched or processed if supported.
};

export default nextConfig;
