// Otura API - Cabala Dos Caminhos
// GET endpoints for Otura Odu spiritual data

import { NextResponse } from 'next/server';

// Otura data structure based on Ifá lore
interface OturaData {
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

const oturaData: OturaData = {
  id: 'otura-003',
  name: 'Otura',
  namePt: 'Otura - O Nódulo',
  nameEn: 'Otura - The Knot',
  symbol: '☴',
  yoruba: 'Ọ̀túrá',
  meaning: 'Otura',
  meaningPt: 'Otura representa proteção, conexão espiritual, mistério e os estados entre a vida e a morte. É o Odu da Sabedoria Oculta e dos segredos ancestrais.',
  meaningEn: 'Otura symbolizes protection, spiritual connection, mystery, and the states between life and death. It is the Odu of Hidden Wisdom and ancestral secrets.',
  spiritualGuidance: [
    'A proteção divina está sempre presente quando caminhamos na luz.',
    'Os segredos ancestrais se revelam àqueles que buscam com coração puro.',
    'Entre a vida e a morte há um estado de consciência que conecta todos os seres.',
    'A sabedoría oculta é mais poderosa que o conhecimento superficial.',
  ],
  keywords: ['proteção', 'mistério', 'ancestralidade', 'segredos', 'conexão espiritual', 'estabilidade', 'força interior'],
  elements: ['Terra', 'Água', 'Êxtase'],
  colors: ['#800080', '#4B0082', '#9932CC'],
  dayOfWeek: 'Quarta-feira',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Osanyin'],
  sacredNumbers: [3, 7, 12, 16],
  greeting: 'Tie the knot!',
  rituals: [
    'Amarração ritual de nós para proteção',
    'Meditação sobre o umbral entre planos',
    'Evocação dos ancestrais ao anoitecer',
    'Trabalho com ervas de proteção',
  ],
  offerings: [
    'Eru de azeite de dendê',
    'Folhas de ewuro',
    'Kola nuts',
    'Água de río',
  ],
  affirmations: [
    'Estou protegido por forças divinas.',
    'Os segredos da sabedoria se abrem para mim.',
    'Honro meus ancestrais e eles me guiam.',
    'Meus nós são desatados pela luz.',
  ],
};

// Combined 16 Odus with Otura as Odu 3
const odusData: Record<number, OturaData> = {
  1: { ...oturaData, id: 'otura-001', name: 'Ogbe', namePt: 'Ogbe - O Começo', nameEn: 'Ogbe - The Beginning' },
  2: { ...oturaData, id: 'otura-002', name: 'Oyeku', namePt: 'Oyeku - O Livro', nameEn: 'Oyeku - The Book' },
  3: { ...oturaData, id: 'otura-003', name: 'Otura', namePt: 'Otura - O Nódulo', nameEn: 'Otura - The Knot' },
  4: { ...oturaData, id: 'otura-004', name: 'Odi', namePt: 'Odi - A Lua', nameEn: 'Odi - The Moon' },
  5: { ...oturaData, id: 'otura-005', name: 'Irosun', namePt: 'Irosun - O Sacrifício', nameEn: 'Irosun - The Sacrifice' },
  6: { ...oturaData, id: 'otura-006', name: 'Owon', namePt: 'Owon - A Fortuna', nameEn: 'Owon - The Fortune' },
  7: { ...oturaData, id: 'otura-007', name: 'Obara', namePt: 'Obara - A Mente', nameEn: 'Obara - The Mind' },
  8: { ...oturaData, id: 'otura-008', name: 'Okanran', namePt: 'Okanran - A Terra', nameEn: 'Okanran - The Earth' },
  9: { ...oturaData, id: 'otura-009', name: 'Ogo', namePt: 'Ogo - A Transformação', nameEn: 'Ogo - The Transformation' },
  10: { ...oturaData, id: 'otura-010', name: 'Oyonu', namePt: 'Oyonu - A União', nameEn: 'Oyonu - The Union' },
  11: { ...oturaData, id: 'otura-011', name: 'Iwere', namePt: 'Iwere - A Coroa', nameEn: 'Iwere - The Crown' },
  12: { ...oturaData, id: 'otura-012', name: 'Ayabu', namePt: 'Ayabu - A Paz', nameEn: 'Ayabu - The Peace' },
  13: { ...oturaData, id: 'otura-013', name: 'Oloku', namePt: 'Oloku - A Águia', nameEn: 'Oloku - The Eagle' },
  14: { ...oturaData, id: 'otura-014', name: 'Ika', namePt: 'Ika - O Veneno', nameEn: 'Ika - The Poison' },
  15: { ...oturaData, id: 'otura-015', name: 'Ogbogbe', namePt: 'Ogbogbe - O Caminho', nameEn: 'Ogbogbe - The Path' },
  16: { ...oturaData, id: 'otura-016', name: 'Oji', namePt: 'Oji - A Mão', nameEn: 'Oji - The Hand' },
};

/**
 * GET /api/otura/data
 * Returns Otura-related data including Otura Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const numero = url.searchParams.get('numero');
  const nome = url.searchParams.get('nome');

  // Get single Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    const odu = odusData[num];

    if (!odu) {
      return NextResponse.json(
        { error: 'Odu not found', numero: num },
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
        { error: 'Odu not found', nome },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: odu });
  }

  const odus = Object.values(odusData);

  switch (type) {
    case 'all':
      return NextResponse.json({ data: odus });

    case 'otura':
      return NextResponse.json({ data: oturaData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: odus.indexOf(o) + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: oturaData.keywords },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: oturaData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: oturaData.colors },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: oturaData.rulingOrishas },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: oturaData.rituals },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: oturaData.affirmations },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: oturaData.offerings },
      });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: oturaData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: oturaData.id,
          name: oturaData.name,
          namePt: oturaData.namePt,
          nameEn: oturaData.nameEn,
          symbol: oturaData.symbol,
          yoruba: oturaData.yoruba,
          meaning: oturaData.meaning,
          totalOdus: 16,
          description: oturaData.meaningPt,
        },
      });
  }
}
