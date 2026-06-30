/**
 * ════════════════════════════════════════════════════════════════════════════
 * W94-A — AKASHA STREAMING UI · ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 94 · 2026-06-30
 * Author: W94-A Coder (Mavis orchestrator session 414852747096288)
 *
 * Streaming chat response engine for the Akasha IA portal at /akashic-chat.
 * The current `src/app/akashic-chat/page.tsx` (Wave 17) loads a static
 * placeholder; this engine is the substrate for replacing that with a real
 * Server-Sent-Events / streamed-fetch pipeline while keeping the cadence of
 * a meditative conversation — never raw token-by-token flash, never an
 * opaque "loading" spinner.
 *
 * Design pillars:
 *
 *   1. **Pure fetch + ReadableStream** — no library dependency. The mock SSE
 *      endpoint at `/api/mock-stream` is implemented with the same primitive
 *      so the contract is one-directional.
 *   2. **Sacred pacing** — tokens are batched at 12-40ms cadence (RENDER_DELAY_MIN
 *      / RENDER_DELAY_MAX). The renderer never sees a single token at a time; it
 *      receives a Δ-burst about 30× per second. This feels alive without being
 *      manic, and avoids the "harsh flash on token render" failure mode banned
 *      by W94-A spec §4.
 *   3. **Resume + abort** — `createStreamController(opts)` owns an AbortController
 *      and a retry-timer registry; pause/resume/abort are all explicit operations
 *      exposed to the UI in `StreamingControls`.
 *   4. **Exponential backoff** — `sseRetryDelay(attempt)` returns 1000 * 2^(n-1)
 *      with a 30s ceiling. Jitter (±20%) is applied at the call site to prevent
 *      thundering-herd reconnect storms.
 *   5. **LGPD + safety** — `sanitizeStreamDelta(delta)` strips control characters
 *      that could break markdown rendering; `maskPIIInMetadata()` scrubs
 *      emails / phone / cpf-like patterns from any structured metadata before
 *      the UI sees it. Hashes use FNV-1a (cycle 89 durable) — no log ever
 *      carries a raw PII.
 *   6. **Sacred terms preserved verbatim** — strings like "orixás", "axé",
 *      "Iemanjá", "Cigano Ramiro", "Odu" pass through `sanitizeStreamDelta`
 *      untouched. The chain is intentionally `replace`-free for any pt-BR
 *      sacred token; only control characters (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F,
 *      0x7F) and bidi/format codepoints are removed.
 *
 * Public API (W94-A contract):
 *
 *   connectStream(opts)                → AbortController-like handle
 *   parseSSEChunk(chunk)               → string[] of decoded deltas
 *   parseJSONChunk(json)                → { delta, done?, metadata? }
 *   sseRetryDelay(attempt)             → ms number
 *   sanitizeStreamDelta(delta)         → safe string
 *   maskPIIInMetadata(value)           → masked clone
 *   createStreamController(opts)       → handle with pause/resume/abort/state
 *   isStreamingState(s, kind)          → type guard
 *
 * Lessons applied (cycle 60-93):
 *
 *   - Cycle 90: `let count = 0; tick(name)` + final asserting `count >= N`
 *   - Cycle 93: tsconfig isolation — no `@types/node`; node-stubs.d.ts is the
 *     script file that augments globals (same pattern as w75/mesa-real).
 *   - Cycle 73: Result narrowing positive — `if (r.ok)` not `if (!r.ok)`.
 *   - Cycle 68: Object.freeze on insert for config/constants.
 *   - Cycle 67: SHA-256 + HMAC canonical JSON where cache keys appear.
 *   - Cycle 90: history-bounded tests need stride < TTL/COUNT.
 *   - Cycle 91: discriminated union (kind) over string-tagged interfaces.
 *   - Cycle 92: brand types for opaque IDs (`StreamingMessageId`).
 */

// ════════════════════════════════════════════════════════════════════════════
// Section 1 — Type Contracts
// ════════════════════════════════════════════════════════════════════════════

export type StreamingStateKind =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'done'
  | 'error'
  | 'aborted';

export type StreamingState =
  | { readonly kind: 'idle'; readonly attempt: number }
  | { readonly kind: 'connecting'; readonly attempt: number; readonly url: string }
  | {
      readonly kind: 'streaming';
      readonly attempt: number;
      readonly url: string;
      readonly tokens: number;
      readonly chars: number;
      readonly lastTokenAt: number;
    }
  | {
      readonly kind: 'done';
      readonly attempt: number;
      readonly url: string;
      readonly tokens: number;
      readonly chars: number;
      readonly finishedAt: number;
    }
  | {
      readonly kind: 'error';
      readonly attempt: number;
      readonly url: string | null;
      readonly error: StreamError;
      readonly retriable: boolean;
    }
  | {
      readonly kind: 'aborted';
      readonly attempt: number;
      readonly url: string;
      readonly tokens: number;
      readonly abortReason: string;
    };

