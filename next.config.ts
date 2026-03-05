import { withSentryConfig } from "@sentry/nextjs";
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

export default withSentryConfig(nextConfig, {
  org: "huddle-duck",
  project: "landing-page",
  sentryUrl: "https://de.sentry.io/",
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  silent: !process.env.CI,
});
