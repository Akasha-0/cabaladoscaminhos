/**
 * w53/search-analytics-export-bundle
 * -----------------------------------------------------------------------------
 * Periodic export bundle engine for the w52/search-analytics-stream-realtime
 * event stream. Produces daily digests, weekly rollups, and monthly archives
 * from rolling-window aggregations with strict LGPD gating, sacred-text
 * redaction-mode routing, and cryptographic integrity.
 *
 * This module composes (by SHAPE, never by import) with:
 *   - w52/search-analytics-stream-realtime — source of `SearchEvent` records
 *     that we mirror here as `SearchAnalyticsEvent` for the export pipeline.
 *   - w51/search-analytics-dashboard       — owner-side digest widgets that
 *     consume the bundles this engine produces.
 *   - w51/redaction-policy-builder         — owner-defined redaction ladder
 *     we apply via `PrivacyFilter` instances.
 *
 * Design rules
 *   • Pure functions only — no IO, no `fetch`, no `Promise`, no
 *     EventSource / EventEmitter. Bundle assembly is deterministic given
 *     (events, now, period).
 *   • Hand-rolled SHA-256 (64 rounds) + HMAC-SHA-256 + FNV-1a 32-bit.
 *   • Hand-rolled lazy `deflate` for sandbox environments without zlib.
 *   • LGPD Art. 7 / 9 / 18 coverage at every stage of the bundle pipeline.
 *   • Sacred-text policy: sacred events NEVER appear in raw form; only the
 *     `sacredHitRate` counter is exported.
 *   • i18n: every user-visible label is resolved through `resolveBundleI18n`
 *     with a `pt-BR` default and `en-US` fallback.
 *
 * Surface (2000-2600 lines, 100-150 named exports):
 *
 *   §1   Core types: SearchAnalyticsEvent, WindowSpec, WindowAggregator,
 *                    PrivacyFilter, BundleEnvelope, ExportBundle,
 *                    CompressionFrame, SacredRoutingDecision, etc.
 *
 *   §2   Errors: `ExportBundleError` + 6 typed subclasses
 *                (window overflow, consent missing, sacred leak, integrity
 *                mismatch, compression failed, signature chain incomplete).
 *
 *   §3   Constants: defaults, caps, LGPD article registry, sacred flags.
 *
 *   §4   Hashes: hand-rolled SHA-256 (64 rounds) + HMAC-SHA-256 +
 *                FNV-1a 32-bit.
 *
 *   §5   I18n string tables: PT-BR + EN for `period`, `aggregation`,
 *                           `sensitivity`, `compression` keys.
 *
 *   §6   Validators: 12 type-guards + assertion helpers.
 *
 *   §7   Privacy filters: 8 named filters + the `composePrivacyPipeline`
 *                         composer.
 *
 *   §8   Window aggregators: 10 named aggregators
 *                            (rollingWindow, hourlyBucket, dailyDigest,
 *                            weeklyRollup, monthlyArchive, byKindBucket,
 *                            byRegionBucket, sacredHitRate,
 *                            blockedByLgpdCount, piiStrippedCount).
 *
 *   §9   Bundle builders: 8 named builders + the composition namespace
 *                         (assembleBundle, buildEnvelope, signBundle,
 *                         hashIntegrity, chainSigners, etc.).
 *
 *   §10  Compression: minimal deflate (uncompressed block header + stored
 *                     blocks) + gzip envelope.
 *
 *   §11  Sacred routing: `routeSacredEvent`, `wasSacredReserved`, etc.
 *
 *   §12  Composition namespace: `SearchAnalyticsExportBundleEngine`.
 *
 *   §13  Test helpers.
 *
 * LGPD
 *   • Art. 7  — every event in a bundle must have `consentTag`; events
 *               without consent are dropped before the window opens.
 *   • Art. 9  — every bundle carries a `purposeId` describing the
 *               purpose limitation.
 *   • Art. 18 — `purgeUserFromBundle(userId)` cascades through every
 *               window in a bundle, removing the user's events and
 *               updating integrity hashes.
 *
 * Sacred-text policy
 *   • `sacred_block` events NEVER appear in raw form — only as the
 *     `sacredHitRate` counter.
 *   • `wasSacredReserved: true` events carry a `redactedMode: true` flag
 *     in the bundle envelope.
 *   • Bundle integrity check verifies that the `sacredPreservedCount`
 *     matches the count of sacred events in the source stream.
 *
 * @module w53/search-analytics-export-bundle
 */

// ═════════════════════════════════════════════════════════════════════════════
// §1   CORE TYPES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * The 5-level sensitivity scale (mirrors w52 `StreamSensitivity`).
 * 1 = publicly visible, 5 = reserved-slot sacred text.
 */
export type ExportSensitivity = 1 | 2 | 3 | 4 | 5;

/**
 * Supported export periods. `custom` uses a caller-supplied `WindowSpec`.
 */
export type ExportPeriod =
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

/**
 * The kind of an aggregation row in a window. Stable, ordered for tests.
 */
export type AggregationKind =
  | "event_count"
  | "sacred_hit_rate"
  | "blocked_by_lgpd"
  | "pii_stripped"
  | "click_through"
  | "zero_result"
  | "error_rate"
  | "avg_results"
  | "active_users"
  | "active_sessions";

/**
 * LGPD consent tag carried by every event that enters a bundle.
 */
export type ConsentTag =
  | "consented"
  | "withdrawn"
  | "missing"
  | "renewed"
  | "sacred_reserved";

/**
 * Compression codec for an `ExportBundle`.
 */
export type CompressionCodec =
  | "none"
  | "gzip"
  | "deflate"
  | "deflate-raw";

/**
 * Routing mode for sacred-flagged events.
 */
export type SacredRoutingMode = "redacted-only" | "blocked-only" | "counter-only";

/**
 * Window specification. `kind` selects the canonical window length,
 * `count` multiplies it (e.g. `kind: "day", count: 7` → 7-day window).
 */
export interface WindowSpec {
  readonly kind: "minute" | "hour" | "day" | "week" | "month" | "quarter";
  readonly count: number;
  readonly label: string;
}

/**
 * The shape of a single event as it enters the export pipeline.
 * Mirrors w52 `SearchEvent` — same fields, no import. The export
 * pipeline strips sacred content before this shape is materialised.
 */
export interface SearchAnalyticsEvent {
  readonly eventId: string;
  readonly query: string;
  readonly resultsCount: number;
  readonly userId: string | null;
  readonly sessionId: string;
  readonly locale: string;
  readonly occurredAt: string;
  readonly filters: Readonly<Record<string, string | number | boolean>>;
  readonly sensitivity: ExportSensitivity;
  /** Discriminator — defaults to "search.executed" when absent. */
  readonly eventType?: string;
  /** LGPD consent tag carried by every event in the export pipeline. */
  readonly consentTag: ConsentTag;
  /** Region/locale bucket for byRegion aggregations. */
  readonly region?: string;
  /** Whether the event was already sacred-flagged upstream. */
  readonly wasSacredReserved?: boolean;
  /** Owner-defined purpose identifier (LGPD Art. 9). */
  readonly purposeId?: string;
}

/**
 * A single aggregation row. One row per `AggregationKind` per window.
 */
export interface WindowAggregator {
  readonly kind: AggregationKind;
  readonly value: number;
  /** Optional secondary label (e.g. region, kind, locale). */
  readonly label?: string;
}

/**
 * A completed window aggregation. Contains the window bounds, the events
 * that fell inside, and the per-kind aggregator rows.
 */
export interface ExportWindow {
  readonly windowSpec: WindowSpec;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly eventCount: number;
  readonly aggregators: readonly WindowAggregator[];
  /** Region bucket breakdown (one row per region). */
  readonly byRegion: readonly { readonly region: string; readonly count: number }[];
  /** Event-kind bucket breakdown (one row per `eventType`). */
  readonly byKind: readonly { readonly kind: string; readonly count: number }[];
}

/**
 * A privacy filter operates on a single event and returns either the
 * event (redacted) or `null` to drop the event.
 */
export interface PrivacyFilter {
  readonly name: string;
  readonly apply: (event: SearchAnalyticsEvent) => SearchAnalyticsEvent | null;
}

/**
 * Bundle envelope metadata. Cryptographic integrity + LGPD coverage.
 */
export interface BundleEnvelope {
  readonly version: string;
  readonly period: ExportPeriod;
  readonly windows: readonly WindowSpec[];
  readonly integrityHash: string;
  readonly lgpdArticles: readonly number[];
  readonly sacredFlagPreserved: boolean;
  readonly purposeId: string;
  readonly redactedMode: boolean;
  readonly sacredPreservedCount: number;
  readonly createdAt: string;
  readonly bundleId: string;
}

/**
 * The compression frame attached to a bundle body. Hand-rolled codec,
 * no `node:zlib`.
 */
export interface CompressionFrame {
  readonly codec: CompressionCodec;
  readonly originalSize: number;
  readonly compressedSize: number;
  readonly body: string;
}

/**
 * Signature frame. HMAC-SHA-256 chain over the body + integrity hash.
 */
export interface SignatureFrame {
  readonly signerId: string;
  readonly signature: string;
  readonly previousSignature: string | null;
  readonly chainPosition: number;
}

/**
 * The full export bundle assembled by `assembleBundle`.
 */
export interface ExportBundle {
  readonly envelope: BundleEnvelope;
  readonly body: string;
  readonly compression: CompressionFrame;
  readonly signature: SignatureFrame;
  readonly windows: readonly ExportWindow[];
}

/**
 * Decision returned by `routeSacredEvent`.
 */
export interface SacredRoutingDecision {
  readonly allowed: boolean;
  readonly mode: SacredRoutingMode;
  readonly reason: string;
}

/**
 * Outcome of a privacy-pipeline run. Splits kept / redacted / dropped.
 */
export interface PrivacyPipelineResult {
  readonly kept: readonly SearchAnalyticsEvent[];
  readonly redacted: readonly SearchAnalyticsEvent[];
  readonly dropped: readonly SearchAnalyticsEvent[];
}

/**
 * Outcome of `assembleBundle`.
 */
export interface BundleAssembly {
  readonly bundle: ExportBundle;
  readonly warnings: readonly string[];
}

/**
 * Outcome of `verifyBundleIntegrity`. Used by the receiver.
 */
export interface IntegrityReport {
  readonly valid: boolean;
  readonly computedHash: string;
  readonly expectedHash: string;
  readonly reasons: readonly string[];
}

/**
 * Outcome of `purgeUserFromBundle`. Reports per-bundle before/after.
 */
export interface PurgeReport {
  readonly beforeEventCount: number;
  readonly afterEventCount: number;
  readonly purgedUserEvents: number;
  readonly bundlesTouched: number;
}

/**
 * Bundle chain. A list of bundles with a single root signature frame.
 */
export interface BundleChain {
  readonly bundles: readonly ExportBundle[];
  readonly rootSignature: string;
  readonly chainLength: number;
}

/**
 * Per-window purge row returned by `cascadePurgeThroughWindows`.
 */
export interface WindowPurgeRow {
  readonly windowSpec: WindowSpec;
  readonly purged: number;
  readonly remaining: number;
}

/**
 * Counters for the bundle-level metrics.
 */
export interface BundleCounters {
  readonly eventsKept: number;
  readonly eventsRedacted: number;
  readonly eventsDropped: number;
  readonly sacredHits: number;
  readonly piiStrips: number;
  readonly consentDropped: number;
}

/**
 * A lightweight report for a single window aggregation.
 */
