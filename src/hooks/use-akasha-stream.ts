'use client';

// ============================================================================
// useAkashaStream — SSE consumer for /api/akashic/chat/stream
// ============================================================================
// Wave 26 — Akasha IA Streaming (W26).
// Wraps `fetch` + `ReadableStream` to consume Server-Sent Events from the
// Akasha IA backend. Tokens arrive incrementally; sources + meta arrive
// before the first token; the hook surfaces a typed state machine the page
// can render directly.
//
// Why fetch + ReadableStream (not EventSource):
//   - EventSource only supports GET. The Akasha endpoint takes POST because
//     it sends a payload (message, tradition, history, deepMode, topK, ...).
//   - fetch streams a ReadableStream<Uint8Array> directly with the same SSE
//     protocol, no extra dep, identical token-by-token UX.
//   - Works on slow 3G: we read chunks as they arrive and never buffer
//     beyond what `getReader()` already hands us.
//
// Abort / cleanup:
//   - Each request gets its own AbortController.
//   - On unmount we abort the in-flight reader so React doesn't fire state
//     updates on an unmounted component.
//   - "in-flight" ref guards against double-submit (user spam-clicks Send).
//
// Retry:
//   - `retry()` re-sends the last payload. Useful for transient errors
//     (network blip, OpenAI 502). User-triggered, not auto-retry — auto-retry
//     would burn rate-limit budget on streaming responses.
//
// Mobile-first:
//   - We never await `res.text()` (would buffer the whole stream).
//   - `decoder.decode(value, { stream: true })` preserves multi-byte UTF-8
//     across chunk boundaries (CJK chars / accents).
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// Types — mirror the SSE events emitted by /api/akashic/chat/stream
// ============================================================================

export interface RagSource {
  id: string;
  title: string;
  slug: string;
  similarity: number;
  excerpt?: string;
  tradition?: string;
  doi?: string;
}

export interface AkashaStreamMeta {
  model: string;
  /** ms — filled when `done` arrives (full request latency). */
  took_ms: number;
  rag_degraded?: boolean;
  rag_reason?: string;
  rag_took_ms?: number;
  tradition?: string | null;
  effective_tradition?: string | null;
  tradition_auto_detected?: boolean;
  deep_mode?: boolean;
}

export interface AkashaHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AkashaStreamPayload {
  message: string;
  tradition?: string | null;
  history?: AkashaHistoryMessage[];
  deepMode?: boolean;
  topK?: number;
  threshold?: number;
}

export type AkashaStreamStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'done'
  | 'error'
  | 'aborted';

export interface AkashaStreamError {
  code: string;
  message: string;
  /** HTTP status if the error happened before the stream opened. */
  status?: number;
}

export interface AkashaStreamState {
  status: AkashaStreamStatus;
  content: string;
  sources: RagSource[];
  meta: AkashaStreamMeta | null;
  error: AkashaStreamError | null;
}

export interface AkashaStreamResult extends AkashaStreamState {
  /** Send a new message; aborts any in-flight stream first. */
  send: (payload: AkashaStreamPayload) => void;
  /** Re-send the last payload (no-op if none). */
  retry: () => void;
  /** Cancel the current stream (no-op if idle). */
  abort: () => void;
  /** Reset state back to idle (use after "Nova conversa"). */
  reset: () => void;
  /** True while `connecting` or `streaming`. */
  isStreaming: boolean;
}

// ============================================================================
// SSE parsing — small, dependency-free
// ============================================================================

interface ParsedSseEvent {
  event: string;
  data: string;
}

/**
 * Splits the raw byte buffer into complete SSE events (terminated by a
 * blank line `\n\n`). Incomplete trailing data is preserved in `rest` for
 * the next chunk.
 */
function splitSseEvents(buffer: string): { events: ParsedSseEvent[]; rest: string } {
  const events: ParsedSseEvent[] = [];
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';

  for (const part of parts) {
    if (!part.trim()) continue;
    let event = 'message';
    let data = '';
    for (const line of part.split('\n')) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        // SSE spec: multiple `data:` lines are concatenated with newlines.
        data += (data ? '\n' : '') + line.slice(5).trim();
      }
    }
    if (data) events.push({ event, data });
  }
  return { events, rest };
}

// ============================================================================
// Hook
// ============================================================================

const INITIAL_STATE: AkashaStreamState = {
  status: 'idle',
  content: '',
  sources: [],
  meta: null,
  error: null,
};

