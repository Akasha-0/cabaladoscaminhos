/**
 * decisions/risk-register — 8 risks da W32-8 + status atual (W37)
 * ============================================================================
 * Risk register formal derivado de `BETA-LAUNCH-STRATEGY-W32.md §6`.
 * Status e triggers foram atualizados para refletir a posição @ Wave 37 close
 * (carryover W36 fechado via W37A workers + open beta decision W37B).
 *
 * Status semantics:
 *   - "mitigated": risk neutralizado por W37A infrastructure (auto-flag silent).
 *   - "monitoring": trigger existe, mas ainda monitorando ativamente.
 *   - "active": risk de facto presente, action items pendentes.
 *
 * Auto-flag:
 *   - Cada risco tem `autoFlagIf` (boolean expression em natural language
 *     referenciando os KPIs). Wave 37.5 owner-side review tool chama
 *     `evaluateRiskAutoFlags()` e devolve lista de risks prontos p/ fire.
 *
 * LGPD:
 *   - Sem PII. Owner = role (e.g. "PM (Tomás)"). Sem emails.
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export type RiskStatus = "mitigated" | "monitoring" | "active";

export type RiskProbability = "low" | "medium" | "high";
export type RiskImpact = "low" | "medium" | "high" | "very-high";

export interface MitigationAction {
  /** Descrição concisa da ação. */
  action: string;
  /** Owner (role). */
  owner: string;
  /** Status: "done" / "in-progress" / "blocked" / "planned". */
  status: "done" | "in-progress" | "blocked" | "planned";
  /** ISO date of completion (if done). */
  completedAt?: string;
}

export interface RiskEntry {
  /** Stable ID (R1..R8). */
  id: string;
  /** Short title. */
  title: string;
  /** Long-form description (operational). */
  description: string;
  /** Probability @ Wave 37 close. */
  probability: RiskProbability;
  /** Impact magnitude. */
  impact: RiskImpact;
  /** Status atual. */
  status: RiskStatus;
  /** Triggers (boolean expr or numeric threshold reference). */
  triggers: string[];
  /** Owner role. */
  owner: string;
  /** Mitigation actions taken. */
  mitigations: MitigationAction[];
  /** Auto-flag natural-language predicate. */
  autoFlagIf: string;
  /** Order de risco no matrix visual (1=top-priority). */
  rank: number;
}

// ============================================================================
// R1 — Poucos users ativos (DAU/MAU baixo, feed vazio)
// ============================================================================

const R1: RiskEntry = {
  id: "R1",
  title: "Poucos users ativos (DAU/MAU baixo)",
  description:
    "Users entram mas usam pouco. Feed fica vazio. Engagement engine não engata.",
  probability: "medium",
  impact: "very-high",
  status: "monitoring",
  triggers: ["DAU/MAU < 25% por 7d", "Median sessions/user/week < 1"],
  owner: "PM (Tomás)",
  mitigations: [
    {
      action: "Seed content 30-50 posts antes do T-0 (W32-8 §3.2)",
      owner: "PM + Curadores",
      status: "done",
      completedAt: "2026-06-28",
    },
    {
      action: "Office hours diários (criar ritual) — ativado Wave 1",
      owner: "PM",
      status: "in-progress",
    },
    {
      action: "DM manual para quiet users na semana 1 (Wave-1 outreach)",
      owner: "PM",
      status: "in-progress",
    },
    {
      action: "Weekly challenge cross-tradition (post incentivado)",
      owner: "PM + IA",
      status: "planned",
    },
  ],
  autoFlagIf: "engagement-dau-mau < 25 OR post_count / active_users_7d < 1.5",
  rank: 1,
};

// ============================================================================
// R2 — Comunidade tóxica (brigas, fundamentalismo)
// ============================================================================

