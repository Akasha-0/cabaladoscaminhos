// ============================================================================
// perf/cdn-strategy — Vercel Edge / Cloudflare CDN policy (Wave 37)
// ============================================================================
// Centralized CDN routing + cache-invalidation rules. Every public asset
// and HTML page goes through one of these policies. Mirrors the W37
// cache-strategy-v2.ts matrix but adds the CDN-layer specifics:
//
//   - Surrogate-Control (CDN-only TTL) vs Cache-Control (browser TTL)
//   - Cache-Tag headers for tag-based invalidation (per user / per tradição)
//   - Image variants (AVIF → WebP → JPEG fallback) via next/image
//   - Bypass-on-cookie list for authenticated pages
//
// Reference: docs/PERFORMANCE-PHASE-2-W36.md §6 (CDN config).
// ============================================================================

import { CACHE_RULES, renderCacheHeader, type CacheRule } from "./cache-strategy-v2";

// ---------------------------------------------------------------------------
// CDN provider presets
// ---------------------------------------------------------------------------

export type CdnProvider = "vercel" | "cloudflare" | "fastly" | "bunny";

export interface CdnPolicy {
  provider: CdnProvider;
  /** Edge regions preferred for first-paint (closer = faster). */
  regions: string[];
  /** Cookie names that force a cache bypass (authenticated). */
  bypassOnCookie: string[];
  /** Surrogate-Control (CDN-only) — overrides browser max-age for the CDN layer. */
  surrogateControl: string;
  /** Whether to honor the `Vary: Authorization` header for per-user caching. */
  varyOnAuth: boolean;
  /** Image transform defaults. */
  images: {
    formats: Array<"avif" | "webp" | "jpeg">;
    quality: number;
    minCacheTtl: number;
  };
}

export const VERCEL_CDN: CdnPolicy = {
  provider: "vercel",
  regions: ["gru1", "iad1"], // São Paulo + Virginia (BR + US primary base)
  bypassOnCookie: ["session", "auth-token", "sb-access-token", "sb-refresh-token"],
  surrogateControl: "max-age=3600",
  varyOnAuth: false,
  images: {
    formats: ["avif", "webp", "jpeg"],
    quality: 75,
    minCacheTtl: 2_592_000, // 30d (already set in next.config.ts)
  },
};

export const CLOUDFLARE_CDN: CdnPolicy = {
  provider: "cloudflare",
  regions: ["GRU", "IAD", "FRA"], // BR + US + EU
  bypassOnCookie: ["session", "auth-token", "sb-access-token"],
  surrogateControl: "max-age=3600",
  varyOnAuth: false,
  images: {
    formats: ["avif", "webp", "jpeg"],
    quality: 75,
    minCacheTtl: 2_592_000,
  },
};

// ---------------------------------------------------------------------------
// Surrogate key — Vercel/Cloudflare per-resource identity
// ---------------------------------------------------------------------------

/**
 * Build a Surrogate-Key for cache-tag invalidation. Pattern:
 *   `cdc:resource:<kind>:<scope>:<id>`
 *
 * @example
 *   buildSurrogateKey("post", "post:abc-123")
 *   // → "cdc:resource:post:abc-123 cdc:tradition:candomble"
 */
export function buildSurrogateKey(kind: string, scope: string, ...tags: string[]): string[] {
  return [`cdc:resource:${kind}:${scope}`, ...tags.map((t) => `cdc:${t}`)];
}

// ---------------------------------------------------------------------------
// Full response header pack — applies Cache-Control + Cache-Tag + Vary
// ---------------------------------------------------------------------------

export interface CdnHeaderPack {
  cacheControl: string;
  surrogateControl: string;
  surrogateKeys: string;
  cacheTag: string;
  vary: string;
}

export function buildCdnHeaders(
  rule: CacheRule,
  options: {
    surrogateKeys?: string[];
    provider?: CdnProvider;
  } = {},
): CdnHeaderPack {
  const rendered = renderCacheHeader(rule);
  const provider = options.provider ?? "vercel";
  const surrogateControl = provider === "cloudflare" ? "max-age=3600" : rule.ttl;
  const surrogateKeys = (options.surrogateKeys ?? []).join(" ");

  return {
    cacheControl: rendered.cacheControl,
    surrogateControl,
    surrogateKeys,
    cacheTag: rendered.cacheTag,
    vary: rendered.vary.join(", "),
  };
}

