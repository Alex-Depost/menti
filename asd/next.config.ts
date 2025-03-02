import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    MODE: process.env.MODE
  }
};

export default nextConfig;
