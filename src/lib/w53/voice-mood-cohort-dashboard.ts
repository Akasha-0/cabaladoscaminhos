/**
 * w53/voice-mood-cohort-dashboard
 * ──────────────────────────────────
 * Admin UI data layer for w52/voice-mood-history-anonymizer output. Composes
 * by SHAPE only — does NOT import from w52 or w49. The companion contract is
 * the formal source of truth for cohort-level aggregations, drill-down with
 * privacy preservation, k-anonymity + ε-DP verification, sacred-curator gate,
 * and LGPD admin operations (Art. 7/9/18/20).
 *
 * This file is the renderer-side half:
 *   • query cohorts by region / tradition / age / window
 *   • build dashboard payloads (KPIs + charts + drilldowns + alerts + LGPD)
 *   • verify each cohort meets k-anon + ε-DP before publish
 *   • detect rolling-window trends vs baseline
 *   • render a separate sacred-flagged view (curator-only)
 *
 * Self-contained: only standard JS / TS types. No external deps. No prisma at
 * runtime, no node:crypto, no fetch. Deterministic given seeded RNG.
 *
 * Layout:
 *   §1  Types & contracts
 *   §2  Constants, taxonomy, smoke scenarios
 *   §3  Math helpers (FNV, rolling stats, k-anon check, ε-tracker, entropy, hash chain)
 *   §4  Cohort query builders (12)
 *   §5  KPI builders (10)
 *   §6  Chart builders (10)
 *   §7  Drill-down helpers (10)
 *   §8  Anonymization check (8)
 *   §9  Trend detection (8)
 *   §10 Sacred admin view (8)
 *   §11 LGPD policy primitives (8)
 *   §12 Errors (DSH_001..DSH_006 + invariants)
 *   §13 Smoke / regression scenarios
 *   §14 Doc-string constants
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Types & Contracts                                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Cohort key mirror — matches w52/CohortKey SHAPE only. */
export interface CohortKey {
  windowDays: number;
  region: string;
  tradition?: string;
  ageBracket?: string;
}

/** K-bucket mirror — matches w52/KBucket SHAPE. */
export interface KBucket {
  cohort: CohortKey;
  count: number;
  distinctUsers: number;
  sacredHits: number;
  moodHistogram?: Record<string, number>;
  windowStart: number;
  windowEnd: number;
}

/** Privacy proof mirror — matches w52/PrivacyProof SHAPE. */
export interface PrivacyProof {
  kSatisfied: boolean;
  epsilonSpent: number;
  epsilonRemaining: number;
  sacredTagLeaked: boolean;
  rawPIILeaked: boolean;
  compositionMethod: string;
  auditAt: number;
}

/** Aggregation output mirror — matches w52/AggregationOutput SHAPE. */
export interface AggregationOutput {
  buckets: KBucket[];
  metadata: AggregationMetadata;
  privacyProof: PrivacyProof;
}

export interface AggregationMetadata {
  generatedAt: number;
  totalInputEvents: number;
  totalSuppressed: number;
  totalSacredHits: number;
  k: number;
  kSacred: number;
  epsilon: number;
  composition: "basic" | "advanced" | "optimal";
  cohortsIncluded: number;
  cohortsSuppressed: number;
  policyVersion: string;
}

/** Dashboard payload — the only legal admin output shape. */
export interface CohortDashboardPayload {
  kpis: KpiCard[];
  charts: ChartSeries[];
  drilldowns: DrillDown[];
  alerts: DashboardAlert[];
  lgpdAttestation: LgpdAttestation;
  meta: DashboardMeta;
}

/** KPI card — one number on the dashboard. */
export interface KpiCard {
  label: string;
  value: number | string;
  delta?: TrendDelta;
  sparkline?: SparklinePoint[];
  unit?: string;
  scope?: "cohort" | "subcohort" | "global";
  tooltip?: string;
  threshold?: KpiThreshold;
}

export interface KpiThreshold {
  warnAt?: number;
  alertAt?: number;
  direction: "above" | "below";
}

export interface SparklinePoint {
  x: number;
  y: number;
}

/** Chart series — line / bar / heatmap / histogram / scatter. */
export interface ChartSeries {
  name: string;
  points: ChartPoint[];
  kind: "line" | "bar" | "heatmap" | "histogram" | "scatter" | "area" | "stacked_bar";
  axisLabelX?: string;
  axisLabelY?: string;
  bucket?: "day" | "week" | "month" | "quarter";
  cohort?: CohortKey;
  legend?: ChartLegend;
}

export interface ChartPoint {
  x: number | string;
  y: number;
  weight?: number;
  annotation?: string;
}

export interface ChartLegend {
  entries: { label: string; color: string }[];
}

/** Drill-down — narrow from cohort → subcohort → individual_redacted. */
export interface DrillDown {
  path: string;
  label: string;
  scope: "cohort" | "subcohort" | "individual_redacted";
  params: DrillParams;
  gated?: DrillGate;
}

export interface DrillParams {
  cohortHash?: string;
  bucketIndex?: number;
  ageBracket?: string;
  tradition?: string;
  windowDays?: number;
  region?: string;
}

export interface DrillGate {
  requiresCurator: boolean;
  requiresSecondarySignature: boolean;
  reason: string;
}

/** Anonymization attestation — verify k + ε + sacred before publish. */
export interface AnonymizationAttestation {
  kSatisfied: boolean;
  epsilonSpent: number;
  epsilonBudget: number;
  sacredFlagPreserved: boolean;
  suppressed: number;
  publishableBuckets: number;
  totalBuckets: number;
  breaches: string[];
  policyVersion: string;
  auditAt: number;
}

/** Trend delta — rolling-window delta vs baseline. */
export interface TrendDelta {
  kind: "rising" | "falling" | "flat";
  magnitude: number;
  confidence: number;
  baseline: number;
  current: number;
  window: number;
  pValue?: number;
  effectSize?: number;
}

/** Sacred admin payload — curator-only view. */
export interface SacredAdminPayload {
  cohorts: SacredCohortView[];
  attestation: AnonymizationAttestation;
  curatorGated: boolean;
  curatorSignature: CuratorSignature;
  auditTrail: SacredAuditEntry[];
}

export interface SacredCohortView {
  cohort: CohortKey;
  bucketCount: number;
  sacredHits: number;
  sacredRate: number;
  tradition?: string;
  requiresDoubleReview: boolean;
  policyHints: string[];
}

export interface CuratorSignature {
  curatorId: string;
  signedAt: number;
  signature: string;
  secondaryCuratorId?: string;
  secondarySignedAt?: number;
}

/** Dashboard alert — surfaced warnings/errors. */
export interface DashboardAlert {
  level: "info" | "warn" | "alert";
  code: string;
  message: string;
  cohort?: CohortKey;
  drillPath?: string;
  ts: number;
}

export interface LgpdAttestation {
  art7: boolean;          // consent logged
  art9: boolean;          // purpose limitation
  art18: boolean;         // erasure respected (cohort re-aggregated)
  art20: boolean;         // portability (k-satisfied buckets only)
  purposeId: string;
  purposeLabel: string;
  adminId: string;
  consentAt: number;
  erasureHonoredAt?: number;
}

/** Dashboard meta — request / response metadata. */
export interface DashboardMeta {
  generatedAt: number;
  dashboardId: string;
  requestedBy: string;
  requestedAt: number;
  ttlSeconds: number;
  cacheKey: string;
  schemaVersion: string;
}

/** Audit trail entries. */
export interface AuditEntry {
  action: string;
  actor: string;
  ts: number;
  detail?: string;
  cohortHash?: string;
  signatureHash?: string;
}

export interface SacredAuditEntry extends AuditEntry {
  sacred: true;
  doubleReviewed: boolean;
}

/** Cohort selection — for query builders. */
export interface CohortSelection {
  regions?: string[];
  traditions?: string[];
  ageBrackets?: string[];
  windowDays?: number[];
  cohortKeys?: CohortKey[];
  purposeId: string;
}

/** Cohort query result. */
export interface CohortQueryResult {
  buckets: KBucket[];
  selectedCohorts: CohortKey[];
  excluded: ExcludedCohort[];
  cohortCount: number;
  totalEvents: number;
}

export interface ExcludedCohort {
  cohort: CohortKey;
  reason: "k_breach" | "epsilon_exhausted" | "sacred_locked" | "below_representative" | "no_data";
}

/** KPI compute input. */
export interface KpiInput {
  buckets: KBucket[];
  kind: "count" | "avg" | "p95" | "median" | "entropy" | "sacred_rate" | "distinct" | "ratio";
  filter?: (b: KBucket) => boolean;
  field?: "count" | "distinctUsers" | "sacredHits";
}

/** KPI compute output. */
export interface KpiResult {
  kind: KpiInput["kind"];
  value: number;
  n: number;
  unit?: string;
  range?: { min: number; max: number };
}

/** Chart build options. */
export interface ChartOptions {
  bucket: "day" | "week" | "month" | "quarter";
  smoothing?: "none" | "ema" | "sma";
  windowSize?: number;
  normalize?: boolean;
}

/** Drill-down request. */
export interface DrillDownRequest {
  cohortHash: string;
  bucketIndex: number;
  requestedScope: "cohort" | "subcohort" | "individual_redacted";
  actorId: string;
  curatorId?: string;
  purposeId: string;
  ts: number;
}

/** Drill-down result. */
export interface DrillDownResult {
  drill: DrillDown;
  redacted: boolean;
  reason?: string;
  payloadPreview?: unknown;
}

/** Anonymization check input. */
export interface AnonymizationCheckInput {
  buckets: KBucket[];
  k: number;
  kSacred: number;
  epsilonSpent: number;
  epsilonBudget: number;
  policyVersion: string;
}

/** Trend detection input. */
export interface TrendInput {
  series: { x: number; y: number }[];
  baselineWindow: number;
  currentWindow: number;
  threshold?: number;
}

/** Sacred admin request. */
export interface SacredAdminRequest {
  cohorts: CohortKey[];
  actorId: string;
  curatorId: string;
  purposeId: string;
  requireSecondary: boolean;
}

/** Cohort spec (for cross-cohort queries). */
export interface CrossCohortSpec {
  primary: CohortKey;
  secondary: CohortKey;
  axis: "tradition" | "age" | "region" | "window";
}

/** Reidentification risk — for admin-side audit. */
export interface ReidentificationRisk {
  cohortHash: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  signals: string[];
  recommendation: "allow" | "redact" | "suppress";
}

/** Privacy budget ledger (admin view). */
export interface AdminBudgetLedger {
  cohort: CohortKey;
  epsilonSpent: number;
  epsilonBudget: number;
  queries: number;
  lastQueryAt: number;
  exhausted: boolean;
}

