// ============================================================================
// perf/lcp — Largest Contentful Paint optimization toolkit (Wave 36)
// ============================================================================
// Implements the four LCP levers that move the metric from "needs improvement"
// to "good" (<2.5s p75 mobile 4G):
//
//   1. Responsive image helpers (srcset + sizes + AVIF/WebP via next/image).
//   2. Critical CSS inline registry — emit <style> blocks above-the-fold.
//   3. Font loading manifest — preload + font-display: swap + subset list.
//   4. Route preloader for high-traffic routes (/feed, /oraculo, /biblioteca).
//
// The module is SSR-safe (all window/document guards) and zero-deps.
// Pair with src/lib/monitoring/web-vitals.ts for measurement; with
// next.config.ts `images.formats = ['image/avif', 'image/webp']` for codec.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResponsiveSource {
  /** Width descriptor (e.g. 640, 1080, 1920). */
  w: number;
  /** Path or URL to the image asset. */
  src: string;
}

export interface ResponsiveImageInput {
  /** Base file path WITHOUT extension. Helper appends `.avif`/`.webp`/`.jpg`. */
  base: string;
  /** Available widths to generate in the srcset. */
  widths: number[];
  /** `sizes` attribute hint (e.g. "(max-width: 768px) 100vw, 50vw"). */
  sizes: string;
  /** Logical alt text — required for a11y AND for the Image component. */
  alt: string;
  /** Intrinsic width / height to prevent CLS (see cls.ts). */
  width: number;
  height: number;
  /** Loading strategy — `eager` for above-fold LCP candidate, else `lazy`. */
  loading?: "eager" | "lazy";
  /** Fetch priority — `high` for hero, `low` for everything else. */
  fetchPriority?: "high" | "low" | "auto";
  /** Decoding hint — `sync` for LCP image, else `async`. */
  decoding?: "sync" | "async" | "auto";
  /** Optional object-fit override. */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export interface SrcsetEntry {
  src: string;
  descriptor: string; // "640w" or "2x"
}

export interface CriticalCssChunk {
  /** Stable id used for dedupe in <head>. */
  id: string;
  /** Inline CSS — should be <2KB after minification. */
  css: string;
}

// ---------------------------------------------------------------------------
// Responsive image helpers
// ---------------------------------------------------------------------------

/**
 * Build a `srcset` string from a list of width descriptors. The base path
 * is appended with `.{format}` so the URL is codec-aware. The browser
 * picks the smallest entry that still satisfies the `sizes` attribute.
 *
 * @example
 *   buildSrcset("/hero/akasha", [640, 960, 1280, 1920], "image/avif")
 *   // "/hero/akasha-640.avif 640w, /hero/akasha-960.avif 960w, ..."
 */
export function buildSrcset(
  base: string,
  widths: number[],
  format: "image/avif" | "image/webp" | "image/jpeg" | "image/png" = "image/avif",
): string {
  const ext = formatToExt(format);
  return widths
    .slice()
    .sort((a, b) => a - b)
    .map((w) => `${base}-${w}.${ext} ${w}w`)
    .join(", ");
}

/**
 * Reverse: build srcset for a *formatless* endpoint that uses query params
 * (e.g. `?w=640&fmt=avif`). Useful for `next/image` URL generation.
 */
export function buildQuerySrcset(
  base: string,
  widths: number[],
  format: string = "avif",
): string {
  return widths
    .slice()
    .sort((a, b) => a - b)
    .map((w) => `${base}?w=${w}&fmt=${format} ${w}w`)
    .join(", ");
}

function formatToExt(format: string): string {
  switch (format) {
    case "image/avif":
      return "avif";
    case "image/webp":
      return "webp";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return "webp";
  }
}

/**
 * Convert a ResponsiveImageInput to the props expected by `next/image`
 * (compatible with both <Image> and <picture><source> usage).
 */
export function toNextImageProps(input: ResponsiveImageInput): {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  loading: "eager" | "lazy";
  fetchPriority: "high" | "low" | "auto";
  decoding: "sync" | "async" | "auto";
} {
  return {
    src: `${input.base}-${input.widths[input.widths.length - 1]}.avif`,
    alt: input.alt,
    width: input.width,
    height: input.height,
    sizes: input.sizes,
    loading: input.loading ?? "lazy",
    fetchPriority: input.fetchPriority ?? "auto",
    decoding: input.decoding ?? "async",
  };
}

// ---------------------------------------------------------------------------
// Critical CSS registry
// ---------------------------------------------------------------------------

const CRITICAL_REGISTRY = new Map<string, string>();

/** Register a critical CSS chunk. Duplicate ids are silently ignored. */
export function registerCriticalCss(chunk: CriticalCssChunk): void {
  if (CRITICAL_REGISTRY.has(chunk.id)) return;
  CRITICAL_REGISTRY.set(chunk.id, chunk.css);
}

/** Render all registered critical CSS as a single <style> string. */
export function renderCriticalCss(): string {
  if (CRITICAL_REGISTRY.size === 0) return "";
  return Array.from(CRITICAL_REGISTRY.values()).join("\n");
}

/** Get the list of registered ids — useful for the layout <style> tag. */
export function listCriticalCssIds(): string[] {
  return Array.from(CRITICAL_REGISTRY.keys());
}

/**
 * WAVE 36 default critical CSS — paints app shell on first byte, prevents
 * the white-flash on slow mobile networks. <500 bytes after minification.
 * Layout registers this in <head> BEFORE the body renders.
 */
export const DEFAULT_CRITICAL_CSS: CriticalCssChunk = {
  id: "akasha-app-shell",
  css: [
    ":root{color-scheme:light dark}",
    "html,body{background:#020617;color:#e2e8f0;margin:0}",
    "html{font-family:var(--font-raleway,system-ui,sans-serif);-webkit-font-smoothing:antialiased}",
    "main{display:block;min-height:100vh}",
    ".ak-shell{min-height:100vh;display:flex;flex-direction:column}",
    ".ak-header{position:sticky;top:0;z-index:40;backdrop-filter:blur(12px);background:rgba(2,6,23,.7)}",
    ".ak-hero{aspect-ratio:16/9;width:100%;object-fit:cover}",
    ".ak-skeleton{background:linear-gradient(90deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);background-size:200% 100%;animation:ak-shimmer 1.4s infinite}",
    "@keyframes ak-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}",
  ].join(""),
};

// ---------------------------------------------------------------------------
// Font loading manifest
// ---------------------------------------------------------------------------

export interface FontEntry {
  family: string;
  weights: number[];
  /** Critical weight used for preload — keep to ONE per family. */
  preloadWeight?: number;
  /** `swap` shows fallback immediately; `optional` waits 100ms. */
  display: "swap" | "optional" | "block" | "fallback";
  /** Comma-separated fallback stack for `font-family`. */
  fallback: string[];
}

/**
 * Wave 36 font manifest — keep in sync with `next/font` calls in layout.tsx.
 * The `preloadWeight` is the single weight we ship as <link rel=preload>.
 * `display: swap` is non-negotiable for LCP — see cls.ts for fallback
 * metric overrides that prevent reflow when the web font arrives.
 */
export const FONT_MANIFEST: FontEntry[] = [
  {
    family: "Cinzel",
    weights: [600],
    preloadWeight: 600,
    display: "swap",
    fallback: ["Georgia", "serif"],
  },
  {
    family: "Cormorant Garamond",
    weights: [500],
    display: "swap",
    fallback: ["Georgia", "serif"],
  },
  {
    family: "Raleway",
    weights: [400, 500, 600],
    preloadWeight: 500,
    display: "swap",
    fallback: ["system-ui", "sans-serif"],
  },
  {
    family: "IM Fell English",
    weights: [400],
    display: "swap",
    fallback: ["Georgia", "serif"],
  },
];

/** Build the <link rel="preload" as="font"> tags for the preload weights. */
export function renderPreloadFontTags(): Array<{ href: string; type: string; crossOrigin: string }> {
  const tags: Array<{ href: string; type: string; crossOrigin: string }> = [];
  for (const f of FONT_MANIFEST) {
    if (f.preloadWeight == null) continue;
    // next/font generates hashed URLs under /_next/static/media/. The
    // preload tag is added automatically by next/font; this helper is
    // only useful for non-next fonts (e.g. self-hosted variants).
    tags.push({
      href: `/_next/static/media/${slug(f.family)}-${f.preloadWeight}.woff2`,
      type: "font/woff2",
      crossOrigin: "anonymous",
    });
  }
  return tags;
}

function slug(family: string): string {
  return family.toLowerCase().replace(/\s+/g, "-");
}

// ---------------------------------------------------------------------------
// Route preloader — high-traffic routes get preloaded on idle
// ---------------------------------------------------------------------------

export interface PreloadRoute {
  href: string;
  /** Relative priority for `<link rel="prefetch">` ordering. */
  priority: "high" | "low";
}

export const HIGH_TRAFFIC_ROUTES: PreloadRoute[] = [
  { href: "/feed", priority: "high" },
  { href: "/oraculo", priority: "high" },
  { href: "/biblioteca", priority: "high" },
  { href: "/comunidade", priority: "low" },
  { href: "/explore", priority: "low" },
];

/**
 * Preload routes using `requestIdleCallback` (fallback: `setTimeout`).
 * SSR-safe — guards on `typeof window`.
 */
export function preloadHighTrafficRoutes(routes: PreloadRoute[] = HIGH_TRAFFIC_ROUTES): () => void {
  if (typeof window === "undefined") return () => {};
  if (typeof document === "undefined") return () => {};

  const injected: HTMLLinkElement[] = [];

  const run = (deadline: IdleDeadline | number) => {
    const isIdle = typeof deadline === "object" && "timeRemaining" in deadline
      ? () => (deadline as IdleDeadline).timeRemaining() > 8
      : () => true;

    for (const route of routes) {
      if (!isIdle()) break;
      // Skip if already on the target route.
      if (window.location.pathname === route.href) continue;
      // Skip if <link rel=prefetch> already injected.
      if (document.querySelector(`link[rel="prefetch"][href="${route.href}"]`)) continue;

      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = route.href;
      link.setAttribute("data-ak-prefetch", route.priority);
      document.head.appendChild(link);
      injected.push(link);
    }
  };

  let handle: number | null = null;
  if (typeof (window as Window & { requestIdleCallback?: (cb: IdleCallback) => number }).requestIdleCallback === "function") {
    handle = (window as Window & { requestIdleCallback: (cb: IdleCallback) => number }).requestIdleCallback(run);
  } else {
    handle = window.setTimeout(() => run(Date.now()), 1500);
  }

  return () => {
    if (handle != null) {
      if (typeof (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback === "function") {
        (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(handle);
      } else {
        window.clearTimeout(handle);
      }
    }
    for (const link of injected) {
      link.remove();
    }
  };
}

// ---------------------------------------------------------------------------
// Trending posts SSR cache helper
// ---------------------------------------------------------------------------

export interface TrendingCache {
  data: unknown;
  expiresAt: number;
  route: string;
}

const trendingCache = new Map<string, TrendingCache>();

/**
 * Cache trending posts in-memory for `ttlMs` to keep SSR fast. Key is the
 * route so `/feed` and `/welcome` can have different views.
 */
export function getCachedTrending<T>(route: string, ttlMs: number = 60_000, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = trendingCache.get(route);
  if (hit && hit.expiresAt > now) {
    return Promise.resolve(hit.data as T);
  }
  return loader().then((data) => {
    trendingCache.set(route, { data, expiresAt: now + ttlMs, route });
    return data;
  });
}

/** Invalidate a specific route's trending cache (e.g. after new post). */
export function invalidateTrending(route?: string): void {
  if (route) {
    trendingCache.delete(route);
    return;
  }
  trendingCache.clear();
}

// ---------------------------------------------------------------------------
// Re-exports — stable public surface
// ---------------------------------------------------------------------------

export const LCP_TARGET_MS = 2500; // p75 mobile 4G
export const LCP_FALLBACK_WIDTHS = [360, 640, 750, 828, 1080, 1200, 1920];