export function useAkashaStream(): AkashaStreamResult {
  const [state, setState] = useState<AkashaStreamState>(INITIAL_STATE);

  // Refs that survive re-renders without triggering them.
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef<boolean>(false);
  const lastPayloadRef = useRef<AkashaStreamPayload | null>(null);
  // Track mounted state so async callbacks don't setState after unmount.
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Abort in-flight stream on unmount.
      abortRef.current?.abort();
      abortRef.current = null;
      inFlightRef.current = false;
    };
  }, []);

  // ─── Core: send a payload ──────────────────────────────────────────────
  const runStream = useCallback(async (payload: AkashaStreamPayload) => {
    // Double-connection guard. If the user spam-clicks Send, the second call
    // is a no-op — the existing stream will produce the response.
    if (inFlightRef.current) return;

    // Abort any leftover controller (defensive — should be null at this point).
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    inFlightRef.current = true;

    if (!mountedRef.current) {
      controller.abort();
      inFlightRef.current = false;
      return;
    }

    setState({
      status: 'connecting',
      content: '',
      sources: [],
      meta: null,
      error: null,
    });

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    try {
      const res = await fetch('/api/akashic/chat/stream', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        // Pre-stream error (4xx / 5xx with JSON body).
        let errBody: { error?: { code?: string; message?: string } } = {};
        try {
          errBody = await res.json();
        } catch {
          /* non-JSON body — fall through */
        }
        const code = errBody.error?.code ?? `HTTP_${res.status}`;
        const message =
          errBody.error?.message ?? `Erro ${res.status} ao conectar com a Akasha`;
        if (!mountedRef.current) return;
        setState({
          status: 'error',
          content: '',
          sources: [],
          meta: null,
          error: { code, message, status: res.status },
        });
        return;
      }

      if (!res.body) {
        if (!mountedRef.current) return;
        setState({
          status: 'error',
          content: '',
          sources: [],
          meta: null,
          error: {
            code: 'EMPTY_STREAM',
            message: 'Resposta sem corpo (stream vazio)',
          },
        });
        return;
      }

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedAnyToken = false;

      // Switch to "streaming" once we have an open reader.
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, status: 'streaming' }));
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { events, rest } = splitSseEvents(buffer);
        buffer = rest;

        for (const { event, data } of events) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(data);
          } catch {
            // Malformed JSON in an event — skip silently rather than killing
            // the whole stream. Other events may still arrive correctly.
            continue;
          }
          const p = parsed as {
            sources?: RagSource[];
            model?: string;
            rag_degraded?: boolean;
            rag_reason?: string;
            rag_took_ms?: number;
            tradition?: string | null;
            effective_tradition?: string | null;
            tradition_auto_detected?: boolean;
            deep_mode?: boolean;
            content?: string;
            message?: string;
            ok?: boolean;
          };

          if (!mountedRef.current) return;

          switch (event) {
            case 'sources':
              setState((prev) => ({
                ...prev,
                sources: p.sources ?? prev.sources,
              }));
              break;
            case 'meta':
              setState((prev) => ({
                ...prev,
                meta: {
                  model: p.model ?? prev.meta?.model ?? 'gpt-4o',
                  took_ms: prev.meta?.took_ms ?? 0,
                  rag_degraded: p.rag_degraded ?? false,
                  rag_reason: p.rag_reason,
                  rag_took_ms: p.rag_took_ms,
                  tradition: p.tradition ?? null,
                  effective_tradition: p.effective_tradition ?? null,
                  tradition_auto_detected: p.tradition_auto_detected,
                  deep_mode: p.deep_mode,
                },
              }));
              break;
            case 'token':
              receivedAnyToken = true;
              setState((prev) => ({
                ...prev,
                content: prev.content + (p.content ?? ''),
              }));
              break;
            case 'done':
              // `done` carries no timing info from the server (the route
              // doesn't include took_ms in the done payload) — leave the
              // page to compute it externally if it wants.
              setState((prev) => ({
                ...prev,
                status: 'done',
              }));
              break;
            case 'error':
              setState((prev) => ({
                ...prev,
                status: 'error',
                error: {
                  code: 'STREAM_ERROR',
                  message: p.message ?? 'Erro durante o streaming',
                },
              }));
              return;
            default:
              // Unknown event type — ignore.
              break;
          }
        }
      }

      // Stream ended without an explicit `done` event (server cut connection).
      // Still treat as success if we got at least one token.
      if (!mountedRef.current) return;
      setState((prev) => {
        if (prev.status === 'error') return prev; // an error event already set this
        if (!receivedAnyToken) {
          return {
            ...prev,
            status: 'error',
            error: {
              code: 'NO_TOKENS',
              message: 'A Akasha não retornou conteúdo.',
            },
          };
        }
        return { ...prev, status: 'done' };
      });
    } catch (err) {
      if (!mountedRef.current) return;
      // AbortError — user navigated away or clicked "stop". Don't surface as
      // an error to the UI; just mark aborted.
      if (err instanceof DOMException && err.name === 'AbortError') {
        setState((prev) => ({
          ...prev,
          status: 'aborted',
        }));
        return;
      }
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: {
          code: 'NETWORK_ERROR',
          message,
        },
      }));
    } finally {
      if (reader) {
        try {
          reader.releaseLock();
        } catch {
          /* already released */
        }
      }
      inFlightRef.current = false;
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, []);

  // ─── Public actions ────────────────────────────────────────────────────

  const send = useCallback(
    (payload: AkashaStreamPayload) => {
      lastPayloadRef.current = payload;
      void runStream(payload);
    },
    [runStream],
  );

  const retry = useCallback(() => {
    if (lastPayloadRef.current && !inFlightRef.current) {
      void runStream(lastPayloadRef.current);
    }
  }, [runStream]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    inFlightRef.current = false;
    if (mountedRef.current) {
      setState((prev) =>
        prev.status === 'streaming' || prev.status === 'connecting'
          ? { ...prev, status: 'aborted' }
          : prev,
      );
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    inFlightRef.current = false;
    lastPayloadRef.current = null;
    if (mountedRef.current) {
      setState(INITIAL_STATE);
    }
  }, []);

  const isStreaming = state.status === 'connecting' || state.status === 'streaming';

  return {
    ...state,
    send,
    retry,
    abort,
    reset,
    isStreaming,
  };
}

export default useAkashaStream;