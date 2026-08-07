import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { workerThreads: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
