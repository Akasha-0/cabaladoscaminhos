import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { TipoTransacao } from '@prisma/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { erro: 'Assinatura do webhook não encontrada' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET não está definida');
    return NextResponse.json(
      { erro: 'Configuração de webhook incorreta' },
      { status: 500 }
    );
  }

  if (!stripe) {
    console.error('Stripe não está configurado');
    return NextResponse.json(
      { erro: 'Stripe não está configurado' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error('Erro ao verificar assinatura do webhook:', error.message);
    return NextResponse.json(
      { erro: `Assinatura inválida: ${error.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await processarCheckoutCompleto(session);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await processarAssinaturaCancelada(subscription);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await processarPagamentoFalho(invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await processarAssinaturaAtualizada(subscription);
        break;
      }
      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ recebido: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { erro: 'Erro ao processar evento' },
      { status: 500 }
    );
  }
}

async function processarCheckoutCompleto(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planoId = session.metadata?.planoId;
  const creditos = session.metadata?.creditos;

  if (!userId) {
    console.error('UserId não encontrado no metadata do checkout');
    return;
  }

  const quantidadeCreditos = creditos ? parseInt(creditos, 10) : 0;

  if (quantidadeCreditos > 0) {
    await prisma.credito.upsert({
      where: { userId },
      update: {
        saldo: { increment: quantidadeCreditos },
      },
      create: {
        userId,
        saldo: quantidadeCreditos,
      },
    });

    await prisma.transacaoCredito.create({
      data: {
        credito: { connect: { userId } },
        tipo: TipoTransacao.CREDITO,
        quantidade: quantidadeCreditos,
        descricao: `Assinatura ${planoId || 'Plano'} - Primeiros créditos`,
      },
    });

    console.log(`Créditos adicionados para usuário ${userId}: ${quantidadeCreditos}`);
  }

  if (session.subscription) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: session.subscription as string,
        stripeCustomerId: session.customer as string,
        planoAssinatura: planoId || null,
      },
    });
  }
}

async function processarAssinaturaCancelada(subscription: Stripe.Subscription) {
  await prisma.user.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      stripeSubscriptionId: null,
      planoAssinatura: null,
    },
  });

  console.log(`Assinatura cancelada: ${subscription.id}`);
}

async function processarPagamentoFalho(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true },
  });

  if (user) {
    console.log(`Pagamento falhou para usuário ${user.id}`);
  }
}

async function processarAssinaturaAtualizada(subscription: Stripe.Subscription) {
  console.log(`Assinatura atualizada: ${subscription.id}, status: ${subscription.status}`);
}