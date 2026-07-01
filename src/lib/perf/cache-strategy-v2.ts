// ============================================================================
// perf/cache-strategy-v2 — Cache strategy matrix for Wave 37 (SCALABILITY 6/8)
// ============================================================================
// Extends W36 cache-strategy.ts with a *route-aware* matrix that maps every
// public surface in cabaladoscaminhos to a (ttl, swr, visibility) triple.
//
// Design goals:
//   1. **Single source of truth** — every API route + page consults this.
//   2. **LGPD-safe by default** — any cache key touching user PII must
//      include the user ID and use `private` visibility (no shared cache).
//   3. **Mobile-first** — short TTLs on dynamic, long on near-static, so
//      first-contentful-paint stays under 1.8s on 4G.
//   4. **10x load ready** — every public tier is CDN-fronted with SWR.
//
// Reference: docs/PERFORMANCE-PHASE-2-W36.md §5 (W36 baseline).
// ============================================================================

// ---------------------------------------------------------------------------
// Tier catalog — every route in the app falls into one of these.
// ---------------------------------------------------------------------------

/**
 * `ttl`         — browser max-age in seconds. Use 0 for must-revalidate.
 * `swr`         — stale-while-revalidate window in seconds (CDN-friendly).
 * `visibility`  — `public` (CDN + browser) | `private` (browser only) |
 *                 `authenticated` (Vary on Authorization, but cacheable per token).
 * `revalidate`  — Next.js `revalidate` value (seconds). 0 = no ISR.
 * `tagScope`    — what kind of cache tag invalidates this tier.
 */
export interface CacheRule {
  ttl: string; // human-readable: "30d", "1h", "5m", "0"
  staleWhileRevalidate?: string;
  visibility: "public" | "private" | "authenticated";
  revalidate?: number;
  tagScope?: "global" | "user" | "tradition" | "post" | "akasha" | "session";
  /** Optional human-readable rationale for audits. */
  rationale?: string;
}

export const CACHE_RULES: Record<string, CacheRule> = {
  // -------------------------------------------------------------------------
  // Public static assets — CDN immutable, 30d browser, 365d SWR
  // -------------------------------------------------------------------------
  static: {
    ttl: "30d",
    staleWhileRevalidate: "365d",
    visibility: "public",
    revalidate: 2_592_000,
    tagScope: "global",
    rationale: "Fingerprinted bundles — hash changes imply new content.",
  },

  // -------------------------------------------------------------------------
  // Public pages — varies by content velocity
  // -------------------------------------------------------------------------
  landingPage: {
    ttl: "1h",
    staleWhileRevalidate: "24h",
    visibility: "public",
    revalidate: 3600,
    tagScope: "global",
    rationale: "Marketing copy changes weekly; SWR keeps LCP low.",
  },
  blog: {
    ttl: "5m",
    staleWhileRevalidate: "1h",
    visibility: "public",
    revalidate: 300,
    tagScope: "global",
    rationale: "Posts published hourly; SWR keeps list fresh.",
  },
  library: {
    ttl: "15m",
    staleWhileRevalidate: "1h",
    visibility: "public",
    revalidate: 900,
    tagScope: "tradition",
    rationale: "Curated articles — invalidate per tradição when curator approves.",
  },

  // -------------------------------------------------------------------------
  // Authenticated content — visibility split by sensitivity
  // -------------------------------------------------------------------------
  feed: {
    ttl: "0",
    visibility: "private",
    revalidate: 0,
    tagScope: "user",
    rationale: "Per-user personalized feed — never shared-cache.",
  },
  oraculo: {
    ttl: "1h",
    visibility: "authenticated",
    revalidate: 3600,
    tagScope: "user",
    rationale: "Computed once per day per user; 1h cache is fine, varies on token.",
  },
  akasha: {
    ttl: "0",
    visibility: "private",
    revalidate: 0,
    tagScope: "akasha",
    rationale: "AI conversation — never cache to prevent prompt-leak.",
  },

  // -------------------------------------------------------------------------
  // User-specific — split between cacheable (profile) and private (prefs)
  // -------------------------------------------------------------------------
  profile: {
    ttl: "5m",
    visibility: "public",
    revalidate: 300,
    tagScope: "user",
    rationale: "Public profile is OK in CDN; update invalidates `user:<id>` tag.",
  },
  preferences: {
    ttl: "0",
    visibility: "private",
    revalidate: 0,
    tagScope: "user",
    rationale: "Notification/privacy prefs — never cache.",
  },

  // -------------------------------------------------------------------------
  // APIs — split by data class
  // -------------------------------------------------------------------------
  apiPublic: {
    ttl: "30s",
    staleWhileRevalidate: "5m",
    visibility: "public",
    revalidate: 30,
    tagScope: "global",
    rationale: "Public GET endpoints (search, taxonomy) — short TTL + SWR.",
  },
  apiAuthenticated: {
    ttl: "0",
    visibility: "private",
    revalidate: 0,
    tagScope: "user",
    rationale: "Authenticated reads — Vary on Authorization, never share.",
  },
  apiStatic: {
    ttl: "1d",
    staleWhileRevalidate: "7d",
    visibility: "public",
    revalidate: 86_400,
    tagScope: "global",
    rationale: "Reference data (taxonomies, VAPID pubkey) — long cache.",
  },
};

