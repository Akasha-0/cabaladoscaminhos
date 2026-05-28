import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getCreditos, getCreditosCompleto } from '@/lib/credits/service';

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
    const searchParams = request.nextUrl.searchParams;
    const completo = searchParams.get('completo') === 'true';

    if (completo) {
      const creditos = await getCreditosCompleto(user.id);
      return NextResponse.json(creditos);
    }

    const saldo = await getCreditos(user.id);
    return NextResponse.json({ saldo });
  } catch (error) {
    console.error('Erro ao buscar créditos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar saldo de créditos' },
      { status: 500 }
    );
  }
}