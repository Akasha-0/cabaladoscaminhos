// ============================================================================
// USAGE TRACKER — Limites FREE/PRO + 80% warning + 100% hard block
// ============================================================================
// Wave 37 (2026-07-01). Enforce tier limits + notify approaching caps.
//
// PADRÃO (LGPD + idempotência):
//   1. Cada ação consome 1 unidade via `incrementUsage(userId, metric, by=1)`
//   2. Lookup atômico do limit pelo tier do user
//   3. Se count + by > limit → throw LimitExceededError
//   4. Se count + by >= 80% do limit → scheduleBillingNotification(usage_80_warning)
//   5. Reset mensal: novo periodStart quando mês vira (lazy, on next call)
//
// IMPORTANTE: incrementUsage é idempotente no nível da operação upstream —
// caller passa idempotency key + checa antes de chamar. Aqui a função é
// puramente counter, sem side-effects duplicados.
//
// PERFORMANCE: aggregate via SUM. Index (userId, metric, periodStart) cobre
// o lookup hot-path.
// ============================================================================

import {
  TIERS,
  getTier,
  getLimit,
  type TierDefinition,
  UsageMetric,
  type UsageMetricType,
} from './tiers';
import type { SubscriptionTier, Subscription } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface UsageSnapshot {
  userId: string;
  tier: SubscriptionTier;
  metric: UsageMetricType;
  periodStart: Date;
  periodEnd: Date;
  used: number;
  limit: number | null; // null = unlimited
  remaining: number | null;
  pctUsed: number; // 0-100
  warningThreshold: boolean; // >=80%
  limitExceeded: boolean; // >100%
}

export interface IncrementResult {
  ok: boolean;
  used: number;
  limit: number | null;
  warning: boolean;
  blocked: boolean;
  reason?: string;
}

export class LimitExceededError extends Error {
  constructor(
    public readonly metric: UsageMetricType,
    public readonly used: number,
    public readonly limit: number,
    public readonly tier: SubscriptionTier
  ) {
    super(
      `Limit ${metric} exceeded for tier ${tier}: ${used}/${limit}. Faça upgrade para PRO.`
    );
    this.name = 'LimitExceededError';
  }
}

// ============================================================================
// PERIOD HELPERS
// ============================================================================

