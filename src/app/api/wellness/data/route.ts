// ============================================================
// WELLNESS DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for wellness data access
// - Retrieve all wellness data
// - Get insights by user ID
// - Filter by category
// - Get wellness goals and tracking data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getInsights, WellnessCategory } from '@/lib/wellness/insights';
import { getGoals, getGoalsByCategory, getGoalsByStatus, getGoalsByPriority, getGoalById, GoalCategory, GoalStatus, GoalPriority } from '@/lib/wellness/wellness-goals';

// ─── CATEGORY METADATA ─────────────────────────────────────────────────────────

const CATEGORY_META = {
  meditation: { title: 'Meditação', description: 'Práticas de meditação e contemplação', count: 0 },
  ritual: { title: 'Ritual', description: 'Rituais sagrados e práticas espirituais', count: 0 },
  sleep: { title: 'Sono', description: 'Higiene do sono e qualidade de descanso', count: 0 },
  exercise: { title: 'Exercício', description: 'Atividade física e movimento', count: 0 },
  nutrition: { title: 'Nutrição', description: 'Alimentação consciente e nutritiva', count: 0 },
  mindfulness: { title: 'Mindfulness', description: 'Consciência plena e presença', count: 0 },
  movement: { title: 'Movimento', description: 'Práticas de movimento corporal', count: 0 },
  breathwork: { title: 'Respiração', description: 'Técnicas de respiração consciente', count: 0 },
  nature: { title: 'Natureza', description: 'Conexão com a natureza', count: 0 },
} as const;

type Category = keyof typeof CATEGORY_META;

// GET /api/wellness/data - Get wellness data
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const category = searchParams.get('category') as Category | null;
  const goalStatus = searchParams.get('status') as GoalStatus | null;
  const goalPriority = searchParams.get('priority') as GoalPriority | null;
  const id = searchParams.get('id');
  const insights = searchParams.get('insights');
  const goals = searchParams.get('goals');

  // Get specific goal by ID
  if (id) {
    const goal = getGoalById(id);
    if (!goal) {
      return NextResponse.json(
        { error: 'Meta de wellness não encontrada', id },
        { status: 404 }
      );
    }
    return NextResponse.json({
      data: goal,
      meta: { source: 'wellness-goals', type: 'goal' },
    });
  }

  // Get wellness insights
  if (insights === 'true') {
    const targetUserId = userId || 'default-user';
    const data = getInsights(targetUserId);
    return NextResponse.json({
      data,
      meta: { source: 'wellness-insights', userId: targetUserId },
    });
  }

  // Get goals by status
  if (goalStatus) {
    const validStatuses: GoalStatus[] = ['active', 'completed', 'paused'];
    if (!validStatuses.includes(goalStatus)) {
      return NextResponse.json(
        { error: 'Status inválido. Use: active, completed, ou paused', validStatuses },
        { status: 400 }
      );
    }
    const filteredGoals = getGoalsByStatus(goalStatus);
    return NextResponse.json({
      data: filteredGoals,
      meta: { status: goalStatus, total: filteredGoals.length, source: 'wellness-goals' },
    });
  }

  // Get goals by priority
  if (goalPriority) {
    const validPriorities: GoalPriority[] = ['essential', 'important', 'optional'];
    if (!validPriorities.includes(goalPriority)) {
      return NextResponse.json(
        { error: 'Prioridade inválida. Use: essential, important, ou optional', validPriorities },
        { status: 400 }
      );
    }
    const filteredGoals = getGoalsByPriority(goalPriority);
    return NextResponse.json({
      data: filteredGoals,
      meta: { priority: goalPriority, total: filteredGoals.length, source: 'wellness-goals' },
    });
  }

  // Get goals by category
  if (category) {
    if (!CATEGORY_META[category as Category]) {
      return NextResponse.json(
        { error: 'Categoria inválida', validCategories: Object.keys(CATEGORY_META) },
        { status: 400 }
      );
    }
    const filteredGoals = getGoalsByCategory(category as GoalCategory);
    return NextResponse.json({
      data: filteredGoals,
      meta: { category, total: filteredGoals.length, source: 'wellness-goals' },
    });
  }

  // Get all goals
  if (goals === 'true' || goals === 'false') {
    const allGoals = getGoals();
    const goalsMeta = CATEGORY_META;
    
    // Calculate counts per category
    const categoryCounts: Record<string, number> = {};
    allGoals.forEach(goal => {
      categoryCounts[goal.category] = (categoryCounts[goal.category] || 0) + 1;
    });

    return NextResponse.json({
      goals: allGoals,
      categories: Object.entries(goalsMeta).map(([key, value]) => ({
        id: key,
        ...value,
        count: categoryCounts[key] || 0,
      })),
      meta: { total: allGoals.length, source: 'wellness-goals' },
    });
  }

  // Return all wellness data overview
  const allGoals = getGoals();
  const insightsData = getInsights(userId || 'default-user');

  const categoryCounts: Record<string, number> = {};
  allGoals.forEach(goal => {
    categoryCounts[goal.category] = (categoryCounts[goal.category] || 0) + 1;
  });

  return NextResponse.json({
    data: {
      goals: allGoals,
      insights: insightsData,
    },
    categories: Object.entries(CATEGORY_META).map(([key, value]) => ({
      id: key,
      ...value,
      count: categoryCounts[key] || 0,
    })),
    meta: {
      totalGoals: allGoals.length,
      userId: userId || 'default-user',
      source: 'wellness-api',
    },
  });
}