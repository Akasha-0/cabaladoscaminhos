/**
 * Lenormand Mesa Real API - Cabala dos Caminhos
 * Enhanced with cross-tradition spiritual correlations
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LENORMAND_CARDS, getCardByNumero, CASAS_TEMATICAS } from '@/lib/lenormand/data';
import { realizarLeitura, MESA_REAL_SPREADS } from '@/lib/lenormand/mesa-real';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const LenormandFormatSchema = z.enum(['8x4+4', '9x4']);
const CardPositionSchema = z.object({
  posicao: z.number().int().min(1),
  carta: z.number().int().min(1).max(36),
  nome: z.string(),
  significado: z.string(),
  orientacao: z.enum(['normal', 'invertida']).optional().default('normal'),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const LenormandReadingSchema = z.object({
  format: z.string(),
  cards: z.array(CardPositionSchema),
  timestamp: z.string(),
  seed: z.number().optional(),
});

const LenormandQuerySchema = z.object({
  format: LenormandFormatSchema.optional(),
  includeCards: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

const LenormandBodySchema = z.object({
  format: LenormandFormatSchema.optional().default('8x4+4'),
  seed: z.number().optional(),
  pergunta: z.string().optional(),
});

// ─── Lenormand Card Correlations with Spiritual Data ──────────────────────────────────────────
const LENORMAND_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}> = {
  1: { sefirot: ['Kether'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'O início divino está em mim' },
  2: { sefirot: ['Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A sabedoria me guia' },
  3: { sefirot: ['Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Recebo com gratidão' },
  4: { sefirot: ['Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A abundância flui em mim' },
  5: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Tenho força para superar' },
  6: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Harmonia habita em meu ser' },
  7: { sefirot: ['Netzach'], chakra: 4, element: 'Fogo', orixa: 'Iansã', affirmation: 'A vitória é minha' },
  8: { sefirot: ['Hod'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A comunicação flui claramente' },
  9: { sefirot: ['Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Minha intuição é clara' },
  10: { sefirot: ['Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Sou seguro em minha jornada' },
  11: { sefirot: ['Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor me sustenta' },
  12: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'Tenho coragem para enfrentar' },
  13: { sefirot: ['Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A cura acontece em mim' },
  14: { sefirot: ['Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Sou nutrido pela terra' },
  15: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Guardo-me com proteção divina' },
  16: { sefirot: ['Tipheret'], chakra: 5, element: 'Fogo', orixa: 'Oxalá', affirmation: 'A morte traz renovação' },
  17: { sefirot: ['Netzach'], chakra: 4, element: 'Fogo', orixa: 'Iansã', affirmation: 'A esperança me sustenta' },
  18: { sefirot: ['Hod'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A mentira não me engana' },
  19: { sefirot: ['Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A alegria de viver me preenche' },
  20: { sefirot: ['Malkuth'], chakra: 1, element: 'Terra', orixa: 'Iemanjá', affirmation: 'O lar é meu santuário' },
  21: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Cortego meus obstáculos' },
  22: { sefirot: ['Netzach'], chakra: 4, element: 'Fogo', orixa: 'Iansã', affirmation: 'Os florescem em minha vida' },
  23: { sefirot: ['Malkuth'], chakra: 1, element: 'Terra', orixa: 'Oxalá', affirmation: 'O tempo sagrado honored' },
  24: { sefirot: ['Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Trabalho em paz e propósito' },
  25: { sefirot: ['Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Grandes bênçãos me cercam' },
  26: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Cartas importantes chegam' },
  27: { sefirot: ['Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'O homem representa meu caminho' },
  28: { sefirot: ['Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A mulher representa minha intuição' },
  29: { sefirot: ['Kether'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'O lírio branco floresce em mim' },
  30: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O sol brilha em meu coração' },
  31: { sefirot: ['Malkuth'], chakra: 1, element: 'Lua', orixa: 'Iemanjá', affirmation: 'A lua reflete minha verdade' },
  32: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'A tempestade passa, a paz retorna' },
  33: { sefirot: ['Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A chave abre portas para mim' },
  34: { sefirot: ['Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Anéis de compromisso me fortalecem' },
  35: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Os corvos trazem mensagens' },
  36: { sefirot: ['Kether'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A jornada espiritual me completa' },
};

// ─── Thematic Houses with Spiritual Correlations ──────────────────────────────────────────
const THEMATIC_HOUSES_SPIRITUAL = CASAS_TEMATICAS.map((house, index) => ({
  ...house,
  sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'].slice(0, Math.ceil((index + 1) / 4)),
  element: ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'][index % 5],
  chakra: ((index % 7) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
}));

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = LenormandQuerySchema.safeParse({
      format: searchParams.get('format'),
      includeCards: searchParams.get('includeCards'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { format, includeCards, sefirot, chakra, element } = parseResult.data;

    const spreads = Object.entries(MESA_REAL_SPREADS).map(([key, s]) => ({
      id: key,
      format: s,
      positions: s.positions?.length ?? 0,
    }));

    const response: Record<string, unknown> = {
      success: true,
      totalCards: LENORMAND_CARDS.length,
      spreads,
      thematicHouses: THEMATIC_HOUSES_SPIRITUAL,
    };

    if (includeCards || !format) {
      // Add spiritual correlations to card names
      response.cardNames = LENORMAND_CARDS.map((nome, i) => {
        const cardNum = i + 1;
        const corr = LENORMAND_CORRELATIONS[cardNum];
        return {
          numero: cardNum,
          nome,
          tipo: 'cigano',
          sefirot: corr?.sefirot || [],
          chakra: corr?.chakra,
          element: corr?.element,
          orixa: corr?.orixa,
          affirmation: corr?.affirmation,
        };
      });
    }

    // Statistics
    const stats = {
      byElement: Object.values(LENORMAND_CORRELATIONS).reduce((acc, c) => {
        acc[c.element] = (acc[c.element] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: Object.values(LENORMAND_CORRELATIONS).reduce((acc, c) => {
        acc[c.chakra] = (acc[c.chakra] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      bySefirot: Object.values(LENORMAND_CORRELATIONS).reduce((acc, c) => {
        c.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      totalCards: LENORMAND_CARDS.length,
    };

    response.stats = stats;

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao processar lenormand' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = LenormandBodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { format, seed, pergunta } = parseResult.data;
    if (!MESA_REAL_SPREADS[format]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid format',
        validFormats: Object.keys(MESA_REAL_SPREADS),
      }, { status: 400 });
    }

    const reading = realizarLeitura(format, seed);

    // Add spiritual correlations to reading cards
    const enrichedCards = reading.map(card => {
      const corr = LENORMAND_CORRELATIONS[card.carta];
      return {
        ...card,
        sefirot: corr?.sefirot || [],
        chakra: corr?.chakra,
        element: corr?.element,
        orixa: corr?.orixa,
        affirmation: corr?.affirmation,
      };
    });

    return NextResponse.json({
      success: true,
      format,
      pergunta,
      cards: enrichedCards,
      timestamp: new Date().toISOString(),
      spiritualCorrelations: {
        cardsSefirot: enrichedCards.flatMap(c => c.sefirot || []),
        cardsChakras: enrichedCards.map(c => c.chakra).filter(Boolean),
        cardsElements: [...new Set(enrichedCards.map(c => c.element).filter(Boolean))],
        cardsOrixas: [...new Set(enrichedCards.map(c => c.orixa).filter(Boolean))],
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Reading error' }, { status: 500 });
  }
}