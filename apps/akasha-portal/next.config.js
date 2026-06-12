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
  /**
   * Standalone output — Required for Capacitor.
   * Creates a minimal Node.js server in .next/standalone
   * that can serve the app inside the Android WebView.
   */
  output: 'standalone',
};

export default nextConfig;