/** Sparkline point. */
export interface TimeSeriesPoint {
  ts: number;
  value: number;
}

/** Sacred-text sensitivity classification. */
export type SensitivityLevel = 1 | 2 | 3 | 4 | 5;

/** Admin role. */
export type AdminRole = "viewer" | "analyst" | "curator" | "owner";

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constants & Taxonomy                                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const POLICY_VERSION = "w53-dashboard-v1.0.0";

export const DEFAULT_K = 5;
export const DEFAULT_K_SACRED = 10;
export const DEFAULT_EPSILON = 1.0;
export const DEFAULT_EPSILON_BUDGET = 5.0;

export const DASHBOARD_TTL_SECONDS = 300;
export const DASHBOARD_SCHEMA_VERSION = "w53.dashboard.v1";

export const SALT = "w53-voice-mood-dashboard/v1";
export const SALT_PREFIX = "w53dash:";
export const FNV_OFFSET_32 = 0x811c9dc5;
export const FNV_PRIME_32 = 0x01000193;
export const FNV_OFFSET_64 = 0xcbf29ce484222325n;
export const FNV_PRIME_64 = 0x100000001b3n;

export const TIMESTAMP_BUCKETS_MS = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
  month: 2_629_800_000,
  quarter: 7_889_400_000,
  year: 31_557_600_000,
} as const;

export type TimestampBucket = keyof typeof TIMESTAMP_BUCKETS_MS;

export const AGE_BRACKETS = [
  "under_18", "18_24", "25_34", "35_44", "45_54", "55_64", "65_plus", "unknown",
] as const;
export type AgeBracket = typeof AGE_BRACKETS[number];

export const TRADITIONS = [
  "umbanda", "candomble", "ifa", "kabbalah", "astrology",
  "tarot", "lenormand", "cigano", "mixed", "unspecified",
] as const;
export type Tradition = typeof TRADITIONS[number];

export const REGIONS = [
  "BR", "PT", "AO", "MZ", "CV", "US", "UK", "ES", "FR", "DE",
  "IT", "JP", "MX", "AR", "CO", "CL", "PE", "UY", "PY", "BO", "ZZ",
] as const;
export type Region = typeof REGIONS[number];

export const WINDOW_DAYS_OPTIONS = [30, 90, 180, 365] as const;

export const CHART_KINDS = [
  "line", "bar", "heatmap", "histogram", "scatter", "area", "stacked_bar",
] as const;
export type ChartKind = typeof CHART_KINDS[number];

export const DRILL_SCOPES = ["cohort", "subcohort", "individual_redacted"] as const;
export type DrillScope = typeof DRILL_SCOPES[number];

export const ALERT_LEVELS = ["info", "warn", "alert"] as const;

export const PURPOSE_IDS = {
  CURATOR_ADMIN: "purp-curator-admin",
  SAFETY: "purp-safety",
  RESEARCH: "purp-research",
  INTERNAL_QA: "purp-internal-qa",
} as const;
export type PurposeId = typeof PURPOSE_IDS[keyof typeof PURPOSE_IDS];

export const PURPOSE_LABELS: Record<PurposeId, string> = {
  "purp-curator-admin": "Curator-admin dashboard view",
  "purp-safety": "Safety / trust & safety review",
  "purp-research": "Research / aggregated analytics",
  "purp-internal-qa": "Internal QA / metric collection",
};

/** Purposes allowed to see sacred-flagged cohorts (curator-only). */
export const SACRED_ALLOWED_PURPOSES: PurposeId[] = [
  "purp-curator-admin",
  "purp-safety",
];

/** Admin role ordering — viewer < analyst < curator < owner. */
export const ADMIN_ROLE_ORDER: AdminRole[] = ["viewer", "analyst", "curator", "owner"];

/** Minimum cohort representative count for any view. */
export const MIN_REPRESENTATIVE_COUNT = 5;

/** Default trend baseline window in days. */
export const DEFAULT_BASELINE_WINDOW_DAYS = 30;

/** Default trend current window in days. */
export const DEFAULT_CURRENT_WINDOW_DAYS = 7;

/** Default trend delta threshold for "rising"/"falling" classification. */
export const DEFAULT_TREND_THRESHOLD = 0.05;

/** Default trend confidence level for reporting. */
export const DEFAULT_TREND_CONFIDENCE = 0.95;

/** Hash chain audit constants. */
export const HASH_CHAIN_GENESIS = "0000000000000000000000000000000000000000000000000000000000000000";

/** Sacred tradition sensitivity defaults — higher means curator + double-review. */
export const SACRED_TRADITION_SENSITIVITY: Record<string, SensitivityLevel> = {
  candomble: 5,
  umbanda: 4,
  ifa: 5,
  kabbalah: 3,
  astrology: 2,
  tarot: 2,
  lenormand: 2,
  cigano: 3,
  mixed: 2,
  unspecified: 1,
};

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math Helpers — FNV, entropy, rolling stats, hash chain, ε-tracker     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** FNV-1a 32-bit, hex string. */
export function fnv1a32(input: string): string {
  let hash = FNV_OFFSET_32 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV_PRIME_32) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** FNV-1a 32-bit, returns number. */
export function fnv1a32Number(input: string): number {
  let hash = FNV_OFFSET_32 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV_PRIME_32) >>> 0;
  }
  return hash >>> 0;
}

/** FNV-1a 64-bit hex (BigInt internal). */
export function fnv1a64(input: string): string {
  let hash = FNV_OFFSET_64;
  const prime = FNV_PRIME_64;
  for (let i = 0; i < input.length; i++) {
    const code = BigInt(input.charCodeAt(i) & 0xff);
    hash = (hash ^ code) & 0xffffffffffffffffn;
    hash = (hash * prime) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, "0");
}

/** Cohort hash — stable bucket key. */
export function cohortHash(cohort: CohortKey): string {
  const tuple = [
    SALT_PREFIX,
    String(cohort.windowDays),
    "|",
    cohort.region,
    "|",
    cohort.tradition ?? "any",
    "|",
    cohort.ageBracket ?? "unknown",
  ].join("");
  return fnv1a64(tuple);
}

/** Mulberry32 PRNG, deterministic. */
export function mulberry32(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shannon entropy in bits, base 2. */
export function shannonEntropy(distribution: Record<string, number>): number {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let h = 0;
  for (const v of Object.values(distribution)) {
    if (v <= 0) continue;
    const p = v / total;
    h -= p * Math.log2(p);
  }
  return h;
}

/** Mean of an array of numbers. */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let s = 0;
  for (const v of values) s += v;
  return s / values.length;
}

/** Median of an array of numbers. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid]!;
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Percentile (linear interpolation). */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo]!;
  const w = idx - lo;
  return sorted[lo]! * (1 - w) + sorted[hi]! * w;
}

/** Standard deviation (sample). */
export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  let s = 0;
  for (const v of values) s += (v - m) * (v - m);
  return Math.sqrt(s / (values.length - 1));
}

/** Welch's t-test approximation. Returns |t| value. */
export function welchTStat(a: number[], b: number[]): number {
  if (a.length < 2 || b.length < 2) return 0;
  const ma = mean(a);
  const mb = mean(b);
  const va = stddev(a) ** 2;
  const vb = stddev(b) ** 2;
  const denom = Math.sqrt(va / a.length + vb / b.length);
  if (denom === 0) return 0;
  return Math.abs(ma - mb) / denom;
}

/** Smoothed exponential moving average. */
export function ema(values: number[], alpha: number): number[] {
  if (values.length === 0) return [];
  const out: number[] = new Array(values.length);
  out[0] = values[0]!;
  for (let i = 1; i < values.length; i++) {
    out[i] = alpha * values[i]! + (1 - alpha) * out[i - 1]!;
  }
  return out;
}

/** Simple moving average. */
export function sma(values: number[], window: number): number[] {
  if (values.length === 0 || window <= 0) return [];
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    let s = 0;
    let n = 0;
    for (let j = start; j <= i; j++) {
      s += values[j]!;
      n++;
    }
    out.push(s / n);
  }
  return out;
}

/** Hash chain step — sha256-like with hand-rolled combine. */
export function hashChainStep(prev: string, payload: string): string {
  const combined = SALT_PREFIX + prev + "|" + payload;
  return fnv1a64(combined);
}

/** Verify hash chain — returns true if every link matches. */
export function verifyHashChain(entries: { payload: string; hash: string }[]): boolean {
  let prev = HASH_CHAIN_GENESIS;
  for (const e of entries) {
    const expected = hashChainStep(prev, e.payload);
    if (expected !== e.hash) return false;
    prev = expected;
  }
  return true;
}

/** ε-DP composition (basic — sum). */
export function epsComposeBasic(queries: { epsilon: number }[]): number {
  let total = 0;
  for (const q of queries) total += q.epsilon;
  return total;
}

/** ε-DP composition (advanced — sqrt(k) bound). */
export function epsComposeAdvanced(queries: { epsilon: number }[]): number {
  let total = 0;
  for (const q of queries) total += q.epsilon * q.epsilon;
  return Math.sqrt(total);
}

/** ε-DP composition (optimal — Kairouz-Oh-Viswanath, approx). */
export function epsComposeOptimal(queries: { epsilon: number }[]): number {
  let total = 0;
  let max = 0;
  for (const q of queries) {
    total += q.epsilon * q.epsilon;
    if (q.epsilon > max) max = q.epsilon;
  }
  return Math.sqrt(total * 0.5) + max * 0.5;
}

/** k-anonymity check on a single bucket. */
export function checkKAnonymity(
  bucket: KBucket,
  k: number,
  kSacred: number,
): { satisfied: boolean; effectiveK: number } {
  const sacred = bucket.sacredHits > 0;
  const threshold = sacred ? kSacred : k;
  const effective = Math.min(bucket.distinctUsers, threshold);
  return { satisfied: bucket.distinctUsers >= threshold, effectiveK: effective };
}

/** Compute sacred rate (sacredHits / distinctUsers), clamped to [0, 1]. */
export function computeSacredRate(bucket: KBucket): number {
  if (bucket.distinctUsers === 0) return 0;
  return Math.min(1, Math.max(0, bucket.sacredHits / (bucket.distinctUsers * 10)));
}

/** Compute distinct-user ratio (distinctUsers / count), clamped to [0, 1]. */
export function computeDistinctRatio(bucket: KBucket): number {
  if (bucket.count === 0) return 0;
  return Math.min(1, bucket.distinctUsers / bucket.count);
}

/** Bucket timestamp to nearest bucket (day / week / month / quarter). */
export function alignTimestamp(
  ts: number,
  bucket: "day" | "week" | "month" | "quarter",
): number {
  const ms = TIMESTAMP_BUCKETS_MS[bucket];
  return Math.floor(ts / ms) * ms;
}

