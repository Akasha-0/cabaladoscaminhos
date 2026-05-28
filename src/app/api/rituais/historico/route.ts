import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getRitualHistory, getRitualStats, addRitualCompletion } from '@/lib/ritual-storage';

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
    const includeStats = searchParams.get('stats') === 'true';

    const history = getRitualHistory(user.id);
    const total = history.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const paginatedHistory = history.slice(offset, offset + limit);

    const rituals = paginatedHistory.map(completion => ({
      date: completion.date.toISOString(),
      ritualId: completion.ritualId,
      completionStatus: 'completed',
      duration: completion.duration,
      notes: completion.notes || null,
    }));

    const stats = includeStats ? getRitualStats(user.id) : null;

    return NextResponse.json({
      rituals,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      streak: stats?.currentStreak || 0,
      stats: stats || null,
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de rituais:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico de rituais' },
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
    const { ritualId, date, duration, notes } = body;

    if (!ritualId || !date || !duration) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: ritualId, date, duration' },
        { status: 400 }
      );
    }

    const completion = addRitualCompletion(
      user.id,
      ritualId,
      new Date(date),
      duration,
      notes
    );

    return NextResponse.json({
      success: true,
      completion: {
        date: completion.date.toISOString(),
        ritualId: completion.ritualId,
        completionStatus: 'completed',
        duration: completion.duration,
        notes: completion.notes || null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar ritual:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar ritual' },
      { status: 500 }
    );
  }
}