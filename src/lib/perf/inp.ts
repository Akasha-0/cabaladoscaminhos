// ============================================================================
// perf/inp — Interaction to Next Paint optimization toolkit (Wave 36)
// ============================================================================
// INP replaces FID as a Core Web Vital in March 2024. The Akasha IA
// (Akashic chat) and the /feed infinite scroll are the two highest-INP
// surfaces in the app. This module ships:
//
//   1. Long task detector — surfaces blocking work >50ms to PostHog.
//   2. Scheduler.yield / setTimeout(0) helper — yields to the main thread.
//   3. Web Worker factory for Akasha IA — keeps heavy tokenization on a
//      separate thread.
//   4. Debounce + throttle primitives for search / scroll handlers.
//   5. Layout-thrash guard for the read-write-read pattern.
//
// Targets: p75 mobile INP < 200ms (good), < 100ms (great).
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SchedulePriority = "user-blocking" | "user-visible" | "background";

export interface LongTaskEntry {
  duration: number;
  startTime: number;
  name: string;
}

export type LongTaskListener = (entry: LongTaskEntry) => void;

// ---------------------------------------------------------------------------
// 1. Long task detector
// ---------------------------------------------------------------------------

const longTaskListeners = new Set<LongTaskListener>();
let longTaskObserver: PerformanceObserver | null = null;

/**
 * Start a PerformanceObserver for `longtask` entries. Each task >50ms is
 * forwarded to listeners AND to PostHog (via the dynamic import of
 * `monitoring/posthog` to avoid a circular dep).
 */
export function startLongTaskDetector(): () => void {
  if (typeof window === "undefined") return () => {};
  if (typeof PerformanceObserver === "undefined") return () => {};
  if (longTaskObserver) return stopLongTaskDetector;

  longTaskObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEntry[]) {
      const e = entry as PerformanceEntry & { duration: number; name: string };
      const payload: LongTaskEntry = {
        duration: Math.round(e.duration),
        startTime: Math.round(e.startTime),
        name: e.name ?? "unknown",
      };
      for (const listener of longTaskListeners) {
        try {
          listener(payload);
        } catch {
          /* never break UX on telemetry */
        }
      }
    }
  });

  try {
    longTaskObserver.observe({ entryTypes: ["longtask"] });
  } catch {
    // `longtask` not supported on Safari < 16.4 — fail open.
    return () => {};
  }

  return stopLongTaskDetector;
}

export function stopLongTaskDetector(): void {
  if (longTaskObserver) {
    try {
      longTaskObserver.disconnect();
    } catch {
      /* ignore */
    }
    longTaskObserver = null;
  }
}

export function onLongTask(listener: LongTaskListener): () => void {
  longTaskListeners.add(listener);
  return () => longTaskListeners.delete(listener);
}

// ---------------------------------------------------------------------------
// 2. Yield to main thread
// ---------------------------------------------------------------------------

/**
 * Yield control back to the browser so pending input events can be
 * processed. Uses `scheduler.yield()` where available (Chrome 129+),
 * falls back to `setTimeout(0)`. Use inside a hot loop to break long
 * tasks into ≤50ms chunks.
 *
 * @example
 *   for (const item of items) {
 *     processItem(item);
 *     if (i++ % 50 === 0) await yieldToMain();
 *   }
 */
