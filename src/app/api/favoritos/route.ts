import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const FavoritoTipoSchema = z.enum(['affirmation', 'ritual', 'tarot', 'numerologia']);
const FavoritoSchema = z.object({
  id: z.string(),
  tipo: FavoritoTipoSchema,
  itemId: z.string(),
  createdAt: z.string(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});
const CreateFavoritoSchema = z.object({
  tipo: FavoritoTipoSchema,
  itemId: z.string().min(1, 'itemId é obrigatório'),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});
const DeleteFavoritoSchema = z.object({
  id: z.string().min(1, 'id é obrigatório'),
});
const FavoritosQuerySchema = z.object({
  tipo: FavoritoTipoSchema.optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

type FavoritoTipo = z.infer<typeof FavoritoTipoSchema>;
export type Favorito = z.infer<typeof FavoritoSchema>;

// ─── Spiritual Correlations by Favorite Type ──────────────────────────────────────────
const FAVORITE_TYPE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  affirmation: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'Minhas afirmações têm poder de manifestação',
    frequency: '963 Hz',
  },
  ritual: {
    sefirot: ['Tipheret', 'Gevurah'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Meus rituais são portal de transformação',
    frequency: '528 Hz',
  },
  tarot: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'A sabedoria do Tarot ilumina meu caminho',
    frequency: '639 Hz',
  },
  numerologia: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Os números revelam minha verdade interior',
    frequency: '741 Hz',
  },
};

const favoritos: Map<string, Favorito> = new Map();

function generateId(): string {
  return `fav_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = FavoritosQuerySchema.safeParse({
      tipo: searchParams.get('tipo'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { tipo, sefirot, chakra, element, orixa } = parseResult.data;

    let items = Array.from(favoritos.values());

    if (tipo) {
      items = items.filter(f => f.tipo === tipo);
    }

    if (sefirot) {
      items = items.filter(f => f.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      items = items.filter(f => f.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      items = items.filter(f => f.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      items = items.filter(f => f.spiritualCorrelations?.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byType: items.reduce((acc, f) => {
        acc[f.tipo] = (acc[f.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: items.reduce((acc, f) => {
        f.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: items.reduce((acc, f) => {
        const c = f.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: items.reduce((acc, f) => {
        const e = f.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: items.reduce((acc, f) => {
        const o = f.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      favoritos: items,
      count: items.length,
      spiritualCorrelations: FAVORITE_TYPE_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { tipo, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateFavoritoSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { tipo, itemId, sefirot, chakra, element, orixa } = parseResult.data;

    const existing = Array.from(favoritos.values()).find(
      f => f.tipo === tipo && f.itemId === itemId
    );
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const baseCorr = FAVORITE_TYPE_SPIRITUAL_CORRELATIONS[tipo];
    const spiritualCorr = {
      sefirot: sefirot ? [sefirot] : baseCorr?.sefirot || [],
      chakra: chakra || baseCorr?.chakra || 5,
      element: element || baseCorr?.element || 'Ar',
      orixa: orixa || baseCorr?.orixa || 'Oxalá',
      affirmation: baseCorr?.affirmation || '',
      frequency: baseCorr?.frequency || '528 Hz',
    };

    const favorito: Favorito = {
      id: generateId(),
      tipo,
      itemId,
      createdAt: new Date().toISOString(),
      spiritualCorrelations: spiritualCorr,
    };

    favoritos.set(favorito.id, favorito);
    return NextResponse.json({
      success: true,
      favorito,
      spiritualCorrelations: spiritualCorr,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = DeleteFavoritoSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { id } = parseResult.data;

    if (!favoritos.has(id)) {
      return NextResponse.json({ success: false, error: 'Favorite not found' }, { status: 404 });
    }

    favoritos.delete(id);
    return NextResponse.json({ success: true, deleted: id });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
}