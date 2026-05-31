import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const LeituraTipoSchema = z.enum([
  'numerologia', 'tarot', 'astrologia', 'orixa', 'cabala',
  'udu', 'mapa-natal', 'divinacao', 'ritual', 'meditacao',
  'afirmacao', 'outro'
]);

const LeituraHistoricoSchema = z.object({
  id: z.string(),
  tipo: LeituraTipoSchema,
  titulo: z.string(),
  conteudo: z.string(),
  data: z.string(),
  metadados: z.record(z.unknown()).optional(),
});

const HistoricoQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  tipo: LeituraTipoSchema.optional(),
});

const HistoricoBodySchema = z.object({
  tipo: LeituraTipoSchema,
  titulo: z.string().optional().default(''),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
  metadados: z.record(z.unknown()).optional(),
});

export type LeituraHistorico = z.infer<typeof LeituraHistoricoSchema>;
export const dynamic = 'force-dynamic';

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não autenticado',
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    const parseResult = HistoricoQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      tipo: searchParams.get('tipo'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { page, limit, tipo } = parseResult.data;

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
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar histórico de leituras',
      }, { status: 500 });
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

    // Statistics by tipo
    const stats = leituras.reduce((acc, l) => {
      acc[l.tipo] = (acc[l.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      leituras,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats,
 });
  } catch (error) {
    const err = error as Error;
    console.error('Erro ao buscar histórico:', err);
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não autenticado',
      }, { status: 401 });
    }

    const body = await request.json();

    const parseResult = HistoricoBodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { tipo, titulo, conteudo, metadados } = parseResult.data;

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
      return NextResponse.json({
        success: false,
        error: 'Erro ao salvar leitura',
      }, { status: 500 });
    }

    const leitura: LeituraHistorico = {
      id: data.id,
      tipo: data.tipo,
      titulo: data.titulo,
      conteudo: data.conteudo,
      data: data.created_at,
      metadados: data.metadados,
    };

    return NextResponse.json({
      success: true,
      leitura,
      message: 'Leitura salva com sucesso',
    }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error('Erro ao salvar leitura:', err);
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não autenticado',
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID da leitura é obrigatório',
      }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('leituras_historico')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Erro ao deletar leitura:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao deletar leitura',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Leitura deletada com sucesso',
    });
  } catch (error) {
    const err = error as Error;
    console.error('Erro ao deletar leitura:', err);
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}