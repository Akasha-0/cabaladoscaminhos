import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { debitarCreditos, CreditosInsuficientesError } from '@/lib/credits/service';

export async function POST(request: NextRequest) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { quantidade, operacao } = body;

    if (!quantidade || quantidade <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      );
    }

    if (!operacao || operacao.trim() === '') {
      return NextResponse.json(
        { error: 'Operação é obrigatória' },
        { status: 400 }
      );
    }

    const resultado = await debitarCreditos(user.id, quantidade, operacao);

    return NextResponse.json({
      success: true,
      novoSaldo: resultado.novoSaldo,
    });
  } catch (error) {
    console.error('Erro ao debitar créditos:', error);

    if (error instanceof CreditosInsuficientesError) {
      return NextResponse.json(
        {
          error: error.message,
          saldoAtual: error.saldoAtual,
          saldoNecessario: error.saldoNecessario,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao debitar créditos' },
      { status: 500 }
    );
  }
}