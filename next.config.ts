import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Ensure SQLite databases work in production
  serverExternalPackages: ['better-sqlite3'],
  
  // Remove standalone output for Amplify compatibility
  
  // Environment variables that should be available at build time
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
  
  // Disable telemetry for faster builds
  telemetry: false,
};

export default nextConfig;
