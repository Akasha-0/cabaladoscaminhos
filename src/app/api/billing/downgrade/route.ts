// ============================================================================
// POST /api/billing/downgrade — Downgrade PRO → FREE
// ============================================================================
// Wave 37 (2026-07-01).
//
// Em SaaS B2C, "downgrade" significa cancelar subscription (a próxima
// renovação não acontece). Aqui oferecemos 2 caminhos:
//   1) Soft downgrade: cancel_at_period_end=true (default)
//   2) Hard downgrade: cancel imediato + refund pro-rata (manual)
//
// Para MVP, só soft. Hard requer intervention do time.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode } from '@/lib/community/api';
import { updateSubscription } from '@/lib/billing/stripe-subscriptions';
import { scheduleBillingNotification } from '@/lib/billing/subscription-service';
import { getBillingPrisma } from '@/lib/billing/prisma-adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface DowngradeBody {
  reason?: string;
  feedback?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    const body = (await request.json().catch(() => ({}))) as DowngradeBody;
    const prisma = getBillingPrisma();
    const subscription = await prisma.subscription.findUnique({ where: { userId } });

    if (!subscription) {
      return fail(404, ErrorCode.NOT_FOUND, 'Subscription não encontrada');
    }

    if (subscription.tier === 'FREE') {
      return fail(409, ErrorCode.CONFLICT, 'Já está no plano Free');
    }

    // Marca cancel_at_period_end
    if (subscription.stripeSubscriptionId) {
      await updateSubscription({
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        cancelAtPeriodEnd: true,
        metadata: {
          downgradeReason: body.reason ?? 'user_request',
        },
      }).catch((err) => {
        console.warn('[downgrade] Stripe update falhou:', err);
      });
    }

    await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
        cancelReason: body.reason ?? 'user_request',
      },
    });

    await scheduleBillingNotification({
      userId,
      type: 'subscription_cancelled',
      channel: 'email',
      metadata: { reason: body.reason, feedback: body.feedback, downgrade: true },
      prisma,
    });

    return ok({
      downgraded: true,
      effectiveAt: subscription.currentPeriodEnd,
      message: 'Você voltará ao plano Free ao final do período pago.',
    });
  } catch (err) {
    console.error('[billing/downgrade] erro:', (err as Error).message);
    return fail(500, ErrorCode.INTERNAL_ERROR, 'Erro no downgrade');
  }
}