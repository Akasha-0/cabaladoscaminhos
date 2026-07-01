// ============================================================================
// GET /api/billing/subscription — Detalhes da subscription atual
// ============================================================================
// Wave 37 (2026-07-01). Estado atual: tier, status, period, trial.
//
// Se user tem stripeSubscriptionId, re-fetch do Stripe para dados frescos.
// Senão, retorna DB state (subscription criada localmente, sem Stripe).
//
// OUTPUT: {
//   tier, status, billingCycle, currentPeriodStart, currentPeriodEnd,
//   cancelAtPeriodEnd, trialEndsAt, hasStripeCustomer, stripeSubscriptionId,
//   trial: { inTrial, daysRemaining, willExpireSoon }
// }
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode } from '@/lib/community/api';
import { retrieveSubscription } from '@/lib/billing/stripe-subscriptions';
import { upsertSubscriptionFromStripe } from '@/lib/billing/subscription-service';
import { computeTrialState } from '@/lib/billing/trial';
import { getTier } from '@/lib/billing/tiers';
import { getBillingPrisma } from '@/lib/billing/prisma-adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    const prisma = getBillingPrisma();
    let subscription = await prisma.subscription.findUnique({ where: { userId } });

    // Se tem Stripe sub, refresh do Stripe (truth source)
    if (subscription?.stripeSubscriptionId) {
      try {
        const stripeDetails = await retrieveSubscription(subscription.stripeSubscriptionId);
        subscription = await upsertSubscriptionFromStripe({
          userId,
          details: stripeDetails,
          prisma,
        });
      } catch (err) {
        console.warn('[billing/subscription] Stripe retrieve falhou, usando DB:', (err as Error).message);
      }
    }

    if (!subscription) {
      // Sem subscription = FREE tier implícito
      const freeTier = getTier('FREE');
      return ok({
        tier: 'FREE',
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
        hasStripeCustomer: false,
        stripeSubscriptionId: null,
        trial: { inTrial: false, daysRemaining: 0, willExpireSoon: false, expired: false },
        tierName: freeTier.name,
        limits: freeTier.limits,
        highlights: freeTier.highlights,
      });
    }

    const tier = getTier(subscription.tier);
    const trialState = computeTrialState({
      trialEndsAt: subscription.trialEndsAt,
      status: subscription.status,
      reminderD3: subscription.trialReminderSentD3,
      reminderD1: subscription.trialReminderSentD1,
    });

    return ok({
      tier: subscription.tier,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      cancelledAt: subscription.cancelledAt,
      cancelReason: subscription.cancelReason,
      trialEndsAt: subscription.trialEndsAt,
      hasStripeCustomer: !!subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      trial: trialState,
      tierName: tier.name,
      tagline: tier.tagline,
      limits: tier.limits,
      highlights: tier.highlights,
      priceMonthly: tier.priceMonthly,
      priceAnnual: tier.priceAnnual,
    });
  } catch (err) {
    console.error('[billing/subscription] erro:', (err as Error).message);
    return fail(500, ErrorCode.INTERNAL_ERROR, 'Erro carregando subscription');
  }
}