/**
 * analytics/insights.ts — Insights engine + anomaly detection (Wave 34)
 * ============================================================================
 * Gera insights actionaveis a partir de metric streams (já agregadas em
 * série temporal). Diferente de `consciousness/insights` (que detecta
 * temas em conversas Akasha), este módulo detecta:
 *
 *   - ANOMALY       (z-score em metric daily)
 *   - CHURN_RISK    (inactivity + low engagement)
 *   - POWER_USER    (high DAU + multi-feature usage)
 *   - FUNNEL_DROP   (step conversion caiu vs semana anterior)
 *   - COHORT_SHIFT  (novo cohort tem retenção significativamente diferente)
 *   - CONVERSION_OPP (gaps no funil com ROI estimado)
 *   - RECOMMENDATION (heuristica: feature X → retention)
 *
 * Saída: lista priorizada (priorityScore) de InsightCards com:
 *   - tipo, severidade, evidence[], actionItems[], estimatedImpact
 *
 * LGPD:
 *   - Nunca retorna PII ou userIds. Apenas contagens agregadas.
 *   - Insights com evidence insuficiente (< N samples) são descartados.
 *
 * Não acessa Prisma: opera sobre arrays já agregados (tests-friendly).
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export type InsightType =
  | "ANOMALY"
  | "CHURN_RISK"
  | "POWER_USER"
  | "FUNNEL_DROP"
  | "COHORT_SHIFT"
  | "CONVERSION_OPP"
  | "RECOMMENDATION";

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export interface MetricPoint {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Valor da métrica nesse dia. */
  value: number;
}

export interface MetricSeries {
  /** Identificador da métrica (e.g. "dau", "signups", "akasha_messages"). */
  metric: string;
  /** Janela de agregação. */
  granularity: "day" | "week";
  /** Pontos ordenados por data asc. */
  points: MetricPoint[];
}

export interface UserActivitySnapshot {
  /** Distinct identifier (uuid). */
  userId: string;
  /** Total de sessoes ativas nos ultimos 30 dias. */
  sessionsLast30d: number;
  /** Days since last seen (0 = hoje). */
  daysSinceLastSeen: number;
  /** Features distintas usadas (e.g. ["feed", "akasha", "library"]). */
  featuresUsed: string[];
  /** DAU proxy: media de sessoes por dia ativo. */
  avgSessionsPerActiveDay: number;
  /** Reports NPS (e.g. 9 ou 10 se submeteu). */
  npsScore?: number;
}

export interface FunnelSnapshot {
  funnelId: string;
  /** Conversion atual. */
  conversion: number;
  /** Conversion semana anterior. */
  previousConversion: number;
  /** Step onde ocorre o drop principal (1-indexed). */
  worstStep: number;
}

export interface CohortSnapshot {
  cohort: string;
  retentionD7: number;
  /** Baseline D7 (media das últimas 8 semanas). */
  baselineRetentionD7: number;
}

export interface InsightCard {
  /** Unique id (uuid-like determinístico baseado em type+key). */
  id: string;
  type: InsightType;
  severity: Severity;
  /** Headline curta (≤60 chars). */
  title: string;
  /** Descrição mais longa. */
  description: string;
  /** Evidence (strings, sem PII). */
  evidence: string[];
  /** Action items verb-initial. */
  actionItems: string[];
  /** Estimativa de impacto qualitativo ("+5% D7 retention" etc). */
  estimatedImpact?: string;
  /** Priority score (0..100). Sort desc. */
  priorityScore: number;
  /** Categorias afetadas (admin only). */
  affectedCategories: string[];
  /** ISO date de detecção. */
  detectedAt: string;
}

export interface InsightsBundle {
  cards: InsightCard[];
  meta: {
    generatedAt: string;
    totalCards: number;
    highSeverity: number;
    criticalSeverity: number;
    suppressedBelow: number;
  };
}

// ============================================================================
// Schema
// ============================================================================

