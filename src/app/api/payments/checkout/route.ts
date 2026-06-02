import { NextRequest, NextResponse } from 'next/server';
import { criarSessaoCheckout, PlanoInvalidoError, CheckoutError } from '@/lib/payments/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planoId } = body;

    if (!userId || !planoId) {
      return NextResponse.json(
        { erro: 'userId e planoId são obrigatórios' },
        { status: 400 }
      );
    }

    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const sucessoUrl = `${baseUrl}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pagamento/cancelado`;

    const resultado = await criarSessaoCheckout(
      userId,
      planoId,
      sucessoUrl,
      cancelUrl
    );

    return NextResponse.json(resultado);
  } catch (error) {
    if (error instanceof PlanoInvalidoError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    if (error instanceof CheckoutError) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { erro: 'Erro interno ao criar sessão de checkout' },
      { status: 500 }
    );
  }
}