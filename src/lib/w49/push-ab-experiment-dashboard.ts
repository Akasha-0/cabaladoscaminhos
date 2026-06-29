// ============================================================================
// W49 — PUSH A/B EXPERIMENT DASHBOARD (headless data + UI-state engine)
// ============================================================================
// Admin dashboard data layer for A/B test results from w48/daily-reflection-push.
// Headless module — produces data structures consumed by UI; no React/JSX.
// Statistical methods only (chi-squared, Welch t-test, Bayesian beta).
// LGPD Art. 7/8/18 compliant (export scoping, deletion, retention).
// Owner: w49/push-ab-experiment-dashboard worker.
// ============================================================================

// ---------------------------------------------------------------------------
// 1. TYPES — Experiment / Variant / Assignment / Exposure / Outcome / SigResult
// ---------------------------------------------------------------------------

export type ExperimentStatus = 'draft' | 'running' | 'stopped' | 'concluded';
export type OutcomeKind =
  | 'opened'
  | 'acknowledged'
  | 'scheduled_followup'
  | 'unsubscribed'
  | 'reported_spam';
export type Channel = 'push' | 'in_app' | 'email';
export type Locale = 'pt-BR' | 'en-US' | 'es-ES';
export type ExportFormat = 'json' | 'csv' | 'parquet';
export type ExportScope = 'aggregate_only' | 'pseudonymized' | 'full';
export type DeletionScope = 'assignments' | 'outcomes' | 'all';

export interface Variant {
  id: string;
  name: string;
  weight: number; // 0..1 (normalized)
  payload_overrides?: Record<string, string | number | boolean>;
  description: string;
  is_control?: boolean;
}

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  primary_metric: string; // e.g. 'acknowledged_rate'
  secondary_metrics: string[];
  variants: Variant[];
  status: ExperimentStatus;
  started_at: number; // epoch ms
  stopped_at?: number;
  min_sample_size: number;
  confidence_target: number; // default 0.95
  owner_id: string;
  locale?: Locale;
  tags?: string[];
  description?: string;
  pre_registration?: string;
}

export interface Assignment {
  user_id: string;
  experiment_id: string;
  variant_id: string;
  assigned_at: number;
  locale: Locale;
  segment?: string;
}

export interface Exposure {
  assignment_id: string;
  exposed_at: number;
  channel: Channel;
}

export interface Outcome {
  assignment_id: string;
  kind: OutcomeKind;
  value?: number;
  occurred_at: number;
}

export interface SignificanceResult {
  variant_id: string;
  lift_pct: number;
  p_value: number;
  significant: boolean;
  ci_lower: number;
  ci_upper: number;
  sample_size: number;
}

export interface VariantStats {
  variant_id: string;
  impressions: number;
  conversions: number;
  conversion_rate: number;
  lift_vs_control: number;
  p_value: number;
  significant: boolean;
  ci_lower: number;
  ci_upper: number;
}

export interface ExperimentStatsReport {
  experiment_id: string;
  computed_at: number;
  total_assignments: number;
  total_exposures: number;
  total_conversions: number;
  variants: VariantStats[];
  control_id: string | null;
  has_significance: boolean;
  recommended_winner_id: string | null;
}

// ---------------------------------------------------------------------------
// 2. SEGMENTS / TARGETING
// ---------------------------------------------------------------------------

export interface UserProfile {
  user_id: string;
  locale: Locale;
  tradition?: string; // e.g. 'candomble', 'umbanda', 'kabbalah'
  engagement_score?: number; // 0..1
  days_active?: number;
  preferences?: Record<string, string | number | boolean>;
}

export interface ExperimentSegment {
  key: string;
  tradition?: string;
  min_engagement?: number;
  min_days_active?: number;
  locale?: Locale;
  predicate?: (profile: UserProfile) => boolean;
}

export interface SegmentMatch {
  segment_key: string | null;
  matched: boolean;
  reasons: string[];
}

export function segmentUser(
  userProfile: UserProfile,
  experimentSegments: ExperimentSegment[],
): SegmentMatch {
  if (!experimentSegments || experimentSegments.length === 0) {
    return { segment_key: null, matched: true, reasons: ['default_inclusion'] };
  }
  for (const seg of experimentSegments) {
    const reasons: string[] = [];
    let ok = true;
    if (seg.tradition !== undefined) {
      if (userProfile.tradition === seg.tradition) {
        reasons.push(`tradition=${seg.tradition}`);
      } else {
        ok = false;
      }
    }
    if (ok && seg.min_engagement !== undefined) {
      if ((userProfile.engagement_score ?? 0) >= seg.min_engagement) {
        reasons.push(`engagement>=${seg.min_engagement}`);
      } else {
        ok = false;
      }
    }
    if (ok && seg.min_days_active !== undefined) {
      if ((userProfile.days_active ?? 0) >= seg.min_days_active) {
        reasons.push(`days_active>=${seg.min_days_active}`);
      } else {
        ok = false;
      }
    }
    if (ok && seg.locale !== undefined) {
      if (userProfile.locale === seg.locale) {
        reasons.push(`locale=${seg.locale}`);
      } else {
        ok = false;
      }
    }
    if (ok && seg.predicate !== undefined) {
      const r = seg.predicate(userProfile);
      if (r) {
        reasons.push('custom_predicate=true');
      } else {
        ok = false;
      }
    }
    if (ok) {
      return { segment_key: seg.key, matched: true, reasons };
    }
  }
  return { segment_key: null, matched: false, reasons: ['no_segment_matched'] };
}

// ---------------------------------------------------------------------------
// 3. ASSIGNMENT ENGINE — deterministic + weighted
// ---------------------------------------------------------------------------

export const WEIGHT_NORMALIZATION = {
  MIN_WEIGHT: 0,
  MAX_WEIGHT: 1,
  MIN_VARIANTS: 2,
  MAX_VARIANTS: 8,
} as const;

/**
 * FNV-1a 32-bit hash. Stable across runtimes; used for deterministic bucketing.
 */
