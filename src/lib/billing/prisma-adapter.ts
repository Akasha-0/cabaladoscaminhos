// ============================================================================
// BILLING PRISMA ADAPTER — Lazy loader para Prisma com PrismaLike interface
// ============================================================================
// Wave 37 (2026-07-01).
//
// PROPÓSITO:
//   - Webhook handlers precisam de Prisma, mas lazy-load para não abrir
//     conexão DB se o webhook for evento irrelevante
//   - Expor subset PrismaLike (subscription, billingNotification, usageRecord)
//     que bater com subscription-service.ts
//
// NOTA: o Prisma real tem muito mais métodos. Aqui só declaramos o subset
// usado pelo billing layer. Type-safety total exigiria generated types,
// mas quebraria em sandbox onde `prisma generate` falha (CORS).
// ============================================================================

import type { PrismaLike as SubscriptionPrismaLike } from './subscription-service';
import type { PrismaLike as UsagePrismaLike } from './usage-tracker';

export type BillingPrisma = SubscriptionPrismaLike & UsagePrismaLike;

let cached: BillingPrisma | null = null;

function getRawPrisma(): unknown {
  // Lazy import to avoid module-load cost when billing not active
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@/lib/prisma');
  return mod.prisma;
}

/**
 * Returns a PrismaLike adapter for billing operations. Memoized.
 *
 * IMPORTANT: this casts the real Prisma client to our structural type.
 * For production, regenerate types via `prisma generate` after schema
 * changes and use the real Subscription/UsageRecord/BillingNotification
 * models from @prisma/client.
 */
export function getBillingPrisma(): BillingPrisma {
  if (cached) return cached;

  const raw = getRawPrisma() as BillingPrisma;

  cached = raw;
  return cached;
}

/** Reset cache (test only). */
export function __resetBillingPrismaCache(): void {
  cached = null;
}

export const BillingPrisma = {
  get: getBillingPrisma,
  reset: __resetBillingPrismaCache,
};

export default BillingPrisma;