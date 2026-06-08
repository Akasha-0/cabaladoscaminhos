import { stripe } from './stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// fallow-ignore-next-line unused-type
export interface PlanoInfo {
  id: string;
  nome: string;
  creditos: number;
  preco: number;
  recursos: string[];
}

export const PLANOS: Record<string, PlanoInfo> = {
  Iniciante: {
    id: process.env.STRIPE_PRICE_INICIANTE || 'price_iniciante',
    nome: 'Iniciante',
    creditos: 50,
    preco: 29.90,
    recursos: ['25 insights', '10 chat'],
  },
  Caminhante: {
    id: process.env.STRIPE_PRICE_CAMINHANTE || 'price_caminhante',
    nome: 'Caminhante',
    creditos: 150,
    preco: 59.90,
    recursos: ['75 insights', '30 chat'],
  },
  Mestre: {
    id: process.env.STRIPE_PRICE_MESTRE || 'price_mestre',
    nome: 'Mestre',
    creditos: 350,
    preco: 99.90,
    recursos: ['175 insights', '70 chat'],
  },
};

export class PlanoInvalidoError extends Error {
  constructor(planoId: string) {
    super(`Plano inválido: ${planoId}`);
    this.name = 'PlanoInvalidoError';
  }
}

export class CheckoutError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'CheckoutError';
  }
}

export async function criarSessaoCheckout(
  userId: string,
  planoId: string,
  sucessoUrl: string,
  cancelUrl: string
): Promise<{ url: string; sessionId: string }> {
  const plano = PLANOS[planoId];
  if (!plano) {
    throw new PlanoInvalidoError(planoId);
  }

  if (!stripe) {
    throw new CheckoutError('Stripe não está configurado');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) {
    throw new CheckoutError('Usuário não encontrado ou sem email');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Cabala dos Caminhos - Plano ${plano.nome}`,
              description: `${plano.creditos} créditos/mês`,
            },
            recurring: { interval: 'month' },
            unit_amount: Math.round(plano.preco * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        planoId,
        creditos: plano.creditos.toString(),
      },
      success_url: sucessoUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url!, sessionId: session.id };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new CheckoutError(`Erro do Stripe: ${error.message}`);
    }
    throw error;
  }
}

async function verificarAssinatura(userId: string) {
  if (!stripe) {
    throw new CheckoutError('Stripe não está configurado');
  }

  try {
    const assinaturas = await stripe.subscriptions.list({
      customer: userId,
      status: 'active',
      limit: 1,
    });

    if (assinaturas.data.length === 0) {
      return null;
    }

    const assinatura = assinaturas.data[0];
    const planoId = assinatura.metadata?.planoId;
    const plano = planoId ? PLANOS[planoId] : null;

    const currentPeriodEnd = assinatura.items.data[0]?.current_period_end;
    
    return {
      id: assinatura.id,
      status: assinatura.status,
      plano: plano,
      currentPeriodEnd: currentPeriodEnd 
        ? new Date(currentPeriodEnd * 1000) 
        : null,
    };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new CheckoutError(`Erro ao verificar assinatura: ${error.message}`);
    }
    throw error;
  }
}

export async function criarPortalSession(
  userId: string,
  returnUrl: string
): Promise<{ url: string }> {
  if (!stripe) {
    throw new CheckoutError('Stripe não está configurado');
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: userId,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new CheckoutError('Nenhuma assinatura encontrada para este usuário');
    }

    const customerId = subscriptions.data[0].customer as string;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: portalSession.url };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new CheckoutError(`Erro ao criar portal: ${error.message}`);
    }
    throw error;
  }
}

async function obterCustomerId(userId: string): Promise<string | null> {
  if (!stripe) {
    return null;
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: userId,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return null;
    }

    return subscriptions.data[0].customer as string;
  } catch {
    return null;
  }
}

export function extrairUserId(metadata: Stripe.Metadata): string | null {
  return metadata.userId || null;
}

export function extrairPlanoId(metadata: Stripe.Metadata): string | null {
  return metadata.planoId || null;
}

export function extrairCreditos(metadata: Stripe.Metadata): number {
  const creditos = metadata.creditos;
  return creditos ? parseInt(creditos, 10) : 0;
}