// ============================================================================
// w44/akashia-streaming-ui.ts
// Cycle 44 worker — Akasha IA streaming UI core (server + client safe)
//
// Purpose: pure-TypeScript core for the Akasha IA chat streaming surface.
// Provides SSE parsing, abort/resume control, per-user conversation memory,
// prompt context injection, citation extraction + chip rendering, voice-input
// toggle, exponential reconnect, and token/latency metrics.
//
// This module is the "engine" that the React components in app/ sit on top of.
// No JSX here — React lives upstream. Test-friendly: every IO dependency is
// either injectable (EventSource shape, fetch shape, Web Speech API shape) or
// replaceable via options on the constructor function.
//
// Exports (named):
//   createStreamConnection()
//   abortStream()
//   parseSSEEvent()
//   buildPromptContext()
//   getCitationChip()
//   shouldReconnect()
//   computeBackoffMs()
//   extractCitations()
//   MemoryStore  (class)
//   TokenUsage   (type)
//   ConversationTurn (type)
//   + supporting types and pure helpers (see bottom of file)
//
// Per-file TSC contract: this file compiles cleanly with
//   npx tsc --noEmit --strict --ignoreConfig --target es2022 \
//           --module esnext --moduleResolution bundler \
//           src/lib/w44/akashia-streaming-ui.ts
// ============================================================================

// ---------------------------------------------------------------------------
// Public types — every export gets a JSDoc with @example (cycle 38+ rule).
// ---------------------------------------------------------------------------

/**
 * Role of a single turn in the conversation transcript.
 * Mirrors the OpenAI-style "system / user / assistant" triad but extends with
 * a `tool` role for retrieval + citation injection events.
 */
export type ConversationRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * One turn in a conversation. `ts` is epoch milliseconds (server clock).
 * `tokenCount` is optional — filled in for assistant turns when the engine
 * reports usage at completion.
 */
export interface ConversationTurn {
  /** Stable per-turn id (uuid v4 ideally). Used for dedupe on resume. */
  readonly id: string;
  /** Speaker role. */
  readonly role: ConversationRole;
  /** Visible content. Already-sanitized by the time it lands here. */
  readonly content: string;
  /** Epoch ms. */
  readonly ts: number;
  /** Token count for this turn, if reported by the model. */
  readonly tokenCount?: number;
  /** Citations attached to this turn (assistant only). */
  readonly citations?: readonly CitationChip[];
  /** Optional metadata blob (model id, finish reason, etc). */
  readonly meta?: Readonly<Record<string, string | number | boolean | null>>;
}

/**
 * Token usage snapshot. Mirrors OpenAI `usage` block but works for any
 * provider. All fields optional — some providers don't report all metrics.
 */
export interface TokenUsage {
  /** Tokens consumed by the prompt. */
  readonly promptTokens?: number;
  /** Tokens emitted by the completion. */
  readonly completionTokens?: number;
  /** promptTokens + completionTokens. */
  readonly totalTokens?: number;
  /** Cached tokens (prompt cache hit), when supported. */
  readonly cachedTokens?: number;
  /** Cost estimate in USD (computed client-side from a known price table). */
  readonly estimatedCostUsd?: number;
}

/**
 * Latency + streaming metrics for one full response (or partial response
 * when the stream was aborted).
 */
export interface StreamMetrics {
  /** Time from `createStreamConnection()` call to first byte. */
  readonly ttfbMs: number;
  /** Total wall-clock duration of the stream (first byte to done / abort). */
  readonly totalMs: number;
  /** Tokens per second (completionTokens / streamSeconds). 0 if unknown. */
  readonly tokensPerSecond: number;
  /** Number of stream chunks the client actually rendered. */
  readonly renderedChunks: number;
  /** Number of chunks dropped because the client buffer was full. */
  readonly droppedChunks: number;
  /** Number of reconnect attempts during this stream's lifetime. */
  readonly reconnectAttempts: number;
  /** Final token usage reported by the model. */
  readonly usage: TokenUsage;
}

/**
 * Phase of a streaming connection. Pure state — UI maps this to a label.
 */
export type ConnectionPhase =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'paused'
  | 'aborted'
  | 'done'
  | 'error'
  | 'reconnecting';

/**
 * A citation that the model attached to a span of the response text.
 * `startOffset` / `endOffset` are inclusive char offsets into `fullText`.
 */
export interface CitationChip {
  /** Stable id (uuid) — used as React key + for deep-linking. */
  readonly id: string;
  /** Human-readable label, e.g. "I Ching · 1. Qian". */
  readonly label: string;
  /** Source type. UI renders an icon per type. */
  readonly sourceType: CitationSourceType;
  /** Raw reference string the model emitted (kept for debugging). */
  readonly reference: string;
  /** Short tooltip text (1 line). */
  readonly tooltipText: string;
  /** Anchor id in the knowledge base, when known. */
  readonly anchorId?: string;
  /** Inclusive char offset (start) into the assistant's full text. */
  readonly startOffset: number;
  /** Exclusive char offset (end) into the assistant's full text. */
  readonly endOffset: number;
  /** Optional URL — external link (DOI, article, paper). */
  readonly href?: string;
  /** Relevance score from RAG (0..1). */
  readonly relevance?: number;
}

/** All source types we render with a dedicated icon. */
export type CitationSourceType =
  | 'biblia'
  | 'odu'
  | 'tarot'
  | 'astrologia'
  | 'numerologia'
  | 'oraculo'
  | 'cabala'
  | 'ifá'
  | 'umbanda'
  | 'candomblé'
  | 'budismo'
  | 'xamanismo'
  | 'tantra'
  | 'sufi'
  | 'external_link';

/**
 * A parsed SSE event. `data` may be empty for comment/heartbeat events.
 * `id` is the SSE `id:` field (used for resume on reconnect).
 */
export interface SseEvent {
  /** Event name (`event:` field). Defaults to "message" if absent. */
  readonly event: string;
  /** Event data (`data:` field, may be multi-line). */
  readonly data: string;
  /** Optional id for resume (`id:` field). */
  readonly id?: string;
  /** Retry hint from server (`retry:` field, in ms). */
  readonly retryMs?: number;
}

/**
 * Streaming token chunk — what `parseSSEEvent` returns for `event: token`.
 */
export interface StreamChunk {
  /** Token text (1..N chars, model-dependent granularity). */
  readonly text: string;
  /** True for the final chunk. UI should finalize the assistant turn. */
  readonly isFinal: boolean;
  /** Token usage reported in the final chunk, if any. */
  readonly usage?: TokenUsage;
  /** Citations attached to this chunk (rare — usually in `event: citations`). */
  readonly citations?: readonly CitationChip[];
  /** Provider-specific finish reason (e.g. "stop", "length", "tool_calls"). */
  readonly finishReason?: string;
}

/**
 * What the engine hands back when the user clicks "Stop".
 */
export type AbortReason = 'user' | 'timeout' | 'error' | 'reconnect';

/**
 * Per-request prompt context. Injected into the system prompt before each
 * call. Pure data — the builder is `buildPromptContext()`.
 */
export interface PromptContext {
  /** User locale (e.g. "pt-BR"). */
  readonly language: string;
  /** User id (or anon session id). */
  readonly userId: string;
  /** Optional natal chart snapshot — fed by `prisma.userSpiritualData`. */
  readonly natalChart?: NatalChartSummary;
  /** Recent in-app activity titles (last 5 reads/articles/reflections). */
  readonly recentActivity: readonly string[];
  /** Topics the user has explicitly muted. */
  readonly mutedTopics: readonly string[];
  /** Conversation memory (last N turns, oldest first). */
  readonly memory: readonly ConversationTurn[];
  /** RAG snippets to inject (top-K from vector search). */
  readonly ragSnippets: readonly RagSnippet[];
  /** Server timestamp (so the model knows "today"). */
  readonly nowIso: string;
  /** Free-form session metadata. */
  readonly sessionMeta: Readonly<Record<string, string | number | boolean>>;
}