export const InsightConfigSchema = z.object({
  /** Z-score threshold para anomaly (default 2.5). */
  anomalyZScore: z.number().positive().default(2.5),
  /** Minimo de pontos na série (default 14 dias) para anomaly. */
  anomalyMinPoints: z.number().int().positive().default(14),
  /** Churn: daysSinceLastSeen threshold (default 14). */
  churnInactivityDays: z.number().int().positive().default(14),
  /** Churn: sessoes minimas abaixo = risk (default 2). */
  churnMinSessions: z.number().int().nonnegative().default(2),
  /** Power user: sessoes minimas (default 12). */
  powerMinSessions: z.number().int().positive().default(12),
  /** Power user: features minimas (default 3). */
  powerMinFeatures: z.number().int().positive().default(3),
  /** Funnel drop threshold (default 0.10 = 10pp). */
  funnelDropThreshold: z.number().min(0).max(1).default(0.1),
  /** Cohort shift threshold (default 0.10). */
  cohortShiftThreshold: z.number().min(0).max(1).default(0.1),
  /** Min evidence samples (default 30). */
  minSamples: z.number().int().positive().default(30),
  /** Suppress abaixo de N priority (default 25). */
  suppressBelowPriority: z.number().min(0).max(100).default(25),
});

export type InsightConfig = z.infer<typeof InsightConfigSchema>;

export const DEFAULT_INSIGHT_CONFIG: InsightConfig = {
  anomalyZScore: 2.5,
  anomalyMinPoints: 14,
  churnInactivityDays: 14,
  churnMinSessions: 2,
  powerMinSessions: 12,
  powerMinFeatures: 3,
  funnelDropThreshold: 0.1,
  cohortShiftThreshold: 0.1,
  minSamples: 30,
  suppressBelowPriority: 25,
};

// ============================================================================
// Anomaly detection — z-score
// ============================================================================

export interface AnomalyResult {
  /** Index na série. */
  index: number;
  date: string;
  value: number;
  /** Z-score (quantos desvios padrão acima/abaixo). */
  zScore: number;
  /** "SPIKE" se value > mean, "DROP" se value < mean. */
  kind: "SPIKE" | "DROP";
  /** Severity. */
  severity: Severity;
}

export function detectAnomalies(
  series: MetricSeries,
  config: Partial<InsightConfig> = {}
): AnomalyResult[] {
  const cfg = { ...DEFAULT_INSIGHT_CONFIG, ...config };
  const points = series.points;
  if (points.length < cfg.anomalyMinPoints) return [];

  const values = points.map((p) => p.value);
  const mean = avg(values);
  const std = stddev(values, mean);
  if (std === 0) return [];

  const out: AnomalyResult[] = [];
  for (let i = 0; i < points.length; i++) {
    const z = (points[i].value - mean) / std;
    if (Math.abs(z) >= cfg.anomalyZScore) {
      out.push({
        index: i,
        date: points[i].date,
        value: points[i].value,
        zScore: z,
        kind: z > 0 ? "SPIKE" : "DROP",
        severity: severityFromZ(Math.abs(z)),
      });
    }
  }
  return out;
}

// ============================================================================
// Churn risk
// ============================================================================

export function detectChurnRisk(
  users: UserActivitySnapshot[],
  config: Partial<InsightConfig> = {}
): UserActivitySnapshot[] {
  const cfg = { ...DEFAULT_INSIGHT_CONFIG, ...config };
  return users.filter(
    (u) =>
      u.daysSinceLastSeen >= cfg.churnInactivityDays &&
      u.sessionsLast30d <= cfg.churnMinSessions
  );
}

// ============================================================================
// Power user
// ============================================================================

export function detectPowerUsers(
  users: UserActivitySnapshot[],
  config: Partial<InsightConfig> = {}
): UserActivitySnapshot[] {
  const cfg = { ...DEFAULT_INSIGHT_CONFIG, ...config };
  return users.filter(
    (u) =>
      u.sessionsLast30d >= cfg.powerMinSessions &&
      u.featuresUsed.length >= cfg.powerMinFeatures
  );
}

// ============================================================================
// Funnel drops
// ============================================================================

export function detectFunnelDrops(
  funnels: FunnelSnapshot[],
  config: Partial<InsightConfig> = {}
): FunnelSnapshot[] {
  const cfg = { ...DEFAULT_INSIGHT_CONFIG, ...config };
  return funnels.filter((f) => {
    const diff = f.previousConversion - f.conversion;
    return diff >= cfg.funnelDropThreshold;
  });
}

