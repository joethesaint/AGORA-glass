import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Turbopack configuration for the workspace
  turbopack: {
    // Sets the root to the parent directory (workspace root) to resolve multiple lockfiles
    root: path.join(process.cwd(), ".."),
  },
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