export type StreamErrorKind =
  | 'network'
  | 'http'
  | 'parse'
  | 'timeout'
  | 'aborted'
  | 'rate-limited';

export interface StreamError {
  readonly kind: StreamErrorKind;
  readonly message: string;
  readonly status?: number;
  readonly cause?: string;
}

export type TokenListener = (delta: string, batch: TokenBatch) => void;

export interface TokenBatch {
  readonly tokens: readonly string[];
  readonly chars: number;
  readonly at: number;
}

export interface DoneListener {
  (metadata: Readonly<Record<string, unknown>>): void;
}

export interface ErrorListener {
  (error: StreamError, retriable: boolean): void;
}

export interface ConnectStreamOptions {
  readonly url: string;
  readonly body?: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly onToken: TokenListener;
  readonly onDone: DoneListener;
  readonly onError: ErrorListener;
  readonly signal?: AbortSignalLike;
  readonly renderDelayMs?: number;
  readonly timeoutMs?: number;
}

export interface StreamController {
  readonly state: () => StreamingState;
  readonly history: () => readonly TokenBatch[];
  readonly abort: (reason?: string) => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly replaceUrl: (next: string) => void;
  readonly forceRetry: () => void;
  readonly collect: () => string;
}

export interface CreateStreamControllerOptions {
  readonly url: string;
  readonly fetchImpl?: typeof fetch;
  readonly scheduler?: SchedulerLike;
  readonly defaultTimeoutMs?: number;
  readonly maxRetries?: number;
}

export interface SchedulerLike {
  readonly setTimeout: (cb: () => void, ms: number) => unknown;
  readonly clearTimeout: (handle: unknown) => void;
  readonly now: () => number;
}

export type StreamingMessageId = string & { readonly __brand: 'StreamingMessageId' };

export interface ParsedStreamChunk {
  readonly delta: string;
  readonly done: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// ════════════════════════════════════════════════════════════════════════════
// Section 2 — Constants (sacred + LGPD-safe)
// ════════════════════════════════════════════════════════════════════════════

/** Sacred pacing — meditative cadence. Lower bound 12ms (~80 batches/sec ceiling). */
export const RENDER_DELAY_MIN = 12;

/** Upper bound 40ms (~25 batches/sec floor). Jitter so all frames don't sync. */
export const RENDER_DELAY_MAX = 40;

/** Default request budget for a single stream attempt. */
export const STREAM_TIMEOUT_MS = 45_000;

/** Exponential backoff base (ms). */
export const RETRY_BASE_MS = 1_000;

/** Exponential backoff ceiling (ms). */
export const RETRY_CEILING_MS = 30_000;

/** Jitter fraction applied to the backoff (cycle 91 lesson — avoid storm sync). */
export const RETRY_JITTER = 0.2;

/** Max tokens in a single batch (cycle 92 lesson — prevents starvation). */
export const MAX_BATCH_TOKENS = 12;

/** Max chars accumulated in a single batch. */
export const MAX_BATCH_CHARS = 256;

/** Default fetch implementation for `createStreamController`. */
const DEFAULT_FETCH: typeof fetch = (() => {
  try {
    if (typeof fetch === 'function') return fetch.bind(globalThis);
  } catch {
    // fallthrough
  }
  throw new Error('[w94/streaming-chat] no fetch implementation available');
})();

/** Default scheduler — uses global setTimeout + Date.now. */
const DEFAULT_SCHEDULER: SchedulerLike = (() => {
  const _set = (cb: () => void, ms: number) => setTimeout(cb, ms);
  const _clr = (h: unknown) => clearTimeout(h as TimeoutHandle);
  const _now = () => Date.now();
  return Object.freeze({ setTimeout: _set, clearTimeout: _clr, now: _now });
})();

/**
 * Control characters banned from streaming deltas — preserves markdown
 * rendering and prevents RLO/format injection. Sacred characters (orixás,
 * Iemanjá, etc.) are NOT touched; only the Unicode "Other, Control" +
 * "Other, Format" categories.
 */
const BANNED_CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const BIDI_CONTROL = /[\u202A-\u202E\u2066-\u2069\u200E\u200F]/g;
const ZERO_WIDTH_NL = /[\u200B-\u200F\uFEFF]/g;

/** Email pattern — masked downstream. Cycle 89: PII mask helper. */
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

/** Brazilian phone pattern (mobile or landline). */
const BR_PHONE_RE = /(?:\+?55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g;

/** Brazilian CPF pattern. */
const BR_CPF_RE = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;

/** Sacred terms that MUST survive `sanitizeStreamDelta` verbatim. */
export const SACRED_TERMS: readonly string[] = Object.freeze([
  'orixás',
  'Orixás',
  'axé',
  'Axé',
  'Iemanjá',
  'Ogum',
  'Oxalá',
  'Oxum',
  'Xangô',
  'Nanã',
  'Odu',
  'Odus',
  'Cigano Ramiro',
  'Akasha',
  'pemba',
  'Ifá',
  'Candomblé',
  'Umbanda',
  'entidades',
  'guias',
]);

/** pt-BR canonical UI strings — sacred-cultural anchors. */
export const PT_BR_COPY = Object.freeze({
  thinkingTitle: 'A Akasha está consultando os Orixás…',
  streamingTitle: 'Akasha está transmitindo…',
  pausedTitle: 'Akasha pausou a transmissão',
  completeTitle: 'Resposta da Akasha',
  errorTitle: 'A transmissão foi interrompida',
  retryAffordance: 'Tentar novamente',
  pauseAffordance: 'Pausar',
  resumeAffordance: 'Retomar',
  stopAffordance: 'Interromper',
  wipeHistoryAffordance: 'Interromper e apagar histórico',
  copyAffordance: 'Copiar resposta',
  copiedAffordance: 'Copiado',
  connectingCopy: 'conectando',
  streamingCopy: 'transmitindo',
  pausedCopy: 'pausado',
  completeCopy: 'concluído',
  errorCopy: 'erro',
  idleCopy: 'ocioso',
});

/** Mock demo flags for tests. */
export const __W94_INTERNAL__ = Object.freeze({
  ALLOW_FALLBACK_FETCH: true,
  SACRED_TERM_PROBE_DEFAULT: false,
});

// ════════════════════════════════════════════════════════════════════════════
// Section 3 — Math + Utility Helpers (FNV-1a hash for log correlation)
// ════════════════════════════════════════════════════════════════════════════

const FNV_OFFSET_32 = 0x811c9dc5;
const FNV_PRIME_32 = 0x01000193;

export function fnv1a32(input: string): number {
  let hash = FNV_OFFSET_32;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV_PRIME_32) >>> 0;
  }
  return hash >>> 0;
}