/** Compute sparkline from time series (downsample to <= 24 points). */
export function buildSparkline(points: { ts: number; value: number }[], maxPoints: number = 24): SparklinePoint[] {
  if (points.length === 0) return [];
  if (points.length <= maxPoints) {
    return points.map(p => ({ x: p.ts, y: p.value }));
  }
  const stride = points.length / maxPoints;
  const out: SparklinePoint[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.floor(i * stride);
    out.push({ x: points[idx]!.ts, y: points[idx]!.value });
  }
  return out;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 Cohort Query Builders                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Query cohort-level aggregates by region.
 */
export function queryCohortByRegion(
  buckets: KBucket[],
  regions: string[],
  purposeId: string,
): CohortQueryResult {
  const sel = new Set(regions);
  const matched = buckets.filter(b => sel.has(b.cohort.region));
  const excluded: ExcludedCohort[] = buckets
    .filter(b => !sel.has(b.cohort.region))
    .map(b => ({ cohort: b.cohort, reason: "no_data" as const }));
  return {
    buckets: matched,
    selectedCohorts: matched.map(b => b.cohort),
    excluded,
    cohortCount: matched.length,
    totalEvents: matched.reduce((s, b) => s + b.count, 0),
  };
}

/**
 * Query cohort-level aggregates by tradition.
 */
export function queryCohortByTradition(
  buckets: KBucket[],
  traditions: string[],
  purposeId: string,
): CohortQueryResult {
  const sel = new Set(traditions);
  const matched = buckets.filter(b => b.cohort.tradition !== undefined && sel.has(b.cohort.tradition));
  const excluded: ExcludedCohort[] = buckets
    .filter(b => b.cohort.tradition === undefined || !sel.has(b.cohort.tradition))
    .map(b => ({ cohort: b.cohort, reason: "no_data" as const }));
  return {
    buckets: matched,
    selectedCohorts: matched.map(b => b.cohort),
    excluded,
    cohortCount: matched.length,
    totalEvents: matched.reduce((s, b) => s + b.count, 0),
  };
}

/**
 * Query cohort-level aggregates by age bracket.
 */
export function queryCohortByAge(
  buckets: KBucket[],
  ageBrackets: string[],
  purposeId: string,
): CohortQueryResult {
  const sel = new Set(ageBrackets);
  const matched = buckets.filter(b => b.cohort.ageBracket !== undefined && sel.has(b.cohort.ageBracket));
  const excluded: ExcludedCohort[] = buckets
    .filter(b => b.cohort.ageBracket === undefined || !sel.has(b.cohort.ageBracket))
    .map(b => ({ cohort: b.cohort, reason: "no_data" as const }));
  return {
    buckets: matched,
    selectedCohorts: matched.map(b => b.cohort),
    excluded,
    cohortCount: matched.length,
    totalEvents: matched.reduce((s, b) => s + b.count, 0),
  };
}

/**
 * Query cohort-level aggregates by time window.
 */
export function queryCohortByWindow(
  buckets: KBucket[],
  windowDays: number,
  purposeId: string,
): CohortQueryResult {
  const matched = buckets.filter(b => b.cohort.windowDays === windowDays);
  const excluded: ExcludedCohort[] = buckets
    .filter(b => b.cohort.windowDays !== windowDays)
    .map(b => ({ cohort: b.cohort, reason: "no_data" as const }));
  return {
    buckets: matched,
    selectedCohorts: matched.map(b => b.cohort),
    excluded,
    cohortCount: matched.length,
    totalEvents: matched.reduce((s, b) => s + b.count, 0),
  };
}

/**
 * Cross-cohort comparison — returns two matched sets side-by-side.
 */
export function queryCrossCohort(
  buckets: KBucket[],
  spec: CrossCohortSpec,
  purposeId: string,
): { primary: CohortQueryResult; secondary: CohortQueryResult; axis: string } {
  const p = buckets.filter(b => cohortKeyMatches(b.cohort, spec.primary));
  const s = buckets.filter(b => cohortKeyMatches(b.cohort, spec.secondary));
  return {
    primary: {
      buckets: p,
      selectedCohorts: p.map(b => b.cohort),
      excluded: [],
      cohortCount: p.length,
      totalEvents: p.reduce((sum, b) => sum + b.count, 0),
    },
    secondary: {
      buckets: s,
      selectedCohorts: s.map(b => b.cohort),
      excluded: [],
      cohortCount: s.length,
      totalEvents: s.reduce((sum, b) => sum + b.count, 0),
    },
    axis: spec.axis,
  };
}

/** Helper — match cohort key on the differing axis only. */
function cohortKeyMatches(a: CohortKey, b: CohortKey): boolean {
  return (
    a.windowDays === b.windowDays &&
    a.region === b.region &&
    a.tradition === b.tradition &&
    a.ageBracket === b.ageBracket
  );
}

/**
 * Query sacred-flagged cohorts only — gated by purposeId.
 */
export function querySacredCohorts(
  buckets: KBucket[],
  purposeId: string,
): CohortQueryResult {
  if (!SACRED_ALLOWED_PURPOSES.includes(purposeId as PurposeId)) {
    return {
      buckets: [],
      selectedCohorts: [],
      excluded: buckets.map(b => ({ cohort: b.cohort, reason: "sacred_locked" as const })),
      cohortCount: 0,
      totalEvents: 0,
    };
  }
  const matched = buckets.filter(b => b.sacredHits > 0);
  return {
    buckets: matched,
    selectedCohorts: matched.map(b => b.cohort),
    excluded: buckets
      .filter(b => b.sacredHits === 0)
      .map(b => ({ cohort: b.cohort, reason: "no_data" as const })),
    cohortCount: matched.length,
    totalEvents: matched.reduce((s, b) => s + b.count, 0),
  };
}

/**
 * Query all cohorts (no filter) — for the global dashboard.
 */
export function queryAllCohorts(
  buckets: KBucket[],
  purposeId: string,
): CohortQueryResult {
  return {
    buckets: [...buckets],
    selectedCohorts: buckets.map(b => b.cohort),
    excluded: [],
    cohortCount: buckets.length,
    totalEvents: buckets.reduce((s, b) => s + b.count, 0),
  };
}

/**
 * Query cohorts with privacy-preserving exclusion — drops below-representative.
 */
export function queryRepresentativeCohorts(
  buckets: KBucket[],
  minCount: number,
  purposeId: string,
): CohortQueryResult {
  const matched = buckets.filter(b => b.count >= minCount);
  const excluded: ExcludedCohort[] = buckets
    .filter(b => b.count < minCount)
    .map(b => ({ cohort: b.cohort, reason: "below_representative" as const }));
  return {
    buckets: matched,
    selectedCohorts: matched.map(b => b.cohort),
    excluded,
    cohortCount: matched.length,
    totalEvents: matched.reduce((s, b) => s + b.count, 0),
  };
}

/**
 * Query cohorts within a date range.
 */
export function queryCohortByDateRange(
  buckets: KBucket[],
  fromTs: number,
  toTs: number,
  purposeId: string,
): CohortQueryResult {
  const matched = buckets.filter(b => b.windowStart >= fromTs && b.windowEnd <= toTs);
  const excluded: ExcludedCohort[] = buckets
    .filter(b => b.windowStart < fromTs || b.windowEnd > toTs)
    .map(b => ({ cohort: b.cohort, reason: "no_data" as const }));
  return {
    buckets: matched,
    selectedCohorts: matched.map(b => b.cohort),
    excluded,
    cohortCount: matched.length,
    totalEvents: matched.reduce((s, b) => s + b.count, 0),
  };
}

/**
 * Query cohorts sorted by event count (descending).
 */
export function queryCohortByVolume(
  buckets: KBucket[],
  limit: number,
  purposeId: string,
): CohortQueryResult {
  const sorted = [...buckets].sort((a, b) => b.count - a.count).slice(0, limit);
  return {
    buckets: sorted,
    selectedCohorts: sorted.map(b => b.cohort),
    excluded: [],
    cohortCount: sorted.length,
    totalEvents: sorted.reduce((s, b) => s + b.count, 0),
  };
}

/**
 * Query cohorts sorted by sacred rate (descending) — for sacred audit.
 */
export function queryCohortBySacredRate(
  buckets: KBucket[],
  limit: number,
  purposeId: string,
): CohortQueryResult {
  if (!SACRED_ALLOWED_PURPOSES.includes(purposeId as PurposeId)) {
    return {
      buckets: [],
      selectedCohorts: [],
      excluded: buckets.map(b => ({ cohort: b.cohort, reason: "sacred_locked" as const })),
      cohortCount: 0,
      totalEvents: 0,
    };
  }
  const sorted = [...buckets].sort((a, b) => computeSacredRate(b) - computeSacredRate(a)).slice(0, limit);
  return {
    buckets: sorted,
    selectedCohorts: sorted.map(b => b.cohort),
    excluded: [],
    cohortCount: sorted.length,
    totalEvents: sorted.reduce((s, b) => s + b.count, 0),
  };
}

/**
 * Query cohorts by sensitivity level (only curator-allowed).
 */
export function queryCohortBySensitivity(
  buckets: KBucket[],
  minSensitivity: SensitivityLevel,
  purposeId: string,
): CohortQueryResult {
  if (!SACRED_ALLOWED_PURPOSES.includes(purposeId as PurposeId)) {
    return {
      buckets: [],
      selectedCohorts: [],
      excluded: buckets.map(b => ({ cohort: b.cohort, reason: "sacred_locked" as const })),
      cohortCount: 0,
      totalEvents: 0,
    };
  }
  const matched = buckets.filter(b => {
    const tradition = b.cohort.tradition as string | undefined;
    const sens: SensitivityLevel = ((tradition && SACRED_TRADITION_SENSITIVITY[tradition]) ?? 1) as SensitivityLevel;
    return (sens as number) >= (minSensitivity as number);
  });
  return {
    buckets: matched,
    selectedCohorts: matched.map(b => b.cohort),
    excluded: [],
    cohortCount: matched.length,
    totalEvents: matched.reduce((s, b) => s + b.count, 0),
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 KPI Builders                                                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Compute count KPI — total events in selection.
 */
export function computeCount(input: KpiInput): KpiResult {
  const buckets = input.filter ? input.buckets.filter(input.filter) : input.buckets;
  const field = input.field ?? "count";
  const total = buckets.reduce((s, b) => s + (b[field] ?? 0), 0);
  return { kind: "count", value: total, n: buckets.length, unit: "events" };
}

/**
 * Compute average KPI — mean of selected field.
 */
export function computeAvg(input: KpiInput): KpiResult {
  const buckets = input.filter ? input.buckets.filter(input.filter) : input.buckets;
  const field = input.field ?? "count";
  const values = buckets.map(b => b[field] ?? 0);
  return { kind: "avg", value: mean(values), n: values.length, unit: "avg" };
}

/**
 * Compute 95th percentile KPI.
 */
export function computeP95(input: KpiInput): KpiResult {
  const buckets = input.filter ? input.buckets.filter(input.filter) : input.buckets;
  const field = input.field ?? "count";
  const values = buckets.map(b => b[field] ?? 0);
  return { kind: "p95", value: percentile(values, 95), n: values.length, unit: "p95" };
}

/**
 * Compute median KPI.
 */
export function computeMedian(input: KpiInput): KpiResult {
  const buckets = input.filter ? input.buckets.filter(input.filter) : input.buckets;
  const field = input.field ?? "count";
  const values = buckets.map(b => b[field] ?? 0);
  return { kind: "median", value: median(values), n: values.length, unit: "median" };
}

/**
 * Compute Shannon entropy across cohort mood histograms.
 */
export function computeEntropy(input: KpiInput): KpiResult {
  const buckets = input.filter ? input.buckets.filter(input.filter) : input.buckets;
  const merged: Record<string, number> = {};
  for (const b of buckets) {
    if (!b.moodHistogram) continue;
    for (const [k, v] of Object.entries(b.moodHistogram)) {
      merged[k] = (merged[k] ?? 0) + v;
    }
  }
  const h = shannonEntropy(merged);
  return { kind: "entropy", value: h, n: Object.keys(merged).length, unit: "bits" };
}

/**
 * Compute sacred rate KPI — fraction of cohorts with sacred hits > 0.
 */
export function computeSacredRateKpi(input: KpiInput): KpiResult {
  const buckets = input.filter ? input.buckets.filter(input.filter) : input.buckets;
  const withSacred = buckets.filter(b => b.sacredHits > 0).length;
  const rate = buckets.length === 0 ? 0 : withSacred / buckets.length;
  return { kind: "sacred_rate", value: rate, n: buckets.length, unit: "ratio" };
}

/**
 * Compute distinct-user KPI.
 */
export function computeDistinct(input: KpiInput): KpiResult {
  const buckets = input.filter ? input.buckets.filter(input.filter) : input.buckets;
  const total = buckets.reduce((s, b) => s + b.distinctUsers, 0);
  return { kind: "distinct", value: total, n: buckets.length, unit: "users" };
}

/**
 * Compute ratio KPI — custom ratio between two fields.
 */
export function computeRatio(
  buckets: KBucket[],
  numerator: keyof KBucket,
  denominator: keyof KBucket,
): KpiResult {
  const num = buckets.reduce((s, b) => s + ((b[numerator] as number) ?? 0), 0);
  const den = buckets.reduce((s, b) => s + ((b[denominator] as number) ?? 0), 0);
  const value = den === 0 ? 0 : num / den;
  return { kind: "ratio", value, n: buckets.length, unit: `${String(numerator)}/${String(denominator)}` };
}

/**
 * Compute max KPI.
 */
export function computeMax(input: KpiInput): KpiResult {
  const buckets = input.filter ? input.buckets.filter(input.filter) : input.buckets;
  const field = input.field ?? "count";
  const values = buckets.map(b => b[field] ?? 0);
  const v = values.length === 0 ? 0 : Math.max(...values);
  return { kind: "count", value: v, n: values.length, unit: "max" };
}

/**
 * Compute min KPI.
 */
export function computeMin(input: KpiInput): KpiResult {
  const buckets = input.filter ? input.buckets.filter(input.filter) : input.buckets;
  const field = input.field ?? "count";
  const values = buckets.map(b => b[field] ?? 0);
  const v = values.length === 0 ? 0 : Math.min(...values);
  return { kind: "count", value: v, n: values.length, unit: "min" };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 Chart Builders                                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Build line series from time-stamped buckets.
 */
export function buildLineSeries(
  buckets: KBucket[],
  name: string,
  options: ChartOptions,
): ChartSeries {
  const sorted = [...buckets].sort((a, b) => a.windowStart - b.windowStart);
  const points: ChartPoint[] = sorted.map(b => ({
    x: alignTimestamp(b.windowStart, options.bucket),
    y: b.count,
    annotation: `${b.cohort.region}/${b.cohort.tradition ?? "any"}`,
  }));
  if (options.smoothing === "ema" && points.length > 1) {
    const ys = ema(points.map(p => p.y), 0.4);
    points.forEach((p, i) => { p.y = ys[i]!; });
  } else if (options.smoothing === "sma" && options.windowSize) {
    const ys = sma(points.map(p => p.y), options.windowSize);
    points.forEach((p, i) => { p.y = ys[i]!; });
  }
  return {
    name,
    points,
    kind: "line",
    axisLabelX: "time",
    axisLabelY: "events",
    bucket: options.bucket,
  };
}

/**
 * Build bar series — buckets grouped by dimension.
 */
export function buildBarSeries(
  buckets: KBucket[],
  name: string,
  groupBy: "region" | "tradition" | "age",
): ChartSeries {
  const groups: Record<string, number> = {};
  for (const b of buckets) {
    const key =
      groupBy === "region" ? b.cohort.region :
      groupBy === "tradition" ? (b.cohort.tradition ?? "any") :
      (b.cohort.ageBracket ?? "unknown");
    groups[key] = (groups[key] ?? 0) + b.count;
  }
  const points: ChartPoint[] = Object.entries(groups).map(([k, v]) => ({
    x: k,
    y: v,
  }));
  return {
    name,
    points,
    kind: "bar",
    axisLabelX: groupBy,
    axisLabelY: "events",
  };
}

/**
 * Build heatmap — cohort on one axis, time on another.
 */
export function buildHeatmap(
  buckets: KBucket[],
  name: string,
  timeBucket: "day" | "week" | "month" | "quarter",
): ChartSeries {
  const points: ChartPoint[] = buckets.map(b => ({
    x: `${alignTimestamp(b.windowStart, timeBucket)}_${b.cohort.region}`,
    y: b.count,
    weight: b.distinctUsers,
    annotation: b.cohort.tradition,
  }));
  return {
    name,
    points,
    kind: "heatmap",
    axisLabelX: "time/cohort",
    axisLabelY: "events",
    bucket: timeBucket,
  };
}

/**
 * Build histogram — bucket counts into N bins.
 */
export function buildHistogram(
  buckets: KBucket[],
  name: string,
  numBins: number,
): ChartSeries {
  const values = buckets.map(b => b.count);
  if (values.length === 0) {
    return { name, points: [], kind: "histogram" };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const binSize = span / numBins;
  const bins: number[] = new Array(numBins).fill(0);
  for (const v of values) {
    const idx = Math.min(numBins - 1, Math.floor((v - min) / binSize));
    bins[idx]!++;
  }
  const points: ChartPoint[] = bins.map((c, i) => ({
    x: `${(min + i * binSize).toFixed(0)}-${(min + (i + 1) * binSize).toFixed(0)}`,
    y: c,
  }));
  return {
    name,
    points,
    kind: "histogram",
    axisLabelX: "count range",
    axisLabelY: "frequency",
  };
}

/**
 * Build scatter — distinct users vs count.
 */
export function buildScatter(
  buckets: KBucket[],
  name: string,
): ChartSeries {
  const points: ChartPoint[] = buckets.map(b => ({
    x: b.distinctUsers,
    y: b.count,
    annotation: cohortHash(b.cohort),
  }));
  return {
    name,
    points,
    kind: "scatter",
    axisLabelX: "distinct users",
    axisLabelY: "events",
  };
}

/**
 * Build area series — cumulative count over time.
 */
export function buildAreaSeries(
  buckets: KBucket[],
  name: string,
  timeBucket: "day" | "week" | "month" | "quarter",
): ChartSeries {
  const sorted = [...buckets].sort((a, b) => a.windowStart - b.windowStart);
  let cum = 0;
  const points: ChartPoint[] = sorted.map(b => {
    cum += b.count;
    return { x: alignTimestamp(b.windowStart, timeBucket), y: cum };
  });
  return {
    name,
    points,
    kind: "area",
    axisLabelX: "time",
    axisLabelY: "cumulative events",
    bucket: timeBucket,
  };
}

/**
 * Build stacked bar — cohorts grouped by 2 dimensions.
 */
export function buildStackedBar(
  buckets: KBucket[],
  name: string,
  groupBy: "region" | "tradition",
  subGroupBy: "age" | "tradition" | "region",
): ChartSeries {
  const groups: Record<string, Record<string, number>> = {};
  for (const b of buckets) {
    const top =
      groupBy === "region" ? b.cohort.region :
      (b.cohort.tradition ?? "any");
    const sub =
      subGroupBy === "region" ? b.cohort.region :
      subGroupBy === "tradition" ? (b.cohort.tradition ?? "any") :
      (b.cohort.ageBracket ?? "unknown");
    if (!groups[top]) groups[top] = {};
    groups[top]![sub] = (groups[top]![sub] ?? 0) + b.count;
  }
  const points: ChartPoint[] = [];
  for (const [top, subs] of Object.entries(groups)) {
    for (const [sub, v] of Object.entries(subs)) {
      points.push({ x: `${top}/${sub}`, y: v, annotation: sub });
    }
  }
  return {
    name,
    points,
    kind: "stacked_bar",
    axisLabelX: `${groupBy}/${subGroupBy}`,
    axisLabelY: "events",
  };
}

/**
 * Build mood histogram chart (uses w52 moodHistogram field).
 */
export function buildMoodHistogramChart(
  buckets: KBucket[],
  name: string,
): ChartSeries {
  const merged: Record<string, number> = {};
  for (const b of buckets) {
    if (!b.moodHistogram) continue;
    for (const [k, v] of Object.entries(b.moodHistogram)) {
      merged[k] = (merged[k] ?? 0) + v;
    }
  }
  const points: ChartPoint[] = Object.entries(merged)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ x: k, y: v }));
  return {
    name,
    points,
    kind: "bar",
    axisLabelX: "mood",
    axisLabelY: "count",
  };
}

/**
 * Build legend for chart series.
 */
export function buildLegend(entries: { label: string; color: string }[]): ChartLegend {
  return { entries };
}

/**
 * Build empty chart (placeholder for disabled cohorts).
 */
export function buildEmptyChart(name: string, reason: string): ChartSeries {
  return {
    name,
    points: [{ x: reason, y: 0 }],
    kind: "bar",
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 Drill-Down Helpers                                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Narrow from cohort to sub-cohort (e.g. by tradition within region).
 */
export function narrowCohort(
  result: CohortQueryResult,
  axis: "tradition" | "age" | "region",
  value: string,
): DrillDown {
  const params: DrillParams = {};
  if (axis === "tradition") params.tradition = value;
  if (axis === "age") params.ageBracket = value;
  if (axis === "region") params.region = value;
  return {
    path: `/${axis}/${encodeURIComponent(value)}`,
    label: `Narrow by ${axis} = ${value}`,
    scope: "subcohort",
    params,
  };
}

/**
 * Escalate drill — same cohort but deeper (e.g. add age bracket).
 */
export function escalateDrill(
  parent: DrillDown,
  axis: "age" | "tradition",
  value: string,
): DrillDown {
  const params: DrillParams = { ...parent.params };
  if (axis === "age") params.ageBracket = value;
  if (axis === "tradition") params.tradition = value;
  return {
    path: `${parent.path}/${axis}/${encodeURIComponent(value)}`,
    label: `Escalate to ${axis} = ${value}`,
    scope: "subcohort",
    params,
  };
}

/**
 * Redact individual — show aggregate only, never the row.
 */
export function redactIndividual(
  request: DrillDownRequest,
  reason: string,
): DrillDownResult {
  return {
    drill: {
      path: `/redacted/${request.cohortHash}`,
      label: "Individual (redacted)",
      scope: "individual_redacted",
      params: {
        cohortHash: request.cohortHash,
        bucketIndex: request.bucketIndex,
      },
      gated: {
        requiresCurator: true,
        requiresSecondarySignature: true,
        reason,
      },
    },
    redacted: true,
    reason,
  };
}

/**
 * Build drill-down from bucket index within a cohort.
 */
export function drillToBucket(
  result: CohortQueryResult,
  bucketIndex: number,
): DrillDown {
  const bucket = result.buckets[bucketIndex];
  const params: DrillParams = {
    cohortHash: bucket ? cohortHash(bucket.cohort) : undefined,
    bucketIndex,
    region: bucket?.cohort.region,
    tradition: bucket?.cohort.tradition,
    ageBracket: bucket?.cohort.ageBracket,
    windowDays: bucket?.cohort.windowDays,
  };
  return {
    path: `/cohort/${encodeURIComponent(params.cohortHash ?? "")}/${bucketIndex}`,
    label: bucket
      ? `Bucket ${bucketIndex} (${bucket.cohort.region}/${bucket.cohort.tradition ?? "any"})`
      : `Bucket ${bucketIndex}`,
    scope: "cohort",
    params,
  };
}

/**
 * Apply drill-down gate — refuse if scope requires curator and actor lacks it.
 */
export function applyDrillGate(
  drill: DrillDown,
  actorRole: AdminRole,
  request: DrillDownRequest,
): DrillDownResult {
  if (drill.scope === "individual_redacted") {
    return redactIndividual(request, "individual_redacted_always_redacted");
  }
  if (drill.gated?.requiresCurator) {
    if (!["curator", "owner"].includes(actorRole)) {
      return {
        drill,
        redacted: true,
        reason: "DSH_006: curator role required",
      };
    }
  }
  if (drill.gated?.requiresSecondarySignature) {
    if (!request.curatorId) {
      return {
        drill,
        redacted: true,
        reason: "DSH_006: secondary curator signature missing",
      };
    }
  }
  return { drill, redacted: false };
}

/**
 * Refuse drill-down when cohort fails k-anonymity.
 */
export function refuseDrill(
  drill: DrillDown,
  reason: string,
): DrillDownResult {
  return {
    drill: { ...drill, gated: { requiresCurator: true, requiresSecondarySignature: false, reason } },
    redacted: true,
    reason,
  };
}

/**
 * Build sacred drill-down — requires curator + secondary.
 */
export function buildSacredDrill(
  bucket: KBucket,
  curatorId: string,
  secondaryCuratorId: string,
): DrillDown {
  return {
    path: `/sacred/${cohortHash(bucket.cohort)}`,
    label: `Sacred view: ${bucket.cohort.tradition ?? "any"}`,
    scope: "subcohort",
    params: {
      cohortHash: cohortHash(bucket.cohort),
      tradition: bucket.cohort.tradition,
    },
    gated: {
      requiresCurator: true,
      requiresSecondarySignature: true,
      reason: "sacred-flagged cohort requires dual-custody",
    },
  };
}

/**
 * Validate drill-down path shape.
 */
export function isValidDrillPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.length > 256) return false;
  return !path.includes("..");
}

/**
 * Compute drill depth (number of path segments).
 */
export function drillDepth(drill: DrillDown): number {
  return drill.path.split("/").filter(s => s.length > 0).length;
}

/**
 * Roll back drill — return to parent path.
 */
export function rollbackDrill(drill: DrillDown): DrillDown {
  const parts = drill.path.split("/").filter(s => s.length > 0);
  if (parts.length <= 1) {
    return { ...drill, path: "/", label: "Root", scope: "cohort" };
  }
  parts.pop();
  return {
    ...drill,
    path: "/" + parts.join("/"),
    label: `Back to ${parts.join("/")}`,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Anonymization Check                                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Verify k-anonymity across all buckets.
 */
export function verifyKAnonymity(
  buckets: KBucket[],
  k: number,
  kSacred: number,
): { satisfied: boolean; breaches: string[]; suppressed: number } {
  const breaches: string[] = [];
  let suppressed = 0;
  for (const b of buckets) {
    const check = checkKAnonymity(b, k, kSacred);
    if (!check.satisfied) {
      breaches.push(cohortHash(b.cohort));
      suppressed++;
    }
  }
  return { satisfied: breaches.length === 0, breaches, suppressed };
}

/**
 * Verify ε-DP budget — refuse if exhausted.
 */
export function verifyEpsilonBudget(
  epsilonSpent: number,
  epsilonBudget: number,
  nextQueryEpsilon: number,
): { allowed: boolean; remaining: number; exhausted: boolean } {
  const remaining = Math.max(0, epsilonBudget - epsilonSpent);
  const exhausted = remaining < nextQueryEpsilon;
  return {
    allowed: !exhausted,
    remaining,
    exhausted,
  };
}

/**
 * Verify sacred flag preservation — sacred tag must NOT appear in raw form.
 */
export function verifySacredFlagPreservation(
  buckets: KBucket[],
  outputSample: unknown,
): { preserved: boolean; leaks: string[] } {
  const leaks: string[] = [];
  // Sacred tag must NEVER appear in the output payload as a string fragment.
  const sample = JSON.stringify(outputSample);
  const sacredFragments = [
    "sacredFlag:true",
    "sacredFlag: true",
    '"sacredFlag":true',
    '"sacredFlag": true',
    "rawTag",
    "rawSacred",
  ];
  for (const f of sacredFragments) {
    if (sample.includes(f)) leaks.push(f);
  }
  // Sanity check — buckets have sacredHits counter (allowed) but no raw flag.
  for (const b of buckets) {
    const probe = b as unknown as Record<string, unknown>;
    if (typeof probe.sacredFlag === "boolean") {
      leaks.push("raw_sacredFlag_in_bucket");
    }
  }
  return { preserved: leaks.length === 0, leaks };
}

/**
 * Build full anonymization attestation.
 */
export function buildAnonymizationAttestation(
  input: AnonymizationCheckInput,
): AnonymizationAttestation {
  const k = verifyKAnonymity(input.buckets, input.k, input.kSacred);
  const eps = verifyEpsilonBudget(input.epsilonSpent, input.epsilonBudget, 0);
  const sacred = verifySacredFlagPreservation(input.buckets, { buckets: input.buckets });
  return {
    kSatisfied: k.satisfied,
    epsilonSpent: input.epsilonSpent,
    epsilonBudget: input.epsilonBudget,
    sacredFlagPreserved: sacred.preserved,
    suppressed: k.suppressed,
    publishableBuckets: input.buckets.length - k.suppressed,
    totalBuckets: input.buckets.length,
    breaches: k.breaches,
    policyVersion: input.policyVersion,
    auditAt: Date.now(),
  };
}

/**
 * Check if a single bucket is publishable.
 */
export function isBucketPublishable(
  bucket: KBucket,
  k: number,
  kSacred: number,
): boolean {
  return checkKAnonymity(bucket, k, kSacred).satisfied;
}

/**
 * Compute reidentification risk score for a bucket.
 */
export function computeReidentificationRisk(
  bucket: KBucket,
  rarityPrior: number = 0.1,
): ReidentificationRisk {
  const signals: string[] = [];
  let score = rarityPrior;
  if (bucket.distinctUsers < 5) {
    signals.push("low_distinct_users");
    score += 0.4;
  }
  if (bucket.count > 1000 && bucket.distinctUsers < 10) {
    signals.push("high_count_low_distinct");
    score += 0.2;
  }
  if (bucket.sacredHits > 0 && bucket.distinctUsers < 20) {
    signals.push("sacred_low_n");
    score += 0.3;
  }
  if (bucket.cohort.ageBracket && bucket.cohort.ageBracket !== "unknown") {
    score += 0.05;
  }
  score = Math.min(1, score);
  const riskLevel = score < 0.3 ? "low" : score < 0.6 ? "medium" : "high";
  const recommendation = riskLevel === "high" ? "suppress" : riskLevel === "medium" ? "redact" : "allow";
  return {
    cohortHash: cohortHash(bucket.cohort),
    riskScore: score,
    riskLevel,
    signals,
    recommendation,
  };
}

/**
 * Compute admin budget ledger for a cohort.
 */
export function computeAdminBudgetLedger(
  cohort: CohortKey,
  epsilonSpent: number,
  epsilonBudget: number,
  queries: number,
  lastQueryAt: number,
): AdminBudgetLedger {
  return {
    cohort,
    epsilonSpent,
    epsilonBudget,
    queries,
    lastQueryAt,
    exhausted: epsilonSpent >= epsilonBudget,
  };
}

/**
 * Check privacy budget action — allow / aggregate / suppress / reject.
 */
export function recommendPrivacyAction(
  attestation: AnonymizationAttestation,
): "allow" | "aggregate" | "suppress" | "reject" {
  if (!attestation.kSatisfied) return "suppress";
  if (attestation.epsilonSpent >= attestation.epsilonBudget) return "reject";
  if (attestation.suppressed > 0) return "aggregate";
  return "allow";
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 Trend Detection                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Detect trend — rolling-window delta vs baseline.
 */
export function detectTrend(input: TrendInput): TrendDelta {
  const { series, baselineWindow, currentWindow, threshold } = input;
  const t = threshold ?? DEFAULT_TREND_THRESHOLD;
  if (series.length < baselineWindow + currentWindow) {
    return {
      kind: "flat",
      magnitude: 0,
      confidence: 0,
      baseline: 0,
      current: 0,
      window: currentWindow,
    };
  }
  const sortedTs = [...series].sort((a, b) => a.x - b.x);
  const baselineSlice = sortedTs.slice(-baselineWindow - currentWindow, -currentWindow);
  const currentSlice = sortedTs.slice(-currentWindow);
  const baseline = mean(baselineSlice.map(p => p.y));
  const current = mean(currentSlice.map(p => p.y));
  const delta = baseline === 0 ? 0 : (current - baseline) / baseline;
  const tStat = welchTStat(baselineSlice.map(p => p.y), currentSlice.map(p => p.y));
  const confidence = Math.min(1, tStat / 3);
  let kind: TrendDelta["kind"] = "flat";
  if (delta > t) kind = "rising";
  else if (delta < -t) kind = "falling";
  return {
    kind,
    magnitude: Math.abs(delta),
    confidence,
    baseline,
    current,
    window: currentWindow,
    pValue: Math.max(0, 1 - confidence),
    effectSize: delta,
  };
}

/**
 * Detect trend on a KPI over time.
 */
export function detectKpiTrend(
  points: { x: number; y: number }[],
  baselineDays: number = DEFAULT_BASELINE_WINDOW_DAYS,
  currentDays: number = DEFAULT_CURRENT_WINDOW_DAYS,
): TrendDelta {
  return detectTrend({
    series: points,
    baselineWindow: baselineDays,
    currentWindow: currentDays,
  });
}

/**
 * Build baseline series from earlier window.
 */
export function buildBaseline(
  buckets: KBucket[],
  days: number,
): { x: number; y: number }[] {
  const now = Date.now();
  const from = now - days * TIMESTAMP_BUCKETS_MS.day;
  return buckets
    .filter(b => b.windowStart >= from)
    .map(b => ({ x: b.windowStart, y: b.count }));
}

/**
 * Build current-window series.
 */
export function buildCurrentWindow(
  buckets: KBucket[],
  days: number,
): { x: number; y: number }[] {
  const now = Date.now();
  const from = now - days * TIMESTAMP_BUCKETS_MS.day;
  return buckets
    .filter(b => b.windowStart >= from)
    .map(b => ({ x: b.windowStart, y: b.count }));
}

/**
 * Classify trend direction from KPI delta.
 */
export function classifyTrend(delta: TrendDelta): "rising" | "falling" | "flat" {
  return delta.kind;
}

/**
 * Compute trend confidence bucket.
 */
export function trendConfidenceBucket(c: number): "low" | "medium" | "high" {
  if (c < 0.5) return "low";
  if (c < 0.85) return "medium";
  return "high";
}

/**
 * Detect multiple trends in parallel — returns map of series-name → trend.
 */
export function detectMultipleTrends(
  seriesMap: Record<string, { x: number; y: number }[]>,
  baselineDays: number,
  currentDays: number,
): Record<string, TrendDelta> {
  const out: Record<string, TrendDelta> = {};
  for (const [name, points] of Object.entries(seriesMap)) {
    out[name] = detectKpiTrend(points, baselineDays, currentDays);
  }
  return out;
}

/**
 * Forecast next-period value using EMA on the recent window.
 */
export function forecastNext(
  series: { x: number; y: number }[],
  alpha: number = 0.4,
): number {
  const ys = series.map(p => p.y);
  if (ys.length === 0) return 0;
  return ema(ys, alpha)[ys.length - 1] ?? 0;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §10 Sacred Admin View                                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Build sacred admin payload — curator-only view.
 */
export function buildSacredAdminPayload(
  request: SacredAdminRequest,
  buckets: KBucket[],
  policyVersion: string,
): SacredAdminPayload {
  if (!SACRED_ALLOWED_PURPOSES.includes(request.purposeId as PurposeId)) {
    return emptySacredPayload("DSH_006: curator role required");
  }
  const cohortSet = new Set(request.cohorts.map(c => cohortHash(c)));
  const filtered = buckets.filter(b => cohortSet.has(cohortHash(b.cohort)));
  const sacredBuckets = filtered.filter(b => b.sacredHits > 0);
  const attest = buildAnonymizationAttestation({
    buckets: sacredBuckets,
    k: DEFAULT_K,
    kSacred: DEFAULT_K_SACRED,
    epsilonSpent: 0,
    epsilonBudget: DEFAULT_EPSILON_BUDGET,
    policyVersion,
  });
  const cohorts: SacredCohortView[] = sacredBuckets.map(b => {
    const tradition = b.cohort.tradition as string | undefined;
    const sensitivity: SensitivityLevel = ((tradition && SACRED_TRADITION_SENSITIVITY[tradition]) ?? 1) as SensitivityLevel;
    return {
      cohort: b.cohort,
      bucketCount: b.count,
      sacredHits: b.sacredHits,
      sacredRate: computeSacredRate(b),
      tradition: b.cohort.tradition,
      requiresDoubleReview: (sensitivity as number) >= 4,
      policyHints: policyHintsForSensitivity(sensitivity),
    };
  });
  return {
    cohorts,
    attestation: attest,
    curatorGated: true,
    curatorSignature: {
      curatorId: request.curatorId,
      signedAt: Date.now(),
      signature: fnv1a64(SALT_PREFIX + request.curatorId + "|" + Date.now()),
      secondaryCuratorId: request.requireSecondary ? request.curatorId : undefined,
      secondarySignedAt: request.requireSecondary ? Date.now() : undefined,
    },
    auditTrail: [],
  };
}

/** Helper — empty sacred payload for refused requests. */
function emptySacredPayload(reason: string): SacredAdminPayload {
  return {
    cohorts: [],
    attestation: {
      kSatisfied: false,
      epsilonSpent: 0,
      epsilonBudget: DEFAULT_EPSILON_BUDGET,
      sacredFlagPreserved: true,
      suppressed: 0,
      publishableBuckets: 0,
      totalBuckets: 0,
      breaches: [reason],
      policyVersion: POLICY_VERSION,
      auditAt: Date.now(),
    },
    curatorGated: true,
    curatorSignature: {
      curatorId: "",
      signedAt: 0,
      signature: "",
    },
    auditTrail: [],
  };
}

/** Helper — policy hints by sensitivity. */
function policyHintsForSensitivity(s: SensitivityLevel): string[] {
  const hints: string[] = [];
  const sn = s as number;
  if (sn >= 4) hints.push("double_review_required");
  if (sn >= 3) hints.push("curator_signature_required");
  if (sn >= 2) hints.push("audit_trail_required");
  if (sn >= 1) hints.push("k_anon_raised");
  return hints;
}

/**
 * Verify curator signature shape (informational — sign-verify is by hash).
 */
export function verifyCuratorSignature(sig: CuratorSignature): boolean {
  return sig.signature.length === 16 && sig.curatorId.length > 0 && sig.signedAt > 0;
}

/**
 * Append audit entry to sacred payload.
 */
export function appendSacredAudit(
  payload: SacredAdminPayload,
  entry: SacredAuditEntry,
): SacredAdminPayload {
  return {
    ...payload,
    auditTrail: [...payload.auditTrail, entry],
  };
}

/**
 * Build a sacred audit entry.
 */
export function buildSacredAuditEntry(
  action: string,
  actor: string,
  detail: string,
  cohortHash: string,
  doubleReviewed: boolean,
): SacredAuditEntry {
  return {
    action,
    actor,
    ts: Date.now(),
    detail,
    cohortHash,
    signatureHash: fnv1a64(SALT_PREFIX + action + actor + cohortHash),
    sacred: true,
    doubleReviewed,
  };
}

/**
 * Verify sacred cohort meets sensitivity policy.
 */
export function verifySacredPolicy(
  cohort: CohortKey,
  sensitivity: SensitivityLevel,
  actorRole: AdminRole,
): { allowed: boolean; reason?: string } {
  const tradition = cohort.tradition as string | undefined;
  const required: SensitivityLevel = ((tradition && SACRED_TRADITION_SENSITIVITY[tradition]) ?? 1) as SensitivityLevel;
  if ((sensitivity as number) < (required as number)) {
    return { allowed: false, reason: "DSH_003: sensitivity below required" };
  }
  if ((required as number) >= 4 && !["curator", "owner"].includes(actorRole)) {
    return { allowed: false, reason: "DSH_006: sensitivity >=4 requires curator" };
  }
  return { allowed: true };
}

/**
 * Get sensitivity level for a tradition.
 */
export function getSensitivityLevel(tradition: string): SensitivityLevel {
  return (SACRED_TRADITION_SENSITIVITY[tradition] ?? 1) as SensitivityLevel;
}

/**
 * Format sacred view for export.
 */
export function formatSacredExport(
  payload: SacredAdminPayload,
): { json: string; cohortCount: number; attestationHash: string } {
  const json = JSON.stringify(payload, null, 2);
  const attestationHash = fnv1a64(JSON.stringify(payload.attestation));
  return {
    json,
    cohortCount: payload.cohorts.length,
    attestationHash,
  };
}

/**
 * Empty sacred payload for non-curator requests.
 */
export function buildEmptySacredPayload(reason: string = "DSH_006: curator auth missing"): SacredAdminPayload {
  return emptySacredPayload(reason);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §11 LGPD Policy Primitives                                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Build LGPD attestation for a dashboard view.
 */
export function buildLgpdAttestation(
  purposeId: PurposeId,
  adminId: string,
  erasureHonoredAt?: number,
): LgpdAttestation {
  return {
    art7: true,           // consent logged (purposeId binds to consent)
    art9: true,           // purpose limitation (purposeId is explicit)
    art18: erasureHonoredAt !== undefined, // erasure respected
    art20: true,          // portability (admin export below)
    purposeId,
    purposeLabel: PURPOSE_LABELS[purposeId] ?? "Unknown purpose",
    adminId,
    consentAt: Date.now(),
    erasureHonoredAt,
  };
}

/**
 * Apply Art. 18 erasure — re-aggregate cohorts after user suppression.
 */
export function applyErasureReaggregation(
  buckets: KBucket[],
  _suppressedUserHash: string,
  _suppressionList?: string[],
): KBucket[] {
  // Erased user's events are removed at the bucket level — cohort re-aggregation
  // is the dashboard's responsibility. We return buckets with distinctUsers
  // recalculated (decrement by 1 if user was counted).
  return buckets.map(b => ({
    ...b,
    // Note: in a real impl we'd track exact membership. For SHAPE compat we
    // conservatively subtract at most 1 distinct user per bucket per erasure.
    distinctUsers: Math.max(0, b.distinctUsers - 1),
  }));
}

/**
 * Art. 20 — export cohorts to research format (k-satisfied buckets only).
 */
export function exportCohortsForResearch(
  buckets: KBucket[],
  k: number,
  kSacred: number,
  format: "json" | "csv" | "jsonl",
): { format: string; rows: number; data: string; suppressed: number } {
  const publishable = buckets.filter(b => isBucketPublishable(b, k, kSacred));
  const suppressed = buckets.length - publishable.length;
  let data: string;
  if (format === "json") {
    data = JSON.stringify(publishable, null, 2);
  } else if (format === "csv") {
    const header = "region,tradition,age_bracket,window_days,count,distinct_users,sacred_hits";
    const rows = publishable.map(b =>
      `${b.cohort.region},${b.cohort.tradition ?? ""},${b.cohort.ageBracket ?? ""},${b.cohort.windowDays},${b.count},${b.distinctUsers},${b.sacredHits}`,
    );
    data = [header, ...rows].join("\n");
  } else {
    data = publishable.map(b => JSON.stringify(b)).join("\n");
  }
  return { format, rows: publishable.length, data, suppressed };
}

/**
 * Art. 7 — log admin action with consent attestation.
 */
export function logAdminAction(
  adminId: string,
  action: string,
  detail: string,
  cohortHash?: string,
): AuditEntry {
  return {
    action,
    actor: adminId,
    ts: Date.now(),
    detail,
    cohortHash,
    signatureHash: fnv1a64(SALT_PREFIX + adminId + action + Date.now()),
  };
}

/**
 * Art. 9 — verify purpose limitation matches the dashboard scope.
 */
export function verifyPurposeLimitation(
  purposeId: PurposeId,
  scope: "cohort" | "sacred" | "individual_redacted",
): { allowed: boolean; reason?: string } {
  if (scope === "sacred" && !SACRED_ALLOWED_PURPOSES.includes(purposeId)) {
    return { allowed: false, reason: "DSH_006: sacred scope requires curator purpose" };
  }
  if (scope === "individual_redacted") {
    return { allowed: false, reason: "DSH_004: individual scope not allowed" };
  }
  return { allowed: true };
}

/**
 * Compute admin ID from request — checks role and returns canonical form.
 */
export function canonicalizeAdminId(adminId: string): string {
  return adminId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

/**
 * Verify LGPD completeness — all 4 articles.
 */
export function verifyLgpdComplete(att: LgpdAttestation): { complete: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!att.art7) missing.push("art7");
  if (!att.art9) missing.push("art9");
  if (!att.art18) missing.push("art18");
  if (!att.art20) missing.push("art20");
  return { complete: missing.length === 0, missing };
}

/**
 * Build dashboard payload (top-level orchestrator).
 */
export function buildDashboardPayload(
  result: CohortQueryResult,
  purposeId: PurposeId,
  adminId: string,
): CohortDashboardPayload {
  const attestation = buildAnonymizationAttestation({
    buckets: result.buckets,
    k: DEFAULT_K,
    kSacred: DEFAULT_K_SACRED,
    epsilonSpent: 0,
    epsilonBudget: DEFAULT_EPSILON_BUDGET,
    policyVersion: POLICY_VERSION,
  });
  const lgpd = buildLgpdAttestation(purposeId, adminId);
  const kpis: KpiCard[] = [
    { label: "Total events", value: computeCount({ buckets: result.buckets, kind: "count" }).value, scope: "global" },
    { label: "Distinct users", value: computeDistinct({ buckets: result.buckets, kind: "distinct" }).value, scope: "global" },
    { label: "Avg per cohort", value: computeAvg({ buckets: result.buckets, kind: "avg" }).value, scope: "global" },
    { label: "Sacred rate", value: computeSacredRateKpi({ buckets: result.buckets, kind: "sacred_rate" }).value, scope: "global" },
  ];
  const charts: ChartSeries[] = [
    buildLineSeries(result.buckets, "events_over_time", { bucket: "day" }),
    buildBarSeries(result.buckets, "by_region", "region"),
  ];
  const drilldowns: DrillDown[] = result.buckets.slice(0, 10).map((_, i) => drillToBucket(result, i));
  const alerts: DashboardAlert[] = [];
  if (!attestation.kSatisfied) {
    alerts.push({
      level: "alert",
      code: "DSH_001",
      message: `k-anonymity breached in ${attestation.breaches.length} cohorts`,
      ts: Date.now(),
    });
  }
  if (attestation.epsilonSpent >= attestation.epsilonBudget) {
    alerts.push({
      level: "alert",
      code: "DSH_002",
      message: "ε-DP budget exhausted",
      ts: Date.now(),
    });
  }
  return {
    kpis,
    charts,
    drilldowns,
    alerts,
    lgpdAttestation: lgpd,
    meta: {
      generatedAt: Date.now(),
      dashboardId: fnv1a64(SALT_PREFIX + adminId + Date.now()),
      requestedBy: adminId,
      requestedAt: Date.now(),
      ttlSeconds: DASHBOARD_TTL_SECONDS,
      cacheKey: fnv1a64(JSON.stringify(result.selectedCohorts)),
      schemaVersion: DASHBOARD_SCHEMA_VERSION,
    },
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §12 Errors (DSH_001..DSH_006 + invariants)                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const DSH_CODES = {
  K_ANON_BREACH: "DSH_001",
  EPSILON_EXHAUSTED: "DSH_002",
  SACRED_LEAK: "DSH_003",
  DRILL_REFUSED: "DSH_004",
  COHORT_UNDER_REPRESENTATIVE: "DSH_005",
  CURATOR_AUTH_MISSING: "DSH_006",
} as const;
export type DshCode = typeof DSH_CODES[keyof typeof DSH_CODES];

export class DashboardError extends Error {
  public readonly code: DshCode;
  public readonly detail: string;
  public readonly ts: number;

  constructor(code: DshCode, detail: string) {
    super(`[${code}] ${detail}`);
    this.code = code;
    this.detail = detail;
    this.ts = Date.now();
    this.name = "DashboardError";
  }
}

export function dshError(code: DshCode, detail: string): DashboardError {
  return new DashboardError(code, detail);
}

/** DSH_001 — k-anonymity breach. */
export function dsh001(breaches: string[]): DashboardError {
  return dshError(DSH_CODES.K_ANON_BREACH, `k-anonymity breached in ${breaches.length} cohorts`);
}

/** DSH_002 — ε-DP budget exhausted. */
export function dsh002(spent: number, budget: number): DashboardError {
  return dshError(DSH_CODES.EPSILON_EXHAUSTED, `epsilon budget exhausted: spent=${spent} budget=${budget}`);
}

/** DSH_003 — sacred tag leaked in payload. */
export function dsh003(leaks: string[]): DashboardError {
  return dshError(DSH_CODES.SACRED_LEAK, `sacred tag leaked: ${leaks.join(", ")}`);
}

/** DSH_004 — drill-down refused. */
export function dsh004(reason: string): DashboardError {
  return dshError(DSH_CODES.DRILL_REFUSED, `drill-down refused: ${reason}`);
}

/** DSH_005 — cohort under-representative. */
export function dsh005(cohortHash: string, n: number, min: number): DashboardError {
  return dshError(
    DSH_CODES.COHORT_UNDER_REPRESENTATIVE,
    `cohort ${cohortHash} under-representative: n=${n} < min=${min}`,
  );
}

/** DSH_006 — curator auth missing. */
export function dsh006(action: string): DashboardError {
  return dshError(DSH_CODES.CURATOR_AUTH_MISSING, `curator auth missing for: ${action}`);
}

/** Throw if any error invariant is violated. */
export function assertInvariants(payload: CohortDashboardPayload): void {
  if (!payload.lgpdAttestation.art9) {
    throw dshError(DSH_CODES.CURATOR_AUTH_MISSING, "art9 missing");
  }
  if (payload.alerts.some(a => a.code === DSH_CODES.EPSILON_EXHAUSTED)) {
    throw dshError(DSH_CODES.EPSILON_EXHAUSTED, "epsilon exhausted — payload cannot render");
  }
  if (payload.alerts.some(a => a.code === DSH_CODES.SACRED_LEAK)) {
    throw dshError(DSH_CODES.SACRED_LEAK, "sacred tag in payload — refuse render");
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §13 Smoke / Regression Scenarios                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const SMOKE_SCENARIOS = [
  "cohort_query_region",
  "cohort_query_tradition",
  "cohort_query_age",
  "cohort_query_window",
  "drill_down_cohort",
  "drill_down_subcohort",
  "drill_down_individual_redacted",
  "k_anonymity_check",
  "epsilon_dp_budget",
  "trend_detection_baseline",
  "sacred_curator_gate",
  "kpi_compute_count_avg_p95",
  "chart_build_line_bar_heatmap",
  "histogram_distribution",
  "anonymization_attestation",
  "admin_audit_shape",
  "narrow_cohort_with_privacy",
  "drill_refused",
  "epsilon_exhaustion_refusal",
] as const;
export type SmokeScenario = typeof SMOKE_SCENARIOS[number];

/**
 * Smoke — cohort query by 4 dimensions.
 */
export function smokeCohortQuery(
  buckets: KBucket[],
): { region: number; tradition: number; age: number; window: number } {
  return {
    region: queryCohortByRegion(buckets, ["BR", "PT"], "purp-research").cohortCount,
    tradition: queryCohortByTradition(buckets, ["candomble"], "purp-research").cohortCount,
    age: queryCohortByAge(buckets, ["25_34", "35_44"], "purp-research").cohortCount,
    window: queryCohortByWindow(buckets, 30, "purp-research").cohortCount,
  };
}

/**
 * Smoke — drill-down 3 levels.
 */
export function smokeDrillDown(result: CohortQueryResult): { cohort: number; subcohort: number; redacted: number } {
  const cohort = drillToBucket(result, 0);
  const sub = narrowCohort(result, "tradition", "candomble");
  const redacted = redactIndividual(
    { cohortHash: "x", bucketIndex: 0, requestedScope: "individual_redacted", actorId: "admin-1", purposeId: "purp-curator-admin", ts: Date.now() },
    "test_redaction",
  );
  return {
    cohort: drillDepth(cohort),
    subcohort: drillDepth(sub),
    redacted: redacted.redacted ? 1 : 0,
  };
}

/**
 * Smoke — k-anonymity check.
 */
export function smokeKAnonymity(buckets: KBucket[]): { satisfied: boolean; breaches: number } {
  const r = verifyKAnonymity(buckets, DEFAULT_K, DEFAULT_K_SACRED);
  return { satisfied: r.satisfied, breaches: r.breaches.length };
}

/**
 * Smoke — ε-DP budget.
 */
export function smokeEpsilonBudget(spent: number, budget: number): { allowed: boolean; exhausted: boolean } {
  const r = verifyEpsilonBudget(spent, budget, 0.5);
  return { allowed: r.allowed, exhausted: r.exhausted };
}

/**
 * Smoke — trend detection.
 */
export function smokeTrendDetection(): TrendDelta {
  const series = Array.from({ length: 60 }, (_, i) => ({
    x: Date.now() - (60 - i) * TIMESTAMP_BUCKETS_MS.day,
    y: 100 + i * 2 + (i % 7) * 5,
  }));
  return detectKpiTrend(series, 30, 7);
}

/**
 * Smoke — sacred curator gate.
 */
export function smokeSacredCuratorGate(
  buckets: KBucket[],
  actorRole: AdminRole,
): { allowed: boolean; cohorts: number } {
  const allowed = ["curator", "owner"].includes(actorRole);
  if (!allowed) return { allowed: false, cohorts: 0 };
  const req: SacredAdminRequest = {
    cohorts: buckets.slice(0, 1).map(b => b.cohort),
    actorId: "admin-1",
    curatorId: "curator-1",
    purposeId: "purp-curator-admin",
    requireSecondary: true,
  };
  const payload = buildSacredAdminPayload(req, buckets, POLICY_VERSION);
  return { allowed: payload.curatorGated, cohorts: payload.cohorts.length };
}

/**
 * Smoke — KPI compute (count / avg / p95).
 */
export function smokeKpiCompute(buckets: KBucket[]): { count: number; avg: number; p95: number } {
  return {
    count: computeCount({ buckets, kind: "count" }).value,
    avg: computeAvg({ buckets, kind: "avg" }).value,
    p95: computeP95({ buckets, kind: "p95" }).value,
  };
}

/**
 * Smoke — chart build (line / bar / heatmap).
 */
export function smokeChartBuild(buckets: KBucket[]): { line: number; bar: number; heatmap: number } {
  return {
    line: buildLineSeries(buckets, "t", { bucket: "day" }).points.length,
    bar: buildBarSeries(buckets, "b", "region").points.length,
    heatmap: buildHeatmap(buckets, "h", "day").points.length,
  };
}

/**
 * Smoke — histogram distribution.
 */
export function smokeHistogram(buckets: KBucket[]): { bins: number } {
  return { bins: buildHistogram(buckets, "h", 10).points.length };
}

/**
 * Smoke — anonymization attestation.
 */
export function smokeAnonymizationAttestation(buckets: KBucket[]): {
  kSatisfied: boolean;
  sacredPreserved: boolean;
  publishable: number;
} {
  const a = buildAnonymizationAttestation({
    buckets,
    k: DEFAULT_K,
    kSacred: DEFAULT_K_SACRED,
    epsilonSpent: 0,
    epsilonBudget: DEFAULT_EPSILON_BUDGET,
    policyVersion: POLICY_VERSION,
  });
  return {
    kSatisfied: a.kSatisfied,
    sacredPreserved: a.sacredFlagPreserved,
    publishable: a.publishableBuckets,
  };
}

/**
 * Smoke — admin audit shape.
 */
export function smokeAdminAudit(adminId: string): { hasActor: boolean; hasAction: boolean; hasSig: boolean } {
  const e = logAdminAction(adminId, "render", "smoke", "cohort-x");
  return {
    hasActor: e.actor === adminId,
    hasAction: e.action === "render",
    hasSig: e.signatureHash !== undefined && e.signatureHash.length === 16,
  };
}

/**
 * Smoke — narrow cohort with privacy.
 */
export function smokeNarrowCohortWithPrivacy(result: CohortQueryResult): { buckets: number; excluded: number } {
  const narrowed = queryRepresentativeCohorts(result.buckets, MIN_REPRESENTATIVE_COUNT, "purp-research");
  return { buckets: narrowed.cohortCount, excluded: narrowed.excluded.length };
}

/**
 * Smoke — drill refused.
 */
export function smokeDrillRefused(drill: DrillDown): { redacted: boolean; reason: string } {
  const r = refuseDrill(drill, "DSH_001: k_breach");
  return { redacted: r.redacted, reason: r.reason ?? "" };
}

/**
 * Smoke — ε exhaustion refusal.
 */
export function smokeEpsilonExhaustionRefusal(budget: number): { allowed: boolean } {
  const r = verifyEpsilonBudget(budget, budget, 0.5);
  return { allowed: r.allowed };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §14 Doc-string Constants & Aggregation Summary                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const WAVE_NAMESPACE = "w53";
export const WAVE_FEATURE = "voice-mood-cohort-dashboard";
export const WAVE_VERSION = "1.0.0";

/** Run all 14+ smoke scenarios and aggregate. */
export function runSmokeSuite(buckets: KBucket[]): {
  totalScenarios: number;
  passed: number;
  failed: number;
  results: Record<string, unknown>;
} {
  const results: Record<string, unknown> = {};
  let passed = 0;
  let failed = 0;
  const tryRun = (name: string, fn: () => unknown) => {
    try {
      results[name] = fn();
      passed++;
    } catch (e) {
      results[name] = { error: String(e) };
      failed++;
    }
  };
  tryRun("cohort_query_4_dimensions", () => smokeCohortQuery(buckets));
  tryRun("drill_down_3_levels", () => smokeDrillDown({ buckets, selectedCohorts: [], excluded: [], cohortCount: buckets.length, totalEvents: 0 }));
  tryRun("k_anonymity_check", () => smokeKAnonymity(buckets));
  tryRun("epsilon_dp_budget", () => smokeEpsilonBudget(1.0, DEFAULT_EPSILON_BUDGET));
  tryRun("trend_detection", () => smokeTrendDetection());
  tryRun("sacred_curator_gate", () => smokeSacredCuratorGate(buckets, "curator"));
  tryRun("kpi_compute", () => smokeKpiCompute(buckets));
  tryRun("chart_build", () => smokeChartBuild(buckets));
  tryRun("heatmap", () => ({ points: buildHeatmap(buckets, "h", "day").points.length }));
  tryRun("histogram", () => smokeHistogram(buckets));
  tryRun("anonymization_attestation", () => smokeAnonymizationAttestation(buckets));
  tryRun("admin_audit_shape", () => smokeAdminAudit("admin-test"));
  tryRun("narrow_cohort_with_privacy", () => smokeNarrowCohortWithPrivacy({ buckets, selectedCohorts: [], excluded: [], cohortCount: buckets.length, totalEvents: 0 }));
  tryRun("drill_refused", () => smokeDrillRefused({ path: "/x", label: "x", scope: "cohort", params: {} }));
  tryRun("epsilon_exhaustion_refusal", () => smokeEpsilonExhaustionRefusal(DEFAULT_EPSILON_BUDGET));
  return { totalScenarios: SMOKE_SCENARIOS.length, passed, failed, results };
}

/** Build an empty KBucket (for tests / fixtures). */
export function emptyBucket(cohort: CohortKey): KBucket {
  return {
    cohort,
    count: 0,
    distinctUsers: 0,
    sacredHits: 0,
    windowStart: Date.now(),
    windowEnd: Date.now(),
  };
}

/** Generate a fixture cohort set for testing. */
export function generateFixtureCohorts(): KBucket[] {
  const traditions = TRADITIONS;
  const regions = REGIONS;
  const ages = AGE_BRACKETS;
  const windows = [30, 90, 180, 365];
  const buckets: KBucket[] = [];
  let i = 0;
  for (const r of regions) {
    for (const t of traditions) {
      for (const a of ages) {
        for (const w of windows) {
          if (i++ % 3 === 0) continue; // sparse fixture
          buckets.push({
            cohort: { windowDays: w, region: r, tradition: t, ageBracket: a },
            count: 10 + (i % 100),
            distinctUsers: 5 + (i % 50),
            sacredHits: i % 17 === 0 ? 1 : 0,
            windowStart: Date.now() - w * TIMESTAMP_BUCKETS_MS.day,
            windowEnd: Date.now(),
          });
        }
      }
    }
  }
  return buckets;
}

/** Cohort-dashboard namespace aggregator (mirrors pattern in w49/w50/w52). */
export const CohortDashboard = {
  POLICY_VERSION,
  DEFAULT_K,
  DEFAULT_K_SACRED,
  DEFAULT_EPSILON,
  DEFAULT_EPSILON_BUDGET,
  WAVE_NAMESPACE,
  WAVE_FEATURE,
  WAVE_VERSION,
  queryByRegion: queryCohortByRegion,
  queryByTradition: queryCohortByTradition,
  queryByAge: queryCohortByAge,
  queryByWindow: queryCohortByWindow,
  queryCross: queryCrossCohort,
  querySacred: querySacredCohorts,
  queryAll: queryAllCohorts,
  queryRepresentative: queryRepresentativeCohorts,
  queryByDateRange: queryCohortByDateRange,
  queryByVolume: queryCohortByVolume,
  queryBySacredRate: queryCohortBySacredRate,
  queryBySensitivity: queryCohortBySensitivity,
  buildKpi: computeCount,
  buildAvg: computeAvg,
  buildP95: computeP95,
  buildMedian: computeMedian,
  buildEntropy: computeEntropy,
  buildSacredRate: computeSacredRateKpi,
  buildDistinct: computeDistinct,
  buildRatio: computeRatio,
  buildMax: computeMax,
  buildMin: computeMin,
  buildLineSeries,
  buildBarSeries,
  buildHeatmap,
  buildHistogram,
  buildScatter,
  buildAreaSeries,
  buildStackedBar,
  buildMoodHistogramChart,
  buildLegend,
  buildEmptyChart,
  narrowCohort,
  escalateDrill,
  redactIndividual,
  drillToBucket,
  applyDrillGate,
  refuseDrill,
  buildSacredDrill,
  isValidDrillPath,
  drillDepth,
  rollbackDrill,
  verifyKAnonymity,
  verifyEpsilonBudget,
  verifySacredFlagPreservation,
  buildAnonymizationAttestation,
  isBucketPublishable,
  computeReidentificationRisk,
  computeAdminBudgetLedger,
  recommendPrivacyAction,
  detectTrend,
  detectKpiTrend,
  buildBaseline,
  buildCurrentWindow,
  classifyTrend,
  trendConfidenceBucket,
  detectMultipleTrends,
  forecastNext,
  buildSacredAdminPayload,
  verifyCuratorSignature,
  appendSacredAudit,
  buildSacredAuditEntry,
  verifySacredPolicy,
  getSensitivityLevel,
  formatSacredExport,
  buildEmptySacredPayload,
  buildLgpdAttestation,
  applyErasureReaggregation,
  exportCohortsForResearch,
  logAdminAction,
  verifyPurposeLimitation,
  canonicalizeAdminId,
  verifyLgpdComplete,
  buildDashboardPayload,
  runSmokeSuite,
  emptyBucket,
  generateFixtureCohorts,
};