const R2: RiskEntry = {
  id: "R2",
  title: "Comunidade tóxica (fundamentalismo, proselitismo)",
  description:
    "Brigas entre tradições, fundamentalismo agressivo, comportamento de proselitismo.",
  probability: "low",
  impact: "very-high",
  status: "active",
  triggers: ["Toxicidade > 0.3 reports/user/semana", "Moderação P1 backlog > 24h"],
  owner: "PM + Mod",
  mitigations: [
    {
      action: "Mod cultural-aware treinado (não PM) — primeiro hire planejado Wave 37A-4",
      owner: "Founder + PM",
      status: "in-progress",
    },
    {
      action: "Regras de universalismo explícitas no onboarding",
      owner: "Designer + PM",
      status: "done",
    },
    {
      action: "IA detecta palavras-gatilho + alerta mod (W36 Akasha prompt-base carryover)",
      owner: "Coder",
      status: "done",
    },
    {
      action: "Código de conduta publicado (/codigo-conduta) com cláusula ban-sem-segunda-chance",
      owner: "PM",
      status: "planned",
    },
  ],
  autoFlagIf: "health-moderation-sla < 80 OR toxicity reports/user/week > 0.3",
  rank: 2,
};

// ============================================================================
// R3 — Dominância de uma tradição silenciando vozes
// ============================================================================

const R3: RiskEntry = {
  id: "R3",
  title: "Dominância de uma tradição (silencia minorias)",
  description:
    "Candomblé (ou outra tradição específica) domina numericamente e silencia vozes de outras tradições.",
  probability: "medium",
  impact: "high",
  status: "monitoring",
  triggers: [
    "Cross-tradition engagement < 30%",
    "Top tradição tem > 60% share of voice",
  ],
  owner: "PM + IA",
  mitigations: [
    {
      action: "Quota de tradição no seed content",
      owner: "PM",
      status: "done",
    },
    {
      action: "Destaque semanal para tradições sub-representadas",
      owner: "PM + Curadores",
      status: "in-progress",
    },
    {
      action: "IA sugere 'ler post de tradição X diferente da sua'",
      owner: "Coder",
      status: "in-progress",
    },
    {
      action: "'Tradição do mês' spotlight rotativo",
      owner: "PM",
      status: "planned",
    },
  ],
  autoFlagIf: "cross_tradition_engagement < 0.3 OR top_tradition_share > 0.6",
  rank: 3,
};

// ============================================================================
// R4 — PM burnout (50 users × white-glove × feedback < 24h)
// ============================================================================

const R4: RiskEntry = {
  id: "R4",
  title: "PM burnout (single point of failure)",
  description:
    "Operador (PM) sobrecarregado por 50 users × white-glove × office hours × feedback < 24h.",
  probability: "high",
  impact: "very-high",
  status: "active",
  triggers: [
    "PM > 60h/semana",
    "PM burnout auto-avaliação ≥ 4",
    "Feedback SLA quebrado (> 48h)",
  ],
  owner: "Founder (Gabriel)",
  mitigations: [
    {
      action: "Cap white-glove intensive Wave 1, assíncrono Wave 2/3",
      owner: "PM",
      status: "done",
    },
    {
      action: "3 curadores convidados dividem office hours (não PM sozinho)",
      owner: "PM + Founder",
      status: "in-progress",
    },
    {
      action: "Feedback assíncrono > síncrono sempre que possível",
      owner: "PM",
      status: "in-progress",
    },
    {
      action: "Plano de backup: 1 curador líder assume office hours se PM sair",
      owner: "Founder",
      status: "blocked",
    },
  ],
  autoFlagIf: "pm_hours_per_week > 60 OR pm_burnout_score >= 4",
  rank: 4,
};

// ============================================================================
// R5 — Akasha IA dá resposta inadequada
// ============================================================================

