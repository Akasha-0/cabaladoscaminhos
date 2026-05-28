// Meji-Ogbe API - Cabala Dos Caminhos
// GET endpoints for Meji-Ogbe Odu spiritual data

import { NextResponse } from 'next/server';

// Meji-Ogbe data structure based on Ifá lore
interface MejiOgbeData {
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

const mejiOgbeData: MejiOgbeData = {
  id: 'meji-ogbe-001',
  name: 'Meji-Ogbe',
  namePt: 'Meji-Ogbe - A Duplicação',
  nameEn: 'Meji-Ogbe - The Duplication',
  symbol: '☰☰',
  yoruba: 'Ògùndá Méjì',
  meaning: 'Meji-Ogbe',
  meaningPt: 'Meji-Ogbe representa a duplicação, reflexo, espelho, dualidade, parceria, harmonia conjugal e unificação. É o Odu das relações sagradas e da introspecção.',
  meaningEn: 'Meji-Ogbe symbolizes duplication, reflection, mirror, duality, partnership, marital harmony, and unification. It is the Odu of sacred relationships and introspection.',
  spiritualGuidance: [
    'A dualidade é a base da criação; reconheça o sagrado em todas as polaridades.',
    'Como above, so below; o reflexo revela a verdade interior.',
    'Parcerias sagradas são formadas no plano espiritual antes de se manifestarem.',
    'A introspecção é a chave para compreender o outro e a si mesmo.',
  ],
  keywords: ['duplicação', 'reflexo', 'espelho', 'dualidade', 'parceria', 'harmonia', 'unificação', 'introspecção'],
  elements: ['Água Lunar', 'Espelho', 'Prata'],
  colors: ['#C0C0C0', '#E6E6FA', '#B0C4DE'],
  dayOfWeek: 'Segunda-feira',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Oxum'],
  sacredNumbers: [2, 6, 11, 22],
  greeting: 'Mirror reveals!',
  rituals: [
    'Meditação diante do espelho para autoconhecimento',
    'Oração de harmonização conjugal',
    'Sacrifício de objetos prateados para equilíbrio',
    'Prática de gratidão em dupla',
  ],
  offerings: [
    'Mel de abelha',
    'Farinha de inhame',
    'Coco fresco',
    'Água de obi',
    'Flores brancas',
  ],
  affirmations: [
    'Eu vejo meu reflexo sagrado em todos os seres.',
    'Minhas parcerias são abençoadas e harmoniosas.',
    'A dualidade me ensina e me fortalece.',
    'Eu unifico opposites em minha vida com sabedoria.',
  ],
};

// Combined 16 Meji Odus with Meji-Ogbe as Odu 1
const mejiOdusData: Record<number, MejiOgbeData> = {
  1: { ...mejiOgbeData, id: 'meji-ogbe-001', name: 'Meji-Ogbe', namePt: 'Meji-Ogbe - A Duplicação', nameEn: 'Meji-Ogbe - The Duplication' },
  2: { ...mejiOgbeData, id: 'meji-ogbe-002', name: 'Meji-Oyeku', namePt: 'Meji-Oyeku - O livro Espelhado', nameEn: 'Meji-Oyeku - The Mirrored Book' },
  3: { ...mejiOgbeData, id: 'meji-ogbe-003', name: 'Meji-Iwori', namePt: 'Meji-Iwori - A Sabedoria Duplicada', nameEn: 'Meji-Iwori - The Duplicated Wisdom' },
  4: { ...mejiOgbeData, id: 'meji-ogbe-004', name: 'Meji-Odi', namePt: 'Meji-Odi - A Lua Espelhada', nameEn: 'Meji-Odi - The Mirrored Moon' },
  5: { ...mejiOgbeData, id: 'meji-ogbe-005', name: 'Meji-Irosun', namePt: 'Meji-Irosun - O Sacrifício Reflexivo', nameEn: 'Meji-Irosun - The Reflective Sacrifice' },
  6: { ...mejiOgbeData, id: 'meji-ogbe-006', name: 'Meji-Owon', namePt: 'Meji-Owon - A Fortuna Duplicada', nameEn: 'Meji-Owon - The Duplicated Fortune' },
  7: { ...mejiOgbeData, id: 'meji-ogbe-007', name: 'Meji-Obara', namePt: 'Meji-Obara - A Mente Espelhada', nameEn: 'Meji-Obara - The Mirrored Mind' },
  8: { ...mejiOgbeData, id: 'meji-ogbe-008', name: 'Meji-Okanran', namePt: 'Meji-Okanran - A Terra Reflexiva', nameEn: 'Meji-Okanran - The Reflective Earth' },
  9: { ...mejiOgbeData, id: 'meji-ogbe-009', name: 'Meji-Ogo', namePt: 'Meji-Ogo - A Transformação Duplicada', nameEn: 'Meji-Ogo - The Duplicated Transformation' },
  10: { ...mejiOgbeData, id: 'meji-ogbe-010', name: 'Meji-Oyonu', namePt: 'Meji-Oyonu - A União Espelhada', nameEn: 'Meji-Oyonu - The Mirrored Union' },
  11: { ...mejiOgbeData, id: 'meji-ogbe-011', name: 'Meji-Iwere', namePt: 'Meji-Iwere - A Coroa Duplicada', nameEn: 'Meji-Iwere - The Duplicated Crown' },
  12: { ...mejiOgbeData, id: 'meji-ogbe-012', name: 'Meji-Ayabu', namePt: 'Meji-Ayabu - A Paz Reflexiva', nameEn: 'Meji-Ayabu - The Reflective Peace' },
  13: { ...mejiOgbeData, id: 'meji-ogbe-013', name: 'Meji-Oloku', namePt: 'Meji-Oloku - A Águia Espelhada', nameEn: 'Meji-Oloku - The Mirrored Eagle' },
  14: { ...mejiOgbeData, id: 'meji-ogbe-014', name: 'Meji-Ika', namePt: 'Meji-Ika - O Veneno Reflexivo', nameEn: 'Meji-Ika - The Reflective Poison' },
  15: { ...mejiOgbeData, id: 'meji-ogbe-015', name: 'Meji-Ogbogbe', namePt: 'Meji-Ogbogbe - O Caminho Duplicado', nameEn: 'Meji-Ogbogbe - The Duplicated Path' },
  16: { ...mejiOgbeData, id: 'meji-ogbe-016', name: 'Meji-Oji', namePt: 'Meji-Oji - A Mão Espelhada', nameEn: 'Meji-Oji - The Mirrored Hand' },
};

/**
 * GET /api/meji-ogbe/data
 * Returns Meji-Ogbe-related data including Meji-Ogbe Odu and associated spiritual values
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
    const odu = mejiOdusData[num];

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
    const odu = Object.values(mejiOdusData).find((o) =>
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

  const odus = Object.values(mejiOdusData);

  switch (type) {
    case 'all':
      return NextResponse.json({ data: odus });

    case 'meji-ogbe':
      return NextResponse.json({ data: mejiOgbeData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: odus.indexOf(o) + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: mejiOgbeData.keywords },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: mejiOgbeData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: mejiOgbeData.colors },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: mejiOgbeData.rulingOrishas },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: mejiOgbeData.rituals },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: mejiOgbeData.affirmations },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: mejiOgbeData.offerings },
      });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: mejiOgbeData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: mejiOgbeData.id,
          name: mejiOgbeData.name,
          namePt: mejiOgbeData.namePt,
          nameEn: mejiOgbeData.nameEn,
          symbol: mejiOgbeData.symbol,
          yoruba: mejiOgbeData.yoruba,
          meaning: mejiOgbeData.meaning,
          totalOdus: 16,
          description: mejiOgbeData.meaningPt,
        },
      });
  }
}
