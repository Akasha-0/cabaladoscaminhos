import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const AKASHA_PRODUCTS = {
  manifesto: {
    key: 'manifesto',
    label: 'Manifesto Akáshico',
    priceEnv: 'STRIPE_PRICE_AKASHA_MANIFESTO',
    mode: 'payment' as const,
    unitAmountBRL: 2990,
    creditsGranted: 0,
    description: 'Relatório profundo dos 4 pilares + 30 dias de Dashboard Diário',
  },
  pro: {
    key: 'pro',
    label: 'Akasha Pro',
    priceEnv: 'STRIPE_PRICE_AKASHA_PRO',
    mode: 'subscription' as const,
    unitAmountBRL: 3990,
    creditsGranted: 30,
    description: 'Dashboard Diário + 30 créditos/mês para o Oráculo',
  },
  credits_10: {
    key: 'credits_10',
    label: 'Pacote 10 Créditos',
    priceEnv: 'STRIPE_PRICE_AKASHA_CREDITS_10',
    mode: 'payment' as const,
    unitAmountBRL: 990,
    creditsGranted: 10,
    description: '10 créditos para consultas oraculares',
  },
  credits_30: {
    key: 'credits_30',
    label: 'Pacote 30 Créditos',
    priceEnv: 'STRIPE_PRICE_AKASHA_CREDITS_30',
    mode: 'payment' as const,
    unitAmountBRL: 2490,
    creditsGranted: 30,
    description: '30 créditos para consultas oraculares',
  },
  credits_60: {
    key: 'credits_60',
    label: 'Pacote 60 Créditos',
    priceEnv: 'STRIPE_PRICE_AKASHA_CREDITS_60',
    mode: 'payment' as const,
    unitAmountBRL: 4490,
    creditsGranted: 60,
    description: '60 créditos para consultas oraculares',
  },
} as const;

export type AkashaProductKey = keyof typeof AKASHA_PRODUCTS;

export function getStripeAkasha(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurada');
  return new Stripe(key, { apiVersion: '2026-05-27.dahlia', typescript: true });
}

export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  const sub = await prisma.akashaSubscription.findUnique({ where: { userId } });
  if (sub?.stripeCustomerId) return sub.stripeCustomerId;

  const stripe = getStripeAkasha();
  const customer = await stripe.customers.create({ email, metadata: { akashaUserId: userId } });

  await prisma.akashaSubscription.upsert({
    where: { userId },
    create: { userId, stripeCustomerId: customer.id },
    update: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function getCreditBalance(userId: string): Promise<number> {
  const result = await prisma.akashaCreditEntry.aggregate({
    where: { userId },
    _sum: { delta: true },
  });
  return result._sum.delta ?? 0;
}

export async function addCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<{ balance: number }> {
  const current = await getCreditBalance(userId);
  const newBalance = current + amount;
  await prisma.akashaCreditEntry.create({
    data: { userId, delta: amount, reason, balance: newBalance },
  });
  return { balance: newBalance };
}

export function getPriceId(productKey: AkashaProductKey): string | null {
  const product = AKASHA_PRODUCTS[productKey];
  return process.env[product.priceEnv] ?? null;
}