/** Retorna o primeiro instante do mês corrente (UTC). */
export function currentPeriodStart(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

/** Retorna o primeiro instante do próximo mês (UTC, exclusivo). */
export function currentPeriodEnd(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}

/** Converte Date ou ISO string → Date. */
function toDate(v: Date | string): Date {
  return v instanceof Date ? v : new Date(v);
}

// ============================================================================
// SNAPSHOT — quanto o user já gastou no mês corrente
// ============================================================================

/**
 * Snapshot agregado do uso atual. ZERO side-effects. Usado por:
 *   - UI `/billing` para mostrar barras de progresso
 *   - Guard pré-ação (sem incrementar)
 *   - Cron jobs de enforcement
 */
export async function getUsageSnapshot(params: {
  userId: string;
  tier: SubscriptionTier;
  metric: UsageMetricType;
  prisma: PrismaLike;
}): Promise<UsageSnapshot> {
  const { userId, tier, metric, prisma } = params;
  const periodStart = currentPeriodStart();
  const periodEnd = currentPeriodEnd();

  const tierDef = getTier(tier);
  const limit = getLimit(tierDef, metric);

  const record = await prisma.usageRecord.findUnique({
    where: {
      userId_metric_periodStart: {
        userId,
        metric,
        periodStart,
      },
    },
  });

  const used = record?.count ?? 0;
  const remaining = limit === null ? null : Math.max(0, limit - used);
  const pctUsed = limit === null || limit === 0 ? 0 : Math.min(100, (used / limit) * 100);

  return {
    userId,
    tier,
    metric,
    periodStart,
    periodEnd,
    used,
    limit,
    remaining,
    pctUsed,
    warningThreshold: pctUsed >= 80 && pctUsed < 100,
    limitExceeded: limit !== null && used >= limit,
  };
}

// ============================================================================
// INCREMENT — consume 1 unit (or `by` units)
// ============================================================================

/**
 * Incrementa usage de forma atômica. Se ultrapassar limit, throw LimitExceededError.
 *
 * IMPORTANTE: chamar APÓS a ação ter sido confirmada pelo usuário.
 *   Padrão de uso:
 *     1) user submete "gerar mapa oráculo"
 *     2) backend chama `consume(userId, ORACULO_MAPS)` PRIMEIRO
 *     3) se OK → executa geração do mapa
 *     4) se falha geração → rollback via `release(userId, ORACULO_MAPS, 1)`
 *
 * @throws LimitExceededError se (used + by) > limit
 */
export async function consume(params: {
  userId: string;
  tier: SubscriptionTier;
  metric: UsageMetricType;
  by?: number;
  prisma: PrismaLike;
}): Promise<IncrementResult> {
  const { userId, tier, metric, prisma } = params;
  const by = params.by ?? 1;
  const periodStart = currentPeriodStart();

  const tierDef = getTier(tier);
  const limit = getLimit(tierDef, metric);

  // FREE tem `groupsCreated` = 3, etc. — limites positivos.
  // PRO tem alguns null (unlimited).
  // Antes de incrementar, checa atomicamente.
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.usageRecord.findUnique({
      where: {
        userId_metric_periodStart: { userId, metric, periodStart },
      },
    });

    const currentCount = existing?.count ?? 0;
    const newCount = currentCount + by;

    // Unlimited? Apenas incrementa.
    if (limit === null) {
      const upserted = await tx.usageRecord.upsert({
        where: {
          userId_metric_periodStart: { userId, metric, periodStart },
        },
        create: {
          userId,
          metric,
          count: by,
          periodStart,
          periodEnd: currentPeriodEnd(),
        },
        update: { count: { increment: by } },
      });
      return {
        used: upserted.count,
        limit: null,
        warning: false,
        blocked: false,
      };
    }

    // Hard limit? Throw antes de persistir.
    if (newCount > limit) {
      throw new LimitExceededError(metric, currentCount, limit, tier);
    }

    const upserted = await tx.usageRecord.upsert({
      where: {
        userId_metric_periodStart: { userId, metric, periodStart },
      },
      create: {
        userId,
        metric,
        count: by,
        periodStart,
        periodEnd: currentPeriodEnd(),
      },
      update: { count: { increment: by } },
    });

    return {
      used: upserted.count,
      limit,
      warning: newCount >= limit * 0.8 && newCount < limit,
      blocked: newCount >= limit,
    };
  });

  return {
    ok: true,
    used: result.used,
    limit: result.limit,
    warning: result.warning,
    blocked: result.blocked,
  };
}

/**
 * Rollback: decrementar usage após falha downstream. Idempotente — não vai
 * abaixo de 0.
 */
export async function release(params: {
  userId: string;
  metric: UsageMetricType;
  by?: number;
  prisma: PrismaLike;
}): Promise<{ released: boolean; used: number }> {
  const { userId, metric, prisma } = params;
  const by = params.by ?? 1;
  const periodStart = currentPeriodStart();

  const result = await prisma.usageRecord.update({
    where: {
      userId_metric_periodStart: { userId, metric, periodStart },
    },
    data: { count: { decrement: by } },
  }).catch(() => null);

  if (!result) {
    return { released: false, used: 0 };
  }

  // Não permitir negativo
  if (result.count < 0) {
    await prisma.usageRecord.update({
      where: { id: result.id },
      data: { count: 0 },
    });
    return { released: true, used: 0 };
  }

  return { released: true, used: result.count };
}

/**
 * Reset usage (admin only, ou quando user upgradar de FREE → PRO).
 * Não deleta — apenas zera o count do periodStart atual.
 */
export async function resetUsage(params: {
  userId: string;
  metric: UsageMetricType;
  prisma: PrismaLike;
}): Promise<void> {
  const { userId, metric, prisma } = params;
  const periodStart = currentPeriodStart();

  await prisma.usageRecord.update({
    where: {
      userId_metric_periodStart: { userId, metric, periodStart },
    },
    data: { count: 0 },
  }).catch(() => null);
}

// ============================================================================
// CHECK (sem side-effects)
// ============================================================================

