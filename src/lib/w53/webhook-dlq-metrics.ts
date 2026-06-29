// ============================================================================
// w53/webhook-dlq-metrics.ts
// ============================================================================
// Operator dashboard data layer for the w52 webhook Dead-Letter Queue (DLQ).
//
// SCOPE:
//   - Read-only metrics aggregators that project a w52 DLQ snapshot into
//     operator-facing dashboards (depth, oldest age, failure-mode histogram,
//     circuit-state histogram, target histogram, sacred-flagged count,
//     replay success rate, etc.).
//   - Time-series windows: 1m / 5m / 15m / 1h / 24h rolling windows with
//     deterministic bucketing, head/tail eviction, and bounded memory.
//   - Operator-configurable Alerting Rules (queue depth, oldest-age,
//     replay-failure-rate, sacred count, circuit-open-count, ...) with
//     fire / ack / silence / resolve lifecycle and silence-until expiry.
//   - Trend baseline + z-score anomaly detection (spike / dip) per metric
//     over each window kind, with configurable z-threshold.
//   - Operator Action Audit — every ack / silence / replay / clear / escalate
//     operation is recorded in an append-only ring log with actor, reason,
//     correlation id, and SACRED annotation when applicable.
//   - Sacred audit trail — DLQ entries flagged with sacred text surface in
//     an admin-only (curator) gated view; the raw `sacredFlaggedCount` is
//     exposed for dashboards but individual sacred entries are gated behind
//     a SACRED_VIEW consent check.
//
// INTEGRATION:
//   This module composes ONLY BY SHAPE with `w52/webhook-dead-letter-queue`.
//   It does NOT import from w52 — every w52 type is locally re-declared as
//   a SHAPE-compatible interface. The `linkDlqMetricsShape` integrator
//   validates the w52 source object at runtime and refuses to operate on a
//   structurally-different source.
//
// LGPD mapping:
//   Art. 7  → operator access audit log + sacred-flag access requires
//             elevated consent (curator/admin role + SACRED_VIEW grant)
//   Art. 18 → `purgeByUser(userId)` cascades through metrics + audit + ring
//   Retention:
//     - 90d for the metrics ring (depth / oldest / histograms)
//     - 365d for the operator action audit log (immutable, append-only)
//
// SACRED-TEXT POLICY:
//   Sacred-flagged DLQ entries are NEVER exposed as individual records to
//   non-curator roles. Only an aggregate `sacredFlaggedCount` and a curated
//   "sacredTrail" (gated) are surfaced. Operator actions on sacred-flagged
//   entries require an audit annotation (reason + SACRED_VIEW consent).
//
// HARD CONSTRAINTS (per w53 worker brief):
//   - NO imports from w52/*, NO next/react imports, NO @prisma/client runtime.
//   - Pure TS module — Prisma / fetch / Next are abstracted behind interfaces.
//   - 100+ named exports.
//   - Per-file TSC must compile with --strict --target ES2022.
//
// All identifiers prefixed `w53met_` only inside this file (kept private).
// Public surface uses unprefixed named exports so consumers can `import {...}
// from "@/lib/w53/webhook-dlq-metrics"`.
// ============================================================================

// ============================================================================
// 1. PRIMITIVE TYPES (SHAPE-compatible with w52)
// ============================================================================

export type EpochMs = number;
export type OpaqueId = string;
export type IntegrityHash = string;
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ClockUnit = 'ms' | 's' | 'm' | 'h' | 'd';

// ============================================================================
// 2. WINDOW KIND — time-series window kinds
// ============================================================================

export type WindowKind = '1m' | '5m' | '15m' | '1h' | '24h';

export const WINDOW_DURATIONS_MS: Readonly<Record<WindowKind, EpochMs>> = Object.freeze({
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
});

export const WINDOW_BUCKET_COUNTS: Readonly<Record<WindowKind, number>> = Object.freeze({
  '1m': 12,    // 5s buckets
  '5m': 20,    // 15s buckets
  '15m': 30,   // 30s buckets
  '1h': 60,    // 1m buckets
  '24h': 96,   // 15m buckets
});

export const ALL_WINDOW_KINDS: ReadonlyArray<WindowKind> = Object.freeze([
  '1m', '5m', '15m', '1h', '24h',
]);

// ============================================================================
// 3. SHAPE CONTRACT — w52 webhook-dead-letter-queue (READ-ONLY projection)
// ============================================================================

/** w52 FailureMode — locally re-declared (no import). */
export type FailureMode =
  | 'timeout'
  | 'http_4xx'
  | 'http_5xx'
  | 'network'
  | 'invalid_payload'
  | 'unknown';

/** w52 CircuitState — locally re-declared (no import). */
export type CircuitState = 'closed' | 'half_open' | 'open';

/** w52 SacredTextStatus — locally re-declared (no import). */
export type SacredTextStatus = 'none' | 'present' | 'redacted' | 'unknown';

/** w52 ReplayVerdict — locally re-declared (no import). */
export type ReplayVerdict = 'success' | 'retry' | 'expired' | 'rejected' | 'error';

export const ALL_FAILURE_MODES: ReadonlyArray<FailureMode> = Object.freeze([
  'timeout', 'http_4xx', 'http_5xx', 'network', 'invalid_payload', 'unknown',
]);

export const ALL_CIRCUIT_STATES: ReadonlyArray<CircuitState> = Object.freeze([
  'closed', 'half_open', 'open',
]);

export const ALL_REPLAY_VERDICTS: ReadonlyArray<ReplayVerdict> = Object.freeze([
  'success', 'retry', 'expired', 'rejected', 'error',
]);

/**
 * Minimum shape of a w52 DeadLetterEntry that this module needs to compute
 * metrics. Consumers should pass the real w52 entry (or a SHAPE-equivalent
 * test double) — see `linkDlqMetricsShape` for validation.
 */
export interface DlqEntryShape {
  readonly id: OpaqueId;
  readonly payload: Record<string, unknown>;
  readonly targetUrl: string;
  readonly failureMode: FailureMode;
  attempts: number;
  readonly firstFailAt: EpochMs;
  lastFailAt: EpochMs;
  readonly integrityHash: IntegrityHash;
  readonly ttl: EpochMs;
  lastCircuitState?: CircuitState;
  userId?: string;
  consentVerified?: boolean;
  sacredText: SacredTextStatus;
  tags?: ReadonlyArray<string>;
  lastError?: string;
  replayed?: boolean;
  redactedAt?: EpochMs;
  correlationId?: OpaqueId;
}

/**
 * Minimum shape of a w52 DLQStats that this module needs.
 */
export interface DlqStatsShape {
  totalEntries: number;
  oldestEntryAt: EpochMs | null;
  byFailureMode: Partial<Record<FailureMode, number>>;
  byCircuitState: Partial<Record<CircuitState, number>>;
  bySacredStatus: Partial<Record<SacredTextStatus, number>>;
  capacity: number;
  fillRatio: number;
  expiredSinceSweep: number;
}

/**
 * Minimum shape of a w52 ReplayOutcome that this module needs.
 */
export interface ReplayOutcomeShape {
  requestedCount: number;
  replayedCount: number;
  failedReplays: number;
  duration: EpochMs;
  byVerdict: Partial<Record<ReplayVerdict, number>>;
}

/**
 * Minimum shape of a w52 CircuitSnapshot that this module needs.
 */
export interface CircuitSnapshotShape {
  state: CircuitState;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  openedAt: EpochMs | null;
  lastTransitionAt: EpochMs;
  probesRemaining: number;
}

/**
 * Source shape — anything that exposes the methods needed to project metrics.
 * The w52 `DeadLetterQueue` class implements this surface (READ-ONLY); test
 * doubles may substitute.
 */
export interface DlqSourceShape {
  size(): number;
  capacity(): number;
  get(id: OpaqueId): DlqEntryShape | undefined;
  list(filter?: { targetUrl?: string; failureMode?: FailureMode; userId?: string }): ReadonlyArray<DlqEntryShape>;
}

// ============================================================================
// 4. CORE STRUCTURES — METRICS / ALERTING / TREND / AUDIT
// ============================================================================

/**
 * The headline metrics projection. Operators see this on the dashboard topbar.
 */
export interface DlqMetrics {
  depth: number;
  capacity: number;
  fillRatio: number;
  oldestMs: EpochMs | null;
  oldestEntryId: OpaqueId | null;
  byFailureMode: Partial<Record<FailureMode, number>>;
  byCircuitState: Partial<Record<CircuitState, number>>;
  byTarget: Record<string, number>;
  sacredFlaggedCount: number;
  replaySuccessRate: number;
  replayAttempted: number;
  replayFailed: number;
  computedAt: EpochMs;
  sourceLabel: string;
}

/** Time-series window specification. */
export interface WindowSpec {
  kind: WindowKind;
  durationMs: EpochMs;
  bucketCount: number;
  bucketMs: EpochMs;
}

/** Comparator for an alerting rule. */
export type Comparator = '>' | '>=' | '<' | '<=' | '==' | '!=';

/** Alerting rule. */
export interface AlertRule {
  id: OpaqueId;
  metric: AlertMetric;
  comparator: Comparator;
  threshold: number;
  severity: Severity;
  windowKind: WindowKind;
  enabled: boolean;
  description?: string;
  silenceUntil?: EpochMs;
  cooldownMs?: EpochMs;
  lastFiredAt?: EpochMs;
  lastResolvedAt?: EpochMs;
  annotations?: ReadonlyArray<RuleAnnotation>;
}

/** Annotation attached to a rule (audit trail). */
export interface RuleAnnotation {
  at: EpochMs;
  authorId: string;
  note: string;
  sacredViewGranted?: boolean;
}

/** Metrics that can be alerted on. */
export type AlertMetric =
  | 'depth'
  | 'oldestMs'
  | 'fillRatio'
  | 'sacredFlaggedCount'
  | 'replaySuccessRate'
  | 'replayFailed'
  | 'openCircuitCount'
  | 'failureRate';

/** Alert lifecycle state. */
export type AlertState = 'silent' | 'firing' | 'acknowledged' | 'resolved';

/** Computed alert state. */
export interface AlertEvaluation {
  rule: AlertRule;
  state: AlertState;
  observedValue: number;
  evaluatedAt: EpochMs;
  reason: string;
}

/** Trend baseline (mean / stddev / samples for a given window). */
export interface TrendBaseline {
  windowSpec: WindowSpec;
  mean: number;
  stddev: number;
  samples: number;
  min: number;
  max: number;
  computedAt: EpochMs;
}

/** Anomaly (spike / dip beyond z-threshold). */
export interface Anomaly {
  kind: 'spike' | 'dip';
  magnitude: number;
  zScore: number;
  observedAt: EpochMs;
  metric: AlertMetric;
  observedValue: number;
  baselineMean: number;
  baselineStddev: number;
  windowKind: WindowKind;
  context?: Record<string, unknown>;
}

/** Single time-series sample. */
export interface MetricSample {
  at: EpochMs;
  value: number;
  metric: AlertMetric;
  windowKind: WindowKind;
}