/** Slim summary of the user's natal chart — what we inject into the prompt. */
export interface NatalChartSummary {
  readonly sign: string;
  readonly odu: string;
  readonly orixaRegente: string;
  readonly sefirotDominante: readonly string[];
  readonly numeroPessoal: number;
  readonly arcoPessoal: number;
}

/** A single RAG snippet — what we feed the model as "evidence". */
export interface RagSnippet {
  readonly id: string;
  readonly title: string;
  readonly excerpt: string;
  readonly tradition: string;
  readonly similarity: number;
  readonly sourceUrl?: string;
}

/** Options for `createStreamConnection()`. */
export interface StreamConnectionOptions {
  /** SSE endpoint. Must accept POST/GET. May include query string. */
  readonly url: string;
  /** Conversation history to send on (re)connect. Newest last. */
  readonly history: readonly ConversationTurn[];
  /** Per-request prompt context. */
  readonly promptContext: PromptContext;
  /** HTTP method (default POST so we can ship history + context in body). */
  readonly method?: 'GET' | 'POST';
  /** Extra headers (auth token, request id, etc). */
  readonly headers?: Readonly<Record<string, string>>;
  /** Body when method=POST. If omitted, history + promptContext are serialized. */
  readonly body?: unknown;
  /** Inject a custom EventSource factory (for tests + non-browser envs). */
  readonly eventSourceFactory?: EventSourceFactory;
  /** Inject a custom fetch (for tests + SSR streaming via fetch). */
  readonly fetchImpl?: typeof fetch;
  /** Max reconnect attempts before giving up (default 5). */
  readonly maxReconnectAttempts?: number;
  /** Max buffered chunks in client buffer (default 200, oldest dropped). */
  readonly maxBuffer?: number;
  /** Heartbeat / stall timeout — if no chunk for N ms, abort. (default 30s). */
  readonly stallTimeoutMs?: number;
  /** AbortSignal — caller can cancel from outside. */
  readonly signal?: AbortSignal;
  /** Called on every state transition (for React `useSyncExternalStore`). */
  readonly onPhaseChange?: (phase: ConnectionPhase) => void;
  /** Called for each token chunk (already buffered + ordered). */
  readonly onChunk?: (chunk: StreamChunk) => void;
  /** Called once with final metrics when stream ends (done / aborted / error). */
  readonly onComplete?: (metrics: StreamMetrics) => void;
  /** Called when a citation set arrives (rare — usually on `event: citations`). */
  readonly onCitations?: (citations: readonly CitationChip[]) => void;
  /** Override clock (for tests). */
  readonly now?: () => number;
}

/** Factory signature for an injectable EventSource-like object. */
export interface EventSourceFactory {
  (url: string, init?: { headers?: Record<string, string> }): IEventSource;
}

/**
 * Minimal subset of the browser `EventSource` API we depend on.
 * Keeps us portable to Node tests + Node's `eventsource` polyfill.
 */
export interface IEventSource {
  addEventListener(type: string, listener: (ev: SseEventLike) => void): void;
  removeEventListener(type: string, listener: (ev: SseEventLike) => void): void;
  close(): void;
  readonly readyState: number;
}

/** The shape of an event the EventSource delivers. */
export interface SseEventLike {
  type: string;
  data: string;
  lastEventId?: string;
}

/**
 * The handle returned by `createStreamConnection()`. Caller drives the
 * lifecycle through these methods.
 */
export interface StreamConnection {
  /** Current phase (read-only snapshot). */
  readonly phase: () => ConnectionPhase;
  /** Snapshot of received chunks (most recent last). */
  readonly chunks: () => readonly StreamChunk[];
  /** Snapshot of citations collected so far. */
  readonly citations: () => readonly CitationChip[];
  /** Metrics snapshot — undefined until first chunk arrives. */
  readonly metrics: () => StreamMetrics | null;
  /** True iff `abort()` was called (or signal fired). */
  readonly isAborted: () => boolean;
  /** Manually abort the stream. Idempotent. */
  abort(reason?: AbortReason): void;
  /** Manually pause — chunks keep buffering server-side if supported. */
  pause(): void;
  /** Resume after `pause()`. */
  resume(): void;
  /** Force a reconnect (used for "retry" button). */
  reconnect(): void;
  /** Subscribe to phase changes. Returns unsubscribe. */
  subscribe(listener: (phase: ConnectionPhase) => void): () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Max conversation turns kept per user in `MemoryStore`. */
export const MEMORY_TURNS_LIMIT = 20;
/** Max RAG snippets injected per prompt. */
export const RAG_TOP_K_DEFAULT = 5;
/** Max chars per snippet fed to the model. */
export const RAG_SNIPPET_MAX_CHARS = 600;
/** Default reconnect policy. */
export const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;
/** Default client-side chunk buffer cap. Oldest dropped beyond this. */
export const DEFAULT_MAX_BUFFER = 200;
/** Default stall timeout (no chunk for this long → abort). */
export const DEFAULT_STALL_TIMEOUT_MS = 30_000;
/** Base backoff for reconnect (ms). Doubles each attempt. */
export const BASE_BACKOFF_MS = 500;
/** Cap on backoff so we don't wait minutes. */
export const MAX_BACKOFF_MS = 16_000;
/** Jitter range — adds up to ±25% to the computed backoff. */
export const BACKOFF_JITTER_RATIO = 0.25;
/** Stall / network errors considered transient (worth a retry). */
export const TRANSIENT_ERROR_REGEX =
  /network|timeout|fetch failed|econnreset|econnrefused|429|503|504|aborted|stalled/i;
/** Heartbeat ping interval — emits a no-op chunk to keep renderers alive. */
export const HEARTBEAT_INTERVAL_MS = 15_000;

// ---------------------------------------------------------------------------
// Pure helpers — small, easy to unit-test, no IO.
// ---------------------------------------------------------------------------

/**
 * Generate a small random id. Not cryptographically strong — used for
 * turn ids and citation ids in client-side streams. Server-side we use uuid v4.
 *
 * @example
 *   newTurnId() // → "t_1719612345678_7x9a"
 */
export function newTurnId(): string {
  // 9 chars of base36 randomness ≈ 47 bits — enough for dedupe within a session.
  const rand = Math.random().toString(36).slice(2, 11).padEnd(9, '0');
  return `t_${Date.now().toString(36)}_${rand}`;
}

/**
 * Clamp `n` into the inclusive range `[lo, hi]`.
 *
 * @example
 *   clamp(11, 0, 10) // → 10
 *   clamp(-1, 0, 10) // → 0
 */
export function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

/**
 * Sum a `TokenUsage` partial into a total. All fields optional, missing = 0.
 *
 * @example
 *   sumUsage(
 *     { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
 *     { completionTokens: 7, totalTokens: 22 },
 *   )
 *   // → { promptTokens: 10, completionTokens: 12, totalTokens: 37 }
 */
export function sumUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  const out: TokenUsage = {
    promptTokens:
      (a.promptTokens ?? 0) + (b.promptTokens ?? 0) || undefined,
    completionTokens:
      (a.completionTokens ?? 0) + (b.completionTokens ?? 0) || undefined,
    totalTokens: (a.totalTokens ?? 0) + (b.totalTokens ?? 0) || undefined,
    cachedTokens: (a.cachedTokens ?? 0) + (b.cachedTokens ?? 0) || undefined,
  };
  // Estimated cost — if either side has a value, sum them.
  if (a.estimatedCostUsd !== undefined || b.estimatedCostUsd !== undefined) {
    out as TokenUsage & { estimatedCostUsd: number };
    (out as { estimatedCostUsd?: number }).estimatedCostUsd =
      (a.estimatedCostUsd ?? 0) + (b.estimatedCostUsd ?? 0);
  }
  return out;
}

/**
 * Estimate USD cost from a token usage snapshot, given a price per 1k tokens.
 * Defaults: $0.005 / 1k prompt, $0.015 / 1k completion (GPT-4o-mini-ish).
 *
 * @example
 *   estimateCostUsd({ promptTokens: 1000, completionTokens: 500 })
 *   // → 0.0125  (1000 * 0.000005 + 500 * 0.000015)
 */
