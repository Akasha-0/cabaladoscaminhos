import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CategorySchema = z.enum(['ambient', 'music', 'nature', 'meditation', 'sleep']);
const AudioQuerySchema = z.object({
  category: CategorySchema.optional(),
  id: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
const AudioTrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(),
  category: CategorySchema,
  url: z.string().url(),
});
// Type aliases
type Category = z.infer<typeof CategorySchema>;
// Const enums
const VALID_CATEGORIES = ['ambient', 'music', 'nature', 'meditation', 'sleep'] as const;
const AUDIO_CATEGORIES = {
  ambient: {
    title: 'Ambiente',
    description: 'Sons ambiente para concentração e foco',
    icon: 'ambient',
    frequencies: ['396 Hz', '432 Hz', '528 Hz'],
  },
  music: {
    title: 'Música',
    description: 'Faixas musicais espirituais',
    icon: 'music',
    frequencies: ['Solfeggio'],
  },
  nature: {
    title: 'Natureza',
    description: 'Sons da natureza para relaxamento',
    icon: 'nature',
    frequencies: ['Theta', 'Delta'],
  },
  meditation: {
    title: 'Meditação',
    description: 'Guias de áudio para prática meditativa',
    icon: 'meditation',
    frequencies: ['Alpha', 'Theta'],
  },
  sleep: {
    title: 'Sono',
    description: 'Áudios para facilitar o sono',
    icon: 'sleep',
    frequencies: ['Delta', 'Theta'],
  },
} as const;
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = AudioQuerySchema.safeParse({
    category: searchParams.get('category'),
    id: searchParams.get('id'),
    limit: searchParams.get('limit'),
  });
  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }
  const { category, id, limit } = parseResult.data;
  if (id) {
    return NextResponse.json(
      { error: 'Not implemented' },
      { status: 501 }
    );
  }
  if (category) {
    const meta = AUDIO_CATEGORIES[category];
    return NextResponse.json({
      category,
      ...meta,
      tracks: [],
      limit: limit ?? 20,
    });
  }
  return NextResponse.json({
    categories: VALID_CATEGORIES.map((cat) => ({
      id: cat,
      ...AUDIO_CATEGORIES[cat],
    })),
  });
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = AudioTrackSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    return NextResponse.json({
      status: 'ok',
      message: 'Track created',
      track: parseResult.data,
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar áudio',
    }, { status: 500 });
  }
}