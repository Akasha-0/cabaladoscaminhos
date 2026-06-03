import { NextRequest, NextResponse } from 'next/server';
import { criarPortalSession, CheckoutError } from '@/lib/payments/service';
import { requireOperator } from '@/lib/auth/operator-session';

export async function POST(request: NextRequest) {
  const authResult = await requireOperator(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { erro: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/assinatura`;

    const resultado = await criarPortalSession(userId, returnUrl);

    return NextResponse.json(resultado);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ erro: error.message }, { status: 400 });
    }
    console.error('Erro ao criar sessão do portal:', error);
    return NextResponse.json(
      { erro: 'Erro interno ao criar sessão do portal' },
      { status: 500 }
    );
  }
}
