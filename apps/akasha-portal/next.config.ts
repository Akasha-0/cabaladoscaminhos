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
    optimizePackageImports: ['jspdf', 'lucide-react'],
  },
  serverExternalPackages: ['@prisma/client', 'prisma', 'pg', 'pg-pool', 'pg-connection-string'],
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