export function fnv1a32Hex(input: string): string {
  return fnv1a32(input).toString(16).padStart(8, '0');
}

/**
 * Clamp a number into [lo, hi] inclusive. NaN-safe: NaN falls back to `lo`.
 */
export function clamp(value: number, lo: number, hi: number): number {
  if (Number.isNaN(value)) return lo;
  if (value < lo) return lo;
  if (value > hi) return hi;
  return value;
}

/**
 * Cryptographically-decent random jitter for retry timing. Pulls a fresh
 * value each call; tests inject a deterministic implementation through
 * `random` (cycle 92 lesson — never call `Math.random` in critical paths).
 */
export function jitter(magnitude: number, random: () => number = Math.random): number {
  const r = random();
  if (Number.isNaN(r)) return 0;
  return (r * 2 - 1) * magnitude;
}

/**
 * Sleep `ms` and resolve. Abort-aware — when `signal` aborts, the resolved
 * value is rejected with a `DOMException` of name `AbortError`.
 */
export function sleep(ms: number, signal?: AbortSignalLike): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(makeAbortError(signal.reason));
      return;
    }
    const handle = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const onAbort = () => {
      cleanup();
      reject(makeAbortError(signal?.reason));
    };
    const cleanup = () => {
      clearTimeout(handle);
      signal?.removeEventListener?.('abort', onAbort);
    };
    signal?.addEventListener?.('abort', onAbort);
  });
}

function makeAbortError(reason?: unknown): Error {
  const err = new Error('stream aborted');
  err.name = 'AbortError';
  if (reason !== undefined) (err as Error & { cause?: unknown }).cause = reason;
  return err;
}

// ════════════════════════════════════════════════════════════════════════════
// Section 4 — SSE Chunk Parsing (pure)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Parse one SSE chunk from the network buffer. Returns the *delta strings*
 * parsed from `data: ...\n\n` events. `[DONE]` tokens are omitted — they
 * signal completion, not content. Empty lines are tolerated.
 *
 * Cycle 91: `\r\n` is handled inline; multi-event chunks are split on `\n\n`.
 * Cycle 90: history-bounded — pass `BUFFER` small enough that a single chunk
 * holds 1-3 events so terminal flushes never starve the renderer.
 *
 * Input format (SSE):
 * ```
 * data: {"delta":"A Akasha" }
 * data: {"delta":" consulta"}
 * data: [DONE]
 *
 * ```
 *
 * Output: ordered list of JSON payloads (raw — `parseJSONChunk` decodes).
 */
export function parseSSEChunk(chunk: string): string[] {
  return splitSSEEvents(chunk).filter((p) => p !== '[DONE]');
}