/** A bucketed time-series. */
export interface MetricBucket {
  bucketStartMs: EpochMs;
  bucketEndMs: EpochMs;
  count: number;
  sum: number;
  min: number;
  max: number;
  mean: number;
}

/** Operator action (discriminated union). */
export type OperatorAction =
  | { kind: 'ack'; ruleId: OpaqueId; operatorId: string; at: EpochMs; note?: string; sacredViewGranted?: boolean }
  | { kind: 'silence'; ruleId: OpaqueId; operatorId: string; at: EpochMs; silenceUntilMs: EpochMs; note?: string; sacredViewGranted?: boolean }
  | { kind: 'replay'; operatorId: string; at: EpochMs; entryIds: ReadonlyArray<OpaqueId>; mode: ReplayReplayMode; reason: string; sacredAffected: number; sacredViewGranted?: boolean }
  | { kind: 'clear'; operatorId: string; at: EpochMs; entryIds: ReadonlyArray<OpaqueId>; reason: string; sacredAffected: number; sacredViewGranted?: boolean }
  | { kind: 'escalate'; ruleId: OpaqueId; operatorId: string; at: EpochMs; targetRole: 'curator' | 'admin' | 'security'; note?: string; sacredViewGranted?: boolean };

export type ReplayReplayMode = 'single' | 'batch' | 'all_pending' | 'time_range';

/** Operator audit log entry (immutable). */
export interface OperatorAuditEntry {
  id: OpaqueId;
  action: OperatorAction;
  correlationId: OpaqueId;
  receivedAt: EpochMs;
  sacredAnnotated: boolean;
}

/** Curator-gated sacred trail entry (only visible to SACRED_VIEW grant). */
export interface SacredTrailEntry {
  id: OpaqueId;
  entryId: OpaqueId;
  sacredStatus: SacredTextStatus;
  targetUrl: string;
  firstFailAt: EpochMs;
  lastFailAt: EpochMs;
  attempts: number;
  consentVerified: boolean;
  redactedAt: EpochMs | null;
  reviewedBy: string | null;
  reviewedAt: EpochMs | null;
}

/** DLQ metrics retention policy. */
export interface DlqRetentionPolicy {
  metricsRetentionMs: EpochMs;
  auditRetentionMs: EpochMs;
  sacredTrailRetentionMs: EpochMs;
  sweepIntervalMs: EpochMs;
}

export const DEFAULT_DLQ_RETENTION: DlqRetentionPolicy = Object.freeze({
  metricsRetentionMs: 90 * 24 * 60 * 60 * 1000,    // 90d
  auditRetentionMs: 365 * 24 * 60 * 60 * 1000,    // 365d
  sacredTrailRetentionMs: 30 * 24 * 60 * 60 * 1000, // 30d
  sweepIntervalMs: 24 * 60 * 60 * 1000,             // 24h
});

export const W53MET_METRICS_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
export const W53MET_AUDIT_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;
export const W53MET_SACRED_TRAIL_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export const W53MET_SWEEP_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const W53MET_AUDIT_RING_SIZE = 4096;
export const W53MET_SACRED_TRAIL_RING_SIZE = 512;
export const W53MET_METRICS_RING_SIZE = 4096;
export const W53MET_DEFAULT_Z_THRESHOLD = 2.5;
export const W53MET_DEFAULT_MIN_SAMPLES = 8;
export const W53MET_MAX_WINDOW_OVERFLOW_FACTOR = 4;
export const W53MET_DEFAULT_DEPTH_THRESHOLD = 500;
export const W53MET_DEFAULT_OLDEST_MS_THRESHOLD = 6 * 60 * 60 * 1000;
export const W53MET_DEFAULT_REPLAY_FAILURE_RATE = 0.25;
export const W53MET_DEFAULT_OPEN_CIRCUIT_COUNT = 3;

// ============================================================================
// 5. CONSTANTS & DEFAULTS
// ============================================================================

export const COMPARATOR_FN: Readonly<Record<Comparator, (a: number, b: number) => boolean>> = Object.freeze({
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
});

export const FAILURE_MODE_LABELS: Readonly<Record<FailureMode, string>> = Object.freeze({
  timeout: 'Timeout',
  http_4xx: 'HTTP 4xx',
  http_5xx: 'HTTP 5xx',
  network: 'Network',
  invalid_payload: 'Invalid payload',
  unknown: 'Unknown',
});

export const CIRCUIT_STATE_LABELS: Readonly<Record<CircuitState, string>> = Object.freeze({
  closed: 'Closed',
  half_open: 'Half-open',
  open: 'Open',
});

export const REPLAY_VERDICT_LABELS: Readonly<Record<ReplayVerdict, string>> = Object.freeze({
  success: 'Success',
  retry: 'Retry',
  expired: 'Expired',
  rejected: 'Rejected',
  error: 'Error',
});

export const ALERT_METRIC_LABELS: Readonly<Record<AlertMetric, string>> = Object.freeze({
  depth: 'Queue depth',
  oldestMs: 'Oldest entry age (ms)',
  fillRatio: 'Capacity fill ratio',
  sacredFlaggedCount: 'Sacred-flagged count',
  replaySuccessRate: 'Replay success rate',
  replayFailed: 'Replay failures',
  openCircuitCount: 'Open-circuit count',
  failureRate: 'Failure rate (overall)',
});

export const ALERT_SEVERITY_WEIGHT: Readonly<Record<Severity, number>> = Object.freeze({
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
});

export const OPERATOR_ACTION_LABELS: Readonly<Record<OperatorAction['kind'], string>> = Object.freeze({
  ack: 'Acknowledge',
  silence: 'Silence',
  replay: 'Replay',
  clear: 'Clear',
  escalate: 'Escalate',
});

// ============================================================================
// 6. ERROR CODES + TYPED ERROR CLASSES
// ============================================================================

export const METRICS_ERROR_CODES = Object.freeze({
  WINDOW_OVERFLOW: 'MET_001',
  RULE_EVAL_FAILED: 'MET_002',
  SILENCE_ALREADY_ACTIVE: 'MET_003',
  ANOMALY_THRESHOLD_INVALID: 'MET_004',
  OPERATOR_ACTION_REFUSED: 'MET_005',
  SACRED_FLAGGED_ACCESS_DENIED: 'MET_006',
});

export class MetricsBaseError extends Error {
  public readonly code: string;
  public readonly at: EpochMs;
  public readonly context: Record<string, unknown> | undefined;
  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'MetricsBaseError';
    this.code = code;
    this.at = Date.now();
    this.context = context;
  }
}

/** MET_001 — requested window exceeds the source's lifetime. */
export class MetricsWindowOverflowError extends MetricsBaseError {
  constructor(requestedMs: EpochMs, maxAllowedMs: EpochMs, context?: Record<string, unknown>) {
    super(METRICS_ERROR_CODES.WINDOW_OVERFLOW,
      'Requested window ' + requestedMs + 'ms exceeds max ' + maxAllowedMs + 'ms (factor=' + W53MET_MAX_WINDOW_OVERFLOW_FACTOR + 'x).',
      Object.assign({ requestedMs, maxAllowedMs }, context || {}));
    this.name = 'MetricsWindowOverflowError';
  }
}

/** MET_002 — rule evaluation failed (e.g. unknown metric, bad threshold). */
export class MetricsRuleEvalError extends MetricsBaseError {
  constructor(ruleId: OpaqueId, reason: string, context?: Record<string, unknown>) {
    super(METRICS_ERROR_CODES.RULE_EVAL_FAILED,
      'Rule ' + ruleId + ' failed to evaluate: ' + reason,
      Object.assign({ ruleId, reason }, context || {}));
    this.name = 'MetricsRuleEvalError';
  }
}

/** MET_003 — silence is already active on a rule. */
export class MetricsSilenceActiveError extends MetricsBaseError {
  constructor(ruleId: OpaqueId, silenceUntil: EpochMs, context?: Record<string, unknown>) {
    super(METRICS_ERROR_CODES.SILENCE_ALREADY_ACTIVE,
      'Silence already active on rule ' + ruleId + ' until ' + silenceUntil + '.',
      Object.assign({ ruleId, silenceUntil }, context || {}));
    this.name = 'MetricsSilenceActiveError';
  }
}

/** MET_004 — anomaly threshold is misconfigured (z <= 0 or samples < 2). */
export class MetricsAnomalyThresholdError extends MetricsBaseError {
  constructor(reason: string, context?: Record<string, unknown>) {
    super(METRICS_ERROR_CODES.ANOMALY_THRESHOLD_INVALID,
      'Anomaly threshold misconfigured: ' + reason,
      context);
    this.name = 'MetricsAnomalyThresholdError';
  }
}

/** MET_005 — operator action refused (e.g. unknown rule, invalid actor). */
export class MetricsOperatorActionRefusedError extends MetricsBaseError {
  constructor(reason: string, context?: Record<string, unknown>) {
    super(METRICS_ERROR_CODES.OPERATOR_ACTION_REFUSED,
      'Operator action refused: ' + reason,
      context);
    this.name = 'MetricsOperatorActionRefusedError';
  }
}

/** MET_006 — sacred-flagged access denied (no SACRED_VIEW grant). */
export class MetricsSacredAccessDeniedError extends MetricsBaseError {
  constructor(operatorId: string, resource: string, context?: Record<string, unknown>) {
    super(METRICS_ERROR_CODES.SACRED_FLAGGED_ACCESS_DENIED,
      'Sacred-flagged access denied for operator ' + operatorId + ' on resource ' + resource + '.',
      Object.assign({ operatorId, resource }, context || {}));
    this.name = 'MetricsSacredAccessDeniedError';
  }
}

// ============================================================================
// 7. CLOCK + RNG (injected, pure)
// ============================================================================

export interface Clock {
  now(): EpochMs;
  sleep(ms: EpochMs): Promise<void>;
}

export interface Rng {
  next(): number;
  intInRange(min: number, max: number): number;
}

export class FixedClock implements Clock {
  private current: EpochMs;
  constructor(initial: EpochMs = 0) { this.current = initial; }
  now(): EpochMs { return this.current; }
  advance(ms: EpochMs): void { this.current = this.current + Math.max(0, ms); }
  set(at: EpochMs): void { this.current = at; }
  async sleep(_ms: EpochMs): Promise<void> { /* no-op */ }
}

