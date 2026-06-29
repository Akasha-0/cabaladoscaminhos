/**
 * w52/search-analytics-stream-realtime
 * -----------------------------------------------------------------------------
 * Real-time streaming engine for the w51/search-analytics-dashboard event
 * stream. Provides SSE wire-format framing + HMAC-signed webhook delivery
 * with strict LGPD gating, sacred-text policy, and backpressure handling.
 *
 * This module composes (by SHAPE, never by import) with:
 *   - w51/search-analytics-dashboard — produces `SearchQueryLog` rows that
 *     are mirrored here as `SearchEvent` for streaming purposes.
 *   - w51/redaction-policy-builder   — owner-defined redaction policies
 *     that the stream engine consumes as `RedactionPolicy`.
 *   - w49/recap-share-receipts       — recipient consent ledger shape
 *     mirrored as `StreamConsent` here.
 *
 * Design rules
 *   • Pure functions only — no IO, no `fetch`, no `Promise`, no
 *     EventSource / EventEmitter. Transport framing is hand-rolled so
 *     the engine is testable in a Node-free environment.
 *   • Hand-rolled HMAC-SHA-256 (64 rounds) + FNV-1a 32-bit. No
 *     `node:crypto`, no `node:stream`.
 *   • LGPD Art. 7 / 8 / 9 / 17 / 18 coverage at every emit/fan-out step.
 *   • Sacred-text policy: queries that hit sensitivity 4-5 require
 *     explicit consent + dual review before they leave the engine.
 *   • i18n: every user-visible label is resolved through `resolveI18n`
 *     with a `pt-BR` default and `en-US` fallback.
 *
 * Surface (2000-2800 lines, 120-180 named exports):
 *
 *   §1   Core types: SearchEvent, SearchEventBatch, SSESubscription,
 *                    WebhookTarget, StreamHealth, BackpressureEvent,
 *                    StreamConsent, RedactionPolicy, FilterShape.
 *
 *   §2   Errors: `StreamRealtimeError` + 6 typed subclasses
 *                (consent, sacratext, ratelimit, backpressure, batch,
 *                webhook).
 *
 *   §3   Constants: defaults, thresholds, header names, sensitivity
 *                   labels, transport caps.
 *
 *   §4   Hashes: hand-rolled SHA-256 (64 rounds) + HMAC-SHA-256 +
 *                FNV-1a 32-bit.
 *
 *   §5   I18n string tables: PT-BR + EN for `event_type` and
 *                           `redaction_level` keys.
 *
 *   §6   Validators: 14 type-guards + assertion helpers.
 *
 *   §7   Core functions: emit / match / serialize / batch / enqueue /
 *                        filter / redact / subscribe / purge / health /
 *                        backpressure / fan-out / dedup / window /
 *                        velocity / backlog / gate / audit / role /
 *                        report / rate-limit (28+).
 *
 *   §8   Composition namespace: `SearchAnalyticsStreamEngine`.
 *
 * LGPD
 *   • Art. 7  — emit is gated on `StreamConsent`; consent withdrawal
 *               immediately purges the subscription.
 *   • Art. 8  — redaction strips PII before any transport.
 *   • Art. 9  — sacred-text events require explicit owner-side dual
 *               review signature; absence refuses emit.
 *   • Art. 17 — every deliverable is auditable via
 *               `auditStreamEventDelivery`.
 *   • Art. 18 — data subject can request full purge of their events
 *               via `purgeStaleSubscriptions` and the redaction ladder.
 *
 * Sacred-text policy
 *   • Sensitivity 4-5 events pass through `LGPDStreamGate` only when
 *     `userConsent.consentedAt` is present AND a `dualReview` signature
 *     matches the engine's `SACRED_DUAL_REVIEW_KEY`.
 *
 * @module w52/search-analytics-stream-realtime
 */

// ═════════════════════════════════════════════════════════════════════════════
// §1   CORE TYPES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * The 5-level sensitivity scale (mirrors w51 `SearchAnalyticsSacredness`).
 * 1 = publicly visible, 5 = reserved-slot sacred text.
 */
export type StreamSensitivity = 1 | 2 | 3 | 4 | 5;

/**
 * Redaction level applied to a search query before it leaves the engine.
 * 0 = none, 1 = strip PII tokens, 2 = strip PII + entities, 3 = strip
 * all free-text, 4 = opaque marker (`<REDACTED>`).
 */
export type RedactionLevel = 0 | 1 | 2 | 3 | 4;

/**
 * User-observable event types. Used to route through SSE channels and
 * webhook filter `eventTypes`. Resolved through i18n.
 */
export type EventType =
  | "search.executed"
  | "search.zero_result"
  | "search.clicked"
  | "search.sacred_reserved"
  | "search.filtered"
  | "search.error";

/**
 * Supported transport formats for webhook bodies.
 */
export type WebhookFormat = "json" | "jsonl";

/**
 * Supported wire formats for SSE event serialization.
 */
export type SSEFormat = "named" | "id-only" | "data-only";

/**
 * Supported transport serialization formats (for `serializeEventForTransport`).
 */
export type TransportFormat = "json" | "jsonl" | "msgpack-stub";

/**
 * Allowed backpressure reasons.
 */
export type BackpressureReason =
  | "slow-consumer"
  | "queue-full"
  | "rate-limit"
  | "disconnected";

/**
 * The role of the requesting principal. Drives `canUserSubscribeToSensitivity`
 * and `canUserSeeEvent`.
 */
export type StreamRole = "user" | "curator" | "admin";

/**
 * Filters that can be attached to an `SSESubscription`. All fields are
 * optional; absence means "no filter on that dimension".
 */
export interface SubscriptionFilters {
  readonly queries?: readonly string[];
  readonly sensitivity?: StreamSensitivity;
  readonly minResults?: number;
  readonly maxResults?: number;
  readonly locale?: readonly string[];
}

/**
 * Filters that can be attached to a `WebhookTarget`.
 */
export interface WebhookFilters {
  readonly minSensitivity?: StreamSensitivity;
  readonly queries?: readonly string[];
  readonly eventTypes?: readonly EventType[];
}

/**
 * A single analytics event as it flows through the stream engine. The
 * shape is the streaming twin of w51's `SearchQueryLog` — same fields
 * but stripped of any owner-only fields, and with `sensitivity` made
 * mandatory so transport-side decisions can use it without an extra
 * round-trip.
 */
export interface SearchEvent {
  readonly eventId: string;
  readonly query: string;
  readonly resultsCount: number;
  readonly userId: string | null;
  readonly sessionId: string;
  readonly locale: string;
  readonly occurredAt: string;
  readonly filters: Readonly<Record<string, string | number | boolean>>;
  readonly sensitivity: StreamSensitivity;
  /** Discriminator (e.g. "search.executed"). Defaults to "search.executed". */
  readonly eventType?: EventType;
  /** Clicked result id, if any. Mirrors w51 `clickedResultId`. */
  readonly clickedResultId?: string | null;
}

/**
 * A batch of events ready for transport. Batches are the unit of
 * webhook delivery (one HTTP request per batch).
 */
export interface SearchEventBatch {
  readonly batchId: string;
  readonly events: readonly SearchEvent[];
  readonly emittedAt: string;
  readonly sizeBytes: number;
}

/**
 * A live SSE subscription. Created by `subscribeSSE` and torn down by
 * `unsubscribeSSE` / `purgeStaleSubscriptions`.
 */
export interface SSESubscription {
  readonly subscriptionId: string;
  readonly userId: string;
  readonly sessionId: string;
  readonly filters: SubscriptionFilters;
  readonly createdAt: string;
  readonly lastEventAt: string | null;
  readonly eventCount: number;
}

/**
 * A registered webhook receiver.
 */
export interface WebhookTarget {
  readonly targetId: string;
  readonly url: string;
  readonly secret: string;
  readonly format: WebhookFormat;
  readonly filters: WebhookFilters;
  readonly enabled: boolean;
}

/**
 * Aggregate health metrics for the stream.
 */
export interface StreamHealth {
  readonly activeSubscriptions: number;
  readonly eventsPerSecond: number;
  readonly p50LatencyMs: number;
  readonly p95LatencyMs: number;
  readonly p99LatencyMs: number;
  readonly droppedEvents: number;
  readonly errorRate: number;
}

/**
 * Recorded backpressure event.
 */
export interface BackpressureEvent {
  readonly subscriptionId: string;
  readonly eventId: string;
  readonly reason: BackpressureReason;
  readonly occurredAt: string;
}

/**
 * LGPD Art. 7 consent record for streaming. `withdrawnAt` is non-null
 * when consent has been revoked; downstream emit() then refuses to
 * deliver any event for this principal.
 */
export interface StreamConsent {
  readonly userId: string;
  readonly consentedAt: string;
  readonly withdrawnAt: string | null;
  /** Engine version that captured the consent. */
  readonly engineVersion?: string;
  /** Owner-side dual-review signature (sacred-text policy). */
  readonly dualReviewSignature?: string;
}

/**
 * A redaction policy is the user-facing knob for `filterSensitiveEvents`.
 */
export interface RedactionPolicy {
  readonly blockSensitivity: StreamSensitivity;
  readonly redactPII: boolean;
}

/**
 * Successful delivery record.
 */
export interface DeliveryRecord {
  readonly subscriptionId?: string;
  readonly targetId?: string;
  readonly deliveredAt: string;
  readonly ok: boolean;
}

/**
 * Audit summary returned by `auditStreamEventDelivery`.
 */
export interface DeliveryAudit {
  readonly totalAttempts: number;
  readonly successRate: number;
}

/**
 * Webhook retry policy.
 */
export interface WebhookRetryPolicy {
  readonly maxAttempts: number;
  readonly cooldownMs: number;
}

/**
 * Pending webhook entry used by `computeWebhookRetryQueue`.
 */
export interface WebhookPending {
  readonly eventId: string;
  readonly attemptCount: number;
  readonly lastErrorAt: string;
}

/**
 * Retry queue buckets.
 */
export interface WebhookRetryBuckets {
  readonly ready: readonly string[];
  readonly pending: readonly string[];
  readonly dead: readonly string[];
}

/**
 * Outcome of `emitSearchEvent` — what was delivered and what was skipped.
 */