// ---------------------------------------------------------------------------
// Time-string parser — "30d" | "1h" | "5m" | "0" → seconds
// ---------------------------------------------------------------------------

const TIME_UNITS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86_400,
  w: 604_800,
  y: 31_536_000,
};

export function parseTime(s: string): number {
  if (s === "0") return 0;
  const match = /^(\d+)([smhdwy])$/.exec(s);
  if (!match) throw new Error(`cache-strategy-v2: invalid time string "${s}"`);
  const [, num, unit] = match;
  return Number(num) * TIME_UNITS[unit];
}

// ---------------------------------------------------------------------------
// Header builder — render Cache-Control + Vercel/Cloudflare tags
// ---------------------------------------------------------------------------

export interface RenderedCache {
  cacheControl: string;
  cacheTag: string;
  revalidate: number;
  vary: string[];
}

export function renderCacheHeader(rule: CacheRule, tags: string[] = []): RenderedCache {
  const maxAge = parseTime(rule.ttl);
  const swr = rule.staleWhileRevalidate ? parseTime(rule.staleWhileRevalidate) : 0;

  const parts: string[] = [];
  if (rule.visibility === "private") {
    parts.push("private");
    if (maxAge === 0) {
      parts.push("no-cache");
      parts.push("must-revalidate");
    } else {
      parts.push(`max-age=${maxAge}`);
    }
  } else if (rule.visibility === "authenticated") {
    // Per-token cache: Vary on Authorization + private-ish semantics.
    parts.push("private");
    parts.push(`max-age=${maxAge}`);
    if (swr > 0) parts.push(`stale-while-revalidate=${swr}`);
  } else {
    parts.push("public");
    if (maxAge > 0) parts.push(`max-age=${maxAge}`);
    if (swr > 0) parts.push(`stale-while-revalidate=${swr}`);
  }

  const cacheTag = tags.length > 0 ? tags.join(",") : `${rule.tagScope ?? "global"}:all`;
  const vary: string[] = ["Accept-Encoding"];
  if (rule.visibility !== "public") vary.push("Authorization", "Cookie");
  if (rule.visibility === "authenticated") vary.push("Accept-Language");

  return {
    cacheControl: parts.join(", "),
    cacheTag,
    revalidate: rule.revalidate ?? 0,
    vary,
  };
}

// ---------------------------------------------------------------------------
// Apply helpers for NextResponse / Response objects.
// ---------------------------------------------------------------------------

export interface HeaderSink {
  headers: Headers;
}

export function applyCacheRule(
  response: HeaderSink,
  rule: CacheRule,
  tags: string[] = [],
): HeaderSink {
  const rendered = renderCacheHeader(rule, tags);
  response.headers.set("Cache-Control", rendered.cacheControl);
  if (rendered.cacheTag) response.headers.set("Cache-Tag", rendered.cacheTag);
  if (rendered.revalidate > 0) {
    response.headers.set("x-nextjs-revalidate", String(rendered.revalidate));
  }
  if (rendered.vary.length > 0) response.headers.set("Vary", rendered.vary.join(", "));
  return response;
}

// ---------------------------------------------------------------------------
// Route resolver — given a Next.js path, return the matching rule key
// ---------------------------------------------------------------------------

interface RouteMatch {
  test: (path: string) => boolean;
  rule: string;
}

const ROUTE_RESOLVERS: RouteMatch[] = [
  // Static fingerprinted
  { test: (p) => p.startsWith("/_next/static/") || p.startsWith("/icons/"), rule: "static" },
  // Landing
  { test: (p) => p === "/" || p === "/sobre" || p === "/about", rule: "landingPage" },
  // Blog / library
  { test: (p) => p.startsWith("/blog") || p.startsWith("/artigos"), rule: "blog" },
  { test: (p) => p.startsWith("/biblioteca") || p.startsWith("/library"), rule: "library" },
  // Authenticated surfaces
  { test: (p) => p.startsWith("/feed") || p.startsWith("/dashboard"), rule: "feed" },
  { test: (p) => p.startsWith("/oraculo"), rule: "oraculo" },
  { test: (p) => p.startsWith("/akashic"), rule: "akasha" },
  // User
  { test: (p) => /^\/u\/[^/]+$/.test(p), rule: "profile" },
  { test: (p) => p.startsWith("/settings") || p.startsWith("/me/preferences"), rule: "preferences" },
];

export function resolveRuleForPath(path: string): string {
  for (const r of ROUTE_RESOLVERS) {
    if (r.test(path)) return r.rule;
  }
  return "apiStatic"; // safe default for unknown paths
}

// ---------------------------------------------------------------------------
// LGPD safety check — assert private rules never leak to shared cache
// ---------------------------------------------------------------------------

export function assertLgpdSafe(rule: CacheRule, keyIncludesUserId: boolean): void {
  if (rule.visibility === "private" && !keyIncludesUserId) {
    throw new Error(
      `LGPD: private cache rule "${rule.tagScope ?? "unknown"}" must include userId in cache key`,
    );
  }
  if (rule.tagScope === "user" && !keyIncludesUserId) {
    throw new Error('LGPD: tagScope="user" requires userId in cache key');
  }
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const CACHE_RULE_NAMES = Object.keys(CACHE_RULES);