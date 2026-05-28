import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

interface LeituraHistorico {
  id: string;
  tipo: string;
  titulo: string;
  conteudo: string;
  data: string;
  metadados?: Record<string, unknown>;
}

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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const tipo = searchParams.get('tipo');

    let query = supabase
      .from('leituras_historico')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error: dbError } = await query;

    if (dbError) {
      console.error('Erro ao buscar histórico:', dbError);
      return NextResponse.json(
        { error: 'Erro ao buscar histórico de leituras' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const leituras: LeituraHistorico[] = (data || []).map(item => ({
      id: item.id,
      tipo: item.tipo,
      titulo: item.titulo,
      conteudo: item.conteudo,
      data: item.created_at,
      metadados: item.metadados,
    }));

    return NextResponse.json({
      leituras,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico de leituras' },
      { status: 500 }
    );
  }
}

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
    const { tipo, titulo, conteudo, metadados } = body as {
      tipo: string;
      titulo: string;
      conteudo: string;
      metadados?: Record<string, unknown>;
    };

    if (!tipo || !conteudo) {
      return NextResponse.json(
        { error: 'Tipo e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase
      .from('leituras_historico')
      .insert({
        user_id: user.id,
        tipo,
        titulo: titulo || '',
        conteudo,
        metadados: metadados || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao salvar leitura:', insertError);
      return NextResponse.json(
        { error: 'Erro ao salvar leitura' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leitura: {
        id: data.id,
        tipo: data.tipo,
        titulo: data.titulo,
        conteudo: data.conteudo,
        data: data.created_at,
        metadados: data.metadados,
      },
    });
  } catch (error) {
    console.error('Erro ao salvar leitura:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar leitura' },
      { status: 500 }
    );
  }
}