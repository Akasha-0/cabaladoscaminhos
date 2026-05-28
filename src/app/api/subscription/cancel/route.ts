import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { erro: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar assinatura ativa do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true, stripeCustomerId: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { erro: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const subscriptionId = usuario.stripeSubscriptionId;

    if (!subscriptionId) {
      return NextResponse.json(
        { erro: 'Nenhuma assinatura ativa encontrada' },
        { status: 400 }
      );
    }

    if (!stripe) {
      // Modo mock para desenvolvimento sem Stripe
      console.log(`[MOCK] Cancelando assinatura ${subscriptionId} para usuário ${userId}`);

      await prisma.usuario.update({
        where: { id: userId },
        data: {
          stripeSubscriptionId: null,
          statusAssinatura: 'CANCELLED',
        },
      });

      return NextResponse.json({
        sucesso: true,
        mensagem: 'Assinatura cancelada com sucesso (modo mock)',
        subscriptionId,
      });
    }

    // Cancelar assinatura no Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    // Atualizar status no banco de dados
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: null,
        statusAssinatura: 'CANCELLED',
      },
    });

    // Registrar transação de cancelamento
    await prisma.transacao.create({
      data: {
        usuarioId: userId,
        tipo: 'ASSINATURA_CANCELADA',
        quantidade: 0,
        descricao: `Assinatura ${subscriptionId} cancelada`,
        stripePaymentIntentId: canceledSubscription.id,
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Assinatura cancelada com sucesso',
      subscriptionId: canceledSubscription.id,
      status: canceledSubscription.status,
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);

    if (error instanceof Error) {
      // Erros comuns do Stripe
      if (error.message.includes('No subscription found')) {
        return NextResponse.json(
          { erro: 'Assinatura não encontrada no Stripe' },
          { status: 404 }
        );
      }
      if (error.message.includes('already canceled')) {
        return NextResponse.json(
          { erro: 'Assinatura já está cancelada' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { erro: 'Erro interno ao cancelar assinatura' },
      { status: 500 }
    );
  }
}
