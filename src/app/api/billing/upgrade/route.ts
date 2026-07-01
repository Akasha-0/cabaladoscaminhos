// ============================================================================
// POST /api/billing/upgrade — Upgrade FREE → PRO (redirect to checkout)
// ============================================================================
// Wave 37 (2026-07-01).
//
// Wrapper leve sobre /api/payments/checkout. Existe separado para:
//   - UX: usuário já logado pode chamar "upgrade" sem escolher billingCycle
//     (default = monthly)
//   - API stability: /payments/checkout pode mudar (price IDs, etc), mas
//     /billing/upgrade é o endpoint público estável
//
// INPUT: { billingCycle?: 'monthly' | 'annual' }
// OUTPUT: { url: string, sessionId: string }
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode } from '@/lib/community/api';
import { createCheckoutSession } from '@/lib/billing/stripe-subscriptions';
import { getBillingPrisma } from '@/lib/billing/prisma-adapter';
import type { BillingCycle } from '@/lib/billing/tiers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface UpgradeBody {
  billingCycle?: 'monthly' | 'annual';
  trialDays?: number;
}

function getOrigin(request: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/$/, '');
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    const body = (await request.json().catch(() => ({}))) as UpgradeBody;
    const billingCycle: BillingCycle = body.billingCycle === 'annual' ? 'ANNUAL' : 'MONTHLY';
    const trialDays = typeof body.trialDays === 'number' ? body.trialDays : 14;

    // Se já tem subscription PRO ativa, redirecionar para Portal
    const prisma = getBillingPrisma();
    const existing = await prisma.subscription.findUnique({ where: { userId } });
    if (existing && existing.tier === 'PRO' && (existing.status === 'ACTIVE' || existing.status === 'TRIAL')) {
      return fail(
        409,
        ErrorCode.CONFLICT,
        'Você já tem subscription PRO ativa. Use /api/payments/portal para gerenciar.'
      );
    }

    const email = request.headers.get('x-user-email') ?? `${userId}@akasha.app`;
    const name = request.headers.get('x-user-name') ?? undefined;

    const origin = getOrigin(request);
    const successUrl = `${origin}/billing?upgraded=true`;
    const cancelUrl = `${origin}/billing/upgrade?cancelled=true`;

    const session = await createCheckoutSession({
      userId,
      email,
      name,
      billingCycle,
      trialDays,
      successUrl,
      cancelUrl,
    });

    // Cria placeholder subscription (webhook vai popular)
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier: 'PRO',
        status: 'TRIAL',
        billingCycle,
        stripeCustomerId: session.customerId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
      },
      update: {
        status: 'TRIAL',
        billingCycle,
        stripeCustomerId: session.customerId,
        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      },
    }).catch((err) => {
      console.warn('[upgrade] DB upsert falhou:', err);
    });

    return ok({
      url: session.url,
      sessionId: session.id,
      customerId: session.customerId,
      billingCycle,
      trialDays,
    });
  } catch (err) {
    const message = (err as Error).message ?? 'Erro no upgrade';
    console.error('[billing/upgrade] erro:', message);
    return fail(500, ErrorCode.INTERNAL_ERROR, message);
  }
}