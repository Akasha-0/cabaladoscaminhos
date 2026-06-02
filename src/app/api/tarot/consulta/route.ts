import { calculateSpreadSpiritualStats } from '@/lib/tarot/spread-calculator';
import { handleAPIError } from '@/lib/api/error-handler';
// ============================================================
// TAROT CONSULTATION API - CABALA DOS CAMINHOS
// ============================================================
// POST endpoint for tarot card consultation
// Validates spread type, draws cards, returns interpretations
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { drawCards } from '@/lib/tarot/cards';
import { getSpread, getAllSpreadTypes, type SpreadType, type SpreadPosition } from '@/lib/tarot/spreads';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const tarotConsultaSchema = z.object({
  spreadType: z.enum(['single-card', 'three-card', 'celtic-cross'] as const),
  question: z.string().min(1).max(500).optional(),
  includeReversed: z.boolean().default(true),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Tarot Readings ──────────────────────────────────────────
const READING_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'single-card': {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Recebo a mensagem divina com clareza',
    frequency: '963 Hz',
  },
  'three-card': {
    sefirot: ['Binah', 'Tipheret', 'Chokhmah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'O passado, presente e futuro se revelam',
    frequency: '741 Hz',
  },
  'celtic-cross': {
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A totalidade da minha situação se revela',
    frequency: '963 Hz',
  },
};

// ─── Card Spiritual Correlations (Major Arcana) ──────────────────────────────────────────
const MAJOR_ARCANA_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  0: { sefirot: ['Kether'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'O inicio divino está em mim', frequency: '963 Hz' }, // The Fool
  1: { sefirot: ['Chokhmah'], chakra: 6, element: 'Éter', orixa: 'Oxalá', affirmation: 'A sabedoria divina me guia', frequency: '741 Hz' }, // The Magician
  2: { sefirot: ['Binah'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'A sabedoria das deusas flui em mim', frequency: '639 Hz' }, // The High Priestess
  3: { sefirot: ['Chokhmah', 'Binah'], chakra: 6, element: 'Fogo', orixa: 'Oxum', affirmation: 'A Imperatriz abençoa minha criatividade', frequency: '528 Hz' }, // The Empress
  4: { sefirot: ['Chesed'], chakra: 4, element: 'Fogo', orixa: 'Ogum', affirmation: 'O Imperador traz ordem e estrutura', frequency: '528 Hz' }, // The Emperor
  5: { sefirot: ['Binah', 'Hod'], chakra: 5, element: 'Fogo', orixa: 'Iansã', affirmation: 'Hierofante ilumina o caminho sagrado', frequency: '528 Hz' }, // The Hierophant
  6: { sefirot: ['Netzach'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O lovers me guiam para uniao divina', frequency: '528 Hz' }, // The Lovers
  7: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'A coragem do guerreiro me fortalece', frequency: '528 Hz' }, // The Chariot
  8: { sefirot: ['Chesed', 'Gevurah'], chakra: 4, element: 'Água', orixa: 'Iemanjá', affirmation: 'A forca interior supera todos os obstaculos', frequency: '528 Hz' }, // Strength
  9: { sefirot: ['Hod'], chakra: 5, element: 'Ar', orixa: 'Iansã', affirmation: 'O ermitao busca a luz interior', frequency: '741 Hz' }, // The Hermit
  10: { sefirot: ['Netzach', 'Hod'], chakra: 6, element: 'Fogo', orixa: 'Oxum', affirmation: 'A roda da fortuna gira a meu favor', frequency: '528 Hz' }, // Wheel of Fortune
  11: { sefirot: ['Gevurah', 'Netzach'], chakra: 3, element: 'Terra', orixa: 'Nanã', affirmation: 'A justica divina restaura o equilibrio', frequency: '528 Hz' }, // Justice
  12: { sefirot: ['Yesod', 'Tipheret'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'O homem pendurado aceita o sacrifício', frequency: '417 Hz' }, // The Hanged Man
  13: { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Água', orixa: 'Iemanjá', affirmation: 'A morte traz transformacao e renascimento', frequency: '417 Hz' }, // Death
  14: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A temperanca equilibra corpo e alma', frequency: '528 Hz' }, // Temperance
  15: { sefirot: ['Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'O diabo representa meus bloqueios', frequency: '396 Hz' }, // The Devil
  16: { sefirot: ['Kether', 'Malkuth'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'A torre cai para reconstruir minha base', frequency: '963 Hz' }, // The Tower
  17: { sefirot: ['Yesod', 'Netzach'], chakra: 6, element: 'Fogo', orixa: 'Oxum', affirmation: 'A estrela me conecta a luz divina', frequency: '528 Hz' }, // The Star
  18: { sefirot: ['Binah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A lua ilumina meus sonhos', frequency: '417 Hz' }, // The Moon
  19: { sefirot: ['Tipheret', 'Netzach'], chakra: 6, element: 'Fogo', orixa: 'Oxum', affirmation: 'O sol brilha com verdade e alegria', frequency: '528 Hz' }, // The Sun
  20: { sefirot: ['Kether', 'Tipheret'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'O julgamento traz redencao', frequency: '963 Hz' }, // Judgement
  21: { sefirot: ['Kether', 'Malkuth'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'O mundo se completa em unidade', frequency: '963 Hz' }, // The World
};

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface DrawnCard {
  cardId: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: string;
  number?: number;
  isReversed: boolean;
  position: number;
  positionName: string;
  positionDescription: string;
  upright: string[];
  reversed: string[];
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

interface TarotConsultaResponse {
  spread: {
    id: SpreadType;
    name: string;
    description: string;
    totalCards: number;
  };
  cards: DrawnCard[];
  question?: string;
  summary: string;
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: typeof READING_SPIRITUAL_CORRELATIONS[string];
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

// fallow-ignore-next-line complexity
function getCardSpiritualCorrelations(cardId: number, isReversed: boolean) {
  // Major arcana (0-21)
  if (cardId >= 0 && cardId <= 21) {
    const corr = MAJOR_ARCANA_SPIRITUAL_CORRELATIONS[cardId];
    if (corr) {
      return isReversed ? {
        ...corr,
        affirmation: `${corr.affirmation} (energia internalizada)`,
      } : corr;
    }
  }

  // Minor arcana based on suit
  if (cardId >= 22 && cardId <= 35) { // Wands - Fire
    return {
      sefirot: ['Gevurah', 'Netzach'],
      chakra: 3,
      element: 'Fogo',
      orixa: 'Ogum',
      affirmation: 'A energia do fogo transforma',
      frequency: '528 Hz',
    };
  }
  if (cardId >= 36 && cardId <= 49) { // Cups - Water
    return {
      sefirot: ['Chesed', 'Tipheret'],
      chakra: 4,
      element: 'Água',
      orixa: 'Iemanjá',
      affirmation: 'As águas da emoção fluem',
      frequency: '528 Hz',
    };
  }
  if (cardId >= 50 && cardId <= 63) { // Swords - Air
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
    affirmation: 'A abundancia terrestre se manifesta',
    frequency: '396 Hz',
  };
}
// fallow-ignore-next-line complexity

function generateCardInterpretation(
  card: DrawnCard,
  position: SpreadPosition
): string {
  const meanings = card.isReversed ? card.reversed : card.upright;
  const orientation = card.isReversed ? 'Invertido' : 'Em pé';
  
  if (card.isReversed && position.orientation === 'upright') {
    return `${card.name} surgiu invertido na posição de "${position.name}". ${meanings.join(' ')} Reflita sobre o que impide essa energia de fluir em sua vida.`;
  }
  
  if (!card.isReversed && position.orientation === 'reversed') {
    return `${card.name} surgiu em pé na posição de "${position.name}" (que tradicionalmente pede uma carta invertida). ${meanings.join(' ')} Há uma ênfase especial nesta energia em sua vida.`;
  }
  
  return `${card.name} (${orientation}) em "${position.name}": ${meanings.join(' ')}`;
}

function generateReadingSummary(
  spread: { id: SpreadType; name: string },
  cards: DrawnCard[]
): string {
  const cardNames = cards.map(c => c.name).join(', ');
  const reversedCount = cards.filter(c => c.isReversed).length;
  
  const baseSummary = `Leitura de ${spread.name} com ${cards.length} cartas: ${cardNames}.`;
  const reversalNote = reversedCount > 0 
    ? ` Foram encontradas ${reversedCount} carta(s) invertida(s), indicando energias internalizadas ou bloqueios.` 
    : '';
  
  return baseSummary + reversalNote;
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================
// fallow-ignore-next-line complexity

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = tarotConsultaSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { spreadType, question, includeReversed } = parseResult.data;

    const spread = getSpread(spreadType);
    if (!spread) {
      return NextResponse.json({
        success: false,
        error: `Spread type "${spreadType}" not found`,
      }, { status: 400 });
    }

    const drawn = drawCards(spread.totalCards);
    const cards: DrawnCard[] = [];

    for (let i = 0; i < drawn.length; i++) {
      const tarotCard = drawn[i];
      const cardId = tarotCard.id;
      const position = i + 1;
      const spreadPosition = spread.positions[i];
      const isReversed = includeReversed && Math.random() > 0.7;
      const spiritualCorr = getCardSpiritualCorrelations(cardId, isReversed);

      // Create basic card object for meaning lookup
      const cardData = {
        cardId,
        name: tarotCard.name,
        arcana: tarotCard.arcana,
        isReversed,
        upright: tarotCard.upright,
        reversed: tarotCard.reversed,
      };

      cards.push({
        ...cardData,
        position,
        positionName: spreadPosition.name,
        positionDescription: spreadPosition.description,
        spiritualCorrelations: spiritualCorr,
      });
    }

    // Get spiritual correlations for the reading
    const readingCorr = READING_SPIRITUAL_CORRELATIONS[spreadType] || READING_SPIRITUAL_CORRELATIONS['single-card'];

    // Calculate spiritual stats using shared utility
    const spiritualStats = calculateSpreadSpiritualStats(cards);

    const response: TarotConsultaResponse = {
      spread: {
        id: spread.id,
        name: spread.name,
        description: spread.description || `Leitura de ${spread.name}`,
        totalCards: cards.length,
      },
      cards,
      question,
      summary: generateReadingSummary(spread, cards),
      sefirot: readingCorr.sefirot,
      chakra: readingCorr.chakra,
      element: readingCorr.element,
      orixa: readingCorr.orixa,
      affirmation: readingCorr.affirmation,
      frequency: readingCorr.frequency,
      spiritualCorrelations: readingCorr,
      spiritualStats,
    };

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    return handleAPIError(error, { message: 'Failed to generate tarot consultation' });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as SpreadType | null;
  const sefirot = searchParams.get('sefirot');
  const chakra = searchParams.get('chakra');
  const element = searchParams.get('element');
  const orixa = searchParams.get('orixa');

  const spreads = getAllSpreadTypes();

  let filteredSpreads = spreads.map(spreadType => ({
    ...getSpread(spreadType),
    spiritualCorrelations: READING_SPIRITUAL_CORRELATIONS[spreadType] || READING_SPIRITUAL_CORRELATIONS['single-card'],
  }));

  // Apply spiritual filters
  if (sefirot) {
    filteredSpreads = filteredSpreads.filter(s => 
      s.spiritualCorrelations.sefirot.includes(sefirot)
    );
  }
  if (chakra) {
    filteredSpreads = filteredSpreads.filter(s => 
      s.spiritualCorrelations.chakra === parseInt(chakra)
    );
  }
  if (element) {
    filteredSpreads = filteredSpreads.filter(s => 
      s.spiritualCorrelations.element === element
    );
  }
  if (orixa) {
    filteredSpreads = filteredSpreads.filter(s => 
      s.spiritualCorrelations.orixa === orixa
    );
  }

  return NextResponse.json({
    success: true,
    spreads: filteredSpreads,
    count: filteredSpreads.length,
    spiritualCorrelations: READING_SPIRITUAL_CORRELATIONS,
    meta: {
      filters: { sefirot, chakra, element, orixa },
    },
  });
}