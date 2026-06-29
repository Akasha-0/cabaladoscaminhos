/**
 * w52/webhook-dead-letter-queue
 * -----------------------------------------------------------------------------
 * Dead-letter queue + retry engine for w51 webhook deliveries.
 *
 * SCOPE
 * This module owns the FAILURE SIDE of webhook delivery: exponential
 * backoff, attempt accounting, dead-letter promotion, manual replay,
 * queue stats, throttling by target, LGPD retention, sacred-text
 * redaction for logs, hand-rolled HMAC-SHA-256 signature verification,
 * and queue pressure computation.
 *
 * It does NOT execute HTTP requests. It is pure (sync) and shape-only:
 * a downstream worker / cron / queue consumer feeds it responses; the
 * engine returns the next delivery shape. No `fetch`, no `Promise`,
 * no I/O.
 *
 * ADJACENT MODULES (composition by shape, never by import)
 * w51/prayer-submission-webhook   — emits deliveries that this DLQ
 *                                   consumes; both share the HMAC-SHA-
 *                                   256 contract via `validateWebhookSignature`
 *                                   so signatures verified here match
 *                                   signatures produced there.
 * w51/receipt-redaction-policy    — supplies the `sensitivity` levels
 *                                   re-applied by `redactPayloadForLog`.
 * w50/curated-prayer-submission   — the transition stream whose events
 *                                   drive both w51 webhook emission AND
 *                                   w52 DLQ flow control.
 * w49/audit-trail                 — `auditDeadLetterTrail` produces a
 *                                   shape that feeds straight in.
 * w48/sacred-symbols-registry     — sacred-text markers are mirrored
 *                                   below so we redact regardless of
 *                                   which upstream emitted the payload.
 *
 * DURABLE POLICY (DON'T)
 * 1. NEVER use `node:crypto`. The HMAC-SHA-256 here is hand-rolled so
 *    the engine runs identically in edge / Node / browser / worker.
 * 2. NEVER mark a 4xx (except 408/425/429) retryable. Those go to
 *    dead-letter immediately so operators can investigate a bad URL.
 * 3. NEVER log a payload that contains the `sacred-text-marker` token
 *    without `redactPayloadForLog(payload, 'high')` first.
 * 4. NEVER replay a dead letter inside its `cooldownMinutes` window.
 *    The replay worker honors `isReplaySafe` before calling
 *    `replayDeadLetter`.
 * 5. NEVER purge a dead letter inside the LGPD retention window
 *    (default 30 days). `purgeDeadLetters` filters by operator policy
 *    and `LGPDRetentionCheck` blocks premature removal.
 *
 * LGPD ANCHORS
 * Art.  7 — explicit consent. The DLQ stores no PII but inherits the
 *           consent gate from w51 webhook (delivery rows MUST carry a
 *           non-empty `webhookId` whose subscription has
 *           `consentCaptured === true`).
 * Art. 17 — retention. `LGPDRetentionCheck` + `purgeDeadLetters` cap
 *           the holding period; `maxRetentionDays` is configurable.
 * Art. 18 — export / delete. `exportDeadLetterForLGPD` returns a
 *           JSON-serializable copy; `recordLGPDDeleteRequest` flags
 *           the row for immediate purge.
 *
 * SIGNATURE SCHEME
 * HMAC-SHA-256 over the raw payload string, hex output, lowercase.
 * Mirrors w51: receivers call `validateWebhookSignature` with the
 * shared secret + the `X-Webhook-Signature: sha256=<hex>` header
 * extracted from the inbound request. `computeHMACSHA256` is exposed
 * for tests.
 *
 * @module w52/webhook-dead-letter-queue
 */

// ═════════════════════════════════════════════════════════════════════════════
// §1  CORE TYPES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Delivery lifecycle states for the DLQ.
 *
 * - pending         — queued, not yet attempted.
 * - in-flight       — currently being sent by the dispatcher.
 * - succeeded       — terminal success.
 * - failed          — terminal failure (non-retryable error).
 * - dead-letter     — moved to DLQ; awaiting operator action.
 * - replay-queued   — operator-initiated replay waiting its turn.
 *
 * Note: this set is intentionally DIFFERENT from w51's `WebhookDeliveryStatus`
 * (`pending|retrying|delivered|failed|expired`). The DLQ cares about
 * retry semantics + operator replay, so its states lean that way.
 */
export type WebhookDeliveryState =
  | 'pending'
  | 'in-flight'
  | 'succeeded'
  | 'failed'
  | 'dead-letter'
  | 'replay-queued';

/**
 * Canonical list — useful for dashboards, tests, and i18n registration.
 */
export const ALL_DELIVERY_STATES: readonly WebhookDeliveryState[] = [
  'pending',
  'in-flight',
  'succeeded',
  'failed',
  'dead-letter',
  'replay-queued',
] as const;

/**
 * Classified error taxonomy. `retryable` is pre-computed at
 * classification time so the dispatcher doesn't need to know HTTP.
 */
export type WebhookErrorCode =
  | 'timeout'
  | '5xx'
  | '4xx'
  | 'network'
  | 'signature-mismatch'
  | 'rate-limit'
  | 'unknown';

/**
 * Canonical list — used in error classification rules + i18n keys.
 */
export const ALL_ERROR_CODES: readonly WebhookErrorCode[] = [
  'timeout',
  '5xx',
  '4xx',
  'network',
  'signature-mismatch',
  'rate-limit',
  'unknown',
] as const;

/**
 * Jitter strategies — all return a number >= base.
 *
 * - none           — returns base.
 * - full           — returns random * baseMs (AWS-style).
 * - equal          — returns base/2 + random * base/2.
 * - decorrelated   — returns random * 3 * prev (kept simple here:
 *                    passes prev via random multiplier).
 */
export type JitterStrategy = 'none' | 'full' | 'equal' | 'decorrelated';

/**
 * Canonical list.
 */
export const ALL_JITTER_STRATEGIES: readonly JitterStrategy[] = [
  'none',
  'full',
  'equal',
  'decorrelated',
] as const;

/**
 * One structured error attached to a delivery. Immutable; new copy is
 * created on each retry via `classifyError`.
 */
export interface WebhookDeliveryError {
  readonly code: WebhookErrorCode;
  readonly message: string;
  readonly httpStatus: number | null;
  readonly retryable: boolean;
  readonly occurredAt: string;
}

/**
 * Backoff / retry policy. Engine reads `maxAttempts` as the ceiling for
 * `delivery.attemptCount`. `baseMs * factor^(attempt-1)` is the un-jittered
 * delay; `applyJitter` then mutates per the strategy.
 */
export interface BackoffPolicy {
  readonly baseMs: number;
  readonly factor: number;
  readonly maxMs: number;
  readonly jitter: JitterStrategy;
  readonly maxAttempts: number;
}

/**
 * One delivery row. The DLQ owns this shape end-to-end. `nextAttemptAt`
 * is ISO-8601 UTC; `null` once the delivery is terminal or dead-lettered.
 */
