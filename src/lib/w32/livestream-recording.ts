// src/lib/w32/livestream-recording.ts
// Cycle 32 worker A — live stream recording pipeline
// Composes w27/live-stream-room (room lifecycle) + w30/livestream-host (host controls)
// Scope: storage abstraction, chunked upload, replay URL, expiry window
// Namespace: w32 — self-contained, no runtime deps on other waves

export type RecordingStatus =
  | "idle"
  | "starting"
  | "recording"
  | "paused"
  | "stopping"
  | "processing"
  | "ready"
  | "failed"
  | "expired";

export type StorageProvider = "supabase" | "s3" | "r2" | "gcs";

export interface RecordingConfig {
  readonly maxDurationSeconds: number; // hard cap (e.g. 4h)
  readonly chunkSizeBytes: number; // multipart chunk size
  readonly retentionDays: number; // auto-expire window
  readonly storageProvider: StorageProvider;
  readonly storageBucket: string;
  readonly enableTranscription: boolean;
  readonly maxBitrateKbps: number;
}

export interface RecordingChunk {
  readonly index: number;
  readonly startOffsetMs: number;
  readonly endOffsetMs: number;
  readonly sizeBytes: number;
  readonly checksumSha256: string;
  readonly uploadedAt: string; // ISO
}

export interface RecordingSession {
  readonly id: string;
  readonly roomId: string;
  readonly hostUserId: string;
  readonly status: RecordingStatus;
  readonly startedAt: string; // ISO
  readonly endedAt: string | null;
  readonly chunks: ReadonlyArray<RecordingChunk>;
  readonly totalBytes: number;
  readonly config: RecordingConfig;
  readonly replayUrl: string | null;
  readonly expiresAt: string | null; // ISO, derived from endedAt + retentionDays
  readonly errorMessage: string | null;
}

export const DEFAULT_RECORDING_CONFIG: RecordingConfig = {
  maxDurationSeconds: 4 * 60 * 60, // 4h
  chunkSizeBytes: 8 * 1024 * 1024, // 8 MB
  retentionDays: 30,
  storageProvider: "supabase",
  storageBucket: "livestream-recordings",
  enableTranscription: true,
  maxBitrateKbps: 4000,
};

/** Build the storage key for a chunk upload. */
export function buildChunkKey(
  sessionId: string,
  chunkIndex: number,
): string {
  return `recordings/${sessionId}/chunk-${String(chunkIndex).padStart(6, "0")}.webm`;
}

/** Build the storage key for the final merged artifact. */
export function buildFinalArtifactKey(sessionId: string): string {
  return `recordings/${sessionId}/final.mp4`;
}

/** Compute the expiry timestamp from a session end time. */
export function computeExpiry(
  endedAt: string,
  retentionDays: number,
): string {
  const end = new Date(endedAt).getTime();
  const expiry = end + retentionDays * 24 * 60 * 60 * 1000;
  return new Date(expiry).toISOString();
}

/** Append a chunk to a session, enforcing size/duration caps. */
export function appendChunk(
  session: RecordingSession,
  chunk: RecordingChunk,
): RecordingSession {
  if (session.status !== "recording" && session.status !== "paused") {
    return { ...session, errorMessage: `cannot append in status ${session.status}` };
  }
  const totalDurationMs = chunk.endOffsetMs;
  if (totalDurationMs > session.config.maxDurationSeconds * 1000) {
    return {
      ...session,
      status: "stopping",
      errorMessage: `max duration ${session.config.maxDurationSeconds}s exceeded`,
    };
  }
  return {
    ...session,
    chunks: [...session.chunks, chunk],
    totalBytes: session.totalBytes + chunk.sizeBytes,
  };
}

/** Mark a session as stopped, set endedAt + expiry + replayUrl. */
export function stopSession(
  session: RecordingSession,
  finalArtifactPath: string,
): RecordingSession {
  const endedAt = new Date().toISOString();
  return {
    ...session,
    status: "processing",
    endedAt,
    expiresAt: computeExpiry(endedAt, session.config.retentionDays),
    replayUrl: finalArtifactPath,
  };
}

/** Percent complete based on chunk count vs. expected total. */
export function recordingProgress(
  session: RecordingSession,
  expectedTotalChunks: number,
): number {
  if (expectedTotalChunks <= 0) return 0;
  return Math.min(100, Math.round((session.chunks.length / expectedTotalChunks) * 100));
}

/** Human-readable duration from chunk list. */
export function recordingDurationMs(session: RecordingSession): number {
  if (session.chunks.length === 0) return 0;
  return session.chunks[session.chunks.length - 1]!.endOffsetMs;
}

/** True if the recording is past its expiry window. */
export function isExpired(session: RecordingSession, now: string): boolean {
  if (!session.expiresAt) return false;
  return new Date(now).getTime() > new Date(session.expiresAt).getTime();
}

/** True if a session is recoverable (resumable after host reconnect). */
export function isRecoverable(session: RecordingSession): boolean {
  return (
    session.status === "recording" ||
    session.status === "paused" ||
    session.status === "processing"
  );
}