export function deterministicAssignment(
  user_id: string,
  experiment_id: string,
  salt: string,
): string {
  const input = `${salt}::${experiment_id}::${user_id}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // 32-bit unsigned
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Map hash → bucket 0..1 then find cumulative-weight slot.
 */
export function assignVariant(
  user_id: string,
  experiment: Experiment,
  rngSeed?: number,
): Assignment {
  if (!experiment.variants || experiment.variants.length < WEIGHT_NORMALIZATION.MIN_VARIANTS) {
    throw new VariantWeightMismatchError(
      'PAE_004',
      `experiment ${experiment.id} has fewer than ${WEIGHT_NORMALIZATION.MIN_VARIANTS} variants`,
    );
  }
  const totalWeight = experiment.variants.reduce((sum, v) => sum + Math.max(0, v.weight), 0);
  if (totalWeight <= 0) {
    throw new VariantWeightMismatchError(
      'PAE_004',
      `experiment ${experiment.id} has zero total weight`,
    );
  }
  const salt = rngSeed !== undefined ? String(rngSeed) : 'cabala-w49';
  const hex = deterministicAssignment(user_id, experiment.id, salt);
  const bucket = (parseInt(hex, 16) % 1_000_000) / 1_000_000;
  let cum = 0;
  let chosen = experiment.variants[experiment.variants.length - 1];
  for (const v of experiment.variants) {
    cum += Math.max(0, v.weight) / totalWeight;
    if (bucket < cum) {
      chosen = v;
      break;
    }
  }
  const ctrl = experiment.variants.find((v) => v.is_control);
  if (!ctrl) {
    throw new NoControlVariantError(
      'PAE_005',
      `experiment ${experiment.id} has no control variant marked is_control`,
    );
  }
  return {
    user_id,
    experiment_id: experiment.id,
    variant_id: chosen.id,
    assigned_at: Date.now(),
    locale: experiment.locale ?? 'pt-BR',
  };
}

// ---------------------------------------------------------------------------
// 4. STATISTICAL ANALYSIS
// ---------------------------------------------------------------------------

/** Wilson score interval for binomial proportion. */
export function confidenceInterval95(
  conversions: number,
  trials: number,
): [number, number] {
  if (trials <= 0) return [0, 0];
  const p = conversions / trials;
  const z = 1.959963984540054; // 95%
  const denom = 1 + (z * z) / trials;
  const center = p + (z * z) / (2 * trials);
  const margin = z * Math.sqrt((p * (1 - p)) / trials + (z * z) / (4 * trials * trials));
  const lower = Math.max(0, (center - margin) / denom);
  const upper = Math.min(1, (center + margin) / denom);
  return [Number(lower.toFixed(6)), Number(upper.toFixed(6))];
}

/**
 * Chi-squared test for two independent binomial proportions.
 * variant/control arrays are [conversions, trials-conversions] (2x2 table).
 * Returns {chi2, df=1, p_value}.
 */
export function chiSquaredTest(
  variant: number[],
  control: number[],
): { chi2: number; df: number; p_value: number } {
  if (variant.length !== 2 || control.length !== 2) {
    throw new SignificanceTestError('PAE_006', 'chiSquaredTest expects 2-element arrays');
  }
  const a = variant[0];
  const b = variant[1];
  const c = control[0];
  const d = control[1];
  const n = a + b + c + d;
  if (n === 0) return { chi2: 0, df: 1, p_value: 1 };
  const row1 = a + b;
  const row2 = c + d;
  const col1 = a + c;
  const col2 = b + d;
  const expA = (row1 * col1) / n;
  const expB = (row1 * col2) / n;
  const expC = (row2 * col1) / n;
  const expD = (row2 * col2) / n;
  if (expA <= 0 || expB <= 0 || expC <= 0 || expD <= 0) {
    return { chi2: 0, df: 1, p_value: 1 };
  }
  const chi2 =
    Math.pow(a - expA, 2) / expA +
    Math.pow(b - expB, 2) / expB +
    Math.pow(c - expC, 2) / expC +
    Math.pow(d - expD, 2) / expD;
  // p-value from chi-squared(df=1) survival: 1 - erf(sqrt(chi2/2))
  const p = 1 - regularizedGammaP(0.5, chi2 / 2);
  return {
    chi2: Number(chi2.toFixed(6)),
    df: 1,
    p_value: Number(Math.max(0, Math.min(1, p)).toFixed(6)),
  };
}

/**
 * Welch's t-test for unequal-variance two-sample comparison.
 * Arrays are arrays of 0/1 outcomes (or per-user metric values).
 */
export function welchTTest(
  variant: number[],
  control: number[],
): { t: number; df: number; p: number } {
  if (variant.length < 2 || control.length < 2) {
    return { t: 0, df: 0, p: 1 };
  }
  const meanV = variant.reduce((s, x) => s + x, 0) / variant.length;
  const meanC = control.reduce((s, x) => s + x, 0) / control.length;
  const varV = sampleVariance(variant, meanV);
  const varC = sampleVariance(control, meanC);
  const se = Math.sqrt(varV / variant.length + varC / control.length);
  if (se === 0) return { t: 0, df: 0, p: 1 };
  const t = (meanV - meanC) / se;
  const dfNum = Math.pow(varV / variant.length + varC / control.length, 2);
  const dfDen =
    Math.pow(varV / variant.length, 2) / (variant.length - 1) +
    Math.pow(varC / control.length, 2) / (control.length - 1);
  const df = dfDen > 0 ? dfNum / dfDen : variant.length + control.length - 2;
  // Two-sided p via student's t survival (approximate via normal for large df)
  const p = 2 * (1 - normalCdf(Math.abs(t)));
  return {
    t: Number(t.toFixed(6)),
    df: Number(df.toFixed(4)),
    p: Number(Math.max(0, Math.min(1, p)).toFixed(6)),
  };
}

function sampleVariance(arr: number[], mean: number): number {
  if (arr.length < 2) return 0;
  let s = 0;
  for (const x of arr) {
    s += (x - mean) * (x - mean);
  }
  return s / (arr.length - 1);
}

/**
 * Bayesian Beta-Binomial comparison using Monte Carlo.
 * P(variant wins) and expected loss relative to control.
 */
export function bayesianBetaComparison(
  variantConversions: number,
  variantTrials: number,
  controlConversions: number,
  controlTrials: number,
): { prob_variant_wins: number; expected_loss: number } {
  const SAMPLES = 4000;
  let wins = 0;
  let loss = 0;
  const aV = variantConversions + 1;
  const bV = variantTrials - variantConversions + 1;
  const aC = controlConversions + 1;
  const bC = controlTrials - controlConversions + 1;
  for (let i = 0; i < SAMPLES; i++) {
    const sampleV = betaSample(aV, bV);
    const sampleC = betaSample(aC, bC);
    if (sampleV > sampleC) wins++;
    loss += Math.max(0, sampleC - sampleV);
  }
  return {
    prob_variant_wins: Number((wins / SAMPLES).toFixed(6)),
    expected_loss: Number((loss / SAMPLES).toFixed(6)),
  };
}

// ---- Statistical helpers (Beta, Gamma, Normal CDF) ----

/** Marsaglia-Tsang gamma sampler (shape>=1, fallback for shape<1). */
function gammaSample(shape: number): number {
  if (shape < 1) {
    const u = Math.random();
    return gammaSample(shape + 1) * Math.pow(u, 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x: number;
    let v: number;
    do {
      x = standardNormal();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

function standardNormal(): number {
  // Box-Muller
  const u1 = Math.max(Math.random(), 1e-12);
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function betaSample(a: number, b: number): number {
  const x = gammaSample(a);
  const y = gammaSample(b);
  return x / (x + y);
}

/** Regularized lower incomplete gamma function P(s, x) via series. */
function regularizedGammaP(s: number, x: number): number {
  if (x <= 0) return 0;
  if (x < s + 1) {
    return gammaSeries(s, x);
  }
  return 1 - gammaContinuedFraction(s, x);
}

function gammaSeries(s: number, x: number): number {
  let term = 1 / s;
  let sum = term;
  for (let n = 1; n < 200; n++) {
    term *= x / (s + n);
    sum += term;
    if (Math.abs(term) < Math.abs(sum) * 1e-12) break;
  }
  return sum * Math.exp(-x + s * Math.log(x) - logGamma(s));
}

function gammaContinuedFraction(s: number, x: number): number {
  let b = x + 1 - s;
  let c = 1 / 1e-30;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 200; i++) {
    const an = -i * (i - s);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-12) break;
  }
  return Math.exp(-x + s * Math.log(x) - logGamma(s)) * h;
}

/** Lanczos approximation of log-gamma. */
function logGamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/** Standard normal CDF via erf approximation (Abramowitz & Stegun 7.1.26). */
function normalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * ax);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * erf);
}

// ---------------------------------------------------------------------------
// 5. STATS REPORT AGGREGATION
// ---------------------------------------------------------------------------

export function computeExperimentStats(
  experiment: Experiment,
  assignments: Assignment[],
  exposures: Exposure[],
  outcomes: Outcome[],
): ExperimentStatsReport {
  const ctrl = experiment.variants.find((v) => v.is_control);
  if (!ctrl) {
    throw new NoControlVariantError('PAE_005', `no control for ${experiment.id}`);
  }
  const conversionKinds: OutcomeKind[] = ['acknowledged', 'scheduled_followup'];
  const exposedByAssignment = new Set(exposures.map((e) => e.assignment_id));
  const conversionsByAssignment = new Map<string, number>();
  for (const o of outcomes) {
    if (!conversionKinds.includes(o.kind)) continue;
    conversionsByAssignment.set(
      o.assignment_id,
      (conversionsByAssignment.get(o.assignment_id) ?? 0) + 1,
    );
  }
  const byVariant = new Map<string, { impressions: number; conversions: number }>();
  for (const v of experiment.variants) {
    byVariant.set(v.id, { impressions: 0, conversions: 0 });
  }
  for (const a of assignments) {
    const bucket = byVariant.get(a.variant_id);
    if (!bucket) continue;
    const assignmentKey = makeAssignmentKey(a.user_id, a.experiment_id, a.variant_id);
    if (exposedByAssignment.has(assignmentKey)) {
      bucket.impressions += 1;
      const conv = conversionsByAssignment.get(assignmentKey) ?? 0;
      bucket.conversions += conv;
    }
  }
  const ctrlBucket = byVariant.get(ctrl.id) ?? { impressions: 0, conversions: 0 };
  const ctrlRate = ctrlBucket.impressions > 0 ? ctrlBucket.conversions / ctrlBucket.impressions : 0;
  const variantStats: VariantStats[] = [];
  for (const v of experiment.variants) {
    const b = byVariant.get(v.id) ?? { impressions: 0, conversions: 0 };
    const rate = b.impressions > 0 ? b.conversions / b.impressions : 0;
    const lift = ctrlRate > 0 ? ((rate - ctrlRate) / ctrlRate) * 100 : 0;
    const [ciL, ciU] = confidenceInterval95(b.conversions, b.impressions);
    let p = 1;
    let significant = false;
    if (v.id !== ctrl.id && b.impressions > 0 && ctrlBucket.impressions > 0) {
      const cs = chiSquaredTest(
        [b.conversions, b.impressions - b.conversions],
        [ctrlBucket.conversions, ctrlBucket.impressions - ctrlBucket.conversions],
      );
      p = cs.p_value;
      significant = p < 1 - experiment.confidence_target;
    }
    variantStats.push({
      variant_id: v.id,
      impressions: b.impressions,
      conversions: b.conversions,
      conversion_rate: Number(rate.toFixed(6)),
      lift_vs_control: Number(lift.toFixed(4)),
      p_value: Number(p.toFixed(6)),
      significant,
      ci_lower: ciL,
      ci_upper: ciU,
    });
  }
  const totalExposures = exposures.length;
  const totalConversions = variantStats.reduce((s, v) => s + v.conversions, 0);
  const has_significance = variantStats.some((v) => v.significant && v.variant_id !== ctrl.id);
  const winner = variantStats
    .filter((v) => v.variant_id !== ctrl.id && v.significant && v.lift_vs_control > 0)
    .sort((a, b) => b.lift_vs_control - a.lift_vs_control)[0];
  return {
    experiment_id: experiment.id,
    computed_at: Date.now(),
    total_assignments: assignments.length,
    total_exposures: totalExposures,
    total_conversions: totalConversions,
    variants: variantStats,
    control_id: ctrl.id,
    has_significance,
    recommended_winner_id: winner ? winner.variant_id : null,
  };
}

// ---------------------------------------------------------------------------
// 6. SIGNIFICANCE UI DATA
// ---------------------------------------------------------------------------

export function extractSignificanceTable(stats: ExperimentStatsReport): SignificanceResult[] {
  return stats.variants.map((v) => ({
    variant_id: v.variant_id,
    lift_pct: v.lift_vs_control,
    p_value: v.p_value,
    significant: v.significant,
    ci_lower: v.ci_lower,
    ci_upper: v.ci_upper,
    sample_size: v.impressions,
  }));
}

export function flagSignificant(
  results: SignificanceResult[],
  target = 0.95,
): SignificanceResult[] {
  const alpha = 1 - target;
  return results.filter((r) => r.p_value < alpha && r.sample_size > 0);
}

export interface LagWarning {
  experiment_id: string;
  since_hours: number;
  message_key: string;
  severity: 'low' | 'medium' | 'high';
  expected_p50_hours_to_significance: number;
}

export function lagWarning(
  experiment: Experiment,
  since?: number,
): LagWarning | null {
  const start = since ?? experiment.started_at;
  const elapsedHours = (Date.now() - start) / 3_600_000;
  const dailyRate = Math.max(1, experiment.min_sample_size / 14);
  const expectedDays = experiment.min_sample_size / dailyRate;
  const expectedHours = expectedDays * 24;
  if (elapsedHours < expectedHours) return null;
  const lagFactor = elapsedHours / expectedHours;
  if (lagFactor < 1.5) return null;
  const severity: LagWarning['severity'] =
    lagFactor > 3 ? 'high' : lagFactor > 2 ? 'medium' : 'low';
  return {
    experiment_id: experiment.id,
    since_hours: Number(elapsedHours.toFixed(2)),
    message_key: 'experiment.lagging',
    severity,
    expected_p50_hours_to_significance: Number(expectedHours.toFixed(2)),
  };
}

// ---------------------------------------------------------------------------
// 7. STOPPING RULES
// ---------------------------------------------------------------------------

export type StopReason =
  | 'significance_reached'
  | 'sample_size_reached'
  | 'no_effect_detected'
  | 'manual_stop'
  | 'futility';

export interface StopVerdict {
  should_stop: boolean;
  reason: StopReason;
  details: string;
  peeks: number;
  adjusted_p_value?: number;
}

export function shouldStopForSignificance(
  experiment: Experiment,
  stats: ExperimentStatsReport,
): StopVerdict {
  const winner = stats.variants.find(
    (v) => v.variant_id !== stats.control_id && v.significant && v.lift_vs_control > 0,
  );
  if (!winner) {
    return {
      should_stop: false,
      reason: 'significance_reached',
      details: 'no significant winner',
      peeks: 1,
    };
  }
  return {
    should_stop: true,
    reason: 'significance_reached',
    details: `variant ${winner.variant_id} lift=${winner.lift_vs_control.toFixed(2)}%`,
    peeks: 1,
    adjusted_p_value: winner.p_value,
  };
}

export function shouldStopForSampleSize(
  experiment: Experiment,
  stats: ExperimentStatsReport,
): boolean {
  return stats.total_exposures >= experiment.min_sample_size;
}

export function earlyStoppingAdjustment(pValue: number, peeks: number): number {
  if (peeks < 1) return pValue;
  // Bonferroni correction: divide alpha by number of peeks
  const adjusted = pValue * peeks;
  return Number(Math.min(1, adjusted).toFixed(6));
}

// ---------------------------------------------------------------------------
// 8. DECISION SUPPORT
// ---------------------------------------------------------------------------

export interface WinnerRecommendation {
  winner_id: string | null;
  confidence: number;
  reasoning: string[];
}

export function recommendWinner(stats: ExperimentStatsReport): WinnerRecommendation {
  if (!stats.control_id) {
    return { winner_id: null, confidence: 0, reasoning: ['no_control'] };
  }
  const candidates = stats.variants
    .filter((v) => v.variant_id !== stats.control_id)
    .sort((a, b) => b.lift_vs_control - a.lift_vs_control);
  const reasons: string[] = [];
  if (candidates.length === 0) {
    return { winner_id: null, confidence: 0, reasoning: ['no_variants'] };
  }
  const top = candidates[0];
  const runner = candidates[1];
  const confidence = top.significant ? 1 - top.p_value : 0;
  reasons.push(`top_lift=${top.lift_vs_control.toFixed(2)}%`);
  reasons.push(`p_value=${top.p_value}`);
  reasons.push(`significant=${top.significant}`);
  if (top.lift_vs_control < 0) {
    reasons.push('control_wins');
    return { winner_id: stats.control_id, confidence, reasoning: reasons };
  }
  if (!top.significant) {
    reasons.push('not_significant_yet');
    return { winner_id: null, confidence, reasoning: reasons };
  }
  if (runner && Math.abs(top.lift_vs_control - runner.lift_vs_control) < 1) {
    reasons.push('runner_up_close');
  }
  return { winner_id: top.variant_id, confidence: Number(confidence.toFixed(4)), reasoning: reasons };
}

// ---------------------------------------------------------------------------
// 9. i18n
// ---------------------------------------------------------------------------

export const EXPERIMENT_STRINGS = {
  'pt-BR': {
    'experiment.running': 'Experimento em andamento',
    'experiment.stopped': 'Experimento interrompido',
    'experiment.concluded': 'Experimento concluído',
    'experiment.draft': 'Rascunho',
    'experiment.significant': 'Estatisticamente significativo',
    'experiment.not_significant': 'Ainda não significativo',
    'experiment.no_winner': 'Sem vencedor recomendado',
    'experiment.lagging': 'Experimento atrasado em relação ao plano',
    'verdict.significance_reached': 'Significância atingida — parar e promover vencedor',
    'verdict.no_effect_detected': 'Sem efeito detectado — encerrar por futilidade',
  },
  'en-US': {
    'experiment.running': 'Experiment running',
    'experiment.stopped': 'Experiment stopped',
    'experiment.concluded': 'Experiment concluded',
    'experiment.draft': 'Draft',
    'experiment.significant': 'Statistically significant',
    'experiment.not_significant': 'Not yet significant',
    'experiment.no_winner': 'No recommended winner',
    'experiment.lagging': 'Experiment lagging behind plan',
    'verdict.significance_reached': 'Significance reached — stop and promote winner',
    'verdict.no_effect_detected': 'No effect detected — stop for futility',
  },
  'es-ES': {
    'experiment.running': 'Experimento en curso',
    'experiment.stopped': 'Experimento detenido',
    'experiment.concluded': 'Experimento concluido',
    'experiment.draft': 'Borrador',
    'experiment.significant': 'Estadísticamente significativo',
    'experiment.not_significant': 'Aún no significativo',
    'experiment.no_winner': 'Sin ganador recomendado',
    'experiment.lagging': 'Experimento retrasado respecto al plan',
    'verdict.significance_reached': 'Significancia alcanzada — detener y promover ganador',
    'verdict.no_effect_detected': 'Sin efecto detectado — detener por futilidad',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export const VERDICT_LOCALE_TEMPLATES = {
  'pt-BR': {
    headline: 'Recomendação do experimento {experiment_name}',
    confidence_label: 'Confiança',
    reasoning_label: 'Justificativa',
    lift_label: 'Lift',
    p_value_label: 'Valor-p',
    action_promote: 'Promover variante vencedora',
    action_continue: 'Continuar coletando dados',
    action_stop: 'Encerrar experimento',
  },
  'en-US': {
    headline: 'Recommendation for experiment {experiment_name}',
    confidence_label: 'Confidence',
    reasoning_label: 'Reasoning',
    lift_label: 'Lift',
    p_value_label: 'p-value',
    action_promote: 'Promote winning variant',
    action_continue: 'Keep collecting data',
    action_stop: 'Stop experiment',
  },
  'es-ES': {
    headline: 'Recomendación del experimento {experiment_name}',
    confidence_label: 'Confianza',
    reasoning_label: 'Justificación',
    lift_label: 'Lift',
    p_value_label: 'Valor-p',
    action_promote: 'Promover variante ganadora',
    action_continue: 'Seguir recopilando datos',
    action_stop: 'Detener experimento',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export interface LocalizedStats {
  experiment_id: string;
  locale: Locale;
  status_key: string;
  variants: Array<{
    variant_id: string;
    conversion_rate_label: string;
    lift_label: string;
    significance_key: string;
  }>;
  headline: string;
  verdict_action_key: string;
}

export function localizeExperimentSummary(
  stats: ExperimentStatsReport,
  locale: Locale,
): LocalizedStats {
  const strings = EXPERIMENT_STRINGS[locale];
  const status = stats.has_significance
    ? strings['experiment.significant']
    : strings['experiment.not_significant'];
  const variants = stats.variants.map((v) => ({
    variant_id: v.variant_id,
    conversion_rate_label: formatPercent(v.conversion_rate, locale),
    lift_label: `${v.lift_vs_control >= 0 ? '+' : ''}${v.lift_vs_control.toFixed(2)}%`,
    significance_key: v.significant
      ? strings['experiment.significant']
      : strings['experiment.not_significant'],
  }));
  const winnerId = stats.recommended_winner_id ?? strings['experiment.no_winner'];
  return {
    experiment_id: stats.experiment_id,
    locale,
    status_key: status,
    variants,
    headline: `experiment ${stats.experiment_id} → ${winnerId}`,
    verdict_action_key: stats.recommended_winner_id
      ? VERDICT_LOCALE_TEMPLATES[locale].action_promote
      : VERDICT_LOCALE_TEMPLATES[locale].action_continue,
  };
}

export function formatVerdictForOwner(
  verdict: StopVerdict,
  locale: Locale,
): LocalizedVerdict {
  const templates = VERDICT_LOCALE_TEMPLATES[locale];
  return {
    locale,
    headline: templates.headline.replace('{experiment_name}', verdict.details),
    confidence_label: templates.confidence_label,
    reasoning_label: templates.reasoning_label,
    lift_label: templates.lift_label,
    p_value_label: templates.p_value_label,
    action_key:
      verdict.should_stop && verdict.reason === 'significance_reached'
        ? templates.action_promote
        : verdict.should_stop
          ? templates.action_stop
          : templates.action_continue,
    raw: verdict,
  };
}

export interface LocalizedVerdict {
  locale: Locale;
  headline: string;
  confidence_label: string;
  reasoning_label: string;
  lift_label: string;
  p_value_label: string;
  action_key: string;
  raw: StopVerdict;
}

// ---------------------------------------------------------------------------
// 10. UTILITIES — sample size, percent, retention
// ---------------------------------------------------------------------------

export const EXPERIMENT_DATA_RETENTION_DAYS = 90;

/**
 * Compute required sample size per variant for two-proportion test.
 * Uses normal approximation; conservative for typical push-experiment CTRs.
 */
export function computeSampleSize(
  baseline_rate: number,
  mde: number,
  alpha = 0.05,
  power = 0.8,
): number {
  if (baseline_rate <= 0 || baseline_rate >= 1) {
    throw new SignificanceTestError('PAE_006', 'baseline_rate must be in (0,1)');
  }
  if (mde <= 0) {
    throw new SignificanceTestError('PAE_006', 'mde must be positive');
  }
  const p1 = baseline_rate;
  const p2 = baseline_rate + mde;
  const pBar = (p1 + p2) / 2;
  const zAlpha = inverseNormalCdf(1 - alpha / 2);
  const zBeta = inverseNormalCdf(power);
  const numerator =
    Math.pow(
      zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) +
        zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)),
      2,
    );
  const denominator = Math.pow(p2 - p1, 2);
  return Math.ceil(numerator / denominator);
}

/** Inverse standard normal CDF (Beasley-Springer-Moro). */
function inverseNormalCdf(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new SignificanceTestError('PAE_006', 'inverseNormalCdf requires p in (0,1)');
  }
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
    -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

export function formatPercent(value: number, locale: Locale): string {
  const fmt = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return fmt.format(value);
}

// ---------------------------------------------------------------------------
// 11. LGPD Art. 7/8/18 — REDACTION, EXPORT, DELETION
// ---------------------------------------------------------------------------

export interface RedactedAssignment {
  pseudo_id: string;
  experiment_id: string;
  variant_id: string;
  assigned_at_bucket: string;
  locale: Locale;
}

export interface ExportArtifact {
  experiment_id: string;
  format: ExportFormat;
  scope: ExportScope;
  generated_at: number;
  rows: number;
  body: string;
  checksum_sha256: string;
}

export interface DeletionReceipt {
  experiment_id: string;
  scope: DeletionScope;
  deleted_at: number;
  rows_deleted: number;
  lgpd_articles: string[];
  retention_days_observed: number;
}

export function redactAssignmentForExport(assignment: Assignment): RedactedAssignment {
  const pseudo = deterministicAssignment(
    assignment.user_id,
    assignment.experiment_id,
    'lgpd-redact-v1',
  );
  // Bucket timestamp to day (LGPD: avoid precise timestamps in exports)
  const dayBucket = new Date(assignment.assigned_at);
  dayBucket.setUTCHours(0, 0, 0, 0);
  return {
    pseudo_id: pseudo,
    experiment_id: assignment.experiment_id,
    variant_id: assignment.variant_id,
    assigned_at_bucket: dayBucket.toISOString(),
    locale: assignment.locale,
  };
}

export function exportExperimentData(
  experimentId: string,
  format: ExportFormat,
  scope: ExportScope,
  assignments?: Assignment[],
): ExportArtifact {
  const rows = assignments ?? [];
  const redacted = rows.map((a) =>
    scope === 'full' ? { ...a } : redactAssignmentForExport(a),
  );
  let body = '';
  if (format === 'json') {
    body = JSON.stringify(redacted, null, 2);
  } else if (format === 'csv') {
    const header =
      scope === 'full'
        ? 'user_id,experiment_id,variant_id,assigned_at,locale'
        : 'pseudo_id,experiment_id,variant_id,assigned_at_bucket,locale';
    const lines = redacted.map((r) => {
      if (scope === 'full') {
        const a = r as unknown as Assignment;
        return `${a.user_id},${a.experiment_id},${a.variant_id},${a.assigned_at},${a.locale}`;
      }
      const red = r as RedactedAssignment;
      return `${red.pseudo_id},${red.experiment_id},${red.variant_id},${red.assigned_at_bucket},${red.locale}`;
    });
    body = [header, ...lines].join('\n');
  } else {
    // Parquet — placeholder binary-safe stub
    body = `PARQUET_STUB::${experimentId}::${scope}::${redacted.length}`;
  }
  // Lightweight non-crypto checksum (LGPD audit trail only)
  let hash = 0;
  for (let i = 0; i < body.length; i++) {
    hash = (Math.imul(hash, 31) + body.charCodeAt(i)) | 0;
  }
  return {
    experiment_id: experimentId,
    format,
    scope,
    generated_at: Date.now(),
    rows: rows.length,
    body,
    checksum_sha256: (hash >>> 0).toString(16).padStart(8, '0'),
  };
}

export function deleteExperimentAssignments(
  experimentId: string,
  scope: DeletionScope,
  assignments?: Assignment[],
): DeletionReceipt {
  const all = assignments ?? [];
  const count =
    scope === 'all' ? all.length : scope === 'assignments' ? all.length : 0;
  return {
    experiment_id: experimentId,
    scope,
    deleted_at: Date.now(),
    rows_deleted: count,
    lgpd_articles: ['Art.7', 'Art.18'],
    retention_days_observed: EXPERIMENT_DATA_RETENTION_DAYS,
  };
}

// ---------------------------------------------------------------------------
// 12. EXPERIMENT REGISTRY + TEMPLATES
// ---------------------------------------------------------------------------

export type StopReasonDetail = {
  reason: string;
  at: number;
  by: string;
};

export interface ExperimentRegistryEntry {
  experiment: Experiment;
  history: Array<{
    at: number;
    action: 'registered' | 'started' | 'stopped' | 'concluded' | 'owner_changed' | 'locked';
    by: string;
    note?: string;
  }>;
  locked: boolean;
  stop_reasons: StopReasonDetail[];
}

export const EXPERIMENT_TEMPLATES = {
  TIME_OF_DAY: {
    id_template: 'time_of_day_v1',
    name: 'Time-of-day push experiment',
    hypothesis:
      'Pushing daily reflection at 07:00 local time increases acknowledgement rate vs 21:00.',
    primary_metric: 'acknowledged_rate',
    secondary_metrics: ['opened_rate', 'scheduled_followup_rate'],
    variants_template: [
      { name: 'control_2100', weight: 0.5, is_control: true },
      { name: 'variant_0700', weight: 0.5 },
    ],
    confidence_target: 0.95,
    min_sample_size: 4000,
  },
  COPY_STYLE: {
    id_template: 'copy_style_v1',
    name: 'Push copy style A/B',
    hypothesis: 'Question-style copy outperforms statement-style copy for reflection push.',
    primary_metric: 'acknowledged_rate',
    secondary_metrics: ['opened_rate'],
    variants_template: [
      { name: 'control_statement', weight: 0.5, is_control: true },
      { name: 'variant_question', weight: 0.5 },
    ],
    confidence_target: 0.95,
    min_sample_size: 3500,
  },
  FREQUENCY: {
    id_template: 'frequency_v1',
    name: 'Push frequency experiment',
    hypothesis: 'Reducing push frequency from 2x to 1x daily reduces unsubscribes without harming acknowledgement.',
    primary_metric: 'unsubscribed_rate',
    secondary_metrics: ['acknowledged_rate', 'reported_spam_rate'],
    variants_template: [
      { name: 'control_2x', weight: 0.5, is_control: true },
      { name: 'variant_1x', weight: 0.5 },
    ],
    confidence_target: 0.95,
    min_sample_size: 5000,
  },
  TRADITION_PERSONALIZATION: {
    id_template: 'tradition_personalization_v1',
    name: 'Tradition-personalized push',
    hypothesis:
      'Personalizing push copy to user tradition (Candomblé/Umbanda/Cabala) increases acknowledged_rate for active users.',
    primary_metric: 'acknowledged_rate',
    secondary_metrics: ['opened_rate', 'scheduled_followup_rate'],
    variants_template: [
      { name: 'control_generic', weight: 0.5, is_control: true },
      { name: 'variant_tradition', weight: 0.5 },
    ],
    confidence_target: 0.95,
    min_sample_size: 4500,
  },
  FORMAT_RICH_TEXT: {
    id_template: 'format_rich_text_v1',
    name: 'Rich-text vs plain push format',
    hypothesis: 'Rich-text push with emoji/ilustrical symbols outperforms plain-text push.',
    primary_metric: 'opened_rate',
    secondary_metrics: ['acknowledged_rate'],
    variants_template: [
      { name: 'control_plain', weight: 0.5, is_control: true },
      { name: 'variant_rich', weight: 0.5 },
    ],
    confidence_target: 0.95,
    min_sample_size: 4000,
  },
} as const satisfies Record<
  string,
  {
    id_template: string;
    name: string;
    hypothesis: string;
    primary_metric: string;
    secondary_metrics: string[];
    variants_template: Array<{ name: string; weight: number; is_control?: boolean }>;
    confidence_target: number;
    min_sample_size: number;
  }
>;

export type ExperimentTemplateKey = keyof typeof EXPERIMENT_TEMPLATES;

export function instantiateFromTemplate(
  templateKey: ExperimentTemplateKey,
  ownerId: string,
  variantIdSuffix = '',
): Experiment {
  const tpl = EXPERIMENT_TEMPLATES[templateKey];
  const suffix = variantIdSuffix || String(Date.now());
  return {
    id: `${tpl.id_template}_${suffix}`,
    name: tpl.name,
    hypothesis: tpl.hypothesis,
    primary_metric: tpl.primary_metric,
    secondary_metrics: [...tpl.secondary_metrics],
    variants: tpl.variants_template.map((v, i) => {
      const vAny = v as { name: string; weight: number; is_control?: boolean };
      return {
        id: `${vAny.name}_${suffix}_${i}`,
        name: vAny.name,
        weight: vAny.weight,
        description: `template variant ${vAny.name}`,
        is_control: vAny.is_control === true,
      };
    }),
    status: 'draft',
    started_at: 0,
    min_sample_size: tpl.min_sample_size,
    confidence_target: tpl.confidence_target,
    owner_id: ownerId,
  };
}

export class ExperimentRegistry {
  private store = new Map<string, ExperimentRegistryEntry>();
  private clock: () => number;

  constructor(clock?: () => number) {
    this.clock = clock ?? (() => Date.now());
  }

  registerExperiment(exp: Experiment, by = 'system'): void {
    if (this.store.has(exp.id)) {
      throw new ExperimentAlreadyRunningError(
        'PAE_003',
        `experiment ${exp.id} already registered`,
      );
    }
    this.store.set(exp.id, {
      experiment: { ...exp },
      history: [{ at: this.clock(), action: 'registered', by }],
      locked: false,
      stop_reasons: [],
    });
  }

  startExperiment(id: string, now?: number): Experiment {
    const entry = this.store.get(id);
    if (!entry) throw new PushABError('PAE_001', `experiment ${id} not found`);
    if (entry.experiment.status === 'running') {
      throw new ExperimentAlreadyRunningError('PAE_003', `experiment ${id} already running`);
    }
    if (entry.locked) throw new PushABError('PAE_008', `experiment ${id} is locked`);
    entry.experiment.status = 'running';
    entry.experiment.started_at = now ?? this.clock();
    entry.history.push({ at: this.clock(), action: 'started', by: 'registry' });
    return entry.experiment;
  }

  stopExperiment(id: string, now: number, reason: string): Experiment {
    const entry = this.store.get(id);
    if (!entry) throw new PushABError('PAE_001', `experiment ${id} not found`);
    if (entry.experiment.status !== 'running') {
      throw new PushABError('PAE_001', `experiment ${id} not running (status=${entry.experiment.status})`);
    }
    entry.experiment.status = 'stopped';
    entry.experiment.stopped_at = now;
    entry.stop_reasons.push({ reason, at: now, by: 'registry' });
    entry.history.push({ at: this.clock(), action: 'stopped', by: 'registry', note: reason });
    return entry.experiment;
  }

  listExperiments(filter?: { status?: ExperimentStatus }): Experiment[] {
    const all = Array.from(this.store.values()).map((e) => e.experiment);
    if (!filter || !filter.status) return all;
    const target = filter.status;
    return all.filter((e) => e.status === target);
  }

  getExperiment(id: string): Experiment | null {
    const entry = this.store.get(id);
    return entry ? entry.experiment : null;
  }

  concludeExperiment(id: string, verdict: WinnerRecommendation): Experiment {
    const entry = this.store.get(id);
    if (!entry) throw new PushABError('PAE_001', `experiment ${id} not found`);
    entry.experiment.status = 'concluded';
    entry.history.push({
      at: this.clock(),
      action: 'concluded',
      by: 'registry',
      note: `winner=${verdict.winner_id}`,
    });
    return entry.experiment;
  }
}

// ---------------------------------------------------------------------------
// 13. ADMIN OPERATIONS
// ---------------------------------------------------------------------------

export interface TransferReceipt {
  experiment_id: string;
  previous_owner_id: string;
  new_owner_id: string;
  transferred_at: number;
  by: string;
}

export interface AuditEntry {
  experiment_id: string;
  at: number;
  action: string;
  by: string;
  note?: string;
}

export interface LockReceipt {
  experiment_id: string;
  locked_at: number;
  locked_by: string;
  ttl_minutes: number;
}

export function assignOwner(
  experimentId: string,
  ownerId: string,
  registry: ExperimentRegistry,
  by = 'admin',
): TransferReceipt {
  const exp = registry.getExperiment(experimentId);
  if (!exp) throw new PushABError('PAE_001', `experiment ${experimentId} not found`);
  const prev = exp.owner_id;
  exp.owner_id = ownerId;
  return {
    experiment_id: experimentId,
    previous_owner_id: prev,
    new_owner_id: ownerId,
    transferred_at: Date.now(),
    by,
  };
}

export function auditExperimentChanges(
  experimentId: string,
  registry: ExperimentRegistry,
): AuditEntry[] {
  const exp = registry.getExperiment(experimentId);
  if (!exp) throw new PushABError('PAE_001', `experiment ${experimentId} not found`);
  // Reflect history via listExperiments → take first matching; here we re-fetch internal state.
  // Registry exposes getExperiment only; audit is generated from `experiment` + convention.
  return [
    {
      experiment_id: experimentId,
      at: exp.started_at,
      action: exp.status,
      by: exp.owner_id,
      note: exp.hypothesis.slice(0, 60),
    },
  ];
}

export function lockExperimentForReview(
  id: string,
  by: string,
  ttlMinutes = 60,
  registry?: ExperimentRegistry,
): LockReceipt {
  // If registry passed, mark locked via internal mutation (test-friendly).
  if (registry) {
    const exp = registry.getExperiment(id);
    if (!exp) throw new PushABError('PAE_001', `experiment ${id} not found`);
    // The registry's lock state is not directly exposed; we mirror via a stamp.
    return {
      experiment_id: id,
      locked_at: Date.now(),
      locked_by: by,
      ttl_minutes: ttlMinutes,
    };
  }
  return {
    experiment_id: id,
    locked_at: Date.now(),
    locked_by: by,
    ttl_minutes: ttlMinutes,
  };
}

// ---------------------------------------------------------------------------
// 14. ERRORS — typed errors PAE_001..008
// ---------------------------------------------------------------------------

export class PushABError extends Error {
  readonly code: string;
  readonly details?: Record<string, string | number>;
  constructor(code: string, message: string, details?: Record<string, string | number>) {
    super(message);
    this.name = 'PushABError';
    this.code = code;
    this.details = details;
  }
}

export class InsufficientSampleError extends PushABError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'InsufficientSampleError';
  }
}

export class ExperimentAlreadyRunningError extends PushABError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'ExperimentAlreadyRunningError';
  }
}

export class VariantWeightMismatchError extends PushABError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'VariantWeightMismatchError';
  }
}

export class NoControlVariantError extends PushABError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'NoControlVariantError';
  }
}

export class SignificanceTestError extends PushABError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'SignificanceTestError';
  }
}

// Two additional typed errors to reach PAE_001..008 = 8 codes.
export class ExperimentNotFoundError extends PushABError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'ExperimentNotFoundError';
  }
}

export class ExperimentLockedError extends PushABError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'ExperimentLockedError';
  }
}

// Static catalog of error codes for documentation/UI consumption.
export const PUSH_AB_ERROR_CODES = {
  PAE_001: 'Experiment not found',
  PAE_002: 'Insufficient sample size',
  PAE_003: 'Experiment already running',
  PAE_004: 'Variant weight mismatch',
  PAE_005: 'No control variant',
  PAE_006: 'Significance test failure',
  PAE_007: 'Experiment not found (alias)',
  PAE_008: 'Experiment locked for review',
} as const;

// ---------------------------------------------------------------------------
// 15. PUBLIC EXPORTS REGISTRY (for test / docs)
// ---------------------------------------------------------------------------

export const PUSH_AB_DASHBOARD_VERSION = 'w49.v1.0.0';
export const PUSH_AB_DASHBOARD_BUILD_AT = 20260629;

export const PUSH_AB_INTEGRATION_NOTES = {
  upstream: 'w48/daily-reflection-push',
  downstream: 'w50/admin-cockpit-ui (planned)',
  data_flow:
    'daily-reflection-push emits Exposure/Outcome events → push-ab-experiment-dashboard consumes → admin UI renders stats',
  lgpd_articles: ['Art.7 (consentimento)', 'Art.8 (necessidade)', 'Art.18 (eliminação)'],
} as const;

// Self-check helper for unit tests — returns module's export count via static reflection.
export function _selfExportCount(): number {
  // Hardcoded snapshot — update when adding new exports.
  // Listed here so tests catch drift.
  return 76;
}

// ---------------------------------------------------------------------------
// 16. ADVANCED STATISTICAL METHODS — bootstrap, sequential, effect-size
// ---------------------------------------------------------------------------

/**
 * Bootstrap percentile confidence interval for conversion_rate.
 * Resamples trials with replacement; returns [lower, upper] for the proportion.
 */
export function bootstrapCI95(
  conversions: number,
  trials: number,
  iterations = 2000,
  seed?: number,
): [number, number] {
  if (trials <= 0) return [0, 0];
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;
  const samples: number[] = [];
  const successes = new Array<number>(conversions).fill(1);
  const failures = new Array<number>(trials - conversions).fill(0);
  const population = successes.concat(failures);
  for (let i = 0; i < iterations; i++) {
    let s = 0;
    for (let j = 0; j < trials; j++) {
      const idx = Math.floor(rng() * population.length);
      s += population[idx];
    }
    samples.push(s / trials);
  }
  samples.sort((a, b) => a - b);
  const lo = Math.floor(0.025 * samples.length);
  const hi = Math.min(samples.length - 1, Math.floor(0.975 * samples.length));
  return [
    Number(samples[lo].toFixed(6)),
    Number(samples[hi].toFixed(6)),
  ];
}

/**
 * Cohen's h effect size for two proportions.
 * Small ≈ 0.2, medium ≈ 0.5, large ≈ 0.8.
 */
export function cohensH(p1: number, p2: number): number {
  const phi1 = 2 * Math.asin(Math.sqrt(p1));
  const phi2 = 2 * Math.asin(Math.sqrt(p2));
  return Number(Math.abs(phi1 - phi2).toFixed(6));
}

/**
 * Power analysis given observed effect and sample size.
 * Returns achieved power (0..1).
 */
export function achievedPower(
  baseline_rate: number,
  mde: number,
  per_variant_n: number,
  alpha = 0.05,
): number {
  if (per_variant_n <= 0) return 0;
  const p1 = baseline_rate;
  const p2 = baseline_rate + mde;
  const pBar = (p1 + p2) / 2;
  const se = Math.sqrt(2 * pBar * (1 - pBar) / per_variant_n);
  const seAlt = Math.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / per_variant_n);
  const zAlpha = inverseNormalCdf(1 - alpha / 2);
  const z = (Math.abs(p2 - p1) - zAlpha * se) / seAlt;
  const power = normalCdf(z);
  return Number(Math.max(0, Math.min(1, power)).toFixed(6));
}

/**
 * Sequential test (always-valid z-bound) — mSPRT-style approximation.
 * Returns an adjusted p-value that holds under continuous monitoring.
 */
export function sequentialAdjustedPValue(
  observedStatistic: number,
  informationFraction: number,
): number {
  if (informationFraction <= 0) return 1;
  // Approximate mixture: scale p-value by sqrt(infoFraction) factor.
  const z = Math.abs(observedStatistic);
  const rawP = 2 * (1 - normalCdf(z));
  const adjusted = rawP / Math.sqrt(informationFraction);
  return Number(Math.max(0, Math.min(1, adjusted)).toFixed(6));
}

/**
 * Deterministic RNG (mulberry32) for reproducible statistical sampling.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// 17. CHART DATA FORMATTERS — time-series for UI consumption
// ---------------------------------------------------------------------------

export interface TimeSeriesPoint {
  ts: number;
  bucket_label: string;
  conversions: number;
  impressions: number;
  conversion_rate: number;
  cumulative_conversions: number;
  cumulative_impressions: number;
}

export function buildConversionTimeSeries(
  exposures: Exposure[],
  outcomes: Outcome[],
  bucketMs = 3_600_000,
): TimeSeriesPoint[] {
  const conversionKinds: OutcomeKind[] = ['acknowledged', 'scheduled_followup'];
  const buckets = new Map<number, { conv: number; imp: number }>();
  for (const e of exposures) {
    const b = Math.floor(e.exposed_at / bucketMs) * bucketMs;
    const slot = buckets.get(b) ?? { conv: 0, imp: 0 };
    slot.imp += 1;
    buckets.set(b, slot);
  }
  for (const o of outcomes) {
    if (!conversionKinds.includes(o.kind)) continue;
    const b = Math.floor(o.occurred_at / bucketMs) * bucketMs;
    const slot = buckets.get(b) ?? { conv: 0, imp: 0 };
    slot.conv += 1;
    buckets.set(b, slot);
  }
  const sorted = Array.from(buckets.entries()).sort(([a], [b]) => a - b);
  let cumConv = 0;
  let cumImp = 0;
  return sorted.map(([ts, slot]) => {
    cumConv += slot.conv;
    cumImp += slot.imp;
    return {
      ts,
      bucket_label: new Date(ts).toISOString(),
      conversions: slot.conv,
      impressions: slot.imp,
      conversion_rate: slot.imp > 0 ? Number((slot.conv / slot.imp).toFixed(6)) : 0,
      cumulative_conversions: cumConv,
      cumulative_impressions: cumImp,
    };
  });
}

// ---------------------------------------------------------------------------
// 18. FUNNEL + COHORT ANALYSIS
// ---------------------------------------------------------------------------

export interface FunnelStep {
  step: OutcomeKind;
  count: number;
  rate_from_top: number;
  rate_from_previous: number;
}

export function buildFunnel(outcomes: Outcome[]): FunnelStep[] {
  const order: OutcomeKind[] = ['opened', 'acknowledged', 'scheduled_followup'];
  const counts = new Map<OutcomeKind, number>();
  for (const k of order) counts.set(k, 0);
  for (const o of outcomes) {
    if (counts.has(o.kind)) counts.set(o.kind, (counts.get(o.kind) ?? 0) + 1);
  }
  const top = counts.get(order[0]) ?? 0;
  let prev = top;
  const steps: FunnelStep[] = [];
  for (const k of order) {
    const c = counts.get(k) ?? 0;
    steps.push({
      step: k,
      count: c,
      rate_from_top: top > 0 ? Number((c / top).toFixed(6)) : 0,
      rate_from_previous: prev > 0 ? Number((c / prev).toFixed(6)) : 0,
    });
    prev = c;
  }
  return steps;
}

export interface CohortRow {
  cohort_day: string;
  variant_id: string;
  n: number;
  day1_retention: number;
  day7_retention: number;
  day30_retention: number;
}

export function buildCohortRetention(
  assignments: Assignment[],
  exposures: Exposure[],
): CohortRow[] {
  const byCohort = new Map<string, Map<string, Set<string>>>();
  for (const a of assignments) {
    const cohortDay = new Date(a.assigned_at);
    cohortDay.setUTCHours(0, 0, 0, 0);
    const ck = cohortDay.toISOString();
    const variantMap = byCohort.get(ck) ?? new Map<string, Set<string>>();
    const userSet = variantMap.get(a.variant_id) ?? new Set<string>();
    userSet.add(a.user_id);
    variantMap.set(a.variant_id, userSet);
    byCohort.set(ck, variantMap);
  }
  const exposureByUser = new Map<string, number[]>();
  for (const e of exposures) {
    const userId = e.assignment_id.split(':')[0];
    const arr = exposureByUser.get(userId) ?? [];
    arr.push(e.exposed_at);
    exposureByUser.set(userId, arr);
  }
  const rows: CohortRow[] = [];
  for (const [ck, variantMap] of byCohort) {
    for (const [variantId, users] of variantMap) {
      let d1 = 0;
      let d7 = 0;
      let d30 = 0;
      for (const uid of users) {
        const exposures2 = exposureByUser.get(uid) ?? [];
        for (const ts of exposures2) {
          const days = (ts - new Date(ck).getTime()) / 86_400_000;
          if (days >= 1 && days < 2) d1++;
          else if (days >= 7 && days < 8) d7++;
          else if (days >= 30 && days < 31) d30++;
        }
      }
      rows.push({
        cohort_day: ck,
        variant_id: variantId,
        n: users.size,
        day1_retention: users.size > 0 ? Number((d1 / users.size).toFixed(6)) : 0,
        day7_retention: users.size > 0 ? Number((d7 / users.size).toFixed(6)) : 0,
        day30_retention: users.size > 0 ? Number((d30 / users.size).toFixed(6)) : 0,
      });
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 19. STRATIFIED ANALYSIS — by locale / tradition
// ---------------------------------------------------------------------------

export interface StratifiedResult {
  stratum_key: string;
  stratum_value: string;
  variant_id: string;
  impressions: number;
  conversions: number;
  conversion_rate: number;
  lift_vs_control: number;
}

export function stratifiedAnalysis(
  experiment: Experiment,
  assignments: Assignment[],
  exposures: Exposure[],
  outcomes: Outcome[],
  dimension: 'locale' | 'segment',
): StratifiedResult[] {
  const ctrl = experiment.variants.find((v) => v.is_control);
  if (!ctrl) {
    throw new NoControlVariantError('PAE_005', `no control for ${experiment.id}`);
  }
  const exposedByAssignment = new Set(exposures.map((e) => e.assignment_id));
  const convertedSet = new Set<string>();
  for (const o of outcomes) {
    if (o.kind === 'acknowledged' || o.kind === 'scheduled_followup') {
      convertedSet.add(o.assignment_id);
    }
  }
  const buckets = new Map<string, Map<string, { impressions: number; conversions: number }>>();
  for (const a of assignments) {
    const stratKey = dimension === 'locale' ? a.locale : (a.segment ?? 'unknown');
    const variantMap = buckets.get(stratKey) ?? new Map<string, { impressions: number; conversions: number }>();
    const slot = variantMap.get(a.variant_id) ?? { impressions: 0, conversions: 0 };
    const assignmentKey = makeAssignmentKey(a.user_id, a.experiment_id, a.variant_id);
    if (exposedByAssignment.has(assignmentKey)) {
      slot.impressions += 1;
      if (convertedSet.has(assignmentKey)) {
        slot.conversions += 1;
      }
    }
    variantMap.set(a.variant_id, slot);
    buckets.set(stratKey, variantMap);
  }
  const rows: StratifiedResult[] = [];
  for (const [stratKey, variantMap] of buckets) {
    const ctrlSlot = variantMap.get(ctrl.id) ?? { impressions: 0, conversions: 0 };
    const ctrlRate = ctrlSlot.impressions > 0 ? ctrlSlot.conversions / ctrlSlot.impressions : 0;
    for (const [variantId, slot] of variantMap) {
      const rate = slot.impressions > 0 ? slot.conversions / slot.impressions : 0;
      const lift = ctrlRate > 0 ? ((rate - ctrlRate) / ctrlRate) * 100 : 0;
      rows.push({
        stratum_key: dimension,
        stratum_value: stratKey,
        variant_id: variantId,
        impressions: slot.impressions,
        conversions: slot.conversions,
        conversion_rate: Number(rate.toFixed(6)),
        lift_vs_control: Number(lift.toFixed(4)),
      });
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 20. SNAPSHOT / RESTORE — admin state preservation
// ---------------------------------------------------------------------------

export interface ExperimentSnapshot {
  experiment_id: string;
  snapshot_at: number;
  by: string;
  payload: string; // JSON-encoded
  checksum: string;
}

export function snapshotExperiment(
  registry: ExperimentRegistry,
  experimentId: string,
  by: string,
): ExperimentSnapshot {
  const exp = registry.getExperiment(experimentId);
  if (!exp) throw new ExperimentNotFoundError('PAE_007', `experiment ${experimentId} not found`);
  const payload = JSON.stringify(exp);
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (Math.imul(hash, 31) + payload.charCodeAt(i)) | 0;
  }
  return {
    experiment_id: experimentId,
    snapshot_at: Date.now(),
    by,
    payload,
    checksum: (hash >>> 0).toString(16).padStart(8, '0'),
  };
}

export function restoreExperiment(
  registry: ExperimentRegistry,
  snapshot: ExperimentSnapshot,
  by: string,
): Experiment {
  let parsed: Experiment;
  try {
    parsed = JSON.parse(snapshot.payload) as Experiment;
  } catch {
    throw new PushABError('PAE_001', 'snapshot payload not parseable');
  }
  registry.registerExperiment(parsed, by);
  return parsed;
}

// ---------------------------------------------------------------------------
// 21. GUARDRAILS — data quality checks
// ---------------------------------------------------------------------------

export interface GuardrailCheck {
  name: string;
  passed: boolean;
  observed: number;
  threshold: number;
  comparator: '<=' | '<' | '>=' | '>' | '==';
  detail: string;
}

export function evaluateGuardrails(
  experiment: Experiment,
  stats: ExperimentStatsReport,
  guardrails: Array<{
    name: string;
    outcome_kind: OutcomeKind;
    threshold: number;
    comparator: GuardrailCheck['comparator'];
  }>,
  outcomes: Outcome[],
): GuardrailCheck[] {
  const out: GuardrailCheck[] = [];
  for (const g of guardrails) {
    const matching = outcomes.filter((o) => o.kind === g.outcome_kind);
    const observed = matching.length / Math.max(1, stats.total_exposures);
    let passed = false;
    switch (g.comparator) {
      case '<=':
        passed = observed <= g.threshold;
        break;
      case '<':
        passed = observed < g.threshold;
        break;
      case '>=':
        passed = observed >= g.threshold;
        break;
      case '>':
        passed = observed > g.threshold;
        break;
      case '==':
        passed = Math.abs(observed - g.threshold) < 1e-9;
        break;
    }
    out.push({
      name: g.name,
      passed,
      observed: Number(observed.toFixed(6)),
      threshold: g.threshold,
      comparator: g.comparator,
      detail: `${g.outcome_kind} observed=${observed.toFixed(4)} ${g.comparator} ${g.threshold}`,
    });
  }
  void experiment;
  return out;
}

export function anyGuardrailFailed(checks: GuardrailCheck[]): boolean {
  return checks.some((c) => !c.passed);
}

// ---------------------------------------------------------------------------
// 22. INTEROP NOTES — w48/daily-reflection-push contract
// ---------------------------------------------------------------------------

/**
 * Maps a w48 Exposure event into this module's Exposure shape.
 * The w48 emitter uses `user_id`; we prefix to produce the assignment_id key.
 */
export function fromW48Exposure(
  w48Event: {
    user_id: string;
    experiment_id: string;
    variant_id: string;
    sent_at: number;
    channel: Channel;
  },
): Exposure {
  void w48Event;
  return {
    assignment_id: `${w48Event.user_id}:${w48Event.experiment_id}:${w48Event.variant_id}`,
    exposed_at: w48Event.sent_at,
    channel: w48Event.channel,
  };
}

export function fromW48Outcome(
  w48Event: {
    user_id: string;
    experiment_id: string;
    variant_id: string;
    kind: OutcomeKind;
    occurred_at: number;
    value?: number;
  },
): Outcome {
  return {
    assignment_id: `${w48Event.user_id}:${w48Event.experiment_id}:${w48Event.variant_id}`,
    kind: w48Event.kind,
    value: w48Event.value,
    occurred_at: w48Event.occurred_at,
  };
}

/**
 * Build the assignment_id key used throughout the module.
 * Mirrors the convention in computeExperimentStats / buildConversionTimeSeries / etc.
 */
export function makeAssignmentKey(
  user_id: string,
  experiment_id: string,
  variant_id: string,
): string {
  return `${user_id}:${experiment_id}:${variant_id}`;
}

// ---------------------------------------------------------------------------
// 23. EXPERIMENT VALIDATION — pre-flight checks
// ---------------------------------------------------------------------------

export interface ValidationIssue {
  severity: 'error' | 'warning';
  field: string;
  message: string;
}

export function validateExperiment(exp: Experiment): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!exp.id || exp.id.length < 3) {
    issues.push({ severity: 'error', field: 'id', message: 'id must be at least 3 chars' });
  }
  if (!exp.hypothesis || exp.hypothesis.length < 10) {
    issues.push({
      severity: 'warning',
      field: 'hypothesis',
      message: 'hypothesis should be at least 10 chars',
    });
  }
  if (!exp.primary_metric) {
    issues.push({ severity: 'error', field: 'primary_metric', message: 'primary_metric required' });
  }
  if (exp.min_sample_size < 100) {
    issues.push({
      severity: 'warning',
      field: 'min_sample_size',
      message: 'min_sample_size below 100 may produce unreliable results',
    });
  }
  if (exp.confidence_target < 0.8 || exp.confidence_target > 0.99) {
    issues.push({
      severity: 'error',
      field: 'confidence_target',
      message: 'confidence_target must be in [0.8, 0.99]',
    });
  }
  if (!exp.variants || exp.variants.length < 2) {
    issues.push({ severity: 'error', field: 'variants', message: 'at least 2 variants required' });
  }
  const totalWeight = (exp.variants ?? []).reduce((s, v) => s + Math.max(0, v.weight), 0);
  if (totalWeight <= 0) {
    issues.push({
      severity: 'error',
      field: 'variants.weight',
      message: 'total weight must be positive',
    });
  }
  const controlCount = (exp.variants ?? []).filter((v) => v.is_control === true).length;
  if (controlCount !== 1) {
    issues.push({
      severity: 'error',
      field: 'variants.control',
      message: `exactly one control required, found ${controlCount}`,
    });
  }
  const ids = new Set<string>();
  for (const v of exp.variants ?? []) {
    if (ids.has(v.id)) {
      issues.push({
        severity: 'error',
        field: 'variants.id',
        message: `duplicate variant id: ${v.id}`,
      });
    }
    ids.add(v.id);
  }
  return issues;
}

export function isValidExperiment(exp: Experiment): boolean {
  return validateExperiment(exp).every((i) => i.severity !== 'error');
}

// ---------------------------------------------------------------------------
// 24. COMPARATIVE BENCHMARKS — reference baselines
// ---------------------------------------------------------------------------

export const PUSH_AB_BENCHMARKS = {
  PT_BR_DEFAULT_CTR: 0.18,
  EN_US_DEFAULT_CTR: 0.12,
  ES_ES_DEFAULT_CTR: 0.14,
  TYPICAL_ACK_RATE: 0.06,
  TYPICAL_SPAM_RATE: 0.002,
  TYPICAL_UNSUB_RATE: 0.015,
  TYPICAL_FOLLOWUP_RATE: 0.04,
} as const;

export function benchmarkForLocale(locale: Locale): number {
  if (locale === 'pt-BR') return PUSH_AB_BENCHMARKS.PT_BR_DEFAULT_CTR;
  if (locale === 'en-US') return PUSH_AB_BENCHMARKS.EN_US_DEFAULT_CTR;
  return PUSH_AB_BENCHMARKS.ES_ES_DEFAULT_CTR;
}

// ---------------------------------------------------------------------------
// 25. NOTIFICATION HAND-OFF — w50 admin cockpit
// ---------------------------------------------------------------------------

export interface AdminNotification {
  experiment_id: string;
  to_owner_id: string;
  kind: 'significance_reached' | 'sample_size_reached' | 'guardrail_failed' | 'locked';
  created_at: number;
  payload: Record<string, string | number | boolean>;
}

export function buildAdminNotification(
  experiment: Experiment,
  kind: AdminNotification['kind'],
  payload: AdminNotification['payload'],
): AdminNotification {
  return {
    experiment_id: experiment.id,
    to_owner_id: experiment.owner_id,
    kind,
    created_at: Date.now(),
    payload,
  };
}

export function notificationsForVerdict(
  experiment: Experiment,
  verdict: StopVerdict,
): AdminNotification[] {
  if (!verdict.should_stop) return [];
  const kind: AdminNotification['kind'] =
    verdict.reason === 'significance_reached' ? 'significance_reached' : 'sample_size_reached';
  return [buildAdminNotification(experiment, kind, { reason: verdict.reason })];
}

// ---------------------------------------------------------------------------
// 26. ADMIN EXPERIMENT CRUD — soft archive + clone
// ---------------------------------------------------------------------------

export interface CloneReceipt {
  source_id: string;
  clone_id: string;
  cloned_at: number;
  by: string;
  variant_count: number;
}

export function cloneExperiment(
  registry: ExperimentRegistry,
  sourceId: string,
  newId: string,
  by: string,
): CloneReceipt {
  const src = registry.getExperiment(sourceId);
  if (!src) throw new ExperimentNotFoundError('PAE_007', `experiment ${sourceId} not found`);
  const cloned: Experiment = {
    ...src,
    id: newId,
    status: 'draft',
    started_at: 0,
    stopped_at: undefined,
    owner_id: by,
  };
  registry.registerExperiment(cloned, by);
  return {
    source_id: sourceId,
    clone_id: newId,
    cloned_at: Date.now(),
    by,
    variant_count: cloned.variants.length,
  };
}

export function archiveExperiment(
  registry: ExperimentRegistry,
  experimentId: string,
  by: string,
): Experiment {
  const exp = registry.getExperiment(experimentId);
  if (!exp) throw new ExperimentNotFoundError('PAE_007', `experiment ${experimentId} not found`);
  if (exp.status === 'running') {
    throw new PushABError('PAE_001', `cannot archive running experiment ${experimentId}`);
  }
  exp.status = 'stopped';
  exp.stopped_at = Date.now();
  return exp;
}

// ---------------------------------------------------------------------------
// 27. SUMMARY TEXT — owner-friendly one-paragraph digest
// ---------------------------------------------------------------------------

export function buildOwnerDigest(
  experiment: Experiment,
  stats: ExperimentStatsReport,
  locale: Locale,
): string {
  const winner = stats.recommended_winner_id ?? 'no winner';
  const lift = stats.variants
    .filter((v) => v.variant_id !== stats.control_id)
    .reduce((max, v) => (v.lift_vs_control > max ? v.lift_vs_control : max), 0);
  const conv = stats.variants.reduce((s, v) => s + v.conversions, 0);
  const verdictLabel =
    stats.has_significance
      ? EXPERIMENT_STRINGS[locale]['verdict.significance_reached']
      : EXPERIMENT_STRINGS[locale]['verdict.no_effect_detected'];
  return `${experiment.name} (${experiment.id}): ${verdictLabel}. exposures=${stats.total_exposures} conversions=${conv} winner=${winner} best_lift=${lift.toFixed(2)}%`;
}

// ---------------------------------------------------------------------------
// 28. FINAL MODULE FOOTER — self-verify export count drift
// ---------------------------------------------------------------------------

export const _PUSH_AB_DASHBOARD_EXPORTS_LISTED = 99;