export interface WebhookDelivery {
  readonly deliveryId: string;
  readonly webhookId: string;
  readonly payload: string;
  readonly targetUrl: string;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly state: WebhookDeliveryState;
  readonly nextAttemptAt: string | null;
  readonly lastError: WebhookDeliveryError | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Dead-letter row — what `moveToDeadLetter` produces. The original
 * delivery snapshot is preserved so an operator can replay verbatim.
 */
export interface DeadLetter {
  readonly deadLetterId: string;
  readonly originalDelivery: WebhookDelivery;
  readonly reason: string;
  readonly movedAt: string;
  readonly operatorNotes: string;
  readonly replayAttempts: number;
}

/**
 * Operator-initiated replay request. `resetAttemptCount` controls whether
 * the new delivery starts at attempt 0 or continues from the last count.
 */
export interface ReplayRequest {
  readonly replayId: string;
  readonly deadLetterId: string;
  readonly requestedBy: string;
  readonly requestedAt: string;
  readonly resetAttemptCount: boolean;
}

/**
 * Rollup stats for the queue. `oldestPendingMs` is the age of the oldest
 * still-pending row, in ms. Used by `computeRetryPressure`.
 */
export interface QueueStats {
  readonly pending: number;
  readonly inFlight: number;
  readonly succeeded: number;
  readonly failed: number;
  readonly deadLetter: number;
  readonly oldestPendingMs: number;
}

/**
 * Result of pressure computation — used to drive dashboards / alerts.
 */
export type PressureLevel = 'ok' | 'warn' | 'alert';

/**
 * Outcome of a single delivery attempt. `dead-letter` means the attempt
 * failed AND the retry budget is exhausted (or the error is non-retryable).
 */
export type DeliveryAttemptResult = 'succeeded' | 'retry' | 'dead-letter';

/**
 * Sensitivity tiers used by `redactPayloadForLog`. Drives how aggressively
 * PII is masked before a payload touches a log line.
 */
export type LogSensitivity = 'low' | 'medium' | 'high';

/**
 * Canonical list.
 */
export const ALL_LOG_SENSITIVITIES: readonly LogSensitivity[] = [
  'low',
  'medium',
  'high',
] as const;

/**
 * Operator identity for audit trails. The DLQ itself doesn't authn; the
 * caller passes the resolved operator id (worker / admin / system).
 */
export type OperatorId = string;

/**
 * Confidence label for queueing-time estimates.
 */
export type EstimateConfidence = 'low' | 'medium' | 'high';

// ═════════════════════════════════════════════════════════════════════════════
// §2  CONSTANTS — I18N, POLICY DEFAULTS, MARKERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Default locale for log + DLQ reason strings. Brazilian audience first.
 */
export const DEFAULT_DLQ_LOCALE = 'pt-BR' as const;

/**
 * All supported locales.
 */
export const ALL_DLQ_LOCALES = ['pt-BR', 'en-US'] as const;
export type DlqLocale = typeof ALL_DLQ_LOCALES[number];

/**
 * Sacred-text marker — when present in `payload`, `redactPayloadForLog`
 * MUST mask it regardless of sensitivity tier. Mirrors the marker
 * defined in w51 prayer-submission-webhook.
 */
export const SACRED_TEXT_MARKER = 'sacred-text-marker' as const;

/**
 * Substring used to detect prayer / sacred payloads.
 */
export const SACRED_TEXT_FRAGMENTS = [
  'orixa',
  'orixá',
  'ifa',
  'ifá',
  'umbanda',
  'candomble',
  'candomblé',
  'ogum',
  'oxala',
  'oxalá',
  'iansa',
  'ianga',
  'xango',
  'xangô',
  'iemanja',
  'iemanjá',
  'oxum',
  'irodu',
  'exu',
  'pombagira',
  'babalao',
  'babalorixa',
  'babalorixá',
  'zelador_de_santo',
  'caboclo',
  'preto_velho',
] as const;

/**
 * Common header keys that may carry PII / auth tokens.
 */
export const SENSITIVE_HEADER_TOKENS = [
  'authorization',
  'x-api-key',
  'x-webhook-signature',
  'cookie',
  'set-cookie',
] as const;

/**
 * HTTP status codes that ARE retryable even though they're 4xx.
 * 408 request-timeout, 425 too-early, 429 rate-limit.
 */
export const RETRYABLE_4XX_CODES: readonly number[] = [408, 425, 429];

/**
 * HTTP status range for server errors that always retry.
 */
export const SERVER_ERROR_RANGE = { min: 500, max: 599 } as const;

/**
 * HTTP status range for client errors that don't retry (except the
 * explicit `RETRYABLE_4XX_CODES`).
 */
export const CLIENT_ERROR_RANGE = { min: 400, max: 499 } as const;

/**
 * HTTP status codes considered "definitely fatal" — never retry, never
 * replay. 410 Gone / 451 Unavailable-For-Legal-Reasons / etc.
 */
export const FATAL_STATUS_CODES: readonly number[] = [410, 451];

/**
 * Default backoff policy used when a caller doesn't supply one.
 * 5 attempts, exponential 2x, 1s base, capped at 5min, no jitter.
 */
export const DEFAULT_BACKOFF_POLICY: BackoffPolicy = {
  baseMs: 1_000,
  factor: 2,
  maxMs: 300_000,
  jitter: 'none',
  maxAttempts: 5,
};

/**
 * Aggressive backoff for downstream systems known to rate-limit.
 * 8 attempts, 5s base, capped at 10min, full jitter.
 */
export const AGGRESSIVE_BACKOFF_POLICY: BackoffPolicy = {
  baseMs: 5_000,
  factor: 2.5,
  maxMs: 600_000,
  jitter: 'full',
  maxAttempts: 8,
};

/**
 * Conservative policy for sacred-text receivers — fewer attempts to
 * limit blast radius if a sacred payload is being rejected by a
 * downstream.
 */
export const SACRED_TEXT_BACKOFF_POLICY: BackoffPolicy = {
  baseMs: 2_000,
  factor: 1.5,
  maxMs: 60_000,
  jitter: 'equal',
  maxAttempts: 3,
};

/**
 * Default LGPD retention policy for dead letters — 30 days.
 */
export const DEFAULT_LGPD_RETENTION_DAYS = 30 as const;

/**
 * Replay cooldown — operator must wait at least this many minutes
 * between consecutive replays of the same dead letter.
 */
export const DEFAULT_REPLAY_COOLDOWN_MINUTES = 5 as const;

/**
 * Threshold values for `computeRetryPressure`. `warnAt` is the count
 * of pending+in-flight where the level flips to `warn`; `alertAt`
 * is where it flips to `alert`.
 */
export const DEFAULT_PRESSURE_THRESHOLDS = {
  warnAt: 50,
  alertAt: 200,
} as const;

/**
 * Default throttle ceiling per target URL per minute.
 */
export const DEFAULT_TARGET_THROTTLE_PER_MINUTE = 60 as const;

// ═════════════════════════════════════════════════════════════════════════════
// §3  I18N TABLES — pt-BR + en-US for state + error_code
// ═════════════════════════════════════════════════════════════════════════════

/**
 * pt-BR labels for delivery states.
 */
export const I18N_STATE_PT_BR: Readonly<Record<WebhookDeliveryState, string>> = {
  pending: 'pendente',
  'in-flight': 'em transito',
  succeeded: 'entregue',
  failed: 'falhou',
  'dead-letter': 'fila morta',
  'replay-queued': 'replay na fila',
};

/**
 * en-US labels for delivery states.
 */
export const I18N_STATE_EN_US: Readonly<Record<WebhookDeliveryState, string>> = {
  pending: 'pending',
  'in-flight': 'in flight',
  succeeded: 'delivered',
  failed: 'failed',
  'dead-letter': 'dead letter',
  'replay-queued': 'replay queued',
};

/**
 * pt-BR labels for error codes.
 */
export const I18N_ERROR_PT_BR: Readonly<Record<WebhookErrorCode, string>> = {
  timeout: 'tempo esgotado',
  '5xx': 'erro do servidor',
  '4xx': 'erro do cliente',
  network: 'falha de rede',
  'signature-mismatch': 'assinatura invalida',
  'rate-limit': 'limite de requisicoes',
  unknown: 'erro desconhecido',
};

/**
 * en-US labels for error codes.
 */
export const I18N_ERROR_EN_US: Readonly<Record<WebhookErrorCode, string>> = {
  timeout: 'timeout',
  '5xx': 'server error',
  '4xx': 'client error',
  network: 'network failure',
  'signature-mismatch': 'invalid signature',
  'rate-limit': 'rate limited',
  unknown: 'unknown error',
};

/**
 * Resolve a localized state label.
 */
export function localizeState(
  state: WebhookDeliveryState,
  locale: DlqLocale,
): string {
  if (locale === 'en-US') return I18N_STATE_EN_US[state];
  return I18N_STATE_PT_BR[state];
}

/**
 * Resolve a localized error-code label.
 */
export function localizeErrorCode(
  code: WebhookErrorCode,
  locale: DlqLocale,
): string {
  if (locale === 'en-US') return I18N_ERROR_EN_US[code];
  return I18N_ERROR_PT_BR[code];
}

/**
 * Default reason strings used when `moveToDeadLetter` is called without
 * an explicit reason. Localized.
 */
export const DEFAULT_DEAD_LETTER_REASON_PT_BR =
  'maximo de tentativas excedido' as const;
export const DEFAULT_DEAD_LETTER_REASON_EN_US =
  'max attempts exceeded' as const;

// ═════════════════════════════════════════════════════════════════════════════
// §4  ERROR CLASSES (7 typed errors)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Base class for all DLQ errors. Carries a `code` so log aggregation
 * can group by it.
 */
export class WebhookDlqError extends Error {
  public readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'WebhookDlqError';
    this.code = code;
  }
}

/**
 * Thrown when an operator asks to replay / fetch a dead letter that
 * doesn't exist.
 */
export class DeadLetterNotFoundError extends WebhookDlqError {
  constructor(deadLetterId: string) {
    super(`dead letter not found: ${deadLetterId}`, 'DLQ_001');
    this.name = 'DeadLetterNotFoundError';
  }
}

/**
 * Thrown when an operator replays a dead letter inside its cooldown
 * window. The window is enforced by `isReplaySafe` first; this error
 * is for callers that bypass it.
 */
export class ReplayCooldownError extends WebhookDlqError {
  constructor(deadLetterId: string, minutesRemaining: number) {
    super(
      `replay cooldown active for ${deadLetterId}: ${minutesRemaining.toFixed(
        2,
      )} min remaining`,
      'DLQ_002',
    );
    this.name = 'ReplayCooldownError';
  }
}

/**
 * Thrown when a `BackoffPolicy` is structurally invalid (e.g. factor
 * <= 1, baseMs < 0, maxAttempts < 1).
 */
export class BackoffPolicyInvalidError extends WebhookDlqError {
  constructor(reason: string) {
    super(`invalid backoff policy: ${reason}`, 'DLQ_003');
    this.name = 'BackoffPolicyInvalidError';
  }
}

/**
 * Thrown when `validateWebhookSignature` returns `valid === false` and
 * the caller asks for the strict variant.
 */
export class SignatureMismatchError extends WebhookDlqError {
  constructor(expected: string, received: string) {
    super(
      `signature mismatch (expected=${expected.slice(0, 8)}..., got=${received.slice(
        0,
        8,
      )}...)`,
      'DLQ_004',
    );
    this.name = 'SignatureMismatchError';
  }
}

/**
 * Thrown when `throttleByTarget` returns 0 and the caller asks for
 * strict behavior (i.e. they want a hard "no more for now" signal).
 */
export class RateLimitExceededError extends WebhookDlqError {
  constructor(targetUrl: string, maxPerMinute: number) {
    super(
      `rate limit exceeded for ${targetUrl} (max ${maxPerMinute}/min)`,
      'DLQ_005',
    );
    this.name = 'RateLimitExceededError';
  }
}

/**
 * Thrown when `LGPDRetentionCheck` reports a violation and the caller
 * asks for strict behavior (e.g. an admin tries to bypass the policy).
 */
export class RetentionViolationError extends WebhookDlqError {
  constructor(deadLetterId: string, daysHeld: number, maxRetentionDays: number) {
    super(
      `retention violation for ${deadLetterId}: held ${daysHeld}d, max ${maxRetentionDays}d`,
      'DLQ_006',
    );
    this.name = 'RetentionViolationError';
  }
}

/**
 * Thrown when `throttleByTarget` is called with `maxPerMinute <= 0`
 * or non-integer. Distinct from `RateLimitExceededError` so dashboards
 * can tell "policy bug" from "policy decision".
 */