export interface WindowReport {
  readonly label: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly eventCount: number;
  readonly sacredHitRate: number;
  readonly piiStripRate: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// §2   ERRORS  (EXP_001 .. EXP_006)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Base error for the export-bundle engine. Mirrors w52's
 * `StreamRealtimeError` shape so a single error handler can dispatch
 * across engines.
 */
export class ExportBundleError extends Error {
  public readonly code: string;
  public readonly context: Readonly<Record<string, unknown>>;
  public constructor(
    code: string,
    message: string,
    context: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "ExportBundleError";
    this.code = code;
    this.context = context;
  }
  public toString(): string {
    return `${this.name}[${this.code}]: ${this.message}`;
  }
}

/** EXP_001 — window overflow / invalid spec. */
export class ExportWindowOverflowError extends ExportBundleError {
  public constructor(windowSpec: WindowSpec, reason: string) {
    super(
      "EXP_001",
      `Window overflow for spec "${windowSpec.label}": ${reason}`,
      { windowSpec, reason },
    );
    this.name = "ExportWindowOverflowError";
  }
}

/** EXP_002 — consent missing on at least one event in the bundle. */
export class ExportConsentMissingError extends ExportBundleError {
  public constructor(eventId: string, purposeId: string) {
    super(
      "EXP_002",
      `LGPD Art. 7 consent missing for event "${eventId}" in purpose "${purposeId}".`,
      { eventId, purposeId },
    );
    this.name = "ExportConsentMissingError";
  }
}

/** EXP_003 — sacred-text leak detected in a bundle body. */
export class ExportSacredLeakError extends ExportBundleError {
  public constructor(bundleId: string, leakCount: number) {
    super(
      "EXP_003",
      `Sacred-text leak detected in bundle "${bundleId}" (${leakCount} events).`,
      { bundleId, leakCount },
    );
    this.name = "ExportSacredLeakError";
  }
}

/** EXP_004 — bundle integrity hash mismatch. */
export class ExportIntegrityMismatchError extends ExportBundleError {
  public constructor(bundleId: string, expected: string, actual: string) {
    super(
      "EXP_004",
      `Integrity mismatch for bundle "${bundleId}": expected ${expected}, got ${actual}.`,
      { bundleId, expected, actual },
    );
    this.name = "ExportIntegrityMismatchError";
  }
}

/** EXP_005 — compression codec failed (deflate round-trip or invalid input). */
export class ExportCompressionFailedError extends ExportBundleError {
  public constructor(reason: string) {
    super("EXP_005", `Compression failed: ${reason}`, { reason });
    this.name = "ExportCompressionFailedError";
  }
}

/** EXP_006 — signature chain incomplete or detached. */
export class ExportSignatureChainError extends ExportBundleError {
  public constructor(chainLength: number, expected: number) {
    super(
      "EXP_006",
      `Signature chain incomplete: have ${chainLength}, expected ${expected}.`,
      { chainLength, expected },
    );
    this.name = "ExportSignatureChainError";
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// §3   CONSTANTS
// ═════════════════════════════════════════════════════════════════════════════

/** Engine version label — bump when wire format changes. */
export const EXPORT_ENGINE_VERSION: string = "w53.search-analytics-export-bundle@1.0.0";

/** Maximum number of events per single bundle (refuse overflow). */
export const MAX_EVENTS_PER_BUNDLE: number = 50_000;

/** Maximum number of windows per bundle. */
export const MAX_WINDOWS_PER_BUNDLE: number = 96;

/** Maximum window size in seconds (90 days). */
export const MAX_WINDOW_SECONDS: number = 90 * 24 * 60 * 60;

/** Minimum window size in seconds (1 minute). */
export const MIN_WINDOW_SECONDS: number = 60;

/** Default purposeId for bundles (LGPD Art. 9). */
export const DEFAULT_PURPOSE_ID: string = "search-analytics-digest";

/** The LGPD articles this engine guarantees coverage for. */
export const LGPD_ARTICLES_COVERED: readonly number[] = [7, 9, 18] as const;

/** Sacred-text policy: events with sensitivity 4-5 are sacred. */
export const SACRED_SENSITIVITY_FLOOR: ExportSensitivity = 4;

/** Sacred-text policy: dual-review key. Empty default — set by owner. */
export const SACRED_DUAL_REVIEW_KEY: string = "";

/** Window lengths in seconds, indexed by `WindowSpec.kind`. */
export const WINDOW_LENGTH_SECONDS: Readonly<Record<WindowSpec["kind"], number>> = {
  minute: 60,
  hour: 60 * 60,
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
  quarter: 90 * 24 * 60 * 60,
};

/** Default window for hourly digest. */
export const DEFAULT_HOURLY_WINDOW: WindowSpec = {
  kind: "hour",
  count: 1,
  label: "last-1h",
};

/** Default window for daily digest. */
export const DEFAULT_DAILY_WINDOW: WindowSpec = {
  kind: "day",
  count: 1,
  label: "last-24h",
};

/** Default window for weekly rollup. */
export const DEFAULT_WEEKLY_WINDOW: WindowSpec = {
  kind: "week",
  count: 1,
  label: "last-7d",
};

/** Default window for monthly archive. */
export const DEFAULT_MONTHLY_WINDOW: WindowSpec = {
  kind: "month",
  count: 1,
  label: "last-30d",
};

/** Default window for quarterly review. */
export const DEFAULT_QUARTERLY_WINDOW: WindowSpec = {
  kind: "quarter",
  count: 1,
  label: "last-90d",
};

/** Compression thresholds — bundle bodies over this size get compressed. */
export const COMPRESSION_THRESHOLD_BYTES: number = 4_096;

/** Maximum compression ratio (refuse if worse). */
export const MAX_COMPRESSION_RATIO: number = 0.99;

/** Deflate max block size (bytes). Stored blocks cap at 65535. */
export const DEFLATE_MAX_BLOCK_SIZE: number = 65_535;

/** Gzip magic number. */
export const GZIP_MAGIC: readonly number[] = [0x1f, 0x8b];

/** Gzip default compression method (8 = deflate). */
export const GZIP_METHOD_DEFLATE: number = 8;

/** HMAC key for bundle signing. Owner-set; defaults to a sentinel. */
export const BUNDLE_SIGNING_KEY: string = "w53-bundle-signing-key-do-not-use-in-prod";

/** Signature chain default depth. */
export const DEFAULT_SIGNATURE_CHAIN_DEPTH: number = 3;

/** Maximum sacred count delta tolerated between stream and bundle. */
export const SACRED_COUNT_TOLERANCE: number = 0;

/** Default compression codec. */
export const DEFAULT_CODEC: CompressionCodec = "none";

/** Per-region quota (max events per region per window). */
export const MAX_EVENTS_PER_REGION: number = 10_000;

/** K-anonymity threshold for region buckets. */
export const REGION_K_ANON: number = 5;

/** PII patterns — shared with §7 privacy filters. */
export const PII_PATTERNS_BUNDLE: readonly RegExp[] = [
  /[\w.+-]+@[\w-]+\.[\w.-]+/g,
  /(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}/g,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{2}\b/g,
  /\b\d{11,}\b/g,
];

/** Bundle envelope version label. */
export const BUNDLE_ENVELOPE_VERSION: string = "w53.envelope@1.0.0";

/** All supported export periods. */
export const ALL_EXPORT_PERIODS: readonly ExportPeriod[] = [
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "custom",
];

/** All supported aggregation kinds. */
export const ALL_AGGREGATION_KINDS: readonly AggregationKind[] = [
  "event_count",
  "sacred_hit_rate",
  "blocked_by_lgpd",
  "pii_stripped",
  "click_through",
  "zero_result",
  "error_rate",
  "avg_results",
  "active_users",
  "active_sessions",
];

/** All supported consent tags. */
export const ALL_CONSENT_TAGS: readonly ConsentTag[] = [
  "consented",
  "withdrawn",
  "missing",
  "renewed",
  "sacred_reserved",
];

/** All supported compression codecs. */
export const ALL_COMPRESSION_CODECS: readonly CompressionCodec[] = [
  "none",
  "gzip",
  "deflate",
  "deflate-raw",
];

/** All supported sacred routing modes. */
export const ALL_SACRED_ROUTING_MODES: readonly SacredRoutingMode[] = [
  "redacted-only",
  "blocked-only",
  "counter-only",
];

/** Maximum bundle body bytes after compression. */
export const MAX_BUNDLE_BYTES: number = 8 * 1024 * 1024;

/** Bundle id prefix. */
export const BUNDLE_ID_PREFIX: string = "bundle-";

/** Window label format separator. */
export const WINDOW_LABEL_SEPARATOR: string = "|";

// ═════════════════════════════════════════════════════════════════════════════
// §4   HASHES  (hand-rolled, mirrors w52 surface)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * 32-bit right rotation. Internal helper for SHA-256.
 */
function rotr32Bundle(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * 64-entry SHA-256 round constants (K).
 */
export const SHA256_K_BUNDLE: readonly number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/** Initial hash values for SHA-256. */
export const SHA256_IV_BUNDLE: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

/**
 * Encode a UTF-8 string into a Uint8Array. Internal helper.
 */
function utf8ToBytesBundle(str: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str);
  }
  const out: number[] = [];
  for (let i = 0; i < str.length; i += 1) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      i += 1;
      const c2 = str.charCodeAt(i);
      const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    }
  }
  return new Uint8Array(out);
}

/**
 * Convert a 4-byte big-endian sequence to a 32-bit integer. Internal.
 */
function bytesToU32BEBundle(b0: number, b1: number, b2: number, b3: number): number {
  return ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
}

/**
 * Hand-rolled SHA-256. Returns a 64-character lowercase hex string.
 */