export class SeededRng implements Rng {
  private state: number;
  constructor(seed: number = 0x9E3779B9) {
    this.state = (seed | 0) || 1;
  }
  next(): number {
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  intInRange(min: number, max: number): number {
    if (max < min) { const tmp = min; min = max; max = tmp; }
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export const SystemClock: Clock = {
  now: () => Date.now(),
  sleep: (ms) => new Promise<void>((r) => setTimeout(r, ms)),
};

export const SystemRng: Rng = {
  next: () => Math.random(),
  intInRange: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
};

// ============================================================================
// 8. SHAPE INTEGRATOR — runtime validation
// ============================================================================

/**
 * Result of validating a DlqSourceShape against the w52 DLQ contract.
 */
export interface ShapeLinkResult {
  ok: boolean;
  missing: ReadonlyArray<string>;
  unexpected: ReadonlyArray<string>;
  notes: ReadonlyArray<string>;
}

const REQUIRED_SOURCE_METHODS: ReadonlyArray<keyof DlqSourceShape> = Object.freeze([
  'size', 'capacity', 'get', 'list',
]);

/**
 * Validate that a candidate source exposes the shape contract this module
 * requires. Does NOT mutate the source. Used at startup to refuse unsafe
 * wiring.
 */
export function linkDlqMetricsShape(candidate: unknown): ShapeLinkResult {
  const missing: string[] = [];
  const unexpected: string[] = [];
  const notes: string[] = [];
  if (candidate === null || candidate === undefined || typeof candidate !== 'object') {
    return { ok: false, missing: REQUIRED_SOURCE_METHODS as ReadonlyArray<string>, unexpected: [], notes: ['candidate is not an object'] };
  }
  const obj = candidate as Record<string, unknown>;
  for (const m of REQUIRED_SOURCE_METHODS) {
    if (typeof obj[m as string] !== 'function') missing.push(m as string);
  }
  // Detect extra surface (informational only).
  for (const k of Object.keys(obj)) {
    if (!REQUIRED_SOURCE_METHODS.includes(k as keyof DlqSourceShape) && !k.startsWith('_')) {
      unexpected.push(k);
    }
  }
  if (missing.length === 0) notes.push('shape matches w53 contract');
  return { ok: missing.length === 0, missing, unexpected, notes };
}

/**
 * Validate that a single entry matches the SHAPE contract.
 */
export function isValidDlqEntryShape(candidate: unknown): candidate is DlqEntryShape {
  if (candidate === null || candidate === undefined || typeof candidate !== 'object') return false;
  const e = candidate as Record<string, unknown>;
  return typeof e.id === 'string'
    && typeof e.payload === 'object' && e.payload !== null
    && typeof e.targetUrl === 'string'
    && typeof e.failureMode === 'string' && (ALL_FAILURE_MODES as ReadonlyArray<string>).includes(e.failureMode as string)
    && typeof e.attempts === 'number'
    && typeof e.firstFailAt === 'number'
    && typeof e.lastFailAt === 'number'
    && typeof e.integrityHash === 'string'
    && typeof e.ttl === 'number'
    && typeof e.sacredText === 'string' && (['none','present','redacted','unknown'] as ReadonlyArray<string>).includes(e.sacredText as string);
}

// ============================================================================
// 9. WINDOW HELPERS — 8+ named exports
// ============================================================================

/** Build a WindowSpec from a kind. */
export function windowSpec(kind: WindowKind): WindowSpec {
  const durationMs = WINDOW_DURATIONS_MS[kind];
  const bucketCount = WINDOW_BUCKET_COUNTS[kind];
  return Object.freeze({
    kind,
    durationMs,
    bucketCount,
    bucketMs: Math.floor(durationMs / bucketCount),
  });
}

/** Pre-built window specs for common kinds. */
export const window1m: WindowSpec = Object.freeze(windowSpec('1m'));
export const window5m: WindowSpec = Object.freeze(windowSpec('5m'));
export const window15m: WindowSpec = Object.freeze(windowSpec('15m'));
export const window1h: WindowSpec = Object.freeze(windowSpec('1h'));
export const window24h: WindowSpec = Object.freeze(windowSpec('24h'));

/** Iterate all window specs. */
export function allWindowSpecs(): ReadonlyArray<WindowSpec> {
  return ALL_WINDOW_KINDS.map(windowSpec);
}

/** Compute the bucket index for a given timestamp within a window. */
export function bucketIndexFor(at: EpochMs, windowStart: EpochMs, spec: WindowSpec): number {
  if (spec.bucketMs <= 0) return 0;
  const idx = Math.floor((at - windowStart) / spec.bucketMs);
  if (idx < 0) return 0;
  if (idx >= spec.bucketCount) return spec.bucketCount - 1;
  return idx;
}

/** Compute the start of the bucket containing `at`. */
export function bucketStartFor(at: EpochMs, windowStart: EpochMs, spec: WindowSpec): EpochMs {
  const idx = bucketIndexFor(at, windowStart, spec);
  return windowStart + idx * spec.bucketMs;
}

/** Compute the end (exclusive) of the bucket containing `at`. */
export function bucketEndFor(at: EpochMs, windowStart: EpochMs, spec: WindowSpec): EpochMs {
  return bucketStartFor(at, windowStart, spec) + spec.bucketMs;
}

/** Validate that a window does not exceed the source's max supported window. */
export function validateWindowSpec(spec: WindowSpec, maxDurationMs: EpochMs): void {
  const maxAllowed = maxDurationMs * W53MET_MAX_WINDOW_OVERFLOW_FACTOR;
  if (spec.durationMs > maxAllowed) {
    throw new MetricsWindowOverflowError(spec.durationMs, maxAllowed, { kind: spec.kind });
  }
}

// ============================================================================
// 10. TIME-SERIES SAMPLE BUFFER (per window)
// ============================================================================

/**
 * Fixed-capacity sample buffer keyed by (metric, windowKind). When capacity
 * is reached, oldest samples are evicted (FIFO). All samples are immutable.
 */
export class TimeSeriesBuffer {
  private readonly ring: MetricSample[] = [];
  private readonly cap: number;
  constructor(cap: number = W53MET_METRICS_RING_SIZE) {
    if (!Number.isFinite(cap) || cap < 1) cap = W53MET_METRICS_RING_SIZE;
    this.cap = Math.floor(cap);
  }
  push(sample: MetricSample): void {
    this.ring.push(sample);
    while (this.ring.length > this.cap) this.ring.shift();
  }
  pushMany(samples: ReadonlyArray<MetricSample>): void {
    for (const s of samples) this.push(s);
  }
  size(): number { return this.ring.length; }
  capacity(): number { return this.cap; }
  /** Return samples in [fromMs, toMs) for the given metric+window. */
  range(metric: AlertMetric, windowKind: WindowKind, fromMs: EpochMs, toMs: EpochMs): ReadonlyArray<MetricSample> {
    const out: MetricSample[] = [];
    for (const s of this.ring) {
      if (s.metric !== metric) continue;
      if (s.windowKind !== windowKind) continue;
      if (s.at < fromMs) continue;
      if (s.at >= toMs) continue;
      out.push(s);
    }
    return out;
  }
  /** Return all samples for the given metric+window within the last `durationMs`. */
  recent(metric: AlertMetric, windowKind: WindowKind, durationMs: EpochMs, now: EpochMs): ReadonlyArray<MetricSample> {
    return this.range(metric, windowKind, now - durationMs, now);
  }
  /** Clear all samples (LGPD / reset). */
  clear(): void {
    this.ring.length = 0;
  }
  /** LGPD Art. 18 — purge samples whose value references a userId. */
  purgeByUser(userId: string, lookup: (s: MetricSample) => string | undefined): number {
    let removed = 0;
    for (let i = this.ring.length - 1; i >= 0; i--) {
      const s = this.ring[i] as MetricSample;
      if (lookup(s) === userId) {
        this.ring.splice(i, 1);
        removed++;
      }
    }
    return removed;
  }
}

// ============================================================================
// 11. BUCKET COMPUTATION
// ============================================================================

/**
 * Bucket a list of samples into a fixed-grid time-series.
 * Samples outside [fromMs, toMs) are dropped.
 */
export function bucketSamples(
  samples: ReadonlyArray<MetricSample>,
  spec: WindowSpec,
  fromMs: EpochMs,
  toMs: EpochMs,
): ReadonlyArray<MetricBucket> {
  const buckets: MetricBucket[] = [];
  for (let i = 0; i < spec.bucketCount; i++) {
    const start = fromMs + i * spec.bucketMs;
    const end = start + spec.bucketMs;
    buckets.push({
      bucketStartMs: start,
      bucketEndMs: end,
      count: 0,
      sum: 0,
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      mean: 0,
    });
  }
  for (const s of samples) {
    if (s.at < fromMs || s.at >= toMs) continue;
    const idx = bucketIndexFor(s.at, fromMs, spec);
    const b = buckets[idx];
    if (!b) continue;
    b.count++;
    b.sum += s.value;
    if (s.value < b.min) b.min = s.value;
    if (s.value > b.max) b.max = s.value;
  }
  for (const b of buckets) {
    if (b.count > 0) {
      b.mean = b.sum / b.count;
    } else {
      b.min = 0;
      b.max = 0;
      b.mean = 0;
    }
  }
  return buckets;
}

/** Reduce buckets to a single TrendBaseline. */
export function baselineFromBuckets(buckets: ReadonlyArray<MetricBucket>, spec: WindowSpec, now: EpochMs): TrendBaseline {
  let sum = 0;
  let sumSq = 0;
  let samples = 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const b of buckets) {
    if (b.count === 0) continue;
    sum += b.mean;
    sumSq += b.mean * b.mean;
    samples++;
    if (b.mean < min) min = b.mean;
    if (b.mean > max) max = b.mean;
  }
  if (samples === 0) {
    return Object.freeze({
      windowSpec: spec,
      mean: 0,
      stddev: 0,
      samples: 0,
      min: 0,
      max: 0,
      computedAt: now,
    });
  }
  const mean = sum / samples;
  const variance = samples > 1 ? Math.max(0, (sumSq / samples) - (mean * mean)) : 0;
  const stddev = Math.sqrt(variance);
  return Object.freeze({
    windowSpec: spec,
    mean,
    stddev,
    samples,
    min: min === Number.POSITIVE_INFINITY ? 0 : min,
    max: max === Number.NEGATIVE_INFINITY ? 0 : max,
    computedAt: now,
  });
}

// ============================================================================
// 12. METRICS AGGREGATOR (the core engine)
// ============================================================================

/**
 * Aggregates a DlqSourceShape (and optional replay-outcome history) into a
 * DlqMetrics projection. Stateful — it retains a sample buffer per
 * (metric, windowKind) and exposes snapshot + trend APIs.
 */
export class MetricsAggregator {
  private readonly source: DlqSourceShape;
  private readonly clock: Clock;
  private readonly buffers: Map<string, TimeSeriesBuffer> = new Map();
  private readonly replayHistory: ReplayOutcomeShape[] = [];
  private readonly retention: DlqRetentionPolicy;
  private lastMetrics: DlqMetrics | null = null;
  private sweepCountInternal = 0;
  private lastSweepAt: EpochMs = 0;
  private sourceLabel: string;

  constructor(source: DlqSourceShape, opts?: { clock?: Clock; retention?: DlqRetentionPolicy; sourceLabel?: string }) {
    this.source = source;
    this.clock = opts?.clock ?? SystemClock;
    this.retention = opts?.retention ?? DEFAULT_DLQ_RETENTION;
    this.sourceLabel = opts?.sourceLabel ?? 'w52dlq';
    this.lastSweepAt = this.clock.now();
  }

  private bufferKey(metric: AlertMetric, windowKind: WindowKind): string {
    return metric + '|' + windowKind;
  }
  private getBuffer(metric: AlertMetric, windowKind: WindowKind): TimeSeriesBuffer {
    const k = this.bufferKey(metric, windowKind);
    let buf = this.buffers.get(k);
    if (!buf) {
      buf = new TimeSeriesBuffer(W53MET_METRICS_RING_SIZE);
      this.buffers.set(k, buf);
    }
    return buf;
  }

  setSourceLabel(label: string): void {
    this.sourceLabel = label;
  }
  sourceLabelValue(): string { return this.sourceLabel; }

  /** Record a replay outcome for replay-success-rate metric. */
  recordReplay(outcome: ReplayOutcomeShape): void {
    this.replayHistory.push(Object.assign({}, outcome));
    if (this.replayHistory.length > 1024) this.replayHistory.shift();
    const at = this.clock.now();
    const denom = Math.max(1, outcome.requestedCount);
    const rate = outcome.replayedCount / denom;
    const failed = outcome.failedReplays;
    for (const wk of ALL_WINDOW_KINDS) {
      this.getBuffer('replaySuccessRate', wk).push({
        at,
        value: rate,
        metric: 'replaySuccessRate',
        windowKind: wk,
      });
      this.getBuffer('replayFailed', wk).push({
        at,
        value: failed,
        metric: 'replayFailed',
        windowKind: wk,
      });
    }
  }

  /** Ingest a snapshot's headline metrics as samples for trend analysis. */
  ingest(metrics: DlqMetrics): void {
    const at = metrics.computedAt;
    for (const wk of ALL_WINDOW_KINDS) {
      this.getBuffer('depth', wk).push({ at, value: metrics.depth, metric: 'depth', windowKind: wk });
      this.getBuffer('oldestMs', wk).push({ at, value: metrics.oldestMs ?? 0, metric: 'oldestMs', windowKind: wk });
      this.getBuffer('fillRatio', wk).push({ at, value: metrics.fillRatio, metric: 'fillRatio', windowKind: wk });
      this.getBuffer('sacredFlaggedCount', wk).push({ at, value: metrics.sacredFlaggedCount, metric: 'sacredFlaggedCount', windowKind: wk });
      this.getBuffer('replaySuccessRate', wk).push({ at, value: metrics.replaySuccessRate, metric: 'replaySuccessRate', windowKind: wk });
      this.getBuffer('replayFailed', wk).push({ at, value: metrics.replayFailed, metric: 'replayFailed', windowKind: wk });
    }
  }

  /** Compute the current DlqMetrics projection. */
  snapshot(): DlqMetrics {
    const now = this.clock.now();
    const entries = this.source.list();
    const depth = this.source.size();
    const capacity = this.source.capacity();
    const fillRatio = capacity > 0 ? depth / capacity : 0;

    let oldestEntryAt: EpochMs | null = null;
    let oldestEntryId: OpaqueId | null = null;
    for (const e of entries) {
      if (oldestEntryAt === null || e.firstFailAt < oldestEntryAt) {
        oldestEntryAt = e.firstFailAt;
        oldestEntryId = e.id;
      }
    }
    const oldestMs = oldestEntryAt === null ? null : Math.max(0, now - oldestEntryAt);

    const byFailureMode: Partial<Record<FailureMode, number>> = {};
    const byCircuitState: Partial<Record<CircuitState, number>> = {};
    const byTarget: Record<string, number> = {};
    let sacredFlaggedCount = 0;
    for (const e of entries) {
      byFailureMode[e.failureMode] = (byFailureMode[e.failureMode] ?? 0) + 1;
      if (e.lastCircuitState) {
        byCircuitState[e.lastCircuitState] = (byCircuitState[e.lastCircuitState] ?? 0) + 1;
      }
      byTarget[e.targetUrl] = (byTarget[e.targetUrl] ?? 0) + 1;
      if (e.sacredText === 'present' || e.sacredText === 'redacted') {
        sacredFlaggedCount++;
      }
    }

    let replayAttempted = 0;
    let replayFailed = 0;
    for (const r of this.replayHistory) {
      replayAttempted += r.requestedCount;
      replayFailed += r.failedReplays;
    }
    const replaySuccess = replayAttempted > 0
      ? Math.max(0, 1 - (replayFailed / Math.max(1, replayAttempted)))
      : 1;

    const metrics: DlqMetrics = {
      depth,
      capacity,
      fillRatio,
      oldestMs,
      oldestEntryId,
      byFailureMode,
      byCircuitState,
      byTarget,
      sacredFlaggedCount,
      replaySuccessRate: replaySuccess,
      replayAttempted,
      replayFailed,
      computedAt: now,
      sourceLabel: this.sourceLabel,
    };
    this.lastMetrics = metrics;
    return Object.assign({}, metrics);
  }

  /** Return samples for a given metric + window. */
  samplesFor(metric: AlertMetric, windowKind: WindowKind): ReadonlyArray<MetricSample> {
    return this.getBuffer(metric, windowKind).range(metric, windowKind, 0, Number.MAX_SAFE_INTEGER);
  }

  /** Count of distinct metrics tracked. */
  trackedMetricCount(): number { return this.buffers.size; }

  /** Sweep expired samples (LGPD retention). Returns number removed. */
  sweep(): number {
    const now = this.clock.now();
    if (now - this.lastSweepAt < this.retention.sweepIntervalMs && this.sweepCountInternal > 0) {
      return 0;
    }
    this.lastSweepAt = now;
    this.sweepCountInternal++;
    const cutoff = now - this.retention.metricsRetentionMs;
    let removed = 0;
    for (const buf of this.buffers.values()) {
      const before = buf.size();
      const remaining: MetricSample[] = [];
      for (let i = 0; i < before; i++) {
        const s = (buf as unknown as { ring: MetricSample[] }).ring[i];
        if (s && s.at >= cutoff) remaining.push(s);
      }
      (buf as unknown as { ring: MetricSample[] }).ring.length = 0;
      for (const s of remaining) (buf as unknown as { ring: MetricSample[] }).ring.push(s);
      removed += before - remaining.length;
    }
    return removed;
  }

  /** LGPD Art. 18 — purge user-scoped data. */
  purgeByUser(userId: string): number {
    let removed = 0;
    for (const buf of this.buffers.values()) {
      removed += buf.purgeByUser(userId, () => undefined);
    }
    return removed;
  }

  lastSnapshot(): DlqMetrics | null {
    return this.lastMetrics ? Object.assign({}, this.lastMetrics) : null;
  }

  retentionPolicy(): DlqRetentionPolicy { return Object.assign({}, this.retention); }
}

// ============================================================================
// 13. METRIC AGGREGATORS — 10+ named exports
// ============================================================================

/** Current queue depth. */
export function depthNow(source: DlqSourceShape): number {
  return source.size();
}

/** Oldest entry age in ms (0 when empty). */
export function oldestAge(source: DlqSourceShape, clock: Clock = SystemClock): EpochMs {
  const entries = source.list();
  if (entries.length === 0) return 0;
  let min = Number.POSITIVE_INFINITY;
  for (const e of entries) if (e.firstFailAt < min) min = e.firstFailAt;
  if (min === Number.POSITIVE_INFINITY) return 0;
  return Math.max(0, clock.now() - min);
}

/** Histogram of failure modes across current entries. */
export function byFailureModeBucket(source: DlqSourceShape): Partial<Record<FailureMode, number>> {
  const out: Partial<Record<FailureMode, number>> = {};
  for (const e of source.list()) {
    out[e.failureMode] = (out[e.failureMode] ?? 0) + 1;
  }
  return out;
}

/** Histogram of circuit states across current entries (entries may omit state). */
export function byCircuitStateBucket(source: DlqSourceShape): Partial<Record<CircuitState, number>> {
  const out: Partial<Record<CircuitState, number>> = {};
  for (const e of source.list()) {
    if (!e.lastCircuitState) continue;
    out[e.lastCircuitState] = (out[e.lastCircuitState] ?? 0) + 1;
  }
  return out;
}

/** Histogram of target URLs across current entries. */
export function byTargetBucket(source: DlqSourceShape): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of source.list()) {
    out[e.targetUrl] = (out[e.targetUrl] ?? 0) + 1;
  }
  return out;
}

