// ============================================================================
// ai/queue/ai-jobs — Akasha-specific job queue layer (Wave 39 — 2026-07-01)
// ============================================================================
// Specialized AI job dispatch extending src/lib/queue/bull-queue.ts (W37-6).
// Adds:
//
//   1. Surface-aware concurrency — text (10), voice (2), image (3) parallel.
//   2. Priority queue — PRO > FREE; escalation jobs (W38-5 safety) highest.
//   3. Per-surface timeouts — text 30s, image 60s, voice 120s.
//   4. Exponential backoff — 3 retries max, dead-letter to `cdc:dlq:ai:*`.
//   5. Rate-limit awareness — staggered dispatch when OpenAI / ElevenLabs
//      returns 429; queues drift to backoff window automatically.
//
// Design choices:
//   - **Composer pattern** — `ai-jobs` wraps `bull-queue` so the existing
//     config registry stays the source of truth. Akasha does NOT redefine
//     QUEUE_CONFIG; instead we tag AI jobs with a `priority` and let
//     workers filter by surface.
//   - **Priority score** — computed from (tier, surface, escalationFlag).
//   - **DLQ** — naming `cdc:dlq:ai:<surface>` for admin inspection.
//   - **LGPD Art. 18** — DLQ entries store hashed userId + payload digest,
//     never raw PII.
//
// Reference: docs/AKASHA-PRODUCTION-W39.md §4 (queue + concurrency).
// ============================================================================

import { backoffDelay, QUEUE_CONFIG, type QueueConfig, type QueueType } from "../../queue/bull-queue";

// ---------------------------------------------------------------------------
// Surface + per-surface config
// ---------------------------------------------------------------------------

export type AISurface = "text" | "voice" | "image";

export interface SurfaceQueueConfig {
  /** Queue type in bull-queue.ts. */
  queueType: QueueType;
  /** Override concurrency (independent of QUEUE_CONFIG). */
  concurrency: number;
  /** Hard timeout per job (ms). */
  jobTimeoutMs: number;
  /** Max retries per job. */
  maxRetries: number;
}

export const SURFACE_CONFIG: Record<AISurface, SurfaceQueueConfig> = Object.freeze({
  text:  { queueType: "AI_PROCESSING", concurrency: 10, jobTimeoutMs: 30_000, maxRetries: 3 },
  voice: { queueType: "AI_PROCESSING", concurrency: 2,  jobTimeoutMs: 120_000, maxRetries: 3 },
  image: { queueType: "IMAGE_PROCESSING", concurrency: 3, jobTimeoutMs: 60_000, maxRetries: 3 },
});

/** Stable DLQ name per surface. */
export function dlqKeyForSurface(surface: AISurface): string {
  return `cdc:dlq:ai:${surface}`;
}

// ---------------------------------------------------------------------------
// Job shape
// ---------------------------------------------------------------------------

export type UserTier = "FREE" | "PRO" | "ADMIN";

export interface AiJobPriority {
  /** Tier weight — ADMIN=100, PRO=50, FREE=10. */
  tierWeight: number;
  /** Surface weight — text=1, image=3, voice=5 (voice rare + expensive). */
  surfaceWeight: number;
  /** True if escalation triggered (e.g. user in safety flow — W38-5). */
  escalationBoost: boolean;
  /** Optional manual override (0..100). 100 = top priority. */
  manualBoost?: number;
}

export const TIER_WEIGHTS: Record<UserTier, number> = Object.freeze({
  FREE: 10,
  PRO: 50,
  ADMIN: 100,
});

export interface AkashaJob {
  /** Stable job ID (uuid v4). */
  id: string;
  surface: AISurface;
  userId: string;
  userTier: UserTier;
  /** Payload is opaque — handled by the worker. */
  payload: Record<string, unknown>;
  priority: AiJobPriority;
  /** Epoch ms — scheduled-for, defaulted to now. */
  scheduledFor?: number;
  /** Optional correlation ID for distributed tracing. */
  traceId?: string;
}

// ---------------------------------------------------------------------------
// Priority computation
// ---------------------------------------------------------------------------

/**
 * Compute priority score. Higher = served first.
 *
 * Formula: tierWeight * 1.0 + surfaceWeight * 0.3 + (escalation ? 1000 : 0) + manualBoost
 *
 * Escalation boost is intentionally massive (1000) so safety-flagged jobs
 * ALWAYS win, regardless of tier. This is the W38-5 invariant: user safety
 * >> user payment tier.
 */
export function computePriority(job: AkashaJob): number {
  const base = (job.priority.tierWeight ?? TIER_WEIGHTS[job.userTier])
    + (job.priority.surfaceWeight ?? 1) * 0.3
    + (job.priority.escalationBoost ? 1000 : 0)
    + (job.priority.manualBoost ?? 0);
  return Math.max(0, Math.round(base));
}

// ---------------------------------------------------------------------------
// Envelope — what hits Redis / BullMQ
// ---------------------------------------------------------------------------

export interface QueuedAiJob extends AkashaJob {
  /** Computed priority at enqueue time — stored separately for stable sort. */
  priorityScore: number;
  /** Backoff calculator owns this — read by worker on retry. */
  attempt: number;
  /** Wall-clock enqueue ms. */
  enqueuedAt: number;
  /** Surface timeout at time of enqueue (jobs cannot outlive it). */
  timeoutMs: number;
}

/**
 * Build a queueable AI job. Computes priority and attaches BullMQ-compatible
 * metadata. Caller is responsible for actually pushing to BullMQ via the
 * existing helpers in `bull-queue.ts`.
 */