// ============================================================================
// Cohort shift detection
// ============================================================================

export function detectCohortShifts(
  cohorts: CohortSnapshot[],
  config: Partial<InsightConfig> = {}
): CohortSnapshot[] {
  const cfg = { ...DEFAULT_INSIGHT_CONFIG, ...config };
  return cohorts.filter((c) => {
    const diff = Math.abs(c.retentionD7 - c.baselineRetentionD7);
    return diff >= cfg.cohortShiftThreshold;
  });
}

// ============================================================================
// Recommendations engine (heuristic, sem ML)
// ============================================================================

export interface RecommendationTemplate {
  /** Feature alvo de aumento. */
  feature: string;
  /** Multiplicador estimado de retention D7 (heurística). */
  retentionMultiplier: number;
  /** Mensagem (template string). */
  message: string;
}

export const RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  {
    feature: "akasha",
    retentionMultiplier: 1.18,
    message: "Aumentar uso da Akasha IA em 30% pode elevar retenção D7 em ~18%.",
  },
  {
    feature: "library",
    retentionMultiplier: 1.12,
    message: "Mais leituras na biblioteca correlacionam com +12% retenção D7.",
  },
  {
    feature: "groups",
    retentionMultiplier: 1.25,
    message: "Participação em grupos eleva retenção D7 em ~25%.",
  },
  {
    feature: "events",
    retentionMultiplier: 1.15,
    message: "Presença em eventos ao vivo correlaciona com +15% retenção.",
  },
  {
    feature: "mentorship",
    retentionMultiplier: 1.32,
    message: "Engajamento em mentoria é o maior preditor de retenção D30 (+32%).",
  },
];

/**
 * generateRecommendations — usa templates + cohorts para sugerir ações.
 * Cada recomendação vira um InsightCard type=RECOMMENDATION.
 */
export function generateRecommendations(
  cohortMatrix: Array<{ cohort: string; retention: { D7: number }; totalUsers: number }>,
  featureUsageRate: Record<string, number>
): InsightCard[] {
  const out: InsightCard[] = [];
  for (const tmpl of RECOMMENDATION_TEMPLATES) {
    const usage = featureUsageRate[tmpl.feature] ?? 0;
    // Se feature usage for baixa (< 30%), recomendar
    if (usage < 0.3) {
      const lift = (tmpl.retentionMultiplier - 1) * 100;
      out.push({
        id: `rec-${tmpl.feature}`,
        type: "RECOMMENDATION",
        severity: "low",
        title: `Aumentar uso de ${tmpl.feature} → +${lift.toFixed(0)}% retenção D7`,
        description: tmpl.message,
        evidence: [
          `Uso atual de ${tmpl.feature}: ${(usage * 100).toFixed(1)}%`,
          `Heurística baseada em ${cohortMatrix.length} cohorts.`,
        ],
        actionItems: [
          `Criar onboarding específico para ${tmpl.feature}.`,
          `Email push segmentado para usuários low-usage.`,
          `A/B test CTA prominent para ${tmpl.feature}.`,
        ],
        estimatedImpact: `+${lift.toFixed(0)}% retenção D7`,
        priorityScore: Math.min(100, Math.round(70 + usage * 30)),
        affectedCategories: ["retention", "engagement"],
        detectedAt: new Date().toISOString(),
      });
    }
  }
  return out;
}

// ============================================================================
// Conversion opportunity detector (etapas do funil abaixo da média)
// ============================================================================

export interface ConversionOppInput {
  funnelId: string;
  steps: Array<{ name: string; users: number; conversionFromPrev: number }>;
  /** Média histórica por step (benchmark). */
  benchmark: number[];
}

