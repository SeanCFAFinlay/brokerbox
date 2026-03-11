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

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true, // TODO: fix no-explicit-any and other lint, then set to false
  },
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default withPWA(nextConfig);
