import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

// =============================================================================
// Performance Budget + Bundle Analysis (Wave 12.4)
// =============================================================================
//
// Bundle analyzer: opt-in via `ANALYZE=true`. Emits an HTML report at
// `.next/analyze/client.html` (and `server.html` for the Node runtime). The
// wrapper is a no-op when Turbopack is the active bundler, so it is safe to
// leave wired up permanently. To run the analyzer under webpack:
//
//   ANALYZE=true pnpm build:analyze    # invokes `next build --webpack`
//   ANALYZE=true pnpm build            # for ad-hoc local inspection
//
// Note: `@next/bundle-analyzer` is webpack-only. In Next.js 16, Turbopack
// prints a warning ("Next Bundle Analyzer is not compatible with
// Turbopack builds") and the wrapper short-circuits. We intentionally keep
// the default production build on Turbopack for speed — the analyzer path
// is opt-in.
//
// Budgets: per-route "First Load JS" target = 250 KB. The threshold is
// enforced in CI by reading the build report (see
// `apps/akasha-portal/scripts/check-bundle-budget.mjs`), not by the
// removed `maxEntrypointSize` option, which Next.js 16 dropped from
// the public config surface (it was a webpack-only flag).
//
// `experimental.outputFileTracingExcludes` trims server-traced files we
// know are not needed at runtime (type definitions, source maps, dev-only
// fixtures) to shrink the deployment artifact and cold-start time.
// =============================================================================

const ANALYZE_ENABLED = process.env.ANALYZE === 'true';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: ANALYZE_ENABLED,
  openAnalyzer: false,
  analyzerMode: 'static',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Wave 12.4: trim traced files we do not ship to the runtime artifact.
  // - *.d.ts / *.map: type-only and source maps, not needed at runtime
  // - packages/*/{test,__tests__,__fixtures__}/**: unit-test fixtures
  //   that may be reached via barrel re-exports but are not used at runtime
  outputFileTracingExcludes: {
    '*': [
      '**/*.d.ts',
      '**/*.d.ts.map',
      '**/*.map',
      './packages/**/test/**',
      './packages/**/__tests__/**',
      './packages/**/__fixtures__/**',
    ],
  },
  transpilePackages: [
    '@akasha/core',
    '@akasha/types',
    '@akasha/core-astrology',
    '@akasha/core-cabala',
    '@akasha/core-odus',
    '@akasha/core-tantra',
    '@akasha/core-iching',
    '@akasha/mentor',
  ],
  serverExternalPackages: ['@prisma/client', 'prisma', 'pg', 'pg-pool', 'pg-connection-string'],
  staticPageGenerationTimeout: 120,
};

// =============================================================================
// Cache-Control for public auth routes (Wave 12.4)
// =============================================================================
// /login and /onboarding (the registration flow) must NEVER be cached:
// they are personalised surfaces that redirect logged-in users, and a
// cached 200 would break the "redirect if already authenticated" branch.
//
// The `no-store, no-cache, must-revalidate, private` quadruple is the
// belt-and-suspenders pattern recommended by MDN for any response that
// varies per-user or contains a Set-Cookie header. We pin it at the
// edge via the global `headers()` block so the rule is enforced even
// when a future contributor adds a new auth surface without remembering
// to re-declare the headers.
// =============================================================================
const NO_STORE_HEADERS = [
  { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
  { key: 'Pragma', value: 'no-cache' },
  { key: 'Expires', value: '0' },
];

const nextConfigWithHeaders: NextConfig = {
  ...nextConfig,
  async headers() {
    return [
      // Login surface
      { source: '/:locale(login)', headers: NO_STORE_HEADERS },
      // Onboarding (registration) surface — matches both the bare
      // /:locale/onboarding path and any future sub-paths.
      { source: '/:locale(onboarding)/:path*', headers: NO_STORE_HEADERS },
    ];
  },
};

// `withBundleAnalyzer` returns a NextConfig-shaped wrapper; the wrapper is
// a no-op when Turbopack is active or when `enabled: false`.
export default withBundleAnalyzer(nextConfigWithHeaders);