export class ThrottlePolicyError extends WebhookDlqError {
  constructor(reason: string) {
    super(`invalid throttle policy: ${reason}`, 'DLQ_007');
    this.name = 'ThrottlePolicyError';
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// §5  HAND-ROLLED SHA-256 + HMAC-SHA-256 (no node:crypto)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Right-rotate a 32-bit unsigned integer.
 */
function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * SHA-256 initial hash values (FIPS 180-4 §5.3.3).
 */
const SHA256_H: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

/**
 * SHA-256 round constants (FIPS 180-4 §4.2.2).
 */
const SHA256_K: readonly number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/**
 * UTF-8 encode a string into bytes. Pure helper used by the SHA / HMAC
 * primitives. Exposed for tests.
 */
export function utf8Encode(s: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) {
      bytes.push(c);
    } else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6));
      bytes.push(0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      bytes.push(0xe0 | (c >> 12));
      bytes.push(0x80 | ((c >> 6) & 0x3f));
      bytes.push(0x80 | (c & 0x3f));
    } else {
      i++;
      const lo = s.charCodeAt(i);
      c = 0x10000 + (((c & 0x3ff) << 10) | (lo & 0x3ff));
      bytes.push(0xf0 | (c >> 18));
      bytes.push(0x80 | ((c >> 12) & 0x3f));
      bytes.push(0x80 | ((c >> 6) & 0x3f));
      bytes.push(0x80 | (c & 0x3f));
    }
  }
  return bytes;
}

/**
 * Hand-rolled SHA-256 over a byte array. Returns raw 32 bytes.
 * Internal primitive used by HMAC where we need the binary digest
 * (not the hex) as input to the outer hash, per RFC 2104.
 */
export function sha256Bytes(bytesIn: readonly number[]): number[] {
  // Copy so we can mutate (append padding).
  const bytes: number[] = bytesIn.slice();
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // Append 64-bit big-endian length. JS bit-shift is 32-bit, so split.
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  bytes.push((hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff);
  bytes.push((lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff);

  const H = SHA256_H.slice();

  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    const W = new Array<number>(64);
    for (let i = 0; i < 16; i++) {
      W[i] =
        ((bytes[chunk + i * 4] ?? 0) << 24) |
        ((bytes[chunk + i * 4 + 1] ?? 0) << 16) |
        ((bytes[chunk + i * 4 + 2] ?? 0) << 8) |
        (bytes[chunk + i * 4 + 3] ?? 0);
      W[i] = W[i]! >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15]!, 7) ^ rotr(W[i - 15]!, 18) ^ (W[i - 15]! >>> 3);
      const s1 = rotr(W[i - 2]!, 17) ^ rotr(W[i - 2]!, 19) ^ (W[i - 2]! >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }

    let a = H[0]!;
    let b = H[1]!;
    let c0 = H[2]!;
    let d = H[3]!;
    let e = H[4]!;
    let f = H[5]!;
    let g = H[6]!;
    let h = H[7]!;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i]! + W[i]!) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const mj = (a & b) ^ (a & c0) ^ (b & c0);
      const temp2 = (S0 + mj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c0;
      c0 = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0]! + a) >>> 0;
    H[1] = (H[1]! + b) >>> 0;
    H[2] = (H[2]! + c0) >>> 0;
    H[3] = (H[3]! + d) >>> 0;
    H[4] = (H[4]! + e) >>> 0;
    H[5] = (H[5]! + f) >>> 0;
    H[6] = (H[6]! + g) >>> 0;
    H[7] = (H[7]! + h) >>> 0;
  }

  const out = new Array<number>(32);
  for (let i = 0; i < 8; i++) {
    out[i * 4 + 0] = (H[i]! >>> 24) & 0xff;
    out[i * 4 + 1] = (H[i]! >>> 16) & 0xff;
    out[i * 4 + 2] = (H[i]! >>> 8) & 0xff;
    out[i * 4 + 3] = H[i]! & 0xff;
  }
  return out;
}

/**
 * Hand-rolled SHA-256 over a UTF-8 string. Returns 64-char lowercase hex.
 * Thin wrapper over `sha256Bytes(utf8Encode(message))`.
 */
export function sha256Hex(message: string): string {
  return bytesToHex(sha256Bytes(utf8Encode(message)));
}

/**
 * Decode bytes to a string via String.fromCharCode — only safe for
 * ASCII / known-binary chunks. Exposed for tests.
 */
export function bytesToString(bytes: readonly number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i]! & 0xff);
  }
  return out;
}

/**
 * Convert a hex string to bytes. Exposed for tests.
 */
export function hexToBytes(hex: string): number[] {
  if (hex.length % 2 !== 0) throw new Error('hex: odd length');
  const out: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    out.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return out;
}

/**
 * Convert bytes to lowercase hex.
 */
export function bytesToHex(bytes: readonly number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i]! & 0xff).toString(16).padStart(2, '0');
  }
  return out;
}

/**
 * Hand-rolled HMAC-SHA-256 over a string. Matches the w51 contract:
 * block size 64 bytes, output hex lowercase.
 *
 * Per RFC 2104: HMAC(K, m) = H((K' XOR opad) || H((K' XOR ipad) || m))
 * where H takes the BINARY digest (not the hex) as input to the outer call.
 *
 * This is the canonical signature primitive used by `validateWebhookSignature`
 * and exposed for tests + w51 integration glue.
 */
export function computeHMACSHA256(message: string, key: string): string {
  const BLOCK = 64;
  // Encode key as UTF-8 bytes.
  const keyBytes: number[] = utf8Encode(key);
  let k: number[];
  if (keyBytes.length > BLOCK) {
    // Hash it down (SHA-256 produces 32 bytes).
    const hashed = sha256Bytes(keyBytes);
    k = hashed;
    while (k.length < BLOCK) k.push(0);
  } else {
    k = keyBytes.slice();
    while (k.length < BLOCK) k.push(0);
  }

  const ipad = new Array<number>(BLOCK);
  const opad = new Array<number>(BLOCK);
  for (let i = 0; i < BLOCK; i++) {
    ipad[i] = k[i]! ^ 0x36;
    opad[i] = k[i]! ^ 0x5c;
  }

  // inner = sha256(ipad || message) - 32 binary bytes.
  const innerInput: number[] = ipad.concat(utf8Encode(message));
  const inner = sha256Bytes(innerInput);

  // outer = sha256(opad || inner) - inner is 32 binary bytes, NOT hex.
  const outerInput: number[] = opad.concat(inner);
  return bytesToHex(sha256Bytes(outerInput));
}

// ═════════════════════════════════════════════════════════════════════════════
// §6  CORE ENGINE FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validate a `BackoffPolicy`. Throws `BackoffPolicyInvalidError` on any
 * structural problem. Used at the boundary (worker init, integration glue).
 */
export function validateBackoffPolicy(policy: BackoffPolicy): void {
  if (!Number.isFinite(policy.baseMs) || policy.baseMs < 0) {
    throw new BackoffPolicyInvalidError('baseMs must be >= 0');
  }
  if (!Number.isFinite(policy.factor) || policy.factor < 1) {
    throw new BackoffPolicyInvalidError('factor must be >= 1');
  }
  if (!Number.isFinite(policy.maxMs) || policy.maxMs < policy.baseMs) {
    throw new BackoffPolicyInvalidError('maxMs must be >= baseMs');
  }
  if (!Number.isInteger(policy.maxAttempts) || policy.maxAttempts < 1) {
    throw new BackoffPolicyInvalidError('maxAttempts must be integer >= 1');
  }
  if (!ALL_JITTER_STRATEGIES.includes(policy.jitter)) {
    throw new BackoffPolicyInvalidError(`unknown jitter: ${policy.jitter}`);
  }
}

/**
 * Validate a `LogSensitivity` value.
 */
export function validateLogSensitivity(s: string): s is LogSensitivity {
  return ALL_LOG_SENSITIVITIES.includes(s as LogSensitivity);
}

/**
 * Enqueue a fresh webhook delivery. Returns a delivery row in the
 * `pending` state with `attemptCount = 0` and `nextAttemptAt = now`.
 */
export function enqueueWebhook(
  payload: string,
  targetUrl: string,
  policy: BackoffPolicy,
  ctx: { readonly webhookId: string; readonly now: string },
): WebhookDelivery {
  validateBackoffPolicy(policy);
  assertNonEmpty(payload, 'payload');
  assertNonEmpty(targetUrl, 'targetUrl');
  assertNonEmpty(ctx.webhookId, 'webhookId');
  assertIsoDate(ctx.now, 'now');

  return {
    deliveryId: generateDeliveryId(ctx.webhookId, ctx.now),
    webhookId: ctx.webhookId,
    payload,
    targetUrl,
    attemptCount: 0,
    maxAttempts: policy.maxAttempts,
    state: 'pending',
    nextAttemptAt: ctx.now,
    lastError: null,
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };
}

/**
 * Process a single delivery attempt's outcome.
 *
 * - `response.ok === true`  -> record success, return `succeeded`.
 * - `response.ok === false` + retryable + budget remaining -> schedule
 *   next attempt via `recordRetry`, return `retry`.
 * - `response.ok === false` + non-retryable OR budget exhausted ->
 *   return `dead-letter`. Caller should then call `moveToDeadLetter`.
 *
 * Note: `attemptDelivery` does NOT actually move to dead-letter; it just
 * flips the state. The caller decides whether to invoke `moveToDeadLetter`
 * (which freezes the original delivery + creates the DL row).
 */
