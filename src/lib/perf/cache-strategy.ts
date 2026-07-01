// ============================================================================
// perf/cache-strategy — Edge + browser caching strategy (Wave 36)
// ============================================================================
// Centralized cache decision tree. Every API route, static asset, and
// service-worker pass should consult this module to pick a Cache-Control
// header instead of hand-rolling strings. The result is auditable, the
// presets are testable, and the strategy is portable across Vercel /
// Cloudflare / Fastly.
//
// Layers:
//   1. Static assets  — cache-first + immutable (file hashing).
//   2. CDN edge       — stale-while-revalidate with TTL per route class.
//   3. Browser        — max-age only for non-personalized GETs.
//   4. User-specific  — no-cache, never store in shared cache.
//   5. Service worker — offline-first with bg sync queue.
//
// Reference: docs/PERFORMANCE-PHASE-2-W36.md §5 (caching strategy).
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CacheClass =
  | "static-immutable"   // fingerprinted assets, /_next/static/*
  | "static-1y"          // long-lived: manifest.json, favicon, og images
  | "edge-swr-5m"        // public, shareable, can go stale: list endpoints
  | "edge-swr-1h"        // public, slow-changing: featured, sacred calendar
  | "edge-swr-1d"        // public, near-static: blog, library index
  | "private-no-cache"   // user dashboard, profile, settings
  | "private-no-store";  // auth tokens, mutations, real-time

export interface CacheControl {
  visibility: "public" | "private";
  maxAge: number;            // browser cache (seconds)
  sMaxAge: number;           // shared/CDN cache (seconds)
  staleWhileRevalidate: number; // serve stale while refreshing (seconds)
  immutable: boolean;
  noStore: boolean;
  mustRevalidate: boolean;
  header: string;            // pre-rendered header value
}

export interface ServiceWorkerRule {
  pattern: RegExp;
  strategy: "cache-first" | "network-first" | "stale-while-revalidate" | "network-only" | "cache-only";
  /** Time-to-live for cached responses, in seconds. */
  maxAgeSeconds: number;
  /** Max entries in the cache before LRU eviction kicks in. */
  maxEntries?: number;
}

// ---------------------------------------------------------------------------
// Preset catalog
// ---------------------------------------------------------------------------

const PRESETS: Record<CacheClass, Omit<CacheControl, "header">> = {
  "static-immutable": {
    visibility: "public",
    maxAge: 31_536_000, // 1y
    sMaxAge: 31_536_000,
    staleWhileRevalidate: 31_536_000,
    immutable: true,
    noStore: false,
    mustRevalidate: false,
  },
  "static-1y": {
    visibility: "public",
    maxAge: 86_400, // 1d browser
    sMaxAge: 31_536_000, // 1y CDN
    staleWhileRevalidate: 31_536_000,
    immutable: false,
    noStore: false,
    mustRevalidate: false,
  },
  "edge-swr-5m": {
    visibility: "public",
    maxAge: 60, // 1m browser
    sMaxAge: 300, // 5m CDN
    staleWhileRevalidate: 1800, // 30m
    immutable: false,
    noStore: false,
    mustRevalidate: false,
  },
  "edge-swr-1h": {
    visibility: "public",
    maxAge: 300, // 5m browser
    sMaxAge: 3600, // 1h CDN
    staleWhileRevalidate: 86_400, // 24h
    immutable: false,
    noStore: false,
    mustRevalidate: false,
  },
  "edge-swr-1d": {
    visibility: "public",
    maxAge: 3600, // 1h browser
    sMaxAge: 86_400, // 1d CDN
    staleWhileRevalidate: 604_800, // 7d
    immutable: false,
    noStore: false,
    mustRevalidate: false,
  },
  "private-no-cache": {
    visibility: "private",
    maxAge: 0,
    sMaxAge: 0,
    staleWhileRevalidate: 0,
    immutable: false,
    noStore: false,
    mustRevalidate: true,
  },
  "private-no-store": {
    visibility: "private",
    maxAge: 0,
    sMaxAge: 0,
    staleWhileRevalidate: 0,
    immutable: false,
    noStore: true,
    mustRevalidate: false,
  },
};

// ---------------------------------------------------------------------------
// Header builder
// ---------------------------------------------------------------------------

/**
 * Build a Cache-Control header for the given class. Pure function — same
 * input always produces byte-identical output. Safe to memoize.
 */
export function buildCacheControl(klass: CacheClass): CacheControl {
  const p = PRESETS[klass];
  const parts: string[] = [p.visibility];

  if (p.noStore) {
    parts.push("no-store");
  } else {
    parts.push(`max-age=${p.maxAge}`);
    if (p.sMaxAge > 0) parts.push(`s-maxage=${p.sMaxAge}`);
    if (p.staleWhileRevalidate > 0) parts.push(`stale-while-revalidate=${p.staleWhileRevalidate}`);
    if (p.immutable) parts.push("immutable");
    if (p.mustRevalidate) parts.push("must-revalidate");
  }

  return { ...p, header: parts.join(", ") };
}

/**
 * Apply cache headers to a NextResponse. Use this in API route handlers.
 *
 * @example
 *   return applyCache(NextResponse.json(data), "edge-swr-5m");
 */
export function applyCache<T extends { headers: Headers }>(response: T, klass: CacheClass): T {
  const cc = buildCacheControl(klass);
  response.headers.set("Cache-Control", cc.header);
  // Hint Vercel / Cloudflare to vary on auth + accept for split caching.
  if (klass.startsWith("edge-")) {
    response.headers.set("Vary", "Accept-Encoding, Accept-Language");
  } else if (klass.startsWith("private-")) {
    response.headers.set("Vary", "Cookie, Authorization");
  }
  return response;
}