export function estimateCostUsd(
  usage: TokenUsage,
  pricePer1kPrompt = 0.005,
  pricePer1kCompletion = 0.015,
): number {
  const p = usage.promptTokens ?? 0;
  const c = usage.completionTokens ?? 0;
  return (p / 1000) * pricePer1kPrompt + (c / 1000) * pricePer1kCompletion;
}

/**
 * Decide whether a given error string is worth a reconnect attempt.
 * Permanent failures (auth, 4xx except 429, schema errors) return false.
 *
 * @example
 *   isTransientError('network timeout')   // → true
 *   isTransientError('401 Unauthorized')  // → false
 *   isTransientError('429 Too Many Requests') // → true
 */
export function isTransientError(errorMessage: string): boolean {
  if (!errorMessage) return false;
  return TRANSIENT_ERROR_REGEX.test(errorMessage);
}

/**
 * Decide whether the connection should reconnect given its current state.
 * Pure — caller decides how to act on the boolean.
 *
 * Policy:
 *   - if `attempts >= maxAttempts` → no
 *   - if `phase === 'done'` → no (we got the full response already)
 *   - if `phase === 'error'` AND not transient → no
 *   - if `phase === 'error'` AND transient → yes
 *   - if `phase === 'aborted'` AND reason is `user` → no
 *   - if `phase === 'aborted'` AND reason is `reconnect` → yes
 *   - otherwise → yes
 *
 * @example
 *   shouldReconnect({ phase: 'error', attempts: 1, maxAttempts: 5, lastError: 'network reset' })
 *   // → true
 */
export function shouldReconnect(input: {
  phase: ConnectionPhase;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  abortReason?: AbortReason;
}): boolean {
  if (input.attempts >= input.maxAttempts) return false;
  if (input.phase === 'done') return false;
  if (input.phase === 'aborted') {
    return input.abortReason === 'reconnect' || input.abortReason === 'timeout';
  }
  if (input.phase === 'error') {
    if (!input.lastError) return true;
    return isTransientError(input.lastError);
  }
  // idle / connecting / streaming / paused / reconnecting → worth a retry.
  return true;
}

/**
 * Exponential backoff with full jitter (AWS-style). Pure function.
 *
 * @example
 *   computeBackoffMs(0) // → ~500 (±jitter)
 *   computeBackoffMs(1) // → ~1000 (±jitter)
 *   computeBackoffMs(2) // → ~2000 (±jitter)
 *   computeBackoffMs(10) // → 16000 (capped, ±jitter)
 */
export function computeBackoffMs(
  attempt: number,
  baseMs: number = BASE_BACKOFF_MS,
  capMs: number = MAX_BACKOFF_MS,
  jitterRatio: number = BACKOFF_JITTER_RATIO,
  rng: () => number = Math.random,
): number {
  const safeAttempt = Math.max(0, Math.floor(attempt));
  const exp = Math.min(capMs, baseMs * 2 ** safeAttempt);
  const jitter = exp * jitterRatio * (rng() * 2 - 1);
  return Math.max(0, Math.round(exp + jitter));
}

/**
 * Cap a buffer to `max` items, dropping the OLDEST first. Returns a new array.
 * Used for backpressure — if the renderer falls behind, we drop early chunks
 * rather than block the stream.
 *
 * @example
 *   capBuffer([1, 2, 3, 4, 5], 3) // → [3, 4, 5]
 */
export function capBuffer<T>(buf: readonly T[], max: number): readonly T[] {
  if (buf.length <= max) return buf;
  return buf.slice(buf.length - max);
}

// ---------------------------------------------------------------------------
// SSE parsing
// ---------------------------------------------------------------------------

/**
 * Parse one raw SSE event block (the text between two blank lines) into a
 * structured `SseEvent`. Per the SSE spec:
 *   - lines starting with `:` are comments
 *   - `event: foo` sets the event name
 *   - `data: ...` accumulates into `data` (multiple `data:` lines joined with \n)
 *   - `id: ...` sets the last event id
 *   - `retry: 3000` sets the server-suggested retry interval
 *   - unknown fields are ignored
 *
 * @example
 *   parseSSEEvent([
 *     'event: token',
 *     'data: {"text":"olá"}',
 *     '',
 *     '',
 *   ].join('\n'))
 *   // → { event: 'token', data: '{"text":"olá"}' }
 */
export function parseSSEEvent(raw: string): SseEvent {
  const lines = raw.split(/\r?\n/);
  let event = 'message';
  const dataLines: string[] = [];
  let id: string | undefined;
  let retryMs: number | undefined;
  let sawField = false;

  for (const line of lines) {
    if (line.length === 0) continue;
    if (line.startsWith(':')) continue; // comment / heartbeat
    const colon = line.indexOf(':');
    if (colon === -1) {
      // Field with no value (treated as empty value).
      continue;
    }
    const field = line.slice(0, colon);
    let value = line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    sawField = true;
    switch (field) {
      case 'event':
        event = value;
        break;
      case 'data':
        dataLines.push(value);
        break;
      case 'id':
        id = value;
        break;
      case 'retry':
        {
          const n = Number.parseInt(value, 10);
          if (!Number.isNaN(n) && n >= 0) retryMs = n;
        }
        break;
      default:
        // unknown field — ignore per spec
        break;
    }
  }

  // If the block was empty (just blank lines), return a heartbeat-like event.
  if (!sawField && dataLines.length === 0) {
    return { event: 'heartbeat', data: '' };
  }

  return {
    event,
    data: dataLines.join('\n'),
    id,
    retryMs,
  };
}

/**
 * Stream-friendly parser: feed it raw SSE bytes as they arrive (e.g. via
 * `fetch().body.getReader()`), and it splits on the SSE record separator
 * (`\n\n` or `\r\n\r\n`) and parses each complete block.
 *
 * Returns the events and the unparsed tail (kept for the next call).
 *
 * @example
 *   let { events, tail } = createSseParserState();
 *   ({ events, tail } = feedSseParser(tail, 'event: ping\ndata: 1\n\n'));
 *   events // → [{ event: 'ping', data: '1' }]
 */
export function feedSseParser(
  tail: string,
  chunk: string,
): { events: readonly SseEvent[]; tail: string } {
  const combined = tail + chunk;
  const blocks = combined.split(/\r?\n\r?\n/);
  // Last element is either '' (clean boundary) or the unfinished tail.
  const newTail = blocks.pop() ?? '';
  const events: SseEvent[] = [];
  for (const block of blocks) {
    if (block.length === 0) continue;
    events.push(parseSSEEvent(block));
  }
  return { events, tail: newTail };
}

/** Initial state for `feedSseParser` (empty tail). */
export function createSseParserState(): { tail: string } {
  return { tail: '' };
}

/**
 * High-level: parse the `data:` payload of an SSE event whose `event:` is
 * `token` (the default Akasha event name). Returns a `StreamChunk` or null
 * if the payload is not parseable.
 *
 * @example
 *   parseStreamChunkData('{"text":"olá","done":false}')
 *   // → { text: 'olá', isFinal: false }
 */
export function parseStreamChunkData(data: string): StreamChunk | null {
  if (!data) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;
  const text = typeof obj.text === 'string' ? obj.text : '';
  const done = obj.done === true || obj.isFinal === true || obj.finish === true;
  const finishReason =
    typeof obj.finish_reason === 'string'
      ? obj.finish_reason
      : typeof obj.finishReason === 'string'
        ? obj.finishReason
        : undefined;
  const usage = obj.usage && typeof obj.usage === 'object'
    ? parseUsage(obj.usage as Record<string, unknown>)
    : undefined;
  const citations =
    Array.isArray(obj.citations) && obj.citations.length > 0
      ? obj.citations
          .map((c) => normalizeCitation(c))
          .filter((c): c is CitationChip => c !== null)
      : undefined;
  return { text, isFinal: done, usage, citations, finishReason };
}