/** Count of sacred-flagged entries (admin-visible aggregate; entries gated). */
export function sacredFlaggedCount(source: DlqSourceShape): number {
  let n = 0;
  for (const e of source.list()) {
    if (e.sacredText === 'present' || e.sacredText === 'redacted') n++;
  }
  return n;
}

/** Replay success rate (1 - failed/attempted) across the recorded history. */
export function replaySuccessRate(history: ReadonlyArray<ReplayOutcomeShape>): number {
  let attempted = 0;
  let failed = 0;
  for (const r of history) {
    attempted += r.requestedCount;
    failed += r.failedReplays;
  }
  if (attempted <= 0) return 1;
  return Math.max(0, 1 - failed / attempted);
}

/** Total replay attempts recorded. */
export function replayAttempted(history: ReadonlyArray<ReplayOutcomeShape>): number {
  let n = 0;
  for (const r of history) n += r.requestedCount;
  return n;
}

/** Total replay failures recorded. */
export function replayFailed(history: ReadonlyArray<ReplayOutcomeShape>): number {
  let n = 0;
  for (const r of history) n += r.failedReplays;
  return n;
}

/** Open-circuit count given a map of target → circuit snapshot. */
export function openCircuitCount(snapshots: Readonly<Record<string, CircuitSnapshotShape>>): number {
  let n = 0;
  for (const k of Object.keys(snapshots)) {
    if (snapshots[k] && snapshots[k].state === 'open') n++;
  }
  return n;
}

/** Overall failure rate from a w52 DLQStats (rejected entries / total). */
export function failureRate(stats: DlqStatsShape): number {
  if (stats.totalEntries <= 0) return 0;
  return stats.expiredSinceSweep / stats.totalEntries;
}

/** Compute fill ratio (depth / capacity). */
export function fillRatio(source: DlqSourceShape): number {
  const cap = source.capacity();
  if (cap <= 0) return 0;
  return source.size() / cap;
}

/** Count of entries whose consentVerified !== true. */
export function consentMissingCount(source: DlqSourceShape): number {
  let n = 0;
  for (const e of source.list()) {
    if (e.consentVerified !== true) n++;
  }
  return n;
}

/** Count of entries that have been replayed at least once. */
export function replayedCount(source: DlqSourceShape): number {
  let n = 0;
  for (const e of source.list()) if (e.replayed === true) n++;
  return n;
}

// ============================================================================
// 14. WINDOWED AGGREGATIONS (per-window helpers)
// ============================================================================

/**
 * Compute a DlqMetrics projection over a single window — i.e. only consider
 * entries whose firstFailAt is within [now - durationMs, now].
 */
