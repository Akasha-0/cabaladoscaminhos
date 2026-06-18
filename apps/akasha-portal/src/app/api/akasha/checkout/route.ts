import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import {
  AKASHA_PRODUCTS,
  AkashaProductKey,
  getStripeAkasha,
  getOrCreateStripeCustomer,
  getPriceId,
} from '@/lib/application/akasha/stripe-akasha';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

const BodySchema = z.object({
  type: z.enum(['manifesto', 'pro', 'credits_10', 'credits_30', 'credits_60']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, successUrl, cancelUrl } = parsed.data;
  const product = AKASHA_PRODUCTS[type as AkashaProductKey];

  const stripe = getStripeAkasha();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { email: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const success = successUrl ?? `${baseUrl}/conta?checkout=success&type=${type}`;
  const cancel = cancelUrl ?? `${baseUrl}/conta?checkout=cancel`;

  const customerId = await getOrCreateStripeCustomer(auth.id, user.email);

  const priceId = getPriceId(type as AkashaProductKey);

  let session;

  if (priceId) {
    const lineItems = [{ price: priceId, quantity: 1 }];
    session = await stripe.checkout.sessions.create({
      mode: product.mode,
      customer: customerId,
      line_items: lineItems,
      metadata: {
        akashaUserId: auth.id,
        productType: type,
        creditsGranted: product.creditsGranted.toString(),
      },
      success_url: success,
      cancel_url: cancel,
    });
  } else {
    // No pre-configured price ID — create dynamic price
    if (product.mode === 'subscription') {
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: { name: product.label, description: product.description },
              recurring: { interval: 'month' },
              unit_amount: product.unitAmountBRL,
            },
            quantity: 1,
          },
        ],
        metadata: {
          akashaUserId: auth.id,
          productType: type,
          creditsGranted: product.creditsGranted.toString(),
        },
        success_url: success,
        cancel_url: cancel,
      });
    } else {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: { name: product.label, description: product.description },
              unit_amount: product.unitAmountBRL,
            },
            quantity: 1,
          },
        ],
        metadata: {
          akashaUserId: auth.id,
          productType: type,
          creditsGranted: product.creditsGranted.toString(),
        },
        success_url: success,
        cancel_url: cancel,
      });
    }
  }

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
