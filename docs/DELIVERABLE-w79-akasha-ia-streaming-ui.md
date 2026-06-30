# W79-C Deliverable — Akasha IA Streaming UI

**Branch:** `w79/akasha-ia-streaming-ui`
**Base SHA:** `b575c6e`
**Cycle:** 79
**Worker:** W79-C (Coder)
**Time:** 2026-06-30 07:05 → 07:30 UTC (~25 min)

---

## Summary

Built the streaming UI layer for Akasha IA responses. The core engine consumes
SSE / fetch-stream responses with a strict state machine; the React component
renders tokens one-by-one with a typewriter effect, an abort-aware stop button,
an error boundary, and mobile-first accessible markup.

---

## Files Delivered

| File | LOC | Purpose |
|------|-----|---------|
| `src/lib/w79/akasha-ia-streaming.ts` | 724 | Core streaming engine (state machine + parsers + readers + retry + telemetry) |
| `src/lib/w79/akasha-ia-streaming-ui.tsx` | 384 | React UI: typewriter, stop button, error boundary, mobile-first |
| `src/lib/w79/akasha-ia-streaming.spec.ts` | 598 | 209 spec assertions (100% PASS) |
| `src/lib/w79/node-stubs.d.ts` | 77 | Worktree-isolated TSC stubs (vitest, react, process) |
| `tsconfig.w79.json` | 21 | Worktree-isolated TSC config (target=ES2022, strict, noUncheckedIndexedAccess) |
| `scripts/smoke/w79-akasha-ia-streaming.ts` | 257 | 82 smoke checks (100% PASS) |
| `docs/DELIVERABLE-w79-akasha-ia-streaming-ui.md` | this | Operational doc |
| **Total** | **~2061 LOC** | |

---

## Public API (engine)

### State machine
```ts
export const STREAM_STATES = ['IDLE','CONNECTING','STREAMING','COMPLETE','ERROR','ABORTED'] as const;
export type StreamState = typeof STREAM_STATES[number];
export const LEGAL_TRANSITIONS: ReadonlyMap<StreamState, ReadonlyArray<StreamState>>;
export function canTransition(from: StreamState, to: StreamState): boolean;
export function assertTransition(from: StreamState, to: StreamState): void;
export function isTerminal(s: StreamState): boolean;
export function describeState(s: StreamState): string; // Portuguese labels
```

**Legal transitions:**
- IDLE → CONNECTING
- CONNECTING → STREAMING | ERROR | ABORTED
- STREAMING → COMPLETE | ERROR | ABORTED
- COMPLETE / ERROR / ABORTED → (terminal)

Illegal transitions throw via `assertTransition`.

### Branded factories
```ts
export type RequestId   = Brand<string, 'RequestId'>;   // req_[a-z0-9_]{3,40}
export type TokenId     = Brand<string, 'TokenId'>;     // tok_…
export type StreamError = Brand<string, 'StreamError'>;  // any non-empty string

export function makeRequestId(raw: string): RequestId;
export function makeStreamError(raw: string): StreamError;
export function isStreamState(s: string): s is StreamState;
```

### Parsers
```ts
export function parseSSEBlocks(payload: string): ReadonlyArray<StreamChunk>;
export function tokenizeChunk(data: string): ReadonlyArray<string>; // JSON {token/text/delta} | raw
export function sanitizeToken(text: string): string;  // strip control chars except \n \t
export function isValidUtf8(text: string): boolean;   // surrogate-pair check
export const defaultParser: ChunkParser;  // SSE-aware
export const jsonlParser: ChunkParser;
export const rawParser: ChunkParser;
```

### Engine factory
```ts
export function makeStreamEngine(requestId: RequestId, deps?: StreamDeps): StreamEngine;

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
```

**Stream request:**
```ts
export type StreamRequest = {
  readonly url: string;
  readonly method?: 'GET' | 'POST';
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: string | null;
  readonly signal?: AbortSignal;
  readonly parser?: ChunkParser;
};
```

**Stream event types:**
```ts
export type StreamEvent =
  | { kind: 'state'; state: StreamState; prev: StreamState; at: number }
  | { kind: 'token'; token: Token; accumulated: string; at: number }
  | { kind: 'done';  totalTokens: number; finalText: string; at: number }
  | { kind: 'error'; error: StreamError; at: number }
  | { kind: 'abort'; reason: 'user'|'unmount'|'timeout'|'backoff_exceeded'; at: number };
```