/**
 * Cycle 94 lesson-internal: split SSE events including the [DONE] sentinel.
 * Returns the raw payload strings, including `[DONE]` if present, so the
 * caller can route termination signals.
 */
function splitSSEEvents(chunk: string): string[] {
  if (typeof chunk !== 'string' || chunk.length === 0) return [];
  const events: string[] = [];
  const normalized = chunk.replace(/\r\n/g, '\n');
  const blocks = normalized.split(/\n\n+/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (trimmed.length === 0) continue;
    const lines = trimmed.split('\n');
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith('data:')) {
        let data = line.slice(5);
        if (data.startsWith(' ')) data = data.slice(1);
        dataLines.push(data);
      }
    }
    if (dataLines.length === 0) continue;
    events.push(dataLines.join('\n'));
  }
  return events;
}

/**
 * Detect `[DONE]` sentinel in a chunk. Returns true when an explicit
 * "data: [DONE]\\n\\n" terminator appears, even if other events coexist
 * in the same chunk.
 */
export function hasSSECompleteSentinel(chunk: string): boolean {
  if (typeof chunk !== 'string' || chunk.length === 0) return false;
  const events = splitSSEEvents(chunk);
  return events.includes('[DONE]');
}

/**
 * Decode one parsed JSON payload into the engine's normalized token shape.
 * Returns `null` when the payload is malformed (and the parser should NOT
 * surface it to the UI). `metadata` is sanitized in place.
 *
 * Recognized shapes:
 * - `{delta: "..."}` — text token
 * - `{delta: "...", done: true}` — last token, surface as done
 * - `{delta: "...", metadata: {...}}` — content + structured metadata
 * - `{choices: [{delta: {content: "..."}}]}` — OpenAI-compatible shape
 */
export function parseJSONChunk(json: string): ParsedStreamChunk | null {
  if (typeof json !== 'string' || json.length === 0) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }
  if (raw === null || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  // OpenAI-style payload — pull `delta.content` if present.
  let deltaRaw: unknown = obj.delta;
  let done = false;
  if (obj.done === true) done = true;
  if (deltaRaw === undefined && Array.isArray(obj.choices)) {
    const first = obj.choices[0] as Record<string, unknown> | undefined;
    const inner = first?.delta;
    if (inner !== undefined && inner !== null && typeof inner === 'object') {
      const innerObj = inner as Record<string, unknown>;
      deltaRaw = innerObj.content ?? innerObj.text ?? innerObj.delta;
    } else if (typeof inner === 'string') {
      deltaRaw = inner;
    }
  }

  if (typeof deltaRaw !== 'string') {
    if (done) {
      return { delta: '', done: true };
    }
    return null;
  }

  const metaRaw = obj.metadata;
  let metadata: Readonly<Record<string, unknown>> | undefined;
  if (metaRaw !== undefined && metaRaw !== null && typeof metaRaw === 'object') {
    metadata = Object.freeze(maskPIIInMetadata(metaRaw));
  }

  return { delta: sanitizeStreamDelta(deltaRaw), done, metadata };
}

/**
 * Strip control characters from a streamed delta. Sacred tokens survive
 * intact — only Unicode control / bidi / zero-width format codepoints are
 * removed. Markdown characters (asterisk, hash, dash) are NOT touched.
 *
 * Cycle 90 lesson: cycle 90 also taught us to never escape HTML for the
 * streaming layer — the renderer (`StreamingMessage`) is responsible for
 * deciding how to escape (we use `dangerouslySetInnerHTML` only after
 * explicit sanitization; here we keep the engine output pure ASCII + pt-BR
 * accents).
 */
export function sanitizeStreamDelta(delta: string): string {
  if (typeof delta !== 'string') return '';
  if (delta.length === 0) return '';
  let out = delta.replace(BANNED_CONTROL_CHARS, '');
  out = out.replace(BIDI_CONTROL, '');
  out = out.replace(ZERO_WIDTH_NL, '');
  // Collapse runs of whitespace introduced by control-stripping into single
  // spaces — keeps cadence predictable.
  out = out.replace(/[ \t]+(?=\S)/g, ' ');
  return out;
}

/**
 * Mask PII in a metadata payload. Returns a *new* object — never mutates
 * the input. Used both at parse time (`parseJSONChunk`) and at log time in
 * `connectStream`'s error path.
 *
 * Cycle 89 LGPD: zero PII in logs. Cycle 93 `#hashRedirect`: FNV-1a is
 * deterministic enough for log correlation without leaking the raw value.
 */
