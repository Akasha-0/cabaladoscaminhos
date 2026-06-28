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
  reportFilename: "../analyze/[type].html",
  defaultSizes: "gzip",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    // Wave 27 perf — priorizar AVIF (50-70% menor que WebP/JPEG).
    // Next.js detecta suporte do browser e faz fallback automatico.
    formats: ["image/avif", "image/webp"],
    // Device sizes default já cobre mobile-first. Custom para grids Akasha.
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL (Vercel Edge cache) — 60s reduz origin hits
    // em hot reload / revalidation.
    minimumCacheTTL: 60,
  },
  experimental: {
    // Wave 27 perf — adicionado clsx, tailwind-merge, class-variance-authority.
    // Essas libs são re-exportadas via @/lib/utils (cn helper) mas o Next 16
    // tree-shake agressivo via optimizePackageImports reduz ainda mais.
    optimizePackageImports: [
      "lucide-react",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
    ],
    // next.config.ts modularização + tree-shaking de server components.
    optimizeServerReact: true,
  },
  staticPageGenerationTimeout: 120,
  // Production source maps = off (perf + bundle size). Onde debugar: usar
  // source maps do Sentry (sentry-cli sourcemaps upload) sem expor no client.
  productionBrowserSourceMaps: false,
};

export default withBundleAnalyzer(nextConfig);