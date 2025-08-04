import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Environment variables that should be available at build time
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
  
  // Disable telemetry for faster builds
  telemetry: false,
  
  // Handle native modules in serverless environment
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3']
  }
};

export default nextConfig;
