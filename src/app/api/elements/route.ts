// ============================================================
// ELEMENTS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ElementNameSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);
const ElementInputSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  odu: z.string().optional(),
});
const ElementQuerySchema = z.object({
  element: ElementNameSchema.optional(),
  includeCorrelations: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(10).optional(),
});
const ELEMENTS = [
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
    sefirot: ['Malkut', 'Yesod'],
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
    orixas: ['Logunede'],
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
interface ElementInput {
  birthDate?: string;
  odu?: string;
}
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
    qualities: ['Frio', 'Úmido', 'Contraível'],
    sefirot: ['Binah', 'Yesod'],
    orixas: ['Oxum', 'Iemanjá', 'Nanã'],
    tarot: ['A Lua', 'O Mundo'],
    chakra: 'Svadhisthana (2º)',
    direction: 'Oeste',
    planet: 'Vênus',
    day: 'Sexta-feira',
    season: 'Outono',
    traits: ['Intuição', 'Emoção', 'Adaptação', 'Sensibilidade', 'Profundidade'],
    affirmation: 'Fluo como a água, encontrando meu caminho com graça e serenidade.',
  },
  {
    name: 'Terra',
    nameEn: 'Earth',
    symbol: '🌍',
    qualities: ['Frio', 'Seco', 'Contraído'],
    sefirot: ['Malkuth'],
    orixas: ['Oxossi', 'Nanã'],
    tarot: ['O Mundo', 'O Hierofante'],
    chakra: 'Muladhara (1º)',
    direction: 'Sul',
    planet: 'Saturno',
    day: 'Sábado',
    season: 'Inverno',
    traits: ['Estabilidade', 'Praticidade', 'Nutrição', 'Paciência', 'Materialidade'],
    affirmation: ' Estou enraizado na terra, forte como as montanhas.',
  },
  {
    name: 'Ar',
    nameEn: 'Air',
    symbol: '🌬️',
    qualities: ['Quente', 'Úmido', 'Expansivo'],
    sefirot: ['Chesed', 'Hod'],
    orixas: ['Iansã', 'Oxum'],
    tarot: ['O Louco', 'O Mago'],
    chakra: 'Anahata (4º)',
    direction: 'Norte',
    planet: 'Mercúrio',
    day: 'Quarta-feira',
    season: 'Primavera',
    traits: ['Comunicação', 'Liberdade', 'Intellecto', 'Versatilidade', 'Inconstância'],
    affirmation: 'Respiro liberdade e deixo meus pensamentos voarem altos.',
  },
  {
    name: 'Éter',
    nameEn: 'Aether',
    symbol: '✨',
    qualities: ['Puro', 'Transformador', 'Espiritual'],
    sefirot: ['Keter', 'Tiferet'],
    orixas: ['Oxalá'],
    tarot: ['O Sol', 'A Estrela'],
    chakra: 'Sahasrara (7º)',
    direction: 'Centro',
    planet: 'Sol',
    day: 'Domingo',
    season: 'Todo',
    traits: ['Espiritualidade', 'Purificação', 'Síntese', 'Devoção', 'Transcendência'],
    affirmation: 'Sou canal da luz divina que ilumina todas as esferas da existência.',
  },
];

function inferElement(birthDate?: string, odu?: string): { primary: typeof ELEMENTS[0]; secondary?: typeof ELEMENTS[0] } {
  // Infer from birth date (day of month)
  if (birthDate) {
    const day = new Date(birthDate).getDate();
    const elementIndex = day % 5;
    const primary = ELEMENTS[elementIndex];
    // Secondary is the opposing element
    const secondaryIndex = (elementIndex + 2) % 5;
    return { primary, secondary: ELEMENTS[secondaryIndex] };
  }

  // Infer from Odu
  if (odu) {
    const oduLower = odu.toLowerCase();
    if (['ogunda', 'ejionile', 'ejioko'].includes(oduLower)) {
      return { primary: ELEMENTS[0] }; // Fogo
    }
    if (['exu', 'elegbara', 'ará'].includes(oduLower)) {
      return { primary: ELEMENTS[3] }; // Ar
    }
    if (['oxum', 'yemanjá', 'nanã'].some(n => oduLower.includes(n))) {
      return { primary: ELEMENTS[1] }; // Água
    }
    if (['oxossi', 'logun'].some(n => oduLower.includes(n))) {
      return { primary: ELEMENTS[2] }; // Terra
    }
    if (['oxalá', 'orun'].some(n => oduLower.includes(n))) {
      return { primary: ELEMENTS[4] }; // Éter
    }
  }

  // Default to Éter (spirit)
  return { primary: ELEMENTS[4] };
}

export async function GET() {
  return NextResponse.json({
    endpoints: ['GET /api/elements', 'POST /api/elements'],
    methods: {
      GET: 'Returns API information and all elements',
      POST: 'Infers dominant element based on birthDate or odu',
    },
    elements: ELEMENTS.map(e => ({
      name: e.name,
      nameEn: e.nameEn,
      symbol: e.symbol,
      qualities: e.qualities,
      direction: e.direction,
      traits: e.traits,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ElementInput = await request.json();

    const { primary, secondary } = inferElement(body.birthDate, body.odu);

    return NextResponse.json({
      dominantElement: {
        name: primary.name,
        nameEn: primary.nameEn,
        symbol: primary.symbol,
        qualities: primary.qualities,
        sefirot: primary.sefirot,
        orixas: primary.orixas,
        tarot: primary.tarot,
        chakra: primary.chakra,
        direction: primary.direction,
        planet: primary.planet,
        day: primary.day,
        season: primary.season,
        traits: primary.traits,
        affirmation: primary.affirmation,
      },
      secondaryElement: secondary
        ? {
            name: secondary.name,
            nameEn: secondary.nameEn,
            symbol: secondary.symbol,
            qualities: secondary.qualities,
            direction: secondary.direction,
            traits: secondary.traits,
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
