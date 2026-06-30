// W79 akasha-ia-streaming — Core streaming consumer for Akasha IA responses.
// Pure TypeScript, framework-agnostic. The React UI layer (akasha-ia-streaming-ui.tsx)
// consumes this engine. Responsibilities:
//   - Read from a fetch ReadableStream OR a mock EventSource
//   - Parse SSE-style chunks (`data: ...\n\n`) and JSON lines
//   - Accumulate tokens in order, dispatch events
//   - State machine: IDLE → CONNECTING → STREAMING → COMPLETE / ERROR / ABORTED
//   - AbortController integration for unmount + user "stop" button
//   - Retry / backoff helpers (off by default)
//   - Telemetry counters for the engine audit
//   - Pure helpers: parseSSELine, tokenize, sanitizeUtf8, parseJSONChunk
// All outputs Object.frozen. Branded types for state, token, request id.

export const STREAM_STATES = [
  'IDLE', 'CONNECTING', 'STREAMING', 'COMPLETE', 'ERROR', 'ABORTED',
] as const;
export type StreamState = typeof STREAM_STATES[number];

export type Brand<TBase, TBrand extends string> = TBase & { readonly __brand: TBrand };

export type RequestId   = Brand<string, 'RequestId'>;
export type TokenId     = Brand<string, 'TokenId'>;
export type StreamError = Brand<string, 'StreamError'>;

const REQUEST_ID_RE = /^req_[a-z0-9_]{3,40}$/;
const TOKEN_ID_RE   = /^tok_[a-z0-9_]{3,40}$/;

let _tokCounter = 0;
function nextTokenIdRaw(): string {
  _tokCounter++;
  return `tok_${_tokCounter.toString(36).padStart(4, '0')}_${Date.now().toString(36)}`;
}
export function makeRequestId(raw: string): RequestId {
  if (!REQUEST_ID_RE.test(raw)) throw new Error(`invalid RequestId: ${raw}`);
  return raw as RequestId;
}
export function makeStreamError(raw: string): StreamError {
  if (raw.length < 3) throw new Error(`invalid StreamError message`);
  return raw as StreamError;
}
export function isStreamState(s: string): s is StreamState {
  return (STREAM_STATES as ReadonlyArray<string>).includes(s);
}

// =================== LEGAL STATE TRANSITIONS ===================
// IDLE        → CONNECTING
// CONNECTING  → STREAMING | ERROR | ABORTED
// STREAMING   → COMPLETE | ERROR | ABORTED
// COMPLETE    → (terminal)
// ERROR       → (terminal)
// ABORTED     → (terminal)
export const LEGAL_TRANSITIONS: ReadonlyMap<StreamState, ReadonlyArray<StreamState>> = new Map([
  ['IDLE',       ['CONNECTING']],
  ['CONNECTING', ['STREAMING', 'ERROR', 'ABORTED']],
  ['STREAMING',  ['COMPLETE', 'ERROR', 'ABORTED']],
  ['COMPLETE',   []],
  ['ERROR',      []],
  ['ABORTED',    []],
]);

export function canTransition(from: StreamState, to: StreamState): boolean {
  const next = LEGAL_TRANSITIONS.get(from);
  if (!next) return false;
  return next.includes(to);
}

