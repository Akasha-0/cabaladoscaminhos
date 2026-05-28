import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getCreditos } from '@/lib/credits/service';

export async function GET(request: NextRequest) {
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
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('plano, status_assinatura, periodo_assinatura_fim')
      .eq('id', user.id)
      .single();

    if (perfilError) {
      console.error('Erro ao buscar perfil:', perfilError);
      return NextResponse.json(
        { error: 'Erro ao buscar informações da assinatura' },
        { status: 500 }
      );
    }

    const credits = await getCreditos(user.id);

    return NextResponse.json({
      plan: perfil.plano || 'free',
      status: perfil.status_assinatura || 'inactive',
      currentPeriodEnd: perfil.periodo_assinatura_fim || null,
      credits,
    });
  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar status da assinatura' },
      { status: 500 }
    );
  }
}