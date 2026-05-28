import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin, strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Content-Security-Policy", value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.openai.com https://*.supabase.co https://*.stripe.com",
    "frame-ancestors 'none'",
  ].join("; ") },
];

const staticAssetHeaders = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const publicAssetHeaders = [
  { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  compress: true,
  poweredByHeader: false,
  
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/(.*)",
        headers: staticAssetHeaders,
      },
      {
        source: "/public/(.*)",
        headers: publicAssetHeaders,
      },
    ];
  },

  async rewrites() {
    return [];
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "clsx", "tailwind-merge"],
  },

  // Turbopack configuration for Next.js 16
  turbopack: {
    // Empty config to explicitly enable Turbopack
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    formats: ["image/avif", "image/webp"],
  },

  logging: {
    fetches: { fullUrl: true },
  },

  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
