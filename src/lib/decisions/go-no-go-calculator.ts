/**
 * decisions/go-no-go-calculator — Weighted score + decision matrix (W37)
 * ============================================================================
 * Algoritmo determinístico que recebe 18 KPIs (actual + definition) e devolve:
 *   1) Traffic light por KPI (green | yellow | red)
 *   2) Score por KPI (1.0 / 0.7 / 0.0)
 *   3) Score agregado (ponderado por weight)
 *   4) Decisão final: GO | CONDITIONAL | NO-GO
 *
 * Thresholds:
 *   - GREEN  => actual ≥ target            → score = 1.0
 *   - YELLOW => actual ∈ [80%, 100%)       → score = 0.7
 *   - RED    => actual < 80% of target     → score = 0.0
 *
 *   Para direction="lower" (latency, errors): inverte ratio.
 *   Para direction="band" : GREEN se em [targetMin, targetMax].
 *
 * Decision:
 *   - GO         : score ≥ 0.85 AND P0 reds === 0
 *   - CONDITIONAL: score ∈ [0.70, 0.85) OR P0 reds ∈ {1, 2}
 *   - NO-GO      : score < 0.70 OR P0 reds ≥ 3
 *
 * LGPD:
 *   - Pure-function em memória. Sem IO, sem PII.
 *
 * Audit / determinism:
 *   - scoreKpi() e computeDecision() são funções puras.
 *   - Mesmos inputs (kpi defs + actuals) => mesmo output (testável).
 * ============================================================================
 */

import {
  ALL_KPIS,
  KPI_BY_ID,
  type KpiActual,
  type KpiDefinition,
  type TrafficLight,
} from "./kpi-definitions";

// ============================================================================
// Types
// ============================================================================

export type Decision = "GO" | "CONDITIONAL" | "NO-GO";

export interface KpiEvaluation {
  kpi: KpiDefinition;
  actual: number;
  /** Ratio: actual/target for higher, target/actual for lower, deviation for band. */
  ratio: number;
  light: TrafficLight;
  /** 1.0 (green) / 0.7 (yellow) / 0.0 (red). */
  score: number;
  /** Effective contribution: weight × score. */
  weightedContribution: number;
  rationale: string;
}

export interface DecisionReport {
  /** Timestamp ISO 8601 da avaliação. */
  evaluatedAt: string;
  /** Lista detalhada por KPI. */
  evaluations: KpiEvaluation[];
  /** Score agregado ponderado (0..1). */
  weightedScore: number;
  /** Quantidade de P0 reds. */
  p0RedCount: number;
  /** Quantidade de yellows (qualquer categoria). */
  yellowCount: number;
  /** Quantidade de greens. */
  greenCount: number;
  /** Quantidade de reds. */
  redCount: number;
  /** Decisão final. */
  decision: Decision;
  /** Rationale human-readable. */
  decisionRationale: string;
  /** Próxima ação recomendada dado a decisão. */
  recommendedAction: string;
}

// ============================================================================
// Constants
// ============================================================================

const GREEN_THRESHOLD = 1.0; // >= target
const YELLOW_THRESHOLD = 0.8; // 80% of target
const P0_RED_NO_GO_LIMIT = 3;
const P0_RED_CONDITIONAL_LIMIT = 2;
const SCORE_GO_THRESHOLD = 0.85;
const SCORE_NOGO_THRESHOLD = 0.7;

// ============================================================================
// Single-KPI evaluation
// ============================================================================

/**
 * Converte a performance numa escala [0, +inf) onde ≥ 1.0 = atendeu target.
 *  - direction="higher": ratio = actual / target
 *  - direction="lower":  ratio = target / actual
 *  - direction="band":   ratio = clamp para inside [1.0, +inf) se dentro do band
 *
 * Boundary case: actual === 0 com direction="higher" => ratio = 0 (red).
 * Boundary case: actual === 0 com direction="lower"  => ratio = +inf (green, mas
 *   impossível em prática — logica mantida p/ completude).
 */
export function computeRatio(kpi: KpiDefinition, actual: number): number {
  switch (kpi.direction) {
    case "higher":
      if (kpi.target === 0) return actual === 0 ? 1 : Number.POSITIVE_INFINITY;
      return actual / kpi.target;
    case "lower":
      if (actual === 0) return Number.POSITIVE_INFINITY;
      return kpi.target / actual;
    case "band": {
      const min = kpi.targetMin ?? kpi.target;
      const max = kpi.targetMax ?? kpi.target;
      if (actual < min) return actual / min; // abaixo do band (ruim)
      if (actual > max) return max / actual; // acima do band (ruim)
      return 1.0; // dentro do band (bom)
    }
  }
}

