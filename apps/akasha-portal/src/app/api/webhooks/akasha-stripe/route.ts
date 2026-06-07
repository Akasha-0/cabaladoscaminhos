import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripeAkasha, addCredits } from '@/lib/akasha/stripe-akasha';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_AKASHA_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 });
  }
  if (!webhookSecret) {
    console.error('STRIPE_AKASHA_WEBHOOK_SECRET não definida');
    return NextResponse.json({ error: 'Webhook não configurado' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeAkasha();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Assinatura Stripe inválida:', (err as Error).message);
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    console.error('Erro ao processar evento Stripe:', (err as Error).message);
    // Return 200 to avoid Stripe retries for application errors
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.akashaUserId;
  if (!userId) return;

  const productType = session.metadata?.productType ?? '';
  const creditsGranted = parseInt(session.metadata?.creditsGranted ?? '0', 10);

  if (session.mode === 'subscription' && session.subscription) {
    const stripe = getStripeAkasha();
    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
    const periodEnd = sub.items.data[0]?.current_period_end;

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        plan: 'AKASHA_PRO',
        status: 'ACTIVE',
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
      update: {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        plan: 'AKASHA_PRO',
        status: 'ACTIVE',
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });

    // Grant initial monthly credits
    if (creditsGranted > 0) {
      await addCredits(userId, creditsGranted, 'pro_initial_credits');
    }
  } else if (session.mode === 'payment') {
    if (productType === 'manifesto') {
      const existing = await prisma.user.findUnique({
        where: { id: userId },
        select: { intentionProfile: true },
      });
      const prev = (existing?.intentionProfile as Record<string, unknown> | null) ?? {};

      await prisma.user.update({
        where: { id: userId },
        data: {
          intentionProfile: {
            ...prev,
            manifestoPurchased: true,
            manifestoPurchasedAt: new Date().toISOString(),
          },
        },
      });
    }
    // Grant credits for any credit pack purchase
    if (creditsGranted > 0) {
      await addCredits(userId, creditsGranted, `purchase_${productType}`);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const sub = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!sub) return;

  const periodEnd = subscription.items.data[0]?.current_period_end;
  const statusMap: Record<string, 'ACTIVE' | 'PAST_DUE' | 'CANCELED'> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'PAST_DUE',
    incomplete_expired: 'CANCELED',
  };
  const newStatus = statusMap[subscription.status] ?? 'ACTIVE';

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: newStatus,
      plan: newStatus === 'CANCELED' ? 'FREEMIUM' : 'AKASHA_PRO',
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const sub = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!sub) return;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: 'CANCELED', plan: 'FREEMIUM' },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Add monthly credits on subscription renewal (not the initial checkout — that's handled above)
  const hasSubscription =
    (invoice as { subscription?: unknown }).subscription ??
    (invoice as { parent?: { subscription_details?: unknown } }).parent?.subscription_details;
  if (!hasSubscription || invoice.billing_reason !== 'subscription_cycle') return;

  const customerId = invoice.customer as string;
  const sub = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId, plan: 'AKASHA_PRO' },
  });
  if (!sub) return;

  await addCredits(sub.userId, 30, 'pro_monthly_renewal');
}
