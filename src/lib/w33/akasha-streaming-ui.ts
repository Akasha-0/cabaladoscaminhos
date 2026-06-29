// src/lib/w33/akasha-streaming-ui.ts
// Cycle 33 worker B — Akasha IA streaming UI conversion helpers
// Composes w29/akasha-streaming (SSE) + w25/akasha-streaming-ui (renderer state)
// Scope: token chunks, abort, citation chips, retry with backoff
// Namespace: w33 — self-contained, type-only deps on other waves

export type StreamPhase = "idle" | "connecting" | "streaming" | "done" | "aborted" | "error";

export interface StreamToken {
  readonly seq: number;
  readonly text: string;
  readonly isFinal: boolean;
  readonly timestamp: number;
}

export interface CitationChip {
  readonly id: string;
  readonly sourceType: "biblia" | "odu" | "tarot" | "astrologia" | "numerologia" | "oraculo" | "external_link";
  readonly reference: string;
  readonly label: string;
  readonly tooltipText: string;
  readonly startOffset: number; // char offset in full text
  readonly endOffset: number;
}

export interface AkashaStreamState {
  readonly phase: StreamPhase;
  readonly tokens: ReadonlyArray<StreamToken>;
  readonly citations: ReadonlyArray<CitationChip>;
  readonly fullText: string;
  readonly errorMessage: string | null;
  readonly startedAt: number | null;
  readonly completedAt: number | null;
  readonly retryCount: number;
}

export const INITIAL_STREAM_STATE: AkashaStreamState = {
  phase: "idle",
  tokens: [],
  citations: [],
  fullText: "",
  errorMessage: null,
  startedAt: null,
  completedAt: null,
  retryCount: 0,
};

export function appendToken(
  state: AkashaStreamState,
  token: StreamToken,
): AkashaStreamState {
  if (state.phase === "aborted" || state.phase === "done" || state.phase === "error") {
    return state;
  }
  const tokens = [...state.tokens, token];
  const fullText = tokens.map((t) => t.text).join("");
  return {
    ...state,
    phase: token.isFinal ? "done" : "streaming",
    tokens,
    fullText,
    completedAt: token.isFinal ? token.timestamp : state.completedAt,
  };
}

export function startStream(
  state: AkashaStreamState,
  now: number,
): AkashaStreamState {
  return {
    ...state,
    phase: "connecting",
    startedAt: now,
    completedAt: null,
    errorMessage: null,
    retryCount: 0,
  };
}

export function abortStream(
  state: AkashaStreamState,
  now: number,
): AkashaStreamState {
  return {
    ...state,
    phase: "aborted",
    completedAt: now,
  };
}

export function errorStream(
  state: AkashaStreamState,
  message: string,
  now: number,
): AkashaStreamState {
  return {
    ...state,
    phase: "error",
    errorMessage: message,
    completedAt: now,
  };
}

export interface RetryDecision {
  readonly shouldRetry: boolean;
  readonly delayMs: number;
  readonly attemptNumber: number;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 800;

export function decideRetry(
  state: AkashaStreamState,
  errorMessage: string,
): RetryDecision {
  const next = state.retryCount + 1;
  if (next > MAX_RETRIES) {
    return { shouldRetry: false, delayMs: 0, attemptNumber: state.retryCount };
  }
  const isTransient = /network|timeout|429|503|fetch failed/i.test(errorMessage);
  if (!isTransient && state.retryCount > 0) {
    return { shouldRetry: false, delayMs: 0, attemptNumber: state.retryCount };
  }
  const delayMs = BASE_DELAY_MS * Math.pow(2, state.retryCount);
  return { shouldRetry: true, delayMs, attemptNumber: next };
}

export interface RenderedChunk {
  readonly displayText: string;
  readonly activeCitation: CitationChip | null;
}

export function pickActiveCitation(
  state: AkashaStreamState,
  cursorOffset: number,
): CitationChip | null {
  for (const c of state.citations) {
    if (cursorOffset >= c.startOffset && cursorOffset <= c.endOffset) {
      return c;
    }
  }
  return null;
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

export function readingTimeSeconds(text: string, wpm: number = 220): number {
  const words = wordCount(text);
  return Math.max(1, Math.round((words / wpm) * 60));
}

export interface StreamingMetrics {
  readonly tokensPerSecond: number;
  readonly totalTokens: number;
  readonly elapsedMs: number;
}

export function computeStreamingMetrics(
  state: AkashaStreamState,
  now: number,
): StreamingMetrics {
  if (state.startedAt === null) {
    return { tokensPerSecond: 0, totalTokens: 0, elapsedMs: 0 };
  }
  const elapsedMs = Math.max(1, now - state.startedAt);
  const totalTokens = state.tokens.length;
  return {
    tokensPerSecond: Math.round((totalTokens / elapsedMs) * 1000 * 10) / 10,
    totalTokens,
    elapsedMs,
  };
}

export function sanitizeStreamedText(text: string): string {
  // Remove control chars except \n and \t, collapse 3+ newlines
  return text
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n");
}
