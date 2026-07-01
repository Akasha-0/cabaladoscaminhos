// ============================================================================
// lib/support/sla — SLA tracking + breach detection (Wave 37)
// ============================================================================
// Define tempos de primeira resposta e resolução por Plan + Priority.
//
// Tabela:
//   Plan    | Priority | First Response | Resolution
//   --------|----------|----------------|------------
//   PRO     | URGENT   | 4h             | 24h
//   PRO     | HIGH     | 8h             | 48h
//   PRO     | MEDIUM   | 24h            | 72h
//   PRO     | LOW      | 48h            | 120h
//   FREE    | URGENT   | 8h             | 48h
//   FREE    | HIGH     | 24h            | 72h
//   FREE    | MEDIUM   | 48h            | 120h
//   FREE    | LOW      | 72h            | 168h (7 dias)
//
// Status: `atRisk` quando faltam <20% do tempo total. `breached` quando
// ultrapassa o limite sem `firstResponseAt` ou `resolvedAt`.
//
// LGPD Art. 7 + 18: SLA reports NÃO incluem PII — só agregados.
// ============================================================================

import type { Plan, TicketPriority, SlaPolicy, SlaStatus } from './types';

// ============================================================================
// Policy table
// ============================================================================
const SLA_POLICIES: Record<Plan, Record<TicketPriority, SlaPolicy>> = {
  PRO: {
    URGENT: { firstResponseHours: 4, resolutionHours: 24 },
    HIGH: { firstResponseHours: 8, resolutionHours: 48 },
    MEDIUM: { firstResponseHours: 24, resolutionHours: 72 },
    LOW: { firstResponseHours: 48, resolutionHours: 120 },
  },
  FREE: {
    URGENT: { firstResponseHours: 8, resolutionHours: 48 },
    HIGH: { firstResponseHours: 24, resolutionHours: 72 },
    MEDIUM: { firstResponseHours: 48, resolutionHours: 120 },
    LOW: { firstResponseHours: 72, resolutionHours: 168 },
  },
};

export function getSlaPolicy(plan: Plan, priority: TicketPriority): SlaPolicy {
  return SLA_POLICIES[plan][priority];
}

// ============================================================================
// Compute SLA status given a ticket state
// ============================================================================
export interface SlaContext {
  plan: Plan;
  priority: TicketPriority;
  createdAt: Date;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  status: string; // TicketStatus
  now?: Date; // injectable for tests
}

export function computeSlaStatus(ctx: SlaContext): SlaStatus {
  const now = ctx.now ?? new Date();
  const policy = getSlaPolicy(ctx.plan, ctx.priority);

  const createdAtMs = ctx.createdAt.getTime();
  const nowMs = now.getTime();
  const resolutionDueAt = new Date(createdAtMs + policy.resolutionHours * 3600 * 1000);
  const firstResponseDueAt = ctx.firstResponseAt
    ? null
    : new Date(createdAtMs + policy.firstResponseHours * 3600 * 1000);

  // Breach logic
  const resolutionBreached = !ctx.resolvedAt && nowMs > resolutionDueAt.getTime();
  const firstResponseDueAtMs = firstResponseDueAt?.getTime() ?? 0;
  const firstResponseBreached = !ctx.firstResponseAt && nowMs > firstResponseDueAtMs;
  const breached = resolutionBreached || firstResponseBreached;

  // At-risk: dentro de 20% do tempo total restante
  const totalMs = policy.resolutionHours * 3600 * 1000;
  const elapsedMs = nowMs - createdAtMs;
  const remainingMs = totalMs - elapsedMs;
  const atRisk = !ctx.resolvedAt && remainingMs < totalMs * 0.2 && remainingMs > 0;

  const hoursRemaining = Math.max(0, Math.round(remainingMs / 3600000));

  return {
    firstResponseDueAt,
    resolutionDueAt,
    breached,
    atRisk,
    hoursRemaining,
  };
}

// ============================================================================
// Detect "at risk" — used by cron to fire email alerts
// ============================================================================
export interface SlaAlert {
  ticketId: string;
  alertType: 'AT_RICK_FIRST_RESPONSE' | 'AT_RISK_RESOLUTION' | 'BREACHED_FIRST_RESPONSE' | 'BREACHED_RESOLUTION';
  hoursRemaining: number;
  plan: Plan;
  priority: TicketPriority;
}

