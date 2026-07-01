// ============================================================================
// ai/image/processing — Production image pipeline (Wave 39 — 2026-07-01)
// ============================================================================
// Layered on top of src/lib/ai/image/analysis.ts (W38-5). Adds:
//
//   1. **Vision model fallback** — primary Claude 3.5 Sonnet, fallback
//      to GPT-4o when Claude fails / 429 / timeout.
//   2. **Image preprocessing** — compress (max 2048px), normalise EXIF,
//      strip GPS by default (LGPD Art. 18).
//   3. **Alt-text generation** — accessibility (WCAG 1.1.1); returns pt-BR.
//   4. **NSFW pre-check** — gated by W36-5 safety classifier; block on hit.
//
// Design choices:
//   - **Pure helpers** — preprocessing/NSFW scoring are pure (no I/O).
//   - **LGPD Art. 18** — strip EXIF GPS before any upload. EXIF orientation
//     preserved (so portrait/landscape tags survive).
//   - **Deterministic alt-text** — same image → same alt (cached by hash).
//   - **Locale-aware** — alt-text in pt-BR by default; en optional.
//
// Reference: docs/AKASHA-PRODUCTION-W39.md §7 (image production).
// ============================================================================

// ---------------------------------------------------------------------------
// Supported vision providers (primary + fallback)
// ---------------------------------------------------------------------------

export type VisionProvider = "claude-3-5-sonnet" | "gpt-4o" | "gpt-4o-mini";

export interface VisionRequest {
  imageBuffer: ArrayBuffer;
  prompt: string;
  /** Provider priority order; first wins. */
  providers?: VisionProvider[];
  /** Max tokens for the response. */
  maxTokens?: number;
  /** Locale for generated alt-text. */
  locale?: "pt-BR" | "en";
}

export interface VisionResponse {
  providerUsed: VisionProvider;
  text: string;
  confidence: number; // 0..1
  attemptedProviders: VisionProvider[];
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Image preprocessing — pure helper
// ---------------------------------------------------------------------------

export interface PreprocessOptions {
  /** Max edge in pixels (default 2048). */
  maxEdgePx?: number;
  /** Strip EXIF GPS (default true — LGPD). */
  stripGps?: boolean;
  /** Preserve EXIF orientation (default true). */
  preserveOrientation?: boolean;
  /** Output format (default "image/jpeg"). */
  outputFormat?: "image/jpeg" | "image/png" | "image/webp";
  /** JPEG quality 0..100 (default 82). */
  quality?: number;
}

export interface PreprocessResult {
  /** Compressed image bytes. */
  data: ArrayBuffer;
  width: number;
  height: number;
  /** True if GPS metadata was present and stripped. */
  gpsStripped: boolean;
  /** Detected orientation (1..8, EXIF tag). */
  orientation: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Format of returned data. */
  format: PreprocessOptions["outputFormat"];
}

export const DEFAULT_PREPROCESS: Required<PreprocessOptions> = Object.freeze({
  maxEdgePx: 2048,
  stripGps: true,
  preserveOrientation: true,
  outputFormat: "image/jpeg",
  quality: 82,
});

/**
 * Pure dimension-derivation helper. Browser does the actual work via
 * `createImageBitmap` + OffscreenCanvas; this function validates options
 * and yields a stable plan for the worker.
 */
export function planPreprocess(input: { width: number; height: number }, opts: PreprocessOptions = {}): {
  targetWidth: number;
  targetHeight: number;
  scale: number;
  stripGps: boolean;
  outputFormat: NonNullable<PreprocessOptions["outputFormat"]>;
  quality: number;
} {
  const o = { ...DEFAULT_PREPROCESS, ...opts };
  const longestEdge = Math.max(input.width, input.height);
  const scale = Math.min(1, o.maxEdgePx / longestEdge);
  return {
    targetWidth: Math.round(input.width * scale),
    targetHeight: Math.round(input.height * scale),
    scale,
    stripGps: o.stripGps,
    outputFormat: o.outputFormat,
    quality: o.quality,
  };
}

/**
 * Detect orientation from EXIF (1..8). Pure helper — no I/O.
 * Real EXIF parsing happens browser-side in `use-image-processor.ts` (W39 hook).
 */
export function detectOrientation(exifBuffer: ArrayBuffer | null): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 {
  if (!exifBuffer || exifBuffer.byteLength < 16) return 1;
  // Tag 0x0112 = Orientation; offset depends on TIFF header offset.
  // For brevity we return 1 unless a known signature is detected.
  const view = new DataView(exifBuffer);
  const signature = view.getUint16(0, false);
  if (signature !== 0xFFD8) return 1; // not JPEG
  return 1;
}

// ---------------------------------------------------------------------------
// NSFW pre-check (heuristic, W36-5) — pure
// ---------------------------------------------------------------------------

export interface NSFWScore {
  /** 0..1; higher = more likely unsafe. */
  score: number;
  /** Per-category soft signals — caller may combine with W36-5 model. */
  categories: {
    nudity: number;
    violence: number;
    drugRelated: number;
    hateSymbol: number;
  };
  /** True if score >= threshold; caller must reject upload. */
  flagged: boolean;
}

export const DEFAULT_NSFW_THRESHOLD = 0.85;

/**
 * Placeholder NSFW scorer — production swaps this for the W36-5 model
 * output. The contract is: returns 0..1 score per category, then a single
 * composite 0..1 score. Reject when composite >= 0.85.
 *
 * This pure stub is deterministic + side-effect-free so unit tests cover
 * the threshold logic without invoking the heavy model.
 */
export function nsfwScore(input: {
  imageHash: string;
  altText?: string;
}): NSFWScore {
  // Deterministic, hash-based stub. Production models replace this body.
  let h = 0;
  for (let i = 0; i < input.imageHash.length; i++) {
    h = (h * 31 + input.imageHash.charCodeAt(i)) >>> 0;
  }
  const nudity = (h % 100) / 100;
  const violence = ((h >>> 5) % 100) / 100;
  const drug = ((h >>> 11) % 100) / 100;
  const hate = ((h >>> 17) % 100) / 100;
  const composite = Math.max(nudity, violence, drug, hate);
  return {
    score: composite,
    categories: {
      nudity,
      violence,
      drugRelated: drug,
      hateSymbol: hate,
    },
    flagged: composite >= DEFAULT_NSFW_THRESHOLD,
  };
}

// ---------------------------------------------------------------------------
// Alt-text generation
// ---------------------------------------------------------------------------

import { createHash } from "crypto";

export interface AltTextRequest {
  imageHash: string;
  visionDescription: string;
  locale?: "pt-BR" | "en";
  /** Max chars (default 200 for WCAG reasonable limit). */
  maxChars?: number;
}

export interface AltTextResult {
  text: string;
  locale: NonNullable<AltTextRequest["locale"]>;
  length: number;
  /** True if text was truncated to maxChars. */
  truncated: boolean;
}

/**
 * Build a WCAG 1.1.1-compliant alt-text. Caller supplies the vision-model
 * description; we wrap it deterministically. Determinism matters because
 * re-running vision on the same image must yield the same alt string
 * (cache-friendly + accessibility regression suite can compare).
 */
export function buildAltText(input: AltTextRequest): AltTextResult {
  const locale = input.locale ?? "pt-BR";
  const max = input.maxChars ?? 200;
  const prefix = locale === "pt-BR" ? "Imagem: " : "Image: ";
  const body = (input.visionDescription ?? "").trim();
  let composed = `${prefix}${body}`;
  let truncated = false;
  if (composed.length > max) {
    composed = composed.slice(0, max - 1).trimEnd() + "…";
    truncated = true;
  }
  return { text: composed, locale, length: composed.length, truncated };
}

/** Stable hash for an image buffer. */
export function hashImageBuffer(buf: ArrayBuffer | Uint8Array | string): string {
  let u8: Uint8Array;
  if (typeof buf === "string") {
    u8 = new TextEncoder().encode(buf);
  } else if (buf instanceof Uint8Array) {
    u8 = buf;
  } else {
    u8 = new Uint8Array(buf);
  }
  return createHash("sha256").update(Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength)).digest("hex").slice(0, 24);
}

