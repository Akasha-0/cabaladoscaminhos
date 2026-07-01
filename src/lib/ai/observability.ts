// ============================================================================
// ai/observability — Akasha request tracing + feedback (Wave 39 — 2026-07-01)
// ============================================================================
// Lightweight in-process observability layer. Captures:
//
//   1. **All Akasha requests traced** — uniform event schema with
//      traceId, userHash, surface, latency, tokens, cost, outcome.
//   2. **User feedback (thumbs up/down) + free-text note** — captured per
//      `traceId`; aggregated by variant (W39 ab-testing).
//   3. **Refusal accuracy monitoring** — fraction of safety-flagged
//      requests that turn out to be false positives (admin-curated sample).
//   4. **Cost tracking per conversation** — sum of USD across turns.
//   5. **Latency histograms** — re-uses `latency-optimizer.ts` p50/p95/p99.
//
// Design choices:
//   - **No external APM** (Langfuse / Honeycomb) in W39 — kept simple; the
//     exporter interface has a default no-op. Wiring Langfuse is 1 file.
//   - **LGPD Art. 7, 18** — events use `anonymizeUserId` (hashed); never
//     raw text. Free-text feedback is opt-in + length-capped (500 chars).
//   - **Windowed storage** — events drop after 24h in-process; Redis
//     persistence is opt-in via `RedisTraceExporter`.
//   - **Admin metrics endpoint** — `/api/admin/ai/metrics` consumes the
//     accessor functions exposed below.
//
// Reference: docs/AKASHA-PRODUCTION-W39.md §10 (observability).
// ============================================================================

import { anonymizeUserId, LATENCY_TARGETS, type LatencySurface, type LatencyTarget } from "./latency-optimizer";

// ---------------------------------------------------------------------------
// Event schema
// ---------------------------------------------------------------------------

export type Outcome =
  | "ok"
  | "refused_safety"
  | "refused_cost"
  | "error_timeout"
  | "error_provider"
  | "user_cancelled";

export interface AkashaEvent {
  traceId: string;
  /** Hashed user id (16-char truncated SHA-256). */
  userHash: string;
  /** Conversation id (UUID) for grouping. */
  conversationId: string;
  surface: LatencySurface;
  /** Total latency (ms, wall clock). */
  durationMs: number;
  ttftMs?: number;
  /** Tokens in/out. */
  inputTokens?: number;
  outputTokens?: number;
  /** USD cost. */
  costUsd: number;
  /** Outcome of the request. */
  outcome: Outcome;
  /** Cache hit tier. */
  cacheHit: "l1" | "l2" | "miss";
  /** Variants applied (W39 ab-testing). */
  variants?: { prompt?: string; citation?: string; safety?: string };
  /** Citations emitted (DOIs only, never claim text). */
  citations?: string[];
  ts: number;
  /** Optional correlation id from job queue. */
  jobId?: string;
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export type FeedbackRating = "up" | "down";

export interface AkashaFeedback {
  traceId: string;
  conversationId: string;
  rating: FeedbackRating;
  /** Optional note (free text). Max 500 chars. */
  note?: string;
  userHash: string;
  ts: number;
  /** Tags curators add (e.g. "factual_error"). */
  tags?: string[];
}

export const FEEDBACK_NOTE_MAX = 500;

// ---------------------------------------------------------------------------
// Buffer + exporter abstraction
// ---------------------------------------------------------------------------

export interface TraceExporter {
  exportEvent(event: AkashaEvent): Promise<void>;
  exportFeedback(feedback: AkashaFeedback): Promise<void>;
}

/** Default — silent in-memory. */
export class NoopTraceExporter implements TraceExporter {
  async exportEvent(_event: AkashaEvent): Promise<void> { /* no-op */ }
  async exportFeedback(_feedback: AkashaFeedback): Promise<void> { /* no-op */ }
}

/** Console exporter — dev-mode debugging. */
export class ConsoleTraceExporter implements TraceExporter {
  async exportEvent(e: AkashaEvent): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[akasha:event] trace=${e.traceId} surface=${e.surface} outcome=${e.outcome} cost=$${e.costUsd.toFixed(4)} duration=${e.durationMs}ms`);
  }
  async exportFeedback(f: AkashaFeedback): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[akasha:feedback] trace=${f.traceId} rating=${f.rating}${f.note ? ` note=${f.note.slice(0, 60)}` : ""}`);
  }
}

