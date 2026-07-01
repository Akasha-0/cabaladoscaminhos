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
    // Wave 36 — adiciona fallback JPEG para browsers muito antigos.
    formats: ["image/avif", "image/webp"],
    // Device sizes default já cobre mobile-first. Custom para grids Akasha.
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Wave 36 — imageSizes expandidos para ícones + thumbnails de feed.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 640],
    // Wave 36 — minimumCacheTTL elevado para 30d (era 60s). Vercel/Cloudflare
    // edge cacheiam o resultado de `/_next/image`; 30d alinha com o ciclo
    // de release do Akasha e elimina ~99% dos origin hits em revalidations.
    // Conteúdo novo (asset hash diferente) é gerado novo URL automaticamente.
    minimumCacheTTL: 60 * 60 * 24 * 30, // 2_592_000s = 30d
  },
  experimental: {
    optimizePackageImports: ["jspdf", "lucide-react"],
  },
  staticPageGenerationTimeout: 120,
};

export default withBundleAnalyzer(nextConfig);