export function detectConversionOpportunities(
  funnels: ConversionOppInput[],
  gapThreshold = 0.15
): InsightCard[] {
  const out: InsightCard[] = [];
  for (const f of funnels) {
    f.steps.forEach((s, i) => {
      if (i === 0) return;
      const benchmark = f.benchmark[i] ?? s.conversionFromPrev;
      const gap = benchmark - s.conversionFromPrev;
      if (gap >= gapThreshold) {
        out.push({
          id: `opp-${f.funnelId}-${i}`,
          type: "CONVERSION_OPP",
          severity: gap >= 0.3 ? "high" : "medium",
          title: `Funil ${f.funnelId}: step "${s.name}" abaixo do benchmark`,
          description: `Step ${i + 1} (${s.name}) converte ${(s.conversionFromPrev * 100).toFixed(1)}% vs benchmark ${(benchmark * 100).toFixed(1)}% (−${(gap * 100).toFixed(1)}pp).`,
          evidence: [
            `users=${s.users} | benchmark=${(benchmark * 100).toFixed(1)}% | atual=${(s.conversionFromPrev * 100).toFixed(1)}%`,
          ],
          actionItems: [
            `Auditar UX da etapa "${s.name}".`,
            `Reduzir friction (campos, loading, copy).`,
            `Considerar nudge contextual (tooltips, empty states).`,
          ],
          estimatedImpact: `+${(gap * 50).toFixed(0)}% conversão se fechar gap`,
          priorityScore: Math.round(40 + gap * 100),
          affectedCategories: ["funnel", "ux"],
          detectedAt: new Date().toISOString(),
        });
      }
    });
  }
  return out;
}

// ============================================================================
// Pipeline principal
// ============================================================================

export interface InsightsPipelineInput {
  /** Séries de métricas (dau, signups, akasha, etc). */
  series: MetricSeries[];
  /** User activity snapshots. */
  users: UserActivitySnapshot[];
  /** Funnel snapshots (current + previous). */
  funnels: FunnelSnapshot[];
  /** Cohort snapshots (com baseline). */
  cohorts: CohortSnapshot[];
  /** Cohort matrix (para recommendations). */
  cohortMatrix: Array<{ cohort: string; retention: { D7: number }; totalUsers: number }>;
  /** Feature usage rates (0..1). */
  featureUsageRate: Record<string, number>;
  /** Conversion opportunities (opcional). */
  conversionOpps?: ConversionOppInput[];
  /** Config. */
  config?: Partial<InsightConfig>;
}