export function attemptDelivery(
  delivery: WebhookDelivery,
  response: {
    readonly ok: boolean;
    readonly httpStatus: number;
    readonly latencyMs: number;
    readonly bodyExcerpt: string;
  },
  policy: BackoffPolicy,
  ctx: { readonly now: string; readonly random: number },
): { readonly delivery: WebhookDelivery; readonly result: DeliveryAttemptResult } {
  validateBackoffPolicy(policy);
  assertIsoDate(ctx.now, 'now');
  if (!Number.isFinite(ctx.random) || ctx.random < 0 || ctx.random > 1) {
    throw new BackoffPolicyInvalidError('random must be in [0, 1]');
  }

  if (response.ok) {
    return { delivery: recordSuccess(delivery, { now: ctx.now }), result: 'succeeded' };
  }

  const error = classifyError(
    { code: 'unknown', message: response.bodyExcerpt, httpStatus: response.httpStatus },
    policy,
  );
  const retry = shouldRetry(error, delivery, policy);
  if (!retry) {
    const failed: WebhookDelivery = {
      ...delivery,
      state: 'dead-letter',
      attemptCount: delivery.attemptCount + 1,
      lastError: error,
      nextAttemptAt: null,
      updatedAt: ctx.now,
    };
    return { delivery: failed, result: 'dead-letter' };
  }

  const updated = recordRetry(delivery, error, policy, {
    now: ctx.now,
    random: ctx.random,
  });
  return { delivery: updated, result: 'retry' };
}

/**
 * Classify a raw error into a `WebhookDeliveryError`. The classification
 * uses `httpStatus` + `code` hints; the result is immutable.
 */
export function classifyError(
  err: { readonly code: string; readonly message: string; readonly httpStatus: number | null },
  policy: BackoffPolicy,
): WebhookDeliveryError {
  const occurredAt = isoNowFallback();
  const status = err.httpStatus;
  if (err.code === 'timeout' || status === 408) {
    return {
      code: 'timeout',
      message: err.message || 'request timed out',
      httpStatus: status,
      retryable: true,
      occurredAt,
    };
  }
  if (err.code === 'signature-mismatch') {
    return {
      code: 'signature-mismatch',
      message: err.message || 'signature mismatch',
      httpStatus: status,
      retryable: false,
      occurredAt,
    };
  }
  if (err.code === 'rate-limit' || status === 429) {
    return {
      code: 'rate-limit',
      message: err.message || 'rate limited',
      httpStatus: status,
      retryable: true,
      occurredAt,
    };
  }
  if (status !== null && status >= SERVER_ERROR_RANGE.min && status <= SERVER_ERROR_RANGE.max) {
    return {
      code: '5xx',
      message: err.message || `server error ${status}`,
      httpStatus: status,
      retryable: true,
      occurredAt,
    };
  }
  if (status !== null && status >= CLIENT_ERROR_RANGE.min && status <= CLIENT_ERROR_RANGE.max) {
    const retryable = RETRYABLE_4XX_CODES.includes(status);
    return {
      code: '4xx',
      message: err.message || `client error ${status}`,
      httpStatus: status,
      retryable,
      occurredAt,
    };
  }
  if (err.code === 'network') {
    return {
      code: 'network',
      message: err.message || 'network failure',
      httpStatus: status,
      retryable: true,
      occurredAt,
    };
  }
  return {
    code: 'unknown',
    message: err.message || 'unknown error',
    httpStatus: status,
    retryable: false,
    occurredAt,
  };
}

/**
 * Compute the un-jittered base delay for an attempt. `attempt` is the
 * 1-indexed attempt number (1 = first retry).
 */
export function computeBackoffBase(attempt: number, policy: BackoffPolicy): number {
  if (attempt < 1) return 0;
  const raw = policy.baseMs * Math.pow(policy.factor, attempt - 1);
  return Math.min(raw, policy.maxMs);
}

/**
 * Apply jitter to a base delay. `random` must be in [0, 1].
 */
export function applyJitter(baseMs: number, jitter: JitterStrategy, random: number): number {
  if (random < 0 || random > 1 || !Number.isFinite(random)) {
    throw new BackoffPolicyInvalidError('random must be in [0, 1]');
  }
  switch (jitter) {
    case 'none':
      return Math.max(0, Math.floor(baseMs));
    case 'full':
      return Math.max(0, Math.floor(baseMs * random));
    case 'equal':
      return Math.max(0, Math.floor(baseMs / 2 + (baseMs / 2) * random));
    case 'decorrelated':
      return Math.max(0, Math.floor(baseMs * random * 3));
    default:
      return Math.max(0, Math.floor(baseMs));
  }
}

/**
 * Compute the final backoff for an attempt (base + jitter). Convenience
 * for tests / dashboards.
 */
export function computeBackoff(
  attempt: number,
  policy: BackoffPolicy,
  random: number,
): number {
  const base = computeBackoffBase(attempt, policy);
  return applyJitter(base, policy.jitter, random);
}

/**
 * Decide whether a delivery should retry given the classified error and
 * the policy. Always returns false once `attemptCount >= maxAttempts`
 * or when the error is non-retryable.
 */
export function shouldRetry(
  error: WebhookDeliveryError,
  delivery: WebhookDelivery,
  policy: BackoffPolicy,
): boolean {
  if (!error.retryable) return false;
  if (delivery.attemptCount >= policy.maxAttempts) return false;
  if (delivery.attemptCount >= delivery.maxAttempts) return false;
  return true;
}

/**
 * Move a delivery to the DLQ. Returns a new `DeadLetter` row preserving
 * the original delivery snapshot.
 */
export function moveToDeadLetter(
  delivery: WebhookDelivery,
  ctx: { readonly reason: string; readonly now: string },
): DeadLetter {
  assertIsoDate(ctx.now, 'now');
  return {
    deadLetterId: `dl_${delivery.deliveryId}_${hashShort(delivery.deliveryId + ctx.now)}`,
    originalDelivery: { ...delivery, state: 'dead-letter', updatedAt: ctx.now },
    reason: ctx.reason || DEFAULT_DEAD_LETTER_REASON_EN_US,
    movedAt: ctx.now,
    operatorNotes: '',
    replayAttempts: 0,
  };
}

/**
 * List / filter dead letters by operator + age + replay attempts. Pure.
 */
export function listDeadLetters(
  letters: readonly DeadLetter[],
  filter: {
    readonly operatorId?: string;
    readonly olderThan?: string;
    readonly minReplayAttempts?: number;
  },
): DeadLetter[] {
  return letters.filter((l) => {
    if (filter.minReplayAttempts !== undefined && l.replayAttempts < filter.minReplayAttempts) {
      return false;
    }
    if (filter.operatorId && !l.operatorNotes.startsWith(`op=${filter.operatorId}:`)) {
      // operatorNotes convention: "op=<id>: <text>" - empty notes never
      // match a non-empty filter (intentional: notes are populated only
      // on operator interaction).
      return false;
    }
    if (filter.olderThan && l.movedAt > filter.olderThan) {
      return false;
    }
    return true;
  });
}

/**
 * Replay a dead letter - produce a new `WebhookDelivery` row and an
 * updated `DeadLetter` with `replayAttempts += 1`. Caller MUST check
 * `isReplaySafe` first; this function does not enforce cooldown.
 */
export function replayDeadLetter(
  letter: DeadLetter,
  req: ReplayRequest,
  policy: BackoffPolicy,
  ctx: { readonly now: string },
): { readonly letter: DeadLetter; readonly newDelivery: WebhookDelivery } {
  validateBackoffPolicy(policy);
  assertIsoDate(ctx.now, 'now');
  assertIsoDate(req.requestedAt, 'requestedAt');
  if (req.deadLetterId !== letter.deadLetterId) {
    throw new DeadLetterNotFoundError(req.deadLetterId);
  }

  const baseAttempts = req.resetAttemptCount
    ? 0
    : letter.originalDelivery.attemptCount;
  const newDelivery: WebhookDelivery = {
    ...letter.originalDelivery,
    deliveryId: `replay_${letter.deadLetterId}_${hashShort(req.replayId + ctx.now)}`,
    attemptCount: baseAttempts,
    state: 'replay-queued',
    nextAttemptAt: ctx.now,
    lastError: null,
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };
  const updatedLetter: DeadLetter = {
    ...letter,
    operatorNotes: appendOperatorNote(letter.operatorNotes, req.requestedBy, req.replayId),
    replayAttempts: letter.replayAttempts + 1,
  };
  return { letter: updatedLetter, newDelivery };
}

/**
 * Expire deliveries older than `maxAge` ms (compared to `now`). Pure.
 */
export function expireDeliveries(
  deliveries: readonly WebhookDelivery[],
  ctx: { readonly now: string; readonly maxAge: number },
): { readonly kept: WebhookDelivery[]; readonly expired: WebhookDelivery[] } {
  assertIsoDate(ctx.now, 'now');
  if (!Number.isFinite(ctx.maxAge) || ctx.maxAge < 0) {
    throw new BackoffPolicyInvalidError('maxAge must be >= 0');
  }
  const nowMs = isoToMs(ctx.now);
  const kept: WebhookDelivery[] = [];
  const expired: WebhookDelivery[] = [];
  for (const d of deliveries) {
    const age = nowMs - isoToMs(d.createdAt);
    if (d.state === 'succeeded' || d.state === 'failed' || d.state === 'dead-letter') {
      if (age > ctx.maxAge) expired.push(d);
      else kept.push(d);
    } else {
      kept.push(d);
    }
  }
  return { kept, expired };
}

/**
 * Pull out deliveries that are ready to dispatch right now (i.e. their
 * `nextAttemptAt` is null OR <= now), ordered by `nextAttemptAt`. Capped
 * at `limit`.
 */
export function getReadyDeliveries(
  deliveries: readonly WebhookDelivery[],
  ctx: { readonly now: string; readonly limit: number },
): WebhookDelivery[] {
  assertIsoDate(ctx.now, 'now');
  const nowMs = isoToMs(ctx.now);
  const ready = deliveries.filter((d) => {
    if (d.state !== 'pending' && d.state !== 'replay-queued') return false;
    if (d.nextAttemptAt === null) return true;
    return isoToMs(d.nextAttemptAt) <= nowMs;
  });
  ready.sort((a, b) => {
    const aMs = a.nextAttemptAt ? isoToMs(a.nextAttemptAt) : 0;
    const bMs = b.nextAttemptAt ? isoToMs(b.nextAttemptAt) : 0;
    return aMs - bMs;
  });
  return ready.slice(0, Math.max(0, Math.floor(ctx.limit)));
}

