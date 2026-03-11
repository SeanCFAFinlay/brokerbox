import type { NextConfig } from "next";
import path from "path";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline.html",
  },
});

const monorepoRoot = path.join(process.cwd(), "../..");
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true, // TODO: fix no-explicit-any and other lint, then set to false
  },
  outputFileTracingRoot: monorepoRoot,
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Include Prisma generated client (and engine binary) in serverless trace (monorepo)
  outputFileTracingIncludes: {
    "/**": ["../../packages/database/src/generated/client/**"],
  },
};

export default withPWA(nextConfig);