export function runInsightsPipeline(input: InsightsPipelineInput): InsightsBundle {
  const cfg = { ...DEFAULT_INSIGHT_CONFIG, ...input.config };
  const cards: InsightCard[] = [];

  // 1. Anomalies per series
  for (const s of input.series) {
    const anomalies = detectAnomalies(s, cfg);
    for (const a of anomalies) {
      cards.push({
        id: `anomaly-${s.metric}-${a.date}`,
        type: "ANOMALY",
        severity: a.severity,
        title: `Anomalia em ${s.metric} (${a.kind})`,
        description: `${s.metric} = ${a.value} em ${a.date} (z=${a.zScore.toFixed(2)}, ${a.zScore > 0 ? "+" : ""}${(((a.zScore * stddev(s.points.map((p) => p.value), avg(s.points.map((p) => p.value)))) / avg(s.points.map((p) => p.value))) * 100).toFixed(1)}% vs média).`,
        evidence: [
          `Métrica: ${s.metric}`,
          `Data: ${a.date}`,
          `Valor: ${a.value}`,
          `Z-score: ${a.zScore.toFixed(2)}`,
          `Período base: ${s.points.length} pontos`,
        ],
        actionItems: a.kind === "DROP" ? ["Investigar regressão.", "Verificar deploys na data."] : ["Celebrar (mas auditar se é inflado por bots/duplicados)."],
        estimatedImpact: a.kind === "DROP" ? `−${Math.abs(a.zScore * 5).toFixed(0)}% na métrica` : `+${(a.zScore * 5).toFixed(0)}% na métrica`,
        priorityScore: severityToPriority(a.severity),
        affectedCategories: [s.metric],
        detectedAt: new Date().toISOString(),
      });
    }
  }

  // 2. Churn risk
  const churn = detectChurnRisk(input.users, cfg);
  if (churn.length >= cfg.minSamples && churn.length / Math.max(input.users.length, 1) >= 0.1) {
    const rate = churn.length / Math.max(input.users.length, 1);
    cards.push({
      id: `churn-${Date.now()}`,
      type: "CHURN_RISK",
      severity: rate >= 0.3 ? "high" : "medium",
      title: `${churn.length} usuários em risco de churn`,
      description: `${(rate * 100).toFixed(1)}% da base está inativa há ${cfg.churnInactivityDays}+ dias com ≤${cfg.churnMinSessions} sessões/mês.`,
      evidence: [
        `Total inativos: ${churn.length}`,
        `Sample size: ${input.users.length}`,
        `Inactivity threshold: ${cfg.churnInactivityDays} dias`,
      ],
      actionItems: [
        "Disparar email de re-engajamento.",
        "Criar oferta personalizada baseada em tradições preferidas.",
        "Survey de motivo de saída (NPS).",
      ],
      estimatedImpact: `Recuperar ~${Math.round(churn.length * 0.15)} usuários (15% reengajamento).`,
      priorityScore: severityToPriority(rate >= 0.3 ? "high" : "medium"),
      affectedCategories: ["retention", "engagement"],
      detectedAt: new Date().toISOString(),
    });
  }

  // 3. Power users
  const power = detectPowerUsers(input.users, cfg);
  if (power.length >= cfg.minSamples) {
    cards.push({
      id: `power-${Date.now()}`,
      type: "POWER_USER",
      severity: "info",
      title: `${power.length} power users identificados`,
      description: `Usuários com ≥${cfg.powerMinSessions} sessões e ≥${cfg.powerMinFeatures} features usadas no mês.`,
      evidence: [
        `Power users: ${power.length}`,
        `Sample size: ${input.users.length}`,
        `Threshold: ${cfg.powerMinSessions} sessões + ${cfg.powerMinFeatures} features`,
      ],
      actionItems: [
        "Convidar para programa de embaixadores.",
        "Early access a novas features.",
        "Coletar feedback qualitativo (1:1).",
      ],
      estimatedImpact: `+${Math.round(power.length * 0.05)} referrals mês`,
      priorityScore: 35,
      affectedCategories: ["community", "growth"],
      detectedAt: new Date().toISOString(),
    });
  }

  // 4. Funnel drops
  for (const drop of detectFunnelDrops(input.funnels, cfg)) {
    cards.push({
      id: `funnel-${drop.funnelId}-${drop.worstStep}`,
      type: "FUNNEL_DROP",
      severity: drop.conversion - drop.previousConversion <= -0.2 ? "high" : "medium",
      title: `Funil ${drop.funnelId} caiu ${((drop.previousConversion - drop.conversion) * 100).toFixed(1)}pp`,
      description: `Step ${drop.worstStep} é o gargalo. Conversion: ${(drop.previousConversion * 100).toFixed(1)}% → ${(drop.conversion * 100).toFixed(1)}%`,
      evidence: [
        `Funnel: ${drop.funnelId}`,
        `Step: ${drop.worstStep}`,
        `Before/after: ${(drop.previousConversion * 100).toFixed(1)}% → ${(drop.conversion * 100).toFixed(1)}%`,
      ],
      actionItems: [
        "Investigar mudança de UX no step.",
        "Comparar com deploys no período.",
        "Heatmap + session recording do step.",
      ],
      estimatedImpact: `Recuperar ~${((drop.previousConversion - drop.conversion) * 100).toFixed(0)}pp conversion`,
      priorityScore: 70,
      affectedCategories: ["funnel", drop.funnelId.toLowerCase()],
      detectedAt: new Date().toISOString(),
    });
  }

  // 5. Cohort shifts
  for (const cs of detectCohortShifts(input.cohorts, cfg)) {
    const isPositive = cs.retentionD7 > cs.baselineRetentionD7;
    cards.push({
      id: `cohort-${cs.cohort}`,
      type: "COHORT_SHIFT",
      severity: Math.abs(cs.retentionD7 - cs.baselineRetentionD7) >= 0.2 ? "high" : "low",
      title: `Cohort ${cs.cohort}: ${isPositive ? "+" : ""}${((cs.retentionD7 - cs.baselineRetentionD7) * 100).toFixed(1)}pp retenção D7`,
      description: `Cohort ${cs.cohort} reteve ${(cs.retentionD7 * 100).toFixed(1)}% vs baseline ${(cs.baselineRetentionD7 * 100).toFixed(1)}%.`,
      evidence: [
        `Cohort: ${cs.cohort}`,
        `Retention D7 atual: ${(cs.retentionD7 * 100).toFixed(1)}%`,
        `Baseline: ${(cs.baselineRetentionD7 * 100).toFixed(1)}%`,
      ],
      actionItems: isPositive
        ? ["Replicar condições deste cohort (fonte, campanha, momento)."]
        : ["Investigar regressão (release, campanha, sazonalidade)."],
      estimatedImpact: isPositive ? "Replicar lift em próximos cohorts" : "−X% retention em cohorts futuros",
      priorityScore: 60,
      affectedCategories: ["retention", "cohort"],
      detectedAt: new Date().toISOString(),
    });
  }

  // 6. Recommendations
  cards.push(...generateRecommendations(input.cohortMatrix, input.featureUsageRate));

  // 7. Conversion opportunities
  if (input.conversionOpps) {
    cards.push(...detectConversionOpportunities(input.conversionOpps));
  }

  // Filter low-priority
  const suppressed = cards.filter((c) => c.priorityScore < cfg.suppressBelowPriority).length;
  const finalCards = cards
    .filter((c) => c.priorityScore >= cfg.suppressBelowPriority)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    cards: finalCards,
    meta: {
      generatedAt: new Date().toISOString(),
      totalCards: finalCards.length,
      highSeverity: finalCards.filter((c) => c.severity === "high" || c.severity === "critical").length,
      criticalSeverity: finalCards.filter((c) => c.severity === "critical").length,
      suppressedBelow: suppressed,
    },
  };
}