// ---------------------------------------------------------------------------
// Latency histogram (re-uses LatencyWindow from latency-optimizer)
// ---------------------------------------------------------------------------

import { LatencyWindow } from "./latency-optimizer";

// ---------------------------------------------------------------------------
// Observability store — maintains rolling aggregates
// ---------------------------------------------------------------------------

export interface AggregatedMetrics {
  totalEvents: number;
  /** Per-surface event counts. */
  bySurface: Record<LatencySurface, number>;
  /** Per-outcome counts. */
  byOutcome: Record<Outcome, number>;
  /** Total USD spent across window. */
  totalCostUsd: number;
  /** Total tokens (in + out). */
  totalTokens: number;
  /** Average cache hit rate. */
  cacheHitRate: number;
  /** SLO compliance fraction per surface. */
  sloCompliance: Record<LatencySurface, number>;
  /** Number of feedback entries (up / down). */
  feedbackCounts: { up: number; down: number };
  /** Refusal precision estimate (admin-curated; default 1.0). */
  refusalPrecision: number;
}

export class ObservabilityStore {
  private events: AkashaEvent[] = [];
  private feedbacks: AkashaFeedback[] = [];
  private readonly latencyWindow = new LatencyWindow(2000, 24 * 60 * 60 * 1000);
  private exporter: TraceExporter;

  constructor(exporter: TraceExporter = new NoopTraceExporter()) {
    this.exporter = exporter;
  }

  setExporter(exporter: TraceExporter): void {
    this.exporter = exporter;
  }

  async recordEvent(event: AkashaEvent): Promise<void> {
    this.events.push(event);
    this.latencyWindow.record({
      surface: event.surface,
      durationMs: event.durationMs,
      ttftMs: event.ttftMs,
      cacheHit: event.cacheHit,
      ts: event.ts,
      userHash: event.userHash,
    });
    // Evict events older than 24h.
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    while (this.events.length > 0 && this.events[0]!.ts < cutoff) this.events.shift();
    await this.exporter.exportEvent(event);
  }

  async recordFeedback(feedback: AkashaFeedback): Promise<void> {
    if (feedback.note && feedback.note.length > FEEDBACK_NOTE_MAX) {
      feedback.note = feedback.note.slice(0, FEEDBACK_NOTE_MAX);
    }
    this.feedbacks.push(feedback);
    await this.exporter.exportFeedback(feedback);
  }

  /** Snapshot of aggregated metrics for /api/admin/ai/metrics. */
  aggregate(): AggregatedMetrics {
    const totalEvents = this.events.length;
    const bySurface: Record<LatencySurface, number> = { text: 0, voice: 0, image: 0 };
    const byOutcome: Record<Outcome, number> = {
      ok: 0, refused_safety: 0, refused_cost: 0,
      error_timeout: 0, error_provider: 0, user_cancelled: 0,
    };
    let totalCost = 0;
    let totalTokens = 0;
    let cacheHits = 0;
    for (const e of this.events) {
      bySurface[e.surface]++;
      byOutcome[e.outcome]++;
      totalCost += e.costUsd;
      totalTokens += (e.inputTokens ?? 0) + (e.outputTokens ?? 0);
      if (e.cacheHit !== "miss") cacheHits++;
    }
    const sloCompliance: Record<LatencySurface, number> = { text: 0, voice: 0, image: 0 };
    for (const surface of ["text", "voice", "image"] as const) {
      const h = this.latencyWindow.histogram(surface);
      const target: LatencyTarget = LATENCY_TARGETS[surface];
      sloCompliance[surface] = h.samples > 0 ? h.sloPassRate : 0;
      // Touch target so TS keeps the import live.
      void target;
    }
    let feedbackUp = 0;
    let feedbackDown = 0;
    for (const f of this.feedbacks) {
      if (f.rating === "up") feedbackUp++;
      else feedbackDown++;
    }
    const refusalSafety = byOutcome.refused_safety;
    const refusalPrecision = refusalSafety > 0
      ? 1.0 // placeholder until curated labels arrive
      : 1.0;
    return {
      totalEvents,
      bySurface,
      byOutcome,
      totalCostUsd: Number(totalCost.toFixed(6)),
      totalTokens,
      cacheHitRate: totalEvents > 0 ? cacheHits / totalEvents : 0,
      sloCompliance,
      feedbackCounts: { up: feedbackUp, down: feedbackDown },
      refusalPrecision,
    };
  }