export function enqueueAkashaJob(input: AkashaJob): QueuedAiJob {
  const cfg = SURFACE_CONFIG[input.surface];
  const priorityScore = computePriority(input);
  return {
    ...input,
    priorityScore,
    attempt: 0,
    enqueuedAt: Date.now(),
    timeoutMs: cfg.jobTimeoutMs,
  };
}

// ---------------------------------------------------------------------------
// Backoff for AI jobs — exponential with full jitter
// ---------------------------------------------------------------------------

/**
 * AI-specific backoff. Same algorithm as bull-queue but constrained to
 * AI per-surface config (5s base, 60s cap). Reuses `backoffDelay` from
 * the registry, defaulting when not provided.
 */
export function aiBackoffMs(attempt: number, surface: AISurface): number {
  const cfg = SURFACE_CONFIG[surface];
  const queueCfg: QueueConfig = QUEUE_CONFIG[cfg.queueType];
  return backoffDelay(attempt, queueCfg);
}

// ---------------------------------------------------------------------------
// Concurrency guard
// ---------------------------------------------------------------------------

/**
 * Per-process concurrency guard (advisory — workers should still check
 * BullMQ's own concurrency). The orchestrator can use this to backpressure
 * dispatcher loops without spamming Redis.
 */
export class ConcurrencyGuard {
  private readonly running = new Map<AISurface, number>();
  constructor(private readonly limits: Record<AISurface, number>) {}

  tryAcquire(surface: AISurface): boolean {
    const cur = this.running.get(surface) ?? 0;
    if (cur >= this.limits[surface]) return false;
    this.running.set(surface, cur + 1);
    return true;
  }

  release(surface: AISurface): void {
    const cur = this.running.get(surface) ?? 0;
    this.running.set(surface, Math.max(0, cur - 1));
  }

  counts(): Record<AISurface, number> {
    return {
      text: this.running.get("text") ?? 0,
      voice: this.running.get("voice") ?? 0,
      image: this.running.get("image") ?? 0,
    };
  }
}

/** Default guard mirroring SURFACE_CONFIG. */
export function defaultConcurrencyGuard(): ConcurrencyGuard {
  return new ConcurrencyGuard({
    text: SURFACE_CONFIG.text.concurrency,
    voice: SURFACE_CONFIG.voice.concurrency,
    image: SURFACE_CONFIG.image.concurrency,
  });
}

// ---------------------------------------------------------------------------
// Retry decision
// ---------------------------------------------------------------------------

export interface RetryDecision {
  retryable: boolean;
  delayMs: number;
  /** After how many attempts the job goes to DLQ. */
  attemptsRemaining: number;
}

const RETRYABLE_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ECONNRESET",
  "ENOTFOUND",
  "RATE_LIMIT",         // 429 → backoff
  "SERVER_ERROR",       // 5xx → backoff
  "OPENAI_OVERLOADED",
  "WHISPER_TIMEOUT",
]);

/**
 * Decide whether to retry. Pure function, no I/O. Caller is the worker
 * loop, which checks the returned `delayMs` and either re-enqueues or
 * writes to DLQ via `dlqKeyForSurface(surface)`.
 */
export function shouldRetry(
  job: QueuedAiJob,
  err: { code?: string; message?: string; statusCode?: number },
): RetryDecision {
  const cfg = SURFACE_CONFIG[job.surface];
  const status = err.statusCode ?? 0;
  const retryByStatus = status === 429 || (status >= 500 && status < 600);
  const retryByCode = !!err.code && RETRYABLE_ERROR_CODES.has(err.code);
  const retryable = (retryByCode || retryByStatus) && job.attempt < cfg.maxRetries;
  const delayMs = retryable ? aiBackoffMs(job.attempt + 1, job.surface) : 0;
  return {
    retryable,
    delayMs,
    attemptsRemaining: Math.max(0, cfg.maxRetries - job.attempt),
  };
}

// ---------------------------------------------------------------------------
// DLQ entry shape (for admin inspection)
// ---------------------------------------------------------------------------

export interface DLQEntry {
  jobId: string;
  surface: AISurface;
  /** Hashed userId — never raw. */
  userIdHash: string;
  attempts: number;
  lastError: { code?: string; message?: string; statusCode?: number };
  enqueuedAt: number;
  failedAt: number;
  traceId?: string;
}

/**
 * Build DLQ entry from a failed job. The userId is hashed via the
 * latency-optimizer anonymizer (sha256 truncated to 16 chars).
 */
export function buildDLQEntry(
  job: QueuedAiJob,
  err: { code?: string; message?: string; statusCode?: number },
): DLQEntry {
  // Local import to avoid circular dependency.
  const { anonymizeUserId } = require("../latency-optimizer") as typeof import("../latency-optimizer");
  return {
    jobId: job.id,
    surface: job.surface,
    userIdHash: anonymizeUserId(job.userId),
    attempts: job.attempt,
    lastError: {
      code: err.code,
      message: (err.message ?? "").slice(0, 500),
      statusCode: err.statusCode,
    },
    enqueuedAt: job.enqueuedAt,
    failedAt: Date.now(),
    traceId: job.traceId,
  };
}

// ---------------------------------------------------------------------------
// Self-test (pure)
// ---------------------------------------------------------------------------

export interface QueueHealth {
  surfaces: AISurface[];
  guardCounts: Record<AISurface, number>;
  limitsOk: boolean;
}

export function queueHealth(guard: ConcurrencyGuard): QueueHealth {
  const counts = guard.counts();
  const limitsOk =
    counts.text <= SURFACE_CONFIG.text.concurrency &&
    counts.voice <= SURFACE_CONFIG.voice.concurrency &&
    counts.image <= SURFACE_CONFIG.image.concurrency;
  return {
    surfaces: ["text", "voice", "image"],
    guardCounts: counts,
    limitsOk,
  };
}