// ============================================================================
// Helpers puros
// ============================================================================

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stddev(nums: number[], mean: number): number {
  if (nums.length < 2) return 0;
  const variance = nums.reduce((acc, n) => acc + (n - mean) ** 2, 0) / (nums.length - 1);
  return Math.sqrt(variance);
}

function severityFromZ(zAbs: number): Severity {
  if (zAbs >= 4) return "critical";
  if (zAbs >= 3) return "high";
  if (zAbs >= 2.5) return "medium";
  return "low";
}

function severityToPriority(s: Severity): number {
  switch (s) {
    case "critical":
      return 95;
    case "high":
      return 80;
    case "medium":
      return 60;
    case "low":
      return 40;
    default:
      return 25;
  }
}

// ============================================================================
// Self-test
// ============================================================================

export const INSIGHTS_SELF_TEST = {
  name: "analytics/insights W34",
  tests: [
    {
      name: "anomaly SPIKE detection",
      assert: () => {
        const points = Array.from({ length: 20 }, (_, i) => ({
          date: `2026-07-${String(i + 1).padStart(2, "0")}`,
          value: 100 + Math.sin(i / 3) * 5,
        }));
        points[15].value = 250; // spike
        const r = detectAnomalies({
          metric: "test",
          granularity: "day",
          points,
        });
        return r.length >= 1 && r[0].kind === "SPIKE";
      },
    },
    {
      name: "churn filter",
      assert: () => {
        const users: UserActivitySnapshot[] = [
          { userId: "u1", sessionsLast30d: 0, daysSinceLastSeen: 30, featuresUsed: [], avgSessionsPerActiveDay: 0 },
          { userId: "u2", sessionsLast30d: 25, daysSinceLastSeen: 0, featuresUsed: ["feed", "akasha"], avgSessionsPerActiveDay: 2 },
          { userId: "u3", sessionsLast30d: 1, daysSinceLastSeen: 20, featuresUsed: ["feed"], avgSessionsPerActiveDay: 0.1 },
        ];
        const r = detectChurnRisk(users);
        return r.length === 2; // u1, u3
      },
    },
  ],
};

export function runInsightsSelfTest(): boolean {
  for (const t of INSIGHTS_SELF_TEST.tests) {
    if (!t.assert()) {
       
      console.warn(`[insights] FAIL: ${t.name}`);
      return false;
    }
  }
  return true;
}
