/**
 * Lenormand Mesa Real API - Cabala Dos Caminhos
 * 
 * POST endpoint for Mesa Real readings
 * - Shuffle and draw cards
 * - Support 8x4+4 and 9x4 spread formats
 * - Return complete reading with interpretations
 */

import { NextRequest, NextResponse } from 'next/server';

import { LENORMAND_CARDS, getCardByNumero, CASAS_TEMATICAS } from '@/lib/lenormand/data';
import { realizarLeitura, MESA_REAL_SPREADS } from '@/lib/lenormand/mesa-real';

// ─── REQUEST/RESPONSE TYPES ─────────────────────────────────────────────────

interface ReadingRequest {
  format?: '8x4+4' | '9x4';
  cardIndices?: number[];
  positions?: number[];
  seed?: number;
  pergunta?: string;
}

interface ReadingResponse {
  success: boolean;
  format: '8x4+4' | '9x4';
  spreadInfo: {
    rows: number;
    cols: number;
    totalPositions: number;
    hasDestinyCards: boolean;
  };
  cards: Array<{
    position: number;
    house: number;
    houseLabel: string;
    cardIndex: number;
    cardNumber: number;
    cardName: string;
    orientation: 'upright' | 'reversed';
    tipo: 'favoravel' | 'desafio' | 'neutro' | 'alerta';
    significadoCentral: string;
    areaVida: string;
    comoInterpretar: string;
  }>;
  destinyCards?: Array<{
    position: number;
    houseLabel: string;
    cardIndex: number;
    cardNumber: number;
    cardName: string;
    tipo: 'favoravel' | 'desafio' | 'neutro' | 'alerta';
    significadoCentral: string;
  }>;
  themes: {
    dinheiro: {
      houses: readonly number[];
      cards: Array<{ house: number; cardName: string; tipo: string }>;
    };
    amor: {
      houses: readonly number[];
      cards: Array<{ house: number; cardName: string; tipo: string }>;
    };
    trabalho: {
      houses: readonly number[];
      cards: Array<{ house: number; cardName: string; tipo: string }>;
    };
    saude: {
      houses: readonly number[];
      cards: Array<{ house: number; cardName: string; tipo: string }>;
    };
  };
  analysis: {
    totalFavoravel: number;
    totalDesafio: number;
    totalNeutro: number;
    totalAlerta: number;
    convergencias: string[];
    mensagemGeral: string;
  };
  timestamp: string;
  pergunta?: string;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function getSpreadInfo(format: '8x4+4' | '9x4') {
  const spread = MESA_REAL_SPREADS[format];
  return {
    rows: spread.rows,
    cols: spread.cols,
    totalPositions: spread.totalCards,
    hasDestinyCards: format === '8x4+4',
  };
}

// ─── POST HANDLER ───────────────────────────────────────────────────────────

/**
 * POST /api/lenormand
 * 
 * Perform a Mesa Real reading
 */
export async function POST(request: NextRequest) {
  try {
    const body: ReadingRequest = await request.json();

    const format = body.format ?? '8x4+4';

    if (!MESA_REAL_SPREADS[format]) {
      return NextResponse.json(
        { success: false, error: 'Formato inválido. Use 8x4+4 ou 9x4.' },
        { status: 400 }
      );
    }

    if (body.cardIndices) {
      if (!Array.isArray(body.cardIndices)) {
        return NextResponse.json(
          { success: false, error: 'cardIndices deve ser um array.' },
          { status: 400 }
        );
      }
      for (const idx of body.cardIndices) {
        if (idx < 0 || idx > 35 || !Number.isInteger(idx)) {
          return NextResponse.json(
            { success: false, error: `Índice de carta inválido: ${idx}. Use valores de 0 a 35.` },
            { status: 400 }
          );
        }
      }
    }

    const reading = realizarLeitura({
      format,
      cardIndices: body.cardIndices,
      seed: body.seed,
    });

    const spreadInfo = getSpreadInfo(format);
    const spread = MESA_REAL_SPREADS[format];

    const cards = reading.cards.map(card => {
      const fullCard = getCardByNumero(card.cardIndex + 1);
      return {
        position: card.position,
        house: card.house,
        houseLabel: spread.casaLabels[card.house - 1],
        cardIndex: card.cardIndex,
        cardNumber: card.cardIndex + 1,
        cardName: card.cardName,
        orientation: card.orientation,
        tipo: card.tipo,
        significadoCentral: fullCard?.significadoCentral ?? '',
        areaVida: fullCard?.areaVida ?? '',
        comoInterpretar: fullCard?.comoInterpretar ?? '',
      };
    });

    const destinyCards = reading.destinyCards?.map(card => {
      const fullCard = getCardByNumero(card.cardIndex + 1);
      return {
        position: card.position,
        houseLabel: spread.casaLabels[card.position - 1],
        cardIndex: card.cardIndex,
        cardNumber: card.cardIndex + 1,
        cardName: card.cardName,
        tipo: card.tipo,
        significadoCentral: fullCard?.significadoCentral ?? '',
      };
    });

    const themes = {
      dinheiro: {
        houses: CASAS_TEMATICAS.DINHEIRO,
        cards: CASAS_TEMATICAS.DINHEIRO.map(house => {
          const cardInHouse = reading.cards.find(c => c.house === house);
          return {
            house,
            cardName: cardInHouse?.cardName ?? 'Vazio',
            tipo: cardInHouse?.tipo ?? 'neutro',
          };
        }),
      },
      amor: {
        houses: CASAS_TEMATICAS.AMOR,
        cards: CASAS_TEMATICAS.AMOR.map(house => {
          const cardInHouse = reading.cards.find(c => c.house === house);
          return {
            house,
            cardName: cardInHouse?.cardName ?? 'Vazio',
            tipo: cardInHouse?.tipo ?? 'neutro',
          };
        }),
      },
      trabalho: {
        houses: CASAS_TEMATICAS.TRABALHO,
        cards: CASAS_TEMATICAS.TRABALHO.map(house => {
          const cardInHouse = reading.cards.find(c => c.house === house);
          return {
            house,
            cardName: cardInHouse?.cardName ?? 'Vazio',
            tipo: cardInHouse?.tipo ?? 'neutro',
          };
        }),
      },
      saude: {
        houses: CASAS_TEMATICAS.SAUDE,
        cards: CASAS_TEMATICAS.SAUDE.map(house => {
          const cardInHouse = reading.cards.find(c => c.house === house);
          return {
            house,
            cardName: cardInHouse?.cardName ?? 'Vazio',
            tipo: cardInHouse?.tipo ?? 'neutro',
          };
        }),
      },
    };

    const response: ReadingResponse = {
      success: true,
      format,
      spreadInfo,
      cards,
      destinyCards,
      themes,
      analysis: reading.analysis,
      timestamp: reading.timestamp,
      pergunta: body.pergunta,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Lenormand reading error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao realizar a leitura.' },
      { status: 500 }
    );
  }
}

// ─── GET HANDLER ────────────────────────────────────────────────────────────

/**
 * GET /api/lenormand
 * 
 * Return available spreads and card count
 */
export async function GET() {
  const spreads = Object.entries(MESA_REAL_SPREADS).map(([key, s]) => ({
    id: key,
    format: s.format,
    rows: s.rows,
    cols: s.cols,
    totalCards: s.totalCards,
    destinyCards: s.destinyCards,
    description: key === '8x4+4'
      ? '4 linhas de 8 cartas + 4 cartas de destino. Formato clássico português.'
      : '4 linhas de 9 cartas. Formato expandido com todas as 36 casas.',
  }));

  return NextResponse.json({
    success: true,
    totalCards: LENORMAND_CARDS.length,
    cardNames: LENORMAND_CARDS.map(c => ({ numero: c.numero, nome: c.nome, tipo: c.tipo })),
    spreads,
    thematicHouses: {
      dinheiro: [...CASAS_TEMATICAS.DINHEIRO],
      amor: [...CASAS_TEMATICAS.AMOR],
      trabalho: [...CASAS_TEMATICAS.TRABALHO],
      saude: [...CASAS_TEMATICAS.SAUDE],
    },
  });
}