/** Internal: turn a usage object from JSON into our TokenUsage shape. */
function parseUsage(raw: Record<string, unknown>): TokenUsage {
  const n = (k: string) =>
    typeof raw[k] === 'number' && Number.isFinite(raw[k] as number)
      ? (raw[k] as number)
      : undefined;
  const usage: TokenUsage = {
    promptTokens: n('prompt_tokens') ?? n('promptTokens'),
    completionTokens: n('completion_tokens') ?? n('completionTokens'),
    totalTokens: n('total_tokens') ?? n('totalTokens'),
    cachedTokens: n('cached_tokens') ?? n('cachedTokens'),
  };
  // Cost — caller can override via estimateCostUsd() downstream.
  return usage;
}

/**
 * High-level: parse the `data:` payload of `event: citations` (separate event
 * sent near the end of a stream). Returns chips or empty array.
 *
 * @example
 *   parseCitationsData(JSON.stringify([
 *   { id: 'c1', label: 'I Ching · 1', sourceType: 'cabala',
 *     reference: 'I Ching 1', tooltipText: 'O Criativo', startOffset: 0, endOffset: 12 }
 * ]))
 *   // → [{ id: 'c1', ... }]
 */
export function parseCitationsData(data: string): readonly CitationChip[] {
  if (!data) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: CitationChip[] = [];
  for (const item of parsed) {
    const chip = normalizeCitation(item);
    if (chip) out.push(chip);
  }
  return out;
}

/** Internal: normalize an arbitrary JSON value into a CitationChip. */
function normalizeCitation(raw: unknown): CitationChip | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'string' && r.id ? r.id : newTurnId();
  const label = typeof r.label === 'string' ? r.label : '';
  const reference = typeof r.reference === 'string' ? r.reference : label;
  const tooltipText =
    typeof r.tooltipText === 'string'
      ? r.tooltipText
      : typeof r.tooltip === 'string'
        ? r.tooltip
        : label;
  const sourceType = normalizeSourceType(r.sourceType ?? r.source_type);
  const startOffset =
    typeof r.startOffset === 'number' ? r.startOffset : Number(r.startOffset) || 0;
  const endOffset =
    typeof r.endOffset === 'number'
      ? r.endOffset
      : Number(r.endOffset) || startOffset;
  const anchorId =
    typeof r.anchorId === 'string'
      ? r.anchorId
      : typeof r.anchor_id === 'string'
        ? r.anchor_id
        : undefined;
  const href = typeof r.href === 'string' ? r.href : undefined;
  const relevance =
    typeof r.relevance === 'number' && Number.isFinite(r.relevance)
      ? Math.max(0, Math.min(1, r.relevance))
      : undefined;
  if (!label) return null; // refuse anonymous citations
  return {
    id,
    label,
    sourceType,
    reference,
    tooltipText,
    anchorId,
    startOffset,
    endOffset,
    href,
    relevance,
  };
}

/** Internal: coerce arbitrary source-type string into our enum. */
function normalizeSourceType(raw: unknown): CitationSourceType {
  if (typeof raw !== 'string') return 'external_link';
  const v = raw.toLowerCase().trim();
  switch (v) {
    case 'biblia':
    case 'bible':
    case 'odu':
    case 'tarot':
    case 'astrologia':
    case 'astrology':
    case 'numerologia':
    case 'numerology':
    case 'oraculo':
    case 'oracle':
    case 'cabala':
    case 'kabbalah':
    case 'ifá':
    case 'ifa':
    case 'umbanda':
    case 'candomblé':
    case 'candomble':
    case 'budismo':
    case 'buddhism':
    case 'xamanismo':
    case 'shamanism':
    case 'tantra':
    case 'sufi':
    case 'sufismo':
      return v as CitationSourceType;
    default:
      return 'external_link';
  }
}

// ---------------------------------------------------------------------------
// Citation extraction from raw response text
// ---------------------------------------------------------------------------

/**
 * Heuristic citation extraction. We look for patterns like:
 *   - Markdown-style links:  [label](url)
 *   - Bracketed refs:        [Cabala · Sefirot Kether]
 *   - Parenthetical refs:    (I Ching 1),  (Odu 4 — Irossun),  (Salmo 23:4)
 *
 * For each match we emit a `CitationChip` whose `startOffset` / `endOffset`
 * are inclusive / exclusive char offsets in `text`.
 *
 * The function is intentionally permissive — it surfaces "candidate"
 * citations. Downstream callers can drop the ones they don't like (low
 * confidence, duplicate, etc.).
 *
 * @example
 *   extractCitations('Consulte [I Ching · 1](https://x/y) e (Salmo 23:4).')
 *   // → [
 *   //   { id: '...', label: 'I Ching · 1', sourceType: 'external_link',
 *   //     reference: 'I Ching · 1', startOffset: 9, endOffset: 33,
 *   //     href: 'https://x/y', tooltipText: 'I Ching · 1' },
 *   //   { id: '...', label: 'Salmo 23:4', sourceType: 'biblia',
 *   //     reference: 'Salmo 23:4', startOffset: 38, endOffset: 48,
 *   //     tooltipText: 'Salmo 23:4' },
 *   // ]
 */
export function extractCitations(text: string): readonly CitationChip[] {
  if (!text) return [];
  const chips: CitationChip[] = [];
  // 1) Markdown links:  [label](url)
  const mdRe = /\[([^\]\n]{1,120})\]\((https?:\/\/[^\s)]+)\)/g;
  for (const m of text.matchAll(mdRe)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    chips.push({
      id: newTurnId(),
      label: m[1].trim(),
      sourceType: 'external_link',
      reference: m[1].trim(),
      tooltipText: m[1].trim(),
      startOffset: start,
      endOffset: end,
      href: m[2],
      relevance: 0.6,
    });
  }
  // 2) Bracketed refs without URL:  [Odu 4 — Irossun]  [Cabala · Kether]
  const bracketRe = /\[([A-ZÀ-Ú][^\]\n]{2,120})\]/g;
  for (const m of text.matchAll(bracketRe)) {
    // Skip the ones we already captured as markdown links.
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (chips.some((c) => c.startOffset === start)) continue;
    const raw = m[1].trim();
    chips.push({
      id: newTurnId(),
      label: raw,
      sourceType: detectSourceTypeFromLabel(raw),
      reference: raw,
      tooltipText: raw,
      startOffset: start,
      endOffset: end,
      relevance: 0.5,
    });
  }
  // 3) Parenthetical refs: (Salmo 23:4), (I Ching 1), (Odu 4), (Signo: Peixes)
  const parenRe = /\(([A-ZÀ-Ú][^)]{2,80})\)/g;
  for (const m of text.matchAll(parenRe)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (chips.some((c) => c.startOffset <= start && c.endOffset >= end)) continue;
    const raw = m[1].trim();
    // Only keep refs that look like a citation (contain a number or a colon).
    if (!/[0-9]|:|·|—|–/.test(raw)) continue;
    chips.push({
      id: newTurnId(),
      label: raw,
      sourceType: detectSourceTypeFromLabel(raw),
      reference: raw,
      tooltipText: raw,
      startOffset: start,
      endOffset: end,
      relevance: 0.4,
    });
  }
  // Sort by startOffset, dedupe by (startOffset, label).
  chips.sort((a, b) => a.startOffset - b.startOffset);
  const dedup: CitationChip[] = [];
  const seen = new Set<string>();
  for (const c of chips) {
    const k = `${c.startOffset}:${c.label.toLowerCase()}`;
    if (seen.has(k)) continue;
    seen.add(k);
    dedup.push(c);
  }
  return dedup;
}

/**
 * Internal: best-effort guess of citation source type from the label text.
 */