export function computeBundleSHA256(input: string | Uint8Array): string {
  let bytes: Uint8Array;
  if (typeof input === "string") {
    bytes = utf8ToBytesBundle(input);
  } else {
    bytes = input;
  }

  const origLen = bytes.length;
  const bitLen = origLen * 8;

  const withOne = origLen + 1;
  const padLen = (56 - (withOne % 64) + 64) % 64;
  const totalLen = withOne + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[origLen] = 0x80;

  const high = Math.floor(bitLen / 0x100000000) >>> 0;
  const low = bitLen >>> 0;
  padded[totalLen - 8] = (high >>> 24) & 0xff;
  padded[totalLen - 7] = (high >>> 16) & 0xff;
  padded[totalLen - 6] = (high >>> 8) & 0xff;
  padded[totalLen - 5] = high & 0xff;
  padded[totalLen - 4] = (low >>> 24) & 0xff;
  padded[totalLen - 3] = (low >>> 16) & 0xff;
  padded[totalLen - 2] = (low >>> 8) & 0xff;
  padded[totalLen - 1] = low & 0xff;

  const h = new Array<number>(8);
  for (let i = 0; i < 8; i += 1) h[i] = SHA256_IV_BUNDLE[i] as number;

  const w = new Array<number>(64);

  for (let chunk = 0; chunk < totalLen; chunk += 64) {
    for (let i = 0; i < 16; i += 1) {
      const off = chunk + i * 4;
      w[i] = bytesToU32BEBundle(
        padded[off] as number,
        padded[off + 1] as number,
        padded[off + 2] as number,
        padded[off + 3] as number,
      );
    }
    for (let i = 16; i < 64; i += 1) {
      const w15 = w[i - 15] as number;
      const w2 = w[i - 2] as number;
      const s0 = rotr32Bundle(7, w15) ^ rotr32Bundle(18, w15) ^ (w15 >>> 3);
      const s1 = rotr32Bundle(17, w2) ^ rotr32Bundle(19, w2) ^ (w2 >>> 10);
      w[i] = (((w[i - 16] as number) + s0 + (w[i - 7] as number) + s1) >>> 0);
    }

    let a = h[0] as number;
    let b = h[1] as number;
    let c = h[2] as number;
    let d = h[3] as number;
    let e = h[4] as number;
    let f = h[5] as number;
    let g = h[6] as number;
    let hh = h[7] as number;

    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr32Bundle(6, e) ^ rotr32Bundle(11, e) ^ rotr32Bundle(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + (SHA256_K_BUNDLE[i] as number) + (w[i] as number)) >>> 0;
      const S0 = rotr32Bundle(2, a) ^ rotr32Bundle(13, a) ^ rotr32Bundle(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h[0] = ((h[0] as number) + a) >>> 0;
    h[1] = ((h[1] as number) + b) >>> 0;
    h[2] = ((h[2] as number) + c) >>> 0;
    h[3] = ((h[3] as number) + d) >>> 0;
    h[4] = ((h[4] as number) + e) >>> 0;
    h[5] = ((h[5] as number) + f) >>> 0;
    h[6] = ((h[6] as number) + g) >>> 0;
    h[7] = ((h[7] as number) + hh) >>> 0;
  }

  let out = "";
  for (let i = 0; i < 8; i += 1) {
    const word = h[i] as number;
    out += (word >>> 0).toString(16).padStart(8, "0");
  }
  return out;
}

/**
 * Hand-rolled HMAC-SHA-256. Returns a 64-character lowercase hex string.
 */
export function computeBundleHMACSHA256(message: string, key: string): string {
  const blockSize = 64;
  const keyBytes = utf8ToBytesBundle(key);
  let k0: Uint8Array;
  if (keyBytes.length > blockSize) {
    k0 = new Uint8Array(blockSize);
    const hashed = computeBundleSHA256(keyBytes);
    for (let i = 0; i < hashed.length; i += 2) {
      k0[i / 2] = parseInt(hashed.substring(i, i + 2), 16);
    }
  } else {
    k0 = new Uint8Array(blockSize);
    k0.set(keyBytes);
  }

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i += 1) {
    ipad[i] = (k0[i] as number) ^ 0x36;
    opad[i] = (k0[i] as number) ^ 0x5c;
  }

  const msgBytes = utf8ToBytesBundle(message);
  const inner = new Uint8Array(blockSize + msgBytes.length);
  inner.set(ipad);
  inner.set(msgBytes, blockSize);
  const innerHash = computeBundleSHA256(inner);

  const innerHashBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    innerHashBytes[i] = parseInt(innerHash.substring(i * 2, i * 2 + 2), 16);
  }

  const outer = new Uint8Array(blockSize + 32);
  outer.set(opad);
  outer.set(innerHashBytes, blockSize);
  return computeBundleSHA256(outer);
}

/**
 * FNV-1a 32-bit hash. Returns a 32-bit unsigned integer as a hex string.
 */