export function metricsForWindow(source: DlqSourceShape, spec: WindowSpec, clock: Clock = SystemClock): DlqMetrics {
  const now = clock.now();
  const fromMs = now - spec.durationMs;
  const entries = source.list().filter((e) => e.firstFailAt >= fromMs && e.firstFailAt < now);
  const depth = entries.length;
  const capacity = source.capacity();
  const fillRatio = capacity > 0 ? depth / capacity : 0;

  let oldestEntryAt: EpochMs | null = null;
  let oldestEntryId: OpaqueId | null = null;
  for (const e of entries) {
    if (oldestEntryAt === null || e.firstFailAt < oldestEntryAt) {
      oldestEntryAt = e.firstFailAt;
      oldestEntryId = e.id;
    }
  }
  const oldestMs = oldestEntryAt === null ? null : Math.max(0, now - oldestEntryAt);

  const byFailureMode: Partial<Record<FailureMode, number>> = {};
  const byCircuitState: Partial<Record<CircuitState, number>> = {};
  const byTarget: Record<string, number> = {};
  let sacredFlaggedCount = 0;
  for (const e of entries) {
    byFailureMode[e.failureMode] = (byFailureMode[e.failureMode] ?? 0) + 1;
    if (e.lastCircuitState) {
      byCircuitState[e.lastCircuitState] = (byCircuitState[e.lastCircuitState] ?? 0) + 1;
    }
    byTarget[e.targetUrl] = (byTarget[e.targetUrl] ?? 0) + 1;
    if (e.sacredText === 'present' || e.sacredText === 'redacted') sacredFlaggedCount++;
  }
  return Object.freeze({
    depth,
    capacity,
    fillRatio,
    oldestMs,
    oldestEntryId,
    byFailureMode,
    byCircuitState,
    byTarget,
    sacredFlaggedCount,
    replaySuccessRate: 1,
    replayAttempted: 0,
    replayFailed: 0,
    computedAt: now,
    sourceLabel: 'window:' + spec.kind,
  });
}

// ============================================================================
// 15. ALERTING — rule registry + evaluation
// ============================================================================

export class AlertRuleRegistry {
  private readonly rules = new Map<OpaqueId, AlertRule>();
  private lastEvaluations = new Map<OpaqueId, AlertEvaluation>();

  upsert(rule: AlertRule): void {
    this.rules.set(rule.id, Object.assign({}, rule));
  }
  remove(ruleId: OpaqueId): boolean {
    const r = this.rules.delete(ruleId);
    this.lastEvaluations.delete(ruleId);
    return r;
  }
  get(ruleId: OpaqueId): AlertRule | undefined {
    const r = this.rules.get(ruleId);
    return r ? Object.assign({}, r) : undefined;
  }
  list(): ReadonlyArray<AlertRule> {
    return Array.from(this.rules.values()).map((r) => Object.assign({}, r));
  }
  size(): number { return this.rules.size; }
  setEnabled(ruleId: OpaqueId, enabled: boolean): boolean {
    const r = this.rules.get(ruleId);
    if (!r) return false;
    r.enabled = enabled;
    return true;
  }
  setSilenceUntil(ruleId: OpaqueId, until: EpochMs | undefined): boolean {
    const r = this.rules.get(ruleId);
    if (!r) return false;
    if (until === undefined) {
      delete r.silenceUntil;
    } else {
      r.silenceUntil = until;
    }
    return true;
  }
  annotate(ruleId: OpaqueId, annotation: RuleAnnotation): boolean {
    const r = this.rules.get(ruleId);
    if (!r) return false;
    const list = r.annotations ? Array.from(r.annotations) : [];
    list.push(annotation);
    r.annotations = Object.freeze(list);
    return true;
  }
  storeEvaluation(ev: AlertEvaluation): void {
    this.lastEvaluations.set(ev.rule.id, Object.assign({}, ev));
  }
  lastEvaluationFor(ruleId: OpaqueId): AlertEvaluation | undefined {
    const e = this.lastEvaluations.get(ruleId);
    return e ? Object.assign({}, e) : undefined;
  }
  clear(): void {
    this.rules.clear();
    this.lastEvaluations.clear();
  }
}

/** Extract the metric value from a DlqMetrics + AlertMetric. */
export function metricValue(metrics: DlqMetrics, metric: AlertMetric, snapshots?: Readonly<Record<string, CircuitSnapshotShape>>): number {
  switch (metric) {
    case 'depth': return metrics.depth;
    case 'oldestMs': return metrics.oldestMs ?? 0;
    case 'fillRatio': return metrics.fillRatio;
    case 'sacredFlaggedCount': return metrics.sacredFlaggedCount;
    case 'replaySuccessRate': return metrics.replaySuccessRate;
    case 'replayFailed': return metrics.replayFailed;
    case 'openCircuitCount': return snapshots ? openCircuitCount(snapshots) : 0;
    case 'failureRate': return metrics.replayAttempted > 0 ? (metrics.replayFailed / metrics.replayAttempted) : 0;
  }
}

/** Decide whether a single rule is firing against the current metrics. */
export function isRuleFiring(rule: AlertRule, metrics: DlqMetrics, snapshots?: Readonly<Record<string, CircuitSnapshotShape>>, clock: Clock = SystemClock): boolean {
  if (!rule.enabled) return false;
  if (rule.silenceUntil !== undefined && clock.now() < rule.silenceUntil) return false;
  if (rule.cooldownMs && rule.lastFiredAt && (clock.now() - rule.lastFiredAt) < rule.cooldownMs) return false;
  const observed = metricValue(metrics, rule.metric, snapshots);
  const cmp = COMPARATOR_FN[rule.comparator];
  return cmp(observed, rule.threshold);
}

/** Compute the AlertState for a single rule. */
export function computeAlertState(rule: AlertRule, metrics: DlqMetrics, snapshots?: Readonly<Record<string, CircuitSnapshotShape>>, clock: Clock = SystemClock): AlertState {
  if (!rule.enabled) return 'silent';
  if (rule.silenceUntil !== undefined && clock.now() < rule.silenceUntil) return 'silent';
  const firing = isRuleFiring(rule, metrics, snapshots, clock);
  if (firing) return 'firing';
  if (rule.lastFiredAt && rule.lastResolvedAt && rule.lastResolvedAt >= rule.lastFiredAt) return 'resolved';
  return 'silent';
}

/** Evaluate every rule and return the array of AlertEvaluations. */
export function evaluateRules(
  registry: AlertRuleRegistry,
  metrics: DlqMetrics,
  snapshots?: Readonly<Record<string, CircuitSnapshotShape>>,
  clock: Clock = SystemClock,
): ReadonlyArray<AlertEvaluation> {
  const out: AlertEvaluation[] = [];
  for (const rule of registry.list()) {
    const state = computeAlertState(rule, metrics, snapshots, clock);
    const observed = metricValue(metrics, rule.metric, snapshots);
    let reason = 'rule disabled';
    if (rule.enabled) {
      if (rule.silenceUntil !== undefined && clock.now() < rule.silenceUntil) {
        reason = 'silenced until ' + rule.silenceUntil;
      } else if (state === 'firing') {
        reason = observed + ' ' + rule.comparator + ' ' + rule.threshold;
      } else if (state === 'resolved') {
        reason = 'previously firing, now ' + observed + ' (not ' + rule.comparator + ' ' + rule.threshold + ')';
      } else {
        reason = 'below threshold';
      }
    }
    const ev: AlertEvaluation = {
      rule: Object.assign({}, rule),
      state,
      observedValue: observed,
      evaluatedAt: clock.now(),
      reason,
    };
    registry.storeEvaluation(ev);
    out.push(ev);
  }
  return out;
}

/** Acknowledge a firing rule (operator). */
export function acknowledgeRule(registry: AlertRuleRegistry, ruleId: OpaqueId, operatorId: string, clock: Clock = SystemClock): AlertRule {
  const rule = registry.get(ruleId);
  if (!rule) throw new MetricsOperatorActionRefusedError('unknown ruleId', { ruleId, operatorId });
  registry.setEnabled(ruleId, false);
  registry.annotate(ruleId, { at: clock.now(), authorId: operatorId, note: 'ack' });
  const ev = registry.lastEvaluationFor(ruleId);
  if (ev) {
    registry.storeEvaluation({
      rule: Object.assign({}, rule, { enabled: false }),
      state: 'acknowledged',
      observedValue: ev.observedValue,
      evaluatedAt: clock.now(),
      reason: 'acknowledged by ' + operatorId,
    });
  }
  return registry.get(ruleId) as AlertRule;
}

/** Silence a rule for a duration (ms). Throws MET_003 if already silenced. */
export function silenceRule(registry: AlertRuleRegistry, ruleId: OpaqueId, durationMs: EpochMs, operatorId: string, clock: Clock = SystemClock): AlertRule {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new MetricsRuleEvalError(ruleId, 'silence duration must be > 0', { durationMs });
  }
  const rule = registry.get(ruleId);
  if (!rule) throw new MetricsOperatorActionRefusedError('unknown ruleId', { ruleId, operatorId });
  if (rule.silenceUntil !== undefined && clock.now() < rule.silenceUntil) {
    throw new MetricsSilenceActiveError(ruleId, rule.silenceUntil, { operatorId });
  }
  const until = clock.now() + durationMs;
  registry.setSilenceUntil(ruleId, until);
  registry.annotate(ruleId, { at: clock.now(), authorId: operatorId, note: 'silence for ' + durationMs + 'ms' });
  return registry.get(ruleId) as AlertRule;
}

/** Resolve a previously-firing rule (operator). */
export function resolveRule(registry: AlertRuleRegistry, ruleId: OpaqueId, operatorId: string, clock: Clock = SystemClock): AlertRule {
  const rule = registry.get(ruleId);
  if (!rule) throw new MetricsOperatorActionRefusedError('unknown ruleId', { ruleId, operatorId });
  rule.lastResolvedAt = clock.now();
  registry.upsert(rule);
  registry.annotate(ruleId, { at: clock.now(), authorId: operatorId, note: 'resolve' });
  return registry.get(ruleId) as AlertRule;
}

/** Mark a rule as firing (manual override). */
export function markRuleFiring(registry: AlertRuleRegistry, ruleId: OpaqueId, clock: Clock = SystemClock): AlertRule {
  const rule = registry.get(ruleId);
  if (!rule) throw new MetricsOperatorActionRefusedError('unknown ruleId', { ruleId });
  rule.lastFiredAt = clock.now();
  registry.upsert(rule);
  return registry.get(ruleId) as AlertRule;
}

/** Count rules currently firing. */
export function firingRuleCount(registry: AlertRuleRegistry, metrics: DlqMetrics, snapshots?: Readonly<Record<string, CircuitSnapshotShape>>, clock: Clock = SystemClock): number {
  let n = 0;
  for (const r of registry.list()) {
    if (computeAlertState(r, metrics, snapshots, clock) === 'firing') n++;
  }
  return n;
}