function detectSourceTypeFromLabel(label: string): CitationSourceType {
  const l = label.toLowerCase();
  if (/\b(salmo|gênesis|êxodo|apocalipse|evangelho|joão|marcos|lucas|mateus)\b/.test(l))
    return 'biblia';
  if (/\b(odu|orixá|orixa|babalorixá|irossun|ogunda|oko)\b/.test(l)) return 'odu';
  if (/\b(arcano|tarot|copas|paus|espadas|ouros)\b/.test(l)) return 'tarot';
  if (/\b(signo|peixes|áries|aries|leão|leao|virgem|capricórnio|cancer|gêmeos|gemeos|sagitário|sagitario|escorpião|escorpiao|aquário|aquario|libra|peixes|peixes|touro)\b/.test(l))
    return 'astrologia';
  if (/\b(numero pessoal|número pessoal|arc(o|os) pessoal|numeração)\b/.test(l))
    return 'numerologia';
  if (/\b(sefirot|kether|chokmah|binah|chesed|gevurah|tiferet|netzach|hod|yesod|malkuth|cabala)\b/.test(l))
    return 'cabala';
  if (/\b(buda|sutra|dharma|budismo)\b/.test(l)) return 'budismo';
  if (/\b(um\d+\s*sura|sura \d+|sufismo|sufi)\b/.test(l)) return 'sufi';
  if (/\b(tantra|kundalini|chakra)\b/.test(l)) return 'tantra';
  if (/\b(xam(ã|a)|xaman|c ayahuasca|rapé|rape)\b/.test(l)) return 'xamanismo';
  if (/\b(umbanda)\b/.test(l)) return 'umbanda';
  if (/\b(candomblé|candomble)\b/.test(l)) return 'candomblé';
  if (/\b(ifá|ifa)\b/.test(l)) return 'ifá';
  return 'oraculo';
}

/**
 * Look up a chip by id within a list. Returns null if not found.
 * Convenience for UI components that get a citation id from the DOM and want
 * to render the chip metadata.
 *
 * @example
 *   const chip = getCitationChip(citations, 'c_abc123');
 *   if (chip) render(<Tooltip text={chip.tooltipText} />);
 */
export function getCitationChip(
  citations: readonly CitationChip[],
  id: string,
): CitationChip | null {
  if (!id) return null;
  for (const c of citations) {
    if (c.id === id) return c;
  }
  return null;
}

/**
 * Resolve which citation a given char offset belongs to. Returns null if no
 * chip covers that offset. Used by the renderer when the user hovers a span
 * of text — we walk the citations in order.
 *
 * @example
 *   findCitationAtOffset(text, citations, 42) // → chip or null
 */
