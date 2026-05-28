// ============================================================
// TAROT READING API - CABALA DOS CAMINHOS
// ============================================================
// GET/POST endpoints for tarot readings
// Draws cards, generates interpretations, returns full reading
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllSpreadTypes, getSpread, type SpreadType, type SpreadPosition } from '@/lib/tarot/spreads';
import { drawCards, getCard } from '@/lib/tarot/cards';

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const tarotReadingSchema = z.object({
  spreadType: z.enum(['celtic-cross', 'three-card', 'single-card']).default('single-card'),
  question: z.string().max(500).optional(),
  focusArea: z.string().max(200).optional(),
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
  keywords: string[];
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
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateReadingId(): string {
  return `reading_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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

  return interpretation.trim();
}

function generateReadingSummary(
  spreadName: string,
  cards: DrawnCard[],
  question?: string
): string {
  const cardNames = cards.map(c => c.name).join(', ');
  const cardCount = cards.length;

  let summary = `Leitura de ${spreadName} com ${cardCount} carta${cardCount > 1 ? 's' : ''}: ${cardNames}. `;

  if (question) {
    summary += `Pergunta: "${question}". `;
  }

  const majorCount = cards.filter(c => c.arcana === 'major').length;
  const reversedCount = cards.filter(c => c.isReversed).length;

  if (majorCount > 0) {
    summary += `${majorCount} carta${majorCount > 1 ? 's' : ''} dos Arcanos Maiores traz${majorCount === 1 ? '' : 'em'} influência significativa. `;
  }

  if (reversedCount > 0) {
    summary += `${reversedCount} carta${reversedCount > 1 ? 's' : ''} em posição reversa indic${reversedCount === 1 ? 'a' : 'am'} energias internalizadas ou questões não resolvidas.`;
  }

  return summary.trim();
}

function interpretCard(
  cardData: { id: number; name: string; arcana: 'major' | 'minor'; upright: string[]; reversed: string[] },
  position: SpreadPosition,
  isReversed: boolean,
  index: number
): Pick<DrawnCard, 'uprightMeaning' | 'reversedMeaning' | 'interpretation' | 'keywords'> {
  const meanings = isReversed ? cardData.reversed : cardData.upright;
  const baseInterpretation = meanings.length > 0 ? meanings[0] : 'Interpretação não disponível.';

  const keywords = meanings.length > 1 ? meanings.slice(0, 3) : [cardData.name.toLowerCase()];

  const orientation = isReversed ? 'reversa' : 'reta';
  const interpretation = `${cardData.name} em posição ${orientation} na posição "${position.name}" — ${baseInterpretation}`;

  return {
    uprightMeaning: cardData.upright.join('; '),
    reversedMeaning: cardData.reversed.join('; '),
    interpretation,
    keywords,
  };
}

// ============================================================
// API ROUTE HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validation = tarotReadingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { spreadType, question, focusArea } = validation.data;
    const spread = getSpread(spreadType);

    // Draw cards for the spread
    const drawnCards = drawCards(spread.totalCards);

    // Build full reading with positions
    const cards: DrawnCard[] = drawnCards.map((card, index) => {
      const position = spread.positions[index];
      const isReversed = Math.random() < 0.25; // ~25% chance of reversal

      const cardData = getCard(card.id) || {
        id: card.id,
        name: card.name,
        arcana: 'major' as const,
        upright: ['Interpretação padrão'],
        reversed: ['Interpretação padrão'],
      };

      const { uprightMeaning, reversedMeaning, interpretation, keywords } = interpretCard(
        cardData,
        position,
        isReversed,
        index
      );

      return {
        id: card.id,
        name: card.name,
        arcana: card.arcana,
        position: position.position,
        positionName: position.name,
        positionDescription: position.description,
        isReversed,
        uprightMeaning,
        reversedMeaning,
        interpretation,
        keywords,
      };
    });

    const summary = generateReadingSummary(spread.name, cards, question);

    const response: TarotReadingResponse = {
      reading: {
        id: generateReadingId(),
        timestamp: new Date().toISOString(),
        spreadType,
        spreadName: spread.name,
        question,
        focusArea,
        totalCards: cards.length,
      },
      cards,
      summary,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Tarot reading error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar leitura de tarot' },
      { status: 500 }
    );
  }
}

// GET endpoint to get available spread types
export async function GET() {
  const spreadTypes = getAllSpreadTypes();
  const spreads = spreadTypes.map(type => getSpread(type));

  return NextResponse.json({
    availableSpreads: spreads,
    totalSpreads: spreads.length,
  });
}
