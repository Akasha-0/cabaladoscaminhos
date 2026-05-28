import { NextRequest, NextResponse } from 'next/server';

const VALID_CATEGORIES = ['ambient', 'music', 'nature', 'meditation', 'sleep'] as const;
type Category = typeof VALID_CATEGORIES[number];

const AUDIO_CATEGORIES = {
  ambient: {
    title: 'Ambiente',
    description: 'Sons ambiente para concentração e foco',
    icon: 'ambient',
  },
  music: {
    title: 'Música',
    description: 'Faixas musicais espirituais',
    icon: 'music',
  },
  nature: {
    title: 'Natureza',
    description: 'Sons da natureza para relaxamento',
    icon: 'nature',
  },
  meditation: {
    title: 'Meditação',
    description: 'Guias de áudio para prática meditativa',
    icon: 'meditation',
  },
  sleep: {
    title: 'Sono',
    description: 'Áudios para facilitar o sono',
    icon: 'sleep',
  },
} as const;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as Category | null;
  const id = searchParams.get('id');

  if (id) {
    return NextResponse.json(
      { error: 'Not implemented' },
      { status: 501 }
    );
  }

  if (category) {
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category', valid: VALID_CATEGORIES },
        { status: 400 }
      );
    }

    const meta = AUDIO_CATEGORIES[category];
    return NextResponse.json({
      category,
      ...meta,
      tracks: [],
    });
  }

  return NextResponse.json({
    categories: VALID_CATEGORIES.map((cat) => ({
      id: cat,
      ...AUDIO_CATEGORIES[cat],
    })),
  });
}