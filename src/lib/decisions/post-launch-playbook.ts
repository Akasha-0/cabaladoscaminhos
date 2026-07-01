/**
 * decisions/post-launch-playbook — Rollout cadence pós-launch (W37)
 * ============================================================================
 * Cadência de monitoring + reviews + escalation após D-0:
 *
 *   Primeiras 24h:  hourly checkpoints (12 deles: D+0 h0..h23)
 *                   Triggers severity-1 incidents.
 *   Primeira semana: daily reviews (D+1..D+7, 7 reviews)
 *                   Triggers contingency playbook (W32-8 §7).
 *   Primeiro mês:   weekly reviews (W+1..W+4, 4 reviews)
 *                   Rollback plan ativa se D+30 strategic review FAIL.
 *
 * Cada cadência tem:
 *   - cadence: 'hourly' | 'daily' | 'weekly'
 *   - checkpoints: lista de checkpoints com horário / owner / action
 *   - rollbackTriggers: condições que ativam rollback plan
 *   - escalationPath: quem scale-up se checkpoint FAIL
 *
 * Rollback plan:
 *   - Disable Wave 4 invites (volta para waitlist-only)
 *   - Post-mortem em < 48h
 *   - Comunicação transparente para affected users
 *   - Decision: re-launch (W37+) ou kill switch.
 *
 * LGPD: plano puramente operacional. Sem PII.
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export type Cadence = "hourly" | "daily" | "weekly";

export interface Checkpoint {
  /** Hour offset (hourly), day offset (daily), or week offset (weekly). */
  offset: number;
  /** Title. */
  title: string;
  /** Action. */
  action: string;
  /** Owner role. */
  owner: string;
  /** Severity if FAIL. */
  severity: "informational" | "warning" | "critical";
}

export interface RollbackTrigger {
  /** ID. */
  id: string;
  /** Description. */
  description: string;
  /** Threshold condition. */
  threshold: string;
  /** Auto-fire or manual? */
  automated: boolean;
}

export interface CadencePlan {
  cadence: Cadence;
  startDayOffset: number;
  endDayOffset: number;
  description: string;
  checkpoints: Checkpoint[];
  rollbackTriggers: RollbackTrigger[];
  /** Owner da cadence. */
  owner: string;
  /** Auto-execute rollback se trigger FIRE. */
  autoRollbackEnabled: boolean;
}

// ============================================================================
// Plan 1 — First 24h: hourly checkpoints
// ============================================================================

const HOURLY_CHECKPOINTS: Checkpoint[] = Array.from({ length: 24 }, (_, h) => ({
  offset: h,
  title: `H+${h} checkpoint`,
  action:
    h === 0
      ? "Snapshot baseline dashboard + post público visível + status page green"
      : h === 12
        ? "Mid-day snapshot: signups, active users, P0 incidents count"
        : h === 23
          ? "24h close-out: traffic light 18 KPIs + first NPS responses"
          : `Snapshot incremental: counters de signup/activation/error`,
  owner: h === 0 || h === 23 ? "PM (Tomás)" : "On-call Coder",
  severity:
    h === 0 || h === 12 || h === 23 ? "critical" : "warning",
}));

const HOURLY_TRIGGERS: RollbackTrigger[] = [
  {
    id: "RT-H1",
    description: "P0 incident nos primeiros 60min (crash > 1%, auth down)",
    threshold: "health-crash-free < 95 OR health-auth-success < 90",
    automated: false,
  },
  {
    id: "RT-H2",
    description: "API latency p95 > 5s sustained (10min+ rolling)",
    threshold: "health-api-p95 > 5 sustained 10min",
    automated: true,
  },
  {
    id: "RT-H3",
    description: "Akasha IA retorna > 5% error rate",
    threshold: "akasha_error_rate_5xx > 0.05",
    automated: true,
  },
  {
    id: "RT-H4",
    description: "Status page red + 3+ customer-facing errors reportados",
    threshold: "user_error_reports_count_24h > 3",
    automated: false,
  },
];

const HOURLY_PLAN: CadencePlan = {
  cadence: "hourly",
  startDayOffset: 0,
  endDayOffset: 0,
  description:
    "Primeiras 24h pós-launch com checkpoint horário. Trigger rollback se qualquer RT-H fire.",
  checkpoints: HOURLY_CHECKPOINTS,
  rollbackTriggers: HOURLY_TRIGGERS,
  owner: "On-call rotation (W37A-2)",
  autoRollbackEnabled: true,
};