/**
 * Atribui traffic light baseado no ratio + thresholds.
 *   ratio >= 1.0               -> green
 *   0.8  <= ratio <  1.0      -> yellow
 *   ratio <  0.8               -> red
 * Nota: ratios "invertidos" (direction="lower") aplicam mesma escala.
 */
export function ratioToLight(ratio: number): TrafficLight {
  if (!Number.isFinite(ratio)) return "green"; // +inf == way better than target
  if (ratio >= GREEN_THRESHOLD) return "green";
  if (ratio >= YELLOW_THRESHOLD) return "yellow";
  return "red";
}

/**
 * Pontuação por KPI (1.0 / 0.7 / 0.0).
 */
export function scoreForLight(light: TrafficLight): number {
  switch (light) {
    case "green":
      return 1.0;
    case "yellow":
      return 0.7;
    case "red":
      return 0.0;
  }
}

function rationaleFor(
  kpi: KpiDefinition,
  actual: number,
  ratio: number,
  light: TrafficLight,
): string {
  const directionWord =
    kpi.direction === "higher"
      ? "≥"
      : kpi.direction === "lower"
        ? "≤"
        : `∈ [${kpi.targetMin ?? kpi.target}, ${kpi.targetMax ?? kpi.target}]`;
  switch (light) {
    case "green":
      return `Actual ${actual}${kpi.unit} ${directionWord} target ${kpi.target}${kpi.unit} (ratio=${ratio.toFixed(2)}) — met.`;
    case "yellow":
      return `Actual ${actual}${kpi.unit} abaixo de target ${kpi.target}${kpi.unit} (ratio=${ratio.toFixed(2)}) — within tolerance band.`;
    case "red":
      return `Actual ${actual}${kpi.unit} significantly off target ${kpi.target}${kpi.unit} (ratio=${ratio.toFixed(2)}) — atencao.`;
  }
}

/**
 * Avaliação unitária de 1 KPI.
 */
export function evaluateKpi(kpi: KpiDefinition, actual: number): KpiEvaluation {
  const ratio = computeRatio(kpi, actual);
  const light = ratioToLight(ratio);
  const score = scoreForLight(light);

  return {
    kpi,
    actual,
    ratio,
    light,
    score,
    weightedContribution: kpi.weight * score,
    rationale: rationaleFor(kpi, actual, ratio, light),
  };
}

// ============================================================================
// Aggregate decision
// ============================================================================

/**
 * Computa a decisão agregada a partir das avaliações individuais.
 *
 * Algoritmo (ordem de checagem importa):
 *   1) Se weightedScore >= 0.85 AND p0Reds === 0       => GO
 *   2) Se weightedScore <  0.70 OR p0Reds >= 3          => NO-GO
 *   3) Caso contrário                                  => CONDITIONAL
 */
export function computeDecision(evaluations: KpiEvaluation[]): {
  weightedScore: number;
  p0RedCount: number;
  yellowCount: number;
  greenCount: number;
  redCount: number;
  decision: Decision;
  decisionRationale: string;
  recommendedAction: string;
} {
  const totalWeight = evaluations.reduce((s, e) => s + e.kpi.weight, 0);
  const weightedSum = evaluations.reduce((s, e) => s + e.weightedContribution, 0);
  const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  const p0RedCount = evaluations.filter((e) => e.light === "red" && e.kpi.p0).length;
  const yellowCount = evaluations.filter((e) => e.light === "yellow").length;
  const greenCount = evaluations.filter((e) => e.light === "green").length;
  const redCount = evaluations.filter((e) => e.light === "red").length;

  let decision: Decision;
  let decisionRationale: string;
  let recommendedAction: string;

  if (weightedScore >= SCORE_GO_THRESHOLD && p0RedCount === 0) {
    decision = "GO";
    decisionRationale = `Score ${weightedScore.toFixed(3)} ≥ ${SCORE_GO_THRESHOLD} and ${p0RedCount} P0 reds. All health gates green, retention/engagement solid.`;
    recommendedAction = `Disparar Wave 4 open beta (500 users) imediatamente. Pre-launch comms + waitlist automation.`;
  } else if (weightedScore < SCORE_NOGO_THRESHOLD || p0RedCount >= P0_RED_NO_GO_LIMIT) {
    decision = "NO-GO";
    decisionRationale =
      p0RedCount >= P0_RED_NO_GO_LIMIT
        ? `${p0RedCount} P0 reds ≥ ${P0_RED_NO_GO_LIMIT} limit — hard gate. Score ${weightedScore.toFixed(3)} (reference).`
        : `Score ${weightedScore.toFixed(3)} < ${SCORE_NOGO_THRESHOLD} threshold. Critical mass de reds, even if not P0.`;
    recommendedAction = `HOLD Wave 4 open beta. Owner decide entre iterate por mais 30d ou pivotar (kill switch).`;
  } else {
    decision = "CONDITIONAL";
    const reasons: string[] = [];
    if (weightedScore < SCORE_GO_THRESHOLD) {
      reasons.push(`score ${weightedScore.toFixed(3)} < ${SCORE_GO_THRESHOLD} GO threshold`);
    }
    if (p0RedCount > 0 && p0RedCount <= P0_RED_CONDITIONAL_LIMIT) {
      reasons.push(`${p0RedCount} P0 red(s) (limit: ${P0_RED_CONDITIONAL_LIMIT})`);
    }
    decisionRationale = `Conditional: ${reasons.join("; ")}. Wave 4 pode abrir com mitigation explícita + monitoring tight.`;
    recommendedAction = `Wave 4 = 100 users (CONSTRAINED) com fokus na mitigation dos ${p0RedCount} P0 reds + daily reviews nos primeiros 14d.`;
  }

  return {
    weightedScore,
    p0RedCount,
    yellowCount,
    greenCount,
    redCount,
    decision,
    decisionRationale,
    recommendedAction,
  };
}