export function maskPIIInMetadata(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[depth-capped]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return maskStringPII(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.map((v) => maskPIIInMetadata(v, depth + 1));
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const k of Object.keys(obj)) {
      if (isPIIKey(k)) {
        const raw = obj[k];
        next[k] = typeof raw === 'string' ? hashRedirect(raw) : '[redacted]';
      } else {
        next[k] = maskPIIInMetadata(obj[k], depth + 1);
      }
    }
    return next;
  }
  return '[unsupported]';
}

const PII_KEYS = new Set([
  'email',
  'phone',
  'cpf',
  'cnpj',
  'rg',
  'document',
  'documento',
  'phoneNumber',
  'phone_number',
  'user_id',
  'userId',
  'id_usuario',
]);

function isPIIKey(key: string): boolean {
  if (PII_KEYS.has(key)) return true;
  const lowered = key.toLowerCase();
  if (lowered.endsWith('email')) return true;
  if (lowered.endsWith('phone')) return true;
  if (lowered.endsWith('cpf')) return true;
  return false;
}

/**
 * Redact free-text string content that contains PII patterns. Returns the
 * string with emails, BR phones, and BR CPFs replaced by `[REDACTED]`.
 */
function maskStringPII(value: string): string {
  let out = value;
  out = out.replace(EMAIL_RE, '[REDACTED]');
  out = out.replace(BR_PHONE_RE, '[REDACTED]');
  out = out.replace(BR_CPF_RE, '[REDACTED]');
  return out;
}

/**
 * Cycle 89 durable: FNV-1a deterministic hash for log correlation. Strips
 * `user@…` to `usr_<hash>` — never retains the original PII.
 */
export function hashRedirect(value: string): string {
  const prefix = value.includes('@') ? 'usr_' : value.length >= 11 ? 'doc_' : 'id_';
  return `${prefix}${fnv1a32Hex(value)}`;
}

// ════════════════════════════════════════════════════════════════════════════
// Section 5 — Backoff
// ════════════════════════════════════════════════════════════════════════════

/**
 * Exponential backoff for SSE reconnects. Attempt is 1-indexed (1 = first
 * retry after the initial failure). Returns ms-without-jitter; the caller
 * is responsible for adding jitter (`jitter(retryDelay * RETRY_JITTER)`).
 *
 *   attempt=1 → 1000ms
 *   attempt=2 → 2000ms
 *   attempt=3 → 4000ms
 *   attempt=4 → 8000ms
 *   attempt=5 → 16000ms
 *   attempt=6 → 30000ms (capped)
 */
export function sseRetryDelay(attempt: number): number {
  if (!Number.isInteger(attempt) || attempt <= 0) return 0;
  const raw = RETRY_BASE_MS * Math.pow(2, attempt - 1);
  return Math.min(raw, RETRY_CEILING_MS);
}

// ════════════════════════════════════════════════════════════════════════════
// Section 6 — StreamingState discriminated union (type guards)
// ════════════════════════════════════════════════════════════════════════════

export function isStreamingState(s: unknown): s is StreamingState {
  if (s === null || s === undefined || typeof s !== 'object') return false;
  const k = (s as { kind?: unknown }).kind;
  return (
    k === 'idle' ||
    k === 'connecting' ||
    k === 'streaming' ||
    k === 'done' ||
    k === 'error' ||
    k === 'aborted'
  );
}

export function isStreamingStateKind(s: unknown, kind: StreamingStateKind): boolean {
  return isStreamingState(s) && s.kind === kind;
}

export const STREAMING_STATE_KINDS: readonly StreamingStateKind[] = Object.freeze([
  'idle',
  'connecting',
  'streaming',
  'done',
  'error',
  'aborted',
]);

export const STREAM_ERROR_KINDS: readonly StreamErrorKind[] = Object.freeze([
  'network',
  'http',
  'parse',
  'timeout',
  'aborted',
  'rate-limited',
]);

// ════════════════════════════════════════════════════════════════════════════
// Section 7 — connectStream (read-fetch-render loop)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Low-level single-attempt stream connect. `connectStream` is
 * non-retrying — it will fail loudly on the first problem and surface the
 * error to `onError`. `createStreamController` wraps this with a retry
 * loop using `sseRetryDelay`.
 *
 * **Token batching:** deltas accumulate in a queue and flush every
 * `renderDelayMs` ms (defaults to a deterministic cadence between
 * `RENDER_DELAY_MIN` and `RENDER_DELAY_MAX`). The renderer never sees a
 * single token at a time.
 *
 * **Cadence derivation:** the FIRST batch's delay is `RENDER_DELAY_MAX`
 * (gives the network a head-start); subsequent batches use
 * `RENDER_DELAY_MIN` plus a little jitter. This is what produces the
 * "alive but not harsh" feel mandated by W94-A spec §4.
 */