export function detectSlaAlerts(ctx: SlaContext & { ticketId: string }): SlaAlert[] {
  const alerts: SlaAlert[] = [];
  const status = computeSlaStatus(ctx);
  const policy = getSlaPolicy(ctx.plan, ctx.priority);
  const nowRef = ctx.now ?? new Date();
  const nowMsRef = nowRef.getTime();

  if (!ctx.firstResponseAt) {
    const firstDueMs = ctx.createdAt.getTime() + policy.firstResponseHours * 3600 * 1000;
    const firstRemainingMs = firstDueMs - nowMsRef;
    if (firstRemainingMs < 0) {
      alerts.push({
        ticketId: ctx.ticketId,
        alertType: 'BREACHED_FIRST_RESPONSE',
        hoursRemaining: 0,
        plan: ctx.plan,
        priority: ctx.priority,
      });
    } else if (firstRemainingMs < policy.firstResponseHours * 3600 * 1000 * 0.2) {
      alerts.push({
        ticketId: ctx.ticketId,
        alertType: 'AT_RICK_FIRST_RESPONSE',
        hoursRemaining: Math.round(firstRemainingMs / 3600000),
        plan: ctx.plan,
        priority: ctx.priority,
      });
    }
  }

  if (!ctx.resolvedAt && status.atRisk) {
    alerts.push({
      ticketId: ctx.ticketId,
      alertType: 'AT_RISK_RESOLUTION',
      hoursRemaining: status.hoursRemaining,
      plan: ctx.plan,
      priority: ctx.priority,
    });
  } else if (!ctx.resolvedAt && status.breached) {
    alerts.push({
      ticketId: ctx.ticketId,
      alertType: 'BREACHED_RESOLUTION',
      hoursRemaining: 0,
      plan: ctx.plan,
      priority: ctx.priority,
    });
  }

  return alerts;
}

// ============================================================================
// Aggregate SLA report — sem PII, só contadores (LGPD Art. 7)
// ============================================================================
export interface SlaReport {
  totalTickets: number;
  breached: number;
  atRisk: number;
  resolvedInSla: number;
  avgFirstResponseHours: number | null;
  avgResolutionHours: number | null;
  byPriority: Record<TicketPriority, { total: number; breached: number; avgResolutionHours: number | null }>;
}

export interface SlaTicketSample {
  priority: TicketPriority;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  breached: boolean;
}

export function buildSlaReport(tickets: SlaTicketSample[]): SlaReport {
  const byPriority: Record<TicketPriority, { total: number; breached: number; avgResolutionHours: number | null }> = {
    URGENT: { total: 0, breached: 0, avgResolutionHours: null },
    HIGH: { total: 0, breached: 0, avgResolutionHours: null },
    MEDIUM: { total: 0, breached: 0, avgResolutionHours: null },
    LOW: { total: 0, breached: 0, avgResolutionHours: null },
  };

  let totalFirst = 0;
  let totalFirstCount = 0;
  let totalRes = 0;
  let totalResCount = 0;
  let breached = 0;
  let atRisk = 0;
  let resolvedInSla = 0;

  const resByPriority: Record<TicketPriority, number[]> = {
    URGENT: [],
    HIGH: [],
    MEDIUM: [],
    LOW: [],
  };

  for (const t of tickets) {
    byPriority[t.priority].total += 1;
    if (t.breached) breached += 1;
    if (t.firstResponseAt) {
      totalFirst += (t.firstResponseAt.getTime() - t.createdAt.getTime()) / 3600000;
      totalFirstCount += 1;
    }
    if (t.resolvedAt) {
      const hrs = (t.resolvedAt.getTime() - t.createdAt.getTime()) / 3600000;
      totalRes += hrs;
      totalResCount += 1;
      resByPriority[t.priority].push(hrs);
      if (!t.breached) resolvedInSla += 1;
    }
  }

  for (const p of ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as TicketPriority[]) {
    const arr = resByPriority[p];
    byPriority[p].avgResolutionHours = arr.length === 0
      ? null
      : Math.round((arr.reduce((s, x) => s + x, 0) / arr.length) * 10) / 10;
    byPriority[p].breached = tickets.filter((t) => t.priority === p && t.breached).length;
  }

  return {
    totalTickets: tickets.length,
    breached,
    atRisk,
    resolvedInSla,
    avgFirstResponseHours: totalFirstCount === 0 ? null : Math.round((totalFirst / totalFirstCount) * 10) / 10,
    avgResolutionHours: totalResCount === 0 ? null : Math.round((totalRes / totalResCount) * 10) / 10,
    byPriority,
  };
}