// ============================================================================
// Main entrypoint — avalia 1 set completo
// ============================================================================

export interface ComputeInput {
  actuals: ReadonlyArray<KpiActual>;
  /** ISO 8601 timestamp — se omitido, defaults to now(). */
  evaluatedAt?: string;
}

/**
 * Atalho: dado um set de 18 actuals, retorna o DecisionReport completo.
 * Lança erro se algum KPI estiver faltando (todos os 18 são required).
 */
export function computeGoNoGoReport(input: ComputeInput): DecisionReport {
  const evaluatedAt = input.evaluatedAt ?? new Date().toISOString();

  const evaluations: KpiEvaluation[] = [];
  for (const kpi of ALL_KPIS) {
    const row = input.actuals.find((a) => a.id === kpi.id);
    if (!row) {
      throw new Error(`computeGoNoGoReport: missing actual for required KPI '${kpi.id}'`);
    }
    evaluations.push(evaluateKpi(kpi, row.actual));
  }

  const agg = computeDecision(evaluations);

  return {
    evaluatedAt,
    evaluations,
    ...agg,
  };
}

/**
 * Versão "tolerant": aceita actuals parciais e preenche missing como "unknown"
 * (retorna evaluation com light="red", score=0, rationale explicativo).
 * Útil em preview mode antes de fechar todas as coletas.
 */
export function previewGoNoGoReport(
  actuals: ReadonlyArray<KpiActual>,
  evaluatedAt: string = new Date().toISOString(),
): DecisionReport {
  const evaluations: KpiEvaluation[] = [];
  for (const kpi of ALL_KPIS) {
    const row = actuals.find((a) => a.id === kpi.id);
    if (row === undefined) {
      evaluations.push({
        kpi,
        actual: Number.NaN,
        ratio: 0,
        light: "red",
        score: 0,
        weightedContribution: 0,
        rationale: "Missing actual value — counted as red (preview mode).",
      });
      continue;
    }
    evaluations.push(evaluateKpi(kpi, row.actual));
  }
  const agg = computeDecision(evaluations);
  return {
    evaluatedAt,
    evaluations,
    ...agg,
  };
}

/**
 * Helper: filtra evaluations por categoria.
 */
export function evaluationsByCategory(
  evaluations: KpiEvaluation[],
  category: "retention" | "engagement" | "health",
): KpiEvaluation[] {
  return evaluations.filter((e) => e.kpi.category === category);
}

/**
 * Helper: sub-score por categoria (normalized to 0..1 within category).
 */
export function categoryScore(evaluations: KpiEvaluation[], category: "retention" | "engagement" | "health"): number {
  const subset = evaluationsByCategory(evaluations, category);
  if (subset.length === 0) return 0;
  const wsum = subset.reduce((s, e) => s + e.weightedContribution, 0);
  const totW = subset.reduce((s, e) => s + e.kpi.weight, 0);
  return totW > 0 ? wsum / totW : 0;
}

export { KPI_BY_ID };