// ============================================================================
// Plan 2 — First week: daily reviews
// ============================================================================

const DAILY_CHECKPOINTS: Checkpoint[] = [
  { offset: 1, title: "D+1 review", action: "computeGoNoGoReport + delta vs D-0 baseline", owner: "PM", severity: "critical" },
  { offset: 2, title: "D+2 review", action: "Activation funnel + DAU/MAU trend", owner: "PM", severity: "warning" },
  { offset: 3, title: "D+3 review", action: "D1 retention experimental cohort + Akasha precision", owner: "PM + Coder", severity: "warning" },
  { offset: 4, title: "D+4 review", action: "Moderação queue SLA + community health", owner: "Mod", severity: "warning" },
  { offset: 5, title: "D+5 review", action: "Engagement metrics + posts/user ratio", owner: "PM", severity: "warning" },
  { offset: 6, title: "D+6 review", action: "Conversion funil + first paying customer", owner: "Coder + PM", severity: "warning" },
  { offset: 7, title: "D+7 weekly review", action: "Full 18 KPIs + risk register update + Wave 5 prep", owner: "PM + QA", severity: "critical" },
];

const DAILY_TRIGGERS: RollbackTrigger[] = [
  {
    id: "RT-D1",
    description: "D1 retention < 30% (abaixo do threshold W37)",
    threshold: "retention-d1 < 30",
    automated: false,
  },
  {
    id: "RT-D2",
    description: "Cross-tradition engagement < 25% por 7 dias",
    threshold: "cross_tradition_engagement_7d < 0.25",
    automated: false,
  },
  {
    id: "RT-D3",
    description: "Moderação queue backlog > 48h",
    threshold: "moderation_queue_oldest_hours > 48",
    automated: true,
  },
  {
    id: "RT-D4",
    description: "Citation rate Akasha < 60% (W32-8 R5 trigger)",
    threshold: "akasha_citation_rate < 0.60",
    automated: false,
  },
];

const DAILY_PLAN: CadencePlan = {
  cadence: "daily",
  startDayOffset: 1,
  endDayOffset: 7,
  description:
    "D+1..D+7: reviews diários 30min. D+7 é weekly estratégico. Triggers RT-D disparam contingency.",
  checkpoints: DAILY_CHECKPOINTS,
  rollbackTriggers: DAILY_TRIGGERS,
  owner: "PM (Tomás)",
  autoRollbackEnabled: false,
};

// ============================================================================
// Plan 3 — First month: weekly reviews
// ============================================================================

const WEEKLY_CHECKPOINTS: Checkpoint[] = [
  { offset: 14, title: "W+2 review", action: "D7 retention real + W+1 retrospective", owner: "PM + QA", severity: "warning" },
  { offset: 21, title: "W+3 review", action: "Akasha IA quality report + curadoria refresh", owner: "Coder + PM", severity: "warning" },
  { offset: 28, title: "W+4 review", action: "Pre-D+30 strategic prep + risk register audit", owner: "PM + Founder", severity: "warning" },
  { offset: 30, title: "D+30 strategic review", action: "OKR Wave 5 go/no-go + public monthly report", owner: "Founder + PM", severity: "critical" },
];

const WEEKLY_TRIGGERS: RollbackTrigger[] = [
  {
    id: "RT-W1",
    description: "D7 retention < 25% sustained 14d",
    threshold: "retention-d7 < 25 sustained 14d",
    automated: false,
  },
  {
    id: "RT-W2",
    description: "NPS < 30 sustained 14d",
    threshold: "engagement-nps < 30 sustained 14d",
    automated: false,
  },
  {
    id: "RT-W3",
    description: "Churn > 10%/week sustained 2 weeks (W32-8 §4.1 A5)",
    threshold: "weekly_churn > 0.10 sustained 2w",
    automated: false,
  },
];

const WEEKLY_PLAN: CadencePlan = {
  cadence: "weekly",
  startDayOffset: 8,
  endDayOffset: 30,
  description:
    "W+2..W+4 + D+30 final. Triggers RT-W requerem decisão macro (iterate Wave 5 ou kill).",
  checkpoints: WEEKLY_CHECKPOINTS,
  rollbackTriggers: WEEKLY_TRIGGERS,
  owner: "Founder + PM",
  autoRollbackEnabled: false,
};

