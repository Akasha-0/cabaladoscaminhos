// ============================================================================
// perf/cls — Cumulative Layout Shift prevention toolkit (Wave 36)
// ============================================================================
// CLS is the metric most-broken by ad slots, late-loading fonts, and
// images without intrinsic dimensions. This module bundles:
//   1. Aspect-ratio CSS for images / video / iframes (intrinsic reservation).
//   2. Ad-slot placeholder that reserves space BEFORE the ad loads.
//   3. Font fallback metric override (size-adjust, ascent-override, etc).
//   4. Above-the-fold invariant guard — fails fast in dev if dynamic
//      content is injected into the LCP region without a height hint.
//
// Targets: p75 mobile CLS < 0.1 (good), < 0.05 (great).
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AspectRatio {
  width: number;
  height: number;
  /** Computed `width / height` — pre-calculated for hot path. */
  ratio: number;
  /** Inverse ratio for the CSS `aspect-ratio: W / H` value. */
  css: string;
}

export interface AdSlotSpec {
  /** Slot id, used as the key for reserved height. */
  id: string;
  /** Reserve width (any CSS length, e.g. "100%", "300px"). */
  width: string;
  /** Reserve height (any CSS length, e.g. "250px", "600px"). */
  height: string;
  /** Optional min-height fallback for above-fold placements. */
  minHeight?: string;
}

export interface FontFallbackOverride {
  /** Web font family to override. */
  family: string;
  /** Approximate x-height ratio (0-1) — matches the web font's metrics. */
  sizeAdjust?: number;
  ascentOverride?: string;
  descentOverride?: string;
  lineGapOverride?: string;
  /** `font-family` stack to apply in the @font-face block. */
  fallback: string[];
}

// ---------------------------------------------------------------------------
// 1. Aspect ratio calculator
// ---------------------------------------------------------------------------

/**
 * Build an AspectRatio descriptor. The `css` value goes directly into a
 * `style={{ aspectRatio: ar.css }}` prop or a class.
 *
 * @example
 *   const ar = aspectRatio(1920, 1080); // "16/9"
 *   <div style={{ aspectRatio: ar.css, width: "100%" }}>…</div>
 */
export function aspectRatio(width: number, height: number): AspectRatio {
  if (width <= 0 || height <= 0) {
    throw new Error(`aspectRatio: width/height must be > 0 (got ${width}x${height})`);
  }
  // Reduce to the smallest integer ratio (e.g. 1920x1080 → 16x9).
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(width, height);
  return {
    width,
    height,
    ratio: width / height,
    css: `${width / d} / ${height / d}`,
  };
}

/**
 * Build the CSS `padding-top` hack for older browsers that don't support
 * `aspect-ratio`. Use as a fallback inside a `@supports not (aspect-ratio: 1)` block.
 */
export function paddingTopHack(width: number, height: number): string {
  const pct = (height / width) * 100;
  return `${pct.toFixed(4)}%`;
}

// ---------------------------------------------------------------------------
// 2. Ad slot reservation
// ---------------------------------------------------------------------------

/**
 * Generate the inline style for a reserved ad slot. The slot reserves its
 * dimensions BEFORE the ad script loads, eliminating the 200-400ms CLS
 * spike that caused W32 audit failures.
 *
 * @example
 *   <div style={adSlotStyle({ id: "hero-300x250", width: "100%", height: "250px" })}>
 *     {adLoaded ? <Ad /> : null}
 *   </div>
 */
export function adSlotStyle(spec: AdSlotSpec): React.CSSProperties {
  return {
    width: spec.width,
    height: spec.height,
    minHeight: spec.minHeight ?? spec.height,
    display: "block",
    contain: "layout paint",
    // Reserve paint area to prevent a re-paint when the ad finally lands.
    contentVisibility: "auto",
  };
}

/**
 * Common ad slot presets used by the marketing pages and the /feed sidebar.
 * Keys are stable — change with care (downstream CSS hooks depend on them).
 */
export const AD_SLOT_PRESETS: Record<string, AdSlotSpec> = {
  "feed-sidebar-300x250": { id: "feed-sidebar-300x250", width: "300px", height: "250px" },
  "feed-sidebar-sticky-300x600": { id: "feed-sidebar-sticky-300x600", width: "300px", height: "600px" },
  "feed-inline-728x90": { id: "feed-inline-728x90", width: "100%", height: "90px", minHeight: "90px" },
  "library-banner-970x250": { id: "library-banner-970x250", width: "100%", height: "250px", minHeight: "180px" },
  "mobile-anchor-320x50": { id: "mobile-anchor-320x50", width: "100%", height: "50px", minHeight: "50px" },
};

// ---------------------------------------------------------------------------
// 3. Font fallback metric override
// ---------------------------------------------------------------------------

