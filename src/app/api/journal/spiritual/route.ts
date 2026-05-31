import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const JournalEntrySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  mood: z.string().optional(),
  theme: z.string().optional(),
  insights: z.string().optional(),
  gratitude: z.string().optional(),
});
interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  theme?: string;
  insights?: string;
  gratitude?: string;
  created_at: string;
  updated_at: string;
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
    const theme = searchParams.get('theme');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('spiritual_journal')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (theme) {
      query = query.eq('theme', theme);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error: dbError } = await query;

    if (dbError) {
      console.error('Error fetching spiritual journal entries:', dbError);
      return NextResponse.json(
        { error: 'Erro ao buscar entradas do diário espiritual' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const entries: JournalEntry[] = (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title || '',
      content: item.content || '',
      mood: item.mood,
      theme: item.theme,
      insights: item.insights,
      gratitude: item.gratitude,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return NextResponse.json({
      success: true,
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error in GET spiritual journal:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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
    const parseResult = JournalEntrySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { title, content, mood, theme, insights, gratitude } = parseResult.data;
    const { data, error: insertError } = await supabase
      .from('spiritual_journal')
      .insert({
        user_id: user.id,
        title,
        content,
        mood: mood || null,
        theme: theme || null,
        insights: insights || null,
        gratitude: gratitude || null,
      });
      });
    const { data, error: insertError } = await supabase
      .from('spiritual_journal')
      .insert({
        user_id: user.id,
        title,
        content,
        mood: mood || null,
        theme: theme || null,
        insights: insights || null,
        gratitude: gratitude || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating spiritual journal entry:', insertError);
      return NextResponse.json(
        { error: 'Erro ao criar entrada do diário espiritual' },
        { status: 500 }
      );
    }

    const entry: JournalEntry = {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      content: data.content,
      mood: data.mood,
      theme: data.theme,
      insights: data.insights,
      gratitude: data.gratitude,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json({
      success: true,
      entry,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST spiritual journal:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
