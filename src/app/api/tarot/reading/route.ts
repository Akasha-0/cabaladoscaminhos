// ============================================================
// TAROT READING API - CABALA DOS CAMINHOS
// GET/POST endpoints for tarot readings
// Draws cards, generates interpretations, returns full reading
// ============================================================
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { drawCards } from '@/lib/tarot/cards';
import {
  getAllSpreadTypes,
  getSpread,
  type SpreadType,
  type SpreadPosition,
} from '@/lib/tarot/spreads';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether',
  'Chokhmah',
  'Binah',
  'Chesed',
  'Gevurah',
  'Tipheret',
  'Netzach',
  'Hod',
  'Yesod',
  'Malkuth',
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

// ─── Spiritual Correlations for Tarot ──────────────────────────────────────────
const MAJOR_ARCANA_SPIRITUAL_CORRELATIONS: Record<
  number,
  {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  }
> = {
  0: {
    sefirot: ['Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O véu se levanta e a sabedoria emerge',
    frequency: '963 Hz',
  }, // The Fool
  1: {
    sefirot: ['Chokhmah'],
    chakra: 6,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A sabedoria divina me guia',
    frequency: '741 Hz',
  }, // The Magician
  2: {
    sefirot: ['Binah'],
    chakra: 7,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A sabedoria das deusas flui em mim',
    frequency: '639 Hz',
  }, // The High Priestess
  3: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A Imperatriz abençoa minha criatividade',
    frequency: '528 Hz',
  }, // The Empress
  4: {
    sefirot: ['Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O Imperador traz ordem e estrutura',
    frequency: '528 Hz',
  }, // The Emperor
  5: {
    sefirot: ['Binah', 'Hod'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Iansã',
    affirmation: 'Hierofante ilumina o caminho sagrado',
    frequency: '528 Hz',
  }, // The Hierophant
  6: {
    sefirot: ['Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O lovers me guiam para união divina',
    frequency: '528 Hz',
  }, // The Lovers
  7: {
    sefirot: ['Gevurah'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'A coragem do guerreiro me fortalece',
    frequency: '528 Hz',
  }, // The Chariot
  8: {
    sefirot: ['Chesed', 'Gevurah'],
    chakra: 4,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A força interior supera todos os obstáculos',
    frequency: '528 Hz',
  }, // Strength
  9: {
    sefirot: ['Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Iansã',
    affirmation: 'O ermitão busca a luz interior',
    frequency: '741 Hz',
  }, // The Hermit
  10: {
    sefirot: ['Netzach', 'Hod'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A roda da fortuna gira a meu favor',
    frequency: '528 Hz',
  }, // Wheel of Fortune
  11: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'A justiça divina restaura o equilíbrio',
    frequency: '528 Hz',
  }, // Justice
  12: {
    sefirot: ['Yesod', 'Tipheret'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'O homem pendurado aceita o sacrifício',
    frequency: '417 Hz',
  }, // The Hanged Man
  13: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A morte traz transformação e renascimento',
    frequency: '417 Hz',
  }, // Death
  14: {
    sefirot: ['Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A temperança equilibra corpo e alma',
    frequency: '528 Hz',
  }, // Temperance
  15: {
    sefirot: ['Gevurah'],
    chakra: 1,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O diabo representa meus bloqueios',
    frequency: '396 Hz',
  }, // The Devil
  16: {
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'A torre cai para rebuild my foundation',
    frequency: '963 Hz',
  }, // The Tower
  17: {
    sefirot: ['Yesod', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A estrela me conecta à luz divina',
    frequency: '528 Hz',
  }, // The Star
  18: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A lua ilumina meus sonhos',
    frequency: '417 Hz',
  }, // The Moon
  19: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O sol brilha com verdade e alegria',
    frequency: '528 Hz',
  }, // The Sun
  20: {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O julgamento traz redenção',
    frequency: '963 Hz',
  }, // Judgement
  21: {
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O mundo se completa em unidade',
    frequency: '963 Hz',
  }, // The World
};

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const tarotReadingSchema = z.object({
  spreadType: z.enum(['celtic-cross', 'three-card', 'single-card']).default('single-card'),
  question: z.string().max(500).optional(),
  focusArea: z.string().max(200).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface DrawnCard {
  id: number;
  name: string;
  arcana: string;
  position: number;
  positionName: string;
  positionDescription: string;
  isReversed: boolean;
  uprightMeaning: string;
  reversedMeaning: string;
  interpretation: string;
  // fallow-ignore-next-line code-duplication
  keywords: string[];
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

interface TarotReadingResponse {
  reading: {
    id: string;
    timestamp: string;
    spreadType: SpreadType;
    spreadName: string;
    question?: string;
    focusArea?: string;
    totalCards: number;
  };
  cards: DrawnCard[];
  summary: string;
  spiritualCorrelations: typeof MAJOR_ARCANA_SPIRITUAL_CORRELATIONS;
  spiritualStats: {
    bySefirot: Record<string, number>;
    byChakra: Record<string, number>;
    byElement: Record<string, number>;
    byOrixa: Record<string, number>;
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateReadingId(): string {
  return `reading_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getSpiritualCorrelations(cardId: number, isReversed: boolean) {
  // Major arcana cards have specific correlations
  if (cardId >= 0 && cardId <= 21) {
    const corr = MAJOR_ARCANA_SPIRITUAL_CORRELATIONS[cardId];
    if (corr) {
      return isReversed
        ? {
            ...corr,
            affirmation: `${corr.affirmation} (energia internalizada)`,
          }
        : corr;
    }
  }

  // Minor arcana default correlations based on suit
  if (cardId >= 22 && cardId <= 35) {
    // Wands - Fire
    return {
      sefirot: ['Gevurah', 'Netzach'],
      chakra: 3,
      element: 'Fogo',
      orixa: 'Ogum',
      affirmation: 'A energia do fogo transforma',
      frequency: '528 Hz',
    };
  }
  if (cardId >= 36 && cardId <= 49) {
    // Cups - Water
    return {
      sefirot: ['Chesed', 'Tipheret'],
      chakra: 4,
      element: 'Água',
      orixa: 'Iemanjá',
      affirmation: 'As águas da emoção fluem',
      frequency: '528 Hz',
    };
  }
  if (cardId >= 50 && cardId <= 63) {
    // Swords - Air
    return {
      sefirot: ['Binah', 'Hod'],
      chakra: 5,
      element: 'Ar',
      orixa: 'Iansã',
      affirmation: 'A mente clareia com verdade',
      frequency: '741 Hz',
    };
  }
  // Pentacles - Earth
  return {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'A abundância terrestre se manifesta',
    frequency: '396 Hz',
  };
}

function generateInterpretation(
  cardName: string,
  cardArcana: string,
  isReversed: boolean,
  positionName: string,
  positionDescription: string,
  question?: string
): string {
  const orientation = isReversed ? 'reversa' : 'reta';
  const arcanoLabel = cardArcana === 'major' ? 'Arcanos Maiores' : 'Arcanos Menores';

  let interpretation = `A carta ${cardName} (${arcanoLabel}) surge em posição ${orientation}, influenciando a posição "${positionName}". `;
  interpretation += `${positionDescription}. `;

  if (question) {
    interpretation += `Considerando sua pergunta sobre "${question}", `;
  }

  if (isReversed) {
    interpretation += `Esta carta indica energias internalizadas, aspectos não expressos ou bloqueios que precisam de atenção. `;
  }

  return interpretation;
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================
// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spreadType = (searchParams.get('spreadType') as SpreadType) || 'single-card';
  const question = searchParams.get('question') || undefined;
  const focusArea = searchParams.get('focusArea') || undefined;

  // Filter params
  const sefirot = searchParams.get('sefirot');
  const chakra = searchParams.get('chakra');
  const element = searchParams.get('element');
  const orixa = searchParams.get('orixa');

  try {
    const spread = getSpread(spreadType);
    if (!spread) {
      return NextResponse.json(
        { success: false, error: `Spread type "${spreadType}" not found` },
        { status: 400 }
      );
    }

    const drawn = drawCards(spread.totalCards);
    const cards: DrawnCard[] = [];

    for (let i = 0; i < drawn.length; i++) {
      const card = drawn[i];

      const position = i + 1;
      const spreadPosition = spread.positions[i];
      const isReversed = Math.random() > 0.7;
      const spiritualCorr = getSpiritualCorrelations(card.id, isReversed);

      // Apply spiritual filters
      if (sefirot && !spiritualCorr.sefirot.includes(sefirot)) continue;
      if (chakra && spiritualCorr.chakra !== parseInt(chakra)) continue;
      if (element && spiritualCorr.element !== element) continue;
      if (orixa && spiritualCorr.orixa !== orixa) continue;

      cards.push({
        id: card.id,
        name: card.name,
        arcana: card.arcana,
        position,
        positionName: spreadPosition.name,
        positionDescription: spreadPosition.description,
        isReversed,
        uprightMeaning: card.upright.join(' '),
        reversedMeaning: card.reversed.join(' '),
        interpretation: generateInterpretation(
          card.name,
          card.arcana,
          isReversed,
          spreadPosition.name,
          spreadPosition.description,
          question
        ),
        keywords: [],
        sefirot: spiritualCorr.sefirot,
        chakra: spiritualCorr.chakra,
        element: spiritualCorr.element,
        orixa: spiritualCorr.orixa,
        affirmation: spiritualCorr.affirmation,
        frequency: spiritualCorr.frequency,
        spiritualCorrelations: spiritualCorr,
      });
    }

    // Calculate spiritual stats
    const spiritualStats = {
      bySefirot: cards.reduce(
        (acc, c) => {
          c.spiritualCorrelations.sefirot.forEach((s) => {
            acc[s] = (acc[s] || 0) + 1;
          });
          return acc;
        },
        {} as Record<string, number>
      ),
      byChakra: cards.reduce(
        (acc, c) => {
          const ch = c.spiritualCorrelations.chakra;
          if (ch) acc[ch] = (acc[ch] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byElement: cards.reduce(
        (acc, c) => {
          const e = c.spiritualCorrelations.element;
          if (e) acc[e] = (acc[e] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byOrixa: cards.reduce(
        (acc, c) => {
          const o = c.spiritualCorrelations.orixa;
          if (o) acc[o] = (acc[o] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    const summary =
      cards.length > 0
        ? `Uma tiragem de ${cards.length} cartas do tipo ${spread.name} revela insights sobre sua jornada espiritual.`
        : 'Nenhuma carta encontrada para os filtros especificados.';

    const response: TarotReadingResponse = {
      reading: {
        id: generateReadingId(),
        timestamp: new Date().toISOString(),
        spreadType: spread.id,
        spreadName: spread.name,
        question,
        focusArea,
        totalCards: cards.length,
      },
      cards,
      summary,
      spiritualCorrelations: MAJOR_ARCANA_SPIRITUAL_CORRELATIONS,
      spiritualStats,
    };

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('Tarot reading error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate tarot reading' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = tarotReadingSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { spreadType, question, focusArea } = parseResult.data;

    const spread = getSpread(spreadType);
    if (!spread) {
      return NextResponse.json(
        { success: false, error: `Spread type "${spreadType}" not found` },
        { status: 400 }
      );
    }

    const drawn = drawCards(spread.totalCards);
    const cards: DrawnCard[] = [];

    for (let i = 0; i < drawn.length; i++) {
      const card = drawn[i];

      const position = i + 1;
      const spreadPosition = spread.positions[i];
      const isReversed = Math.random() > 0.7;
      const spiritualCorr = getSpiritualCorrelations(card.id, isReversed);

      cards.push({
        id: card.id,
        name: card.name,
        arcana: card.arcana,
        position,
        positionName: spreadPosition.name,
        positionDescription: spreadPosition.description,
        isReversed,
        uprightMeaning: card.upright.join(' '),
        reversedMeaning: card.reversed.join(' '),
        interpretation: generateInterpretation(
          card.name,
          card.arcana,
          isReversed,
          spreadPosition.name,
          spreadPosition.description,
          question
        ),
        keywords: [],
        sefirot: spiritualCorr.sefirot,
        chakra: spiritualCorr.chakra,
        element: spiritualCorr.element,
        orixa: spiritualCorr.orixa,
        affirmation: spiritualCorr.affirmation,
        frequency: spiritualCorr.frequency,
        spiritualCorrelations: spiritualCorr,
      });
    }

    // Calculate spiritual stats
    const spiritualStats = {
      bySefirot: cards.reduce(
        (acc, c) => {
          c.spiritualCorrelations.sefirot.forEach((s) => {
            acc[s] = (acc[s] || 0) + 1;
          });
          return acc;
        },
        {} as Record<string, number>
      ),
      byChakra: cards.reduce(
        (acc, c) => {
          const ch = c.spiritualCorrelations.chakra;
          if (ch) acc[ch] = (acc[ch] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byElement: cards.reduce(
        (acc, c) => {
          const e = c.spiritualCorrelations.element;
          if (e) acc[e] = (acc[e] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byOrixa: cards.reduce(
        (acc, c) => {
          const o = c.spiritualCorrelations.orixa;
          if (o) acc[o] = (acc[o] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    const summary = `Uma tiragem de ${cards.length} cartas do tipo ${spread.name} revela insights sobre sua jornada espiritual.`;

    const response: TarotReadingResponse = {
      reading: {
        id: generateReadingId(),
        timestamp: new Date().toISOString(),
        spreadType: spread.id,
        spreadName: spread.name,
        question,
        focusArea,
        totalCards: cards.length,
      },
      cards,
      summary,
      spiritualCorrelations: MAJOR_ARCANA_SPIRITUAL_CORRELATIONS,
      spiritualStats,
    };

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error('Tarot reading error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate tarot reading' },
      { status: 500 }
    );
  }
}