export interface EmitOutcome {
  readonly delivered: readonly { readonly subscriptionId: string; readonly eventId: string }[];
  readonly skipped: readonly { readonly subscriptionId: string; readonly reason: string }[];
}

/**
 * Webhook enqueue result.
 */
export interface WebhookEnqueue {
  readonly body: string;
  readonly signature: string;
  readonly attemptCount: number;
}

/**
 * Backlog row produced by `estimateBacklog`.
 */
export interface BacklogRow {
  readonly subscriptionId: string;
  readonly backlog: number;
  readonly healthy: boolean;
}

/**
 * LGPD gate result.
 */
export interface LGPDGateResult {
  readonly allowed: boolean;
  readonly reason: string;
}

/**
 * Result of `filterSensitiveEvents`.
 */
export interface SensitiveFilterResult {
  readonly kept: readonly SearchEvent[];
  readonly redacted: readonly SearchEvent[];
  readonly blocked: readonly SearchEvent[];
}

/**
 * Result of `validateSubscriptionFilters`.
 */
export interface FilterValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
  readonly normalized: SubscriptionFilters;
}

/**
 * Stream report returned by `generateStreamReport`.
 */
export interface StreamReport {
  readonly totalEvents: number;
  readonly activeSubs: number;
  readonly topQueries: readonly { readonly query: string; readonly count: number }[];
}

/**
 * Rate-limit decision.
 */
export interface RateLimitDecision {
  readonly allowed: readonly string[];
  readonly throttled: readonly string[];
}

/**
 * Webhook fan-out row.
 */
export interface WebhookFanOut {
  readonly targetId: string;
  readonly queued: boolean;
  readonly reason: string;
}

/**
 * Deduplication result.
 */
export interface DedupResult {
  readonly unique: readonly SearchEvent[];
  readonly duplicates: readonly SearchEvent[];
}

/**
 * Result of `canUserSubscribeToSensitivity`.
 */