### Retry / backoff
```ts
export type RetryPolicy = { maxRetries: number; initialDelayMs: number; maxDelayMs: number };
export const NO_RETRY: RetryPolicy;     // 0/0/0
export const DEFAULT_RETRY: RetryPolicy; // 2/200/2000
export function backoffDelay(attempt: number, policy?: RetryPolicy): number;  // -1 if exceeded
export async function startWithRetry(engine: StreamEngine, req: StreamRequest, policy?: RetryPolicy): Promise<void>;
```

After `maxRetries` exceeded, `engine.abort('backoff_exceeded')` is called and `abortReason` becomes `'backoff_exceeded'`.

### Mock sources (for tests)
```ts
export type MockEventSourceMessage = { event?: string; data: string; delayMs?: number };
export function mockSSEStream(messages: ReadonlyArray<MockEventSourceMessage>): ReadableStream<Uint8Array>;
export function mockSSEResponse(messages, init?): Response;  // content-type: text/event-stream
```

### Formatters / audit
```ts
export function snapshotEngine(engine: StreamEngine): { requestId, state, tokenCount, accumulatedLength, errorMessage, totalEvents, durationMs };
export function telemetryDiff(before: StreamTelemetry, after: StreamTelemetry): Partial<StreamTelemetry>;
export function formatForTypewriter(text: string, maxLen?: number): string;
export function approxTokenCount(text: string): number;
export async function consumeReader(reader: ReadableStreamDefaultReader<Uint8Array>, parser: ChunkParser, telemetry: StreamTelemetry, onToken: (token: string) => void): Promise<void>;
export function sleep(ms: number): Promise<void>;
```

---

## Public API (React UI)

### `<AkashaStreamingUI />`

```tsx
import { AkashaStreamingUI } from '@/lib/w79/akasha-ia-streaming-ui';

<AkashaStreamingUI
  url="/api/akasha-ia/stream"
  method="POST"
  headers={{ 'Content-Type': 'application/json' }}
  body={JSON.stringify({ prompt: 'O que é axé?' })}
  typewriterMs={18}
  onComplete={(text, telemetry) => console.log('done', text.length, telemetry)}
  onError={(err) => console.error('err', err)}
  onAbort={() => console.log('user aborted')}
/>
```

**Props:**
- `url: string` — endpoint to stream from
- `method?: 'GET' | 'POST'` — default GET
- `headers?: Readonly<Record<string, string>>`
- `body?: string | null`
- `typewriterMs?: number` — token-render delay (default 18, set 0 for instant)
- `requestId?: RequestId` — auto-generated if absent
- `onEvent?: (ev: StreamEvent) => void`
- `onComplete?: (text, telemetry) => void`
- `onError?: (error) => void`
- `onAbort?: () => void`
- `className?: string`
- `idleLabel?: string` — default "Pergunte à Akasha IA"
- `stopLabel?: string` — default "Parar geração"
- `testSkipTypewriter?: boolean` — skip delay for tests

**Accessibility (A11Y):**
- `aria-live="polite"` on the token stream
- `role="status"` on the state region (visually hidden)
- `aria-busy={true}` during STREAMING/CONNECTING
- Stop button has `aria-label`, is keyboard-focusable, ≥44px touch target
- Error boundary emits `role="alert"` fallback

**Mobile-first:**
- Stop button minHeight/minWidth 44px
- Output minHeight 44px (no layout shift as tokens render)
- Controls row minHeight 52px
- Single-column layout

### `<AkashaStreamingBoundary />`

React error boundary that catches render errors in the streaming UI and renders
a fallback. Used to wrap `<AkashaStreamingUI />`.

```tsx
<AkashaStreamingBoundary fallback={(err) => <div>Custom: {err.message}</div>}>
  <AkashaStreamingUI url="..." />
</AkashaStreamingBoundary>
```

---

## Verification Results

### TypeScript
```
$ npx tsc --noEmit --skipLibCheck --project tsconfig.w79.json
$ echo $?
0
```
**TSC=0 errors** ✅

### Spec (209 assertions)
```
$ node --experimental-strip-types --no-warnings src/lib/w79/akasha-ia-streaming.spec.ts
…
Spec summary: 209 passed, 0 failed
```
**spec 100% green** ✅

### Smoke (82 checks)
```
$ node --experimental-strip-types --no-warnings scripts/smoke/w79-akasha-ia-streaming.ts
…
Smoke summary: 82 passed, 0 failed
```
**smoke 100% green** ✅

