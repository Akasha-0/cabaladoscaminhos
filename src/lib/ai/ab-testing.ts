// ============================================================================
// ai/ab-testing — Akasha variant testing (Wave 39 — 2026-07-01)
// ============================================================================
// Three orthogonal axes of variation, each with deterministic bucketing:
//
//   1. **Prompt variants** — different system prompts (e.g. "concise" vs
//      "reflective") from `prompts/akasha.ts`.
//   2. **Citation strategies** — strict (must include ≥1 source) vs relaxed.
//   3. **Safety thresholds** — different block thresholds from
//      `safety/escalation.ts` (W38-5).
//
// All variants are scored on three metrics:
//   - **Quality** — eval-set pass rate (W36-2 quality metrics).
//   - **Cost** — average USD per response (W39 cost control).
//   - **Satisfaction** — explicit user feedback (thumbs up/down) +
//     implicit (continue session > 5 turns).
//
// Design choices:
//   - **Deterministic bucketing** — SHA-256(userId + experimentId) % 100 maps
//     to a sticky variant. No client-side `Math.random` (would be flaky).
//   - **Per-experiment allocation** — experiments can be 100% on, 100% off,
//     or 50/50, 25/25/25/25 etc. Allocation table is pure-data.
//   - **Auto-promote** — if a variant's quality > control's quality AND
//     cost ≤ control's cost AND satisfaction ≥ control's satisfaction
//     over a 200-sample window, it auto-promotes to 100% rollout.
//   - **LGPD Art. 18** — never log raw user text in experiment events;
//     only counts + hashes.
//
// Reference: docs/AKASHA-PRODUCTION-W39.md §9 (A/B testing).
// ============================================================================

import { createHash } from "crypto";

// ---------------------------------------------------------------------------
// Axes of variation
// ---------------------------------------------------------------------------

export type PromptVariantId =
  | "default"
  | "concise"
  | "reflective"
  | "scholarly";

export type CitationStrategy =
  | "strict"          // ≥1 citation per response
  | "relaxed"         // citation encouraged but not enforced
  | "explicit_only";  // only when explicitly referenced

export type SafetyThresholdVariant =
  | "standard"        // baseline (W38-5 default)
  | "conservative"    // block lower-severity topics
  | "permissive";     // allow disputed-but-not-harmful

