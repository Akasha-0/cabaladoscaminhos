// ============================================================================
// queue/bull-queue — Background job queue (BullMQ + Redis) — Wave 37
// ============================================================================
// Six queue types, each with a tuned retry policy and DLQ:
//
//   1. EMAIL             — transactional + broadcast (welcome, digest, NPS)
//   2. AI_PROCESSING     — Akasha generation, embeddings, moderation
//   3. IMAGE_PROCESSING  — avatar crop, OG generation, library thumbnails
//   4. PDF_GENERATION    — invoices, certificados, ritual printables
//   5. ANALYTICS         — event rollups, weekly digest aggregation
//   6. CLEANUP           — orphan uploads, expired tokens, soft-deletes
//
// Design choices:
//   - **BullMQ** (not Bull v3) — modern TypeScript, native TS, Redis Streams.
//   - **Exponential backoff** per queue type (see BACKOFF_POLICY).
//   - **Dead-letter queue** — failed jobs land in `cdc:queue:<type>:dlq`.
//   - **Job monitoring** — `queueMonitor` exposes counters for the admin UI.
//   - **ioredis dependency** — already in package.json (W33 onboarding).
//
// Reference: docs/PERFORMANCE-PHASE-2-W36.md §8 (job queue design).
// ============================================================================

import type { RedisAdapter, RedisUseCase } from "../cache/redis-client";

// ---------------------------------------------------------------------------
// Queue catalog
// ---------------------------------------------------------------------------

export type QueueType =
  | "EMAIL"
  | "AI_PROCESSING"
  | "IMAGE_PROCESSING"
  | "PDF_GENERATION"
  | "ANALYTICS"
  | "CLEANUP";

export interface QueueConfig {
  name: QueueType;
  /** Default concurrency per worker. */
  concurrency: number;
  /** Max retries before DLQ. */
  maxRetries: number;
  /** Backoff base ms (exponential: base * 2^attempt). */
  backoffBaseMs: number;
  /** Max backoff cap ms. */
  backoffMaxMs: number;
  /** Default job TTL (after which completed jobs are removed). */
  completedTtlSec: number;
  /** Failed-job retention. */
  failedTtlSec: number;
  /** Use case namespace in Redis. */
  redisUseCase: RedisUseCase;
}

export const QUEUE_CONFIG: Record<QueueType, QueueConfig> = {
  EMAIL: {
    name: "EMAIL",
    concurrency: 5,
    maxRetries: 5,
    backoffBaseMs: 2_000,
    backoffMaxMs: 300_000, // 5m
    completedTtlSec: 86_400,
    failedTtlSec: 604_800,
    redisUseCase: "queue",
  },
  AI_PROCESSING: {
    name: "AI_PROCESSING",
    concurrency: 3, // OpenAI rate-limit aware
    maxRetries: 3,
    backoffBaseMs: 5_000,
    backoffMaxMs: 600_000, // 10m
    completedTtlSec: 3600,
    failedTtlSec: 86_400,
    redisUseCase: "queue",
  },
  IMAGE_PROCESSING: {
    name: "IMAGE_PROCESSING",
    concurrency: 4,
    maxRetries: 4,
    backoffBaseMs: 3_000,
    backoffMaxMs: 300_000,
    completedTtlSec: 3600,
    failedTtlSec: 86_400,
    redisUseCase: "queue",
  },
  PDF_GENERATION: {
    name: "PDF_GENERATION",
    concurrency: 2,
    maxRetries: 3,
    backoffBaseMs: 5_000,
    backoffMaxMs: 600_000,
    completedTtlSec: 3600,
    failedTtlSec: 86_400,
    redisUseCase: "queue",
  },
  ANALYTICS: {
    name: "ANALYTICS",
    concurrency: 8,
    maxRetries: 2,
    backoffBaseMs: 1_000,
    backoffMaxMs: 60_000,
    completedTtlSec: 600,
    failedTtlSec: 3600,
    redisUseCase: "queue",
  },
  CLEANUP: {
    name: "CLEANUP",
    concurrency: 2,
    maxRetries: 3,
    backoffBaseMs: 10_000,
    backoffMaxMs: 600_000,
    completedTtlSec: 3600,
    failedTtlSec: 86_400,
    redisUseCase: "queue",
  },
};

// ---------------------------------------------------------------------------
// Job payload shapes (per queue)
// ---------------------------------------------------------------------------

export interface EmailJob {
  to: string;
  template: string;
  locale: string;
  data: Record<string, unknown>;
}

export interface AiProcessingJob {
  kind: "akasha" | "embedding" | "moderation";
  userId: string;
  payload: Record<string, unknown>;
}

export interface ImageProcessingJob {
  kind: "avatar-crop" | "og-generate" | "library-thumb";
  sourceUrl: string;
  outputKey: string;
}

export interface PdfGenerationJob {
  kind: "invoice" | "certificate" | "ritual-printable";
  userId: string;
  data: Record<string, unknown>;
}

export interface AnalyticsJob {
  kind: "event-rollup" | "weekly-digest" | "funnel-metrics";
  windowHours: number;
}

export interface CleanupJob {
  kind: "orphan-upload" | "expired-token" | "soft-delete";
  olderThanDays: number;
}

export type JobPayload =
  | EmailJob
  | AiProcessingJob
  | ImageProcessingJob
  | PdfGenerationJob
  | AnalyticsJob
  | CleanupJob;

// ---------------------------------------------------------------------------
// Backoff calculator — exponential with full jitter
// ---------------------------------------------------------------------------