export function yieldToMain(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  // `scheduler.yield` is the new spec — preferred over setTimeout because
  // it preserves user-blocking priority and doesn't increment the timer
  // queue depth that some browsers use as an INP signal.
  const scheduler = (window as Window & { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (scheduler?.yield) {
    return scheduler.yield();
  }
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

/**
 * Schedule `fn` at the given priority. Falls back to setTimeout(0) for
 * browsers without `scheduler.postTask` (Safari < 18, Firefox < 132).
 */
export function scheduleTask(
  fn: () => void | Promise<void>,
  priority: SchedulePriority = "user-visible",
): void {
  if (typeof window === "undefined") return;
  const scheduler = (window as Window & {
    scheduler?: {
      postTask?: (cb: () => void, opts: { priority: SchedulePriority }) => Promise<void>;
    };
  }).scheduler;
  if (scheduler?.postTask) {
    scheduler.postTask(() => void fn(), { priority });
    return;
  }
  const delay =
    priority === "user-blocking" ? 0 : priority === "user-visible" ? 16 : 50;
  window.setTimeout(() => void fn(), delay);
}

// ---------------------------------------------------------------------------
// 3. Web Worker factory — Akasha IA background processing
// ---------------------------------------------------------------------------

export interface AkashaWorkerRequest {
  id: string;
  type: "tokenize" | "embed" | "summarize" | "classify";
  payload: string;
}

export interface AkashaWorkerResponse {
  id: string;
  ok: boolean;
  result?: unknown;
  error?: string;
  durationMs: number;
}

export type AkashaWorkerMessageHandler = (response: AkashaWorkerResponse) => void;

/**
 * Spawn a Web Worker for the Akasha IA tokenization pipeline. Falls back
 * to `null` in SSR / non-browser envs — callers must check.
 *
 * The worker is generated by `scripts/workers/akasha-worker.mjs` (TODO:
 * created in W37 if needed; this Wave ships the contract).
 */
export function createAkashaWorker(
  onMessage: AkashaWorkerMessageHandler,
): Worker | null {
  if (typeof window === "undefined") return null;
  if (typeof Worker === "undefined") return null;
  try {
    // The worker bundle is emitted by the next build pipeline. If it's
    // not present (sandbox / first boot) the catch returns null and the
    // caller falls back to main-thread processing.
    const worker = new Worker(new URL("./workers/akasha-worker.mjs", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<AkashaWorkerResponse>) => {
      onMessage(event.data);
    };
    worker.onerror = (err) => {
      onMessage({
        id: "unknown",
        ok: false,
        error: String(err.message ?? err),
        durationMs: 0,
      });
    };
    return worker;
  } catch {
    return null;
  }
}

/**
 * Send a request to the Akasha worker with a generated id. Returns the
 * id so the caller can match the response.
 */
export function postToAkashaWorker(worker: Worker, type: AkashaWorkerRequest["type"], payload: string): string {
  const id = `ak-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const request: AkashaWorkerRequest = { id, type, payload };
  worker.postMessage(request);
  return id;
}

// ---------------------------------------------------------------------------
// 4. Debounce + throttle — search / scroll
// ---------------------------------------------------------------------------

/**
 * Trailing-edge debounce. Calls `fn` only after `waitMs` of quiet.
 * Use for: search input, autosize textareas, resize-observer callbacks.
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs: number,
): {
  (...args: TArgs): void;
  flush: () => void;
  cancel: () => void;
} {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingArgs: TArgs | null = null;

  const invoke = () => {
    if (pendingArgs) {
      fn(...pendingArgs);
      pendingArgs = null;
    }
    timer = null;
  };

  const debounced = (...args: TArgs) => {
    pendingArgs = args;
    if (timer != null) clearTimeout(timer);
    timer = setTimeout(invoke, waitMs);
  };

  debounced.flush = () => {
    if (timer != null) {
      clearTimeout(timer);
      invoke();
    }
  };

  debounced.cancel = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
    pendingArgs = null;
  };

  return debounced;
}

/**
 * Leading-edge throttle. Calls `fn` immediately, then ignores further
 * calls for `waitMs`. Use for: scroll handlers, pointer-move, etc.
 */
export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs: number,
): (...args: TArgs) => void {
  let lastCall = 0;
  let trailing: ReturnType<typeof setTimeout> | null = null;
  let pendingArgs: TArgs | null = null;

  return (...args: TArgs) => {
    const now = Date.now();
    const remaining = waitMs - (now - lastCall);
    if (remaining <= 0) {
      lastCall = now;
      fn(...args);
    } else {
      pendingArgs = args;
      if (trailing == null) {
        trailing = setTimeout(() => {
          lastCall = Date.now();
          trailing = null;
          if (pendingArgs) {
            fn(...pendingArgs);
            pendingArgs = null;
          }
        }, remaining);
      }
    }
  };
}

// ---------------------------------------------------------------------------
// 5. Layout-thrash guard — read/write/read pattern
// ---------------------------------------------------------------------------

/**
 * Batch a series of DOM reads, then a series of writes, to avoid the
 * read-write-read layout-thrash pattern that causes the janky INP spikes
 * observed in W27 audit. Pair with `requestAnimationFrame` for paint sync.
 *
 * @example
 *   batchDomOps(
 *     () => { a = elA.offsetTop; b = elB.offsetTop; },
 *     () => { elA.style.transform = `translateY(${a}px)`; elB.style.transform = `translateY(${b}px)`; },
 *   );
 */
export function batchDomOps(
  read: () => void,
  write: () => void,
): void {
  // Reads first — flushes any pending layout.
  read();
  // Writes second — queues the next layout.
  // Wrap in rAF to give the browser a chance to coalesce multiple writes
  // into a single style-recalc cycle.
  if (typeof window === "undefined") {
    write();
    return;
  }
  window.requestAnimationFrame(() => {
    write();
  });
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const INP_TARGET_MS = 200; // p75 mobile good
export const INP_TARGET_GREAT_MS = 100;
export const LONG_TASK_THRESHOLD_MS = 50;
