// ============================================================
// RITUAL PLANNER PLANS API - CABALA DOS CAMINHOS
// ============================================================
// API route for ritual plans management
// GET: Retrieve ritual plans
// POST: Create new ritual plan
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

interface RitualPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  ritual_type?: string;
  scheduled_date?: string;
  duration_minutes?: number;
  intention?: string;
  materials?: string[];
  steps?: string[];
  notes?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
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
    const status = searchParams.get('status');
    const ritualType = searchParams.get('ritual_type');
    const upcoming = searchParams.get('upcoming');

    let query = supabase
      .from('ritual_plans')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    if (ritualType) {
      query = query.eq('ritual_type', ritualType);
    }

    if (upcoming === 'true') {
      const now = new Date().toISOString();
      query = query.gte('scheduled_date', now);
      query = query.neq('status', 'cancelled');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error: dbError } = await query;

    if (dbError) {
      console.error('Error fetching ritual plans:', dbError);
      return NextResponse.json(
        { error: 'Erro ao buscar planos de ritual' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const plans: RitualPlan[] = (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      name: item.name || '',
      description: item.description,
      ritual_type: item.ritual_type,
      scheduled_date: item.scheduled_date,
      duration_minutes: item.duration_minutes,
      intention: item.intention,
      materials: item.materials || [],
      steps: item.steps || [],
      notes: item.notes,
      status: item.status || 'planned',
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return NextResponse.json({
      success: true,
      plans,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error in GET ritual plans:', error);
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

    const {
      name,
      description,
      ritual_type,
      scheduled_date,
      duration_minutes,
      intention,
      materials,
      steps,
      notes,
      status,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase
      .from('ritual_plans')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        ritual_type: ritual_type || null,
        scheduled_date: scheduled_date || null,
        duration_minutes: duration_minutes || null,
        intention: intention || null,
        materials: materials || [],
        steps: steps || [],
        notes: notes || null,
        status: status || 'planned',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating ritual plan:', insertError);
      return NextResponse.json(
        { error: 'Erro ao criar plano de ritual' },
        { status: 500 }
      );
    }

    const plan: RitualPlan = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      ritual_type: data.ritual_type,
      scheduled_date: data.scheduled_date,
      duration_minutes: data.duration_minutes,
      intention: data.intention,
      materials: data.materials || [],
      steps: data.steps || [],
      notes: data.notes,
      status: data.status || 'planned',
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json({
      success: true,
      plan,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST ritual plans:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}