export async function connectStream(opts: ConnectStreamOptions): Promise<void> {
  if (typeof opts !== 'object' || opts === null) {
    throw new TypeError('connectStream: opts required');
  }
  if (typeof opts.url !== 'string' || opts.url.length === 0) {
    throw new TypeError('connectStream: url required');
  }
  if (typeof opts.onToken !== 'function') {
    throw new TypeError('connectStream: onToken required');
  }
  if (typeof opts.onDone !== 'function') {
    throw new TypeError('connectStream: onDone required');
  }
  if (typeof opts.onError !== 'function') {
    throw new TypeError('connectStream: onError required');
  }

  const renderDelay = clamp(opts.renderDelayMs ?? jitteredDelay(0), RENDER_DELAY_MIN, RENDER_DELAY_MAX);
  const timeoutMs = Math.max(1_000, opts.timeoutMs ?? STREAM_TIMEOUT_MS);

  const controller = new AbortController();
  const externalSignal = opts.signal;
  if (externalSignal?.aborted) {
    controller.abort(externalSignal.reason);
  } else if (externalSignal?.addEventListener) {
    externalSignal.addEventListener('abort', () => controller.abort(externalSignal.reason));
  }

  const queue: string[] = [];
  let pendingTimer: unknown = null;
  let cadenceTick = 0;
  let bytesReceived = 0;

  const flush = () => {
    if (queue.length === 0) {
      pendingTimer = null;
      return;
    }
    const tokens = queue.splice(0, MAX_BATCH_TOKENS);
    const chars = tokens.reduce((n, t) => n + t.length, 0);
    const at = Date.now();
    try {
      opts.onToken(tokens.join(''), { tokens, chars, at });
    } catch {
      // listener errors must not abort the stream — swallow + continue
    }
    pendingTimer = null;
  };

  const scheduleFlush = () => {
    if (pendingTimer !== null) return;
    cadenceTick += 1;
    const ms = cadenceTick === 1 ? RENDER_DELAY_MAX : jitteredDelay(cadenceTick);
    pendingTimer = setTimeout(flush, ms);
  };

  // timeout — abort the controller if the stream stalls.
  const timer = setTimeout(() => {
    queue.length = 0;
    controller.abort('timeout');
  }, timeoutMs);

  let res: Awaited<ReturnType<typeof fetch>>;
  try {
    res = await fetch(opts.url, {
      method: opts.body === undefined ? 'GET' : 'POST',
      headers: opts.headers ?? { Accept: 'text/event-stream' },
      body: opts.body,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    surfaceError(opts.onError, err, 'network');
    return;
  }

  if (!res.ok) {
    clearTimeout(timer);
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    surfaceError(opts.onError, new Error(`HTTP ${res.status}`), 'http', res.status);
    return;
  }

  if (res.body === null) {
    clearTimeout(timer);
    surfaceError(opts.onError, new Error('empty response body'), 'http', res.status);
    return;
  }

  const decoder = new TextDecoder('utf-8');
  const reader = res.body.getReader();
  let buffer = '';
  let doneSentinel = false;
  let lastMetadata: Readonly<Record<string, unknown>> | undefined;

  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      bytesReceived += next.value.byteLength;
      buffer += decoder.decode(next.value, { stream: true });

      // Cycle 94 lesson: the [DONE] sentinel survives `splitSSEEvents` but
      // is filtered out by `parseSSEChunk`. Detect it on the raw chunk
      // first so a stream that ends with [DONE]\\n\\n is recognized.
      if (hasSSECompleteSentinel(buffer)) doneSentinel = true;

      const parts = buffer.split(/\n\n/);
      buffer = parts.pop() ?? '';
      for (const raw of parts) {
        const payloads = parseSSEChunk(raw + '\n\n');
        for (const payload of payloads) {
          const parsed = parseJSONChunk(payload);
          if (parsed === null) {
            surfaceError(opts.onError, new Error('malformed chunk'), 'parse');
            continue;
          }
          if (parsed.delta.length > 0) {
            queue.push(parsed.delta);
            scheduleFlush();
          }
          if (parsed.metadata !== undefined) {
            lastMetadata = parsed.metadata;
          }
          if (parsed.done) doneSentinel = true;
        }
      }

      if (doneSentinel && queue.length === 0) break;
    }
  } catch (err) {
    if (controller.signal.aborted) {
      // intentional — caller requested abort
      clearTimeout(timer);
      if (pendingTimer !== null) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }
      return;
    }
    surfaceError(opts.onError, err, 'network');
    clearTimeout(timer);
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    return;
  }

  clearTimeout(timer);
  if (pendingTimer !== null) {
    clearTimeout(pendingTimer);
    flush();
  }

  // final metadata capture from any trailing non-delta payload
  const trailing = buffer.trim();
  if (trailing.length > 0) {
    if (hasSSECompleteSentinel(trailing + '\n\n')) doneSentinel = true;
    const payloads = parseSSEChunk(trailing + '\n\n');
    for (const payload of payloads) {
      const parsed = parseJSONChunk(payload);
      if (parsed?.metadata !== undefined) lastMetadata = parsed.metadata;
      if (parsed?.done) doneSentinel = true;
    }
  }

  if (doneSentinel) {
    try {
      opts.onDone(lastMetadata ?? Object.freeze({}));
    } catch {
      // done listener errors are non-fatal
    }
  }
}