### Hard requirements checklist
- [x] `git worktree add /tmp/w79-c b575c6e` — ISOLATED worktree
- [x] Branch `w79/akasha-ia-streaming-ui` — created
- [x] TSC=0 on isolated config
- [x] spec 100% green (209 assertions)
- [x] smoke 100% green (82 checks)
- [x] Object.freeze + ReadonlyArray throughout
- [x] Branded types for state enum, request id, token id, stream error
- [x] Self-running test harness (no vitest at runtime)
- [x] A11Y: aria-live="polite", role="status", keyboard accessible stop button
- [x] Mobile-first: 44px touch targets, no layout shift
- [x] NO real SSE server in tests — mock EventSource / ReadableStream
- [x] NO git push to main — branch-only

---

## Cycle 78 Lessons Applied

1. **Worktree-isolated tsconfig** with `types: []` + `node-stubs.d.ts` declaring
   `process`, `react`, `vitest` locally (cycle 78 lesson #3).
2. **Pure-JS SHA-256** not needed here (no hashing), but the
   `noUncheckedIndexedAccess`-friendly bracket patterns from cycle 78 lesson
   #1 are used.
3. **Self-running spec harness** with async test queue (cycle 60+ pattern).
4. **Object.freeze on every result + audit snapshot** (cycle 75 lesson #6).
5. **`_resetForTests()` is essential at scale** (cycle 77 lesson #5) — added
   `_resetTokenCounterForTests()` so spec tests are fully independent.

---

## New Lessons Learned (cycle 79) — promote to memory

1. **Async-aware test harness needs explicit drain.** The cycle 60+ pattern
   used `it()` synchronously and async tests were reported as "not supported".
   Fix: queue async tests, drain at end via top-level await
   (`await drainAsync()`). `--experimental-strip-types` in Node 22 supports
   top-level await. Pattern reusable for any engine with async I/O.

2. **`.not` modifier on expect needs Proxy + global flag (not recursive factory).**
   First attempt made `makeMatchers(false)` set `m.not = makeMatchers(true)`
   which set `m.not.not = makeMatchers(false)` → infinite recursion at
   construction time → stack overflow. Fix: use a global `_negate` flag toggled
   by a Proxy `get` handler that wraps every method call. Reusable for any
   minimal expect helper that needs `.not`.

3. **TS narrowing of `let state` across awaits is sticky.** After
   `if (state !== 'IDLE') throw`, TS narrows `state` to `'IDLE'` and doesn't
   widen it across `await fetchImpl(...)`. Comparison `state === 'STREAMING'`
   errors with "types 'IDLE' and 'STREAMING' have no overlap". Fix: wrap state
   in a mutable object reference (`const stateRef = { current: 'IDLE' }`) and
   read `stateRef.current`. Reusable for any async state machine.

4. **abort() in IDLE state must be a safe no-op.** Spec `expect(abort).not.toThrow()`
   failed because abort unconditionally called `transition('ABORTED')`, which
   throws on `IDLE → ABORTED`. Fix: early-return in abort for IDLE/COMPLETE/ERROR/ABORTED.
   Reusable for any safe-cancellation pattern on a state machine.

5. **`expect(x).toThrow()` without a fn arg must infer from subject.** Vitest's
   pattern: if `toThrow()` is called with no fn, the `expect(actual)` subject
   IS the function under test. Fix: `toThrow(fn?, msg?)` falls back to
   `typeof actual === 'function' ? actual : null`. Reusable for any minimal
   expect helper.

6. **`parseSSEBlocks` should skip blocks that are comments-only.** First impl
   kept `: heartbeat` blocks even though they had no `data:` line. Fix: filter
   lines starting with `:`, join, trim, skip if empty. Reusable for any SSE
   parser.

---

## Future Work (NOT in this cycle)

- Wire to a real `/api/akasha-ia/stream` SSE endpoint in the Next.js app
- Add Markdown rendering on the accumulated text (currently raw)
- Add token-by-token highlight for sacred-term glossary (Cigano Ramiro terms)
- Persist engine state to localStorage on ABORTED for resume-on-reload
- Hook into the W78 sound track library for completion sound (optional)

---

## How to verify

```bash
cd /tmp/w79-c
npx tsc --noEmit --skipLibCheck --project tsconfig.w79.json   # TSC=0
node --experimental-strip-types --no-warnings src/lib/w79/akasha-ia-streaming.spec.ts
node --experimental-strip-types --no-warnings scripts/smoke/w79-akasha-ia-streaming.ts
```