/**
 * Build a `@font-face` block that overrides the system fallback's metrics
 * to match the web font. This is the post-`adjustFontFallback` escape
 * hatch for situations where `next/font` is not in play (e.g. dynamically
 * loaded fonts, font-faces imported from a 3rd-party stylesheet).
 *
 * The result should be injected as a single <style> tag at the top of <head>.
 */
export function fontFallbackFace(override: FontFallbackOverride): string {
  const stack = [override.family, ...override.fallback].map((f) =>
    f.includes(" ") ? `"${f}"` : f,
  ).join(", ");
  const sizeAdjust = override.sizeAdjust ?? 100;
  const ascent = override.ascentOverride ?? "normal";
  const descent = override.descentOverride ?? "normal";
  const lineGap = override.lineGapOverride ?? "normal";

  return [
    `@font-face {`,
    `  font-family: ${stack};`,
    `  src: local("${override.fallback[0] ?? "system-ui"}");`,
    `  size-adjust: ${sizeAdjust}%;`,
    `  ascent-override: ${ascent};`,
    `  descent-override: ${descent};`,
    `  line-gap-override: ${lineGap};`,
    `}`,
  ].join("\n");
}

/**
 * Wave 36 font-fallback manifest. These overrides prevent the ~50ms CLS
 * spike that occurs when Raleway swaps in over the system fallback. Each
 * entry corresponds to a web font declared in `next/font` (layout.tsx).
 */
export const FONT_FALLBACK_OVERRIDES: FontFallbackOverride[] = [
  {
    family: "Raleway Fallback",
    sizeAdjust: 107,
    ascentOverride: "90%",
    descentOverride: "22%",
    lineGapOverride: "0%",
    fallback: ["Arial", "sans-serif"],
  },
  {
    family: "Cinzel Fallback",
    sizeAdjust: 110,
    ascentOverride: "94%",
    descentOverride: "26%",
    lineGapOverride: "0%",
    fallback: ["Times New Roman", "serif"],
  },
  {
    family: "Cormorant Garamond Fallback",
    sizeAdjust: 105,
    ascentOverride: "92%",
    descentOverride: "24%",
    lineGapOverride: "0%",
    fallback: ["Times New Roman", "serif"],
  },
  {
    family: "IM Fell English Fallback",
    sizeAdjust: 102,
    ascentOverride: "88%",
    descentOverride: "22%",
    lineGapOverride: "0%",
    fallback: ["Times New Roman", "serif"],
  },
];

/** Render all font-fallback overrides as a single <style> string. */
export function renderFontFallbackCss(): string {
  return FONT_FALLBACK_OVERRIDES.map(fontFallbackFace).join("\n");
}

// ---------------------------------------------------------------------------
// 4. Above-the-fold invariant guard
// ---------------------------------------------------------------------------

/**
 * Sentinel thrown by the dev-only invariant guard. Caught by the layout's
 * error boundary — never surfaces in production.
 */
export class AboveFoldShiftError extends Error {
  constructor(public readonly cause: string) {
    super(`Above-the-fold layout shift: ${cause}`);
    this.name = "AboveFoldShiftError";
  }
}

/**
 * Guard that asserts a piece of dynamic content reserves its dimensions
 * before being inserted into the LCP region. Throws AboveFoldShiftError
 * in dev (`process.env.NODE_ENV !== "production"`). Production = silent.
 *
 * @example
 *   <div style={{ aspectRatio: "16/9", width: "100%" }}>
 *     {dynamicContent ? renderDynamic() : <Skeleton h={540} />}
 *   </div>
 *   assertAboveFoldReserved({ element, minHeight: 540 });
 */
export function assertAboveFoldReserved(spec: {
  element: HTMLElement | null;
  minHeight: number;
  context?: string;
}): void {
  if (process.env.NODE_ENV === "production") return;
  if (typeof window === "undefined") return;
  if (!spec.element) {
    throw new AboveFoldShiftError(
      `no element bound (context=${spec.context ?? "unknown"})`,
    );
  }
  const rect = spec.element.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.height < spec.minHeight) {
    throw new AboveFoldShiftError(
      `dynamic content above-fold with insufficient height ` +
        `(got ${rect.height}px, need ≥ ${spec.minHeight}px; ` +
        `context=${spec.context ?? "unknown"})`,
    );
  }
}

// ---------------------------------------------------------------------------
// 5. Skeleton placeholder helper
// ---------------------------------------------------------------------------

export interface SkeletonProps {
  width?: string;
  height: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  className?: string;
}

/**
 * Build the className for a skeleton placeholder that matches the Akasha
 * design system. Pair with the `.ak-skeleton` class registered in
 * `lcp.ts → DEFAULT_CRITICAL_CSS` for instant paint (no FOUC).
 */
export function skeletonClass(props: SkeletonProps): string {
  const radius = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[props.rounded ?? "md"];
  const width = props.width ?? "100%";
  return `ak-skeleton inline-block ${radius} ${props.className ?? ""}`.trim();
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const CLS_TARGET = 0.1; // p75 mobile good
export const CLS_TARGET_GREAT = 0.05;