// ---------------------------------------------------------------------------
// Strategy picker — classify a request path into a CacheClass
// ---------------------------------------------------------------------------

const RULES: Array<{ test: (path: string, method: string) => boolean; klass: CacheClass }> = [
  // Static fingerprinted assets — always immutable 1y.
  { test: (p) => p.startsWith("/_next/static/") || p.startsWith("/icons/"), klass: "static-immutable" },
  // Service worker + manifest — long-lived CDN, short browser.
  { test: (p) => p === "/manifest.json" || p === "/sw.js" || p === "/browserconfig.xml", klass: "static-1y" },
  // Open Graph + favicon + robots — long-lived CDN.
  { test: (p) => p === "/og-default.svg" || p === "/favicon.ico" || p === "/robots.txt" || p === "/sitemap.xml", klass: "static-1y" },
  // Public read-only APIs.
  { test: (p, m) => m === "GET" && p.startsWith("/api/public/"), klass: "edge-swr-1d" },
  { test: (p, m) => m === "GET" && p.startsWith("/api/articles"), klass: "edge-swr-1h" },
  { test: (p, m) => m === "GET" && p.startsWith("/api/calendar"), klass: "edge-swr-1h" },
  { test: (p, m) => m === "GET" && p.startsWith("/api/feed"), klass: "edge-swr-5m" },
  { test: (p, m) => m === "GET" && p.startsWith("/api/search"), klass: "edge-swr-5m" },
  { test: (p, m) => m === "GET" && p.startsWith("/api/notifications/templates"), klass: "edge-swr-1d" },
  // User-specific dashboards + auth.
  { test: (p, m) => m === "GET" && p.startsWith("/api/users/"), klass: "private-no-cache" },
  { test: (p, m) => m === "GET" && p.startsWith("/api/admin/"), klass: "private-no-cache" },
  // Mutations + auth endpoints — never cache.
  { test: (p, m) => m !== "GET" || p.startsWith("/api/auth") || p.startsWith("/api/payments/webhook"), klass: "private-no-store" },
];

/**
 * Classify a request path + method into a cache class. The result is the
 * single source of truth for every API route's Cache-Control header.
 */
export function classifyRequest(path: string, method: string): CacheClass {
  for (const rule of RULES) {
    if (rule.test(path, method.toUpperCase())) return rule.klass;
  }
  return "private-no-store"; // safe default
}

// ---------------------------------------------------------------------------
// Service worker rules
// ---------------------------------------------------------------------------

export const SERVICE_WORKER_RULES: ServiceWorkerRule[] = [
  // App shell — cache-first so the app boots offline.
  { pattern: /^\/$|^\/(feed|oraculo|biblioteca|comunidade|explore)$/, strategy: "stale-while-revalidate", maxAgeSeconds: 86_400, maxEntries: 20 },
  // Static assets — cache-first immutable.
  { pattern: /\/_next\/static\//, strategy: "cache-first", maxAgeSeconds: 31_536_000, maxEntries: 200 },
  // Images — cache-first with LRU.
  { pattern: /\.(png|jpg|jpeg|webp|avif|svg)$/, strategy: "cache-first", maxAgeSeconds: 86_400, maxEntries: 100 },
  // GET API — stale-while-revalidate.
  { pattern: /^\/api\//, strategy: "network-first", maxAgeSeconds: 300, maxEntries: 50 },
  // POST/PUT/DELETE — network only, queue for bg sync.
  { pattern: /.*/, strategy: "network-only", maxAgeSeconds: 0 },
];

/**
 * Pick a service-worker strategy for a given URL. The first matching
 * pattern wins; the trailing `network-only` rule is a safety net.
 */
export function pickServiceWorkerRule(url: string): ServiceWorkerRule {
  for (const rule of SERVICE_WORKER_RULES) {
    if (rule.pattern.test(url)) return rule;
  }
  return { pattern: /.*/, strategy: "network-only", maxAgeSeconds: 0 };
}

// ---------------------------------------------------------------------------
// CDN configuration hints
// ---------------------------------------------------------------------------

export interface CdnConfig {
  provider: "vercel" | "cloudflare" | "fastly" | "other";
  /** Vercel/Cloudflare edge regions to prefer. */
  regions: string[];
  /** `Cache-Control` value applied at the CDN layer. */
  edgeCacheControl: string;
  /** Surrogate-Control (CDN-only) — overrides browser cache for Vercel/Cloudflare. */
  surrogateControl: string;
  /** Whether to bypass the cache for authenticated requests. */
  bypassOnCookie: string[];
}

export const VERCEL_CDN_CONFIG: CdnConfig = {
  provider: "vercel",
  regions: ["gru1", "iad1"], // São Paulo + Virginia (primary user base)
  edgeCacheControl: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  surrogateControl: "max-age=3600",
  bypassOnCookie: ["session", "auth-token", "sb-access-token"],
};

export const CLOUDFLARE_CDN_CONFIG: CdnConfig = {
  provider: "cloudflare",
  regions: ["GRU", "IAD"],
  edgeCacheControl: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  surrogateControl: "max-age=3600",
  bypassOnCookie: ["session", "auth-token", "sb-access-token"],
};

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const CACHE_PRESET_NAMES: CacheClass[] = Object.keys(PRESETS) as CacheClass[];
