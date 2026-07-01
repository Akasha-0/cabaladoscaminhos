// ============================================================================
// POST /api/billing/cancel — Cancelar subscription (cancel at period end)
// ============================================================================
// Wave 37 (2026-07-01).
//
// IMPORTANTE: NÃO cancela imediatamente. Marca cancel_at_period_end=true,
// user mantém acesso até final do período pago. Refund policy = nenhum
// refund (assinatura já foi paga pelo período).
//
// LGPD: logamos cancelReason para analytics de churn (Art. 37 — operações).
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode } from '@/lib/community/api';
import { updateSubscription } from '@/lib/billing/stripe-subscriptions';
import { scheduleBillingNotification } from '@/lib/billing/subscription-service';
import { getBillingPrisma } from '@/lib/billing/prisma-adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CancelBody {
  reason?: 'too_expensive' | 'not_using' | 'missing_features' | 'other';
  feedback?: string;
  /** Se true, cancel imediato (não recomendado para B2C). */
  immediate?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    const body = (await request.json().catch(() => ({}))) as CancelBody;
    const prisma = getBillingPrisma();

    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    if (!subscription?.stripeSubscriptionId) {
      return fail(
        400,
        ErrorCode.BAD_REQUEST,
        'Sem subscription ativa para cancelar'
      );
    }

    if (subscription.status === 'CANCELLED' || subscription.status === 'EXPIRED') {
      return fail(409, ErrorCode.CONFLICT, 'Subscription já está cancelada/expirada');
    }

    if (body.immediate === true) {
      // Immediate cancel (sem reembolso). Reserved para casos extremos.
      const updated = await updateSubscription({
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        cancelAtPeriodEnd: false,
        metadata: {
          ...subscription.stripeSubscriptionId ? {} : {},
          cancelReason: body.reason ?? 'user_request',
          cancelledAt: new Date().toISOString(),
        },
      });
      await prisma.subscription.update({
        where: { userId },
        data: {
          status: 'CANCELLED',
          cancelAtPeriodEnd: false,
          cancelledAt: new Date(),
          cancelReason: body.reason ?? 'user_request',
        },
      });
      await scheduleBillingNotification({
        userId,
        type: 'subscription_cancelled',
        channel: 'email',
        metadata: { immediate: true, reason: body.reason, feedback: body.feedback },
        prisma,
      });
      return ok({ cancelled: true, immediate: true, subscription: { status: updated.status } });
    }

    // Default: cancel at period end
    const updated = await updateSubscription({
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      cancelAtPeriodEnd: true,
    });

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
      metadata: {
        atPeriodEnd: true,
        reason: body.reason,
        feedback: body.feedback,
        currentPeriodEnd: updated.currentPeriodEnd,
      },
      prisma,
    });

    return ok({
      cancelled: true,
      immediate: false,
      accessUntil: new Date(updated.currentPeriodEnd * 1000).toISOString(),
      subscription: {
        status: updated.status,
        cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
      },
    });
  } catch (err) {
    console.error('[billing/cancel] erro:', (err as Error).message);
    return fail(500, ErrorCode.INTERNAL_ERROR, 'Erro cancelando subscription');
  }
}