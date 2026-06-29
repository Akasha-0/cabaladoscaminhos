/**
 * Akasha IA Streaming UI Conversion (Wave 29)
 *
 * Token-by-token streaming for the Akasha IA chat interface.
 * Pure types + helpers, framework-agnostic, easy to unit-test.
 *
 * See: docs/VISION.md §4 — Akasha IA como conselheira simbólica.
 */

export type StreamingPhase = "idle" | "connecting" | "streaming" | "done" | "error" | "aborted";

export interface StreamingChunk {
  /** Zero-based token index within the response. */
  readonly index: number;
  /** Decoded token text. Empty string for heartbeat chunks. */
  readonly token: string;
  /** True if the server signalled end-of-stream after this chunk. */
  readonly done: boolean;
  /** Optional finish reason from the provider (e.g. "stop", "length", "content_filter"). */
  readonly finishReason?: string;
  /** Unix ms when the chunk was observed by the client. */
  readonly observedAt: number;
}

export interface AkashaStreamState {
  phase: StreamingPhase;
  text: string;
  chunkCount: number;
  startedAt: number | null;
  endedAt: number | null;
  error: string | null;
}

export const initialStreamState: AkashaStreamState = {
  phase: "idle",
  text: "",
  chunkCount: 0,
  startedAt: null,
  endedAt: null,
  error: null,
};

/** SSE parser state machine. Yields chunks as they arrive over a ReadableStream. */
export async function* parseSseChunks(stream: ReadableStream<Uint8Array>): AsyncGenerator<StreamingChunk> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let index = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const evt of events) {
        const dataLine = evt
          .split("\n")
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trim())
          .join("");
        if (!dataLine || dataLine === "[DONE]") continue;
        try {
          const parsed = JSON.parse(dataLine) as { token?: string; done?: boolean; finishReason?: string };
          yield {
            index: index++,
            token: parsed.token ?? "",
            done: Boolean(parsed.done),
            finishReason: parsed.finishReason,
            observedAt: Date.now(),
          };
        } catch {
          // Skip malformed lines; do not abort the whole stream.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/** Apply a chunk to a stream state, returning the new state (immutable update). */
export function reduceStreamState(state: AkashaStreamState, chunk: StreamingChunk): AkashaStreamState {
  if (state.phase === "idle") {
    return {
      phase: "streaming",
      text: chunk.token,
      chunkCount: 1,
      startedAt: chunk.observedAt,
      endedAt: chunk.done ? chunk.observedAt : null,
      error: null,
    };
  }
  if (state.phase === "streaming") {
    return {
      ...state,
      text: state.text + chunk.token,
      chunkCount: state.chunkCount + 1,
      endedAt: chunk.done ? chunk.observedAt : state.endedAt,
    };
  }
  return state;
}

/** Mark the stream aborted and freeze the text accumulator. */
export function abortStreamState(state: AkashaStreamState, atMs: number = Date.now()): AkashaStreamState {
  if (state.phase === "done" || state.phase === "error") return state;
  return { ...state, phase: "aborted", endedAt: atMs };
}

/** Mark the stream errored. */
export function errorStreamState(state: AkashaStreamState, message: string, atMs: number = Date.now()): AkashaStreamState {
  return { ...state, phase: "error", error: message, endedAt: atMs };
}

/** Stop generation helper — wires an AbortController to a fetch call. */
export interface AbortHandle {
  readonly controller: AbortController;
  abort(reason?: string): void;
}

export function createAbortHandle(): AbortHandle {
  const controller = new AbortController();
  return {
    controller,
    abort(reason: string = "user-stopped") {
      controller.abort(reason);
    },
  };
}
