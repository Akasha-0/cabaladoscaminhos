/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adicionarCreditos } from '@/lib/credits/service';
import { TipoTransacao } from '@prisma/client';

export const runtime = 'nodejs';

// In-memory subscription status store
const subscriptionStore = new Map<string, {
  userId: string;
  subscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  planoId: string | null;
  updatedAt: Date;
}>();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Mock signature validation for development
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET não definida - usando mock de validação');
  }

  // Mock validation: accept any request if no secret configured, or validate mock signature
  if (webhookSecret) {
    if (!signature) {
      return NextResponse.json(
        { erro: 'Assinatura do webhook não encontrada' },
        { status: 400 }
      );
    }
    
    // In production, use: stripe.webhooks.constructEvent(body, signature, webhookSecret)
    // For now, mock the validation by parsing JSON
    try {
      const eventData = JSON.parse(body);
      return await handleWebhookEvent(eventData);
    } catch {
      return NextResponse.json(
        { erro: 'Payload inválido' },
        { status: 400 }
      );
    }
  }

  try {
    const eventData = JSON.parse(body);
    return await handleWebhookEvent(eventData);
  } catch (err) {
    const error = err as Error;
    console.error('Erro ao processar webhook:', error.message);
    return NextResponse.json(
      { erro: `Erro interno: ${error.message}` },
      { status: 500 }
    );
  }
}

async function handleWebhookEvent(event: Stripe.Event) {
  const { type, data } = event;
  
  switch (type) {
    case 'checkout.session.completed': {
      const session = data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }
    default:
      console.log(`Webhook recibido: ${type}`);
  }

  return NextResponse.json({ recebido: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planoId = session.metadata?.planoId;
  const creditosStr = session.metadata?.creditos;

  if (!userId) {
    console.error('UserId não encontrado no metadata do checkout');
    return;
  }

  const quantidadeCreditos = creditosStr ? parseInt(creditosStr, 10) : 0;

  // Process credits top-up on successful payment
  if (quantidadeCreditos > 0) {
    try {
      await adicionarCreditos(
        userId,
        quantidadeCreditos,
        `Top-up via Stripe - Session ${session.id}`
      );
      console.log(`Créditos adicionados para usuário ${userId}: ${quantidadeCreditos}`);
    } catch (err) {
      console.error('Erro ao adicionar créditos:', err);
    }
  }

  // Store subscription status in memory and update in-memory store
  if (session.subscription) {
    const subscriptionId = session.subscription as string;
    
    subscriptionStore.set(subscriptionId, {
      userId,
      subscriptionId,
      status: 'active',
      planoId: planoId || null,
      updatedAt: new Date(),
    });
    
    console.log(`Assinatura ativa armazenada em memória: ${subscriptionId}`);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;
  const status = subscription.status as 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  
  const existingEntry = Array.from(subscriptionStore.values())
    .find(entry => entry.subscriptionId === subscriptionId);
    
  if (existingEntry) {
    subscriptionStore.set(subscriptionId, {
      ...existingEntry,
      status,
      updatedAt: new Date(),
    });
  } else {
    subscriptionStore.set(subscriptionId, {
      userId: customerId,
      subscriptionId,
      status,
      planoId: null,
      updatedAt: new Date(),
    });
  }

  console.log(`Assinatura atualizada: ${subscriptionId}, status: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  
  subscriptionStore.set(subscriptionId, {
    ...(subscriptionStore.get(subscriptionId) || {
      userId: subscription.customer as string,
      planoId: null,
    }),
    subscriptionId,
    status: 'canceled',
    updatedAt: new Date(),
  });

  console.log(`Assinatura cancelada: ${subscriptionId}`);
}

// Export for testing purposes
export function getSubscriptionStatus(subscriptionId: string) {
  return subscriptionStore.get(subscriptionId) || null;
}

export function getAllSubscriptions() {
  return Map.from(subscriptionStore);
}
