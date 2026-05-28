// Oturupon API - Cabala Dos Caminhos
// GET endpoints for Oturupon Odu spiritual data

import { NextResponse } from 'next/server';

interface OturuponData {
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

const oturuponData: OturuponData = {
  id: 'oturupon-016',
  name: 'Oturupon',
  namePt: 'Oturupon - A Fortuna',
  nameEn: 'Oturupon - The Fortune',
  symbol: '☯',
  yoruba: 'Òtúrúpún',
  meaning: 'Oturupon',
  meaningPt: 'Oturupon representa fortuna, sorte, bênçãos abundates, boas novas e prosperidade. É o Odu da Fortuna e da Abundância.',
  meaningEn: 'Oturupon symbolizes fortune, luck, abundant blessings, good news, and prosperity. It is the Odu of Fortune and Abundance.',
  spiritualGuidance: [
    'Abrace a prosperity mindset and expect abundance',
    'Share your blessings with those in need',
    'Express gratitude for current good fortune',
    'Take action on opportunities that present themselves',
    'Cultivate optimism and positive expectations',
  ],
  keywords: ['fortuna', 'sorte', 'bênçãos', 'abundância', 'prosperidade', 'boas novas'],
  elements: ['Terra', 'Fogo', 'Ouro'],
  colors: ['#32CD32', '#228B22', '#FFD700'],
  dayOfWeek: 'Quarta-feira',
  rulingOrishas: ['Ogun', 'Obatala'],
  sacredNumbers: [3, 7, 9, 16],
  greeting: 'Fortune shines!',
  rituals: [
    'Offerings of palm wine and honey to Ogun',
    'Gratitude ceremonies at dawn',
    'Sharing food with the community',
    'Placing coins in flowing water',
    'Chanting prayers of thanksgiving',
  ],
  offerings: [
    'Honey and palm wine',
    'Fresh fruits and sweets',
    'Gold-colored candles',
    'Money and coins',
    'White cloth and kola nuts',
  ],
  affirmations: [
    'Fortune flows to me naturally',
    'I am worthy of abundance',
    'Good luck surrounds me',
    'Prosperity is my birthright',
    'Blessings overflow in my life',
  ],
};

// Combined 16 Odus with Oturupon as Odu 16
const odusData: Record<number, OturuponData> = {
  1: { ...oturuponData, id: 'ogbe-001', name: 'Ogbe', namePt: 'Ogbe - O Começo', nameEn: 'Ogbe - The Beginning' },
  2: { ...oturuponData, id: 'oyeku-002', name: 'Oyeku', namePt: 'Oyeku - A Transição', nameEn: 'Oyeku - The Transition' },
  3: { ...oturuponData, id: 'iwori-003', name: 'Iwori', namePt: 'Iwori - A Descoberta', nameEn: 'Iwori - The Discovery' },
  4: { ...oturuponData, id: 'iron-004', name: 'Iron', namePt: 'Iron - A Tempestade', nameEn: 'Iron - The Storm' },
  5: { ...oturuponData, id: 'obara-005', name: 'Obara', namePt: 'Obara - A Maturação', nameEn: 'Obara - The Maturation' },
  6: { ...oturuponData, id: 'okanle-006', name: 'Okanle', namePt: 'Okanle - A Conexão', nameEn: 'Okanle - The Connection' },
  7: { ...oturuponData, id: 'odi-007', name: 'Odi', namePt: 'Odi - A Expectativa', nameEn: 'Odi - The Expectation' },
  8: { ...oturuponData, id: 'osai-008', name: 'Osai', namePt: 'Osai - O Tempo', nameEn: 'Osai - The Time' },
  9: { ...oturuponData, id: 'ogbe-yonu-009', name: 'Ogbe Yonu', namePt: 'Ogbe Yonu - A Clareza', nameEn: 'Ogbe Yonu - The Clarity' },
  10: { ...oturuponData, id: 'oyeku-yonu-010', name: 'Oyeku Yonu', namePt: 'Oyeku Yonu - A Transição', nameEn: 'Oyeku Yonu - The Transition' },
  11: { ...oturuponData, id: 'ewonrin-011', name: 'Ewonrin', namePt: 'Ewonrin - A Jornada', nameEn: 'Ewonrin - The Journey' },
  12: { ...oturuponData, id: 'owonrin-012', name: 'Owonrin', namePt: 'Owonrin - A Mudança', nameEn: 'Owonrin - The Change' },
  13: { ...oturuponData, id: 'ebora-013', name: 'Ebora', namePt: 'Ebora - A Proteção', nameEn: 'Ebora - The Protection' },
  14: { ...oturuponData, id: 'oshe-014', name: 'Oshe', namePt: 'Oshe - A Harmonia', nameEn: 'Oshe - The Harmony' },
  15: { ...oturuponData, id: 'logbara-015', name: 'Logbara', namePt: 'Logbara - O Conflito', nameEn: 'Logbara - The Conflict' },
  16: oturuponData,
};

/**
 * GET /api/oturupon/data
 * Returns Oturupon-related data including Oturupon Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const numero = url.searchParams.get('numero');
  const nome = url.searchParams.get('nome');

  // Oturupon is Odu number 16
  const OTURUPON_NUMERO = 16;

  // Get single Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    const odu = odusData[num];

    if (!odu) {
      return NextResponse.json(
        { error: 'Odu not found', available: Object.keys(odusData).map(Number) },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: odu });
  }

  // Get single Odu by name
  if (nome) {
    const odu = Object.values(odusData).find((o) =>
      o.name.toLowerCase() === nome.toLowerCase()
    );

    if (!odu) {
      return NextResponse.json(
        { error: 'Odu not found', available: Object.values(odusData).map((o) => o.name) },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: odu });
  }

  const odus = Object.values(odusData);

  switch (type) {
    case 'all':
      return NextResponse.json({
        data: odus,
        meta: { total: odus.length },
      });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: parseInt(o.id.split('-')[1]), name: o.name })),
      });

    case 'elements':
      return NextResponse.json({
        data: odus.map((o) => ({
          name: o.name,
          elements: o.elements,
          colors: o.colors,
        })),
      });

    case 'rituals':
      return NextResponse.json({
        data: odus.map((o) => ({
          name: o.name,
          rituals: o.rituals,
          offerings: o.offerings,
        })),
      });

    case 'oturupon':
      // Return specifically the Oturupon Odu
      const oturupon = odusData[OTURUPON_NUMERO];
      return NextResponse.json({ data: oturupon });

    default:
      // Return Oturupon by default or when no type specified
      const defaultOturupon = odusData[OTURUPON_NUMERO];
      return NextResponse.json({ data: defaultOturupon });
  }
}
