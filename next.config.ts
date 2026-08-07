import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: {
    // El script build ejecuta `pnpm typecheck` antes de compilar.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