// ---------------------------------------------------------------------------
// Apply to a NextResponse
// ---------------------------------------------------------------------------

export interface HeaderSink {
  headers: Headers;
}

export function applyCdnHeaders(
  response: HeaderSink,
  rule: CacheRule,
  options: {
    surrogateKeys?: string[];
    provider?: CdnProvider;
  } = {},
): HeaderSink {
  const pack = buildCdnHeaders(rule, options);
  response.headers.set("Cache-Control", pack.cacheControl);
  if (pack.surrogateControl) response.headers.set("Surrogate-Control", pack.surrogateControl);
  if (pack.surrogateKeys) response.headers.set("Surrogate-Key", pack.surrogateKeys);
  if (pack.cacheTag) response.headers.set("Cache-Tag", pack.cacheTag);
  if (pack.vary) response.headers.set("Vary", pack.vary);
  return response;
}

// ---------------------------------------------------------------------------
// Cache invalidation helpers — used by mutation endpoints
// ---------------------------------------------------------------------------

export interface InvalidationRequest {
  /** Tags to purge across the CDN. */
  tags: string[];
  /** Provider-specific purge API. */
  provider: CdnProvider;
}

export async function invalidateCdn(req: InvalidationRequest): Promise<{ purged: number }> {
  // Vercel: POST /v1/edge-cache/purge with `{ tags }`
  // Cloudflare: Enterprise API zone purge by tag
  // We never embed the API token here — instead, defer to an internal route.
  const res = await fetch("/api/admin/cdn-purge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags: req.tags, provider: req.provider }),
  });
  if (!res.ok) return { purged: 0 };
  const data = (await res.json()) as { purged?: number };
  return { purged: data.purged ?? 0 };
}

// ---------------------------------------------------------------------------
// Per-tradição invalidation (curators)
// ---------------------------------------------------------------------------

export const TRADITION_TAGS = [
  "candomble",
  "umbanda",
  "ifa",
  "cabala",
  "astrologia",
  "tantra",
  "budismo",
  "xamanismo",
] as const;

export type TraditionTag = (typeof TRADITION_TAGS)[number];

/** Build surrogate keys for a library article tied to a tradição. */
export function libraryArticleKeys(slug: string, tradition: TraditionTag): string[] {
  return [
    `cdc:article:${slug}`,
    `cdc:tradition:${tradition}`,
    "cdc:library:all",
  ];
}

/** Build surrogate keys for a user-curated feed. */
export function userFeedKeys(userId: string): string[] {
  return [`cdc:user:${userId}`, `cdc:feed:${userId}`];
}

// ---------------------------------------------------------------------------
// Image variant helper — picks the best format for next/image
// ---------------------------------------------------------------------------

export interface ImageVariant {
  format: "avif" | "webp" | "jpeg";
  quality: number;
  width: number;
}

export function imageVariants(baseWidth: number, formats: Array<"avif" | "webp" | "jpeg">): ImageVariant[] {
  const widths = [baseWidth, Math.round(baseWidth * 1.5), baseWidth * 2].filter((w) => w <= 3840);
  const out: ImageVariant[] = [];
  for (const fmt of formats) {
    const quality = fmt === "jpeg" ? 80 : 75;
    for (const w of widths) out.push({ format: fmt, quality, width: w });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Cache bypass detection — given cookies, decide if a request is auth
// ---------------------------------------------------------------------------

const AUTH_COOKIE_PATTERN = /^(session|auth-token|sb-access-token|sb-refresh-token|next-auth\.session-token)/;

export function isAuthenticatedRequest(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  const cookies = cookieHeader.split(";");
  for (const c of cookies) {
    const name = c.trim().split("=")[0];
    if (name && AUTH_COOKIE_PATTERN.test(name)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const CDN_PROVIDERS: Record<CdnProvider, CdnPolicy> = {
  vercel: VERCEL_CDN,
  cloudflare: CLOUDFLARE_CDN,
  fastly: CLOUDFLARE_CDN, // Same defaults; tune in production
  bunny: CLOUDFLARE_CDN,
};

/** Convenience: pick rule by name from cache-strategy-v2. */
export function ruleByName(name: keyof typeof CACHE_RULES): CacheRule {
  return CACHE_RULES[name];
}