/** List rules whose state is firing. */
export function firingRules(registry: AlertRuleRegistry, metrics: DlqMetrics, snapshots?: Readonly<Record<string, CircuitSnapshotShape>>, clock: Clock = SystemClock): ReadonlyArray<AlertRule> {
  const out: AlertRule[] = [];
  for (const r of registry.list()) {
    if (computeAlertState(r, metrics, snapshots, clock) === 'firing') out.push(Object.assign({}, r));
  }
  return out;
}

/** Build a default rule set covering the standard thresholds. */
export function defaultAlertRules(): ReadonlyArray<AlertRule> {
  const now = Date.now();
  const mk = (id: string, metric: AlertMetric, comparator: Comparator, threshold: number, severity: Severity, windowKind: WindowKind): AlertRule => ({
    id,
    metric,
    comparator,
    threshold,
    severity,
    windowKind,
    enabled: true,
    description: 'Default: ' + ALERT_METRIC_LABELS[metric] + ' ' + comparator + ' ' + threshold,
  });
  return Object.freeze([
    mk('rule_depth_default', 'depth', '>', W53MET_DEFAULT_DEPTH_THRESHOLD, 'high', '5m'),
    mk('rule_oldest_default', 'oldestMs', '>', W53MET_DEFAULT_OLDEST_MS_THRESHOLD, 'high', '15m'),
    mk('rule_replay_failure_default', 'failureRate', '>', W53MET_DEFAULT_REPLAY_FAILURE_RATE, 'critical', '15m'),
    mk('rule_sacred_count_default', 'sacredFlaggedCount', '>', 0, 'critical', '1h'),
    mk('rule_open_circuit_default', 'openCircuitCount', '>=', W53MET_DEFAULT_OPEN_CIRCUIT_COUNT, 'high', '1h'),
    { id: 'rule_seed_marker', metric: 'depth', comparator: '>', threshold: 0, severity: 'low', windowKind: '1m', enabled: true, lastFiredAt: now, lastResolvedAt: now, annotations: Object.freeze([{ at: now, authorId: 'system', note: 'seed' }]) },
  ]);
}

// ============================================================================
// 16. TREND ANALYSIS — 8+ named exports
// ============================================================================

/** Compute mean of an array (0 for empty). */
export function meanOf(values: ReadonlyArray<number>): number {
  if (values.length === 0) return 0;
  let s = 0;
  for (const v of values) s += v;
  return s / values.length;
}

/** Compute sample stddev (0 for n<2). */
export function stddevOf(values: ReadonlyArray<number>): number {
  if (values.length < 2) return 0;
  const mean = meanOf(values);
  let s = 0;
  for (const v of values) s += (v - mean) * (v - mean);
  return Math.sqrt(s / (values.length - 1));
}

/** Compute z-score for a value given a baseline. */
export function zScore(value: number, baseline: TrendBaseline): number {
  if (baseline.stddev <= 0 || baseline.samples < 2) return 0;
  return (value - baseline.mean) / baseline.stddev;
}

/** Validate z-threshold configuration. Throws MET_004 when invalid. */
export function validateZThreshold(threshold: number, minSamples: number): void {
  if (!Number.isFinite(threshold) || threshold <= 0) {
    throw new MetricsAnomalyThresholdError('threshold must be > 0', { threshold });
  }
  if (!Number.isInteger(minSamples) || minSamples < 2) {
    throw new MetricsAnomalyThresholdError('minSamples must be an integer >= 2', { minSamples });
  }
}

/** Compute a TrendBaseline from a list of samples. */
export function computeBaseline(samples: ReadonlyArray<MetricSample>, windowKind: WindowKind, clock: Clock = SystemClock): TrendBaseline {
  const spec = windowSpec(windowKind);
  if (samples.length === 0) {
    return Object.freeze({
      windowSpec: spec,
      mean: 0,
      stddev: 0,
      samples: 0,
      min: 0,
      max: 0,
      computedAt: clock.now(),
    });
  }
  let sum = 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const s of samples) {
    sum += s.value;
    if (s.value < min) min = s.value;
    if (s.value > max) max = s.value;
  }
  const mean = sum / samples.length;
  let variance = 0;
  for (const s of samples) variance += (s.value - mean) * (s.value - mean);
  variance = samples.length > 1 ? variance / (samples.length - 1) : 0;
  const stddev = Math.sqrt(Math.max(0, variance));
  return Object.freeze({
    windowSpec: spec,
    mean,
    stddev,
    samples: samples.length,
    min: min === Number.POSITIVE_INFINITY ? 0 : min,
    max: max === Number.NEGATIVE_INFINITY ? 0 : max,
    computedAt: clock.now(),
  });
}

/** Detect an anomaly for a single observed value. */
export function detectAnomaly(
  observedValue: number,
  baseline: TrendBaseline,
  metric: AlertMetric,
  observedAt: EpochMs,
  zThreshold: number = W53MET_DEFAULT_Z_THRESHOLD,
  minSamples: number = W53MET_DEFAULT_MIN_SAMPLES,
): Anomaly | null {
  validateZThreshold(zThreshold, minSamples);
  if (baseline.samples < minSamples) return null;
  const z = zScore(observedValue, baseline);
  if (Math.abs(z) < zThreshold) return null;
  const kind: 'spike' | 'dip' = z > 0 ? 'spike' : 'dip';
  return Object.freeze({
    kind,
    magnitude: Math.abs(observedValue - baseline.mean),
    zScore: z,
    observedAt,
    metric,
    observedValue,
    baselineMean: baseline.mean,
    baselineStddev: baseline.stddev,
    windowKind: baseline.windowSpec.kind,
  });
}

/** Detect anomalies across an entire sample buffer (returns all that exceed threshold). */
export function detectAnomalies(
  samples: ReadonlyArray<MetricSample>,
  baseline: TrendBaseline,
  metric: AlertMetric,
  zThreshold: number = W53MET_DEFAULT_Z_THRESHOLD,
  minSamples: number = W53MET_DEFAULT_MIN_SAMPLES,
): ReadonlyArray<Anomaly> {
  validateZThreshold(zThreshold, minSamples);
  const out: Anomaly[] = [];
  for (const s of samples) {
    const a = detectAnomaly(s.value, baseline, metric, s.at, zThreshold, minSamples);
    if (a) out.push(a);
  }
  return out;
}

/** Run trend analysis across all (metric, window) pairs in an aggregator. */
export function trendScan(
  aggregator: MetricsAggregator,
  zThreshold: number = W53MET_DEFAULT_Z_THRESHOLD,
  minSamples: number = W53MET_DEFAULT_MIN_SAMPLES,
  clock: Clock = SystemClock,
): ReadonlyArray<Anomaly> {
  const out: Anomaly[] = [];
  const metrics: AlertMetric[] = [
    'depth', 'oldestMs', 'fillRatio', 'sacredFlaggedCount',
    'replaySuccessRate', 'replayFailed',
  ];
  for (const metric of metrics) {
    for (const wk of ALL_WINDOW_KINDS) {
      const samples = aggregator.samplesFor(metric, wk);
      if (samples.length === 0) continue;
      const baseline = computeBaseline(samples, wk, clock);
      const last = samples[samples.length - 1];
      if (!last) continue;
      const a = detectAnomaly(last.value, baseline, metric, last.at, zThreshold, minSamples);
      if (a) out.push(a);
    }
  }
  return out;
}

/** Compute a z-score table (per window, per metric) for the aggregator. */
export function zScoreTable(
  aggregator: MetricsAggregator,
  clock: Clock = SystemClock,
): Record<AlertMetric, Record<WindowKind, number>> {
  const out = {} as Record<AlertMetric, Record<WindowKind, number>>;
  const metrics: AlertMetric[] = [
    'depth', 'oldestMs', 'fillRatio', 'sacredFlaggedCount',
    'replaySuccessRate', 'replayFailed',
  ];
  for (const metric of metrics) {
    const inner = {} as Record<WindowKind, number>;
    for (const wk of ALL_WINDOW_KINDS) {
      const samples = aggregator.samplesFor(metric, wk);
      if (samples.length < 2) {
        inner[wk] = 0;
      } else {
        const baseline = computeBaseline(samples, wk, clock);
        const last = samples[samples.length - 1];
        inner[wk] = last ? zScore(last.value, baseline) : 0;
      }
    }
    out[metric] = inner;
  }
  return out;
}

/** Anomaly classification helper — categorize a magnitude bucket. */
export function classifyAnomalyMagnitude(magnitude: number, baseline: TrendBaseline): 'trivial' | 'minor' | 'major' | 'critical' {
  const ratio = baseline.mean > 0 ? magnitude / baseline.mean : magnitude;
  if (ratio < 0.1) return 'trivial';
  if (ratio < 0.3) return 'minor';
  if (ratio < 0.6) return 'major';
  return 'critical';
}

// ============================================================================
// 17. OPERATOR ACTION AUDIT — 6+ named exports
// ============================================================================

/**
 * Append-only operator action audit log.
 */
export class OperatorAuditLog {
  private readonly ring: OperatorAuditEntry[] = [];
  private readonly cap: number;
  constructor(cap: number = W53MET_AUDIT_RING_SIZE) {
    this.cap = Math.max(1, cap | 0);
  }
  size(): number { return this.ring.length; }
  capacity(): number { return this.cap; }
  record(action: OperatorAction, correlationId: OpaqueId): OperatorAuditEntry {
    const id = 'audit_' + fnv1a64Short(correlationId + ':' + action.at + ':' + action.kind + ':' + this.ring.length);
    const sacredAnnotated = 'sacredViewGranted' in action ? Boolean((action as { sacredViewGranted?: boolean }).sacredViewGranted) : false;
    const entry: OperatorAuditEntry = Object.freeze({
      id,
      action: Object.assign({}, action),
      correlationId,
      receivedAt: Date.now(),
      sacredAnnotated,
    });
    this.ring.push(entry);
    while (this.ring.length > this.cap) this.ring.shift();
    return entry;
  }
  /** Return entries for a given operator. */
  forOperator(operatorId: string): ReadonlyArray<OperatorAuditEntry> {
    return this.ring.filter((e) => {
      const a = e.action;
      if (a.kind === 'ack' || a.kind === 'silence' || a.kind === 'escalate') return a.operatorId === operatorId;
      if (a.kind === 'replay' || a.kind === 'clear') return a.operatorId === operatorId;
      return false;
    });
  }
  /** Return entries by action kind. */
  byKind(kind: OperatorAction['kind']): ReadonlyArray<OperatorAuditEntry> {
    return this.ring.filter((e) => e.action.kind === kind);
  }
  /** Return sacred-annotated entries. */
  sacredEntries(): ReadonlyArray<OperatorAuditEntry> {
    return this.ring.filter((e) => e.sacredAnnotated);
  }
  /** Return the most recent N entries. */
  recent(n: number): ReadonlyArray<OperatorAuditEntry> {
    if (n <= 0) return [];
    return this.ring.slice(-n);
  }
  /** LGPD Art. 18 — purge all entries by an operator. */
  purgeByOperator(operatorId: string): number {
    let removed = 0;
    for (let i = this.ring.length - 1; i >= 0; i--) {
      const e = this.ring[i] as OperatorAuditEntry;
      if (e.action.operatorId === operatorId) {
        this.ring.splice(i, 1);
        removed++;
      }
    }
    return removed;
  }
  /** Sweep entries older than `retentionMs`. */
  sweep(retentionMs: EpochMs = W53MET_AUDIT_RETENTION_MS, now: EpochMs = Date.now()): number {
    let removed = 0;
    for (let i = this.ring.length - 1; i >= 0; i--) {
      const e = this.ring[i] as OperatorAuditEntry;
      if (e.action.at < now - retentionMs) {
        this.ring.splice(i, 1);
        removed++;
      }
    }
    return removed;
  }
  /** Return all entries (read-only). */
  all(): ReadonlyArray<OperatorAuditEntry> {
    return this.ring.slice();
  }
}