const R5: RiskEntry = {
  id: "R5",
  title: "Akasha IA dá resposta inadequada (prescreve, promete cura)",
  description:
    "Akasha IA promete cura, prescreve práticas, desrespeita limite da tradição, cita mal ou não cita fontes.",
  probability: "medium",
  impact: "very-high",
  status: "monitoring",
  triggers: [
    "Citation rate < 60%",
    "Refusal precision < 80%",
    "Report de inadequação > 0/week",
  ],
  owner: "PM + Coder",
  mitigations: [
    {
      action: "Hard rules do VISION §9 aplicadas como system prompt",
      owner: "Coder",
      status: "done",
    },
    {
      action: "Persona explicita limites no prompt — W37 prompts especializados",
      owner: "Coder + PM",
      status: "done",
    },
    {
      action: "Primeiras 100 respostas auditadas antes de Wave 1 — log IA criado",
      owner: "PM",
      status: "done",
    },
    {
      action: "Log de toda interação IA → revisado semanalmente pelo PM",
      owner: "PM",
      status: "in-progress",
    },
    {
      action: "Report inadequação → fix imediato + comunicação transparente",
      owner: "PM + Coder",
      status: "in-progress",
    },
  ],
  autoFlagIf: "health-akasha-refusal-precision < 80 OR citation_rate < 60",
  rank: 5,
};

// ============================================================================
// R6 — Performance lenta no mobile
// ============================================================================

const R6: RiskEntry = {
  id: "R6",
  title: "Performance lenta no mobile (LCP/CLS/INP)",
  description:
    "Latência alta em devices mobile compromete ativação e retenção de cohort majoritariamente mobile.",
  probability: "medium",
  impact: "medium",
  status: "monitoring",
  triggers: [
    "LCP p95 > 4s",
    "CLS p95 > 0.25",
    "INP p95 > 500ms",
  ],
  owner: "Coder + QA",
  mitigations: [
    {
      action: "Lazy loading de imagens — implementado W36-3 perf",
      owner: "Coder",
      status: "done",
    },
    {
      action: "Code splitting por rota — Next.js nativo",
      owner: "Coder",
      status: "done",
    },
    {
      action: "Akasha IA streaming (não bloqueia UI)",
      owner: "Coder",
      status: "done",
    },
    {
      action: "Audit Lighthouse semanal (Ravena)",
      owner: "QA",
      status: "in-progress",
    },
    {
      action: "Graceful degradation: se IA falhar, cache últimos 50 prompts",
      owner: "Coder",
      status: "in-progress",
    },
    {
      action: "Load test 100 RPS p99 < 500ms (W37A-1) — aberto até Wave 37 close",
      owner: "Coder + DevOps",
      status: "in-progress",
    },
  ],
  autoFlagIf: "health-lcp-p95 > 4 OR health-cls-p95 > 0.25 OR health-inp-p95 > 500",
  rank: 6,
};

// ============================================================================
// R7 — User em crise espiritual/mental aguda
// ============================================================================

const R7: RiskEntry = {
  id: "R7",
  title: "User em crise espiritual/mental aguda",
  description:
    "User atravessa crise espiritual aguda (perda, dark night of the soul) ou piora clínica. Plataforma não substitui suporte profissional.",
  probability: "low",
  impact: "very-high",
  status: "monitoring",
  triggers: [
    "Report de moderação 'em crise'",
    "DM direta do user mencionando ideação",
    "Conteúdo detectado via IA com palavra-gatilho crítica",
  ],
  owner: "PM + Mod",
  mitigations: [
    {
      action: "Disclaimer explícito no onboarding ('não substitui profissional de saúde')",
      owner: "Designer + PM",
      status: "done",
    },
    {
      action: "IA encaminha CVV 188 (BR) + 988 (US) em protocolo de crise",
      owner: "Coder",
      status: "done",
    },
    {
      action: "PM treinado para responder com empatia + encaminhar",
      owner: "Founder",
      status: "in-progress",
    },
    {
      action: "Runbook /runbooks/crisis.md documentado",
      owner: "PM",
      status: "planned",
    },
  ],
  autoFlagIf: "crisis_flag_ia_count > 0 OR moderation_queue_crisis_tag > 0",
  rank: 7,
};