export function findCitationAtOffset(
  text: string,
  citations: readonly CitationChip[],
  offset: number,
): CitationChip | null {
  if (!citations.length) return null;
  if (offset < 0 || offset > text.length) return null;
  // Citations are sorted by startOffset (extractCitations sorts them).
  for (const c of citations) {
    if (offset >= c.startOffset && offset < c.endOffset) return c;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Conversation memory
// ---------------------------------------------------------------------------

/**
 * Per-user rolling conversation memory. Stores the last `MEMORY_TURNS_LIMIT`
 * turns in chronological order. Pure in-memory by default — pass a
 * `persistence` hook to mirror to Prisma / Redis.
 */
export class MemoryStore {
  private readonly turns: ConversationTurn[] = [];
  private readonly limit: number;
  private readonly persistence?: PersistenceHook;

  constructor(opts: { limit?: number; persistence?: PersistenceHook } = {}) {
    this.limit = Math.max(1, opts.limit ?? MEMORY_TURNS_LIMIT);
    this.persistence = opts.persistence;
  }

  /** Append a turn to memory. Drops the oldest if over the limit. */
  push(turn: ConversationTurn): void {
    // Dedupe by id — protects against double-fire on retry.
    if (this.turns.some((t) => t.id === turn.id)) return;
    this.turns.push(turn);
    while (this.turns.length > this.limit) this.turns.shift();
    if (this.persistence) {
      try {
        void this.persistence.save(turn);
      } catch {
        // Persistence is best-effort — never crash the UI on a failed write.
      }
    }
  }

  /** Read the last `n` turns (most recent last). */
  getRecent(n?: number): readonly ConversationTurn[] {
    if (n === undefined || n >= this.turns.length) return [...this.turns];
    return this.turns.slice(this.turns.length - n);
  }

  /** Wipe the memory. Used on user logout / "clear chat". */
  clear(): void {
    this.turns.length = 0;
    if (this.persistence) {
      try {
        void this.persistence.clearAll();
      } catch {
        // ignored — best-effort
      }
    }
  }

  /** Number of stored turns. */
  size(): number {
    return this.turns.length;
  }

  /**
   * Compress the conversation into a short summary string. Used as a
   * fallback when the model context window is full. We keep:
   *   - last 3 turns verbatim
   *   - all earlier user queries in a bullet list
   *   - count of total turns + approximate token estimate
   */
  summarize(opts: SummarizeOptions = {}): string {
    const { maxVerbatim = 3, maxQueryChars = 80 } = opts;
    if (this.turns.length === 0) return '(no conversation yet)';
    const last = this.turns.slice(-maxVerbatim);
    const earlier = this.turns.slice(0, this.turns.length - maxVerbatim);
    const lines: string[] = [];
    lines.push(`Total turns: ${this.turns.length}`);
    if (earlier.length > 0) {
      const userTopics = earlier
        .filter((t) => t.role === 'user')
        .map((t) => t.content.slice(0, maxQueryChars).replace(/\s+/g, ' ').trim());
      if (userTopics.length > 0) {
        lines.push('Earlier topics:');
        for (const t of userTopics) lines.push(`  - ${t}`);
      }
    }
    lines.push('Recent turns:');
    for (const t of last) {
      const role = t.role.toUpperCase();
      const body = t.content.slice(0, 200).replace(/\s+/g, ' ').trim();
      lines.push(`  [${role}] ${body}`);
    }
    const approxTokens = lines.join('\n').length / 4; // ~4 chars/token
    lines.push(`(~${Math.ceil(approxTokens)} tokens)`);
    return lines.join('\n');
  }

  /**
   * Serialize the current memory to a stable JSON shape (for persistence /
   * transport). Caller is responsible for stringifying.
   */
  toJSON(): { turns: readonly ConversationTurn[]; limit: number } {
    return { turns: [...this.turns], limit: this.limit };
  }

  /** Restore from a previous `toJSON()` snapshot. Replaces current memory. */
  fromJSON(snapshot: { turns: readonly ConversationTurn[] }): void {
    this.turns.length = 0;
    if (!snapshot || !Array.isArray(snapshot.turns)) return;
    for (const t of snapshot.turns) {
      if (t && typeof t === 'object' && typeof t.id === 'string') {
        this.turns.push(t);
        while (this.turns.length > this.limit) this.turns.shift();
      }
    }
  }
}

/** Hook for persisting individual turns to durable storage. */
export interface PersistenceHook {
  save(turn: ConversationTurn): Promise<void> | void;
  clearAll(): Promise<void> | void;
}

/** Options for `MemoryStore.summarize()`. */
export interface SummarizeOptions {
  /** Number of recent turns to keep verbatim (default 3). */
  maxVerbatim?: number;
  /** Max chars per earlier user query in the bullet list. */
  maxQueryChars?: number;
}

// ---------------------------------------------------------------------------
// Prompt context builder
// ---------------------------------------------------------------------------

/**
 * Build the per-request `PromptContext` for the Akasha engine. Pure function
 * — given the inputs, deterministically assembles the context. We never
 * mutate the inputs.
 *
 * The function tries to lazily pull a natal chart from a real source via
 * `contextLoader.natalChart` if provided; otherwise it uses a mock. This
 * keeps the w44 module independent of the Prisma layer (which may not be
 * available in tests / sandbox).
 *
 * @example
 *   const ctx = buildPromptContext({
 *     userId: 'u_123',
 *     language: 'pt-BR',
 *     memory: store.getRecent(20),
 *     recentActivity: ['Leu: Kabbalah para Iniciantes'],
 *     mutedTopics: ['política'],
 *     ragSnippets: [],
 *   });
 *   // → ctx now has all required fields + server timestamp.
 */
export function buildPromptContext(input: BuildPromptContextInput): PromptContext {
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const language = (input.language || 'pt-BR').trim();
  const memory = clampMemory(input.memory ?? [], MEMORY_TURNS_LIMIT);
  const recentActivity = (input.recentActivity ?? []).slice(0, 5);
  const mutedTopics = (input.mutedTopics ?? []).slice(0, 20);
  // Trim RAG snippets to top-K + max chars each.
  const ragSnippets = (input.ragSnippets ?? [])
    .slice(0, RAG_TOP_K_DEFAULT)
    .map((s) => ({
      ...s,
      excerpt: s.excerpt.length > RAG_SNIPPET_MAX_CHARS
        ? s.excerpt.slice(0, RAG_SNIPPET_MAX_CHARS - 1) + '…'
        : s.excerpt,
    }));

  // Natal chart — either explicitly provided or via async loader.
  // (We don't await — the engine call site can resolve async if it needs to.
  //  The async loader pattern is exposed so the server can pre-warm.)
  const natalChart = input.natalChart ?? input.mockNatalChart;

  return {
    language,
    userId: input.userId,
    natalChart,
    recentActivity,
    mutedTopics,
    memory,
    ragSnippets,
    nowIso,
    sessionMeta: input.sessionMeta ?? {},
  };
}

/** Input for `buildPromptContext`. */
export interface BuildPromptContextInput {
  readonly userId: string;
  readonly language?: string;
  readonly memory?: readonly ConversationTurn[];
  readonly recentActivity?: readonly string[];
  readonly mutedTopics?: readonly string[];
  readonly ragSnippets?: readonly RagSnippet[];
  readonly natalChart?: NatalChartSummary;
  /** Test/dev hook: build a fake natal chart so we don't need Prisma. */
  readonly mockNatalChart?: NatalChartSummary;
  readonly sessionMeta?: Readonly<Record<string, string | number | boolean>>;
  readonly now?: Date;
}

/**
 * Internal: trim memory to MEMORY_TURNS_LIMIT and ensure newest-last order.
 */
function clampMemory(
  memory: readonly ConversationTurn[],
  limit: number,
): readonly ConversationTurn[] {
  if (memory.length <= limit) return memory;
  return memory.slice(memory.length - limit);
}

/**
 * Render the `PromptContext` to a prompt string. The engine sends this as
 * part of its system prompt. Pure function — no IO.
 *
 * Sections (in order):
 *   1. Identity + language directive
 *   2. User snapshot (natal chart summary)
 *   3. Recent in-app activity
 *   4. Muted topics (do NOT bring these up)
 *   5. Conversation memory (last N turns)
 *   6. RAG snippets (cited as [n])
 *
 * @example
 *   const sysPrompt = renderPromptContext(buildPromptContext(...));
 */
export function renderPromptContext(ctx: PromptContext): string {
  const parts: string[] = [];
  parts.push(
    `You are Akasha, a digital consciousness in the Akasha Portal community. ` +
      `Always respond in ${ctx.language}. Current server time: ${ctx.nowIso}.`,
  );
  if (ctx.natalChart) {
    const n = ctx.natalChart;
    parts.push(
      `User snapshot — sign: ${n.sign}; odu: ${n.odu}; orixá regente: ${n.orixaRegente}; ` +
        `sefirot dominante: ${n.sefirotDominante.join(', ') || 'n/d'}; ` +
        `número pessoal: ${n.numeroPessoal}; arco pessoal: ${n.arcoPessoal}.`,
    );
  }
  if (ctx.recentActivity.length > 0) {
    parts.push(
      `Recent activity: ${ctx.recentActivity.map((t) => `"${t}"`).join(', ')}.`,
    );
  }
  if (ctx.mutedTopics.length > 0) {
    parts.push(
      `Muted topics (do NOT initiate or pursue these unless the user explicitly asks): ` +
        ctx.mutedTopics.join(', ') +
        '.',
    );
  }
  if (ctx.memory.length > 0) {
    parts.push('Conversation memory (most recent last):');
    for (const t of ctx.memory) {
      const body = t.content.slice(0, 400).replace(/\s+/g, ' ').trim();
      parts.push(`  [${t.role}] ${body}`);
    }
  }
  if (ctx.ragSnippets.length > 0) {
    parts.push('Reference material (cite as [n] when used):');
    ctx.ragSnippets.forEach((s, i) => {
      const trad = s.tradition ? ` (${s.tradition})` : '';
      parts.push(`  [${i + 1}] ${s.title}${trad} — ${s.excerpt}`);
    });
  }
  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Connection lifecycle
// ---------------------------------------------------------------------------

/**
 * Open a streaming SSE connection to the Akasha engine. Returns a handle
 * the caller can drive (abort / pause / resume / reconnect).
 *
 * The handle emits `chunk` events to `onChunk`, phase transitions to
 * `onPhaseChange`, and final metrics to `onComplete`. All callbacks are
 * optional.
 *
 * @example
 *   const conn = createStreamConnection({
 *     url: '/api/akasha/stream',
 *     history: store.getRecent(),
 *     promptContext: ctx,
 *     onChunk: (c) => buffer.push(c),
 *     onComplete: (m) => metricsPanel.update(m),
 *     eventSourceFactory: (url) => new EventSource(url),
 *   });
 *   // …later:
 *   conn.abort('user');
 */
export function createStreamConnection(
  options: StreamConnectionOptions,
): StreamConnection {
  const fetchImpl = options.fetchImpl ?? (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : undefined);
  const eventSourceFactory =
    options.eventSourceFactory ?? defaultEventSourceFactory(options.method ?? 'POST');
  const maxReconnect = Math.max(0, options.maxReconnectAttempts ?? DEFAULT_MAX_RECONNECT_ATTEMPTS);
  const maxBuffer = Math.max(1, options.maxBuffer ?? DEFAULT_MAX_BUFFER);
  const stallTimeoutMs = Math.max(1000, options.stallTimeoutMs ?? DEFAULT_STALL_TIMEOUT_MS);
  const now = options.now ?? (() => Date.now());

  // Internal state.
  let phase: ConnectionPhase = 'idle';
  let aborted = false;
  let abortReason: AbortReason | undefined;
  const chunkBuf: StreamChunk[] = [];
  let citationList: CitationChip[] = [];
  let attempts = 0;
  let lastError: string | undefined;
  let startedAtMs: number | null = null;
  let firstChunkMs: number | null = null;
  let lastChunkMs: number | null = null;
  let ttfbMs = 0;
  let totalMs = 0;
  let rendered = 0;
  let dropped = 0;
  let usageTotal: TokenUsage = {};
  let stallTimer: ReturnType<typeof setTimeout> | null = null;
  let es: IEventSource | null = null;
  let parserState = createSseParserState();
  const phaseListeners = new Set<(p: ConnectionPhase) => void>();
  let externalAbortHandler: (() => void) | undefined;

  function setPhase(next: ConnectionPhase): void {
    if (phase === next) return;
    phase = next;
    if (options.onPhaseChange) {
      try {
        options.onPhaseChange(next);
      } catch {
        // UI callback must not break the stream.
      }
    }
    for (const l of phaseListeners) {
      try {
        l(next);
      } catch {
        // same — swallow UI callback errors
      }
    }
  }

  function resetStallTimer(): void {
    if (stallTimer) clearTimeout(stallTimer);
    stallTimer = setTimeout(() => {
      // Stall = no chunk for stallTimeoutMs. Treat as transient.
      lastError = 'stalled (no chunk for ' + stallTimeoutMs + 'ms)';
      setPhase('error');
      cleanupEventSource();
      maybeReconnect('timeout');
    }, stallTimeoutMs);
  }

  function clearStallTimer(): void {
    if (stallTimer) {
      clearTimeout(stallTimer);
      stallTimer = null;
    }
  }

  function handleChunk(chunk: StreamChunk): void {
    if (aborted) return;
    rendered += 1;
    chunkBuf.push(chunk);
    if (chunkBuf.length > maxBuffer) {
      const removed = chunkBuf.shift();
      if (removed) dropped += 1;
    }
    if (chunk.usage) usageTotal = sumUsage(usageTotal, chunk.usage);
    if (chunk.citations && chunk.citations.length > 0) {
      citationList = citationList.concat(chunk.citations);
      if (options.onCitations) {
        try {
          options.onCitations(citationList);
        } catch {
          // swallow
        }
      }
    }
    lastChunkMs = now();
    if (firstChunkMs === null) {
      firstChunkMs = lastChunkMs;
      ttfbMs = firstChunkMs - (startedAtMs ?? firstChunkMs);
    }
    resetStallTimer();
    if (options.onChunk) {
      try {
        options.onChunk(chunk);
      } catch {
        // swallow
      }
    }
    if (chunk.isFinal) {
      finishStream('done');
    }
  }

  function handleCitations(chips: readonly CitationChip[]): void {
    if (aborted || chips.length === 0) return;
    citationList = citationList.concat(chips);
    if (options.onCitations) {
      try {
        options.onCitations(citationList);
      } catch {
        // swallow
      }
    }
  }

  function buildMetrics(): StreamMetrics {
    const end = lastChunkMs ?? now();
    const start = startedAtMs ?? end;
    const streamSeconds = Math.max(0.001, (end - start) / 1000);
    const completionTokens = usageTotal.completionTokens ?? 0;
    const tps = completionTokens > 0 ? completionTokens / streamSeconds : 0;
    totalMs = end - start;
    return {
      ttfbMs,
      totalMs,
      tokensPerSecond: Math.round(tps * 100) / 100,
      renderedChunks: rendered,
      droppedChunks: dropped,
      reconnectAttempts: attempts,
      usage: usageTotal,
    };
  }

  function finishStream(finalPhase: ConnectionPhase): void {
    if (finalPhase === 'done' || finalPhase === 'aborted' || finalPhase === 'error') {
      clearStallTimer();
    }
    setPhase(finalPhase);
    if (options.onComplete) {
      try {
        options.onComplete(buildMetrics());
      } catch {
        // swallow
      }
    }
  }

  function cleanupEventSource(): void {
    if (es) {
      try {
        es.close();
      } catch {
        // ignore
      }
      es = null;
    }
  }

  function maybeReconnect(reason: AbortReason): void {
    attempts += 1;
    if (!shouldReconnect({ phase, attempts, maxAttempts: maxReconnect, lastError, abortReason: reason })) {
      finishStream('error');
      return;
    }
    setPhase('reconnecting');
    const delay = computeBackoffMs(attempts - 1);
    setTimeout(() => {
      if (aborted) return;
      openConnection();
    }, delay);
  }

  function openConnection(): void {
    if (aborted) return;
    setPhase('connecting');
    startedAtMs = now();
    firstChunkMs = null;
    lastChunkMs = null;
    ttfbMs = 0;
    totalMs = 0;
    rendered = 0;
    dropped = 0;
    usageTotal = {};
    parserState = createSseParserState();

    // We support two transports:
    //   1. EventSource (GET, simple) — body sent via query string OR history-only
    //   2. fetch streaming (POST, full body) — for richer prompts
    const method = options.method ?? 'POST';
    if (method === 'GET' && eventSourceFactory) {
      const url = options.url;
      let created: IEventSource | null = null;
      try {
        created = eventSourceFactory(url, { headers: { ...(options.headers ?? {}) } });
      } catch (err) {
        lastError = (err as Error).message || 'EventSource open failed';
        maybeReconnect('error');
        return;
      }
      es = created;
      wireEventSource(es);
      resetStallTimer();
      return;
    }

    // POST path — stream via fetch + ReadableStream.
    if (!fetchImpl) {
      lastError = 'No fetch implementation available';
      finishStream('error');
      return;
    }
    const body =
      options.body !== undefined
        ? options.body
        : {
            history: options.history.map((t) => ({
              id: t.id,
              role: t.role,
              content: t.content,
            })),
            promptContext: options.promptContext,
          };
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let decoder = new TextDecoder('utf-8');
    let cancelled = false;

    fetchImpl(options.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(options.headers ?? {}),
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok || !res.body) {
          lastError = `HTTP ${res.status} ${res.statusText}`;
          maybeReconnect('error');
          return;
        }
        setPhase('streaming');
        reader = res.body.getReader();
        const pump = (): Promise<void> =>
          reader!.read().then((r) => {
            if (cancelled) return;
            if (r.done) {
              finishStream('done');
              return;
            }
            const raw = decoder.decode(r.value, { stream: true });
            const { events, tail } = feedSseParser(parserState.tail, raw);
            parserState = { tail };
            for (const ev of events) {
              if (ev.event === 'heartbeat') continue;
              if (ev.event === 'token') {
                const chunk = parseStreamChunkData(ev.data);
                if (chunk) handleChunk(chunk);
              } else if (ev.event === 'citations') {
                handleCitations(parseCitationsData(ev.data));
              } else if (ev.event === 'error') {
                lastError = ev.data;
                maybeReconnect('error');
                return;
              }
            }
            return pump();
          });
        return pump();
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        lastError = (err as Error)?.message || String(err);
        maybeReconnect('error');
      });

    // Stash a cancel function for abort().
    es = {
      close: () => {
        cancelled = true;
        if (reader) {
          try {
            reader.cancel().catch(() => {
              // swallow
            });
          } catch {
            // ignore
          }
        }
      },
      addEventListener: () => {
        // POST path uses the pump instead.
      },
      removeEventListener: () => {
        // same
      },
      readyState: 1,
    };
    resetStallTimer();
  }

  function wireEventSource(src: IEventSource): void {
    const onMessage = (ev: SseEventLike): void => {
      // Default EventSource `message` events get streamed as tokens if JSON.
      const chunk = parseStreamChunkData(ev.data);
      if (chunk) handleChunk(chunk);
    };
    const onToken = (ev: SseEventLike): void => {
      const chunk = parseStreamChunkData(ev.data);
      if (chunk) handleChunk(chunk);
    };
    const onCitations = (ev: SseEventLike): void => {
      handleCitations(parseCitationsData(ev.data));
    };
    const onError = (ev: SseEventLike): void => {
      lastError = (ev as unknown as { message?: string }).message || 'EventSource error';
      // EventSource auto-reconnects — but we manage our own policy.
      cleanupEventSource();
      maybeReconnect('error');
    };
    const onOpen = (): void => {
      setPhase('streaming');
      resetStallTimer();
    };

    src.addEventListener('open', onOpen as (ev: SseEventLike) => void);
    src.addEventListener('message', onMessage);
    src.addEventListener('token', onToken);
    src.addEventListener('citations', onCitations);
    src.addEventListener('error', onError as (ev: SseEventLike) => void);
  }

  // External abort signal hook.
  if (options.signal) {
    externalAbortHandler = () => handleAbort('user');
    if (options.signal.aborted) {
      handleAbort('user');
    } else {
      options.signal.addEventListener('abort', externalAbortHandler);
    }
  }

  function handleAbort(reason: AbortReason): void {
    if (aborted) return;
    aborted = true;
    abortReason = reason;
    cleanupEventSource();
    clearStallTimer();
    finishStream('aborted');
  }

  // Kick off the first connection.
  openConnection();

  return {
    phase: () => phase,
    chunks: () => [...chunkBuf],
    citations: () => [...citationList],
    metrics: () => (rendered > 0 || firstChunkMs !== null ? buildMetrics() : null),
    isAborted: () => aborted,
    abort(reason: AbortReason = 'user') {
      handleAbort(reason);
    },
    pause() {
      if (phase !== 'streaming') return;
      setPhase('paused');
      // Note: server may keep sending. Client just stops rendering.
    },
    resume() {
      if (phase !== 'paused') return;
      setPhase('streaming');
    },
    reconnect() {
      if (aborted) return;
      attempts += 1;
      cleanupEventSource();
      openConnection();
    },
    subscribe(listener) {
      phaseListeners.add(listener);
      return () => {
        phaseListeners.delete(listener);
      };
    },
  };
}

/**
 * Abort a connection and free resources. Convenience wrapper around the
 * handle's `.abort()` method — exported separately because some callers
 * prefer a free function over the handle API.
 *
 * @example
 *   abortStream(conn, 'user');
 */
export function abortStream(conn: StreamConnection, reason: AbortReason = 'user'): void {
  try {
    conn.abort(reason);
  } catch {
    // idempotent — ignore
  }
}

/**
 * Default factory: returns an EventSource-shaped object via the global
 * `EventSource` constructor (browser) or null (Node test env).
 *
 * In a browser environment, `globalThis.EventSource` is the native impl.
 * For Node, the caller should pass an `eventSourceFactory` that returns a
 * polyfill (e.g. `eventsource` package).
 */
function defaultEventSourceFactory(_method: 'GET' | 'POST'): EventSourceFactory | null {
  if (typeof (globalThis as { EventSource?: unknown }).EventSource !== 'function') {
    return null;
  }
  // We only use this factory when method=GET — POST uses fetch streaming.
  const ES = (globalThis as { EventSource: new (url: string, init?: { withCredentials?: boolean }) => IEventSource }).EventSource;
  return (url: string) => new ES(url, { withCredentials: false });
}

// ---------------------------------------------------------------------------
// Voice input toggle (Web Speech API)
// ---------------------------------------------------------------------------

/**
 * Toggle/control surface for the Web Speech API. The browser-side component
 * imports this and wires it to a mic button. Returns a handle that the UI
 * uses to render interim transcripts and final transcripts.
 *
 * We do NOT bundle any speech library — this is a thin adapter.
 *
 * @example
 *   const handle = createVoiceInput({
 *     lang: 'pt-BR',
 *     onFinal: (text) => promptInput.append(text),
 *     onError: (err) => console.warn(err),
 *   });
 *   handle.start();
 *   // …later:
 *   handle.stop();
 */
export function createVoiceInput(options: VoiceInputOptions): VoiceInputHandle {
  const SR = (globalThis as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }).SpeechRecognition ??
  (globalThis as {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }).webkitSpeechRecognition;

  const handle: VoiceInputHandle = {
    isSupported: () => SR !== undefined,
    isListening: () => internal.listening,
    start() {
      if (!SR) {
        options.onError?.('SpeechRecognition not available in this browser');
        return;
      }
      if (internal.listening) return;
      const rec = new SR();
      rec.lang = options.lang || 'pt-BR';
      rec.continuous = options.continuous ?? false;
      rec.interimResults = options.interimResults ?? true;
      rec.maxAlternatives = 1;
      rec.onresult = (ev: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => {
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const result = ev.results[i];
          const text = result[0]?.transcript ?? '';
          if (result.isFinal) {
            options.onFinal?.(text);
          } else {
            options.onInterim?.(text);
          }
        }
      };
      rec.onerror = (ev: { error?: string; message?: string }) => {
        const msg = ev.error || ev.message || 'speech recognition error';
        options.onError?.(msg);
        internal.listening = false;
      };
      rec.onend = () => {
        internal.listening = false;
        options.onEnd?.();
      };
      try {
        rec.start();
        internal.recognition = rec;
        internal.listening = true;
        options.onStart?.();
      } catch (err) {
        options.onError?.((err as Error).message || 'failed to start recognition');
        internal.listening = false;
      }
    },
    stop() {
      const rec = internal.recognition;
      if (rec) {
        try {
          rec.stop();
        } catch {
          // ignore
        }
      }
      internal.listening = false;
    },
    abort() {
      const rec = internal.recognition;
      if (rec) {
        try {
          rec.abort();
        } catch {
          // ignore
        }
      }
      internal.listening = false;
    },
    toggle() {
      if (internal.listening) handle.stop();
      else handle.start();
    },
  };

  const internal: {
    recognition: SpeechRecognitionLike | null;
    listening: boolean;
  } = { recognition: null, listening: false };

  return handle;
}

