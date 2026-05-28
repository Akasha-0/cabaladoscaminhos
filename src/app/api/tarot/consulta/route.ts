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

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const tarotConsultaSchema = z.object({
  spreadType: z.enum(['single-card', 'three-card', 'celtic-cross'] as const),
  question: z.string().min(1).max(500).optional(),
  includeReversed: z.boolean().default(true),
});

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
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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
    ? ` ${reversedCount} carta(s) invertida(s) sugere(m) energia bloqueada ou interiorizada.` 
    : '';
  
  return baseSummary + reversalNote;
}

// ============================================================
// API ROUTE HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = tarotConsultaSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.flatten()
        },
        { status: 400 }
      );
    }
    
    const { spreadType, question, includeReversed } = validation.data;
    
    // Validate spread type
    const validSpreadTypes = getAllSpreadTypes();
    if (!validSpreadTypes.includes(spreadType)) {
      return NextResponse.json(
        { 
          error: `Invalid spread type. Must be one of: ${validSpreadTypes.join(', ')}`
        },
        { status: 400 }
      );
    }
    
    // Get spread configuration
    const spread = getSpread(spreadType);
    
    // Draw cards
    const drawnCards = drawCards(spread.totalCards);
    
    // Build card positions with orientation
    const cardsWithPositions: DrawnCard[] = drawnCards.map((card, index) => {
      const position = spread.positions[index];
      const isReversed = includeReversed ? Math.random() < 0.25 : false;
      
      return {
        cardId: card.id,
        name: card.name,
        arcana: card.arcana,
        suit: card.suit,
        number: card.number,
        isReversed,
        position: index + 1,
        positionName: position.name,
        positionDescription: position.description,
        upright: card.upright,
        reversed: card.reversed,
      };
    });
    
    // Generate interpretations
    const interpretations = cardsWithPositions.map(card => {
      const position = spread.positions[card.position - 1];
      return generateCardInterpretation(card, position);
    });
    
    // Build response
    const response: TarotConsultaResponse = {
      spread: {
        id: spread.id,
        name: spread.name,
        description: spread.description,
        totalCards: spread.totalCards,
      },
      cards: cardsWithPositions,
      ...(question && { question }),
      summary: generateReadingSummary(spread, cardsWithPositions),
    };
    
    return NextResponse.json({
      success: true,
      data: response,
      interpretations,
    });
    
  } catch (error) {
    console.error('Tarot consultation error:', error);
    return NextResponse.json(
      { error: 'Failed to process tarot consultation' },
      { status: 500 }
    );
  }
}

// GET endpoint to get available spread types
export async function GET() {
  const spreadTypes = getAllSpreadTypes();
  const spreads = spreadTypes.map(type => getSpread(type));
  
  return NextResponse.json({
    success: true,
    data: {
      spreads,
      totalCards: 78,
      arcanaMajors: 22,
      arcanaMinors: 56,
    },
  });
}