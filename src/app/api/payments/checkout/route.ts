// ============================================================================
// POST /api/payments/checkout — Criar Stripe Checkout Session para Pro
// ============================================================================
// Wave 37 (2026-07-01). Inicia fluxo de upgrade.
//
// INPUT:
//   { billingCycle: 'monthly' | 'annual' }
//
// OUTPUT:
//   { url: string, sessionId: string, customerId: string }
//
// AUTH:
//   - Requer usuário logado (session.userId)
//   - LGPD: passamos email + nome para Stripe (já temos consent do signup)
//
// FLUXO:
//   1) Auth → resolve userId
//   2) Resolve email + nome via profile (ou metadata signup)
//   3) Cria Subscription (status=TRIAL) placeholder
//   4) Cria Stripe Checkout Session com trial_period_days=14
//   5) Retorna url para redirect
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode } from '@/lib/community/api';
import { createCheckoutSession } from '@/lib/billing/stripe-subscriptions';
import { upsertSubscriptionFromStripe } from '@/lib/billing/subscription-service';
import { getBillingPrisma } from '@/lib/billing/prisma-adapter';
import type { BillingCycle } from '@/lib/billing/tiers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CheckoutBody {
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
    // 1. Auth stub (em produção, validar session cookie / JWT)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    const body = (await request.json().catch(() => ({}))) as CheckoutBody;
    const billingCycle: BillingCycle = body.billingCycle === 'annual' ? 'ANNUAL' : 'MONTHLY';
    const trialDays = typeof body.trialDays === 'number' ? body.trialDays : 14;

    // 2. Resolve email + name (stub: em produção, fetch do profile)
    const email = request.headers.get('x-user-email') ?? `${userId}@akasha.app`;
    const name = request.headers.get('x-user-name') ?? undefined;

    // 3. URLs
    const origin = getOrigin(request);
    const successUrl = `${origin}/billing?upgrade=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/billing/upgrade?cancelled=true`;

    // 4. Cria checkout session
    const session = await createCheckoutSession({
      userId,
      email,
      name,
      billingCycle,
      trialDays,
      successUrl,
      cancelUrl,
    });

    // 5. Se Stripe Checkout retorna subscription ID, criar placeholder DB
    //    (webhook customer.subscription.created vai popular fields completos)
    //    Aqui só salvamos que o user iniciou checkout — idempotente.
    const prisma = getBillingPrisma();
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier: 'PRO',
        status: 'TRIAL',
        billingCycle,
        stripeCustomerId: session.customerId,
        stripeSubscriptionId: null, // webhook vai popular
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
      // Não bloqueia checkout se DB falhar — webhook vai reconciliar
      console.warn('[checkout] DB upsert falhou (continuando):', err);
    });

    return ok({
      url: session.url,
      sessionId: session.id,
      customerId: session.customerId,
      billingCycle,
      trialDays,
      livemode: session.livemode,
    });
  } catch (err) {
    const message = (err as Error).message ?? 'Erro criando checkout session';
    const status = (err as { httpStatus?: number }).httpStatus ?? 500;
    console.error('[checkout] erro:', message);
    return fail(status, status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST, message);
  }
}