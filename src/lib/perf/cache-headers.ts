// ============================================================================
// perf/cache-headers — Pre-built Cache-Control presets for API routes
// ============================================================================
// Wave 32 (perf 4/8) — Centralized cache header helpers.
//
// Usage:
//   return NextResponse.json(data, { headers: CACHE_PRESETS.STATIC });
//   return NextResponse.json(data, { headers: cachePreset('STATIC') });
//
// Why presets?
//   - Consistent TTLs across the API surface
//   - Easier to audit (one file vs 78 route.ts)
//   - Easy to tune (change here, propagates everywhere)
// ============================================================================

/**
 * Preset catalog. Pick the one that matches the data lifecycle:
 *   - STATIC     : never changes (VAPID key, notification templates)
 *   - HOURLY     : slowly changes, CDN-friendly (sacred calendar, featured articles)
 *   - SHORT      : changes frequently but cacheable (lists, search results)
 *   - USER_DATA  : private per-user, no CDN (profile, dashboard)
 *   - REALTIME   : not cacheable (notifications, live data)
 *   - NO_STORE   : sensitive or always-fresh (auth, mutations)
 */
export const CACHE_PRESETS = {
  STATIC: {
    "Cache-Control":
      "public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400",
  },
  HOURLY: {
    "Cache-Control":
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=21600",
  },
  SHORT: {
    "Cache-Control":
      "public, max-age=60, s-maxage=600, stale-while-revalidate=3600",
  },
  USER_DATA: {
    "Cache-Control": "private, no-cache",
  },
  REALTIME: {
    "Cache-Control": "no-store",
  },
  NO_STORE: {
    "Cache-Control": "no-store",
  },
} as const;

export type CachePreset = keyof typeof CACHE_PRESETS;

export function cachePreset(preset: CachePreset): Record<string, string> {
  return CACHE_PRESETS[preset];
}

/**
 * Combine Cache-Control with Vercel/Next.js cache tags for on-demand
 * revalidation. Example:
 *   cacheWithTags('SHORT', 'articles:list')
 * → header `Cache-Tag: articles:list` lets you call `revalidateTag('articles:list')`
 *   from a webhook to purge.
 */
export function cacheWithTags(
  preset: CachePreset,
  ...tags: string[]
): Record<string, string> {
  const base = CACHE_PRESETS[preset];
  if (tags.length === 0) return base;
  return {
    ...base,
    "Cache-Tag": tags.join(","),
  };
}

/**
 * Build an ETag from a JSON-serializable value. Cheap hash, sufficient for
 * cache validation (we don't need cryptographic strength).
 */
export function buildETag(data: unknown): string {
  const json = JSON.stringify(data);
  // FNV-1a 32-bit hash (simple, fast, deterministic)
  let hash = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) {
    hash ^= json.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `"${(hash >>> 0).toString(16)}"`;
}

/**
 * 304 Not Modified handler. Returns null if ETag matches the request's
 * `If-None-Match` header, else returns the ETag to set on the response.
 *
 * Usage:
 *   const etag = buildETag(data);
 *   const notModified = checkETag(req, etag);
 *   if (notModified) return new NextResponse(null, { status: 304, headers: { ETag: etag } });
 *   return NextResponse.json(data, { headers: { ETag: etag, ...CACHE_PRESETS.SHORT } });
 */
export function checkETag(req: { headers: { get: (k: string) => string | null } }, etag: string): boolean {
  const ifNoneMatch = req.headers.get("if-none-match");
  if (!ifNoneMatch) return false;
  // Multiple ETags can be comma-separated
  const tags = ifNoneMatch.split(",").map((t) => t.trim());
  return tags.includes(etag) || tags.includes("*");
}