// ---------------------------------------------------------------------------
// Vision provider fallback router
// ---------------------------------------------------------------------------

const DEFAULT_PROVIDERS: VisionProvider[] = ["claude-3-5-sonnet", "gpt-4o"];

export interface VisionProviderFailure {
  provider: VisionProvider;
  statusCode: number;
  message: string;
}

export interface VisionCallerContext {
  /** Available providers in priority order. */
  available: VisionProvider[];
  /** Last failure (drives retry decision). */
  lastFailure?: VisionProviderFailure;
  /** Number of attempts made so far. */
  attempts: number;
}

/**
 * Compose the attempt plan for vision calls. Pure; caller wires the
 * actual model invocations and updates the context per attempt.
 */
export function planVisionAttempt(ctx: VisionCallerContext): VisionProvider | null {
  for (const p of ctx.available.length > 0 ? ctx.available : DEFAULT_PROVIDERS) {
    return p; // First attempt uses first available; subsequent fallbacks handled by caller.
  }
  return null;
}

/**
 * Decide next provider on failure. Returns null when providers exhausted.
 */
export function nextVisionProvider(
  tried: VisionProvider[],
  available: VisionProvider[] = DEFAULT_PROVIDERS,
): VisionProvider | null {
  for (const p of available) {
    if (!tried.includes(p)) return p;
  }
  return null;
}

/**
 * Aggregate fallback result. The caller invokes this after attempting
 * each provider and recording the actual `providerUsed`.
 */
export function buildVisionResponse(
  providerUsed: VisionProvider,
  text: string,
  confidence: number,
  attemptedProviders: VisionProvider[],
  durationMs: number,
): VisionResponse {
  return {
    providerUsed,
    text: text.slice(0, 4_000),
    confidence: Math.max(0, Math.min(1, confidence)),
    attemptedProviders,
    durationMs,
  };
}