// ============================================================================
// R8 — Vazamento da beta
// ============================================================================

const R8: RiskEntry = {
  id: "R8",
  title: "Vazamento da beta (conteúdo privado compartilhado)",
  description:
    "User convida não-convidado, printa conteúdo privado, ou causa Data-breach involuntário (screenshot com PII).",
  probability: "low",
  impact: "medium",
  status: "monitoring",
  triggers: [
    "> 1 report de conteúdo beta fora do grupo",
    "Screenshot com PII detectada",
  ],
  owner: "PM + Mod",
  mitigations: [
    {
      action: "Termo de uso explícito (não-compartilhamento) assinado no signup",
      owner: "PM",
      status: "done",
    },
    {
      action: "Conteúdo público dentro da beta (evita problema)",
      owner: "PM",
      status: "done",
    },
    {
      action: "Ban imediato se vazar",
      owner: "PM + Mod",
      status: "in-progress",
    },
    {
      action: "Marca d'água em screenshots oficiais (não em user content)",
      owner: "Designer",
      status: "planned",
    },
  ],
  autoFlagIf: "leak_report_count > 1",
  rank: 8,
};

// ============================================================================
// Register
// ============================================================================

export const RISK_REGISTER: ReadonlyArray<RiskEntry> = Object.freeze([
  R1, R2, R3, R4, R5, R6, R7, R8,
]);

export const RISK_BY_ID: Readonly<Record<string, RiskEntry>> = Object.freeze(
  RISK_REGISTER.reduce<Record<string, RiskEntry>>((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {}),
);

// ============================================================================
// Helpers
// ============================================================================

export interface RiskSummary {
  total: number;
  mitigated: number;
  monitoring: number;
  active: number;
  highImpactCount: number;
  veryHighImpactCount: number;
}

export function summarizeRisks(risks: ReadonlyArray<RiskEntry> = RISK_REGISTER): RiskSummary {
  return {
    total: risks.length,
    mitigated: risks.filter((r) => r.status === "mitigated").length,
    monitoring: risks.filter((r) => r.status === "monitoring").length,
    active: risks.filter((r) => r.status === "active").length,
    highImpactCount: risks.filter((r) => r.impact === "high").length,
    veryHighImpactCount: risks.filter((r) => r.impact === "very-high").length,
  };
}

/**
 * Calcula quais risks devem ser auto-flagged dado um set de KPI actuals.
 * Natural-language predicates são avalidados pelo owner (humano) — esta
 * função apenas returns lista de risks `active` para triagem.
 */
export function evaluateRiskAutoFlags(
  risks: ReadonlyArray<RiskEntry> = RISK_REGISTER,
): ReadonlyArray<RiskEntry> {
  // Sem lexer em runtime: retorna todos os risks `active` para revisão manual.
  // Owner-side tool (ou Ravena dashboard) interpreta `autoFlagIf` texto.
  return risks.filter((r) => r.status === "active");
}

// ============================================================================
// Zod schemas (for runtime validation if imported elsewhere)
// ============================================================================

export const MitigationActionSchema = z.object({
  action: z.string().min(1),
  owner: z.string().min(1),
  status: z.enum(["done", "in-progress", "blocked", "planned"]),
  completedAt: z.string().optional(),
});

export const RiskEntrySchema = z.object({
  id: z.string().regex(/^R\d+$/),
  title: z.string(),
  description: z.string(),
  probability: z.enum(["low", "medium", "high"]),
  impact: z.enum(["low", "medium", "high", "very-high"]),
  status: z.enum(["mitigated", "monitoring", "active"]),
  triggers: z.array(z.string()),
  owner: z.string(),
  mitigations: z.array(MitigationActionSchema),
  autoFlagIf: z.string(),
  rank: z.number().int().positive(),
});