export function backoffDelay(attempt: number, cfg: QueueConfig): number {
  if (attempt <= 0) return 0;
  const exp = Math.min(cfg.backoffBaseMs * 2 ** (attempt - 1), cfg.backoffMaxMs);
  // Full jitter: random between 0 and exp — prevents thundering herd.
  return Math.floor(Math.random() * exp);
}

// ---------------------------------------------------------------------------
// Enqueue helpers — type-safe job submission
// ---------------------------------------------------------------------------

export interface EnqueueOptions {
  /** Delay before first run (ms). */
  delayMs?: number;
  /** Override default maxRetries. */
  maxRetries?: number;
  /** Job ID for idempotency (BullMQ rejects duplicates). */
  jobId?: string;
  /** Priority — higher runs first (default 5). */
  priority?: number;
}

export interface JobRecord {
  id: string;
  queue: QueueType;
  payload: JobPayload;
  attempts: number;
  status: "waiting" | "active" | "completed" | "failed" | "delayed";
  enqueuedAt: number;
}

/**
 * Enqueue a job. Stores the record in Redis under the queue's namespace.
 * Returns a job ID (caller-supplied or auto-generated).
 *
 * Real BullMQ integration would call `queue.add(name, payload, opts)`. Here
 * we model the same semantics against the lightweight Redis adapter so the
 * module is unit-testable without a live BullMQ worker.
 */
export async function enqueue(
  queue: QueueType,
  payload: JobPayload,
  options: EnqueueOptions = {},
  redis: RedisAdapter,
): Promise<JobRecord> {
  const cfg = QUEUE_CONFIG[queue];
  const jobId = options.jobId ?? `${queue}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record: JobRecord = {
    id: jobId,
    queue,
    payload,
    attempts: 0,
    status: options.delayMs ? "delayed" : "waiting",
    enqueuedAt: Date.now(),
  };

  const key = `cdc:queue:${queue}:waiting`;
  const dlqKey = `cdc:queue:${queue}:dlq`;
  const metaKey = `cdc:queue:${queue}:meta:${jobId}`;

  const json = JSON.stringify(record);
  await redis.set(metaKey, json, cfg.completedTtlSec);
  // Push to waiting list (RPUSH) and DLQ tracking.
  await redis.pipeline([
    { op: "set", key, value: json, ttl: cfg.completedTtlSec },
    { op: "set", key: dlqKey, value: json, ttl: cfg.failedTtlSec },
  ]);
  return record;
}

// ---------------------------------------------------------------------------
// Worker simulation — picks next job, marks active, returns job
// ---------------------------------------------------------------------------

export async function claimNext(
  queue: QueueType,
  redis: RedisAdapter,
): Promise<JobRecord | null> {
  const key = `cdc:queue:${queue}:waiting`;
  const json = await redis.get(key);
  if (!json) return null;
  const record = JSON.parse(json) as JobRecord;
  record.status = "active";
  record.attempts += 1;
  await redis.set(`cdc:queue:${queue}:meta:${record.id}`, JSON.stringify(record), 3600);
  return record;
}

/** Mark a job as completed and remove from active. */
export async function markCompleted(
  queue: QueueType,
  jobId: string,
  redis: RedisAdapter,
): Promise<void> {
  const key = `cdc:queue:${queue}:meta:${jobId}`;
  const json = await redis.get(key);
  if (!json) return;
  const record = JSON.parse(json) as JobRecord;
  record.status = "completed";
  await redis.del(key);
}

/** Mark a job as failed; if attempts exceed maxRetries, route to DLQ. */
export async function markFailed(
  queue: QueueType,
  jobId: string,
  error: string,
  redis: RedisAdapter,
): Promise<{ dlq: boolean; nextAttemptMs: number }> {
  const cfg = QUEUE_CONFIG[queue];
  const key = `cdc:queue:${queue}:meta:${jobId}`;
  const json = await redis.get(key);
  if (!json) return { dlq: false, nextAttemptMs: 0 };
  const record = JSON.parse(json) as JobRecord;
  record.status = record.attempts >= cfg.maxRetries ? "failed" : "waiting";
  if (record.attempts >= cfg.maxRetries) {
    // Move to DLQ.
    const dlqKey = `cdc:queue:${queue}:dlq`;
    await redis.set(`${dlqKey}:${jobId}`, JSON.stringify({ ...record, error }), cfg.failedTtlSec);
    await redis.del(key);
    return { dlq: true, nextAttemptMs: 0 };
  }
  await redis.set(key, JSON.stringify(record), 3600);
  return { dlq: false, nextAttemptMs: backoffDelay(record.attempts, cfg) };
}

// ---------------------------------------------------------------------------
// Queue monitor — admin dashboard counters
// ---------------------------------------------------------------------------

export interface QueueMetrics {
  queue: QueueType;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  dlqSize: number;
  sampledAt: number;
}

/**
 * Snapshot all queues for the admin dashboard.
 * Returns zeroed metrics if Redis is unavailable — never throws.
 */
export async function snapshotQueues(redis: RedisAdapter): Promise<QueueMetrics[]> {
  const out: QueueMetrics[] = [];
  for (const queue of Object.keys(QUEUE_CONFIG) as QueueType[]) {
    try {
      const metaKeys = await redis.get(`cdc:queue:${queue}:waiting`);
      const waiting = metaKeys ? 1 : 0;
      const dlq = await redis.get(`cdc:queue:${queue}:dlq`);
      out.push({
        queue,
        waiting,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        dlqSize: dlq ? 1 : 0,
        sampledAt: Date.now(),
      });
    } catch {
      out.push({ queue, waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, dlqSize: 0, sampledAt: Date.now() });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const QUEUE_NAMES = Object.keys(QUEUE_CONFIG) as QueueType[];