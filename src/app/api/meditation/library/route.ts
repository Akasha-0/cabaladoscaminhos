import { NextRequest, NextResponse } from 'next/server';
import { getMeditations, getMeditationById, MeditationCategory } from '@/lib/meditation/library';
import { getTypes } from '@/lib/meditation/types';

const VALID_CATEGORIES: MeditationCategory[] = ['cura', 'sono', 'foco', 'energia', 'sagrado'];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as MeditationCategory | null;
  const id = searchParams.get('id');
  const types = searchParams.get('types');

  if (id) {
    const meditation = getMeditationById(id);
    if (!meditation) {
      return NextResponse.json(
        { error: 'Meditation not found', id },
        { status: 404 }
      );
    }
    return NextResponse.json(meditation);
  }

  if (category) {
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category', valid: VALID_CATEGORIES },
        { status: 400 }
      );
    }
    const meditations = getMeditations().filter((m) => m.category === category);
    return NextResponse.json({
      category,
      meditations,
      count: meditations.length,
    });
  }

  if (types === 'true') {
    return NextResponse.json({
      types: getTypes(),
    });
  }

  const meditations = getMeditations();
  const byCategory = VALID_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = meditations.filter((m) => m.category === cat);
    return acc;
  }, {} as Record<MeditationCategory, typeof meditations>);

  return NextResponse.json({
    meditations,
    categories: VALID_CATEGORIES,
    byCategory,
    total: meditations.length,
  });
}