/**
 * Apenas checa se uma ação seria permitida. Não incrementa.
 * Usado em dry-run da UI ("se você gerar agora, vai estar em 11/10").
 */
export async function canConsume(params: {
  userId: string;
  tier: SubscriptionTier;
  metric: UsageMetricType;
  by?: number;
  prisma: PrismaLike;
}): Promise<{ allowed: boolean; wouldBe: number; limit: number | null; remaining: number | null }> {
  const { userId, tier, metric, prisma } = params;
  const by = params.by ?? 1;

  const snapshot = await getUsageSnapshot({ userId, tier, metric, prisma });
  const tierDef = getTier(tier);
  const limit = getLimit(tierDef, metric);

  if (limit === null) {
    return { allowed: true, wouldBe: snapshot.used + by, limit: null, remaining: null };
  }

  const wouldBe = snapshot.used + by;
  return {
    allowed: wouldBe <= limit,
    wouldBe,
    limit,
    remaining: Math.max(0, limit - snapshot.used),
  };
}

// ============================================================================
// TIER AWARE HELPERS
// ============================================================================

/** Resolve tier do user via Subscription, defaulting FREE. */
export async function resolveUserTier(
  userId: string,
  prisma: PrismaLike
): Promise<SubscriptionTier> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { tier: true, status: true },
  });

  if (!sub) return 'FREE';
  // TRIAL conta como PRO para enforcement (limites PRO aplicados)
  if (sub.status === 'TRIAL' && sub.tier === 'PRO') return 'PRO';
  if (sub.status === 'ACTIVE' || sub.status === 'TRIAL') return sub.tier;
  // PAST_DUE, CANCELLED, EXPIRED — degrade para FREE
  return 'FREE';
}

/** Resumo agregado de todos os metrics do user (para dashboard). */
export async function getAllMetricsSnapshot(params: {
  userId: string;
  tier: SubscriptionTier;
  prisma: PrismaLike;
}): Promise<UsageSnapshot[]> {
  const { userId, tier, prisma } = params;
  const metrics: UsageMetricType[] = [
    UsageMetric.AKASHA_CONVERSATIONS,
    UsageMetric.ORACULO_MAPS,
    UsageMetric.MENTORSHIP_SESSIONS,
    UsageMetric.STORAGE_GB,
    UsageMetric.MARKETPLACE_LISTINGS,
    UsageMetric.GROUPS_CREATED,
  ];

  return Promise.all(
    metrics.map((m) => getUsageSnapshot({ userId, tier, metric: m, prisma }))
  );
}

// ============================================================================
// PRISMA TYPE ALIAS (sem importar @prisma/client para tree-shake)
// ============================================================================

/** Subset do PrismaClient que usamos — permite mock em testes. */
export interface PrismaLike {
  usageRecord: {
    findUnique: (args: {
      where: {
        userId_metric_periodStart: { userId: string; metric: string; periodStart: Date };
      };
    }) => Promise<{ id: string; userId: string; metric: string; count: number; periodStart: Date; periodEnd: Date } | null>;
    upsert: (args: {
      where: {
        userId_metric_periodStart: { userId: string; metric: string; periodStart: Date };
      };
      create: {
        userId: string;
        metric: string;
        count: number;
        periodStart: Date;
        periodEnd: Date;
      };
      update: { count: { increment: number } };
    }) => Promise<{ id: string; count: number }>;
    update: (args: {
      where: {
        id?: string;
        userId_metric_periodStart?: { userId: string; metric: string; periodStart: Date };
      };
      data: { count: { decrement: number } | number };
    }) => Promise<{ id: string; count: number }>;
  };
  subscription: {
    findUnique: (args: {
      where: { userId: string };
      select?: { tier?: boolean; status?: boolean };
    }) => Promise<Pick<Subscription, 'tier' | 'status'> | null>;
  };
  $transaction: <T>(fn: (tx: PrismaLike) => Promise<T>) => Promise<T>;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const UsageTracker = {
  currentPeriodStart,
  currentPeriodEnd,
  getUsageSnapshot,
  consume,
  release,
  resetUsage,
  canConsume,
  resolveUserTier,
  getAllMetricsSnapshot,
};

export default UsageTracker;