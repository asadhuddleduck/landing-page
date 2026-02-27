import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "ai",
      "@ai-sdk/anthropic",
      "@ai-sdk/react",
      "zod",
      "resend",
    ],
  },
};

export default nextConfig;
