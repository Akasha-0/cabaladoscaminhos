import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const ElementNameSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);
const ElementQuerySchema = z.object({
  element: ElementNameSchema.optional(),
  includeCorrelations: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(10).optional(),
});
const ElementInputSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  odu: z.string().optional(),
});

// ─── Element Data with Spiritual Correlations ──────────────────────────────

const ELEMENTS: Array<{
  name: string;
  nameEn: string;
  symbol: string;
  qualities: string[];
  sefirot: string[];
  orixas: string[];
  tarot: string[];
  chakra: string;
  direction: string;
  planet: string;
  day: string;
  season: string;
  traits: string[];
  affirmation: string;
}> = [
  {
    name: 'Fogo',
    nameEn: 'Fire',
    symbol: '🔥',
    qualities: ['Quente', 'Seco', 'Expansivo'],
    sefirot: ['Chesed', 'Gevurah'],
    orixas: ['Ogum', 'Xangô'],
    tarot: ['A Torre', 'O Carro'],
    chakra: 'Manipura (3º)',
    direction: 'Leste',
    planet: 'Marte',
    day: 'Terça-feira',
    season: 'Verão',
    traits: ['Paixão', 'Energia', 'Transformação', 'Coragem', 'Impulsividade'],
    affirmation: 'Minha energia transforma e ilumina todos os caminhos.',
  },
  {
    name: 'Água',
    nameEn: 'Water',
    symbol: '💧',
    qualities: ['Frio', 'Úmido', 'Contensivo'],
    sefirot: ['Binah', 'Yesod'],
    orixas: ['Oxum', 'Iemanjá', 'Nanã'],
    tarot: ['A Lua', 'O Mar'],
    chakra: 'Svadhisthana (2º)',
    direction: 'Oeste',
    planet: 'Lua',
    day: 'Segunda-feira',
    season: 'Inverno',
    traits: ['Intuição', 'Emoção', 'Sensibilidade', 'Adaptabilidade', 'Fluidez'],
    affirmation: 'Fluo como a água, adaptando-me aos caminhos do universo.',
  },
  {
    name: 'Terra',
    nameEn: 'Earth',
    symbol: '🌍',
    qualities: ['Frio', 'Seco', 'Contensivo'],
    sefirot: ['Malkuth', 'Yesod'],
    orixas: ['Oxóssi', 'Obatalá'],
    tarot: ['O Mundo', 'O Imperador'],
    chakra: 'Muladhara (1º)',
    direction: 'Sul',
    planet: 'Saturno',
    day: 'Sábado',
    season: 'Outono',
    traits: ['Estabilidade', 'Paciência', 'Praticidade', 'Segurança', 'Gratidão'],
    affirmation: 'Estou enraizado na sabedoria ancestral da terra.',
  },
  {
    name: 'Ar',
    nameEn: 'Air',
    symbol: '💨',
    qualities: ['Quente', 'Úmido', 'Expansivo'],
    sefirot: ['Chokhmah', 'Netzach'],
    orixas: ['Iansã'],
    tarot: ['Os Enamorados', 'O Louco'],
    chakra: 'Anahata (4º)',
    direction: 'Norte',
    planet: 'Mercúrio',
    day: 'Quarta-feira',
    season: 'Primavera',
    traits: ['Comunicação', 'Liberdade', 'Inteligência', 'Socialização', 'Versatilidade'],
    affirmation: 'Respiro a liberdade do ar e expresso minha verdade.',
  },
  {
    name: 'Éter',
    nameEn: 'Ether',
    symbol: '✨',
    qualities: ['Neutro', 'Neutro', 'Expansivo'],
    sefirot: ['Keter', 'Daat'],
    orixas: ['Logun-ede'],
    tarot: ['O Louco', 'O Mago'],
    chakra: 'Sahasrara (7º)',
    direction: 'Centro',
    planet: 'Mercúrio',
    day: 'Todos',
    season: 'Todo',
    traits: ['Espiritualidade', 'Transcendência', 'Conexão', 'Sabedoria', 'Unidade'],
    affirmation: 'Conecto-me com a energia universal que permeia tudo.',
  },
];

const ELEMENT_INDEX = {
  Fogo: 0,
  Água: 1,
  Terra: 2,
  Ar: 3,
  Éter: 4,
};

function inferElement(birthDate?: string, odu?: string): { primary: typeof ELEMENTS[number]; secondary?: typeof ELEMENTS[number] } {
  if (birthDate) {
    const day = new Date(birthDate).getDate();
    const elementIndex = day % 5;
    const primary = ELEMENTS[elementIndex];
    const secondaryIndex = (elementIndex + 2) % 5;
    return { primary, secondary: ELEMENTS[secondaryIndex] };
  }

  if (odu) {
    const oduLower = odu.toLowerCase();
    if (['ogunda', 'ejionile', 'ejioko'].includes(oduLower)) {
      return { primary: ELEMENTS[0] };
    }
    if (['elegbara', 'ará'].includes(oduLower)) {
      return { primary: ELEMENTS[3] };
    }
    if (['oxum', 'yemanjá', 'nanã'].some(n => oduLower.includes(n))) {
      return { primary: ELEMENTS[1] };
    }
    if (['oxossi', 'logun'].some(n => oduLower.includes(n))) {
      return { primary: ELEMENTS[2] };
    }
    if (['oxalá', 'orun'].some(n => oduLower.includes(n))) {
      return { primary: ELEMENTS[4] };
    }
  }

  return { primary: ELEMENTS[4] };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = ElementQuerySchema.safeParse({
    element: searchParams.get('element'),
    includeCorrelations: searchParams.get('includeCorrelations'),
    limit: searchParams.get('limit'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { element, includeCorrelations, limit } = parseResult.data;
  let elements = [...ELEMENTS];

  if (element) {
    const elementName = element as keyof typeof ELEMENT_INDEX;
    const index = ELEMENT_INDEX[elementName];
    if (index !== undefined) {
      elements = [ELEMENTS[index]];
    }
  }

  if (limit) {
    elements = elements.slice(0, limit);
  }

  const response: Record<string, unknown> = {
    success: true,
    count: elements.length,
    total: ELEMENTS.length,
  };

  if (includeCorrelations) {
    response.elements = elements;
  } else {
    response.elements = elements.map(e => ({
      name: e.name,
      nameEn: e.nameEn,
      symbol: e.symbol,
      qualities: e.qualities,
      direction: e.direction,
      traits: e.traits,
    }));
  }

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = ElementInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválida',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { birthDate, odu } = parseResult.data;
    const { primary, secondary } = inferElement(birthDate, odu);

    return NextResponse.json({
      success: true,
      dominantElement: primary,
      secondaryElement: secondary ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}