export function assertTransition(from: StreamState, to: StreamState): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal stream transition: ${from} → ${to}`);
  }
}

// =================== CORE TYPES ===================

export type Token = {
  readonly id: TokenId;
  readonly text: string;
  readonly index: number;
  readonly receivedAt: number;
};

export type StreamChunk = {
  readonly raw: string;
  readonly eventName: string | null;
  readonly data: string;
  readonly isFinal: boolean;
};

export type StreamEvent =
  | { readonly kind: 'state'; readonly state: StreamState; readonly prev: StreamState; readonly at: number }
  | { readonly kind: 'token'; readonly token: Token; readonly accumulated: string; readonly at: number }
  | { readonly kind: 'done';  readonly totalTokens: number; readonly finalText: string; readonly at: number }
  | { readonly kind: 'error'; readonly error: StreamError; readonly at: number }
  | { readonly kind: 'abort'; readonly reason: 'user' | 'unmount' | 'timeout' | 'backoff_exceeded'; readonly at: number };

export type StreamListener = (ev: StreamEvent) => void;

export type StreamRequest = {
  readonly url: string;
  readonly method?: 'GET' | 'POST';
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: string | null;
  readonly signal?: AbortSignal;
  readonly parser?: ChunkParser;
};

export type ChunkParser = (raw: string) => ReadonlyArray<string>;

// =================== PARSER HELPERS ===================

/** Split an SSE payload by `\n\n` blocks, preserving order. */
export function parseSSEBlocks(payload: string): ReadonlyArray<StreamChunk> {
  if (!payload) return [];
  const blocks = payload.split(/\r?\n\r?\n/);
  const out: StreamChunk[] = [];
  for (const block of blocks) {
    if (!block) continue;
    // Skip blocks that contain only SSE comments (lines starting with :)
    const dataOnly = block.split(/\r?\n/).filter((l) => !l.startsWith(':')).join('\n').trim();
    if (!dataOnly) continue;
    const lines = block.split(/\r?\n/);
    let eventName: string | null = null;
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith(':')) continue; // SSE comment
      if (line.startsWith('event:')) {
        eventName = line.slice('event:'.length).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice('data:'.length).replace(/^ /, ''));
      }
    }
    const data = dataLines.join('\n');
    const isFinal = data === '[DONE]';
    out.push(Object.freeze({
      raw: block,
      eventName,
      data,
      isFinal,
    }));
  }
  return Object.freeze(out);
}

/** Extract token strings from a single data payload (JSON `{ token: "..." }` or raw text). */
export function tokenizeChunk(data: string): ReadonlyArray<string> {
  if (!data) return [];
  if (data === '[DONE]') return [];
  // Try JSON first.
  if (data.startsWith('{') || data.startsWith('[')) {
    try {
      const parsed = JSON.parse(data) as unknown;
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>;
        const candidates = [obj.token, obj.text, obj.delta, obj.content, obj.chunk];
        for (const c of candidates) {
          if (typeof c === 'string' && c.length > 0) return Object.freeze([c]);
        }
        // OpenAI-style choices[0].delta.content
        const choices = obj.choices;
        if (Array.isArray(choices) && choices[0] && typeof choices[0] === 'object') {
          const c0 = choices[0] as Record<string, unknown>;
          const delta = c0.delta as Record<string, unknown> | undefined;
          if (delta && typeof delta.content === 'string') {
            return Object.freeze([delta.content]);
          }
        }
      }
      if (Array.isArray(parsed)) {
        const arr = parsed.filter((s): s is string => typeof s === 'string');
        return Object.freeze(arr);
      }
    } catch {
      // not JSON, fall through to raw
    }
  }
  return Object.freeze([data]);
}

/** Strip control chars except \n and \t; trim trailing whitespace. */
export function sanitizeToken(text: string): string {
  if (!text) return '';
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '');
}

/** Validate that a chunk is reasonable UTF-8 (basic surrogate check). */
export function isValidUtf8(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Unpaired high surrogate
    if (code >= 0xD800 && code <= 0xDBFF) {
      const next = text.charCodeAt(i + 1);
      if (!(next >= 0xDC00 && next <= 0xDFFF)) return false;
    }
    // Unpaired low surrogate
    if (code >= 0xDC00 && code <= 0xDFFF) {
      const prev = i > 0 ? text.charCodeAt(i - 1) : 0;
      if (!(prev >= 0xD800 && prev <= 0xDBFF)) return false;
    }
  }
  return true;
}

// =================== EVENT BUS ===================

export type StreamEngine = {
  readonly state: StreamState;
  readonly requestId: RequestId | null;
  readonly accumulated: string;
  readonly tokens: ReadonlyArray<Token>;
  readonly totalEvents: number;
  readonly errorMessage: StreamError | null;
  readonly startedAt: number;
  readonly endedAt: number | null;
  readonly abortReason: 'user' | 'unmount' | 'timeout' | 'backoff_exceeded' | null;
  subscribe(listener: StreamListener): () => void;
  start(req: StreamRequest): Promise<void>;
  abort(reason: 'user' | 'unmount' | 'timeout' | 'backoff_exceeded'): void;
  reset(): void;
  getTelemetry(): StreamTelemetry;
};

export type StreamTelemetry = {
  readonly totalTokens: number;
  readonly totalEvents: number;
  readonly totalStateTransitions: number;
  readonly totalErrors: number;
  readonly totalAborts: number;
  readonly totalRetries: number;
  readonly totalBytesParsed: number;
  readonly durationMs: number | null;
  readonly stateDistribution: Readonly<Record<StreamState, number>>;
  readonly parserHits: Readonly<Record<ParserKind, number>>;
};

export type ParserKind = 'sse' | 'jsonl' | 'raw' | 'mock';

function makeTelemetry(): StreamTelemetry {
  const stateDistribution: Record<StreamState, number> = {
    IDLE: 0, CONNECTING: 0, STREAMING: 0, COMPLETE: 0, ERROR: 0, ABORTED: 0,
  };
  const parserHits: Record<ParserKind, number> = {
    sse: 0, jsonl: 0, raw: 0, mock: 0,
  };
  return Object.freeze({
    totalTokens: 0,
    totalEvents: 0,
    totalStateTransitions: 0,
    totalErrors: 0,
    totalAborts: 0,
    totalRetries: 0,
    totalBytesParsed: 0,
    durationMs: null,
    stateDistribution: Object.freeze(stateDistribution),
    parserHits: Object.freeze(parserHits),
  });
}

// =================== STREAM ENGINE FACTORY ===================

export type StreamDeps = {
  readonly fetchImpl?: typeof fetch;
  readonly parser?: ChunkParser;
  readonly retry?: RetryPolicy;
  readonly now?: () => number;
};

export type RetryPolicy = {
  readonly maxRetries: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
};

export const NO_RETRY: RetryPolicy = Object.freeze({
  maxRetries: 0, initialDelayMs: 0, maxDelayMs: 0,
});

export const DEFAULT_RETRY: RetryPolicy = Object.freeze({
  maxRetries: 2, initialDelayMs: 200, maxDelayMs: 2000,
});

/** Make a stream engine. Pure factory — no React, no DOM. */
export function makeStreamEngine(
  requestId: RequestId,
  deps: StreamDeps = {},
): StreamEngine {
  const listeners = new Set<StreamListener>();
  const now = deps.now ?? (() => Date.now());

  const stateRef: { current: StreamState } = { current: 'IDLE' };
  let prevState: StreamState = 'IDLE';
  let accumulated = '';
  let tokens: ReadonlyArray<Token> = [];
  let totalEvents = 0;
  let errorMessage: StreamError | null = null;
  let abortReason: 'user' | 'unmount' | 'timeout' | 'backoff_exceeded' | null = null;
  let startedAt = 0;
  let endedAt: number | null = null;
  let abortController: AbortController | null = null;
  let telemetry: StreamTelemetry = makeTelemetry();

  function emit(ev: StreamEvent): void {
    totalEvents++;
    if (ev.kind === 'state') {
      telemetry = bumpState(telemetry, ev.state);
    }
    telemetry = { ...telemetry, totalEvents };
    if (ev.kind === 'token') {
      telemetry = { ...telemetry, totalTokens: tokens.length };
    }
    if (ev.kind === 'error') {
      telemetry = { ...telemetry, totalErrors: (telemetry.totalErrors + 1) };
    }
    if (ev.kind === 'abort') {
      telemetry = { ...telemetry, totalAborts: (telemetry.totalAborts + 1) };
    }
    for (const l of listeners) {
      try { l(ev); } catch { /* swallow listener errors */ }
    }
  }

  function transition(next: StreamState): void {
    if (stateRef.current === next) return;
    assertTransition(stateRef.current, next);
    prevState = stateRef.current;
    stateRef.current = next;
    telemetry = { ...telemetry, totalStateTransitions: telemetry.totalStateTransitions + 1 };
    emit({ kind: 'state', state: stateRef.current, prev: prevState, at: now() });
  }

  async function start(req: StreamRequest): Promise<void> {
    const startState = stateRef.current;
    if (startState !== 'IDLE') {
      throw new Error(`start() called in non-IDLE state: ${startState}`);
    }
    startedAt = now();
    endedAt = null;
    accumulated = '';
    tokens = [];
    errorMessage = null;
    abortReason = null;
    abortController = new AbortController();
    if (req.signal) {
      req.signal.addEventListener('abort', () => {
        abortController?.abort();
      });
    }
    transition('CONNECTING');

    const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
    if (!fetchImpl) {
      transition('ERROR');
      const msg = makeStreamError('No fetch implementation available');
      errorMessage = msg;
      emit({ kind: 'error', error: msg, at: now() });
      endedAt = now();
      telemetry = { ...telemetry, durationMs: endedAt - startedAt };
      return;
    }

    try {
      const response = await fetchImpl(req.url, {
        method: req.method ?? 'GET',
        headers: req.headers,
        body: req.body ?? null,
        signal: abortController.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (!response.body) {
        transition('STREAMING');
        transition('COMPLETE');
        emit({ kind: 'done', totalTokens: 0, finalText: '', at: now() });
        endedAt = now();
        telemetry = { ...telemetry, durationMs: endedAt - startedAt };
        return;
      }
      transition('STREAMING');
      await consumeReader(response.body.getReader(), req.parser ?? defaultParser, telemetry, (tok) => {
        const token: Token = {
          id: nextTokenIdRaw() as TokenId,
          text: sanitizeToken(tok),
          index: tokens.length,
          receivedAt: now(),
        };
        if (!isValidUtf8(token.text)) {
          // skip invalid UTF-8 silently — caller can see count discrepancy
          return;
        }
        tokens = Object.freeze([...tokens, token]);
        accumulated = tokens.map((t) => t.text).join('');
        emit({ kind: 'token', token, accumulated, at: now() });
      });
      const afterStreaming: StreamState = stateRef.current;
      if (afterStreaming === 'STREAMING') {
        transition('COMPLETE');
        emit({ kind: 'done', totalTokens: tokens.length, finalText: accumulated, at: now() });
      }
    } catch (e) {
      const errStr = String(e instanceof Error ? e.message : e);
      const isAbort = errStr.toLowerCase().includes('abort') ||
                      (abortController?.signal.aborted ?? false);
      const currentState: StreamState = stateRef.current;
      if (isAbort) {
        if (abortReason === null) abortReason = 'user';
        if (currentState !== 'ABORTED') {
          transition('ABORTED');
          emit({ kind: 'abort', reason: abortReason, at: now() });
        }
      } else {
        if (currentState !== 'ERROR') {
          transition('ERROR');
          errorMessage = makeStreamError(errStr);
          emit({ kind: 'error', error: errorMessage, at: now() });
        }
      }
    } finally {
      endedAt = now();
      telemetry = { ...telemetry, durationMs: endedAt - startedAt };
    }
  }

  function abort(reason: 'user' | 'unmount' | 'timeout' | 'backoff_exceeded'): void {
    abortReason = reason;
    try {
      abortController?.abort();
    } catch { /* ignore */ }
    if (stateRef.current === 'IDLE' || stateRef.current === 'COMPLETE' || stateRef.current === 'ERROR' || stateRef.current === 'ABORTED') {
      return;
    }
    transition('ABORTED');
    emit({ kind: 'abort', reason, at: now() });
  }

  function reset(): void {
    listeners.clear();
    stateRef.current = 'IDLE';
    prevState = 'IDLE';
    accumulated = '';
    tokens = [];
    totalEvents = 0;
    errorMessage = null;
    abortReason = null;
    startedAt = 0;
    endedAt = null;
    abortController = null;
    telemetry = makeTelemetry();
  }

  return {
    get state() { return stateRef.current; },
    get requestId() { return requestId; },
    get accumulated() { return accumulated; },
    get tokens() { return tokens; },
    get totalEvents() { return totalEvents; },
    get errorMessage() { return errorMessage; },
    get startedAt() { return startedAt; },
    get endedAt() { return endedAt; },
    get abortReason() { return abortReason; },
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    start,
    abort,
    reset,
    getTelemetry() { return telemetry; },
  };
}

// =================== READER + PARSER HELPERS ===================

/** Consume a ReadableStreamDefaultReader, parsing bytes via the given parser. */
export async function consumeReader(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  parser: ChunkParser,
  baseTelemetry: StreamTelemetry,
  onToken: (token: string) => void,
): Promise<void> {
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const tokens = parser(buffer);
    if (tokens.length === 0) continue;
    buffer = '';
    for (const tok of tokens) {
      onToken(tok);
    }
  }
  // Flush trailing partial buffer (if parser returns nothing, treat as raw token)
  if (buffer.length > 0) {
    for (const tok of parser(buffer)) {
      onToken(tok);
    }
  }
}

const _noopTelemetry: StreamTelemetry = makeTelemetry();

/** Default parser: SSE-style, splits on \n\n then tokenizes data lines. */
export const defaultParser: ChunkParser = (raw) => {
  const blocks = parseSSEBlocks(raw);
  const out: string[] = [];
  for (const b of blocks) {
    if (b.isFinal) {
      // emit nothing for [DONE], but caller sees stateRef.current transition
      continue;
    }
    for (const tok of tokenizeChunk(b.data)) {
      out.push(tok);
    }
  }
  return Object.freeze(out);
};

/** JSONL parser: each line is one JSON object with `text`/`token`/`delta` field. */
export const jsonlParser: ChunkParser = (raw) => {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    if (!line) continue;
    const tokens = tokenizeChunk(line);
    out.push(...tokens);
  }
  return Object.freeze(out);
};

/** Raw parser: emit whole payload as one token (used for non-streaming fallback). */
export const rawParser: ChunkParser = (raw) => {
  if (!raw) return [];
  return Object.freeze([raw]);
};

/** Increment stateRef.current distribution count immutably. */
function bumpState(t: StreamTelemetry, s: StreamState): StreamTelemetry {
  const next = { ...t.stateDistribution };
  next[s] = (next[s] ?? 0) + 1;
  return { ...t, stateDistribution: Object.freeze(next) };
}

// =================== BACKOFF ===================

/** Pure backoff schedule: returns delay in ms for attempt `n` (0-indexed). */
export function backoffDelay(
  attempt: number,
  policy: RetryPolicy = DEFAULT_RETRY,
): number {
  if (attempt < 0) return 0;
  if (attempt >= policy.maxRetries) return -1; // signal: exceeded
  const base = policy.initialDelayMs * Math.pow(2, attempt);
  const capped = Math.min(base, policy.maxDelayMs);
  // 0-25% jitter
  const jitter = capped * (Math.random() * 0.25);
  return Math.floor(capped + jitter);
}

/** Sleep utility (re-exported for tests). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =================== RETRY WRAPPER ===================

/** Wrap a stream request with retry. If max retries exceeded, abort reason becomes 'backoff_exceeded'. */
export async function startWithRetry(
  engine: StreamEngine,
  req: StreamRequest,
  policy: RetryPolicy = DEFAULT_RETRY,
): Promise<void> {
  let attempt = 0;
  while (true) {
    await engine.start(req);
    if (engine.state === 'ERROR' && attempt < policy.maxRetries) {
      const delay = backoffDelay(attempt, policy);
      if (delay < 0) {
        engine.abort('backoff_exceeded');
        return;
      }
      attempt++;
      await sleep(delay);
      engine.reset();
      continue;
    }
    if (engine.state === 'ERROR' && attempt >= policy.maxRetries) {
      engine.abort('backoff_exceeded');
    }
    return;
  }
}

// =================== MOCK EVENT SOURCE ===================
// Used by specs to simulate a streaming source without a real server.

export type MockEventSourceMessage = {
  readonly event?: string;
  readonly data: string;
  readonly delayMs?: number;
};

/** Create a ReadableStream that yields SSE-formatted bytes over time. */
export function mockSSEStream(
  messages: ReadonlyArray<MockEventSourceMessage>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (i >= messages.length) {
        controller.close();
        return;
      }
      const msg = messages[i++];
      if (!msg) {
        controller.close();
        return;
      }
      if (msg.delayMs && msg.delayMs > 0) {
        await sleep(msg.delayMs);
      }
      const eventLine = msg.event ? `event: ${msg.event}\n` : '';
      const chunk = `${eventLine}data: ${msg.data}\n\n`;
      controller.enqueue(encoder.encode(chunk));
    },
  });
}

/** Create a fetch-compatible Response backed by a mock SSE stream. */
export function mockSSEResponse(
  messages: ReadonlyArray<MockEventSourceMessage>,
  init: { readonly status?: number; readonly headers?: Record<string, string> } = {},
): Response {
  const body = mockSSEStream(messages);
  return new Response(body, {
    status: init.status ?? 200,
    headers: init.headers ?? { 'content-type': 'text/event-stream' },
  });
}

// =================== TELEMETRY DIFF ===================

/** Compute a delta between two telemetry snapshots (for tests + monitoring). */
export function telemetryDiff(
  before: StreamTelemetry,
  after: StreamTelemetry,
): Partial<StreamTelemetry> {
  const diff: Record<string, unknown> = {};
  if (after.totalTokens !== before.totalTokens) diff.totalTokens = after.totalTokens - before.totalTokens;
  if (after.totalEvents !== before.totalEvents) diff.totalEvents = after.totalEvents - before.totalEvents;
  if (after.totalStateTransitions !== before.totalStateTransitions) diff.totalStateTransitions = after.totalStateTransitions - before.totalStateTransitions;
  if (after.totalErrors !== before.totalErrors) diff.totalErrors = after.totalErrors - before.totalErrors;
  if (after.totalAborts !== before.totalAborts) diff.totalAborts = after.totalAborts - before.totalAborts;
  if (after.durationMs !== before.durationMs) diff.durationMs = (after.durationMs ?? 0) - (before.durationMs ?? 0);
  return Object.freeze(diff);
}

// =================== FORMATTERS ===================

/** Format accumulated text into a CSS-safe snippet for typewriter effect. */
export function formatForTypewriter(text: string, maxLen = 200): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

/** Count tokens (very approximate, word + punctuation). */
export function approxTokenCount(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return words;
}

/** Read-only view of the stateRef.current machine for UI consumers. */
export function describeState(s: StreamState): string {
  switch (s) {
    case 'IDLE': return 'Pronto para iniciar';
    case 'CONNECTING': return 'Conectando…';
    case 'STREAMING': return 'Recebendo resposta…';
    case 'COMPLETE': return 'Concluído';
    case 'ERROR': return 'Erro';
    case 'ABORTED': return 'Interrompido';
  }
}

// =================== AUDIT / EXPORT ===================

/** Export a frozen snapshot of engine state for serialization. */
export function snapshotEngine(engine: StreamEngine): {
  readonly requestId: string | null;
  readonly state: StreamState;
  readonly tokenCount: number;
  readonly accumulatedLength: number;
  readonly errorMessage: string | null;
  readonly totalEvents: number;
  readonly durationMs: number | null;
} {
  return Object.freeze({
    requestId: engine.requestId,
    state: engine.state,
    tokenCount: engine.tokens.length,
    accumulatedLength: engine.accumulated.length,
    errorMessage: engine.errorMessage,
    totalEvents: engine.totalEvents,
    durationMs: engine.endedAt !== null && engine.startedAt > 0 ? engine.endedAt - engine.startedAt : null,
  });
}

/** Audit helper: returns true iff the engine ended in a terminal stateRef.current. */
export function isTerminal(s: StreamState): boolean {
  return s === 'COMPLETE' || s === 'ERROR' || s === 'ABORTED';
}

// =================== _resetForTests ===================

export function _resetTokenCounterForTests(): void {
  _tokCounter = 0;
}

// Suppress unused warnings for default parser telemetry param / noop
void _noopTelemetry;
