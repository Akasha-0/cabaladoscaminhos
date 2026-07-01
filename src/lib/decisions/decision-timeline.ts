/**
 * decisions/decision-timeline — D-7 to D+30 milestones (W37)
 * ============================================================================
 * Sequência canônica da timeline aberta do beta decision:
 *
 *   D-7 (W37 close)  → Cross-functional review com Founder
 *   D-3              → Final go/no-go decision (do MATRIX 18 KPIs)
 *   D-1              → Pre-launch announcement (interno + Advisor group)
 *   D-0              → LAUNCH (Wave 4 open beta — 500 users ou 100 CONSTRAINED)
 *   D+1              → Monitoring + first metric review
 *   D+7              → First weekly review
 *   D+30             → First monthly strategic review
 *
 * Cada milestone tem:
 *   - Action items concretos
 *   - Owner role
 *   - Deliverable artifact (doc/check/dashboard)
 *   - Decision-gate: bloqueia progressão se FAIL?
 *
 * Timeline é congelada W37 + W37.5 (Wave 4 prep). Decisão real (D-0) só
 * acontece após D-3.
 *
 * LGPD: nada pessoal aqui — só roles + deliverables.
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export type MilestoneRelative = "D-7" | "D-3" | "D-1" | "D-0" | "D+1" | "D+7" | "D+30";

export interface TimelineMilestone {
  /** Offset relativo ao D-0 (launch). */
  relativeDay: MilestoneRelative;
  /** Day offset integer (negative = pre-launch, 0 = launch, positive = post). */
  dayOffset: number;
  /** Title curto. */
  title: string;
  /** Detailed description. */
  description: string;
  /** Action items execution-level. */
  actionItems: string[];
  /** Owner role. */
  owner: string;
  /** Deliverable artifact (doc, dashboard, announcement). */
  deliverable: string;
  /** Hard or soft gate? */
  gate: "hard" | "soft" | "none";
  /** Failure consequence se não concluído. */
  failureConsequence: string;
}

// ============================================================================
// D-7 — Cross-functional review
// ============================================================================

const D_MINUS_7: TimelineMilestone = {
  relativeDay: "D-7",
  dayOffset: -7,
  title: "Cross-functional review",
  description:
    "Review final com Founder + PM + Coder + QA + Designer (ca. 90min) dos 18 KPIs + risk register + action items checklist. Decisão de 'segue' ou 'pausa' agendada para D-3.",
  actionItems: [
    "Carregar Wave 37 dashboard (`/admin/decisions/open-beta`) e validar 18 KPIs atualizados",
    "Revisar risk register (8 risks W32-8) → status mitigated/monitoring/active",
    "Validar completion dos 12 itens do pre-launch checklist",
    "Apresentar Wave 4 plan: 500 users (GO) vs 100 users (CONSTRAINED) vs 0 (NO-GO)",
    "Cross-check contra benchmarks externos (Phiture, Amplitude, web.dev)",
    "Sniff test do marketplace + auth + Akasha IA (últimas 24h sem P0)",
    "Confirmar on-call rotation (W37A-2) ativa",
  ],
  owner: "PM (Tomás)",
  deliverable: "D-7 review minutes (1 página) + slide deck (10 slides)",
  gate: "soft",
  failureConsequence:
    "Se review não acontecer, D-3 decision é feita sem cross-functional input — risco de viés de PM.",
};

// ============================================================================
// D-3 — Final go/no-go decision
// ============================================================================

const D_MINUS_3: TimelineMilestone = {
  relativeDay: "D-3",
  dayOffset: -3,
  title: "Final go/no-go decision",
  description:
    "Decisão FINAL baseada no `computeGoNoGoReport()` da W37 dashboard. Weighted score + P0 reds + risk register snapshot. Founder tem veto. Decisão publicada em `decision-log.md`.",
  actionItems: [
    "Rodar `computeGoNoGoReport()` com actuals finais",
    "Documentar weighted score + traffic light por KPI + rationale",
    "Se GO: confirmar que p0RedCount === 0 AND score ≥ 0.85",
    "Se CONDITIONAL: validar mitigation plan para os P0 reds específicos",
    "Se NO-GO: agendar retrospective 14d pós-decisão (kill switch evaluation)",
    "Obter ack explícito do Founder em `decision-log.md`",
  ],
  owner: "Founder (Gabriel)",
  deliverable: "`docs/DECISION-LOG-W37.md` com reasoning + ack + timestamp",
  gate: "hard",
  failureConsequence:
    "Sem decisão em D-3, default é HOLD (não abrir Wave 4 sem owner approval explícita).",
};

