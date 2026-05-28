// Owonrin API - Cabala Dos Caminhos
// GET endpoints for Owonrin Odu spiritual data

import { NextResponse } from 'next/server';

// Owonrin data structure based on Ifá lore
interface OwonrinData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  symbol: string;
  yoruba: string;
  meaning: string;
  meaningPt: string;
  meaningEn: string;
  spiritualGuidance: string[];
  warnings: string[];
  blessings: string[];
  keywords: string[];
  elements: string[];
  colors: string[];
  dayOfWeek: string;
  rulingOrishas: string[];
  sacredNumbers: number[];
  greeting: string;
  rituals: string[];
  offerings: string[];
  affirmations: string[];
}

const owonrinData: OwonrinData = {
  id: 'owonrin-012',
  name: 'Owonrin',
  namePt: 'Owonrin - A Mudança',
  nameEn: 'Owonrin - The Change',
  symbol: '☱',
  yoruba: 'Òwónrí',
  meaning: 'Owonrin',
  meaningPt: 'Owonrin traz mudanças de destino, transformação e evolução. É o Odu do Movimento — o mensageiro que chega quando a quietude se estendeu demais, quando o eu deve deixar o familiar e caminhar para a névoa.',
  meaningEn: 'Owonrin brings destiny shifts, change, evolution, and transformation. It is the Odu of Movement — the messenger that arrives when stillness has been held too long, when the self must leave the familiar and walk into mist.',
  spiritualGuidance: [
    'Do not resist change when it arrives with unmistakable force and timing.',
    'Prepare for the journey; those who set out unprepared find the road harder.',
    'Trust that forward motion, even without full visibility, is preferable to static stagnation.',
    'Let go of what can no longer accompany you; the departing boat creates space for the arriving one.',
    'Seek the support of companions who have chosen to walk beside you in the new direction.',
  ],
  warnings: [
    'Refusing necessary change when the time has clearly come leads to collapse rather than evolution.',
    'Change pursued for its own sake without discernment creates confusion, not progress.',
    'Undertaking the journey with unresolved spiritual debts intensifies the ordeal.',
  ],
  blessings: [
    'Successful transformation through life\'s inevitable transitions',
    'Destiny shifts that align with true purpose',
    'Strength to navigate unknown territories',
    'Communion with Oshun for flowing adaptability',
    'The wisdom to know when to stay and when to go',
  ],
  keywords: ['mudança', 'movimento', 'transformação', 'mudanças de destino', 'evolução', 'jornada'],
  elements: ['Água', 'Vento', 'Mudança'],
  colors: ['#00CED1', '#20B2AA', '#48D1CC'],
  dayOfWeek: 'Segunda-feira',
  rulingOrishas: ['Oshun', 'Shango'],
  sacredNumbers: [2, 5, 8, 12],
  greeting: 'Changes flow!',
  rituals: [
    'Perform water rituals to honor Oshun during transitions',
    'Light turquoise candles at crossroads to guide the journey',
    'Offer honey and sweet water at flowing bodies',
    'Walk a new path to symbolize embracing change',
    'Meditate on what must be released before the new arrives',
  ],
  offerings: [
    'Honey and agave',
    'Sweet water',
    'Turquoise or aquamarine stones',
    'Fresh flowers in yellow and gold',
    'Coconut water',
  ],
  affirmations: [
    'I embrace change as a necessary part of my evolution',
    'I release what no longer serves my highest purpose',
    'I trust the journey even when the path is unclear',
    'I move forward with courage and divine guidance',
    'I am open to the transformations that align me with my destiny',
  ],
};

// Combined 16 Odus with Owonrin as Odu 12
const odusData: Record<number, OwonrinData> = {
  1: { ...owonrinData, id: 'owonrin-01', name: 'Owonrin (Ogbe)', meaningPt: 'Owonrin como Ogbe: clareza nos novos caminhos' },
  12: owonrinData,
};

/**
 * GET /api/owonrin/data
 * Returns Owonrin-related data including Owonrin Odu and associated spiritual values
 * Supports query parameters: type, numero
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const numeroParam = searchParams.get('numero');

  if (type === 'all') {
    return NextResponse.json({
      success: true,
      data: odusData,
      meta: {
        total: Object.keys(odusData).length,
        filter: 'all_odus',
      },
    });
  }

  if (numeroParam) {
    const numero = parseInt(numeroParam, 10);
    const odu = odusData[numero];
    if (odu) {
      return NextResponse.json({
        success: true,
        data: odu,
        meta: { filter: 'by_numero', numero },
      });
    }
    return NextResponse.json(
      { success: false, error: `Odu com número ${numeroParam} não encontrado` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: owonrinData,
    meta: {
      filter: 'default',
      odu: 'Owonrin',
      significado: 'A Mudança / The Change',
    },
  });
}