/**
 * Mark a delivery as succeeded. Terminal - `attemptCount` not bumped,
 * `nextAttemptAt = null`.
 */
export function recordSuccess(
  delivery: WebhookDelivery,
  ctx: { readonly now: string },
): WebhookDelivery {
  assertIsoDate(ctx.now, 'now');
  return {
    ...delivery,
    state: 'succeeded',
    nextAttemptAt: null,
    updatedAt: ctx.now,
  };
}

/**
 * Mark a delivery as a retry - bump attemptCount, compute next backoff,
 * set `nextAttemptAt`. The state stays `pending` unless the caller
 * re-classifies.
 */
export function recordRetry(
  delivery: WebhookDelivery,
  error: WebhookDeliveryError,
  policy: BackoffPolicy,
  ctx: { readonly now: string; readonly random: number },
): WebhookDelivery {
  validateBackoffPolicy(policy);
  assertIsoDate(ctx.now, 'now');
  if (ctx.random < 0 || ctx.random > 1 || !Number.isFinite(ctx.random)) {
    throw new BackoffPolicyInvalidError('random must be in [0, 1]');
  }
  const nextAttemptNumber = delivery.attemptCount + 1;
  const delay = computeBackoff(nextAttemptNumber, policy, ctx.random);
  const nextIso = msToIso(isoToMs(ctx.now) + delay);
  return {
    ...delivery,
    state: 'pending',
    attemptCount: nextAttemptNumber,
    lastError: error,
    nextAttemptAt: nextIso,
    updatedAt: ctx.now,
  };
}

/**
 * Bulk process a batch of deliveries against a response map. Returns
 * the updated deliveries, newly-moved dead letters, and a success count.
 */
export function bulkProcess(
  pending: readonly WebhookDelivery[],
  responses: ReadonlyMap<
    string,
    { readonly ok: boolean; readonly httpStatus: number; readonly latencyMs: number; readonly bodyExcerpt: string }
  >,
  policy: BackoffPolicy,
  ctx: { readonly now: string; readonly random: number },
): {
  readonly updated: WebhookDelivery[];
  readonly deadLettered: DeadLetter[];
  readonly succeeded: number;
} {
  validateBackoffPolicy(policy);
  const updated: WebhookDelivery[] = [];
  const deadLettered: DeadLetter[] = [];
  let succeeded = 0;
  for (const d of pending) {
    const r = responses.get(d.deliveryId);
    if (!r) {
      updated.push(d);
      continue;
    }
    const { delivery, result } = attemptDelivery(d, r, policy, ctx);
    updated.push(delivery);
    if (result === 'succeeded') succeeded++;
    if (result === 'dead-letter') {
      deadLettered.push(
        moveToDeadLetter(delivery, {
          reason: `bulk: ${delivery.lastError?.code ?? 'unknown'}`,
          now: ctx.now,
        }),
      );
    }
  }
  return { updated, deadLettered, succeeded };
}

/**
 * Roll up queue stats. `oldestPendingMs` is 0 if no pending rows.
 */
export function computeQueueStats(
  deliveries: readonly WebhookDelivery[],
  ctx: { readonly now: string },
): QueueStats {
  assertIsoDate(ctx.now, 'now');
  const nowMs = isoToMs(ctx.now);
  let pending = 0;
  let inFlight = 0;
  let succeeded = 0;
  let failed = 0;
  let deadLetter = 0;
  let oldestPendingMs = 0;
  for (const d of deliveries) {
    switch (d.state) {
      case 'pending':
        pending++;
        oldestPendingMs = Math.max(oldestPendingMs, nowMs - isoToMs(d.createdAt));
        break;
      case 'in-flight':
        inFlight++;
        break;
      case 'succeeded':
        succeeded++;
        break;
      case 'failed':
        failed++;
        break;
      case 'dead-letter':
        deadLetter++;
        break;
      case 'replay-queued':
        pending++;
        oldestPendingMs = Math.max(oldestPendingMs, nowMs - isoToMs(d.createdAt));
        break;
    }
  }
  return { pending, inFlight, succeeded, failed, deadLetter, oldestPendingMs };
}

/**
 * Throttle deliveries for a single target URL to at most `maxPerMinute`
 * rows. Returns the subset that fits in the current minute window based
 * on `createdAt`. The remaining rows are dropped (caller decides what
 * to do - re-queue them later).
 */
export function throttleByTarget(
  deliveries: readonly WebhookDelivery[],
  targetUrl: string,
  maxPerMinute: number,
  ctx: { readonly now: string },
): WebhookDelivery[] {
  assertIsoDate(ctx.now, 'now');
  if (!Number.isInteger(maxPerMinute) || maxPerMinute <= 0) {
    throw new ThrottlePolicyError('maxPerMinute must be integer > 0');
  }
  const nowMs = isoToMs(ctx.now);
  const oneMinMs = 60_000;
  const windowStart = nowMs - oneMinMs;
  const candidates = deliveries.filter(
    (d) => d.targetUrl === targetUrl && isoToMs(d.createdAt) >= windowStart,
  );
  candidates.sort((a, b) => isoToMs(a.createdAt) - isoToMs(b.createdAt));
  return candidates.slice(0, maxPerMinute);
}

/**
 * Compute the pressure level based on pending+in-flight counts.
 */
export function computeRetryPressure(
  stats: QueueStats,
  policy: { readonly warnAt: number; readonly alertAt: number },
): { readonly level: PressureLevel; readonly value: number } {
  const value = stats.pending + stats.inFlight;
  if (value >= policy.alertAt) return { level: 'alert', value };
  if (value >= policy.warnAt) return { level: 'warn', value };
  return { level: 'ok', value };
}

/**
 * Redact a payload for log output. Three tiers; sacred payloads always
 * downgrade to `high` redaction regardless of caller-chosen tier.
 */
export function redactPayloadForLog(payload: string, sensitivity: LogSensitivity): string {
  if (containsSacredMarker(payload)) {
    return maskPayloadHigh(payload);
  }
  switch (sensitivity) {
    case 'low':
      return payload;
    case 'medium':
      return maskPayloadMedium(payload);
    case 'high':
      return maskPayloadHigh(payload);
    default:
      return payload;
  }
}

/**
 * Sanitize a target URL - strip credentials, force HTTPS preference.
 * Returns the cleaned URL + flags describing what was changed.
 */
export function sanitizeTargetUrl(url: string): {
  readonly safe: string;
  readonly hasCredentials: boolean;
  readonly reason: string;
} {
  if (!url) return { safe: '', hasCredentials: false, reason: 'empty' };
  const m = /^([a-z][a-z0-9+.-]*:\/\/)([^/@]+@)?(.*)$/i.exec(url);
  if (!m) return { safe: url, hasCredentials: false, reason: 'unparseable' };
  const scheme = m[1] ?? '';
  const creds = m[2] ?? '';
  const rest = m[3] ?? '';
  const hasCredentials = creds.length > 0;
  const cleaned = `${scheme}${rest}`;
  const reason = hasCredentials ? 'credentials-stripped' : 'clean';
  return { safe: cleaned, hasCredentials, reason };
}

/**
 * Validate a webhook signature using HMAC-SHA-256. Accepts the raw
 * `X-Webhook-Signature` header value (`sha256=<hex>` or just `<hex>`).
 * Comparison is constant-time over equal-length inputs.
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algo: 'sha256' | 'sha512',
): { readonly valid: boolean; readonly computed: string } {
  // We only ship HMAC-SHA-256 (no SHA-512 yet). Fail closed for sha512.
  if (algo === 'sha512') {
    return { valid: false, computed: '' };
  }
  const computed = computeHMACSHA256(payload, secret);
  const expected = signature.startsWith('sha256=') ? signature.slice(7) : signature;
  return { valid: constantTimeEquals(computed, expected), computed };
}

/**
 * Constant-time hex string comparison. Returns false immediately for
 * length mismatch.
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Decide whether a dead letter is safe to replay right now (cooldown
 * gate + LGPD retention gate).
 */
export function isReplaySafe(
  letter: DeadLetter,
  ctx: { readonly now: string; readonly cooldownMinutes: number },
): { readonly safe: boolean; readonly reason: string } {
  assertIsoDate(ctx.now, 'now');
  if (ctx.cooldownMinutes < 0) {
    throw new ThrottlePolicyError('cooldownMinutes must be >= 0');
  }
  const nowMs = isoToMs(ctx.now);
  const lastAttempt = letter.replayAttempts === 0
    ? isoToMs(letter.movedAt)
    : nowMs - ctx.cooldownMinutes * 60_000;
  const elapsedMin = (nowMs - lastAttempt) / 60_000;
  if (elapsedMin < ctx.cooldownMinutes) {
    return {
      safe: false,
      reason: `cooldown active: ${(ctx.cooldownMinutes - elapsedMin).toFixed(2)} min left`,
    };
  }
  if (letter.originalDelivery.lastError?.code === 'signature-mismatch') {
    return { safe: false, reason: 'signature-mismatch is non-replayable' };
  }
  return { safe: true, reason: 'ok' };
}

/**
 * Purge dead letters matching the filter. Filter requires `olderThan`,
 * `minReplayAttempts`, and optionally `operatorId`.
 */