// ============================================================================
// D-1 — Pre-launch announcement
// ============================================================================

const D_MINUS_1: TimelineMilestone = {
  relativeDay: "D-1",
  dayOffset: -1,
  title: "Pre-launch announcement",
  description:
    "Anúncio para waitlist + Advisors + curadores que Wave 4 abre amanhã. Setup final de billing + emails + monitoring. Última sanity check de infra.",
  actionItems: [
    "Email pre-launch para waitlist (segment por tier — beta alumni vs new)",
    "Confirmar Resend + PostHog + Sentry + Stripe + Supabase live",
    "Último smoke test de signup → onboarding → primeiro post",
    "Ativar on-call rotation (status: ACTIVE)",
    "Briefing ao primeiro human moderator (W37A-4 hire)",
    "Post de boas-vindas agendado para D-0 8h",
  ],
  owner: "PM (Tomás) + Coder",
  deliverable: "Pre-launch email enviada + status page verde + smoke test PASS",
  gate: "soft",
  failureConsequence:
    "Sem pre-launch email, Wave 4 abre sem buzz e D+1 CAC orgânico é 0 — recovery requer ads pagos.",
};

// ============================================================================
// D-0 — Launch 🚀
// ============================================================================

const D_0: TimelineMilestone = {
  relativeDay: "D-0",
  dayOffset: 0,
  title: "LAUNCH — Wave 4 open beta",
  description:
    "Abertura oficial do Wave 4 (capacidade 500 users se GO, 100 se CONSTRAINED). Post de boas-vindas no feed + emails transacionais + monitor em modo real-time.",
  actionItems: [
    "8h UTC: post público de boas-vindas + changelog",
    "9h UTC: emails transacionais (welcome) enviados em batch (cap 100/h)",
    "Throughout day: monitor real-time via PostHog dashboards + Sentry",
    "On-call team em plantão (rotation W37A-2)",
    "Status page ativa e visível em /status",
    "Snapshot manual de KPI baseline @ 18h UTC (D+0 closeout)",
  ],
  owner: "PM + Coder + DevOps",
  deliverable: "Post público + 100-500 signups no D-0 + status page in green",
  gate: "none",
  failureConsequence:
    "Falha no D-0 só é calamitosa se originar P0 incident. Rollback plan ativo para reverter.",
};

// ============================================================================
// D+1 — First metric review
// ============================================================================

const D_PLUS_1: TimelineMilestone = {
  relativeDay: "D+1",
  dayOffset: 1,
  title: "First metric review (24h checkpoint)",
  description:
    "Revisão executiva 90min do snapshot de 24h. Comparar actuals D+1 contra targets D-3. Decisão: seguir ou triggerar contingency playbook.",
  actionItems: [
    "Carregar `/admin/decisions/open-beta` dashboard",
    "Recalcular `computeGoNoGoReport()` com actuals D+1",
    "Comparar vs baseline D-0 (delta por KPI)",
    "Identificar regressions (qual KPI caiu desde D-0)",
    "Triagem de tickets de suporte / feedback aberto nas últimas 24h",
    "Publicar snapshot para Founder via Slack/email",
    "Decisão: segue / aciona contingency (§7 W32-8) / rollback",
  ],
  owner: "PM (Tomás)",
  deliverable: "D+1 snapshot report (1-2 páginas) + status update",
  gate: "soft",
  failureConsequence:
    "Se métricas D+1 já mostram regressão > 20% em qualquer P0, trigger contingency imediatamente.",
};

// ============================================================================
// D+7 — First weekly review
// ============================================================================

