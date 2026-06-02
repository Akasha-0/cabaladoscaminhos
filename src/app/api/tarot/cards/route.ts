import {
  reduceToSingleDigit,
  getMasterNumbers,
  getNumerologyElement,
  getNumerologyChakra,
  getElementKeywords,
} from '@/lib/tarot/shared-card-data';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TAROT_DECK } from '@/lib/tarot/cards';
const tarotCards = TAROT_DECK.cards;
// ─── Zod Schema ───────────────────────────────────────────────────────────
const TarotQuerySchema = z.object({
  action: z.enum(['card', 'random', 'arcano', 'numerology', 'element', 'astrology']).optional(),
  id: z.coerce.number().int().positive().optional(),
  arcano: z.enum(['maior', 'menor']).optional(),
  nome: z.string().optional(),
  elemento: z.enum(['fogo', 'agua', 'terra', 'ar']).optional(),
});
// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // Validate query params with Zod
  const parseResult = TarotQuerySchema.safeParse({
    action: searchParams.get('action'),
    id: searchParams.get('id'),
    arcano: searchParams.get('arcano'),
    nome: searchParams.get('nome'),
    elemento: searchParams.get('elemento'),
  });
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
  const { action } = parseResult.data;
  try {
    switch (action) {
      case 'card':
        return handleGetCard(searchParams);
      case 'random':
        return handleGetRandomCard(searchParams);
      case 'arcano':
        return handleGetByArcano(searchParams);
      case 'numerology':
        return handleGetCardNumerology(searchParams);
      case 'element':
        return handleGetCardElement(searchParams);
      case 'astrology':
        return handleGetCardAstrology(searchParams);
      default:
        return handleGetAllCards(searchParams);
    }
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// HANDLER FUNCTIONS
// ============================================================

function handleGetAllCards(searchParams: URLSearchParams) {
  const arcano = searchParams.get('arcano');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '78', 10);

  let cards = [...tarotCards];

  // Filter by arcano (major/minor)
  if (arcano) {
    cards = cards.filter(card => card.arcana.toLowerCase() === arcano.toLowerCase());
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const paginatedCards = cards.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    success: true,
    data: {
      cards: paginatedCards,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(cards.length / limit),
        totalCards: cards.length,
        hasNextPage: startIndex + limit < cards.length,
        hasPrevPage: page > 1,
      },
    },
  });
}
// fallow-ignore-next-line complexity
function handleGetCard(searchParams: URLSearchParams) {
  const idParam = searchParams.get('id');
  const name = searchParams.get('name');

  if (!idParam && !name) {
    return NextResponse.json(
      { success: false, error: { message: 'Parameter id or name is required', code: 'MISSING_PARAM' } },
      { status: 400 }
    );
  }

  let card;

  if (idParam) {
    const id = parseInt(idParam, 10);
    if (isNaN(id) || id < 0 || id > 77) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid id. Use 0-77 for tarot.', code: 'INVALID_PARAM' } },
        { status: 400 }
      );
    }
    card = tarotCards.find(c => c.id === id);
  } else if (name) {
    card = tarotCards.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (!card) {
    return NextResponse.json(
      { success: false, error: { message: 'Card not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { card },
  });
}

function handleGetRandomCard(searchParams: URLSearchParams) {
  const arcano = searchParams.get('arcano');
  const quantity = parseInt(searchParams.get('quantity') || '1', 10);

  let pool = [...tarotCards];

  if (arcano) {
    pool = pool.filter(card => card.arcana.toLowerCase() === arcano.toLowerCase());
  }

  // Fisher-Yates shuffle and take requested quantity
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(quantity, pool.length));

  // Add position for each card (upright or reversed)
  const cardsWithPosition = selected.map(card => ({
    ...card,
    position: Math.random() > 0.5 ? 'upright' : 'reversed',
  }));

  return NextResponse.json({
    success: true,
    data: {
      cards: cardsWithPosition,
      quantity: cardsWithPosition.length,
    },
  });
}

function handleGetByArcano(searchParams: URLSearchParams) {
  const arcano = searchParams.get('arcano');

  if (!arcano) {
    return NextResponse.json(
      { success: false, error: { message: 'Parameter arcano is required', code: 'MISSING_PARAM' } },
      { status: 400 }
    );
  }

  const normalizedArcano = arcano.toLowerCase();
  const cards = tarotCards.filter(card => card.arcana.toLowerCase() === normalizedArcano);

  if (cards.length === 0) {
    return NextResponse.json(
      { success: false, error: { message: `Arcana "${arcano}" not found`, code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      arcano: arcano.charAt(0).toUpperCase() + arcano.slice(1),
      totalCards: cards.length,
      cards,
    },
  });
}

function handleGetCardNumerology(searchParams: URLSearchParams) {
  const idParam = searchParams.get('id');

  if (!idParam) {
    return NextResponse.json(
      { success: false, error: { message: 'Parameter id is required', code: 'MISSING_PARAM' } },
      { status: 400 }
    );
  }

  const id = parseInt(idParam, 10);

  if (isNaN(id) || id < 0 || id > 77) {
    return NextResponse.json(
      { success: false, error: { message: 'Invalid id', code: 'INVALID_PARAM' } },
      { status: 400 }
    );
  }

  // Calculate numerological values
  const singleDigit = reduceToSingleDigit(id);
  const masterNumbers = getMasterNumbers(id);
  const element = getNumerologyElement(id);
  const chakra = getNumerologyChakra(id);

  return NextResponse.json({
    success: true,
    data: {
      cardId: id,
      numerology: {
        singleDigit,
        isMasterNumber: masterNumbers.length > 0,
        masterNumbers,
        element,
        associatedChakra: chakra,
        vibrationalEnergy: id * 9,
      },
    },
  });
}

function handleGetCardElement(searchParams: URLSearchParams) {
  const idParam = searchParams.get('id');

  if (!idParam) {
    return NextResponse.json(
      { success: false, error: { message: 'Parameter id is required', code: 'MISSING_PARAM' } },
      { status: 400 }
    );
  }

  const id = parseInt(idParam, 10);
  const card = tarotCards.find(c => c.id === id);

  if (!card) {
    return NextResponse.json(
      { success: false, error: { message: 'Card not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      cardId: id,
      cardName: card.name,
      element: card.element || 'Spirit',
      keywords: card.element ? getElementKeywords(card.element) : ['spiritual connection', 'integration'],
    },
  });
}

function handleGetCardAstrology(searchParams: URLSearchParams) {
  const idParam = searchParams.get('id');

  if (!idParam) {
    return NextResponse.json(
      { success: false, error: { message: 'Parameter id is required', code: 'MISSING_PARAM' } },
      { status: 400 }
    );
  }

  const id = parseInt(idParam, 10);
  const card = tarotCards.find(c => c.id === id);

  if (!card) {
    return NextResponse.json(
      { success: false, error: { message: 'Card not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  // Extract modality from astro sign
  const modality = getModalityFromSign(card.astro || '');

  return NextResponse.json({
    success: true,
    data: {
      cardId: id,
      cardName: card.name,
      astrology: {
        sign: card.astro || 'N/A',
        element: card.element || 'N/A',
        modality,
      },
    },
  });
}

// ============================================================
// HELPER FUNCTIONS

function getModalityFromSign(astro: string): string {
  const modalities: Record<string, string> = {
    Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
    Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
    Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
    Sun: 'Fixed', Moon: 'Cardinal', Mercury: 'Mutable', Venus: 'Fixed',
    Mars: 'Cardinal', Jupiter: 'Mutable', Saturn: 'Cardinal',
    Uranus: 'Fixed', Neptune: 'Mutable', Pluto: 'Fixed',
  };
  return modalities[astro] || 'N/A';
}