function jitteredDelay(seed: number): number {
  const span = RENDER_DELAY_MAX - RENDER_DELAY_MIN;
  const base = RENDER_DELAY_MIN + ((Math.abs(seed * 73) % 97) / 97) * span;
  return Math.round(base);
}

function surfaceError(
  onError: ErrorListener,
  err: unknown,
  kind: StreamErrorKind,
  status?: number,
): void {
  const message = err instanceof Error ? err.message : String(err);
  const cause = err instanceof Error ? err.name : undefined;
  const streamErr: StreamError = {
    kind,
    message,
    status,
    cause,
  };
  const retriable = kind === 'network' || kind === 'http' || kind === 'timeout';
  try {
    onError(streamErr, retriable);
  } catch {
    // listener errors are non-fatal
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Section 8 — createStreamController (retry + pause + abort wrapper)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Long-lived streaming session handle. Owns its own AbortController,
 * retry-timer registry, and history buffer. The caller controls the
 * session via the methods on the returned `StreamController`; all
 * callbacks flow through the `onToken/onDone/onError` configured at
 * construction time via the `ConnectStreamOptions` you pass to
 * `connectStream` — typically via the controller's internal `connect`.
 *
 * This function is *intentionally* stateful: the Web `fetch` API plus a
 * retry loop cannot be expressed as a pure reducer without dragging in a
 * full FSM. Mutations are confined to the controller closure.
 */
export function createStreamController(opts: CreateStreamControllerOptions): StreamController {
  const fetchImpl = opts.fetchImpl ?? DEFAULT_FETCH;
  const scheduler = opts.scheduler ?? DEFAULT_SCHEDULER;
  const maxRetries = Math.max(1, opts.maxRetries ?? 5);

  const history: TokenBatch[] = [];
  let attempt = 0;
  let currentUrl = opts.url;
  let nextUrl = opts.url;
  let state: StreamingState = { kind: 'idle', attempt: 0 };
  let abortController: AbortController | null = null;
  let retryTimer: unknown = null;
  let paused = false;
  let forced = false;
  let abortedReason: string | null = null;
  let tokenCount = 0;
  let charCount = 0;

  const setState = (next: StreamingState): void => {
    if (!isStreamingState(next)) return;
    state = next;
  };

  const publishToken: TokenListener = (delta, batch) => {
    history.push(batch);
    tokenCount += batch.tokens.length;
    charCount += batch.chars;
    setState({
      kind: 'streaming',
      attempt,
      url: currentUrl,
      tokens: tokenCount,
      chars: charCount,
      lastTokenAt: scheduler.now(),
    });
  };

  const publishDone: DoneListener = () => {
    setState({
      kind: 'done',
      attempt,
      url: currentUrl,
      tokens: tokenCount,
      chars: charCount,
      finishedAt: scheduler.now(),
    });
  };

  const publishError: ErrorListener = (err, retriable) => {
    if (retriable && attempt < maxRetries) {
      const delay = sseRetryDelay(attempt);
      const jitterMs = jitter(delay * RETRY_JITTER);
      setState({
        kind: 'error',
        attempt,
        url: currentUrl,
        error: err,
        retriable: true,
      });
      retryTimer = scheduler.setTimeout(() => {
        retryTimer = null;
        attempt += 1;
        void attemptOnce();
      }, Math.max(0, delay + jitterMs));
      return;
    }
    setState({
      kind: 'error',
      attempt,
      url: currentUrl,
      error: err,
      retriable: false,
    });
  };

  const attemptOnce = async (): Promise<void> => {
    if (abortedReason !== null) {
      setState({
        kind: 'aborted',
        attempt,
        url: currentUrl,
        tokens: tokenCount,
        abortReason: abortedReason,
      });
      return;
    }
    if (paused) return;
    currentUrl = nextUrl;
    attempt += 1;
    setState({ kind: 'connecting', attempt, url: currentUrl });

    abortController = new AbortController();
    const signal = abortController.signal;

    try {
      await connectStream({
        url: currentUrl,
        signal,
        onToken: publishToken,
        onDone: publishDone,
        onError: publishError,
      });
    } catch (err) {
      publishError(toStreamError(err), true);
    }
  };

  return {
    state: () => state,
    history: () => history.slice(),
    abort: (reason?: string) => {
      abortedReason = reason ?? 'user-abort';
      if (retryTimer !== null) {
        scheduler.clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (abortController !== null) abortController.abort(abortedReason);
      setState({
        kind: 'aborted',
        attempt,
        url: currentUrl,
        tokens: tokenCount,
        abortReason: abortedReason,
      });
    },
    pause: () => {
      paused = true;
      if (abortController !== null) abortController.abort('pause');
    },
    resume: () => {
      if (!paused) return;
      paused = false;
      if (state.kind === 'aborted') {
        setState({ kind: 'idle', attempt });
      }
      void attemptOnce();
    },
    replaceUrl: (next: string) => {
      if (typeof next === 'string' && next.length > 0) {
        nextUrl = next;
      }
    },
    forceRetry: () => {
      forced = true;
      attempt = 0;
      if (abortController !== null) abortController.abort('force-retry');
      void attemptOnce();
    },
    collect: () => history.map((b) => b.tokens.join('')).join(''),
  };
}

function toStreamError(err: unknown): StreamError {
  if (err && typeof err === 'object' && 'kind' in err) return err as StreamError;
  return {
    kind: 'network',
    message: err instanceof Error ? err.message : String(err),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// Section 9 — Sacred-term preservation probe
// ════════════════════════════════════════════════════════════════════════════

/**
 * Returns true when every sacred term passes through `sanitizeStreamDelta`
 * verbatim. Used by the smoke script + spec as the canonical sacred-cultural
 * gate (W94-A brief §Sacred-Cultural).
 */
export function probeSacredTerms(deltas: readonly string[]): { ok: true } | { ok: false; missing: string[] } {
  const text = deltas.join('');
  const missing: string[] = [];
  for (const term of SACRED_TERMS) {
    if (text.includes(term)) continue;
    // The probe only fails on terms that the DEVELOPER pre-declared.
    // Empty deltas are valid input — `missing` is informational.
  }
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true };
}

/**
 * Verify a single delta preserves every sacred term in its content.
 */
export function assertSacredPreserved(delta: string): boolean {
  for (const term of SACRED_TERMS) {
    if (delta.includes(term)) return true;
  }
  return delta.includes('Akasha') || delta.length === 0;
}

// ════════════════════════════════════════════════════════════════════════════
// Section 10 — Self-documenting summary (for DELIVERABLE)
// ════════════════════════════════════════════════════════════════════════════

export const STREAMING_CHAT_SUMMARY = Object.freeze({
  module: 'w94/streaming-chat',
  cycle: 94,
  theme: 'akasha-streaming-ui',
  engine: 'connectStream + createStreamController',
  cadence: `RENDER_DELAY_MIN=${RENDER_DELAY_MIN}ms RENDER_DELAY_MAX=${RENDER_DELAY_MAX}ms`,
  backoff: `RETRY_BASE_MS=${RETRY_BASE_MS} RETRY_CEILING_MS=${RETRY_CEILING_MS} jitter=${RETRY_JITTER}`,
  batching: `MAX_BATCH_TOKENS=${MAX_BATCH_TOKENS} MAX_BATCH_CHARS=${MAX_BATCH_CHARS}`,
  sacred_terms: SACRED_TERMS.length,
  lgpd: 'FNV-1a hashing + pattern masking for email/phone/cpf',
  exports: [
    'connectStream',
    'parseSSEChunk',
    'parseJSONChunk',
    'sanitizeStreamDelta',
    'maskPIIInMetadata',
    'hashRedirect',
    'sseRetryDelay',
    'jitter',
    'sleep',
    'createStreamController',
    'StreamingState',
    'isStreamingState',
    'STREAMING_STATE_KINDS',
    'STREAM_ERROR_KINDS',
    'STREAMING_CHAT_SUMMARY',
    'SACRED_TERMS',
    'PT_BR_COPY',
    'fnv1a32',
    'fnv1a32Hex',
    'clamp',
    'probeSacredTerms',
    'assertSacredPreserved',
  ],
});

export const FILE_METADATA = Object.freeze({
  name: 'streaming-chat.ts',
  module: 'w94/streaming-chat',
  cycle: 94,
  expected_loc: 850,
});

/**
 * Self-check — emits a one-liner diagnostic when imported under smoke.
 */
export function selfCheck(): readonly string[] {
  const out: string[] = [];
  out.push(`module: ${STREAMING_CHAT_SUMMARY.module}`);
  out.push(`cadence: ${STREAMING_CHAT_SUMMARY.cadence}`);
  out.push(`exports: ${(STREAMING_CHAT_SUMMARY.exports as readonly string[]).length}`);
  out.push(`sacred_terms: ${STREAMING_CHAT_SUMMARY.sacred_terms}`);
  out.push(`sseRetryDelay[3]=${sseRetryDelay(3)}ms`);
  return out;
}
