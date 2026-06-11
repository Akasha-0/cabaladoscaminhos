// Config canônico do app. Conteúdo unificado a partir dos antigos
// skeletons (.js + .mjs) e next.config.ts — Next.js 16 prioriza .js,
// então mantemos aqui a config completa para que git checkout/restore
// não recrie o crash de ESM/CommonJS.
const nextConfig = {
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
    optimizePackageImports: ["lucide-react"],
  },
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "pg",
    "pg-pool",
    "pg-connection-string",
  ],
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