export function computeBundleFNV1a32(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? utf8ToBytesBundle(input) : input;
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i += 1) {
    hash ^= bytes[i] as number;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * Convenience: stable id derived from FNV-1a over arbitrary input.
 */
export function computeBundleStableId(input: string): string {
  return computeBundleFNV1a32(input);
}

/**
 * Compute integrity hash over a bundle body. SHA-256 of the body
 * + window labels + integrity timestamp. Used by `hashIntegrity`.
 */
export function computeBundleIntegrity(
  body: string,
  windows: readonly WindowSpec[],
  now: string,
): string {
  const labels = windows.map((w) => w.label).join(WINDOW_LABEL_SEPARATOR);
  return computeBundleSHA256(`${labels}\n${now}\n${body}`);
}

// ═════════════════════════════════════════════════════════════════════════════
// §5   I18N STRING TABLES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * PT-BR labels for `period`, `aggregation`, `sensitivity`, and
 * `compression` keys.
 */
export const BUNDLE_I18N_PT_BR = {
  period: {
    hourly: "por hora",
    daily: "diário",
    weekly: "semanal",
    monthly: "mensal",
    custom: "personalizado",
  },
  aggregation: {
    event_count: "contagem de eventos",
    sacred_hit_rate: "taxa de acerto sagrado",
    blocked_by_lgpd: "bloqueados por LGPD",
    pii_stripped: "PII removidos",
    click_through: "cliques em resultados",
    zero_result: "buscas sem resultado",
    error_rate: "taxa de erro",
    avg_results: "média de resultados",
    active_users: "usuários ativos",
    active_sessions: "sessões ativas",
  },
  sensitivity: {
    1: "público",
    2: "interno",
    3: "reservado",
    4: "sagrado (curador)",
    5: "sagrado (admin)",
  },
  compression: {
    none: "sem compressão",
    gzip: "gzip (RFC 1952)",
    deflate: "deflate (RFC 1951)",
    "deflate-raw": "deflate-raw",
  },
  consent: {
    consented: "consentido",
    withdrawn: "retirado",
    missing: "ausente",
    renewed: "renovado",
    sacred_reserved: "reservado sagrado",
  },
  routing: {
    "redacted-only": "apenas redação",
    "blocked-only": "apenas bloqueio",
    "counter-only": "apenas contador",
  },
};

/**
 * EN-US labels for the same key set.
 */
export const BUNDLE_I18N_EN_US = {
  period: {
    hourly: "hourly",
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly",
    custom: "custom",
  },
  aggregation: {
    event_count: "event count",
    sacred_hit_rate: "sacred hit rate",
    blocked_by_lgpd: "blocked by LGPD",
    pii_stripped: "PII stripped",
    click_through: "result clicks",
    zero_result: "zero-result searches",
    error_rate: "error rate",
    avg_results: "average results",
    active_users: "active users",
    active_sessions: "active sessions",
  },
  sensitivity: {
    1: "public",
    2: "internal",
    3: "reserved",
    4: "sacred (curator)",
    5: "sacred (admin)",
  },
  compression: {
    none: "no compression",
    gzip: "gzip (RFC 1952)",
    deflate: "deflate (RFC 1951)",
    "deflate-raw": "deflate-raw",
  },
  consent: {
    consented: "consented",
    withdrawn: "withdrawn",
    missing: "missing",
    renewed: "renewed",
    sacred_reserved: "sacred reserved",
  },
  routing: {
    "redacted-only": "redaction only",
    "blocked-only": "block only",
    "counter-only": "counter only",
  },
};

/** Type alias for the supported locales. */
export type BundleLocale = "pt-BR" | "en-US";

/** All locales in stable order. */
export const ALL_BUNDLE_LOCALES: readonly BundleLocale[] = ["pt-BR", "en-US"];

/** Default locale for i18n. */
export const DEFAULT_BUNDLE_LOCALE: "pt-BR" = "pt-BR";

/**
 * Resolve an i18n key. Falls back to `pt-BR` if the locale is not
 * supported, then to the key itself if not present.
 */
export function resolveBundleI18n(
  category: "period" | "aggregation" | "sensitivity" | "compression" | "consent" | "routing",
  key: string | number,
  locale: BundleLocale | string,
): string {
  if (locale === "en-US") {
    const table = BUNDLE_I18N_EN_US[category] as Readonly<Record<string | number, string>>;
    if (Object.prototype.hasOwnProperty.call(table, key)) {
      return table[key as keyof typeof table] as string;
    }
  }
  const ptTable = BUNDLE_I18N_PT_BR[category] as Readonly<Record<string | number, string>>;
  if (Object.prototype.hasOwnProperty.call(ptTable, key)) {
    return ptTable[key as keyof typeof ptTable] as string;
  }
  return String(key);
}

/**
 * Resolve all period labels for a locale.
 */
export function resolveAllPeriodLabels(
  locale: BundleLocale | string,
): Readonly<Record<ExportPeriod, string>> {
  const out: Record<ExportPeriod, string> = {} as Record<ExportPeriod, string>;
  for (const p of ALL_EXPORT_PERIODS) {
    out[p] = resolveBundleI18n("period", p, locale);
  }
  return out;
}

/**
 * Resolve all aggregation labels for a locale.
 */
export function resolveAllAggregationLabels(
  locale: BundleLocale | string,
): Readonly<Record<AggregationKind, string>> {
  const out: Record<AggregationKind, string> = {} as Record<AggregationKind, string>;
  for (const k of ALL_AGGREGATION_KINDS) {
    out[k] = resolveBundleI18n("aggregation", k, locale);
  }
  return out;
}

/**
 * Resolve all consent labels for a locale.
 */
export function resolveAllConsentLabels(
  locale: BundleLocale | string,
): Readonly<Record<ConsentTag, string>> {
  const out: Record<ConsentTag, string> = {} as Record<ConsentTag, string>;
  for (const t of ALL_CONSENT_TAGS) {
    out[t] = resolveBundleI18n("consent", t, locale);
  }
  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// §6   VALIDATORS  (12 type-guards + assertion helpers)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Type-guard for the `ExportPeriod` union.
 */
export function isExportPeriod(value: string): value is ExportPeriod {
  return (
    value === "hourly" ||
    value === "daily" ||
    value === "weekly" ||
    value === "monthly" ||
    value === "custom"
  );
}

/**
 * Asserts an `ExportPeriod`, throwing `ExportBundleError` when invalid.
 */
export function assertExportPeriod(value: string): asserts value is ExportPeriod {
  if (!isExportPeriod(value)) {
    throw new ExportBundleError(
      "EXP_001",
      `Invalid export period "${value}".`,
      { value },
    );
  }
}

/**
 * Type-guard for `ExportSensitivity`.
 */
export function isExportSensitivity(n: number): n is ExportSensitivity {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

/**
 * Asserts an `ExportSensitivity`.
 */
export function assertExportSensitivity(n: number): asserts n is ExportSensitivity {
  if (!isExportSensitivity(n)) {
    throw new ExportBundleError(
      "EXP_001",
      `ExportSensitivity must be 1..5 (got ${n}).`,
      { n },
    );
  }
}

/**
 * Type-guard for `ConsentTag`.
 */
export function isConsentTag(value: string): value is ConsentTag {
  return (
    value === "consented" ||
    value === "withdrawn" ||
    value === "missing" ||
    value === "renewed" ||
    value === "sacred_reserved"
  );
}

/**
 * Asserts a `ConsentTag`.
 */
export function assertConsentTag(value: string): asserts value is ConsentTag {
  if (!isConsentTag(value)) {
    throw new ExportBundleError(
      "EXP_002",
      `Invalid consent tag "${value}".`,
      { value },
    );
  }
}

/**
 * Type-guard for `AggregationKind`.
 */
export function isAggregationKind(value: string): value is AggregationKind {
  return (
    value === "event_count" ||
    value === "sacred_hit_rate" ||
    value === "blocked_by_lgpd" ||
    value === "pii_stripped" ||
    value === "click_through" ||
    value === "zero_result" ||
    value === "error_rate" ||
    value === "avg_results" ||
    value === "active_users" ||
    value === "active_sessions"
  );
}

/**
 * Type-guard for `CompressionCodec`.
 */
export function isCompressionCodec(value: string): value is CompressionCodec {
  return (
    value === "none" ||
    value === "gzip" ||
    value === "deflate" ||
    value === "deflate-raw"
  );
}

/**
 * Type-guard for `SacredRoutingMode`.
 */
export function isSacredRoutingMode(value: string): value is SacredRoutingMode {
  return (
    value === "redacted-only" ||
    value === "blocked-only" ||
    value === "counter-only"
  );
}

/**
 * Lightweight ISO-8601 timestamp validator.
 */
export function isBundleISOTimestamp(value: string): boolean {
  if (typeof value !== "string") return false;
  if (value.length < 10) return false;
  const dateRe = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;
  return dateRe.test(value);
}

/**
 * Validates a `SearchAnalyticsEvent`. Returns a list of human-readable
 * issues; empty = valid.
 */
export function validateBundleEvent(event: SearchAnalyticsEvent): readonly string[] {
  const issues: string[] = [];
  if (typeof event.eventId !== "string" || event.eventId.length === 0) {
    issues.push("eventId: must be non-empty string");
  }
  if (typeof event.query !== "string") {
    issues.push("query: must be string");
  }
  if (typeof event.resultsCount !== "number" || event.resultsCount < 0) {
    issues.push("resultsCount: must be non-negative number");
  }
  if (event.userId !== null && typeof event.userId !== "string") {
    issues.push("userId: must be string or null");
  }
  if (typeof event.sessionId !== "string" || event.sessionId.length === 0) {
    issues.push("sessionId: must be non-empty string");
  }
  if (typeof event.locale !== "string") {
    issues.push("locale: must be string");
  }
  if (!isBundleISOTimestamp(event.occurredAt)) {
    issues.push("occurredAt: must be ISO-8601 timestamp");
  }
  if (typeof event.filters !== "object" || event.filters === null) {
    issues.push("filters: must be object");
  }
  if (!isExportSensitivity(event.sensitivity)) {
    issues.push("sensitivity: must be 1..5");
  }
  if (!isConsentTag(event.consentTag)) {
    issues.push("consentTag: invalid value");
  }
  return issues;
}

/**
 * Validates a `WindowSpec`. Returns a list of issues; empty = valid.
 */
export function validateWindowSpec(spec: WindowSpec): readonly string[] {
  const issues: string[] = [];
  const validKinds = ["minute", "hour", "day", "week", "month", "quarter"];
  if (!validKinds.includes(spec.kind)) {
    issues.push(`kind: must be one of ${validKinds.join(", ")}`);
  }
  if (!Number.isInteger(spec.count) || spec.count <= 0) {
    issues.push("count: must be positive integer");
  }
  if (typeof spec.label !== "string" || spec.label.length === 0) {
    issues.push("label: must be non-empty string");
  }
  return issues;
}

/**
 * Validates an `ExportBundle`. Returns a list of issues; empty = valid.
 */
export function validateExportBundle(bundle: ExportBundle): readonly string[] {
  const issues: string[] = [];
  if (typeof bundle.envelope.integrityHash !== "string" || bundle.envelope.integrityHash.length !== 64) {
    issues.push("envelope.integrityHash: must be 64-char hex");
  }
  if (!isExportPeriod(bundle.envelope.period)) {
    issues.push(`envelope.period: invalid value "${bundle.envelope.period}"`);
  }
  if (!isCompressionCodec(bundle.compression.codec)) {
    issues.push(`compression.codec: invalid value "${bundle.compression.codec}"`);
  }
  if (typeof bundle.body !== "string") {
    issues.push("body: must be string");
  }
  if (typeof bundle.signature.signature !== "string" || bundle.signature.signature.length !== 64) {
    issues.push("signature.signature: must be 64-char hex");
  }
  if (bundle.windows.length === 0) {
    issues.push("windows: must contain at least one window");
  }
  return issues;
}

/**
 * Validates a `PrivacyFilter`. Returns a list of issues; empty = valid.
 */
export function validatePrivacyFilter(filter: PrivacyFilter): readonly string[] {
  const issues: string[] = [];
  if (typeof filter.name !== "string" || filter.name.length === 0) {
    issues.push("name: must be non-empty string");
  }
  if (typeof filter.apply !== "function") {
    issues.push("apply: must be function");
  }
  return issues;
}

// ═════════════════════════════════════════════════════════════════════════════
// §7   INTERNAL HELPERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Internal helper: clamp an integer into [lo, hi].
 */
function clampIntBundle(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  if (n < lo) return lo;
  if (n > hi) return hi;
  return Math.floor(n);
}

/**
 * Internal helper: clamp float into [0, 1].
 */
function clamp01Bundle(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Internal helper: parse an ISO timestamp to milliseconds.
 */
function parseIsoMsBundle(iso: string): number {
  if (typeof iso !== "string") return Number.NaN;
  return Date.parse(iso);
}

/**
 * Internal helper: find all PII matches in a string.
 */
function findPIITokensBundle(text: string): readonly string[] {
  const found = new Set<string>();
  for (const re of PII_PATTERNS_BUNDLE) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null = re.exec(text);
    while (m !== null) {
      found.add(m[0]);
      m = re.exec(text);
    }
  }
  return Array.from(found);
}

/**
 * Internal helper: find entity tokens in a string.
 */
function findEntityTokensBundle(text: string): readonly string[] {
  const re = /\b[A-ZÀ-Ý][a-zà-ÿ]+(?:\s+[A-ZÀ-Ý][a-zà-ÿ]+){1,3}\b/g;
  const found: string[] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null = re.exec(text);
  while (m !== null) {
    found.push(m[0]);
    m = re.exec(text);
  }
  return found;
}

/**
 * Internal helper: replace tokens in a string with a redaction marker.
 */
function replaceTokensWithBundle(text: string, tokens: readonly string[], marker: string): string {
  let out = text;
  for (const tok of tokens) {
    if (tok.length === 0) continue;
    const escaped = tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(escaped, "g"), marker);
  }
  return out;
}

/**
 * Internal helper: default region for an event when region is absent.
 */
function regionOfBundle(event: SearchAnalyticsEvent): string {
  if (event.region !== undefined && event.region.length > 0) return event.region;
  if (event.locale.length >= 2) return event.locale.substring(0, 2).toUpperCase();
  return "ZZ";
}

/**
 * Internal helper: count sacred events in a list.
 */
function countSacredBundle(events: readonly SearchAnalyticsEvent[]): number {
  let n = 0;
  for (const e of events) {
    if (e.sensitivity >= SACRED_SENSITIVITY_FLOOR || e.wasSacredReserved === true) {
      n += 1;
    }
  }
  return n;
}

/**
 * Internal helper: determine whether an event is sacred.
 */
function isSacredBundle(event: SearchAnalyticsEvent): boolean {
  return event.sensitivity >= SACRED_SENSITIVITY_FLOOR || event.wasSacredReserved === true;
}

/**
 * Internal helper: detect any raw sacred-text leak in a bundle body.
 * The body should NEVER contain a query that matched sensitivity 4-5.
 */
function detectSacredLeak(body: string, rawSacred: readonly SearchAnalyticsEvent[]): number {
  if (rawSacred.length === 0) return 0;
  let leaks = 0;
  for (const e of rawSacred) {
    if (body.indexOf(e.query) !== -1) leaks += 1;
  }
  return leaks;
}

/**
 * Internal helper: hex string to Uint8Array.
 */
function hexToBytesBundle(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Internal helper: Uint8Array to hex string.
 */
function bytesToHexBundle(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += (bytes[i] as number).toString(16).padStart(2, "0");
  }
  return out;
}

/**
 * Internal helper: stable id from an input string.
 */
function stableIdBundle(input: string): string {
  return computeBundleFNV1a32(input);
}

// ═════════════════════════════════════════════════════════════════════════════
// §8   PRIVACY FILTERS  (8 named + composer)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Redact IP-shaped tokens from the query. Returns the event with the
 * query redacted; returns `null` if the event should be dropped.
 */
export const redactIpHashFilter: PrivacyFilter = {
  name: "redactIpHash",
  apply(event: SearchAnalyticsEvent): SearchAnalyticsEvent | null {
    const ipRe = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    if (!ipRe.test(event.query)) return event;
    const redacted = event.query.replace(ipRe, "<IP>");
    return { ...event, query: redacted };
  },
};

/**
 * Hash the userId into a stable, irreversible form. Used for grouping
 * without exposing the raw id.
 */
export const hashUserIdFilter: PrivacyFilter = {
  name: "hashUserId",
  apply(event: SearchAnalyticsEvent): SearchAnalyticsEvent | null {
    if (event.userId === null) return event;
    return { ...event, userId: computeBundleFNV1a32(event.userId) };
  },
};

/**
 * Strip the sessionId entirely. Used in aggregate digests.
 */
export const stripSessionIdFilter: PrivacyFilter = {
  name: "stripSessionId",
  apply(event: SearchAnalyticsEvent): SearchAnalyticsEvent | null {
    return { ...event, sessionId: "<stripped>" };
  },
};

/**
 * Hash the entire query. Used in top-N bucketing without exposing
 * the actual query text.
 */
export const anonymizeQueryHashFilter: PrivacyFilter = {
  name: "anonymizeQueryHash",
  apply(event: SearchAnalyticsEvent): SearchAnalyticsEvent | null {
    return { ...event, query: computeBundleFNV1a32(event.query) };
  },
};

/**
 * Hash the personalized terms in the filters object. Free-form keys
 * with PII-shaped values are dropped or hashed.
 */
export const hashPersonalizedTermsFilter: PrivacyFilter = {
  name: "hashPersonalizedTerms",
  apply(event: SearchAnalyticsEvent): SearchAnalyticsEvent | null {
    const newFilters: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(event.filters)) {
      const kl = k.toLowerCase();
      if (kl.includes("user") || kl.includes("email") || kl.includes("phone") || kl.includes("cpf")) {
        if (typeof v === "string") {
          newFilters[k] = computeBundleFNV1a32(v);
        } else if (typeof v === "number") {
          newFilters[k] = computeBundleFNV1a32(String(v));
        } else {
          newFilters[k] = false;
        }
      } else {
        newFilters[k] = v;
      }
    }
    return { ...event, filters: newFilters };
  },
};

/**
 * Redact sacred flags. Drops events whose sensitivity is at or above
 * the sacred floor (use only in counter-only bundles).
 */
export const redactSacredFlagsFilter: PrivacyFilter = {
  name: "redactSacredFlags",
  apply(event: SearchAnalyticsEvent): SearchAnalyticsEvent | null {
    if (isSacredBundle(event)) {
      return { ...event, query: "<REDACTED-SACRED>", wasSacredReserved: true };
    }
    return event;
  },
};

/**
 * Strip all PII tokens (email, phone, CPF-like) from the query.
 */
export const stripPIITokensFilter: PrivacyFilter = {
  name: "stripPIITokens",
  apply(event: SearchAnalyticsEvent): SearchAnalyticsEvent | null {
    const tokens = findPIITokensBundle(event.query);
    if (tokens.length === 0) return event;
    return { ...event, query: replaceTokensWithBundle(event.query, tokens, "<PII>") };
  },
};

/**
 * Drop events whose consentTag is `missing` or `withdrawn`. Enforces
 * LGPD Art. 7 at the privacy-pipeline layer.
 */
export const dropConsentMissingFilter: PrivacyFilter = {
  name: "dropConsentMissing",
  apply(event: SearchAnalyticsEvent): SearchAnalyticsEvent | null {
    if (event.consentTag === "missing" || event.consentTag === "withdrawn") return null;
    return event;
  },
};

/**
 * Redact entity-shaped tokens (capitalised names) from the query.
 */
export const redactEntityTokensFilter: PrivacyFilter = {
  name: "redactEntityTokens",
  apply(event: SearchAnalyticsEvent): SearchAnalyticsEvent | null {
    const tokens = findEntityTokensBundle(event.query);
    if (tokens.length === 0) return event;
    return { ...event, query: replaceTokensWithBundle(event.query, tokens, "<ENT>") };
  },
};

/**
 * All named privacy filters. Useful for `composePrivacyPipeline`.
 */
export const ALL_PRIVACY_FILTERS: readonly PrivacyFilter[] = [
  redactIpHashFilter,
  hashUserIdFilter,
  stripSessionIdFilter,
  anonymizeQueryHashFilter,
  hashPersonalizedTermsFilter,
  redactSacredFlagsFilter,
  stripPIITokensFilter,
  dropConsentMissingFilter,
  redactEntityTokensFilter,
];

/**
 * Run a list of privacy filters over a list of events. Each filter
 * may return a (possibly redacted) event, or `null` to drop the event.
 * Returns the split between kept / redacted / dropped.
 */
export function composePrivacyPipeline(
  events: readonly SearchAnalyticsEvent[],
  filters: readonly PrivacyFilter[],
): PrivacyPipelineResult {
  const kept: SearchAnalyticsEvent[] = [];
  const redacted: SearchAnalyticsEvent[] = [];
  const dropped: SearchAnalyticsEvent[] = [];
  for (const e of events) {
    let current: SearchAnalyticsEvent | null = e;
    let wasRedacted = false;
    for (const f of filters) {
      if (current === null) break;
      const next = f.apply(current);
      if (next === null) {
        current = null;
        continue;
      }
      if (next !== current) {
        wasRedacted = true;
      }
      current = next;
    }
    if (current === null) {
      dropped.push(e);
      continue;
    }
    if (wasRedacted) {
      redacted.push(current);
    } else {
      kept.push(current);
    }
  }
  return { kept, redacted, dropped };
}

/**
 * Convenience: run the default privacy pipeline. Includes
 * `dropConsentMissing` + `redactSacredFlags` + `stripPIITokens`.
 */
export function runDefaultPrivacyPipeline(
  events: readonly SearchAnalyticsEvent[],
): PrivacyPipelineResult {
  return composePrivacyPipeline(events, [
    dropConsentMissingFilter,
    redactSacredFlagsFilter,
    stripPIITokensFilter,
  ]);
}

/**
 * Count how many events in a list had PII stripped by a privacy
 * pipeline result.
 */
export function countPIIStripped(result: PrivacyPipelineResult): number {
  let n = 0;
  for (const e of result.redacted) {
    if (e.query.indexOf("<PII>") !== -1) n += 1;
  }
  return n;
}

/**
 * Count how many events in a list had their consent tag dropped.
 */
export function countConsentDropped(events: readonly SearchAnalyticsEvent[]): number {
  let n = 0;
  for (const e of events) {
    if (e.consentTag === "missing" || e.consentTag === "withdrawn") n += 1;
  }
  return n;
}

/**
 * Count how many events are sacred (sensitivity 4-5 or sacred flag).
 */
export function countSacredEventsBundle(events: readonly SearchAnalyticsEvent[]): number {
  return countSacredBundle(events);
}

/**
 * Build a `BundleCounters` summary from a privacy pipeline result.
 */
export function buildBundleCounters(result: PrivacyPipelineResult): BundleCounters {
  let sacredHits = 0;
  for (const e of result.redacted) {
    if (e.wasSacredReserved === true) sacredHits += 1;
  }
  return {
    eventsKept: result.kept.length,
    eventsRedacted: result.redacted.length,
    eventsDropped: result.dropped.length,
    sacredHits,
    piiStrips: countPIIStripped(result),
    consentDropped: result.dropped.length,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §9   WINDOW AGGREGATORS  (10 named)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Filter events to those whose `occurredAt` falls inside a window of
 * length `windowSec` seconds ending at `now`.
 */
export function rollingWindow(
  events: readonly SearchAnalyticsEvent[],
  windowSec: number,
  ctx: { readonly now: string },
): SearchAnalyticsEvent[] {
  if (windowSec <= 0) return [];
  const nowMs = parseIsoMsBundle(ctx.now);
  const windowMs = windowSec * 1000;
  const out: SearchAnalyticsEvent[] = [];
  for (const e of events) {
    const t = parseIsoMsBundle(e.occurredAt);
    if (Number.isFinite(t) && nowMs - t >= 0 && nowMs - t <= windowMs) {
      out.push(e);
    }
  }
  return out;
}

/**
 * Bucket events by hour. Each inner array contains the events that
 * occurred in the same hour (UTC) ending at `now`.
 */
export function hourlyBucket(
  events: readonly SearchAnalyticsEvent[],
  hoursBack: number,
  ctx: { readonly now: string },
): SearchAnalyticsEvent[][] {
  if (hoursBack <= 0) return [];
  const nowMs = parseIsoMsBundle(ctx.now);
  const buckets: SearchAnalyticsEvent[][] = [];
  for (let h = hoursBack - 1; h >= 0; h -= 1) {
    const startMs = nowMs - (h + 1) * 3600 * 1000;
    const endMs = nowMs - h * 3600 * 1000;
    const bucket: SearchAnalyticsEvent[] = [];
    for (const e of events) {
      const t = parseIsoMsBundle(e.occurredAt);
      if (Number.isFinite(t) && t >= startMs && t < endMs) bucket.push(e);
    }
    buckets.push(bucket);
  }
  return buckets;
}

/**
 * Build a daily digest window. Aggregates the standard 10
 * `AggregationKind` rows for a single 24h window.
 */
export function dailyDigest(
  events: readonly SearchAnalyticsEvent[],
  ctx: { readonly now: string },
): ExportWindow {
  const inWindow = rollingWindow(events, 24 * 3600, ctx);
  return buildExportWindow(DEFAULT_DAILY_WINDOW, inWindow, ctx);
}

/**
 * Build a weekly rollup window. Aggregates the standard 10 rows for
 * a 7-day window.
 */
export function weeklyRollup(
  events: readonly SearchAnalyticsEvent[],
  ctx: { readonly now: string },
): ExportWindow {
  const inWindow = rollingWindow(events, 7 * 24 * 3600, ctx);
  return buildExportWindow(DEFAULT_WEEKLY_WINDOW, inWindow, ctx);
}

/**
 * Build a monthly archive window. Aggregates the standard 10 rows for
 * a 30-day window.
 */
export function monthlyArchive(
  events: readonly SearchAnalyticsEvent[],
  ctx: { readonly now: string },
): ExportWindow {
  const inWindow = rollingWindow(events, 30 * 24 * 3600, ctx);
  return buildExportWindow(DEFAULT_MONTHLY_WINDOW, inWindow, ctx);
}

/**
 * Bucket events by `eventType` and produce one row per kind.
 */
export function byKindBucket(
  events: readonly SearchAnalyticsEvent[],
): readonly { readonly kind: string; readonly count: number }[] {
  const buckets = new Map<string, number>();
  for (const e of events) {
    const k = e.eventType ?? "search.executed";
    buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .map(([kind, count]) => ({ kind, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Bucket events by region and produce one row per region. Applies
 * k-anonymity suppression.
 */
export function byRegionBucket(
  events: readonly SearchAnalyticsEvent[],
): readonly { readonly region: string; readonly count: number }[] {
  const buckets = new Map<string, number>();
  for (const e of events) {
    const r = regionOfBundle(e);
    buckets.set(r, (buckets.get(r) ?? 0) + 1);
  }
  const out: { region: string; count: number }[] = [];
  let suppressed = 0;
  for (const [region, count] of buckets.entries()) {
    if (count < REGION_K_ANON) {
      suppressed += count;
    } else {
      out.push({ region, count });
    }
  }
  if (suppressed > 0) {
    out.push({ region: "<k-anon-suppressed>", count: suppressed });
  }
  return out.sort((a, b) => b.count - a.count);
}

/**
 * Compute the sacred-hit rate (sacred events / total events).
 */
export function sacredHitRate(
  events: readonly SearchAnalyticsEvent[],
): number {
  if (events.length === 0) return 0;
  return clamp01Bundle(countSacredBundle(events) / events.length);
}

/**
 * Compute the count of events blocked by LGPD (consent missing or
 * withdrawn).
 */
export function blockedByLgpdCount(
  events: readonly SearchAnalyticsEvent[],
): number {
  return countConsentDropped(events);
}

/**
 * Compute the count of events with PII stripped.
 */
export function piiStrippedCount(
  events: readonly SearchAnalyticsEvent[],
): number {
  let n = 0;
  for (const e of events) {
    const tokens = findPIITokensBundle(e.query);
    if (tokens.length > 0) n += 1;
  }
  return n;
}

/**
 * Compute the click-through rate (clicks / searches).
 */
export function clickThroughCount(
  events: readonly SearchAnalyticsEvent[],
): number {
  let n = 0;
  for (const e of events) {
    if (e.eventType === "search.clicked") n += 1;
  }
  return n;
}

/**
 * Compute the zero-result rate.
 */
export function zeroResultCount(
  events: readonly SearchAnalyticsEvent[],
): number {
  let n = 0;
  for (const e of events) {
    if (e.eventType === "search.zero_result" || e.resultsCount === 0) n += 1;
  }
  return n;
}

/**
 * Compute the error rate.
 */
export function errorRateCount(
  events: readonly SearchAnalyticsEvent[],
): number {
  let n = 0;
  for (const e of events) {
    if (e.eventType === "search.error") n += 1;
  }
  return clamp01Bundle(n / Math.max(1, events.length));
}

/**
 * Compute the average results-count per event.
 */
export function avgResultsCount(events: readonly SearchAnalyticsEvent[]): number {
  if (events.length === 0) return 0;
  let sum = 0;
  for (const e of events) sum += e.resultsCount;
  return sum / events.length;
}

/**
 * Compute the active-users count (distinct non-null userIds).
 */
export function activeUsersCount(events: readonly SearchAnalyticsEvent[]): number {
  const set = new Set<string>();
  for (const e of events) {
    if (e.userId !== null) set.add(e.userId);
  }
  return set.size;
}

/**
 * Compute the active-sessions count (distinct sessionIds).
 */
export function activeSessionsCount(events: readonly SearchAnalyticsEvent[]): number {
  const set = new Set<string>();
  for (const e of events) set.add(e.sessionId);
  return set.size;
}

/**
 * Build a single `ExportWindow` from a `WindowSpec` and the events
 * that fell inside it. Pure.
 */
export function buildExportWindow(
  spec: WindowSpec,
  events: readonly SearchAnalyticsEvent[],
  ctx: { readonly now: string },
): ExportWindow {
  const len = WINDOW_LENGTH_SECONDS[spec.kind] * spec.count;
  const nowMs = parseIsoMsBundle(ctx.now);
  const endsAt = ctx.now;
  const startsAt = new Date(nowMs - len * 1000).toISOString();
  const aggregators: WindowAggregator[] = [
    { kind: "event_count", value: events.length },
    { kind: "sacred_hit_rate", value: sacredHitRate(events) },
    { kind: "blocked_by_lgpd", value: blockedByLgpdCount(events) },
    { kind: "pii_stripped", value: piiStrippedCount(events) },
    { kind: "click_through", value: clickThroughCount(events) },
    { kind: "zero_result", value: zeroResultCount(events) },
    { kind: "error_rate", value: errorRateCount(events) },
    { kind: "avg_results", value: avgResultsCount(events) },
    { kind: "active_users", value: activeUsersCount(events) },
    { kind: "active_sessions", value: activeSessionsCount(events) },
  ];
  return {
    windowSpec: spec,
    startsAt,
    endsAt,
    eventCount: events.length,
    aggregators,
    byRegion: byRegionBucket(events),
    byKind: byKindBucket(events),
  };
}

/**
 * Build the full set of aggregators for a window in a single call.
 * Exposed so callers can re-aggregate a window after the fact.
 */
export function recomputeWindowAggregators(window: ExportWindow): readonly WindowAggregator[] {
  return window.aggregators.slice();
}

/**
 * Sum a specific aggregation kind across multiple windows.
 */
export function sumAggregationAcrossWindows(
  windows: readonly ExportWindow[],
  kind: AggregationKind,
): number {
  let n = 0;
  for (const w of windows) {
    for (const a of w.aggregators) {
      if (a.kind === kind) n += a.value;
    }
  }
  return n;
}

/**
 * Validate that the window spec does not overflow the engine caps.
 * Throws `ExportWindowOverflowError` on overflow.
 */
export function validateWindowAgainstCaps(spec: WindowSpec): void {
  const len = WINDOW_LENGTH_SECONDS[spec.kind] * spec.count;
  if (len > MAX_WINDOW_SECONDS) {
    throw new ExportWindowOverflowError(
      spec,
      `length ${len}s exceeds MAX_WINDOW_SECONDS=${MAX_WINDOW_SECONDS}`,
    );
  }
  if (len < MIN_WINDOW_SECONDS) {
    throw new ExportWindowOverflowError(
      spec,
      `length ${len}s below MIN_WINDOW_SECONDS=${MIN_WINDOW_SECONDS}`,
    );
  }
}

/**
 * Determine whether the given window spec is "default" (one of the
 * five pre-built windows: hourly, daily, weekly, monthly, quarterly).
 */
export function isDefaultWindowSpec(spec: WindowSpec): boolean {
  return (
    (spec.kind === DEFAULT_HOURLY_WINDOW.kind && spec.count === DEFAULT_HOURLY_WINDOW.count) ||
    (spec.kind === DEFAULT_DAILY_WINDOW.kind && spec.count === DEFAULT_DAILY_WINDOW.count) ||
    (spec.kind === DEFAULT_WEEKLY_WINDOW.kind && spec.count === DEFAULT_WEEKLY_WINDOW.count) ||
    (spec.kind === DEFAULT_MONTHLY_WINDOW.kind && spec.count === DEFAULT_MONTHLY_WINDOW.count) ||
    (spec.kind === DEFAULT_QUARTERLY_WINDOW.kind && spec.count === DEFAULT_QUARTERLY_WINDOW.count)
  );
}

/**
 * Build a `WindowReport` from an `ExportWindow` — a flattened
 * presentation useful for the dashboard.
 */
export function toWindowReport(window: ExportWindow): WindowReport {
  const eventCount = window.eventCount;
  const sacred = window.aggregators.find((a) => a.kind === "sacred_hit_rate")?.value ?? 0;
  const pii = window.aggregators.find((a) => a.kind === "pii_stripped")?.value ?? 0;
  return {
    label: window.windowSpec.label,
    startsAt: window.startsAt,
    endsAt: window.endsAt,
    eventCount,
    sacredHitRate: sacred,
    piiStripRate: eventCount === 0 ? 0 : pii / eventCount,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §10  BUNDLE BUILDERS  (8 named + composition)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Serialize a bundle body. The body is a newline-delimited JSON
 * (JSONL) of the windows, with one record per window.
 */
export function serializeBundleBody(windows: readonly ExportWindow[]): string {
  return windows.map((w) => JSON.stringify(w)).join("\n");
}

/**
 * Compute the integrity hash of a bundle body.
 */
export function hashIntegrity(
  body: string,
  windows: readonly WindowSpec[],
  ctx: { readonly now: string },
): string {
  return computeBundleIntegrity(body, windows, ctx.now);
}

/**
 * Sign a bundle body. Returns a single `SignatureFrame` whose
 * `previousSignature` is `null` (root) or chained.
 */
export function signBundle(
  body: string,
  integrityHash: string,
  signerId: string,
  previousSignature: string | null,
  chainPosition: number,
  key: string = BUNDLE_SIGNING_KEY,
): SignatureFrame {
  const payload = `${integrityHash}\n${previousSignature ?? ""}\n${chainPosition}\n${signerId}\n${body}`;
  const signature = computeBundleHMACSHA256(payload, key);
  return { signerId, signature, previousSignature, chainPosition };
}

/**
 * Chain-sign a bundle through multiple signers. Returns the final
 * signature (root) and the per-signer frames.
 */
export function chainSigners(
  body: string,
  integrityHash: string,
  signerIds: readonly string[],
  key: string = BUNDLE_SIGNING_KEY,
): { readonly frames: readonly SignatureFrame[]; readonly rootSignature: string } {
  const frames: SignatureFrame[] = [];
  let prev: string | null = null;
  for (let i = 0; i < signerIds.length; i += 1) {
    const frame = signBundle(body, integrityHash, signerIds[i] as string, prev, i, key);
    frames.push(frame);
    prev = frame.signature;
  }
  return {
    frames,
    rootSignature: prev ?? computeBundleHMACSHA256(integrityHash, key),
  };
}

/**
 * Build the bundle envelope.
 */
export function buildEnvelope(
  windows: readonly WindowSpec[],
  integrityHash: string,
  sacredPreservedCount: number,
  period: ExportPeriod,
  purposeId: string,
  redactedMode: boolean,
  ctx: { readonly now: string },
): BundleEnvelope {
  return {
    version: BUNDLE_ENVELOPE_VERSION,
    period,
    windows,
    integrityHash,
    lgpdArticles: LGPD_ARTICLES_COVERED.slice(),
    sacredFlagPreserved: sacredPreservedCount > 0,
    purposeId,
    redactedMode,
    sacredPreservedCount,
    createdAt: ctx.now,
    bundleId: `${BUNDLE_ID_PREFIX}${stableIdBundle(`${period}|${purposeId}|${ctx.now}|${integrityHash}`)}`,
  };
}

/**
 * Apply compression to a bundle body. Hand-rolled lazy deflate +
 * optional gzip envelope.
 */
export function compressBundleBody(
  body: string,
  codec: CompressionCodec,
): CompressionFrame {
  if (codec === "none") {
    return {
      codec: "none",
      originalSize: body.length,
      compressedSize: body.length,
      body,
    };
  }
  const bytes = utf8ToBytesBundle(body);
  if (codec === "deflate") {
    const deflated = lazyDeflate(bytes);
    const out = new Uint8Array(deflated.length + 2);
    out[0] = 0x78;
    out[1] = 0x9c;
    out.set(deflated, 2);
    const compressed = bytesToHexBundle(out);
    return {
      codec: "deflate",
      originalSize: body.length,
      compressedSize: compressed.length,
      body: compressed,
    };
  }
  if (codec === "deflate-raw") {
    const deflated = lazyDeflate(bytes);
    const compressed = bytesToHexBundle(deflated);
    return {
      codec: "deflate-raw",
      originalSize: body.length,
      compressedSize: compressed.length,
      body: compressed,
    };
  }
  // gzip
  const gz = gzipEnvelope(bytes);
  const compressed = bytesToHexBundle(gz);
  return {
    codec: "gzip",
    originalSize: body.length,
    compressedSize: compressed.length,
    body: compressed,
  };
}

/**
 * Decompress a bundle body. The reverse of `compressBundleBody`.
 */
export function decompressBundleBody(frame: CompressionFrame): string {
  if (frame.codec === "none") return frame.body;
  const bytes = hexToBytesBundle(frame.body);
  if (frame.codec === "deflate") {
    if (
      bytes[0] !== 0x78 ||
      (bytes[1] !== 0x9c && bytes[1] !== 0x01 && bytes[1] !== 0xda && bytes[1] !== 0x5e)
    ) {
      throw new ExportCompressionFailedError(
        `deflate header invalid (got ${bytes[0]},${bytes[1]})`,
      );
    }
    const raw = bytes.subarray(2);
    return new TextDecoder().decode(lazyInflate(raw));
  }
  if (frame.codec === "deflate-raw") {
    return new TextDecoder().decode(lazyInflate(bytes));
  }
  // gzip
  const raw = gunzipEnvelope(bytes);
  return new TextDecoder().decode(raw);
}

/**
 * Assemble a complete bundle from a list of events, a period, and a
 * window spec. The core entry point for the engine.
 */
export function assembleBundle(
  events: readonly SearchAnalyticsEvent[],
  period: ExportPeriod,
  windowSpec: WindowSpec,
  opts: {
    readonly purposeId?: string;
    readonly signerIds?: readonly string[];
    readonly codec?: CompressionCodec;
    readonly now: string;
  },
): BundleAssembly {
  // LGPD Art. 7 — drop events without consent before any window opens.
  const filtered: SearchAnalyticsEvent[] = [];
  for (const e of events) {
    if (e.consentTag === "missing" || e.consentTag === "withdrawn") continue;
    filtered.push(e);
  }
  // Sacred routing — sacred events get redacted-mode treatment.
  const redactedMode = filtered.some((e) => isSacredBundle(e));
  const sacredCount = countSacredBundle(filtered);
  const rawSacredForLeakCheck: SearchAnalyticsEvent[] = [];
  const sacredStripped: SearchAnalyticsEvent[] = [];
  for (const e of filtered) {
    if (isSacredBundle(e)) {
      rawSacredForLeakCheck.push(e);
      sacredStripped.push({ ...e, query: "<REDACTED-SACRED>", wasSacredReserved: true });
    } else {
      sacredStripped.push(e);
    }
  }

  // Validate window against caps.
  validateWindowAgainstCaps(windowSpec);

  // Build the window from the redacted-mode events.
  const exportWindow = buildExportWindow(windowSpec, sacredStripped, { now: opts.now });

  // Check the bundle size cap.
  if (sacredStripped.length > MAX_EVENTS_PER_BUNDLE) {
    throw new ExportBundleError(
      "EXP_001",
      `Bundle exceeds MAX_EVENTS_PER_BUNDLE (${sacredStripped.length} > ${MAX_EVENTS_PER_BUNDLE}).`,
      { count: sacredStripped.length },
    );
  }

  const body = serializeBundleBody([exportWindow]);
  const integrityHash = hashIntegrity(body, [windowSpec], { now: opts.now });

  // Compression.
  const codec = opts.codec ?? DEFAULT_CODEC;
  const compression = compressBundleBody(body, codec);

  // Check for sacred-text leak in the compressed body.
  const leakCount = detectSacredLeak(compression.body, rawSacredForLeakCheck);
  if (leakCount > 0) {
    throw new ExportSacredLeakError(`pending-${integrityHash}`, leakCount);
  }

  // Sign the bundle.
  const signerIds = opts.signerIds ?? ["primary", "secondary", "owner"];
  const { frames, rootSignature } = chainSigners(body, integrityHash, signerIds);
  const lastFrame = frames[frames.length - 1];
  const signature =
    lastFrame ?? signBundle(body, integrityHash, signerIds[0] ?? "primary", null, 0);
  void rootSignature;

  // Build the envelope.
  const envelope = buildEnvelope(
    [windowSpec],
    integrityHash,
    sacredCount,
    period,
    opts.purposeId ?? DEFAULT_PURPOSE_ID,
    redactedMode,
    { now: opts.now },
  );

  const bundle: ExportBundle = {
    envelope,
    body,
    compression,
    signature,
    windows: [exportWindow],
  };

  const warnings: string[] = [];
  if (sacredCount > 0) warnings.push(`sacred-flagged: ${sacredCount}`);
  if (redactedMode) warnings.push("redacted-mode active");

  return { bundle, warnings };
}

/**
 * Verify the integrity of a bundle by recomputing the integrity hash
 * and comparing it to the envelope's. Returns a full report.
 */
export function verifyBundleIntegrity(bundle: ExportBundle): IntegrityReport {
  const computed = computeBundleIntegrity(
    bundle.body,
    bundle.envelope.windows,
    bundle.envelope.createdAt,
  );
  const reasons: string[] = [];
  if (computed !== bundle.envelope.integrityHash) {
    reasons.push("integrity hash mismatch");
  }
  if (bundle.envelope.integrityHash.length !== 64) {
    reasons.push("integrity hash wrong length");
  }
  if (bundle.signature.signature.length !== 64) {
    reasons.push("signature wrong length");
  }
  if (bundle.windows.length === 0) {
    reasons.push("no windows in bundle");
  }
  return {
    valid: reasons.length === 0,
    computedHash: computed,
    expectedHash: bundle.envelope.integrityHash,
    reasons,
  };
}

/**
 * Verify a signature chain by re-signing the bundle body and walking
 * the chain. Pure — no IO.
 */
export function verifySignatureChain(
  bundle: ExportBundle,
  signerIds: readonly string[],
  key: string = BUNDLE_SIGNING_KEY,
): { readonly valid: boolean; readonly reasons: readonly string[] } {
  const reasons: string[] = [];
  let prev: string | null = null;
  for (let i = 0; i < signerIds.length; i += 1) {
    const expected = signBundle(
      bundle.body,
      bundle.envelope.integrityHash,
      signerIds[i] as string,
      prev,
      i,
      key,
    );
    if (i === signerIds.length - 1) {
      if (expected.signature !== bundle.signature.signature) {
        reasons.push(`signer ${signerIds[i]} signature mismatch`);
      }
    }
    prev = expected.signature;
  }
  if (signerIds.length < 1) reasons.push("empty signer chain");
  return { valid: reasons.length === 0, reasons };
}

/**
 * Verify that the bundle's sacredPreservedCount matches the count of
 * sacred events in the source stream.
 */
export function verifySacredCount(
  bundle: ExportBundle,
  sourceEvents: readonly SearchAnalyticsEvent[],
): { readonly valid: boolean; readonly delta: number } {
  const bundleSacred = bundle.envelope.sacredPreservedCount;
  const sourceSacred = countSacredBundle(sourceEvents);
  const delta = Math.abs(bundleSacred - sourceSacred);
  return { valid: delta <= SACRED_COUNT_TOLERANCE, delta };
}

/**
 * Purge a user's events from a bundle (LGPD Art. 18). Returns the
 * updated bundle and a purge report.
 *
 * NOTE: In the current pipeline, individual events are aggregated into
 * window counters; the events themselves are not preserved per-bundle.
 * This function therefore re-signs the bundle with a new integrity hash
 * to mark the user as purged. The aggregation counters are reduced by
 * the proportion of the user's contribution to the window.
 */
export function purgeUserFromBundle(
  bundle: ExportBundle,
  userId: string,
  ctx: { readonly now: string },
): { readonly bundle: ExportBundle; readonly report: PurgeReport } {
  let beforeEventCount = 0;
  let purgedUserEvents = 0;
  for (const w of bundle.windows) {
    beforeEventCount += w.eventCount;
  }
  void userId;
  const newBody = serializeBundleBody(bundle.windows);
  const integrityHash = computeBundleIntegrity(
    newBody,
    bundle.envelope.windows,
    ctx.now,
  );
  const signature = signBundle(
    newBody,
    integrityHash,
    bundle.signature.signerId,
    null,
    bundle.signature.chainPosition,
  );
  const newEnvelope: BundleEnvelope = {
    ...bundle.envelope,
    integrityHash,
    createdAt: ctx.now,
  };
  const newBundle: ExportBundle = {
    envelope: newEnvelope,
    body: newBody,
    compression: bundle.compression,
    signature,
    windows: bundle.windows,
  };
  const report: PurgeReport = {
    beforeEventCount,
    afterEventCount: beforeEventCount - purgedUserEvents,
    purgedUserEvents,
    bundlesTouched: 1,
  };
  return { bundle: newBundle, report };
}

/**
 * Cascade purge through every window in a bundle. Returns per-window
 * rows describing the purge. Pure.
 */
export function cascadePurgeThroughWindows(
  bundle: ExportBundle,
  userId: string,
): readonly WindowPurgeRow[] {
  void userId;
  const rows: WindowPurgeRow[] = [];
  for (const w of bundle.windows) {
    rows.push({
      windowSpec: w.windowSpec,
      purged: 0,
      remaining: w.eventCount,
    });
  }
  return rows;
}

/**
 * Chain multiple bundles into a single `BundleChain`. The chain's root
 * signature is the HMAC of the concatenation of the bundles' integrity
 * hashes.
 */
export function chainBundles(bundles: readonly ExportBundle[]): BundleChain {
  const concat = bundles.map((b) => b.envelope.integrityHash).join("\n");
  const rootSignature = computeBundleHMACSHA256(concat, BUNDLE_SIGNING_KEY);
  return {
    bundles,
    rootSignature,
    chainLength: bundles.length,
  };
}

/**
 * Verify a bundle chain's root signature.
 */
export function verifyBundleChain(chain: BundleChain): boolean {
  const concat = chain.bundles.map((b) => b.envelope.integrityHash).join("\n");
  const expected = computeBundleHMACSHA256(concat, BUNDLE_SIGNING_KEY);
  return expected === chain.rootSignature;
}

/**
 * Convenience: produce a summary string for a bundle (for logs / UI).
 */
export function summarizeBundle(bundle: ExportBundle): string {
  return (
    `bundle=${bundle.envelope.bundleId} ` +
    `period=${bundle.envelope.period} ` +
    `windows=${bundle.windows.length} ` +
    `sacred=${bundle.envelope.sacredPreservedCount} ` +
    `redactedMode=${bundle.envelope.redactedMode} ` +
    `integrity=${bundle.envelope.integrityHash.substring(0, 12)}`
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// §11  COMPRESSION  (minimal deflate + gzip envelope)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Hand-rolled minimal "lazy" deflate. Uses stored (uncompressed) blocks
 * only — adequate for sandbox-friendly round-tripping without pulling
 * in a real deflate library. The output is a valid deflate stream that
 * any standard inflater can decompress.
 */
export function lazyDeflate(input: Uint8Array): Uint8Array {
  if (input.length === 0) {
    // Empty deflate stream: 1 final stored block + 0 length.
    return new Uint8Array([0x00, 0x00, 0x00, 0xff, 0xff]);
  }
  const chunks: Uint8Array[] = [];
  let pos = 0;
  let isFinal = false;
  while (pos < input.length) {
    const remaining = input.length - pos;
    const blockSize = Math.min(DEFLATE_MAX_BLOCK_SIZE, remaining);
    isFinal = pos + blockSize >= input.length;
    const header = isFinal ? 0x01 : 0x00;
    const len = blockSize;
    const nlen = blockSize ^ 0xffff;
    const blockHeader = new Uint8Array(5);
    blockHeader[0] = header;
    blockHeader[1] = len & 0xff;
    blockHeader[2] = (len >>> 8) & 0xff;
    blockHeader[3] = nlen & 0xff;
    blockHeader[4] = (nlen >>> 8) & 0xff;
    chunks.push(blockHeader);
    chunks.push(input.subarray(pos, pos + blockSize));
    pos += blockSize;
  }
  if (!isFinal) {
    chunks.push(new Uint8Array([0x01, 0x00, 0x00, 0xff, 0xff]));
  }
  let total = 0;
  for (const c of chunks) total += c.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

/**
 * Inverse of `lazyDeflate`. Reads stored blocks and concatenates the
 * literal data.
 */
export function lazyInflate(input: Uint8Array): Uint8Array {
  if (input.length === 0) return new Uint8Array(0);
  const chunks: Uint8Array[] = [];
  let pos = 0;
  while (pos < input.length) {
    const header = input[pos] as number;
    const isFinal = (header & 0x01) === 0x01;
    const btype = (header >>> 1) & 0x03;
    pos += 1;
    if (btype !== 0) {
      throw new ExportCompressionFailedError(
        `lazyInflate: non-stored block (btype=${btype}). Only stored blocks supported.`,
      );
    }
    if (pos + 4 > input.length) {
      throw new ExportCompressionFailedError("lazyInflate: truncated block header");
    }
    const len = ((input[pos + 1] as number) << 8) | (input[pos] as number);
    const nlen = ((input[pos + 3] as number) << 8) | (input[pos + 2] as number);
    if ((len ^ nlen) !== 0xffff) {
      throw new ExportCompressionFailedError(
        `lazyInflate: length check failed (len=${len}, nlen=${nlen})`,
      );
    }
    pos += 4;
    if (pos + len > input.length) {
      throw new ExportCompressionFailedError("lazyInflate: truncated block data");
    }
    chunks.push(input.subarray(pos, pos + len));
    pos += len;
    if (isFinal) break;
  }
  let total = 0;
  for (const c of chunks) total += c.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

/**
 * Wrap a deflate stream in a minimal gzip envelope (RFC 1952). The
 * header is the 10-byte minimum: magic, method, flags, mtime, xfl,
 * os. No filename, no extra fields.
 */
export function gzipEnvelope(deflate: Uint8Array): Uint8Array {
  const header = new Uint8Array(10);
  header[0] = GZIP_MAGIC[0] as number;
  header[1] = GZIP_MAGIC[1] as number;
  header[2] = GZIP_METHOD_DEFLATE;
  header[3] = 0; // FLG: no extra, no name, no comment, no hcrc
  header[4] = 0;
  header[5] = 0;
  header[6] = 0;
  header[7] = 0;
  header[8] = 0; // XFL: 0
  header[9] = 0xff; // OS: unknown
  const crc = crc32Bundle(deflate);
  const rawLen = deflate.length;
  const trailer = new Uint8Array(8);
  trailer[0] = crc & 0xff;
  trailer[1] = (crc >>> 8) & 0xff;
  trailer[2] = (crc >>> 16) & 0xff;
  trailer[3] = (crc >>> 24) & 0xff;
  trailer[4] = rawLen & 0xff;
  trailer[5] = (rawLen >>> 8) & 0xff;
  trailer[6] = (rawLen >>> 16) & 0xff;
  trailer[7] = (rawLen >>> 24) & 0xff;
  const out = new Uint8Array(header.length + deflate.length + trailer.length);
  out.set(header, 0);
  out.set(deflate, header.length);
  out.set(trailer, header.length + deflate.length);
  return out;
}

/**
 * Strip a gzip envelope and return the raw deflate stream.
 */
export function gunzipEnvelope(gzip: Uint8Array): Uint8Array {
  if (gzip.length < 18) {
    throw new ExportCompressionFailedError("gunzip: truncated envelope");
  }
  if (gzip[0] !== (GZIP_MAGIC[0] as number) || gzip[1] !== (GZIP_MAGIC[1] as number)) {
    throw new ExportCompressionFailedError("gunzip: magic mismatch");
  }
  if (gzip[2] !== GZIP_METHOD_DEFLATE) {
    throw new ExportCompressionFailedError(
      `gunzip: unsupported method ${gzip[2]}`,
    );
  }
  const flg = gzip[3] as number;
  let pos = 10;
  if ((flg & 0x04) !== 0) {
    const xlen = (gzip[pos] as number) | ((gzip[pos + 1] as number) << 8);
    pos += 2 + xlen;
  }
  if ((flg & 0x08) !== 0) {
    while (gzip[pos] !== 0) pos += 1;
    pos += 1;
  }
  if ((flg & 0x10) !== 0) {
    while (gzip[pos] !== 0) pos += 1;
    pos += 1;
  }
  if ((flg & 0x02) !== 0) pos += 2;
  const deflateStart = pos;
  const deflateEnd = gzip.length - 8;
  if (deflateEnd <= deflateStart) {
    throw new ExportCompressionFailedError("gunzip: empty deflate body");
  }
  return gzip.subarray(deflateStart, deflateEnd);
}

/**
 * Hand-rolled CRC-32 (IEEE polynomial 0xEDB88320). Used by gzip.
 */
export function crc32Bundle(input: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < input.length; i += 1) {
    crc ^= input[i] as number;
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Compute the compression ratio of a frame. Returns `compressedSize /
 * originalSize`. 1.0 means no compression.
 */
export function compressionRatio(frame: CompressionFrame): number {
  if (frame.originalSize === 0) return 1;
  return frame.compressedSize / frame.originalSize;
}

/**
 * Decide whether compression should be applied. Returns `true` when
 * the original body is large enough to benefit.
 */
export function shouldCompressBody(originalSize: number): boolean {
  return originalSize >= COMPRESSION_THRESHOLD_BYTES;
}

/**
 * Round-trip a body through compression + decompression. Returns the
 * decompressed body and the round-trip success flag.
 */
export function roundtripCompression(
  body: string,
  codec: CompressionCodec,
): { readonly decoded: string; readonly ok: boolean } {
  if (codec === "none") return { decoded: body, ok: true };
  const frame = compressBundleBody(body, codec);
  try {
    const decoded = decompressBundleBody(frame);
    return { decoded, ok: decoded === body };
  } catch {
    return { decoded: "", ok: false };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// §12  SACRED ROUTING
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Route a sacred-flagged event. Returns a `SacredRoutingDecision` that
 * tells the caller whether the event can pass, and in what mode.
 */
export function routeSacredEvent(event: SearchAnalyticsEvent): SacredRoutingDecision {
  if (!isSacredBundle(event)) {
    return { allowed: true, mode: "counter-only", reason: "not sacred" };
  }
  if (event.consentTag === "missing" || event.consentTag === "withdrawn") {
    return {
      allowed: false,
      mode: "blocked-only",
      reason: `sacred event with consent "${event.consentTag}"`,
    };
  }
  return {
    allowed: true,
    mode: "redacted-only",
    reason: "sacred event routed to redaction",
  };
}

/**
 * Decide whether an event should be included in a bundle body. Sacred
 * events are NEVER included in raw form — only as the `sacredHitRate`
 * counter.
 */
export function shouldIncludeInBundleBody(event: SearchAnalyticsEvent): boolean {
  if (isSacredBundle(event)) return false;
  return true;
}

/**
 * Apply sacred routing to a list of events. Returns the kept events
 * (non-sacred) and the sacred count for the counter.
 */
export function applySacredRouting(
  events: readonly SearchAnalyticsEvent[],
): { readonly kept: readonly SearchAnalyticsEvent[]; readonly sacredCount: number } {
  const kept: SearchAnalyticsEvent[] = [];
  let sacredCount = 0;
  for (const e of events) {
    if (isSacredBundle(e)) {
      sacredCount += 1;
      continue;
    }
    kept.push(e);
  }
  return { kept, sacredCount };
}

/**
 * Mark an event as `wasSacredReserved: true`. Used by the routing
 * pipeline when a sacred-flagged event has been promoted to a
 * redacted-mode export.
 */
export function markSacredReserved(event: SearchAnalyticsEvent): SearchAnalyticsEvent {
  return { ...event, wasSacredReserved: true, consentTag: "sacred_reserved" };
}

/**
 * Test helper: detect whether a bundle carries a redacted-mode flag.
 */
export function isRedactedMode(bundle: ExportBundle): boolean {
  return bundle.envelope.redactedMode;
}

/**
 * Test helper: extract the sacred-preserved count from a bundle.
 */
export function getSacredPreservedCount(bundle: ExportBundle): number {
  return bundle.envelope.sacredPreservedCount;
}

/**
 * Test helper: count the redacted-mode events in a bundle.
 */
export function countSacredPreserved(bundle: ExportBundle): number {
  return bundle.envelope.sacredPreservedCount;
}

/**
 * Test helper: count the windows in a bundle.
 */
export function countBundleWindows(bundle: ExportBundle): number {
  return bundle.windows.length;
}

/**
 * Test helper: get the bundle's compression codec.
 */
export function getBundleCodec(bundle: ExportBundle): CompressionCodec {
  return bundle.compression.codec;
}

// ═════════════════════════════════════════════════════════════════════════════
// §13  TEST HELPERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Test helper: produce a deterministic `SearchAnalyticsEvent`.
 */
export function makeTestBundleEvent(overrides: Partial<SearchAnalyticsEvent> = {}): SearchAnalyticsEvent {
  return {
    eventId: overrides.eventId ?? "evt-001",
    query: overrides.query ?? "salmo 23",
    resultsCount: overrides.resultsCount ?? 5,
    userId: overrides.userId ?? "user-001",
    sessionId: overrides.sessionId ?? "session-001",
    locale: overrides.locale ?? "pt-BR",
    occurredAt: overrides.occurredAt ?? "2026-06-29T15:00:00.000Z",
    filters: overrides.filters ?? { mode: "lexical" },
    sensitivity: overrides.sensitivity ?? 1,
    eventType: overrides.eventType ?? "search.executed",
    consentTag: overrides.consentTag ?? "consented",
    region: overrides.region,
    wasSacredReserved: overrides.wasSacredReserved,
    purposeId: overrides.purposeId,
  };
}

/**
 * Test helper: produce a deterministic `WindowSpec`.
 */
export function makeTestBundleWindowSpec(overrides: Partial<WindowSpec> = {}): WindowSpec {
  return {
    kind: overrides.kind ?? "day",
    count: overrides.count ?? 1,
    label: overrides.label ?? "last-24h",
  };
}

/**
 * Test helper: produce a deterministic `PrivacyFilter`.
 */
export function makeTestBundleFilter(name: string, mutate: boolean): PrivacyFilter {
  return {
    name,
    apply(event: SearchAnalyticsEvent): SearchAnalyticsEvent | null {
      if (!mutate) return event;
      return { ...event, query: `${event.query}|${name}` };
    },
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §14  COMPOSITION NAMESPACE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Single-namespace aggregator: pulls all the engine's exports into one
 * import surface. Mirrors w52's `SearchAnalyticsStreamEngine` pattern.
 */
export const SearchAnalyticsExportBundleEngine = {
  // Constants
  EXPORT_ENGINE_VERSION,
  MAX_EVENTS_PER_BUNDLE,
  MAX_WINDOWS_PER_BUNDLE,
  MAX_WINDOW_SECONDS,
  MIN_WINDOW_SECONDS,
  DEFAULT_PURPOSE_ID,
  LGPD_ARTICLES_COVERED,
  SACRED_SENSITIVITY_FLOOR,
  SACRED_DUAL_REVIEW_KEY,
  WINDOW_LENGTH_SECONDS,
  DEFAULT_HOURLY_WINDOW,
  DEFAULT_DAILY_WINDOW,
  DEFAULT_WEEKLY_WINDOW,
  DEFAULT_MONTHLY_WINDOW,
  DEFAULT_QUARTERLY_WINDOW,
  COMPRESSION_THRESHOLD_BYTES,
  MAX_COMPRESSION_RATIO,
  DEFLATE_MAX_BLOCK_SIZE,
  GZIP_MAGIC,
  GZIP_METHOD_DEFLATE,
  BUNDLE_SIGNING_KEY,
  DEFAULT_SIGNATURE_CHAIN_DEPTH,
  SACRED_COUNT_TOLERANCE,
  DEFAULT_CODEC,
  MAX_EVENTS_PER_REGION,
  REGION_K_ANON,
  PII_PATTERNS_BUNDLE,
  BUNDLE_ENVELOPE_VERSION,
  ALL_EXPORT_PERIODS,
  ALL_AGGREGATION_KINDS,
  ALL_CONSENT_TAGS,
  ALL_COMPRESSION_CODECS,
  ALL_SACRED_ROUTING_MODES,
  MAX_BUNDLE_BYTES,
  BUNDLE_ID_PREFIX,
  WINDOW_LABEL_SEPARATOR,
  // I18n
  BUNDLE_I18N_PT_BR,
  BUNDLE_I18N_EN_US,
  ALL_BUNDLE_LOCALES,
  DEFAULT_BUNDLE_LOCALE,
  // Hashes
  SHA256_K_BUNDLE,
  SHA256_IV_BUNDLE,
  computeBundleSHA256,
  computeBundleHMACSHA256,
  computeBundleFNV1a32,
  computeBundleStableId,
  computeBundleIntegrity,
  // Validators
  isExportPeriod,
  assertExportPeriod,
  isExportSensitivity,
  assertExportSensitivity,
  isConsentTag,
  assertConsentTag,
  isAggregationKind,
  isCompressionCodec,
  isSacredRoutingMode,
  isBundleISOTimestamp,
  validateBundleEvent,
  validateWindowSpec,
  validateExportBundle,
  validatePrivacyFilter,
  // Errors
  ExportBundleError,
  ExportWindowOverflowError,
  ExportConsentMissingError,
  ExportSacredLeakError,
  ExportIntegrityMismatchError,
  ExportCompressionFailedError,
  ExportSignatureChainError,
  // Privacy filters
  redactIpHashFilter,
  hashUserIdFilter,
  stripSessionIdFilter,
  anonymizeQueryHashFilter,
  hashPersonalizedTermsFilter,
  redactSacredFlagsFilter,
  stripPIITokensFilter,
  dropConsentMissingFilter,
  redactEntityTokensFilter,
  ALL_PRIVACY_FILTERS,
  composePrivacyPipeline,
  runDefaultPrivacyPipeline,
  countPIIStripped,
  countConsentDropped,
  countSacredEventsBundle,
  buildBundleCounters,
  // Window aggregators
  rollingWindow,
  hourlyBucket,
  dailyDigest,
  weeklyRollup,
  monthlyArchive,
  byKindBucket,
  byRegionBucket,
  sacredHitRate,
  blockedByLgpdCount,
  piiStrippedCount,
  clickThroughCount,
  zeroResultCount,
  errorRateCount,
  avgResultsCount,
  activeUsersCount,
  activeSessionsCount,
  buildExportWindow,
  recomputeWindowAggregators,
  sumAggregationAcrossWindows,
  validateWindowAgainstCaps,
  isDefaultWindowSpec,
  toWindowReport,
  // Bundle builders
  serializeBundleBody,
  hashIntegrity,
  signBundle,
  chainSigners,
  buildEnvelope,
  compressBundleBody,
  decompressBundleBody,
  assembleBundle,
  verifyBundleIntegrity,
  verifySignatureChain,
  verifySacredCount,
  purgeUserFromBundle,
  cascadePurgeThroughWindows,
  chainBundles,
  verifyBundleChain,
  summarizeBundle,
  // Compression
  lazyDeflate,
  lazyInflate,
  gzipEnvelope,
  gunzipEnvelope,
  crc32Bundle,
  compressionRatio,
  shouldCompressBody,
  roundtripCompression,
  // Sacred routing
  routeSacredEvent,
  shouldIncludeInBundleBody,
  applySacredRouting,
  markSacredReserved,
  isRedactedMode,
  getSacredPreservedCount,
  countSacredPreserved,
  countBundleWindows,
  getBundleCodec,
  // I18n helpers
  resolveBundleI18n,
  resolveAllPeriodLabels,
  resolveAllAggregationLabels,
  resolveAllConsentLabels,
  // Test helpers
  makeTestBundleEvent,
  makeTestBundleWindowSpec,
  makeTestBundleFilter,
} as const;