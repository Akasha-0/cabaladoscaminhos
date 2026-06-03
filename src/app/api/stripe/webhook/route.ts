// ============================================================
// STRIPE WEBHOOK HANDLER - Cabala Dos Caminhos
// ============================================================
// Handles Stripe subscription events:
// - checkout.session.completed → mark user as premium
// - customer.subscription.deleted → downgrade user
// - customer.subscription.updated → update subscription status
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

interface SubscriptionMetadata {
  userId?: string;
  plano?: string;
}

// Map Stripe price IDs to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_BASIC || '']: 'basico',
  [process.env.STRIPE_PRICE_PREMIUM || '']: 'premium',
  [process.env.STRIPE_PRICE_ENTERPRISE || '']: 'enterprise',
};

// Map plan names to module access
const PLAN_MODULES: Record<string, { moduloPlanetas: boolean; moduloLetras: boolean; moduloGeometria: boolean; moduloFrequencias: boolean; moduloEmpresa: boolean }> = {
  basico: { moduloPlanetas: true, moduloLetras: true, moduloGeometria: false, moduloFrequencias: false, moduloEmpresa: false },
  premium: { moduloPlanetas: true, moduloLetras: true, moduloGeometria: true, moduloFrequencias: true, moduloEmpresa: false },
  enterprise: { moduloPlanetas: true, moduloLetras: true, moduloGeometria: true, moduloFrequencias: true, moduloEmpresa: true },
};

/**
 * Handle checkout.session.completed event
 * Marks user as premium when checkout completes
 */
async function handleCheckoutCompleted(session: {
  customer?: string;
  customer_email?: string;
  metadata?: SubscriptionMetadata;
  subscription?: string;
}) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string | undefined;
  const subscriptionId = session.subscription as string | undefined;

  if (!userId) {
    console.error('[Stripe Webhook] No userId in checkout metadata');
    return;
  }

  // Get subscription details to determine plan
  let plano = session.metadata?.plano || 'basico';
  if (subscriptionId && stripe) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      if (priceId && PRICE_TO_PLAN[priceId]) {
        plano = PRICE_TO_PLAN[priceId];
      }
    } catch (error) {
      console.error('[Stripe Webhook] Error fetching subscription:', error);
    }
  }

  const modules = PLAN_MODULES[plano] || PLAN_MODULES.basico;

  // Calculate next billing date
  const dataProximoCobro = new Date();
  dataProximoCobro.setMonth(dataProximoCobro.getMonth() + 1);

  // Update or create assinatura
  await prisma.assinatura.upsert({
    where: { userId },
    create: {
      userId,
      plano,
      status: 'active',
      stripeCustomerId: customerId || null,
      stripeSubscriptionId: subscriptionId || null,
      dataProximoCobro,
      ...modules,
    },
    update: {
      plano,
      status: 'active',
      stripeCustomerId: customerId || null,
      stripeSubscriptionId: subscriptionId || null,
      dataProximoCobro,
      ...modules,
    },
  });

  // Update user's stripe fields
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId || undefined,
      stripeSubscriptionId: subscriptionId || undefined,
      planoAssinatura: plano,
    },
  });

  console.log(`[Stripe Webhook] User ${userId} activated with plan: ${plano}`);
}

/**
 * Handle customer.subscription.deleted event
 * Downgrades user when subscription is cancelled/deleted
 */
async function handleSubscriptionDeleted(subscription: {
  id: string;
  customer: string;
}) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer;

  // Find user by subscription ID
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId: subscriptionId },
        { stripeCustomerId: customerId },
      ],
    },
  });

  if (!user) {
    console.error('[Stripe Webhook] No user found for subscription:', subscriptionId);
    return;
  }

  // Downgrade assinatura
  await prisma.assinatura.update({
    where: { userId: user.id },
    data: {
      plano: 'iniciante',
      status: 'cancelled',
      stripeSubscriptionId: null,
      moduloPlanetas: false,
      moduloLetras: false,
      moduloGeometria: false,
      moduloFrequencias: false,
      moduloEmpresa: false,
    },
  });

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: null,
      planoAssinatura: 'iniciante',
    },
  });

  console.log(`[Stripe Webhook] User ${user.id} downgraded from subscription: ${subscriptionId}`);
}

/**
 * Handle customer.subscription.updated event
 * Updates subscription status when modified (e.g., plan change, payment issues)
 */
async function handleSubscriptionUpdated(subscription: {
  id: string;
  customer: string;
  status?: string;
  items?: { data: Array<{ price: { id: string } }> };
}) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer;
  const stripeStatus = subscription.status;

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'active',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
    incomplete: 'incomplete',
  };

  const status = statusMap[stripeStatus || ''] || 'active';

  // Determine plan from price ID
  let plano = 'basico';
  const priceId = subscription.items?.data[0]?.price.id;
  if (priceId && PRICE_TO_PLAN[priceId]) {
    plano = PRICE_TO_PLAN[priceId];
  }

  const modules = PLAN_MODULES[plano] || PLAN_MODULES.basico;

  // Calculate next billing date
  const dataProximoCobro = new Date();
  dataProximoCobro.setMonth(dataProximoCobro.getMonth() + 1);

  // Find user
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId: subscriptionId },
        { stripeCustomerId: customerId },
      ],
    },
  });

  if (!user) {
    console.error('[Stripe Webhook] No user found for subscription update:', subscriptionId);
    return;
  }

  // Update assinatura
  await prisma.assinatura.update({
    where: { userId: user.id },
    data: {
      plano,
      status,
      dataProximoCobro,
      ...modules,
    },
  });

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      planoAssinatura: plano,
    },
  });

  console.log(`[Stripe Webhook] User ${user.id} subscription updated: ${status}, plan: ${plano}`);
}

// POST /api/stripe/webhook - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  // Read raw body for signature verification (must be before JSON parsing)
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig || !WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] Missing signature or webhook secret');
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }
  if (!stripe) {
    console.error('[Stripe Webhook] Stripe client not initialized');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe Webhook] Signature verification failed:', errorMessage);
    return NextResponse.json({ error: `Invalid signature: ${errorMessage}` }, { status: 400 });
  }
  // Idempotency: skip if already processed
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });
  if (existingEvent) {
    console.log(`[Stripe Webhook] Event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, skipped: true });
  }
  // Route to handler, record as processed on success
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          customer?: string;
          customer_email?: string;
          metadata?: SubscriptionMetadata;
          subscription?: string;
        };
        await handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as {
          id: string;
          customer: string;
        };
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as {
          id: string;
          customer: string;
          status?: string;
          items?: { data: Array<{ price: { id: string } }> };
        };
        await handleSubscriptionUpdated(subscription);
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Stripe Webhook] Handler error for ${event.type}:`, errorMessage);
    // Return 500 so Stripe will retry — do NOT mark as processed
    return NextResponse.json({ error: `Handler failed: ${errorMessage}` }, { status: 500 });
  }
  // Mark event as processed (only after all handlers succeeded)
  try {
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
      },
    });
  } catch (err: unknown) {
    // If the record already exists (race condition), that's fine — idempotency holds
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    if (!err || !(err instanceof Error) || !err.message.includes('Unique constraint')) {
      console.error('[Stripe Webhook] Failed to record event:', errorMessage);
    }
  }
  return NextResponse.json({ received: true });
}