// ============================================================================
// Aggregated playbook
// ============================================================================

export const POST_LAUNCH_PLAYBOOK: ReadonlyArray<CadencePlan> = Object.freeze([
  HOURLY_PLAN,
  DAILY_PLAN,
  WEEKLY_PLAN,
]);

export const ALL_CHECKPOINTS: ReadonlyArray<{ plan: CadencePlan; checkpoint: Checkpoint }> =
  Object.freeze(
    POST_LAUNCH_PLAYBOOK.flatMap((plan) =>
      plan.checkpoints.map((checkpoint) => ({ plan, checkpoint })),
    ),
  );

export const ALL_TRIGGERS: ReadonlyArray<{ plan: CadencePlan; trigger: RollbackTrigger }> =
  Object.freeze(
    POST_LAUNCH_PLAYBOOK.flatMap((plan) =>
      plan.rollbackTriggers.map((trigger) => ({ plan, trigger })),
    ),
  );

// ============================================================================
// Rollback plan (executável)
// ============================================================================

export interface RollbackStep {
  order: number;
  title: string;
  action: string;
  owner: string;
  /** Time to complete (ISO 8601 duration-like, just minutes). */
  estimatedMinutes: number;
}

export const ROLLBACK_PLAN: ReadonlyArray<RollbackStep> = Object.freeze([
  {
    order: 1,
    title: "Snapshot estado pré-rollback",
    action:
      "Capturar snapshot completo do estado (PostHog + Sentry + Stripe + Supabase) antes de qualquer mudança.",
    owner: "Coder on-call",
    estimatedMinutes: 10,
  },
  {
    order: 2,
    title: "Disable Wave 4 invites",
    action:
      "Setar feature flag `wave_4_invites_enabled = false` (instantâneo). Waitlist continua aceitando.",
    owner: "Coder on-call",
    estimatedMinutes: 5,
  },
  {
    order: 3,
    title: "Status page amber + incident open",
    action:
      "Publicar post-mortem interim em < 60min. Status page em 'investigating'.",
    owner: "PM",
    estimatedMinutes: 15,
  },
  {
    order: 4,
    title: "Email transparente para users ativos",
    action:
      "Enviar email em < 60min para todos Wave 4 ativos explicando situação + ETA.",
    owner: "PM",
    estimatedMinutes: 30,
  },
  {
    order: 5,
    title: "Post-mortem completo",
    action:
      "PM + Coder + QA compilam root cause analysis em < 48h. Documento público.",
    owner: "PM + Coder",
    estimatedMinutes: 240,
  },
  {
    order: 6,
    title: "Decisão re-launch ou kill",
    action:
      "Founder + Owner decide Wave 4b re-launch (iterando) ou kill switch (arquivar projeto).",
    owner: "Founder",
    estimatedMinutes: 90,
  },
]);

export const TOTAL_ROLLBACK_MINUTES: number = ROLLBACK_PLAN.reduce(
  (sum, step) => sum + step.estimatedMinutes,
  0,
);

// ============================================================================
// Helpers
// ============================================================================

export function criticalCheckpoints(): ReadonlyArray<{ plan: CadencePlan; checkpoint: Checkpoint }> {
  return ALL_CHECKPOINTS.filter((c) => c.checkpoint.severity === "critical");
}

export function countCheckpoints(cadence: Cadence): number {
  return POST_LAUNCH_PLAYBOOK.find((p) => p.cadence === cadence)?.checkpoints.length ?? 0;
}

export function countTriggers(): number {
  return ALL_TRIGGERS.length;
}

// ============================================================================
// Zod schemas
// ============================================================================

export const CheckpointSchema = z.object({
  offset: z.number().int(),
  title: z.string(),
  action: z.string(),
  owner: z.string(),
  severity: z.enum(["informational", "warning", "critical"]),
});

export const RollbackTriggerSchema = z.object({
  id: z.string(),
  description: z.string(),
  threshold: z.string(),
  automated: z.boolean(),
});

export const CadencePlanSchema = z.object({
  cadence: z.enum(["hourly", "daily", "weekly"]),
  startDayOffset: z.number().int().min(0),
  endDayOffset: z.number().int().min(0),
  description: z.string(),
  checkpoints: z.array(CheckpointSchema),
  rollbackTriggers: z.array(RollbackTriggerSchema),
  owner: z.string(),
  autoRollbackEnabled: z.boolean(),
});
