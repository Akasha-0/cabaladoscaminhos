// ============================================================
// TAROT READINGS API - CABALA DOS CAMINHOS
// ============================================================
// GET/POST endpoints for tarot readings management
// List readings, create new readings, get reading by id
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCard, drawCards } from '@/lib/tarot/cards';

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const createReadingSchema = z.object({
  spreadType: z.enum(['single', 'three', 'celtic', 'horseshoe', 'star', 'tree']).default('single'),
  question: z.string().optional(),
  userId: z.string().optional(),
});

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface SpreadPosition {
  name: string;
  description: string;
  index: number;
}

interface DrawnCard {
  cardId: number;
  cardName: string;
  arcana: 'major' | 'minor';
  suit?: string;
  isReversed: boolean;
  position: SpreadPosition;
  uprightMeaning: string[];
  reversedMeaning: string[];
  interpretation: string;
  keywords: string[];
}

export interface TarotReading {
  id: string;
  spreadType: string;
  spreadName: string;
  cards: DrawnCard[];
  question?: string;
  summary: string;
  createdAt: string;


// ============================================================
// IN-MEMORY STORE (production would use a database)
// ============================================================

const readingsStore = new Map<string, TarotReading>();

// ============================================================
// SPREAD CONFIGURATIONS
// ============================================================

const SPREADS: Record<string, { name: string; positions: SpreadPosition[] }> = {
  single: {
    name: 'Carta Única',
    positions: [
      { name: 'Presente', description: 'A energia atual ao redor da situação', index: 0 },
    ],
  },
  three: {
    name: 'Trilogia',
    positions: [
      { name: 'Passado', description: 'Forças e eventos que influenciam o presente', index: 0 },
      { name: 'Presente', description: 'A energia atual da situação', index: 1 },
      { name: 'Futuro', description: 'Possível desdobramento se nada mudar', index: 2 },
    ],
  },
  celtic: {
    name: 'Cruz Céltica',
    positions: [
      { name: 'Situação Atual', description: 'O centro do problema ou oportunidade', index: 0 },
      { name: 'Obstáculo', description: 'O desafio que precisa ser superado', index: 1 },
      { name: 'Base', description: 'A.foundation que sustenta a situação', index: 2 },
      { name: 'Passado', description: 'Eventos recentes ou remotos que afetam', index: 3 },
      { name: 'Coroa', description: 'Influência emergente ou inconsciente', index: 4 },
      { name: 'Futuro', description: 'Tendência provável sem intervenção', index: 5 },
      { name: 'Mais Próximo', description: 'O ambiente imediato ao redor', index: 6 },
      { name: 'Minha Postura', description: 'Como a pessoa se posiciona', index: 7 },
      { name: 'Esperanças e Medos', description: 'Desejos secretos e receios', index: 8 },
      { name: 'Resultado Final', description: 'Resolução provável do arco', index: 9 },
    ],
  },
  horseshoe: {
    name: 'Ferradura',
    positions: [
      { name: 'Passado', description: 'O que ficou para trás', index: 0 },
      { name: 'Mais Próximo do Passado', description: 'Área de transição', index: 1 },
      { name: 'Presente', description: 'O coração da questão', index: 2 },
      { name: 'Mais Próximo do Futuro', description: 'Área de transição', index: 3 },
      { name: 'Futuro', description: 'Tendência emergente', index: 4 },
      { name: 'Influência 1', description: 'Fator externo', index: 5 },
      { name: 'Influência 2', description: 'Fator externo', index: 6 },
      { name: 'Conselho', description: 'Orientação superior', index: 7 },
    ],
  },
  star: {
    name: 'Estrela de Akan',
    positions: [
      { name: 'Centro', description: 'O tema central da consulta', index: 0 },
      { name: 'Caminho', description: 'A direção a seguir', index: 1 },
      { name: 'Inspiração', description: 'A força que move', index: 2 },
      { name: 'Sombra', description: 'O que dificulta', index: 3 },
      { name: 'Destino', description: 'A convergência final', index: 4 },
      { name: 'Raio 1', description: 'Ação prática', index: 5 },
      { name: 'Raio 2', description: 'Ação emocional', index: 6 },
      { name: 'Raio 3', description: 'Ação intuitiva', index: 7 },
    ],
  },
  tree: {
    name: 'Árvore da Vida',
    positions: [
      { name: 'Kether (Coroa)', description: 'Propósito superior e origem', index: 0 },
      { name: 'Chokhmah (Sabedoria)', description: 'A visão e inspiração', index: 1 },
      { name: 'Binah (Compreensão)', description: 'O julgamento e análise', index: 2 },
      { name: 'Chesed (Misericórdia)', description: 'Expansão e abundância', index: 3 },
      { name: 'Gevurah (Juízo)', description: 'Restrição e força', index: 4 },
      { name: 'Tipheret (Beleza)', description: 'Harmonia central', index: 5 },
      { name: 'Netzach (Vitória)', description: 'Perseverança e emoção', index: 6 },
      { name: 'Hod (Glória)', description: 'Comunicação e intelecto', index: 7 },
      { name: 'Yesod (Fundação)', description: 'Base e criação', index: 8 },
      { name: 'Malkuth (Reino)', description: 'Manifestação e resultado', index: 9 },
    ],
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateReadingId(): string {
  return `reading_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function interpretCard(
  cardData: { id: number; name: string; arcana: 'major' | 'minor'; upright: string[]; reversed: string[] },
  position: SpreadPosition,
  isReversed: boolean,
  index: number
): Pick<DrawnCard, 'uprightMeaning' | 'reversedMeaning' | 'interpretation' | 'keywords'> {
  const meanings = isReversed ? cardData.reversed : cardData.upright;
  const orientation = isReversed ? 'invertida' : 'direita';

  const interpretation = `A carta ${cardData.name} surge na posição de ${position.name} — ${position.description}. Na posição ${orientation}, ela expressa: ${meanings[0] || 'seu significado tradiional se manifesta aqui'}. ${meanings[1] ? `Em um nível mais profundo: ${meanings[1]}.` : ''}`;

  const keywords = isReversed
    ? [...cardData.reversed.slice(0, 3)]
    : [...cardData.upright.slice(0, 3)];

  return {
    uprightMeaning: cardData.upright,
    reversedMeaning: cardData.reversed,
    interpretation,
    keywords,
  };
}

function performReading(
  spreadType: string,
  question?: string
): { spreadName: string; cards: DrawnCard[] } {
  const spread = SPREADS[spreadType] || SPREADS.single;
  const positions = spread.positions;
  const numCards = positions.length;

  const drawn = drawCards(numCards);

  const cards: DrawnCard[] = drawn.map((card, index) => {
    const position = positions[index];
    const isReversed = Math.random() < 0.2;
    const parsed = interpretCard(card, position, isReversed, index);

    return {
      cardId: card.id,
      cardName: card.name,
      arcana: card.arcana,
      suit: card.suit,
      isReversed,
      position,
      ...parsed,
    };
  });

  return { spreadName: spread.name, cards };
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

// POST - Create a new tarot reading
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createReadingSchema.parse(body);

    const { spreadType, question } = validated;
    const { spreadName, cards } = performReading(spreadType, question);

    const reading: TarotReading = {
      id: generateReadingId(),
      spreadType,
      spreadName,
      cards,
      question,
      summary: `Leitura de ${spreadName} com ${cards.length} cartas. ${
        question ? `Pergunta: "${question}"` : 'Pergunta não especificada.'
      }`,
      createdAt: new Date().toISOString(),
    };

    readingsStore.set(reading.id, reading);

    return NextResponse.json(
      { success: true, data: reading },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Tarot reading error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reading' },
      { status: 500 }
    );
  }
}

// GET - List readings or get available spreads
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';
  const readingId = searchParams.get('id');
  const userId = searchParams.get('userId');

  if (action === 'spreads') {
    const spreads = Object.entries(SPREADS).map(([key, value]) => ({
      id: key,
      name: value.name,
      cardCount: value.positions.length,
    }));

    return NextResponse.json({ success: true, data: spreads });
  }

  if (readingId) {
    const reading = readingsStore.get(readingId);
    if (!reading) {
      return NextResponse.json(
        { success: false, error: 'Reading not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: reading });
  }

  let readings = Array.from(readingsStore.values());
  if (userId) {
    readings = readings.filter((r) => r.question?.includes(userId));
  }
  readings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ success: true, data: readings });
}
