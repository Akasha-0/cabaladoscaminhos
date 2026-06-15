import type { NextConfig } from "next";
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
    optimizePackageImports: ['lucide-react'],
  },
  transpilePackages: [
    "@akasha/core",
    "@akasha/types",
    "@akasha/core-astrology",
    "@akasha/core-cabala",
    "@akasha/core-odus",
    "@akasha/core-tantra",
    "@akasha/core-iching",
    "@akasha/mentor",
  ],
  serverExternalPackages: ['@prisma/client', 'prisma', 'pg', 'pg-pool', 'pg-connection-string'],
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
