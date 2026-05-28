import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { adicionarCreditos } from '@/lib/credits/service';

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
    const { quantidade, descricao } = body;

    if (!quantidade || quantidade <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      );
    }

    if (!descricao || descricao.trim() === '') {
      return NextResponse.json(
        { error: 'Descrição é obrigatória' },
        { status: 400 }
      );
    }

    const resultado = await adicionarCreditos(user.id, quantidade, descricao);

    return NextResponse.json({
      success: true,
      novoSaldo: resultado.novoSaldo,
    });
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar créditos' },
      { status: 500 }
    );
  }
}