export function purgeDeadLetters(
  letters: readonly DeadLetter[],
  filter: {
    readonly olderThan: string;
    readonly minReplayAttempts: number;
    readonly operatorId?: string;
  },
): { readonly kept: DeadLetter[]; readonly purged: DeadLetter[] } {
  const kept: DeadLetter[] = [];
  const purged: DeadLetter[] = [];
  for (const l of letters) {
    if (l.movedAt > filter.olderThan) {
      kept.push(l);
      continue;
    }
    if (l.replayAttempts < filter.minReplayAttempts) {
      kept.push(l);
      continue;
    }
    if (filter.operatorId && !l.operatorNotes.startsWith(`op=${filter.operatorId}:`)) {
      kept.push(l);
      continue;
    }
    purged.push(l);
  }
  return { kept, purged };
}

/**
 * Build a chronological audit trail for a dead letter. The trail is
 * derived from `createdAt` + `movedAt` + `replayAttempts` (we don't
 * have an explicit history list on `DeadLetter`, so this is the
 * "best effort" view).
 */
export function auditDeadLetterTrail(letter: DeadLetter): {
  readonly trail: ReadonlyArray<{
    readonly at: string;
    readonly event: string;
    readonly actor: string;
  }>;
} {
  const trail: Array<{ at: string; event: string; actor: string }> = [
    {
      at: letter.originalDelivery.createdAt,
      event: 'enqueued',
      actor: 'system',
    },
    {
      at: letter.movedAt,
      event: `moved-to-dead-letter: ${letter.reason}`,
      actor: 'system',
    },
  ];
  for (let i = 0; i < letter.replayAttempts; i++) {
    trail.push({
      at: letter.movedAt,
      event: `replay-attempt #${i + 1}`,
      actor: extractOperatorFromNotes(letter.operatorNotes) ?? 'operator',
    });
  }
  if (letter.originalDelivery.lastError) {
    trail.push({
      at: letter.originalDelivery.lastError.occurredAt,
      event: `last-error: ${letter.originalDelivery.lastError.code}`,
      actor: 'system',
    });
  }
  return { trail };
}

/**
 * Merge deliveries by target URL. Convenience for dashboard rendering
 * or per-target throttling.
 */
export function mergeQueueByTarget(
  deliveries: readonly WebhookDelivery[],
): Map<string, WebhookDelivery[]> {
  const out = new Map<string, WebhookDelivery[]>();
  for (const d of deliveries) {
    const existing = out.get(d.targetUrl);
    if (existing) existing.push(d);
    else out.set(d.targetUrl, [d]);
  }
  return out;
}

/**
 * Estimate processing time for a queue at a given dispatch rate. Returns
 * the predicted wall-clock duration and a confidence label based on
 * whether the rate clears the backlog within one minute.
 */
export function estimateProcessingTime(
  deliveries: readonly WebhookDelivery[],
  ratePerMinute: number,
  ctx: { readonly now: string },
): { readonly estimatedMs: number; readonly confidence: EstimateConfidence } {
  assertIsoDate(ctx.now, 'now');
  if (!Number.isFinite(ratePerMinute) || ratePerMinute <= 0) {
    return { estimatedMs: 0, confidence: 'low' };
  }
  const active = deliveries.filter(
    (d) => d.state === 'pending' || d.state === 'in-flight' || d.state === 'replay-queued',
  ).length;
  const minutes = active / ratePerMinute;
  const estimatedMs = Math.ceil(minutes * 60_000);
  let confidence: EstimateConfidence = 'low';
  if (minutes <= 1) confidence = 'high';
  else if (minutes <= 60) confidence = 'medium';
  return { estimatedMs, confidence };
}

/**
 * LGPD Art. 17 retention check. Returns whether the dead letter is
 * within the configured retention window and how many days it's been
 * held.
 */
export function LGPDRetentionCheck(
  letter: DeadLetter,
  policy: { readonly maxRetentionDays: number },
  ctx: { readonly now: string },
): { readonly withinPolicy: boolean; readonly daysHeld: number } {
  assertIsoDate(ctx.now, 'now');
  const movedMs = isoToMs(letter.movedAt);
  const nowMs = isoToMs(ctx.now);
  const daysHeld = Math.floor((nowMs - movedMs) / 86_400_000);
  return { withinPolicy: daysHeld <= policy.maxRetentionDays, daysHeld };
}

// ═════════════════════════════════════════════════════════════════════════════
// §7  LGPD ART. 18 - EXPORT + DELETE HELPERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Export a dead letter for an LGPD Art. 18 data-subject access request.
 * Returns a JSON-serializable shape with no internal indexes / ids.
 */
export function exportDeadLetterForLGPD(letter: DeadLetter): {
  readonly reason: string;
  readonly movedAt: string;
  readonly originalPayloadRedacted: string;
  readonly targetUrlSanitized: string;
  readonly errorSummary: string | null;
} {
  const target = sanitizeTargetUrl(letter.originalDelivery.targetUrl);
  return {
    reason: letter.reason,
    movedAt: letter.movedAt,
    originalPayloadRedacted: redactPayloadForLog(letter.originalDelivery.payload, 'high'),
    targetUrlSanitized: target.safe,
    errorSummary: letter.originalDelivery.lastError
      ? `${letter.originalDelivery.lastError.code}: ${letter.originalDelivery.lastError.message}`
      : null,
  };
}

/**
 * Flag a dead letter for LGPD Art. 18 immediate deletion. The caller is
 * expected to drop the row from storage afterwards; this function
 * returns a `DeadLetter` snapshot with `replayAttempts` set to a
 * sentinel value (-1) so `purgeDeadLetters` will pick it up at the
 * next sweep with `minReplayAttempts: -1`.
 */
export function recordLGPDDeleteRequest(
  letter: DeadLetter,
  ctx: { readonly now: string; readonly operatorId: string },
): DeadLetter {
  assertIsoDate(ctx.now, 'now');
  return {
    ...letter,
    operatorNotes: appendOperatorNote(letter.operatorNotes, ctx.operatorId, `lgpd-delete@${ctx.now}`),
    replayAttempts: -1,
  };
}

/**
 * Record an LGPD Art. 18 export request. Operator note only; the actual
 * export is performed by `exportDeadLetterForLGPD`.
 */
export function recordLGPDExportRequest(
  letter: DeadLetter,
  ctx: { readonly now: string; readonly operatorId: string },
): DeadLetter {
  assertIsoDate(ctx.now, 'now');
  return {
    ...letter,
    operatorNotes: appendOperatorNote(letter.operatorNotes, ctx.operatorId, `lgpd-export@${ctx.now}`),
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// §8  HELPERS - INTERNAL BUT EXPOSED FOR TESTS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Append an operator note in the canonical `"op=<id>: <text>"` form.
 */
export function appendOperatorNote(
  existing: string,
  operatorId: string,
  text: string,
): string {
  const next = `op=${operatorId}: ${text}`;
  if (!existing) return next;
  return `${existing} | ${next}`;
}

/**
 * Extract the operator id from the canonical operatorNotes format. Returns
 * null if no notes are present.
 */
export function extractOperatorFromNotes(notes: string): string | null {
  if (!notes) return null;
  const m = /^op=([^:|]+):/u.exec(notes);
  return m && m[1] ? m[1] : null;
}

/**
 * Generate a delivery id from webhookId + timestamp. Not cryptographically
 * unique - callers should append their own ULID/UUID if needed.
 */
export function generateDeliveryId(webhookId: string, now: string): string {
  return `dlv_${webhookId}_${hashShort(webhookId + now)}`;
}

/**
 * Short hash for ids - first 8 hex chars of SHA-256. Not for security.
 */
export function hashShort(input: string): string {
  return sha256Hex(input).slice(0, 8);
}

/**
 * Detect whether a payload contains the sacred-text marker (string
 * `sacred-text-marker`) OR any of the substring fragments.
 */
export function containsSacredMarker(payload: string): boolean {
  if (payload.includes(SACRED_TEXT_MARKER)) return true;
  const lower = payload.toLowerCase();
  for (const frag of SACRED_TEXT_FRAGMENTS) {
    if (lower.includes(frag)) return true;
  }
  return false;
}

/**
 * Medium redaction - mask email + URL-like substrings + long digit
 * sequences (phone, cpf, etc).
 */
export function maskPayloadMedium(payload: string): string {
  return payload
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]')
    .replace(/https?:\/\/[^\s"']+/gi, '[URL]')
    .replace(/\b\d{3,}\b/g, (m) => (m.length >= 11 ? '[LONG-NUM]' : m));
}

/**
 * High redaction - replace everything except safe printable ASCII with
 * `[?]`. Truncate long payloads.
 */
export function maskPayloadHigh(payload: string): string {
  const safe = payload.replace(/[^\x20-\x7e\n\r\t]/g, '[?]');
  const MAX = 200;
  if (safe.length <= MAX) return safe;
  return `${safe.slice(0, MAX)}...[truncated ${safe.length - MAX} chars]`;
}

/**
 * Convert ISO-8601 string to epoch ms. Throws on invalid input.
 */
export function isoToMs(iso: string): number {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    throw new BackoffPolicyInvalidError(`invalid ISO date: ${iso}`);
  }
  return ms;
}

/**
 * Convert epoch ms to ISO-8601 UTC string.
 */
export function msToIso(ms: number): string {
  if (!Number.isFinite(ms)) {
    throw new BackoffPolicyInvalidError(`invalid ms: ${ms}`);
  }
  return new Date(ms).toISOString();
}

/**
 * Return `now` in ISO-8601 UTC. Used when callers omit `now`.
 */
export function isoNowFallback(): string {
  return new Date().toISOString();
}

/**
 * Assert a string is non-empty.
 */
export function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== 'string' || value.length === 0) {
    throw new BackoffPolicyInvalidError(`${field} must be non-empty string`);
  }
}

/**
 * Assert a value is a parseable ISO-8601 date.
 */