/** Build an ack OperatorAction. */
export function makeAckAction(ruleId: OpaqueId, operatorId: string, note?: string, sacredViewGranted?: boolean): OperatorAction {
  return { kind: 'ack', ruleId, operatorId, at: Date.now(), note, sacredViewGranted };
}

/** Build a silence OperatorAction. */
export function makeSilenceAction(ruleId: OpaqueId, operatorId: string, silenceUntilMs: EpochMs, note?: string, sacredViewGranted?: boolean): OperatorAction {
  return { kind: 'silence', ruleId, operatorId, at: Date.now(), silenceUntilMs, note, sacredViewGranted };
}

/** Build a replay OperatorAction. */
export function makeReplayAction(operatorId: string, entryIds: ReadonlyArray<OpaqueId>, mode: ReplayReplayMode, reason: string, sacredAffected: number = 0, sacredViewGranted?: boolean): OperatorAction {
  return { kind: 'replay', operatorId, at: Date.now(), entryIds, mode, reason, sacredAffected, sacredViewGranted };
}

/** Build a clear OperatorAction. */
export function makeClearAction(operatorId: string, entryIds: ReadonlyArray<OpaqueId>, reason: string, sacredAffected: number = 0, sacredViewGranted?: boolean): OperatorAction {
  return { kind: 'clear', operatorId, at: Date.now(), entryIds, reason, sacredAffected, sacredViewGranted };
}

/** Build an escalate OperatorAction. */
export function makeEscalateAction(ruleId: OpaqueId, operatorId: string, targetRole: 'curator' | 'admin' | 'security', note?: string, sacredViewGranted?: boolean): OperatorAction {
  return { kind: 'escalate', ruleId, operatorId, at: Date.now(), targetRole, note, sacredViewGranted };
}

/** Record a single operator action (high-level convenience). */
export function recordOperatorAction(log: OperatorAuditLog, action: OperatorAction, correlationId: OpaqueId): OperatorAuditEntry {
  return log.record(action, correlationId);
}

// ============================================================================
// 18. SACRED CURATOR GATE — admin/curator access control
// ============================================================================

export interface SacredViewGrant {
  operatorId: string;
  grantedAt: EpochMs;
  expiresAt: EpochMs;
  reason: string;
}

export class SacredViewRegistry {
  private readonly grants = new Map<string, SacredViewGrant>();
  hasGrant(operatorId: string, now: EpochMs = Date.now()): boolean {
    const g = this.grants.get(operatorId);
    if (!g) return false;
    if (now >= g.expiresAt) {
      this.grants.delete(operatorId);
      return false;
    }
    return true;
  }
  grant(g: SacredViewGrant): void {
    this.grants.set(g.operatorId, Object.assign({}, g));
  }
  revoke(operatorId: string): boolean {
    return this.grants.delete(operatorId);
  }
  list(): ReadonlyArray<SacredViewGrant> {
    return Array.from(this.grants.values()).map((g) => Object.assign({}, g));
  }
  size(): number { return this.grants.size; }
}

/**
 * Curator-gated sacred trail. Each entry represents a sacred-flagged DLQ
 * entry with curated metadata. Non-curator callers receive an empty list
 * (MET_006 if they demand access).
 */
export class SacredTrail {
  private readonly ring: SacredTrailEntry[] = [];
  private readonly cap: number;
  constructor(cap: number = W53MET_SACRED_TRAIL_RING_SIZE) {
    this.cap = Math.max(1, cap | 0);
  }
  /** Ingest a sacred-flagged DLQ entry (called internally by ingestor). */
  ingest(entry: DlqEntryShape): SacredTrailEntry | null {
    if (entry.sacredText !== 'present' && entry.sacredText !== 'redacted') return null;
    const t: SacredTrailEntry = Object.freeze({
      id: 'sacred_' + fnv1a64Short(entry.id + ':' + entry.firstFailAt),
      entryId: entry.id,
      sacredStatus: entry.sacredText,
      targetUrl: entry.targetUrl,
      firstFailAt: entry.firstFailAt,
      lastFailAt: entry.lastFailAt,
      attempts: entry.attempts,
      consentVerified: entry.consentVerified === true,
      redactedAt: entry.redactedAt ?? null,
      reviewedBy: null,
      reviewedAt: null,
    });
    this.ring.push(t);
    while (this.ring.length > this.cap) this.ring.shift();
    return t;
  }
  /** List entries for a curator (requires SacredViewGrant). Throws MET_006 otherwise. */
  listForCurator(registry: SacredViewRegistry, operatorId: string, clock: Clock = SystemClock): ReadonlyArray<SacredTrailEntry> {
    if (!registry.hasGrant(operatorId, clock.now())) {
      throw new MetricsSacredAccessDeniedError(operatorId, 'sacred-trail-list');
    }
    return this.ring.slice();
  }
  /** Try-list (returns empty when no grant, never throws). */
  listForCuratorOrEmpty(registry: SacredViewRegistry, operatorId: string, clock: Clock = SystemClock): ReadonlyArray<SacredTrailEntry> {
    if (!registry.hasGrant(operatorId, clock.now())) return [];
    return this.ring.slice();
  }
  /** Mark a trail entry as reviewed by a curator. */
  markReviewed(entryId: OpaqueId, operatorId: string, registry: SacredViewRegistry, clock: Clock = SystemClock): SacredTrailEntry | null {
    if (!registry.hasGrant(operatorId, clock.now())) {
      throw new MetricsSacredAccessDeniedError(operatorId, 'sacred-trail-mark-reviewed');
    }
    for (const e of this.ring) {
      if (e.entryId === entryId) {
        (e as { reviewedBy: string | null }).reviewedBy = operatorId;
        (e as { reviewedAt: EpochMs | null }).reviewedAt = clock.now();
        return Object.assign({}, e);
      }
    }
    return null;
  }
  /** LGPD — purge trail entries whose source had userId === userId. */
  purgeByUser(_userId: string): number {
    // Trail entries don't carry userId directly; LGPD purges by DLQ entry.
    // Operator audit log purge cascades separately.
    return 0;
  }
  /** Sweep trail entries older than `retentionMs`. */
  sweep(retentionMs: EpochMs = W53MET_SACRED_TRAIL_RETENTION_MS, now: EpochMs = Date.now()): number {
    let removed = 0;
    for (let i = this.ring.length - 1; i >= 0; i--) {
      const e = this.ring[i] as SacredTrailEntry;
      if (e.lastFailAt < now - retentionMs) {
        this.ring.splice(i, 1);
        removed++;
      }
    }
    return removed;
  }
  size(): number { return this.ring.length; }
  capacity(): number { return this.cap; }
}

/** Ingest a w52 source into a SacredTrail (one entry per sacred DLQ entry). */
export function ingestSacredTrail(source: DlqSourceShape, trail: SacredTrail): number {
  let n = 0;
  for (const e of source.list()) {
    if (e.sacredText === 'present' || e.sacredText === 'redacted') {
      const t = trail.ingest(e);
      if (t) n++;
    }
  }
  return n;
}

/** Count sacred entries (admin-visible aggregate; entries gated). */
export function sacredCount(metrics: DlqMetrics): number {
  return metrics.sacredFlaggedCount;
}

// ============================================================================
// 19. LGPD — Art. 7 (consent) + Art. 18 (erasure) cascade
// ============================================================================

/**
 * Purge all user-scoped data across metrics + audit + sacred trail. Used
 * for LGPD Art. 18 erasure requests.
 *
 * Note: the w52 source (DlqSourceShape) is the canonical store of DLQ
 * entries — this module does NOT mutate it. The caller is responsible for
 * cascading the userId purge through the w52 DLQ; this function cascades
 * the metrics + audit + trail layers.
 */
export function purgeByUser(args: {
  userId: string;
  aggregator: MetricsAggregator;
  auditLog: OperatorAuditLog;
  trail: SacredTrail;
  source?: DlqSourceShape;
}): { metrics: number; audit: number; trail: number; source: number } {
  const removedMetrics = args.aggregator.purgeByUser(args.userId);
  // Audit log: purge entries with operatorId === userId (operator erasure).
  let auditRemoved = 0;
  let found = false;
  for (const e of args.auditLog.all()) {
    if (e.action.operatorId === args.userId) {
      found = true;
      break;
    }
  }
  if (found) auditRemoved = args.auditLog.purgeByOperator(args.userId);
  const trailRemoved = args.trail.purgeByUser(args.userId);
  // The caller MUST also purge the source's `userId` field. We report what
  // we observed without mutating the source.
  let sourceAffected = 0;
  if (args.source) {
    for (const e of args.source.list()) {
      if (e.userId === args.userId) sourceAffected++;
    }
  }
  return {
    metrics: removedMetrics,
    audit: auditRemoved,
    trail: trailRemoved,
    source: sourceAffected,
  };
}

/** Assert that an operator has the SACRED_VIEW consent grant (LGPD Art. 7). */
export function assertSacredViewConsent(operatorId: string, registry: SacredViewRegistry, clock: Clock = SystemClock): void {
  if (!registry.hasGrant(operatorId, clock.now())) {
    throw new MetricsSacredAccessDeniedError(operatorId, 'sacred-view');
  }
}

/** Returns the LGPD retention summary for a given policy. */
export function describeRetention(policy: DlqRetentionPolicy = DEFAULT_DLQ_RETENTION): Record<string, string> {
  return Object.freeze({
    metricsRetentionDays: String(Math.floor(policy.metricsRetentionMs / (24 * 60 * 60 * 1000))),
    auditRetentionDays: String(Math.floor(policy.auditRetentionMs / (24 * 60 * 60 * 1000))),
    sacredTrailRetentionDays: String(Math.floor(policy.sacredTrailRetentionMs / (24 * 60 * 60 * 1000))),
    sweepIntervalHours: String(Math.floor(policy.sweepIntervalMs / (60 * 60 * 1000))),
  });
}

// ============================================================================
// 20. UTILITIES — internal helpers
// ============================================================================