export interface AkashaExperiment {
  id: string;
  axis: "prompt" | "citation" | "safety";
  /** Pure-data allocation: variant name → percent (sum = 100). */
  allocation: Record<string, number>;
  /** Earliest sample where auto-promote eval begins. */
  minSamples: number;
  /** Window size for stat aggregation. */
  windowSize: number;
  /** Enabled flag. */
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Catalog (W39)
// ---------------------------------------------------------------------------

export const EXPERIMENT_CATALOG: Record<string, AkashaExperiment> = Object.freeze({
  "w39.prompt.style": {
    id: "w39.prompt.style",
    axis: "prompt",
    allocation: { default: 50, concise: 25, reflective: 25 },
    minSamples: 200,
    windowSize: 200,
    enabled: true,
  },
  "w39.citation.policy": {
    id: "w39.citation.policy",
    axis: "citation",
    allocation: { strict: 34, relaxed: 33, explicit_only: 33 },
    minSamples: 200,
    windowSize: 200,
    enabled: true,
  },
  "w39.safety.threshold": {
    id: "w39.safety.threshold",
    axis: "safety",
    allocation: { standard: 80, conservative: 10, permissive: 10 },
    minSamples: 400,
    windowSize: 400,
    enabled: false,   // opt-in toggle (admin)
  },
});

// ---------------------------------------------------------------------------
// Deterministic bucketing
// ---------------------------------------------------------------------------

export interface BucketAssignment {
  experimentId: string;
  variant: string;
  bucket: number;     // 0..99
}

/**
 * Map (userId, experimentId) to a stable bucket 0..99.
 * Same user always lands in the same bucket for the same experiment.
 */
export function bucketFor(userId: string, experimentId: string): number {
  const h = createHash("sha256").update(`${userId}:${experimentId}`).digest();
  return (h[0]! * 256 + h[1]!) % 100;
}

/**
 * Resolve variant assignment for an experiment. Pure.
 * Returns null if experiment is disabled or unknown.
 */
export function assignVariant(userId: string, experiment: AkashaExperiment): string | null {
  if (!experiment.enabled) return null;
  const bucket = bucketFor(userId, experiment.id);
  let cumulative = 0;
  for (const [variant, pct] of Object.entries(experiment.allocation)) {
    cumulative += pct;
    if (bucket < cumulative) return variant;
  }
  // Floating point guard.
  return Object.keys(experiment.allocation).at(-1) ?? null;
}

// ---------------------------------------------------------------------------
// Metric collection
// ---------------------------------------------------------------------------

export interface VariantMetric {
  variant: string;
  samples: number;
  /** Eval pass rate (0..1). */
  quality: number;
  /** Average USD per response. */
  costUsd: number;
  /** Satisfaction score (0..1). */
  satisfaction: number;
  /** Mean latency (ms). */
  latencyMs: number;
  updatedAt: number;
}

export interface ExperimentMetrics {
  experimentId: string;
  variants: Record<string, VariantMetric>;
  /** Whether auto-promotion has fired for any variant. */
  autoPromoted: string | null;
}

/**
 * Aggregate metric (purely numeric) — caller wires the I/O boundary.
 */
export function aggregateMetrics(
  samples: Array<{
    variant: string;
    quality: number;
    costUsd: number;
    satisfaction: number;
    latencyMs: number;
  }>,
): VariantMetric {
  const n = samples.length;
  if (n === 0) {
    return { variant: "", samples: 0, quality: 0, costUsd: 0, satisfaction: 0, latencyMs: 0, updatedAt: Date.now() };
  }
  let quality = 0, cost = 0, sat = 0, lat = 0;
  for (const s of samples) {
    quality += s.quality;
    cost += s.costUsd;
    sat += s.satisfaction;
    lat += s.latencyMs;
  }
  return {
    variant: samples[0]!.variant,
    samples: n,
    quality: quality / n,
    costUsd: cost / n,
    satisfaction: sat / n,
    latencyMs: lat / n,
    updatedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Auto-promotion logic
// ---------------------------------------------------------------------------

export interface PromotionDecision {
  promote: boolean;
  reason: string;
  /** Variant to promote (or null). */
  variant: string | null;
}

/**
 * Decide whether a non-control variant should auto-promote to 100%.
 *
 * Criteria (all required):
 *   1. ≥ `minSamples` per variant.
 *   2. quality > control.quality (strict greater).
 *   3. costUsd ≤ control.costUsd (no regression).
 *   4. satisfaction ≥ control.satisfaction - 0.02 (allowable regression).
 */
export function decidePromotion(
  experiment: AkashaExperiment,
  metrics: Record<string, VariantMetric>,
): PromotionDecision {
  if (!experiment.enabled) return { promote: false, reason: "Experiment disabled", variant: null };
  const controlKey = Object.keys(experiment.allocation)[0]!;
  const control = metrics[controlKey];
  if (!control || control.samples < experiment.minSamples) {
    return { promote: false, reason: "Control has insufficient samples", variant: null };
  }
  for (const [variant, m] of Object.entries(metrics)) {
    if (variant === controlKey) continue;
    if (m.samples < experiment.minSamples) continue;
    if (m.quality > control.quality &&
        m.costUsd <= control.costUsd &&
        m.satisfaction >= control.satisfaction - 0.02) {
      return {
        promote: true,
        reason: `quality+${((m.quality - control.quality) * 100).toFixed(1)}% ` +
                `Δ cost=$${(m.costUsd - control.costUsd).toFixed(4)} ` +
                `Δ sat=${((m.satisfaction - control.satisfaction) * 100).toFixed(1)}%`,
        variant,
      };
    }
  }
  return { promote: false, reason: "No variant wins on all 3 axes", variant: null };
}

// ---------------------------------------------------------------------------
// Sticky variant resolution per request
// ---------------------------------------------------------------------------

export interface AkashaVariantSet {
  prompt: PromptVariantId;
  citation: CitationStrategy;
  safety: SafetyThresholdVariant;
}

/**
 * Resolve the full variant set for a user/request. Iterates every enabled
 * experiment; missing axes fall back to defaults.
 */
export function resolveVariants(
  userId: string,
  catalog: Record<string, AkashaExperiment> = EXPERIMENT_CATALOG,
): AkashaVariantSet {
  const result: AkashaVariantSet = {
    prompt: "default",
    citation: "strict",
    safety: "standard",
  };
  for (const exp of Object.values(catalog)) {
    if (!exp.enabled) continue;
    const variant = assignVariant(userId, exp);
    if (!variant) continue;
    if (exp.axis === "prompt") {
      result.prompt = variant as PromptVariantId;
    } else if (exp.axis === "citation") {
      result.citation = variant as CitationStrategy;
    } else if (exp.axis === "safety") {
      result.safety = variant as SafetyThresholdVariant;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Pure helpers for tests
// ---------------------------------------------------------------------------

/** Validate that allocation percentages sum to 100. Returns empty list if ok. */
export function validateAllocation(exp: AkashaExperiment): string[] {
  const errors: string[] = [];
  const total = Object.values(exp.allocation).reduce((a, b) => a + b, 0);
  if (total < 99.99 || total > 100.01) {
    errors.push(`Allocation ${total}% ≠ 100%`);
  }
  return errors;
}

export function isVariantValid(axis: AkashaExperiment["axis"], variant: string): boolean {
  if (axis === "prompt") {
    return ["default", "concise", "reflective", "scholarly"].includes(variant);
  }
  if (axis === "citation") {
    return ["strict", "relaxed", "explicit_only"].includes(variant);
  }
  if (axis === "safety") {
    return ["standard", "conservative", "permissive"].includes(variant);
  }
  return false;
}