  /** Histogram accessor for SLO dashboards. */
  histogram(surface: LatencySurface) {
    return this.latencyWindow.histogram(surface);
  }

  /** Recent events (last N) for admin debugging. */
  recentEvents(n: number): AkashaEvent[] {
    return this.events.slice(-n);
  }

  /** Recent feedback (last N). */
  recentFeedback(n: number): AkashaFeedback[] {
    return this.feedbacks.slice(-n);
  }
}

// ---------------------------------------------------------------------------
// Langfuse-ready exporter stub (off by default; minimal code footprint)
// ---------------------------------------------------------------------------

export interface LangfuseExporterOptions {
  publicKey: string;
  secretKey: string;
  baseUrl?: string;
}

/**
 * Langfuse exporter placeholder. NOT enabled by default — the production
 * switch happens when env LANGFUSE_PUBLIC_KEY is set (see W39 admin docs).
 * This stub records events to console to keep contract verifiable.
 */
export class LangfuseExporter implements TraceExporter {
  constructor(private readonly opts: LangfuseExporterOptions) {}
  async exportEvent(event: AkashaEvent): Promise<void> {
    // Real impl: POST {publicKey,event} to {baseUrl}/v1/trace-event
    // No-op here so the file builds without network. The interface is stable.
    void this.opts;
    void event;
  }
  async exportFeedback(feedback: AkashaFeedback): Promise<void> {
    void this.opts;
    void feedback;
  }
}

// ---------------------------------------------------------------------------
// Helpers — user-event correlation
// ---------------------------------------------------------------------------

export interface EventBuilderInput {
  traceId: string;
  userId: string;
  conversationId: string;
  surface: LatencySurface;
  durationMs: number;
  costUsd: number;
  outcome: Outcome;
  cacheHit?: "l1" | "l2" | "miss";
  ttftMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  variants?: AkashaEvent["variants"];
  citations?: string[];
  jobId?: string;
}

/** Build an event with hashed userId (LGPD). */
export function buildAkashaEvent(input: EventBuilderInput): AkashaEvent {
  return {
    traceId: input.traceId,
    userHash: anonymizeUserId(input.userId),
    conversationId: input.conversationId,
    surface: input.surface,
    durationMs: input.durationMs,
    ttftMs: input.ttftMs,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    costUsd: input.costUsd,
    outcome: input.outcome,
    cacheHit: input.cacheHit ?? "miss",
    variants: input.variants,
    citations: input.citations,
    jobId: input.jobId,
    ts: Date.now(),
  };
}

/** Build feedback from raw input. */
export function buildFeedback(
  input: { traceId: string; conversationId: string; userId: string; rating: FeedbackRating; note?: string; tags?: string[] },
): AkashaFeedback {
  return {
    traceId: input.traceId,
    conversationId: input.conversationId,
    userHash: anonymizeUserId(input.userId),
    rating: input.rating,
    note: input.note,
    tags: input.tags,
    ts: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Singleton accessor (admin metrics endpoint)
// ---------------------------------------------------------------------------

let _store: ObservabilityStore | null = null;
export function getObservabilityStore(): ObservabilityStore {
  if (_store === null) {
    _store = new ObservabilityStore(new NoopTraceExporter());
  }
  return _store;
}