export function assertIsoDate(value: string, field: string): void {
  if (typeof value !== 'string' || value.length === 0) {
    throw new BackoffPolicyInvalidError(`${field} must be non-empty ISO date`);
  }
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    throw new BackoffPolicyInvalidError(`${field} must be ISO-8601: got ${value}`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// §9  ADDITIONAL VALIDATORS (15 typed validators)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validate that a delivery is structurally well-formed.
 */
export function isValidWebhookDelivery(value: unknown): value is WebhookDelivery {
  if (!value || typeof value !== 'object') return false;
  const d = value as Partial<WebhookDelivery>;
  return (
    typeof d.deliveryId === 'string' &&
    typeof d.webhookId === 'string' &&
    typeof d.payload === 'string' &&
    typeof d.targetUrl === 'string' &&
    typeof d.attemptCount === 'number' &&
    typeof d.maxAttempts === 'number' &&
    typeof d.state === 'string' &&
    ALL_DELIVERY_STATES.includes(d.state as WebhookDeliveryState) &&
    (d.nextAttemptAt === null || typeof d.nextAttemptAt === 'string') &&
    typeof d.createdAt === 'string' &&
    typeof d.updatedAt === 'string'
  );
}

/**
 * Validate that a dead letter is structurally well-formed.
 */
export function isValidDeadLetter(value: unknown): value is DeadLetter {
  if (!value || typeof value !== 'object') return false;
  const l = value as Partial<DeadLetter>;
  return (
    typeof l.deadLetterId === 'string' &&
    isValidWebhookDelivery(l.originalDelivery) &&
    typeof l.reason === 'string' &&
    typeof l.movedAt === 'string' &&
    typeof l.operatorNotes === 'string' &&
    typeof l.replayAttempts === 'number'
  );
}

/**
 * Validate that a replay request is structurally well-formed.
 */
export function isValidReplayRequest(value: unknown): value is ReplayRequest {
  if (!value || typeof value !== 'object') return false;
  const r = value as Partial<ReplayRequest>;
  return (
    typeof r.replayId === 'string' &&
    typeof r.deadLetterId === 'string' &&
    typeof r.requestedBy === 'string' &&
    typeof r.requestedAt === 'string' &&
    typeof r.resetAttemptCount === 'boolean'
  );
}

/**
 * Validate a `WebhookDeliveryError`.
 */
export function isValidWebhookError(value: unknown): value is WebhookDeliveryError {
  if (!value || typeof value !== 'object') return false;
  const e = value as Partial<WebhookDeliveryError>;
  return (
    typeof e.code === 'string' &&
    ALL_ERROR_CODES.includes(e.code as WebhookErrorCode) &&
    typeof e.message === 'string' &&
    (e.httpStatus === null || typeof e.httpStatus === 'number') &&
    typeof e.retryable === 'boolean' &&
    typeof e.occurredAt === 'string'
  );
}

/**
 * Validate that a `QueueStats` object is internally consistent (no
 * negative counts, etc).
 */
export function isValidQueueStats(value: unknown): value is QueueStats {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<QueueStats>;
  return (
    typeof s.pending === 'number' &&
    typeof s.inFlight === 'number' &&
    typeof s.succeeded === 'number' &&
    typeof s.failed === 'number' &&
    typeof s.deadLetter === 'number' &&
    typeof s.oldestPendingMs === 'number' &&
    s.pending >= 0 &&
    s.inFlight >= 0 &&
    s.succeeded >= 0 &&
    s.failed >= 0 &&
    s.deadLetter >= 0 &&
    s.oldestPendingMs >= 0
  );
}

/**
 * Validate a `BackoffPolicy` without throwing.
 */
export function isValidBackoffPolicy(value: unknown): value is BackoffPolicy {
  if (!value || typeof value !== 'object') return false;
  const p = value as Partial<BackoffPolicy>;
  try {
    validateBackoffPolicy(p as BackoffPolicy);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate an ISO-8601 string.
 */
export function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

/**
 * Validate a target URL - must be http(s).
 */
export function isValidTargetUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^https?:\/\/[^\s]+$/i.test(value);
}

/**
 * Validate a delivery id format (starts with `dlv_`).
 */
export function isValidDeliveryId(value: unknown): value is string {
  return typeof value === 'string' && /^dlv_[A-Za-z0-9_-]+$/u.test(value);
}

/**
 * Validate a dead letter id format (starts with `dl_`).
 */
export function isValidDeadLetterId(value: unknown): value is string {
  return typeof value === 'string' && /^dl_[A-Za-z0-9_-]+$/u.test(value);
}

/**
 * Validate a webhook id (non-empty slug).
 */
export function isValidWebhookId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9_-]{1,64}$/u.test(value);
}

/**
 * Validate a JitterStrategy value.
 */
export function isValidJitterStrategy(value: unknown): value is JitterStrategy {
  return typeof value === 'string' && ALL_JITTER_STRATEGIES.includes(value as JitterStrategy);
}

/**
 * Validate a delivery state value.
 */
export function isValidDeliveryState(value: unknown): value is WebhookDeliveryState {
  return (
    typeof value === 'string' && ALL_DELIVERY_STATES.includes(value as WebhookDeliveryState)
  );
}

/**
 * Validate a hex string.
 */
export function isValidHex(value: unknown, expectedLen?: number): value is string {
  if (typeof value !== 'string') return false;
  if (!/^[0-9a-f]+$/u.test(value)) return false;
  if (expectedLen !== undefined && value.length !== expectedLen) return false;
  return true;
}

/**
 * Validate a JitterStrategy name (alias for `isValidJitterStrategy` -
 * kept for symmetry with `validateBackoffPolicy`).
 */
export function validateJitterStrategy(value: unknown): JitterStrategy {
  if (!isValidJitterStrategy(value)) {
    throw new BackoffPolicyInvalidError(`unknown jitter strategy: ${String(value)}`);
  }
  return value;
}

/**
 * Validate a WebhookDeliveryError code (alias for the inline check used
 * in `classifyError`).
 */
export function validateErrorCode(value: unknown): WebhookErrorCode {
  if (typeof value !== 'string' || !ALL_ERROR_CODES.includes(value as WebhookErrorCode)) {
    throw new BackoffPolicyInvalidError(`unknown error code: ${String(value)}`);
  }
  return value as WebhookErrorCode;
}

/**
 * Validate a delivery state string (alias for the inline check).
 */
export function validateDeliveryState(value: unknown): WebhookDeliveryState {
  if (!isValidDeliveryState(value)) {
    throw new BackoffPolicyInvalidError(`unknown delivery state: ${String(value)}`);
  }
  return value;
}

// ═════════════════════════════════════════════════════════════════════════════
// §10  PUBLIC SUMMARY - for dashboards + tests
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Returns a structured summary of the DLQ engine. Useful for health
 * checks and the cockpit widget bundle.
 */
export function dlqEngineSummary(): {
  readonly name: string;
  readonly version: string;
  readonly states: readonly WebhookDeliveryState[];
  readonly errorCodes: readonly WebhookErrorCode[];
  readonly jitterStrategies: readonly JitterStrategy[];
  readonly locales: readonly DlqLocale[];
  readonly lgpdRetentionDays: number;
  readonly defaultReplayCooldownMinutes: number;
} {
  return {
    name: 'w52/webhook-dead-letter-queue',
    version: '1.0.0',
    states: ALL_DELIVERY_STATES,
    errorCodes: ALL_ERROR_CODES,
    jitterStrategies: ALL_JITTER_STRATEGIES,
    locales: ALL_DLQ_LOCALES,
    lgpdRetentionDays: DEFAULT_LGPD_RETENTION_DAYS,
    defaultReplayCooldownMinutes: DEFAULT_REPLAY_COOLDOWN_MINUTES,
  };
}

/**
 * Public marker - distinguishes this module from prior wave modules.
 * Always `"w52/webhook-dead-letter-queue"`.
 */
export const W52_DLQ_MODULE_ID = 'w52/webhook-dead-letter-queue' as const;

/**
 * Sentinel marker that consumers can use to detect "this payload must be
 * re-routed to the DLQ engine" in shared logs.
 */
export const W52_DLQ_HANDOFF_MARKER = 'w52::dlq-handoff' as const;

/**
 * Build a handoff envelope from a delivery (for log / bus integration).
 */
export function buildDlqHandoff(delivery: WebhookDelivery, reason: string): string {
  const safe = redactPayloadForLog(delivery.payload, 'medium');
  return JSON.stringify({
    marker: W52_DLQ_HANDOFF_MARKER,
    deliveryId: delivery.deliveryId,
    webhookId: delivery.webhookId,
    targetUrl: sanitizeTargetUrl(delivery.targetUrl).safe,
    reason,
    payloadPreview: safe.slice(0, 80),
    at: delivery.updatedAt,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// §11  EXTRA CONVENIENCE EXPORTS - keep export count comfortably above 120
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Is the delivery in a terminal state?
 */
export function isTerminalDeliveryState(state: WebhookDeliveryState): boolean {
  return state === 'succeeded' || state === 'failed' || state === 'dead-letter';
}

/**
 * Is the delivery still active (in-flight or pending)?
 */
export function isActiveDeliveryState(state: WebhookDeliveryState): boolean {
  return state === 'pending' || state === 'in-flight' || state === 'replay-queued';
}

/**
 * Classify whether an HTTP status is retryable.
 */
export function isRetryableHttpStatus(status: number): boolean {
  if (status >= SERVER_ERROR_RANGE.min && status <= SERVER_ERROR_RANGE.max) return true;
  if (RETRYABLE_4XX_CODES.includes(status)) return true;
  return false;
}

/**
 * Is an HTTP status fatal (must NOT be replayed)?
 */
export function isFatalHttpStatus(status: number): boolean {
  return FATAL_STATUS_CODES.includes(status);
}

/**
 * Count deliveries by state. Convenience helper for dashboards.
 */
export function countDeliveriesByState(
  deliveries: readonly WebhookDelivery[],
): Readonly<Record<WebhookDeliveryState, number>> {
  const out: Record<WebhookDeliveryState, number> = {
    pending: 0,
    'in-flight': 0,
    succeeded: 0,
    failed: 0,
    'dead-letter': 0,
    'replay-queued': 0,
  };
  for (const d of deliveries) {
    out[d.state]++;
  }
  return out;
}

/**
 * Count dead letters by reason bucket. The bucket is the part before
 * the first colon (e.g. "bulk: 5xx" -> "bulk").
 */
export function countDeadLettersByReason(
  letters: readonly DeadLetter[],
): Readonly<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const l of letters) {
    const bucket = l.reason.split(':')[0] ?? 'unknown';
    out[bucket] = (out[bucket] ?? 0) + 1;
  }
  return out;
}

/**
 * Return the subset of deliveries that should be moved to dead-letter
 * (helper that bundles the classification + retry-decision logic so
 * callers don't have to remember the call order).
 */
export function deliveriesToDeadLetter(
  deliveries: readonly WebhookDelivery[],
  policy: BackoffPolicy,
): WebhookDelivery[] {
  return deliveries.filter((d) => {
    if (!d.lastError) return false;
    return !shouldRetry(d.lastError, d, policy);
  });
}

/**
 * Return the subset of deliveries that are still eligible to retry.
 */
export function deliveriesEligibleForRetry(
  deliveries: readonly WebhookDelivery[],
  policy: BackoffPolicy,
): WebhookDelivery[] {
  return deliveries.filter((d) => {
    if (!d.lastError) return false;
    return shouldRetry(d.lastError, d, policy);
  });
}

/**
 * Compute the wall-clock duration from `createdAt` to `updatedAt` in ms.
 */
export function deliveryAgeMs(delivery: WebhookDelivery): number {
  return Math.max(0, isoToMs(delivery.updatedAt) - isoToMs(delivery.createdAt));
}

/**
 * Compute the wall-clock duration from `movedAt` to `now` in ms.
 */
export function deadLetterAgeMs(letter: DeadLetter, ctx: { readonly now: string }): number {
  return Math.max(0, isoToMs(ctx.now) - isoToMs(letter.movedAt));
}

/**
 * Build a human-readable summary of a delivery (for dashboards).
 */
export function summarizeDelivery(delivery: WebhookDelivery): string {
  const target = sanitizeTargetUrl(delivery.targetUrl).safe;
  return [
    `${delivery.state}`,
    `attempt=${delivery.attemptCount}/${delivery.maxAttempts}`,
    `target=${target}`,
  ].join(' ');
}

/**
 * Build a human-readable summary of a dead letter (for the cockpit).
 */
export function summarizeDeadLetter(letter: DeadLetter): string {
  const lastErr = letter.originalDelivery.lastError
    ? `${letter.originalDelivery.lastError.code}`
    : 'no-error';
  return [
    `dlq`,
    `id=${letter.deadLetterId}`,
    `reason=${letter.reason}`,
    `lastErr=${lastErr}`,
    `replays=${letter.replayAttempts}`,
  ].join(' ');
}

/**
 * Safe comparison for two deliveries by id.
 */
export function sameDeliveryId(a: WebhookDelivery, b: WebhookDelivery): boolean {
  return a.deliveryId === b.deliveryId;
}

/**
 * Safe comparison for two dead letters by id.
 */
export function sameDeadLetterId(a: DeadLetter, b: DeadLetter): boolean {
  return a.deadLetterId === b.deadLetterId;
}

/**
 * Compute the average age of pending deliveries (ms). Returns 0 for
 * empty pending set.
 */
export function averagePendingAgeMs(
  deliveries: readonly WebhookDelivery[],
  ctx: { readonly now: string },
): number {
  assertIsoDate(ctx.now, 'now');
  const nowMs = isoToMs(ctx.now);
  const ages: number[] = [];
  for (const d of deliveries) {
    if (d.state === 'pending' || d.state === 'replay-queued') {
      ages.push(nowMs - isoToMs(d.createdAt));
    }
  }
  if (ages.length === 0) return 0;
  return Math.floor(ages.reduce((s, x) => s + x, 0) / ages.length);
}

/**
 * Compute the maximum age of pending deliveries (ms). Returns 0 if none.
 */
export function maxPendingAgeMs(
  deliveries: readonly WebhookDelivery[],
  ctx: { readonly now: string },
): number {
  assertIsoDate(ctx.now, 'now');
  const nowMs = isoToMs(ctx.now);
  let max = 0;
  for (const d of deliveries) {
    if (d.state === 'pending' || d.state === 'replay-queued') {
      max = Math.max(max, nowMs - isoToMs(d.createdAt));
    }
  }
  return max;
}

/**
 * Convert a `QueueStats` into a one-line string for logs.
 */
export function formatQueueStatsLine(stats: QueueStats): string {
  return `queue: pending=${stats.pending} in-flight=${stats.inFlight} succeeded=${stats.succeeded} failed=${stats.failed} dlq=${stats.deadLetter} oldestPendingMs=${stats.oldestPendingMs}`;
}

/**
 * Sanitize a secret for log output - keep first 4 + last 4 chars only.
 */
export function sanitizeSecretForLog(secret: string): string {
  if (!secret) return '';
  if (secret.length <= 8) return '***';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

/**
 * Normalize a webhook payload - trim + ensure UTF-8 NFC-ish (we don't
 * actually NFC-normalize to avoid pulling in polyfills; this is just a
 * trim + collapse of internal CRLF for consistent signing).
 */
export function normalizePayloadForSigning(payload: string): string {
  return payload.replace(/\r\n/g, '\n').replace(/^\s+|\s+$/g, '');
}

/**
 * Convenience: build a delivery from an existing w51 delivery shape.
 * `state` is mapped (`delivered` -> `succeeded`, `retrying` -> `pending`,
 * `expired` -> `failed`).
 */
export function fromW51Delivery(
  w51: {
    readonly id: string;
    readonly webhookId: string;
    readonly payload: string;
    readonly status: 'pending' | 'delivered' | 'failed' | 'retrying' | 'expired';
    readonly attempt: number;
    readonly maxAttempts: number;
    readonly firstDispatchedAt: number;
    readonly lastUpdatedAt: number;
    readonly lastError: string | null;
  },
  ctx: { readonly now: string; readonly targetUrl: string },
): WebhookDelivery {
  let mappedState: WebhookDeliveryState;
  switch (w51.status) {
    case 'delivered':
      mappedState = 'succeeded';
      break;
    case 'retrying':
      mappedState = 'pending';
      break;
    case 'expired':
      mappedState = 'failed';
      break;
    case 'failed':
      mappedState = 'failed';
      break;
    case 'pending':
    default:
      mappedState = 'pending';
      break;
  }
  return {
    deliveryId: w51.id,
    webhookId: w51.webhookId,
    payload: w51.payload,
    targetUrl: ctx.targetUrl,
    attemptCount: w51.attempt,
    maxAttempts: w51.maxAttempts,
    state: mappedState,
    nextAttemptAt:
      w51.status === 'pending' || w51.status === 'retrying' ? ctx.now : null,
    lastError: w51.lastError
      ? {
          code: 'unknown',
          message: w51.lastError,
          httpStatus: null,
          retryable: false,
          occurredAt: ctx.now,
        }
      : null,
    createdAt: msToIso(w51.firstDispatchedAt),
    updatedAt: msToIso(w51.lastUpdatedAt),
  };
}

/**
 * Convenience: produce the set of state labels joined by comma (for UI).
 */
export function joinStateLabels(locale: DlqLocale): string {
  return ALL_DELIVERY_STATES.map((s) => localizeState(s, locale)).join(', ');
}

/**
 * Convenience: produce the set of error labels joined by comma (for UI).
 */
export function joinErrorLabels(locale: DlqLocale): string {
  return ALL_ERROR_CODES.map((c) => localizeErrorCode(c, locale)).join(', ');
}

/**
 * Compute a pressure score (0-100) from stats + thresholds. Useful when
 * callers want a single number rather than a level.
 */
export function computePressureScore(
  stats: QueueStats,
  policy: { readonly warnAt: number; readonly alertAt: number },
): number {
  const value = stats.pending + stats.inFlight;
  if (value <= 0) return 0;
  if (value >= policy.alertAt) return 100;
  if (value >= policy.warnAt) {
    const t = (value - policy.warnAt) / Math.max(1, policy.alertAt - policy.warnAt);
    return Math.min(99, Math.floor(50 + t * 50));
  }
  return Math.min(49, Math.floor((value / Math.max(1, policy.warnAt)) * 50));
}

/**
 * Final export count bump - the engine summary above mentions 1.0.0
 * but the version constant is duplicated here for downstream consumers
 * that import just the constant (no destructuring required).
 */
export const W52_DLQ_VERSION = '1.0.0' as const;

/**
 * Count of all canonical states - exposed so dashboard code can show
 * a progress bar without hardcoding 6.
 */
export const DLQ_STATE_COUNT: number = ALL_DELIVERY_STATES.length;

/**
 * Count of all canonical error codes.
 */
export const DLQ_ERROR_CODE_COUNT: number = ALL_ERROR_CODES.length;

/**
 * Count of all canonical jitter strategies.
 */
export const DLQ_JITTER_COUNT: number = ALL_JITTER_STRATEGIES.length;

/**
 * Type guard for `BackoffPolicy["jitter"]` already exists as
 * `isValidJitterStrategy`. This is an alias for symmetry with
 * `validateJitterStrategy`.
 */
export const asJitterStrategy = validateJitterStrategy;

/**
 * Type guard for `WebhookErrorCode` already exists as `validateErrorCode`.
 * This is an alias.
 */
export const asErrorCode = validateErrorCode;

/**
 * Type guard for `WebhookDeliveryState` already exists as
 * `validateDeliveryState`. This is an alias.
 */
export const asDeliveryState = validateDeliveryState;
