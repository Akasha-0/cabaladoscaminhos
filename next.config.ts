import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// ============================================================================
// @next/bundle-analyzer — gated behind ANALYZE env var
// ============================================================================
// Run: `pnpm analyze:bundle` → opens .next/analyze/{client,server,edge}.html
// CI: see `docs/PERF-BUNDLE-ANALYSIS.md` for the workflow.
// ============================================================================
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false, // CI-friendly; opt-in local open via ANALYZE_OPEN=1
  analyzerMode: "static",
  defaultSizes: "gzip",
} as Parameters<typeof bundleAnalyzer>[0]);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    optimizePackageImports: ["jspdf", "lucide-react"],
  },
  staticPageGenerationTimeout: 120,
};

export default withBundleAnalyzer(nextConfig);