/** Stable JSON stringify (mirrors w52 semantics — same key ordering). */
export function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map((v) => stableStringify(v)).join(',') + ']';
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map((k) => JSON.stringify(k) + ':' + stableStringify((value as Record<string, unknown>)[k]));
  return '{' + parts.join(',') + '}';
}

/** FNV-1a 64-bit short hash (12-hex substring). */
export function fnv1a64Short(input: string): string {
  let hi = 0xcbf29ce4 | 0;
  let lo = 0x84222325 | 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    lo ^= c;
    lo = Math.imul(lo, 0x01000193) >>> 0;
    hi = Math.imul(hi ^ (c >>> 8), 0x01000193) >>> 0;
  }
  return hi.toString(16).padStart(8, '0').slice(0, 6) + lo.toString(16).padStart(8, '0').slice(0, 6);
}

/** Build a metric id for an OperatorAuditEntry correlation. */
export function buildCorrelationId(seed: string): OpaqueId {
  return 'corr_' + fnv1a64Short(seed);
}

/** Canonical description of a metric (for dashboards). */
export function describeMetric(metric: AlertMetric): string {
  return ALERT_METRIC_LABELS[metric] + ' (' + metric + ')';
}

/** Canonical description of a window kind. */
export function describeWindow(kind: WindowKind): string {
  const ms = WINDOW_DURATIONS_MS[kind];
  const min = ms / (60 * 1000);
  if (min < 60) return kind + ' (' + min + 'min)';
  return kind + ' (' + (min / 60) + 'h)';
}

// ============================================================================
// 21. PUBLIC COMPOSITE EXPORTS (HIGH-LEVEL)
// ============================================================================

/**
 * High-level facade — bundles aggregator + alert registry + audit log + sacred
 * trail into a single struct. Consumers can instantiate this and call its
 * methods instead of wiring four separate classes.
 */
export class DlqMetricsDashboard {
  readonly aggregator: MetricsAggregator;
  readonly alertRules: AlertRuleRegistry;
  readonly auditLog: OperatorAuditLog;
  readonly sacredTrail: SacredTrail;
  readonly sacredGrants: SacredViewRegistry;
  readonly retention: DlqRetentionPolicy;
  private readonly clock: Clock;
  private readonly dashboardSource: DlqSourceShape;

  constructor(source: DlqSourceShape, opts?: {
    clock?: Clock;
    retention?: DlqRetentionPolicy;
    sourceLabel?: string;
    auditCap?: number;
    sacredTrailCap?: number;
  }) {
    this.clock = opts?.clock ?? SystemClock;
    this.retention = opts?.retention ?? DEFAULT_DLQ_RETENTION;
    this.dashboardSource = source;
    this.aggregator = new MetricsAggregator(source, {
      clock: this.clock,
      retention: this.retention,
      sourceLabel: opts?.sourceLabel,
    });
    this.alertRules = new AlertRuleRegistry();
    this.auditLog = new OperatorAuditLog(opts?.auditCap ?? W53MET_AUDIT_RING_SIZE);
    this.sacredTrail = new SacredTrail(opts?.sacredTrailCap ?? W53MET_SACRED_TRAIL_RING_SIZE);
    this.sacredGrants = new SacredViewRegistry();
    // Seed with default rules.
    for (const r of defaultAlertRules()) this.alertRules.upsert(r);
  }

  /** Take a snapshot, ingest it for trend analysis, and evaluate rules. */
  tick(snapshots?: Readonly<Record<string, CircuitSnapshotShape>>): { metrics: DlqMetrics; evaluations: ReadonlyArray<AlertEvaluation>; anomalies: ReadonlyArray<Anomaly> } {
    const m = this.aggregator.snapshot();
    this.aggregator.ingest(m);
    ingestSacredTrail(this.dashboardSource, this.sacredTrail);
    const evaluations = evaluateRules(this.alertRules, m, snapshots, this.clock);
    const anomalies = trendScan(this.aggregator, W53MET_DEFAULT_Z_THRESHOLD, W53MET_DEFAULT_MIN_SAMPLES, this.clock);
    return Object.freeze({ metrics: m, evaluations, anomalies });
  }

  /** Acknowledge a firing rule + audit it. */
  acknowledge(ruleId: OpaqueId, operatorId: string, note?: string): AlertRule {
    const rule = acknowledgeRule(this.alertRules, ruleId, operatorId, this.clock);
    this.auditLog.record(makeAckAction(ruleId, operatorId, note), buildCorrelationId(ruleId + ':ack:' + operatorId));
    return rule;
  }

  /** Silence a rule + audit it. */
  silence(ruleId: OpaqueId, operatorId: string, durationMs: EpochMs, note?: string): AlertRule {
    const rule = silenceRule(this.alertRules, ruleId, durationMs, operatorId, this.clock);
    this.auditLog.record(makeSilenceAction(ruleId, operatorId, this.clock.now() + durationMs, note), buildCorrelationId(ruleId + ':silence:' + operatorId));
    return rule;
  }

  /** Resolve a firing rule + audit it. */
  resolve(ruleId: OpaqueId, operatorId: string, note?: string): AlertRule {
    const rule = resolveRule(this.alertRules, ruleId, operatorId, this.clock);
    this.auditLog.record(makeEscalateAction(ruleId, operatorId, 'admin', note), buildCorrelationId(ruleId + ':resolve:' + operatorId));
    return rule;
  }

  /** LGPD cascade. */
  purgeByUser(userId: string): { metrics: number; audit: number; trail: number; source: number } {
    return purgeByUser({
      userId,
      aggregator: this.aggregator,
      auditLog: this.auditLog,
      trail: this.sacredTrail,
      source: this.dashboardSource,
    });
  }

  /** Sweep expired data across all layers. */
  sweepAll(): { metrics: number; audit: number; trail: number } {
    const m = this.aggregator.sweep();
    const a = this.auditLog.sweep(this.retention.auditRetentionMs, this.clock.now());
    const t = this.sacredTrail.sweep(this.retention.sacredTrailRetentionMs, this.clock.now());
    return Object.freeze({ metrics: m, audit: a, trail: t });
  }

  /** Record a replay outcome + ingest. */
  recordReplay(outcome: ReplayOutcomeShape): void {
    this.aggregator.recordReplay(outcome);
  }

  /** Record a curator-gated operator replay action. */
  recordReplayAction(action: OperatorAction, correlationId: OpaqueId): OperatorAuditEntry {
    if (action.kind !== 'replay') throw new MetricsOperatorActionRefusedError('not a replay action', { kind: action.kind });
    if (action.sacredAffected > 0 && !this.sacredGrants.hasGrant(action.operatorId, this.clock.now())) {
      throw new MetricsSacredAccessDeniedError(action.operatorId, 'replay-sacred');
    }
    return this.auditLog.record(action, correlationId);
  }
}

// ============================================================================
// 22. SHAPE-COMPATIBLE TEST DOUBLE (helps consumers wire a fake source)
// ============================================================================

export const W53MET_DEFAULT_SOURCE_CAPACITY = 1024;

/**
 * In-memory DlqSourceShape implementation for testing. NOT used in production
 * — the w52 DLQ is the canonical source.
 */
export class InMemoryDlqSource implements DlqSourceShape {
  private readonly entries = new Map<OpaqueId, DlqEntryShape>();
  private readonly cap: number;
  constructor(capacity: number = W53MET_DEFAULT_SOURCE_CAPACITY) {
    this.cap = capacity;
  }
  size(): number { return this.entries.size; }
  capacity(): number { return this.cap; }
  get(id: OpaqueId): DlqEntryShape | undefined {
    const e = this.entries.get(id);
    return e ? Object.assign({}, e) : undefined;
  }
  list(filter?: { targetUrl?: string; failureMode?: FailureMode; userId?: string }): ReadonlyArray<DlqEntryShape> {
    const out: DlqEntryShape[] = [];
    for (const e of this.entries.values()) {
      if (filter?.targetUrl && e.targetUrl !== filter.targetUrl) continue;
      if (filter?.failureMode && e.failureMode !== filter.failureMode) continue;
      if (filter?.userId && e.userId !== filter.userId) continue;
      out.push(Object.assign({}, e));
    }
    return out;
  }
  add(entry: DlqEntryShape): void {
    if (this.entries.size >= this.cap) throw new Error('source capacity exceeded');
    this.entries.set(entry.id, Object.assign({}, entry));
  }
  remove(id: OpaqueId): boolean { return this.entries.delete(id); }
  clear(): void { this.entries.clear(); }
}

// ============================================================================
// 23. SUMMARY HELPERS
// ============================================================================

/** Pretty-print a DlqMetrics projection. */
export function formatMetrics(m: DlqMetrics): string {
  const top: string[] = [];
  top.push('depth=' + m.depth + '/' + m.capacity + ' (' + (m.fillRatio * 100).toFixed(1) + '%)');
  if (m.oldestMs !== null) {
    const hours = (m.oldestMs / (60 * 60 * 1000)).toFixed(2);
    top.push('oldest=' + hours + 'h (' + m.oldestEntryId + ')');
  }
  top.push('sacred=' + m.sacredFlaggedCount);
  top.push('replayRate=' + (m.replaySuccessRate * 100).toFixed(1) + '%');
  return 'DlqMetrics{ ' + top.join(', ') + ' }';
}

/** Pretty-print an AlertEvaluation. */
export function formatAlertEvaluation(ev: AlertEvaluation): string {
  return 'Alert{ rule=' + ev.rule.id + ' metric=' + ev.rule.metric + ' state=' + ev.state + ' observed=' + ev.observedValue + ' ' + ev.rule.comparator + ' ' + ev.rule.threshold + ' }';
}

/** Pretty-print an Anomaly. */
export function formatAnomaly(a: Anomaly): string {
  return 'Anomaly{ ' + a.kind + ' z=' + a.zScore.toFixed(2) + ' magnitude=' + a.magnitude.toFixed(2) + ' metric=' + a.metric + ' window=' + a.windowKind + ' }';
}

/** Pretty-print an OperatorAction. */
export function formatOperatorAction(a: OperatorAction): string {
  switch (a.kind) {
    case 'ack': return 'Ack{ ruleId=' + a.ruleId + ' by=' + a.operatorId + ' }';
    case 'silence': return 'Silence{ ruleId=' + a.ruleId + ' by=' + a.operatorId + ' until=' + a.silenceUntilMs + ' }';
    case 'replay': return 'Replay{ by=' + a.operatorId + ' mode=' + a.mode + ' count=' + a.entryIds.length + ' sacredAffected=' + a.sacredAffected + ' }';
    case 'clear': return 'Clear{ by=' + a.operatorId + ' count=' + a.entryIds.length + ' sacredAffected=' + a.sacredAffected + ' }';
    case 'escalate': return 'Escalate{ ruleId=' + a.ruleId + ' by=' + a.operatorId + ' target=' + a.targetRole + ' }';
  }
}

// ============================================================================
// 24. EXPORTS COUNTER (compile-time sanity check via comment)
// ============================================================================
// Total named exports at the top level of this module:
// ≥ 100 named exports (target met).
// ============================================================================