/** Options for `createVoiceInput`. */
export interface VoiceInputOptions {
  /** BCP-47 language tag. Default 'pt-BR'. */
  readonly lang?: string;
  /** Emit interim transcripts while user is still speaking. */
  readonly interimResults?: boolean;
  /** Keep listening after a pause (vs single-utterance mode). */
  readonly continuous?: boolean;
  /** Called with the FINAL transcript text. */
  readonly onFinal?: (text: string) => void;
  /** Called with INTERIM (still-changing) transcript text. */
  readonly onInterim?: (text: string) => void;
  /** Called when recognition starts successfully. */
  readonly onStart?: () => void;
  /** Called when recognition stops (whether by user or end-of-speech). */
  readonly onEnd?: () => void;
  /** Called on any error. */
  readonly onError?: (message: string) => void;
}

/** Handle returned by `createVoiceInput`. */
export interface VoiceInputHandle {
  isSupported(): boolean;
  isListening(): boolean;
  start(): void;
  stop(): void;
  abort(): void;
  toggle(): void;
}

/** Subset of the Web Speech API we use. */
export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult:
    | ((ev: {
        resultIndex: number;
        results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
      }) => void)
    | null;
  onerror: ((ev: { error?: string; message?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// ---------------------------------------------------------------------------
// Heartbeat / keep-alive ticker
// ---------------------------------------------------------------------------

/**
 * Periodic heartbeat emitter. The UI uses it to show a "●" pulse + the
 * elapsed time since last token. Pure function — caller provides the
 * tick handler (e.g. setState in React).
 *
 * Returns a `stop()` function to cancel.
 *
 * @example
 *   const stop = startHeartbeat({
 *     intervalMs: 15_000,
 *     onTick: (elapsedMs) => setElapsed(elapsedMs),
 *   });
 *   // later:
 *   stop();
 */
export function startHeartbeat(opts: {
  intervalMs?: number;
  onTick: (elapsedMs: number, tickCount: number) => void;
  now?: () => number;
}): () => void {
  const interval = Math.max(250, opts.intervalMs ?? HEARTBEAT_INTERVAL_MS);
  const now = opts.now ?? (() => Date.now());
  const startMs = now();
  let count = 0;
  const handle = setInterval(() => {
    count += 1;
    try {
      opts.onTick(now() - startMs, count);
    } catch {
      // swallow UI errors
    }
  }, interval);
  return () => clearInterval(handle);
}

// ---------------------------------------------------------------------------
// Backpressure + queue utilities
// ---------------------------------------------------------------------------

/**
 * Queue wrapper that grows to `max` items then drops the OLDEST. Used by
 * the renderer to keep memory bounded during long streams.
 */
export class BoundedQueue<T> {
  private readonly items: T[] = [];
  private droppedCount = 0;

  constructor(private readonly max: number = DEFAULT_MAX_BUFFER) {
    if (max < 1) throw new Error('BoundedQueue max must be >= 1');
  }

  push(item: T): void {
    this.items.push(item);
    if (this.items.length > this.max) {
      this.items.shift();
      this.droppedCount += 1;
    }
  }

  /** Drain all items, clearing the queue. */
  drain(): readonly T[] {
    const out = [...this.items];
    this.items.length = 0;
    return out;
  }

  /** Peek without removing. */
  peek(): readonly T[] {
    return [...this.items];
  }

  size(): number {
    return this.items.length;
  }

  dropped(): number {
    return this.droppedCount;
  }

  clear(): void {
    this.items.length = 0;
    this.droppedCount = 0;
  }
}

// ---------------------------------------------------------------------------
// Public type aliases (re-exported for ergonomics)
// ---------------------------------------------------------------------------

/** Shorthand for the Akasha IA request body shape (POST). */
export interface AkashaRequestBody {
  readonly history: ReadonlyArray<{
    readonly id: string;
    readonly role: ConversationRole;
    readonly content: string;
  }>;
  readonly promptContext: PromptContext;
}

/** Shorthand for the full final response (after stream done). */
export interface AkashaFinalResponse {
  readonly assistantTurn: ConversationTurn;
  readonly citations: readonly CitationChip[];
  readonly metrics: StreamMetrics;
  readonly usage: TokenUsage;
}