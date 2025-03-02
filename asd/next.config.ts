import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://prod-team-12-lc5mhpv9.final.prodcontest.ru:8080/:path*',
      },
    ];
  },
};

export default nextConfig;