const D_PLUS_7: TimelineMilestone = {
  relativeDay: "D+7",
  dayOffset: 7,
  title: "First weekly review",
  description:
    "Revisão semanal 60min. 7 dias de dados reais (D1 retention experimental, signup counts, NPS primeiras respostas).",
  actionItems: [
    "Cohort analysis D1 retention (todos usuários que entraram no Wave 4)",
    "Funil conversion: signup → activation D1 → primeira interação significativa",
    "Akasha IA usage snapshot (citation rate + refusal precision da semana)",
    "Top 5 reports de moderação (categorização)",
    "Top 3 feedbacks qualitativos (post-mortem dos comentários)",
    "Atualizar 18 KPIs com actuals D+7",
    "Decisão: manter capacidade / aumentar / decrease",
  ],
  owner: "PM (Tomás) + QA (Ravena)",
  deliverable: "D+7 weekly report (`docs/WEEK-1-REVIEW.md`)",
  gate: "soft",
  failureConsequence:
    "Sem review semanal, drifts acumulam sem correção. W32-8 §7.1 contingency é ativada após 2 semanas sem review.",
};

// ============================================================================
// D+30 — First monthly strategic review
// ============================================================================

const D_PLUS_30: TimelineMilestone = {
  relativeDay: "D+30",
  dayOffset: 30,
  title: "First monthly strategic review",
  description:
    "Revisão estratégica mensal 4h. Day 30 metrics completas (D7 + D30 cohorts reais). Decisão macro: continua, expande, ou pivota Wave 5.",
  actionItems: [
    "D7 retention consolidada (todos os cohorts D-0..D+30)",
    "Engagement consolidado (DAU/MAU, posts/user, Akasha usage)",
    "Health grade final (todos P0 reds durante o mês + resolução)",
    "Risk register: quais risks auto-flagged? foram resolvidos em quanto tempo?",
    "Reputation scan (press, social, reviews)",
    "Bottom-line: validar H1+H2+H3 (W32-8 §2.2)",
    "Decisão Wave 5: continuar / iterar / pivotar / kill",
  ],
  owner: "Founder + PM + Coder",
  deliverable: "`docs/MONTH-1-STRATEGIC-REVIEW.md` + OKR Wave 5 publicado",
  gate: "hard",
  failureConsequence:
    "Falha do D+30 review significa Wave 5 segue sem estratégia — drift de produto.",
};

// ============================================================================
// Timeline
// ============================================================================

export const DECISION_TIMELINE: ReadonlyArray<TimelineMilestone> = Object.freeze([
  D_MINUS_7,
  D_MINUS_3,
  D_MINUS_1,
  D_0,
  D_PLUS_1,
  D_PLUS_7,
  D_PLUS_30,
]);

export const MILESTONE_BY_RELATIVE_DAY: Readonly<Partial<Record<MilestoneRelative, TimelineMilestone>>> =
  Object.freeze(
    DECISION_TIMELINE.reduce<Record<MilestoneRelative, TimelineMilestone>>((acc, m) => {
      acc[m.relativeDay] = m;
      return acc;
    }, {} as Record<MilestoneRelative, TimelineMilestone>),
  );

// ============================================================================
// Helpers
// ============================================================================

export function nextMilestone(currentOffset: number): TimelineMilestone | null {
  const sorted = [...DECISION_TIMELINE].sort((a, b) => a.dayOffset - b.dayOffset);
  for (const m of sorted) {
    if (m.dayOffset > currentOffset) return m;
  }
  return null;
}

export function milestonesBefore(offset: number): TimelineMilestone[] {
  return DECISION_TIMELINE.filter((m) => m.dayOffset <= offset);
}

export function milestonesAfter(offset: number): TimelineMilestone[] {
  return DECISION_TIMELINE.filter((m) => m.dayOffset > offset);
}

export function countHardGates(timeline: ReadonlyArray<TimelineMilestone> = DECISION_TIMELINE): number {
  return timeline.filter((m) => m.gate === "hard").length;
}

// ============================================================================
// Zod schemas
// ============================================================================

export const TimelineMilestoneSchema = z.object({
  relativeDay: z.enum(["D-7", "D-3", "D-1", "D-0", "D+1", "D+7", "D+30"]),
  dayOffset: z.number().int(),
  title: z.string(),
  description: z.string(),
  actionItems: z.array(z.string()),
  owner: z.string(),
  deliverable: z.string(),
  gate: z.enum(["hard", "soft", "none"]),
  failureConsequence: z.string(),
});