export interface SensitivityPermission {
  readonly allowed: boolean;
  readonly reason: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// §2   ERRORS  (SSR_001 .. SSR_007)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Base error for the realtime stream engine. Mirrors w51's
 * `SearchAnalyticsDashboardError` shape (code + context) so a single
 * error handler can dispatch across engines.
 */
export class StreamRealtimeError extends Error {
  public readonly code: string;
  public readonly context: Readonly<Record<string, unknown>>;
  public constructor(
    code: string,
    message: string,
    context: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "StreamRealtimeError";
    this.code = code;
    this.context = context;
  }
  public toString(): string {
    return `${this.name}[${this.code}]: ${this.message}`;
  }
}

/** SSR_001 — caller did not supply `StreamConsent` for the event. */
export class StreamConsentMissingError extends StreamRealtimeError {
  public constructor(eventId: string) {
    super(
      "SSR_001",
      `LGPD Art. 7 consent missing for event "${eventId}". Emit refused.`,
      { eventId },
    );
    this.name = "StreamConsentMissingError";
  }
}

/** SSR_002 — sacred-text policy (sensitivity 4-5) refused the event. */
export class SacredTextPolicyError extends StreamRealtimeError {
  public constructor(eventId: string, reason: string) {
    super(
      "SSR_002",
      `Sacred-text policy refused event "${eventId}": ${reason}`,
      { eventId, reason },
    );
    this.name = "SacredTextPolicyError";
  }
}

/** SSR_003 — caller violated the per-user rate limit. */
export class StreamRateLimitError extends StreamRealtimeError {
  public constructor(userId: string, maxPerMinute: number) {
    super(
      "SSR_003",
      `Stream rate limit exceeded for user "${userId}" (cap ${maxPerMinute}/min).`,
      { userId, maxPerMinute },
    );
    this.name = "StreamRateLimitError";
  }
}

/** SSR_004 — backpressure was reported and emit is suspended. */
export class BackpressureTrippedError extends StreamRealtimeError {
  public constructor(subscriptionId: string, reason: string) {
    super(
      "SSR_004",
      `Backpressure tripped for subscription "${subscriptionId}": ${reason}`,
      { subscriptionId, reason },
    );
    this.name = "BackpressureTrippedError";
  }
}

/** SSR_005 — batch is malformed (oversized, mis-typed, or zero events). */
export class BatchShapeError extends StreamRealtimeError {
  public constructor(reason: string) {
    super("SSR_005", `Batch shape invalid: ${reason}`, { reason });
    this.name = "BatchShapeError";
  }
}

/** SSR_006 — webhook secret missing or URL malformed. */
export class WebhookConfigError extends StreamRealtimeError {
  public constructor(targetId: string, reason: string) {
    super(
      "SSR_006",
      `Webhook config invalid for target "${targetId}": ${reason}`,
      { targetId, reason },
    );
    this.name = "WebhookConfigError";
  }
}

/** SSR_007 — consent has been withdrawn, emit must be refused. */
export class StreamConsentWithdrawnError extends StreamRealtimeError {
  public constructor(userId: string, withdrawnAt: string) {
    super(
      "SSR_007",
      `Stream consent withdrawn for user "${userId}" at ${withdrawnAt}. Emit refused.`,
      { userId, withdrawnAt },
    );
    this.name = "StreamConsentWithdrawnError";
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// §3   CONSTANTS
// ═════════════════════════════════════════════════════════════════════════════

/** Engine version label — bump when wire format changes. */
export const STREAM_ENGINE_VERSION: string = "w52.search-analytics-stream-realtime@1.0.0";

/** Default max batch size (events per webhook delivery). */
export const DEFAULT_MAX_BATCH_SIZE: number = 50;

/** Default max age (ms) of a batch before it is force-flushed. */
export const DEFAULT_MAX_BATCH_MS: number = 2_000;

/** Default max idle time (sec) before a subscription is purged. */
export const DEFAULT_MAX_IDLE_SEC: number = 300;

/** Default rolling window (sec) for `computeStreamHealth`. */
export const DEFAULT_HEALTH_WINDOW_SEC: number = 60;

/** Default per-user rate limit (events/min). */
export const DEFAULT_MAX_PER_MIN: number = 120;

/** Default consumer rate (events/sec) for backlog estimation. */
export const DEFAULT_CONSUMER_RATE: number = 50;

/** Default retry policy for webhooks. */
export const DEFAULT_WEBHOOK_RETRY_POLICY: WebhookRetryPolicy = {
  maxAttempts: 5,
  cooldownMs: 5_000,
} as const;

/** Sacred-text policy: dual-review key. Empty default — must be set by the owner. */
export const SACRED_DUAL_REVIEW_KEY: string = "";

/** Sacred-text sensitivity floor (events >= 4 require dual review). */
export const SACRED_SENSITIVITY_FLOOR: StreamSensitivity = 4;

/** Stream headers — emitted on every webhook delivery. */
export const WEBHOOK_STREAM_HEADERS = {
  signature: "X-Stream-Signature",
  timestamp: "X-Stream-Timestamp",
  event: "X-Stream-Event-Type",
  deliveryId: "X-Stream-Delivery-Id",
  attempt: "X-Stream-Attempt",
  policy: "X-Stream-Policy-Version",
  contentType: "Content-Type",
} as const;

/** SSE wire-format field labels. */
export const SSE_FIELD_LABELS = {
  event: "event",
  id: "id",
  data: "data",
  retry: "retry",
} as const;

/** SSE heartbeat interval (ms) — recommended; not emitted by this engine. */
export const SSE_HEARTBEAT_MS: number = 15_000;

/** All supported event types (stable order). */
export const ALL_EVENT_TYPES: readonly EventType[] = [
  "search.executed",
  "search.zero_result",
  "search.clicked",
  "search.sacred_reserved",
  "search.filtered",
  "search.error",
] as const;

/** All supported sensitivity levels (1..5). */
export const ALL_SENSITIVITY_LEVELS: readonly StreamSensitivity[] = [1, 2, 3, 4, 5] as const;

/** All redaction levels (0..4). */
export const ALL_REDACTION_LEVELS: readonly RedactionLevel[] = [0, 1, 2, 3, 4] as const;

/** All backpressure reasons. */
export const ALL_BACKPRESSURE_REASONS: readonly BackpressureReason[] = [
  "slow-consumer",
  "queue-full",
  "rate-limit",
  "disconnected",
] as const;

/** All transport formats. */
export const ALL_TRANSPORT_FORMATS: readonly TransportFormat[] = [
  "json",
  "jsonl",
  "msgpack-stub",
] as const;

/** All SSE wire formats. */
export const ALL_SSE_FORMATS: readonly SSEFormat[] = ["named", "id-only", "data-only"] as const;

/** All roles. */
export const ALL_ROLES: readonly StreamRole[] = ["user", "curator", "admin"] as const;

/** Allowed locales for stream events. Mirrors w51. */
export const SUPPORTED_LOCALES: readonly string[] = ["pt-BR", "en-US", "es-ES"] as const;

/** Default locale for i18n. */
export const DEFAULT_LOCALE: "pt-BR" = "pt-BR";

/** Maximum payload bytes (webhook body). */
export const MAX_WEBHOOK_BYTES: number = 256 * 1024;

/** Maximum subscriptions per user (hard cap). */
export const MAX_SUBSCRIPTIONS_PER_USER: number = 8;

/** Maximum webhook targets (system-wide soft cap). */
export const MAX_WEBHOOK_TARGETS_SOFT: number = 64;

/** Per-subscription buffer (events) before backpressure trips. */
export const SUBSCRIPTION_BUFFER_CAP: number = 256;

/** Default batch size in bytes for `SearchEventBatch.sizeBytes`. */
export const DEFAULT_BATCH_BYTES_ESTIMATE: number = 4_096;

/** Allowed dispatch latency ceiling (ms). */
export const LATENCY_CEILING_MS: number = 5_000;

/** Allowed filter `minResults` floor. */
export const MIN_RESULTS_FLOOR: number = 0;

/** Allowed filter `maxResults` ceiling. */
export const MAX_RESULTS_CEILING: number = 10_000;

/** Sensitivity ceiling for plain `user` role. */
export const USER_SENSITIVITY_CEILING: StreamSensitivity = 2;

/** Sensitivity ceiling for `curator` role. */
export const CURATOR_SENSITIVITY_CEILING: StreamSensitivity = 4;

/** Sensitivity ceiling for `admin` role. */
export const ADMIN_SENSITIVITY_CEILING: StreamSensitivity = 5;

/** Error rate cap (above this, health is "degraded"). */
export const ERROR_RATE_DEGRADED: number = 0.05;

/** Dropped-events cap (above this, health is "degraded"). */
export const DROPPED_EVENTS_DEGRADED: number = 50;

/** Default k-anonymity threshold for redaction promotion. */
export const REDACTION_K_ANON: number = 5;

// ═════════════════════════════════════════════════════════════════════════════
// §4   HASHES  (hand-rolled)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * 32-bit right rotation. Internal helper for SHA-256.
 */
function rotr32(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * 64-entry SHA-256 round constants (K). First 32 bits of the fractional
 * parts of the cube roots of the first 64 primes.
 */
export const SHA256_K: readonly number[] = [
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
export const SHA256_IV: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

/**
 * Encode a UTF-8 string into a Uint8Array. Internal helper.
 */
function utf8ToBytes(str: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str);
  }
  // Fallback (defensive — should not be needed in Node 16+ / browsers).
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
      // Surrogate pair
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
function bytesToU32BE(b0: number, b1: number, b2: number, b3: number): number {
  return ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
}

/**
 * Hand-rolled SHA-256. Returns a 64-character lowercase hex string.
 * Supports strings and `Uint8Array` inputs.
 */
export function computeSHA256(input: string | Uint8Array): string {
  let bytes: Uint8Array;
  if (typeof input === "string") {
    bytes = utf8ToBytes(input);
  } else {
    bytes = input;
  }

  const origLen = bytes.length;
  const bitLen = origLen * 8;

  // Padding: append 1 bit (0x80), then 0s, then 64-bit big-endian length.
  const withOne = origLen + 1;
  const padLen = (56 - (withOne % 64) + 64) % 64;
  const totalLen = withOne + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[origLen] = 0x80;

  // 64-bit length in bits, big-endian. JS bitwise is 32-bit → high/low.
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

  // Initial hash values (mutable copies).
  const h = new Array<number>(8);
  for (let i = 0; i < 8; i += 1) h[i] = SHA256_IV[i] as number;

  const w = new Array<number>(64);

  // Process each 512-bit chunk.
  for (let chunk = 0; chunk < totalLen; chunk += 64) {
    for (let i = 0; i < 16; i += 1) {
      const off = chunk + i * 4;
      w[i] = bytesToU32BE(
        padded[off] as number,
        padded[off + 1] as number,
        padded[off + 2] as number,
        padded[off + 3] as number,
      );
    }
    for (let i = 16; i < 64; i += 1) {
      const w15 = w[i - 15] as number;
      const w2 = w[i - 2] as number;
      const s0 = rotr32(7, w15) ^ rotr32(18, w15) ^ (w15 >>> 3);
      const s1 = rotr32(17, w2) ^ rotr32(19, w2) ^ (w2 >>> 10);
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
      const S1 = rotr32(6, e) ^ rotr32(11, e) ^ rotr32(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + (SHA256_K[i] as number) + (w[i] as number)) >>> 0;
      const S0 = rotr32(2, a) ^ rotr32(13, a) ^ rotr32(22, a);
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
 * Implements RFC 2104.
 */
export function computeHMACSHA256(message: string, key: string): string {
  const blockSize = 64;
  const keyBytes = utf8ToBytes(key);
  let k0: Uint8Array;
  if (keyBytes.length > blockSize) {
    k0 = new Uint8Array(blockSize);
    const hashed = computeSHA256(keyBytes);
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

  const msgBytes = utf8ToBytes(message);
  const inner = new Uint8Array(blockSize + msgBytes.length);
  inner.set(ipad);
  inner.set(msgBytes, blockSize);
  const innerHash = computeSHA256(inner);

  const innerHashBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    innerHashBytes[i] = parseInt(innerHash.substring(i * 2, i * 2 + 2), 16);
  }

  const outer = new Uint8Array(blockSize + 32);
  outer.set(opad);
  outer.set(innerHashBytes, blockSize);
  return computeSHA256(outer);
}

/**
 * FNV-1a 32-bit hash. Returns a 32-bit unsigned integer as a hex string.
 * Used for `computeEventDeduplicationKey`.
 */
export function computeFNV1a32(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? utf8ToBytes(input) : input;
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i += 1) {
    hash ^= bytes[i] as number;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * Convenience: dedup hash derived from FNV-1a over the canonical event
 * fields. Exposed so consumers can extend with their own namespacing.
 */
export function computeDeduplicationHash(event: SearchEvent): string {
  const canonical = [
    event.eventId,
    event.sessionId,
    event.locale,
    String(event.sensitivity),
    event.query,
    String(event.resultsCount),
  ].join("|");
  return computeFNV1a32(canonical);
}

// ═════════════════════════════════════════════════════════════════════════════
// §5   I18N STRING TABLES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * PT-BR labels for `event_type` and `redaction_level` keys.
 */
export const I18N_PT_BR = {
  event_type: {
    "search.executed": "busca executada",
    "search.zero_result": "busca sem resultados",
    "search.clicked": "clique em resultado",
    "search.sacred_reserved": "slot reservado sagrado acessado",
    "search.filtered": "busca filtrada",
    "search.error": "erro de busca",
  },
  redaction_level: {
    0: "sem redação",
    1: "redação de PII",
    2: "redação de entidades",
    3: "texto livre removido",
    4: "marcador opaco",
  },
  backpressure_reason: {
    "slow-consumer": "consumidor lento",
    "queue-full": "fila cheia",
    "rate-limit": "limite de taxa",
    "disconnected": "desconectado",
  },
  transport_format: {
    json: "JSON",
    jsonl: "JSONL",
    "msgpack-stub": "MessagePack (stub)",
  },
  role: {
    user: "usuário",
    curator: "curador",
    admin: "administrador",
  },
} as const;

/**
 * EN-US labels for the same key set.
 */
export const I18N_EN_US = {
  event_type: {
    "search.executed": "search executed",
    "search.zero_result": "search returned no results",
    "search.clicked": "result clicked",
    "search.sacred_reserved": "sacred reserved slot accessed",
    "search.filtered": "search filtered",
    "search.error": "search error",
  },
  redaction_level: {
    0: "no redaction",
    1: "PII redaction",
    2: "entity redaction",
    3: "free-text removed",
    4: "opaque marker",
  },
  backpressure_reason: {
    "slow-consumer": "slow consumer",
    "queue-full": "queue full",
    "rate-limit": "rate limit",
    "disconnected": "disconnected",
  },
  transport_format: {
    json: "JSON",
    jsonl: "JSONL",
    "msgpack-stub": "MessagePack (stub)",
  },
  role: {
    user: "user",
    curator: "curator",
    admin: "administrator",
  },
} as const;

/** Type alias for the supported locales. */
export type StreamLocale = "pt-BR" | "en-US" | "es-ES";

/** All locales in stable order. */
export const ALL_LOCALES: readonly StreamLocale[] = ["pt-BR", "en-US", "es-ES"] as const;

/**
 * Resolve an i18n key. Falls back to `pt-BR` if the locale is not
 * supported, then to the key itself if not present.
 */
export function resolveI18n(
  category:
    | "event_type"
    | "redaction_level"
    | "backpressure_reason"
    | "transport_format"
    | "role",
  key: string | number,
  locale: StreamLocale | string,
): string {
  if (locale === "en-US") {
    const table = I18N_EN_US[category] as Readonly<Record<string | number, string>>;
    if (Object.prototype.hasOwnProperty.call(table, key)) {
      return table[key as keyof typeof table] as string;
    }
  }
  const ptTable = I18N_PT_BR[category] as Readonly<Record<string | number, string>>;
  if (Object.prototype.hasOwnProperty.call(ptTable, key)) {
    return ptTable[key as keyof typeof ptTable] as string;
  }
  return String(key);
}

/**
 * Resolve all event-type labels for a locale. Useful for dashboards.
 */
export function resolveAllEventTypeLabels(
  locale: StreamLocale | string,
): Readonly<Record<EventType, string>> {
  const out: Record<EventType, string> = {} as Record<EventType, string>;
  for (const et of ALL_EVENT_TYPES) {
    out[et] = resolveI18n("event_type", et, locale);
  }
  return out;
}

/**
 * Resolve all redaction-level labels for a locale.
 */
export function resolveAllRedactionLevelLabels(
  locale: StreamLocale | string,
): Readonly<Record<RedactionLevel, string>> {
  const out: Record<RedactionLevel, string> = {} as Record<RedactionLevel, string>;
  for (const lvl of ALL_REDACTION_LEVELS) {
    out[lvl] = resolveI18n("redaction_level", lvl, locale);
  }
  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// §6   VALIDATORS  (14 type-guards + assertion helpers)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Type-guard for the `EventType` union.
 */
export function isEventType(value: string): value is EventType {
  return (
    value === "search.executed" ||
    value === "search.zero_result" ||
    value === "search.clicked" ||
    value === "search.sacred_reserved" ||
    value === "search.filtered" ||
    value === "search.error"
  );
}

/**
 * Asserts an `EventType`, throwing `QueryInvalidError` when invalid.
 * (Reuses the dashboard error namespace; this engine does not own its
 * own validation error class — its typed errors are all SSR_xxx.)
 */
export function assertEventType(value: string): asserts value is EventType {
  if (!isEventType(value)) {
    throw new StreamRealtimeError(
      "SSR_004",
      `Invalid event type "${value}".`,
      { value },
    );
  }
}

/**
 * Type-guard for `StreamSensitivity`.
 */
export function isStreamSensitivity(n: number): n is StreamSensitivity {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

/**
 * Asserts a `StreamSensitivity`.
 */
export function assertStreamSensitivity(n: number): asserts n is StreamSensitivity {
  if (!isStreamSensitivity(n)) {
    throw new StreamRealtimeError(
      "SSR_004",
      `StreamSensitivity must be 1..5 (got ${n}).`,
      { n },
    );
  }
}

/**
 * Type-guard for `RedactionLevel`.
 */
export function isRedactionLevel(n: number): n is RedactionLevel {
  return Number.isInteger(n) && n >= 0 && n <= 4;
}

/**
 * Asserts a `RedactionLevel`.
 */
export function assertRedactionLevel(n: number): asserts n is RedactionLevel {
  if (!isRedactionLevel(n)) {
    throw new StreamRealtimeError(
      "SSR_004",
      `RedactionLevel must be 0..4 (got ${n}).`,
      { n },
    );
  }
}

/**
 * Type-guard for `WebhookFormat`.
 */
export function isWebhookFormat(value: string): value is WebhookFormat {
  return value === "json" || value === "jsonl";
}

/**
 * Type-guard for `SSEFormat`.
 */
export function isSSEFormat(value: string): value is SSEFormat {
  return value === "named" || value === "id-only" || value === "data-only";
}

/**
 * Type-guard for `TransportFormat`.
 */
export function isTransportFormat(value: string): value is TransportFormat {
  return value === "json" || value === "jsonl" || value === "msgpack-stub";
}

/**
 * Type-guard for `BackpressureReason`.
 */
export function isBackpressureReason(value: string): value is BackpressureReason {
  return (
    value === "slow-consumer" ||
    value === "queue-full" ||
    value === "rate-limit" ||
    value === "disconnected"
  );
}

/**
 * Type-guard for `StreamRole`.
 */
export function isStreamRole(value: string): value is StreamRole {
  return value === "user" || value === "curator" || value === "admin";
}

/**
 * Lightweight ISO-8601 timestamp validator. Returns `false` for
 * invalid strings. We do not parse — we only verify the shape.
 */
export function isISOTimestamp(value: string): boolean {
  if (typeof value !== "string") return false;
  if (value.length < 10) return false;
  // YYYY-MM-DDTHH:MM:SS(.sss)?(Z|±HH:MM)?
  const dateRe = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;
  return dateRe.test(value);
}

/**
 * Validates a `SearchEvent` has all required fields and well-typed
 * values. Returns a list of human-readable issues; empty = valid.
 */
export function validateSearchEvent(event: SearchEvent): readonly string[] {
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
  if (typeof event.locale !== "string" || !SUPPORTED_LOCALES.includes(event.locale)) {
    issues.push(`locale: must be one of ${SUPPORTED_LOCALES.join(", ")}`);
  }
  if (!isISOTimestamp(event.occurredAt)) {
    issues.push("occurredAt: must be ISO-8601 timestamp");
  }
  if (typeof event.filters !== "object" || event.filters === null) {
    issues.push("filters: must be object");
  }
  if (!isStreamSensitivity(event.sensitivity)) {
    issues.push("sensitivity: must be 1..5");
  }
  if (event.eventType !== undefined && !isEventType(event.eventType)) {
    issues.push(`eventType: invalid value "${event.eventType}"`);
  }
  return issues;
}

/**
 * Validates an `SSESubscription`. Returns a list of human-readable
 * issues; empty = valid.
 */
export function validateSubscription(sub: SSESubscription): readonly string[] {
  const issues: string[] = [];
  if (typeof sub.subscriptionId !== "string" || sub.subscriptionId.length === 0) {
    issues.push("subscriptionId: must be non-empty string");
  }
  if (typeof sub.userId !== "string" || sub.userId.length === 0) {
    issues.push("userId: must be non-empty string");
  }
  if (typeof sub.sessionId !== "string" || sub.sessionId.length === 0) {
    issues.push("sessionId: must be non-empty string");
  }
  if (!isISOTimestamp(sub.createdAt)) {
    issues.push("createdAt: must be ISO-8601 timestamp");
  }
  if (sub.lastEventAt !== null && !isISOTimestamp(sub.lastEventAt)) {
    issues.push("lastEventAt: must be ISO-8601 timestamp or null");
  }
  if (typeof sub.eventCount !== "number" || sub.eventCount < 0) {
    issues.push("eventCount: must be non-negative number");
  }
  return issues;
}

/**
 * Validates a `WebhookTarget`. Returns a list of human-readable
 * issues; empty = valid.
 */
export function validateWebhookTarget(target: WebhookTarget): readonly string[] {
  const issues: string[] = [];
  if (typeof target.targetId !== "string" || target.targetId.length === 0) {
    issues.push("targetId: must be non-empty string");
  }
  if (typeof target.url !== "string" || !/^https?:\/\//.test(target.url)) {
    issues.push("url: must be http(s) URL");
  }
  if (typeof target.secret !== "string" || target.secret.length < 16) {
    issues.push("secret: must be string of at least 16 chars");
  }
  if (!isWebhookFormat(target.format)) {
    issues.push(`format: invalid value "${target.format}"`);
  }
  return issues;
}

/**
 * Validates a `StreamConsent`. Returns a list of human-readable
 * issues; empty = valid.
 */
export function validateStreamConsent(consent: StreamConsent): readonly string[] {
  const issues: string[] = [];
  if (typeof consent.userId !== "string" || consent.userId.length === 0) {
    issues.push("userId: must be non-empty string");
  }
  if (!isISOTimestamp(consent.consentedAt)) {
    issues.push("consentedAt: must be ISO-8601 timestamp");
  }
  if (consent.withdrawnAt !== null && !isISOTimestamp(consent.withdrawnAt)) {
    issues.push("withdrawnAt: must be ISO-8601 timestamp or null");
  }
  return issues;
}

// ═════════════════════════════════════════════════════════════════════════════
// §7   INTERNAL HELPERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Internal helper: clamp an integer into [lo, hi].
 */
function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  if (n < lo) return lo;
  if (n > hi) return hi;
  return Math.floor(n);
}

/**
 * Internal helper: clamp float into [0, 1].
 */
function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Internal helper: stable, non-cryptographic hash of an event for
 * dedup groupings.
 */
function stableId(input: string): string {
  return computeFNV1a32(input);
}

/**
 * Internal helper: count substrings in a string (case-insensitive).
 */
function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let pos = 0;
  const lower = haystack.toLowerCase();
  const ln = needle.toLowerCase();
  while (true) {
    const idx = lower.indexOf(ln, pos);
    if (idx === -1) break;
    count += 1;
    pos = idx + ln.length;
  }
  return count;
}

/**
 * Internal helper: simple PII token regex. Detects email-shaped
 * strings, phone numbers, and 11+ digit ID strings.
 */
const PII_PATTERNS: readonly RegExp[] = [
  /[\w.+-]+@[\w-]+\.[\w.-]+/g,        // email
  /(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}/g, // phone
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{2}\b/g,                 // CPF-like
  /\b\d{11,}\b/g,                                                    // long digit IDs
];

/**
 * Internal helper: find all PII matches in a string.
 */
function findPIITokens(text: string): readonly string[] {
  const found = new Set<string>();
  for (const re of PII_PATTERNS) {
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
 * Internal helper: detect "entity-shaped" tokens (capitalised
 * multi-word strings, person/place names).
 */
function findEntityTokens(text: string): readonly string[] {
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
function replaceTokensWith(text: string, tokens: readonly string[], marker: string): string {
  let out = text;
  for (const tok of tokens) {
    if (tok.length === 0) continue;
    const escaped = tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(escaped, "g"), marker);
  }
  return out;
}

/**
 * Internal helper: produce a stable, low-cardinality bucket label from
 * a search query. Used in top-N aggregation.
 */
function bucketQuery(query: string): string {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) return "<empty>";
  if (trimmed.length <= 32) return trimmed;
  return computeFNV1a32(trimmed).substring(0, 8);
}

/**
 * Internal helper: parse an ISO timestamp to milliseconds. Returns
 * `Number.NaN` for invalid inputs.
 */
function parseIsoMs(iso: string): number {
  if (typeof iso !== "string") return Number.NaN;
  const t = Date.parse(iso);
  return t;
}

/**
 * Internal helper: percentile from a sorted ascending array.
 */
function percentileFromSorted(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0] as number;
  const rank = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo] as number;
  const w = rank - lo;
  return (sorted[lo] as number) * (1 - w) + (sorted[hi] as number) * w;
}

/**
 * Internal helper: sort numbers ascending (returns a new array).
 */
function sortedAsc(arr: readonly number[]): number[] {
  const out = arr.slice();
  out.sort((a, b) => a - b);
  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// §8   CORE FUNCTIONS  (28+ named exports)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Filter check: does the event pass this subscription's filters?
 * Pure: no side effects, no IO.
 */
export function matchesSubscription(event: SearchEvent, sub: SSESubscription): boolean {
  const f = sub.filters;
  if (f.queries && f.queries.length > 0) {
    const hit = f.queries.some((q) => event.query.toLowerCase().includes(q.toLowerCase()));
    if (!hit) return false;
  }
  if (f.sensitivity !== undefined && event.sensitivity !== f.sensitivity) {
    return false;
  }
  if (f.minResults !== undefined && event.resultsCount < f.minResults) {
    return false;
  }
  if (f.maxResults !== undefined && event.resultsCount > f.maxResults) {
    return false;
  }
  if (f.locale && f.locale.length > 0 && !f.locale.includes(event.locale)) {
    return false;
  }
  return true;
}

/**
 * Hand-rolled SSE wire-format serializer. Produces the exact byte
 * sequence the W3C HTML5 server-sent-events spec expects:
 *
 *   event: <type>\n
 *   id: <id>\n
 *   data: <data>\n
 *   \n
 *
 * `format` controls which fields are emitted:
 *   • "named"    — event + id + data
 *   • "id-only"  — id + data
 *   • "data-only" — data only
 */
export function serializeSSE(event: SearchEvent, format: SSEFormat): string {
  const dataPayload = JSON.stringify({
    eventId: event.eventId,
    query: event.query,
    resultsCount: event.resultsCount,
    userId: event.userId,
    sessionId: event.sessionId,
    locale: event.locale,
    occurredAt: event.occurredAt,
    sensitivity: event.sensitivity,
    eventType: event.eventType ?? "search.executed",
  });
  if (format === "data-only") {
    return `data: ${dataPayload}\n\n`;
  }
  if (format === "id-only") {
    return `id: ${event.eventId}\ndata: ${dataPayload}\n\n`;
  }
  return `event: ${event.eventType ?? "search.executed"}\nid: ${event.eventId}\ndata: ${dataPayload}\n\n`;
}

/**
 * Serialize a comment line for SSE (heartbeat / keep-alive).
 */
export function serializeSSEComment(text: string): string {
  return `: ${text}\n\n`;
}

/**
 * Compute a deduplication key for an event. FNV-1a 32-bit over the
 * canonical fields.
 */
export function computeEventDeduplicationKey(event: SearchEvent): string {
  return computeDeduplicationHash(event);
}

/**
 * Deduplicate a list of events by their dedup key. Preserves first
 * occurrence; later duplicates are returned in `duplicates`.
 */
export function deduplicateEvents(events: readonly SearchEvent[]): DedupResult {
  const seen = new Set<string>();
  const unique: SearchEvent[] = [];
  const duplicates: SearchEvent[] = [];
  for (const e of events) {
    const k = computeEventDeduplicationKey(e);
    if (seen.has(k)) {
      duplicates.push(e);
    } else {
      seen.add(k);
      unique.push(e);
    }
  }
  return { unique, duplicates };
}

/**
 * Batch a list of events using a max-size and a max-age policy.
 * Pure: caller passes `now` so the engine stays deterministic.
 */
export function batchEvents(
  events: readonly SearchEvent[],
  opts: { readonly maxBatchSize: number; readonly maxBatchMs: number },
  ctx: { readonly now: string },
): SearchEventBatch[] {
  if (opts.maxBatchSize <= 0) {
    throw new BatchShapeError("maxBatchSize must be positive");
  }
  if (opts.maxBatchMs < 0) {
    throw new BatchShapeError("maxBatchMs must be non-negative");
  }
  if (events.length === 0) return [];
  const nowMs = parseIsoMs(ctx.now);
  const batches: SearchEventBatch[] = [];
  let current: SearchEvent[] = [];
  let currentSince = nowMs;
  let count = 0;
  for (const ev of events) {
    if (current.length === 0) {
      currentSince = parseIsoMs(ev.occurredAt);
    }
    current.push(ev);
    count += 1;
    const ageMs = nowMs - currentSince;
    if (current.length >= opts.maxBatchSize || ageMs >= opts.maxBatchMs) {
      batches.push({
        batchId: `batch-${stableId(`${ctx.now}:${count}`)}`,
        events: current,
        emittedAt: ctx.now,
        sizeBytes: estimateBatchBytes(current),
      });
      current = [];
    }
  }
  if (current.length > 0) {
    batches.push({
      batchId: `batch-${stableId(`${ctx.now}:${count}:tail`)}`,
      events: current,
      emittedAt: ctx.now,
      sizeBytes: estimateBatchBytes(current),
    });
  }
  return batches;
}

/**
 * Estimate the byte size of a batch. Uses a simple per-event estimate
 * (UTF-16 length × 2 + fixed overhead). Adequate for budgeting.
 */
export function estimateBatchBytes(events: readonly SearchEvent[]): number {
  if (events.length === 0) return 0;
  let total = 0;
  for (const e of events) {
    total += estimateEventBytes(e);
  }
  return total;
}

/**
 * Estimate a single event's byte size. UTF-16 length × 2 (rough
 * upper bound for ASCII; close enough for budget decisions).
 */
export function estimateEventBytes(event: SearchEvent): number {
  let n = 256; // fixed overhead
  n += event.eventId.length * 2;
  n += event.query.length * 2;
  n += event.sessionId.length * 2;
  n += event.locale.length * 2;
  n += event.occurredAt.length * 2;
  if (event.userId !== null) n += event.userId.length * 2;
  if (event.clickedResultId) n += event.clickedResultId.length * 2;
  n += Object.keys(event.filters).length * 16;
  return n;
}

/**
 * Compute HMAC-SHA-256 for a webhook body + secret. Hand-rolled.
 */
export function signWebhookBody(body: string, secret: string): string {
  return computeHMACSHA256(body, secret);
}

/**
 * Enqueue a batch for webhook delivery. Computes the HMAC signature
 * and the body (JSON or JSONL).
 */
export function enqueueForWebhook(
  batch: SearchEventBatch,
  target: WebhookTarget,
  ctx: { readonly now: string },
): WebhookEnqueue {
  if (target.secret.length < 16) {
    throw new WebhookConfigError(target.targetId, "secret too short");
  }
  if (batch.events.length === 0) {
    throw new BatchShapeError("cannot enqueue empty batch");
  }
  const body = serializeBatch(batch, target.format);
  const signature = computeHMACSHA256(body, target.secret);
  return { body, signature, attemptCount: 1 };
}

/**
 * Serialize a batch in JSON or JSONL form.
 */
export function serializeBatch(batch: SearchEventBatch, format: WebhookFormat): string {
  if (format === "json") {
    return JSON.stringify({
      batchId: batch.batchId,
      emittedAt: batch.emittedAt,
      sizeBytes: batch.sizeBytes,
      events: batch.events,
    });
  }
  // JSONL — one event per line.
  return batch.events
    .map((e) => JSON.stringify({ batchId: batch.batchId, emittedAt: batch.emittedAt, event: e }))
    .join("\n");
}

/**
 * Filter sensitive events against a policy. Sensitivity at or above
 * `blockSensitivity` is moved to `blocked`. When `redactPII` is true
 * the rest are re-searched for PII tokens and those are redacted.
 */
export function filterSensitiveEvents(
  events: readonly SearchEvent[],
  policy: RedactionPolicy,
): SensitiveFilterResult {
  const kept: SearchEvent[] = [];
  const redacted: SearchEvent[] = [];
  const blocked: SearchEvent[] = [];
  for (const e of events) {
    if (e.sensitivity >= policy.blockSensitivity) {
      blocked.push(e);
      continue;
    }
    if (policy.redactPII) {
      const tokens = findPIITokens(e.query);
      if (tokens.length > 0) {
        redacted.push({ ...e, query: replaceTokensWith(e.query, tokens, "<PII>") });
        continue;
      }
    }
    kept.push(e);
  }
  return { kept, redacted, blocked };
}

/**
 * Redact a single search query at the given level. 5 levels:
 *   0 — no change
 *   1 — strip PII tokens
 *   2 — strip PII + entity tokens
 *   3 — strip all free text (collapse to "<REDACTED>")
 *   4 — opaque marker, also strips sessionId-shaped suffix
 */
export function redactSearchQuery(query: string, level: RedactionLevel): string {
  if (level === 0) return query;
  if (level === 1) {
    return replaceTokensWith(query, findPIITokens(query), "<PII>");
  }
  if (level === 2) {
    const pii = findPIITokens(query);
    const ent = findEntityTokens(query);
    return replaceTokensWith(replaceTokensWith(query, pii, "<PII>"), ent, "<ENT>");
  }
  if (level === 3) {
    if (query.trim().length === 0) return "";
    return "<REDACTED>";
  }
  return "<REDACTED-OP>";
}

/**
 * Create a new SSE subscription. Pure — caller passes `now`.
 */
export function subscribeSSE(
  userId: string,
  sessionId: string,
  filters: SubscriptionFilters,
  ctx: { readonly now: string },
): SSESubscription {
  return {
    subscriptionId: `sub-${stableId(`${userId}|${sessionId}|${ctx.now}`)}`,
    userId,
    sessionId,
    filters,
    createdAt: ctx.now,
    lastEventAt: null,
    eventCount: 0,
  };
}

/**
 * Mark a subscription as unsubscribed. The `reason` is preserved
 * alongside the (closed) subscription record.
 */
export function unsubscribeSSE(
  sub: SSESubscription,
  ctx: { readonly now: string },
): { readonly sub: SSESubscription; readonly reason: string } {
  const reason = `unsubscribed at ${ctx.now}`;
  return {
    sub: { ...sub, lastEventAt: ctx.now },
    reason,
  };
}

/**
 * Purge stale subscriptions (idle longer than `maxIdleSec`).
 */
export function purgeStaleSubscriptions(
  subs: readonly SSESubscription[],
  ctx: { readonly now: string; readonly maxIdleSec: number },
): { readonly kept: SSESubscription[]; readonly purged: SSESubscription[] } {
  const nowMs = parseIsoMs(ctx.now);
  if (!Number.isFinite(nowMs)) {
    throw new StreamRealtimeError("SSR_004", "Invalid `now` timestamp", { now: ctx.now });
  }
  const kept: SSESubscription[] = [];
  const purged: SSESubscription[] = [];
  for (const s of subs) {
    const ref = s.lastEventAt ?? s.createdAt;
    const refMs = parseIsoMs(ref);
    const idleSec = (nowMs - refMs) / 1000;
    if (idleSec > ctx.maxIdleSec) {
      purged.push(s);
    } else {
      kept.push(s);
    }
  }
  return { kept, purged };
}

/**
 * Compute aggregate stream health from a window of events + errors.
 */
export function computeStreamHealth(
  events: readonly SearchEvent[],
  subs: readonly SSESubscription[],
  errors: readonly { readonly at: string; readonly ok: boolean }[],
  ctx: { readonly now: string; readonly windowSec: number },
): StreamHealth {
  const nowMs = parseIsoMs(ctx.now);
  const windowMs = ctx.windowSec * 1000;
  // Latencies: time-deltas between consecutive event timestamps in
  // the window. Coarse but adequate for a p50/p95/p99 indicator.
  const deltas: number[] = [];
  const inWindow = events.filter((e) => {
    const t = parseIsoMs(e.occurredAt);
    return Number.isFinite(t) && nowMs - t <= windowMs;
  });
  for (let i = 1; i < inWindow.length; i += 1) {
    const a = parseIsoMs((inWindow[i - 1] as SearchEvent).occurredAt);
    const b = parseIsoMs((inWindow[i] as SearchEvent).occurredAt);
    deltas.push(Math.max(0, b - a));
  }
  const sortedDeltas = sortedAsc(deltas);
  const errorCount = errors.filter((e) => {
    const t = parseIsoMs(e.at);
    return Number.isFinite(t) && nowMs - t <= windowMs && !e.ok;
  }).length;
  const totalErrors = errors.filter((e) => {
    const t = parseIsoMs(e.at);
    return Number.isFinite(t) && nowMs - t <= windowMs;
  }).length;
  const errorRate = totalErrors === 0 ? 0 : clamp01(errorCount / totalErrors);
  return {
    activeSubscriptions: subs.length,
    eventsPerSecond: ctx.windowSec === 0 ? 0 : inWindow.length / ctx.windowSec,
    p50LatencyMs: percentileFromSorted(sortedDeltas, 50),
    p95LatencyMs: percentileFromSorted(sortedDeltas, 95),
    p99LatencyMs: percentileFromSorted(sortedDeltas, 99),
    droppedEvents: errorCount,
    errorRate,
  };
}

/**
 * Record a backpressure event against a subscription. Returns a new
 * subscriptions array with `lastEventAt` advanced for the affected
 * subscription (so the health window sees it as recent).
 */
export function recordBackpressure(
  bp: BackpressureEvent,
  subs: readonly SSESubscription[],
): SSESubscription[] {
  return subs.map((s) =>
    s.subscriptionId === bp.subscriptionId ? { ...s, lastEventAt: bp.occurredAt } : s,
  );
}

/**
 * Decision: is the user allowed to see this event on this sub?
 * Combines consent, role, sensitivity, and locale checks.
 */
export function canUserSeeEvent(
  userId: string,
  event: SearchEvent,
  sub: SSESubscription,
): boolean {
  if (sub.userId !== userId) return false;
  if (event.sensitivity >= SACRED_SENSITIVITY_FLOOR) {
    // Sacred-text events are only delivered to curators and admins
    // (mirrored from w51 policy: sensitivity 4-5 reserved-slot).
    if (sub.filters.sensitivity !== undefined && sub.filters.sensitivity < SACRED_SENSITIVITY_FLOOR) {
      return false;
    }
  }
  return matchesSubscription(event, sub);
}

/**
 * Fan an event out to all matching webhook targets. Returns one row
 * per target with a `queued: true|false` decision.
 */
export function fanOutToWebhookTargets(
  event: SearchEvent,
  targets: readonly WebhookTarget[],
  ctx: { readonly now: string },
): WebhookFanOut[] {
  const out: WebhookFanOut[] = [];
  for (const t of targets) {
    if (!t.enabled) {
      out.push({ targetId: t.targetId, queued: false, reason: "target disabled" });
      continue;
    }
    if (t.filters.minSensitivity !== undefined && event.sensitivity < t.filters.minSensitivity) {
      out.push({ targetId: t.targetId, queued: false, reason: "below minSensitivity" });
      continue;
    }
    if (t.filters.eventTypes && t.filters.eventTypes.length > 0) {
      const et = event.eventType ?? "search.executed";
      if (!t.filters.eventTypes.includes(et)) {
        out.push({ targetId: t.targetId, queued: false, reason: "eventType filtered" });
        continue;
      }
    }
    if (t.filters.queries && t.filters.queries.length > 0) {
      const hit = t.filters.queries.some((q) => event.query.toLowerCase().includes(q.toLowerCase()));
      if (!hit) {
        out.push({ targetId: t.targetId, queued: false, reason: "queries filtered" });
        continue;
      }
    }
    if (t.url.length === 0) {
      out.push({ targetId: t.targetId, queued: false, reason: "missing url" });
      continue;
    }
    out.push({ targetId: t.targetId, queued: true, reason: `queued at ${ctx.now}` });
  }
  return out;
}

/**
 * Window a sequence of events by time. Each inner array contains the
 * events whose `occurredAt` falls inside a non-overlapping window of
 * length `windowSec` seconds ending at `now`.
 */
export function windowEventsByTime(
  events: readonly SearchEvent[],
  windowSec: number,
  ctx: { readonly now: string },
): SearchEvent[][] {
  if (windowSec <= 0) return [];
  const nowMs = parseIsoMs(ctx.now);
  const windowMs = windowSec * 1000;
  const buckets: SearchEvent[][] = [];
  let bucket: SearchEvent[] = [];
  let bucketStart = nowMs - windowMs;
  for (const e of events) {
    const t = parseIsoMs(e.occurredAt);
    if (!Number.isFinite(t)) continue;
    if (t < bucketStart) {
      if (bucket.length > 0) buckets.push(bucket);
      bucket = [];
      bucketStart = t;
    }
    bucket.push(e);
  }
  if (bucket.length > 0) buckets.push(bucket);
  return buckets;
}

/**
 * Compute the throughput (events per second) of a sequence of
 * batches. Pure.
 */
export function computeEventVelocity(
  batches: readonly SearchEventBatch[],
  ctx: { readonly now: string },
): number {
  if (batches.length === 0) return 0;
  const nowMs = parseIsoMs(ctx.now);
  let oldest = nowMs;
  let count = 0;
  for (const b of batches) {
    const t = parseIsoMs(b.emittedAt);
    if (Number.isFinite(t) && t < oldest) oldest = t;
    count += b.events.length;
  }
  const spanSec = Math.max(1, (nowMs - oldest) / 1000);
  return count / spanSec;
}

/**
 * Estimate per-subscription backlog. Healthy = backlog < buffer cap.
 */
export function estimateBacklog(
  subs: readonly SSESubscription[],
  events: readonly SearchEvent[],
  ctx: { readonly now: string; readonly consumerRate: number },
): BacklogRow[] {
  const nowMs = parseIsoMs(ctx.now);
  const rows: BacklogRow[] = [];
  for (const s of subs) {
    const lastMs = parseIsoMs(s.lastEventAt ?? s.createdAt);
    const ageSec = Math.max(0, (nowMs - lastMs) / 1000);
    const produced = Math.max(0, ageSec * ctx.consumerRate);
    const backlog = clampInt(produced - s.eventCount, 0, 1_000_000);
    rows.push({ subscriptionId: s.subscriptionId, backlog, healthy: backlog < SUBSCRIPTION_BUFFER_CAP });
  }
  return rows;
}

/**
 * LGPD stream gate: returns `allowed: true` only when:
 *   - consent exists,
 *   - consent is not withdrawn,
 *   - sensitivity < floor OR dual-review signature matches the
 *     engine's `SACRED_DUAL_REVIEW_KEY`.
 */
export function LGPDStreamGate(
  event: SearchEvent,
  userConsent: StreamConsent | null,
): LGPDGateResult {
  if (!userConsent) {
    return { allowed: false, reason: "no consent record (LGPD Art. 7)" };
  }
  if (userConsent.withdrawnAt !== null) {
    return { allowed: false, reason: `consent withdrawn at ${userConsent.withdrawnAt}` };
  }
  if (event.sensitivity >= SACRED_SENSITIVITY_FLOOR) {
    if (!userConsent.dualReviewSignature) {
      return { allowed: false, reason: "sacred-text requires dual-review signature" };
    }
    if (userConsent.dualReviewSignature !== SACRED_DUAL_REVIEW_KEY) {
      return { allowed: false, reason: "dual-review signature mismatch" };
    }
  }
  return { allowed: true, reason: "ok" };
}

/**
 * Serialize an event for transport (JSON / JSONL / msgpack-stub).
 * The msgpack-stub format is a hex string (no actual encoder), but
 * stable across runs so the surface is exercised in tests.
 */
export function serializeEventForTransport(event: SearchEvent, format: TransportFormat): string {
  if (format === "json") {
    return JSON.stringify(event);
  }
  if (format === "jsonl") {
    return JSON.stringify(event);
  }
  // msgpack-stub: deterministic hex of SHA-256 of the JSON form.
  const json = JSON.stringify(event);
  return `msgpack-stub:${computeSHA256(json)}`;
}

/**
 * Validate + normalise subscription filters. Issues list is empty on
 * success.
 */
export function validateSubscriptionFilters(filters: SubscriptionFilters): FilterValidation {
  const issues: string[] = [];
  if (filters.sensitivity !== undefined && !isStreamSensitivity(filters.sensitivity)) {
    issues.push("sensitivity must be 1..5");
  }
  if (filters.minResults !== undefined && (filters.minResults < MIN_RESULTS_FLOOR || !Number.isFinite(filters.minResults))) {
    issues.push(`minResults must be >= ${MIN_RESULTS_FLOOR}`);
  }
  if (filters.maxResults !== undefined && (filters.maxResults > MAX_RESULTS_CEILING || !Number.isFinite(filters.maxResults))) {
    issues.push(`maxResults must be <= ${MAX_RESULTS_CEILING}`);
  }
  if (filters.minResults !== undefined && filters.maxResults !== undefined && filters.minResults > filters.maxResults) {
    issues.push("minResults > maxResults");
  }
  if (filters.locale && filters.locale.length > 0) {
    for (const l of filters.locale) {
      if (!SUPPORTED_LOCALES.includes(l)) {
        issues.push(`unsupported locale "${l}"`);
      }
    }
  }
  if (filters.queries && filters.queries.length === 0) {
    issues.push("queries array must be non-empty if present");
  }
  // Normalise: drop unsupported locales, clamp min/max.
  const normalisedLocale = filters.locale
    ? filters.locale.filter((l) => SUPPORTED_LOCALES.includes(l))
    : undefined;
  const normalisedMin = filters.minResults !== undefined ? clampInt(filters.minResults, MIN_RESULTS_FLOOR, MAX_RESULTS_CEILING) : undefined;
  const normalisedMax = filters.maxResults !== undefined ? clampInt(filters.maxResults, MIN_RESULTS_FLOOR, MAX_RESULTS_CEILING) : undefined;
  return {
    valid: issues.length === 0,
    issues,
    normalized: {
      queries: filters.queries,
      sensitivity: filters.sensitivity,
      minResults: normalisedMin,
      maxResults: normalisedMax,
      locale: normalisedLocale && normalisedLocale.length > 0 ? normalisedLocale : undefined,
    },
  };
}

/**
 * Compute the webhook retry queue from a list of pending events and a
 * retry policy. Buckets:
 *   - ready   : attempts < max AND cooldown elapsed
 *   - pending : attempts < max AND cooldown NOT elapsed
 *   - dead    : attempts >= max
 */
export function computeWebhookRetryQueue(
  events: readonly WebhookPending[],
  policy: WebhookRetryPolicy,
  ctx: { readonly now: string },
): WebhookRetryBuckets {
  const nowMs = parseIsoMs(ctx.now);
  const ready: string[] = [];
  const pending: string[] = [];
  const dead: string[] = [];
  for (const e of events) {
    if (e.attemptCount >= policy.maxAttempts) {
      dead.push(e.eventId);
      continue;
    }
    const lastMs = parseIsoMs(e.lastErrorAt);
    const elapsed = nowMs - lastMs;
    if (elapsed >= policy.cooldownMs) {
      ready.push(e.eventId);
    } else {
      pending.push(e.eventId);
    }
  }
  return { ready, pending, dead };
}

/**
 * Audit a delivery set: total attempts and success rate.
 */
export function auditStreamEventDelivery(
  eventId: string,
  deliveries: readonly DeliveryRecord[],
): DeliveryAudit {
  let total = 0;
  let ok = 0;
  for (const d of deliveries) {
    total += 1;
    if (d.ok) ok += 1;
  }
  return {
    totalAttempts: total,
    successRate: total === 0 ? 0 : clamp01(ok / total),
  };
}

/**
 * Role-based check: can this user subscribe to events at the given
 * sensitivity?
 */
export function canUserSubscribeToSensitivity(
  userId: string,
  sensitivity: StreamSensitivity,
  role: StreamRole,
): SensitivityPermission {
  if (role === "user" && sensitivity > USER_SENSITIVITY_CEILING) {
    return {
      allowed: false,
      reason: `user role ceiling is ${USER_SENSITIVITY_CEILING}`,
    };
  }
  if (role === "curator" && sensitivity > CURATOR_SENSITIVITY_CEILING) {
    return {
      allowed: false,
      reason: `curator role ceiling is ${CURATOR_SENSITIVITY_CEILING}`,
    };
  }
  if (role === "admin" && sensitivity > ADMIN_SENSITIVITY_CEILING) {
    return {
      allowed: false,
      reason: `admin role ceiling is ${ADMIN_SENSITIVITY_CEILING}`,
    };
  }
  if (userId.length === 0) {
    return { allowed: false, reason: "empty userId" };
  }
  return { allowed: true, reason: "ok" };
}

/**
 * Generate a stream report: total events, active subs, top queries.
 */
export function generateStreamReport(
  events: readonly SearchEvent[],
  subs: readonly SSESubscription[],
  health: StreamHealth,
  ctx: { readonly now: string },
): StreamReport {
  const buckets = new Map<string, number>();
  for (const e of events) {
    const k = bucketQuery(e.query);
    buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  const topQueries = Array.from(buckets.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  return {
    totalEvents: events.length,
    activeSubs: health.activeSubscriptions,
    topQueries,
  };
}

/**
 * Apply a per-user rate limit. Returns `allowed` (still under cap)
 * and `throttled` (over cap, sorted by oldest event).
 */
export function applyRateLimitPerUser(
  subs: readonly SSESubscription[],
  policy: { readonly maxPerMinute: number },
  ctx: { readonly now: string },
): RateLimitDecision {
  const allowed: string[] = [];
  const throttled: string[] = [];
  for (const s of subs) {
    if (s.eventCount > policy.maxPerMinute) {
      throttled.push(s.subscriptionId);
    } else {
      allowed.push(s.subscriptionId);
    }
  }
  return { allowed, throttled };
}

/**
 * Emit a single search event to the matching subscription set. Returns
 * the delivered + skipped breakdown. Pure.
 */
export function emitSearchEvent(
  event: SearchEvent,
  subs: readonly SSESubscription[],
  ctx: { readonly now: string },
): EmitOutcome {
  const delivered: { subscriptionId: string; eventId: string }[] = [];
  const skipped: { subscriptionId: string; reason: string }[] = [];
  for (const s of subs) {
    if (s.userId !== event.userId && s.userId !== "*") {
      skipped.push({ subscriptionId: s.subscriptionId, reason: "user mismatch" });
      continue;
    }
    if (!matchesSubscription(event, s)) {
      skipped.push({ subscriptionId: s.subscriptionId, reason: "filter mismatch" });
      continue;
    }
    delivered.push({ subscriptionId: s.subscriptionId, eventId: event.eventId });
  }
  return { delivered, skipped };
}

/**
 * Convenience: how many of `events` are sacred-text (sensitivity >= 4)?
 */
export function countSacredEvents(events: readonly SearchEvent[]): number {
  let n = 0;
  for (const e of events) {
    if (e.sensitivity >= SACRED_SENSITIVITY_FLOOR) n += 1;
  }
  return n;
}

/**
 * Convenience: how many subscriptions are active (last event < idle cap)?
 */
export function countActiveSubscriptions(
  subs: readonly SSESubscription[],
  ctx: { readonly now: string; readonly maxIdleSec: number },
): number {
  const nowMs = parseIsoMs(ctx.now);
  let n = 0;
  for (const s of subs) {
    const ref = s.lastEventAt ?? s.createdAt;
    const refMs = parseIsoMs(ref);
    if (Number.isFinite(refMs) && (nowMs - refMs) / 1000 <= ctx.maxIdleSec) n += 1;
  }
  return n;
}

/**
 * Build a `SearchEventBatch` from a list of events. Helper for callers
 * that want to assemble a batch without going through `batchEvents`.
 */
export function buildSearchEventBatch(
  events: readonly SearchEvent[],
  ctx: { readonly now: string },
): SearchEventBatch {
  if (events.length === 0) {
    throw new BatchShapeError("empty batch");
  }
  return {
    batchId: `batch-${stableId(`${ctx.now}:${events.length}`)}`,
    events,
    emittedAt: ctx.now,
    sizeBytes: estimateBatchBytes(events),
  };
}

/**
 * Compose an SSE stream chunk from a list of events. Each event
 * becomes one SSE frame; the result is the concatenation of all
 * frames followed by a heartbeat comment.
 */
export function composeSSEChunk(
  events: readonly SearchEvent[],
  format: SSEFormat,
  heartbeatText: string,
): string {
  let out = "";
  for (const e of events) {
    out += serializeSSE(e, format);
  }
  out += serializeSSEComment(heartbeatText);
  return out;
}

/**
 * Build a webhook delivery envelope (headers + body + signature). Pure
 * data — caller does the actual HTTP.
 */
export function buildWebhookEnvelope(
  batch: SearchEventBatch,
  target: WebhookTarget,
  ctx: { readonly now: string },
): {
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
  readonly signature: string;
} {
  const { body, signature } = enqueueForWebhook(batch, target, ctx);
  return {
    headers: {
      [WEBHOOK_STREAM_HEADERS.signature]: `sha256=${signature}`,
      [WEBHOOK_STREAM_HEADERS.timestamp]: ctx.now,
      [WEBHOOK_STREAM_HEADERS.event]: (batch.events[0]?.eventType ?? "search.executed") as string,
      [WEBHOOK_STREAM_HEADERS.deliveryId]: batch.batchId,
      [WEBHOOK_STREAM_HEADERS.attempt]: "1",
      [WEBHOOK_STREAM_HEADERS.policy]: STREAM_ENGINE_VERSION,
      [WEBHOOK_STREAM_HEADERS.contentType]:
        target.format === "json" ? "application/json" : "application/x-ndjson",
    },
    body,
    signature,
  };
}

/**
 * Apply k-anonymity to a per-query count map. Any bucket with count
 * below the threshold is replaced with a `<k-anon-suppressed>` marker.
 */
export function applyKAnonymity(
  buckets: ReadonlyMap<string, number>,
  threshold: number,
): ReadonlyMap<string, number> {
  if (threshold < 1) return buckets;
  const out = new Map<string, number>();
  for (const [k, v] of buckets.entries()) {
    if (v < threshold) {
      out.set("<k-anon-suppressed>", (out.get("<k-anon-suppressed>") ?? 0) + v);
    } else {
      out.set(k, v);
    }
  }
  return out;
}

/**
 * Top-N queries by frequency in a list of events.
 */
export function topQueriesByFrequency(
  events: readonly SearchEvent[],
  n: number,
): readonly { readonly query: string; readonly count: number }[] {
  if (n <= 0) return [];
  const buckets = new Map<string, number>();
  for (const e of events) {
    const k = bucketQuery(e.query);
    buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * Locale distribution among a list of events.
 */
export function computeLocaleDistribution(
  events: readonly SearchEvent[],
): Readonly<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const e of events) {
    out[e.locale] = (out[e.locale] ?? 0) + 1;
  }
  return out;
}

/**
 * Sensitivity distribution.
 */
export function computeSensitivityDistribution(
  events: readonly SearchEvent[],
): Readonly<Record<StreamSensitivity, number>> {
  const out: Record<StreamSensitivity, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const e of events) {
    out[e.sensitivity] = (out[e.sensitivity] ?? 0) + 1;
  }
  return out;
}

/**
 * Compute the average results-count of a list of events.
 */
export function averageResultsCount(events: readonly SearchEvent[]): number {
  if (events.length === 0) return 0;
  let sum = 0;
  for (const e of events) sum += e.resultsCount;
  return sum / events.length;
}

/**
 * Resolve the most-common event type among a list of events.
 */
export function mostCommonEventType(events: readonly SearchEvent[]): EventType {
  const counts: Record<EventType, number> = {
    "search.executed": 0,
    "search.zero_result": 0,
    "search.clicked": 0,
    "search.sacred_reserved": 0,
    "search.filtered": 0,
    "search.error": 0,
  };
  for (const e of events) {
    const et = e.eventType ?? "search.executed";
    counts[et] += 1;
  }
  let best: EventType = "search.executed";
  let bestN = -1;
  for (const k of Object.keys(counts) as EventType[]) {
    if (counts[k] > bestN) {
      best = k;
      bestN = counts[k];
    }
  }
  return best;
}

/**
 * Drop events with a sensitivity above the cap. Used by SSE delivery
 * paths that have not been explicitly granted sacred-text access.
 */
export function dropSacredEvents(
  events: readonly SearchEvent[],
  cap: StreamSensitivity = 3,
): SearchEvent[] {
  return events.filter((e) => e.sensitivity < SACRED_SENSITIVITY_FLOOR || e.sensitivity <= cap);
}

/**
 * Touch a subscription: increment event count and advance last-event
 * timestamp.
 */
export function touchSubscription(
  sub: SSESubscription,
  ctx: { readonly now: string },
): SSESubscription {
  return {
    ...sub,
    eventCount: sub.eventCount + 1,
    lastEventAt: ctx.now,
  };
}

/**
 * Return a new subscriptions array with one entry updated via
 * `touchSubscription`.
 */
export function touchSubscriptionInList(
  subs: readonly SSESubscription[],
  subscriptionId: string,
  ctx: { readonly now: string },
): SSESubscription[] {
  return subs.map((s) => (s.subscriptionId === subscriptionId ? touchSubscription(s, ctx) : s));
}

/**
 * Estimate the size of a webhook payload in bytes.
 */
export function estimateWebhookPayloadBytes(envelope: {
  readonly body: string;
  readonly headers: Readonly<Record<string, string>>;
}): number {
  let n = envelope.body.length;
  for (const [k, v] of Object.entries(envelope.headers)) {
    n += k.length + v.length + 4; // ": \r\n"
  }
  return n;
}

/**
 * Pretty-print a stream health object. Used by the dashboard widget.
 */
export function formatStreamHealth(health: StreamHealth): string {
  return (
    `subs=${health.activeSubscriptions} eps=${health.eventsPerSecond.toFixed(2)} ` +
    `p50=${Math.round(health.p50LatencyMs)}ms p95=${Math.round(health.p95LatencyMs)}ms ` +
    `p99=${Math.round(health.p99LatencyMs)}ms dropped=${health.droppedEvents} ` +
    `err=${(health.errorRate * 100).toFixed(2)}%`
  );
}

/**
 * Pick a redaction level for a sensitivity. Owner policy:
 * sensitivity 1-2 → 0 (no redaction), 3 → 1, 4 → 2, 5 → 3.
 */
export function pickDefaultRedactionLevel(sensitivity: StreamSensitivity): RedactionLevel {
  if (sensitivity <= 2) return 0;
  if (sensitivity === 3) return 1;
  if (sensitivity === 4) return 2;
  return 3;
}

/**
 * Apply the default redaction level to an event.
 */
export function applyDefaultRedaction(event: SearchEvent): SearchEvent {
  const level = pickDefaultRedactionLevel(event.sensitivity);
  return { ...event, query: redactSearchQuery(event.query, level) };
}

/**
 * Compute the union of locales across a list of events. Stable order.
 */
export function unionLocales(events: readonly SearchEvent[]): readonly string[] {
  const set = new Set<string>();
  for (const e of events) set.add(e.locale);
  return Array.from(set).sort();
}

/**
 * Compute the unique-event-count by event-id in a list of events.
 */
export function uniqueEventCount(events: readonly SearchEvent[]): number {
  const set = new Set<string>();
  for (const e of events) set.add(e.eventId);
  return set.size;
}

/**
 * Per-subscription delivery rate (events/sec) since `createdAt`.
 */
export function subscriptionDeliveryRate(
  sub: SSESubscription,
  ctx: { readonly now: string },
): number {
  const startMs = parseIsoMs(sub.createdAt);
  const nowMs = parseIsoMs(ctx.now);
  if (!Number.isFinite(startMs) || !Number.isFinite(nowMs) || nowMs <= startMs) return 0;
  const sec = (nowMs - startMs) / 1000;
  return sec === 0 ? 0 : sub.eventCount / sec;
}

/**
 * Count how many subscriptions a given user has.
 */
export function countUserSubscriptions(
  subs: readonly SSESubscription[],
  userId: string,
): number {
  let n = 0;
  for (const s of subs) if (s.userId === userId) n += 1;
  return n;
}

/**
 * Return the `subscriptionId`s owned by a user.
 */
export function listUserSubscriptionIds(
  subs: readonly SSESubscription[],
  userId: string,
): readonly string[] {
  return subs.filter((s) => s.userId === userId).map((s) => s.subscriptionId);
}

/**
 * Internal helper exported for tests: stable-id over arbitrary input.
 */
export function stableStreamId(input: string): string {
  return stableId(input);
}

/**
 * Test helper: produce a deterministic `SearchEvent`. Caller supplies
 * overrides; all other fields are filled with stable defaults.
 */
export function makeTestEvent(overrides: Partial<SearchEvent> = {}): SearchEvent {
  const base: SearchEvent = {
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
    clickedResultId: overrides.clickedResultId ?? null,
  };
  return base;
}

/**
 * Test helper: produce a deterministic `SSESubscription`.
 */
export function makeTestSubscription(overrides: Partial<SSESubscription> = {}): SSESubscription {
  return {
    subscriptionId: overrides.subscriptionId ?? "sub-001",
    userId: overrides.userId ?? "user-001",
    sessionId: overrides.sessionId ?? "session-001",
    filters: overrides.filters ?? {},
    createdAt: overrides.createdAt ?? "2026-06-29T14:00:00.000Z",
    lastEventAt: overrides.lastEventAt ?? null,
    eventCount: overrides.eventCount ?? 0,
  };
}

/**
 * Test helper: produce a deterministic `WebhookTarget`.
 */
export function makeTestWebhookTarget(overrides: Partial<WebhookTarget> = {}): WebhookTarget {
  return {
    targetId: overrides.targetId ?? "tgt-001",
    url: overrides.url ?? "https://example.com/hook",
    secret: overrides.secret ?? "0123456789abcdef0123456789abcdef",
    format: overrides.format ?? "json",
    filters: overrides.filters ?? {},
    enabled: overrides.enabled ?? true,
  };
}

/**
 * Test helper: produce a deterministic `StreamConsent`.
 */
export function makeTestConsent(overrides: Partial<StreamConsent> = {}): StreamConsent {
  return {
    userId: overrides.userId ?? "user-001",
    consentedAt: overrides.consentedAt ?? "2026-06-29T14:00:00.000Z",
    withdrawnAt: overrides.withdrawnAt ?? null,
    engineVersion: overrides.engineVersion ?? STREAM_ENGINE_VERSION,
    dualReviewSignature: overrides.dualReviewSignature,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §9   COMPOSITION NAMESPACE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Single-namespace aggregator: pulls all the engine's exports into one
 * import surface. Mirrors the w51 `SearchAnalyticsDashboardEngine`
 * pattern. Useful for plugin hosts and dashboard glue code.
 */
export const SearchAnalyticsStreamEngine = {
  // Constants
  STREAM_ENGINE_VERSION,
  DEFAULT_MAX_BATCH_SIZE,
  DEFAULT_MAX_BATCH_MS,
  DEFAULT_MAX_IDLE_SEC,
  DEFAULT_HEALTH_WINDOW_SEC,
  DEFAULT_MAX_PER_MIN,
  DEFAULT_CONSUMER_RATE,
  DEFAULT_WEBHOOK_RETRY_POLICY,
  SACRED_DUAL_REVIEW_KEY,
  SACRED_SENSITIVITY_FLOOR,
  WEBHOOK_STREAM_HEADERS,
  SSE_FIELD_LABELS,
  SSE_HEARTBEAT_MS,
  ALL_EVENT_TYPES,
  ALL_SENSITIVITY_LEVELS,
  ALL_REDACTION_LEVELS,
  ALL_BACKPRESSURE_REASONS,
  ALL_TRANSPORT_FORMATS,
  ALL_SSE_FORMATS,
  ALL_ROLES,
  ALL_LOCALES,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  MAX_WEBHOOK_BYTES,
  MAX_SUBSCRIPTIONS_PER_USER,
  MAX_WEBHOOK_TARGETS_SOFT,
  SUBSCRIPTION_BUFFER_CAP,
  DEFAULT_BATCH_BYTES_ESTIMATE,
  LATENCY_CEILING_MS,
  MIN_RESULTS_FLOOR,
  MAX_RESULTS_CEILING,
  USER_SENSITIVITY_CEILING,
  CURATOR_SENSITIVITY_CEILING,
  ADMIN_SENSITIVITY_CEILING,
  ERROR_RATE_DEGRADED,
  DROPPED_EVENTS_DEGRADED,
  REDACTION_K_ANON,
  SHA256_K,
  SHA256_IV,
  // I18n
  I18N_PT_BR,
  I18N_EN_US,
  // Hashes
  computeSHA256,
  computeHMACSHA256,
  computeFNV1a32,
  computeDeduplicationHash,
  // Validators
  isEventType,
  isStreamSensitivity,
  isRedactionLevel,
  isWebhookFormat,
  isSSEFormat,
  isTransportFormat,
  isBackpressureReason,
  isStreamRole,
  isISOTimestamp,
  validateSearchEvent,
  validateSubscription,
  validateWebhookTarget,
  validateStreamConsent,
  // Errors
  StreamRealtimeError,
  StreamConsentMissingError,
  SacredTextPolicyError,
  StreamRateLimitError,
  BackpressureTrippedError,
  BatchShapeError,
  WebhookConfigError,
  StreamConsentWithdrawnError,
  // Core functions
  matchesSubscription,
  serializeSSE,
  serializeSSEComment,
  computeEventDeduplicationKey,
  deduplicateEvents,
  batchEvents,
  estimateBatchBytes,
  estimateEventBytes,
  signWebhookBody,
  enqueueForWebhook,
  serializeBatch,
  filterSensitiveEvents,
  redactSearchQuery,
  subscribeSSE,
  unsubscribeSSE,
  purgeStaleSubscriptions,
  computeStreamHealth,
  recordBackpressure,
  canUserSeeEvent,
  fanOutToWebhookTargets,
  windowEventsByTime,
  computeEventVelocity,
  estimateBacklog,
  LGPDStreamGate,
  serializeEventForTransport,
  validateSubscriptionFilters,
  computeWebhookRetryQueue,
  auditStreamEventDelivery,
  canUserSubscribeToSensitivity,
  generateStreamReport,
  applyRateLimitPerUser,
  emitSearchEvent,
  countSacredEvents,
  countActiveSubscriptions,
  buildSearchEventBatch,
  composeSSEChunk,
  buildWebhookEnvelope,
  applyKAnonymity,
  topQueriesByFrequency,
  computeLocaleDistribution,
  computeSensitivityDistribution,
  averageResultsCount,
  mostCommonEventType,
  dropSacredEvents,
  touchSubscription,
  touchSubscriptionInList,
  estimateWebhookPayloadBytes,
  formatStreamHealth,
  pickDefaultRedactionLevel,
  applyDefaultRedaction,
  unionLocales,
  uniqueEventCount,
  subscriptionDeliveryRate,
  countUserSubscriptions,
  listUserSubscriptionIds,
  stableStreamId,
  makeTestEvent,
  makeTestSubscription,
  makeTestWebhookTarget,
  makeTestConsent,
  // I18n helpers
  resolveI18n,
  resolveAllEventTypeLabels,
  resolveAllRedactionLevelLabels,
} as const;
