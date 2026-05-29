// ============================================================
// MEDITACAO DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for meditation data access
// - Retrieve all meditations
// - Get specific meditation by ID
// - Filter by category
// - Filter by duration
// - Meditation phases and scripts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData, getMeditationById, getMeditationsByCategory, getMeditationsByDuration } from '@/lib/meditation/practice/meditation-data';

// Category metadata for GET responses
const CATEGORY_META = {
  cura: { title: 'Meditações de Cura', description: 'Práticas para cura emocional, física e espiritual', count: 3 },
  sono: { title: 'Meditações para Sono', description: 'Rituais para relaxamento profundo e sono restaurador', count: 2 },
  foco: { title: 'Meditações de Foco', description: 'Práticas para clareza mental e concentração', count: 3 },
  energia: { title: 'Meditações de Energia', description: 'Ativações para despertar vitalidade e kreatividade', count: 3 },
  sagrado: { title: 'Meditações Sagradas', description: 'Práticas contemplativas para estados elevados de consciência', count: 3 },
} as const;

type Category = keyof typeof CATEGORY_META;

// GET /api/meditacao/data - Get meditation data
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const category = searchParams.get('category') as Category | null;
  const maxDuration = searchParams.get('maxDuration');
  const phases = searchParams.get('phases');

  // Get single meditation by ID
  if (id) {
    const meditation = getMeditationById(id);
    if (!meditation) {
      return NextResponse.json(
        { error: 'Meditação não encontrada', id },
        { status: 404 }
      );
    }
    return NextResponse.json({
      data: meditation,
      meta: { source: 'meditation-data' },
    });
  }

  // Get meditations by category
  if (category) {
    if (!Object.keys(CATEGORY_META).includes(category)) {
      return NextResponse.json(
        { error: 'Categoria inválida', validCategories: Object.keys(CATEGORY_META) },
        { status: 400 }
      );
    }
    const meditations = getMeditationsByCategory(category);
    return NextResponse.json({
      data: meditations,
      meta: {
        category,
        ...CATEGORY_META[category],
        total: meditations.length,
      },
    });
  }

  // Get meditations by max duration
  if (maxDuration) {
    const duration = parseInt(maxDuration, 10);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json(
        { error: 'Duração inválida. Forneça um número positivo em segundos.' },
        { status: 400 }
      );
    }
    const meditations = getMeditationsByDuration(duration);
    return NextResponse.json({
      data: meditations,
      meta: { maxDuration: duration, total: meditations.length },
    });
  }

  // Return all categories overview
  if (phases === 'false') {
    const allData = getData();
    const categories = Object.entries(CATEGORY_META).map(([key, meta]) => ({
      id: key,
      ...meta,
      meditations: allData.filter((m) => m.category === key).map((m) => ({
        id: m.id,
        title: m.title,
        duration: m.duration,
        tags: m.tags,
      })),
    }));

    return NextResponse.json({
      data: categories,
      meta: { total: allData.length, categories: categories.length },
    });
  }

  // Return all meditations with full data
  const allMeditations = getData();

  return NextResponse.json({
    data: allMeditations,
    meta: {
      total: allMeditations.length,
      categories: CATEGORY_META,
      source: 'meditation-data',
    },
  });
}
