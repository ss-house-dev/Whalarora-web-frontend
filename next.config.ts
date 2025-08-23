import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/trade/:path*",
        destination: "http://141.11.156.52:3002/trade/:path*",
      },
      {
        source: "/auth/:path*",
        destination: "http://141.11.156.52:3001/auth/:path*",
      },
    ];
  },
};

export default nextConfig;