// Ogbe API - Cabala Dos Caminhos
// GET endpoints for Ogbe Odu spiritual data

import { NextResponse } from 'next/server';

// Ogbe data structure based on Ifá lore
interface OgbeData {
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

const ogbeData: OgbeData = {
  id: 'ogbe-001',
  name: 'Ogbe',
  namePt: 'Ogbe - O Começo',
  nameEn: 'Ogbe - The Beginning',
  symbol: '☰',
  yoruba: 'Ògùndá',
  meaning: 'Ogbe',
  meaningPt: 'Ogbe representa clareza, vitória, sabedoria, prosperidade, liderança e novas oportunidades. É o Odu da Luz e da Criação.',
  meaningEn: 'Ogbe symbolizes clarity, victory, wisdom, prosperity, leadership, and new opportunities. It is the Odu of Light and Creation.',
  spiritualGuidance: [
    'Abra novas beginnings com confiança e confiança no divino.',
    'Busque clareza antes de agir; a névoa se dissipa onde a luz entra.',
    'A prosperidade flui para aqueles que estão abertos e preparados.',
    'Cada começo carrega o potencial de transformação e realização.',
  ],
  keywords: ['luz', 'criação', 'novos começos', 'vitória', 'sabedoria', 'prosperidade', 'liderança'],
  elements: ['Luz', 'Ar', 'Fogo Solar'],
  colors: ['#FFD700', '#FFA500', '#FFFF00'],
  dayOfWeek: 'Domingo',
  rulingOrishas: ['Olódùmarè', 'Orunmila'],
  sacredNumbers: [1, 4, 7, 10],
  greeting: 'Eagles open!',
  rituals: [
    'Meditação ao amanhecer para clareza mental',
    'Oração de gratidão antes de novos empreendimentos',
    'Sacrifício de objetos brancos para pureza',
    'Prática de visualização criativa',
  ],
  offerings: [
    'Mel de abelha',
    'Farinha de inhame',
    'Coco fresco',
    'Água de obi',
  ],
  affirmations: [
    'Eu abraço novos começos com confiança.',
    'Aclaridade e sabedoria guiam meus passos.',
    'Prosperidade flui para mim naturalmente.',
    'Eu crio meu destino com propósito.',
  ],
};

// Combined 16 Odus with Ogbe as Odu 1
const odusData: Record<number, OgbeData> = {
  1: { ...ogbeData, id: 'ogbe-001', name: 'Ogbe', namePt: 'Ogbe - O Começo', nameEn: 'Ogbe - The Beginning' },
  2: { ...ogbeData, id: 'ogbe-002', name: 'Oyeku', namePt: 'Oyeku - O livro', nameEn: 'Oyeku - The Book' },
  3: { ...ogbeData, id: 'ogbe-003', name: 'Iwori', namePt: 'Iwori - A Sabedoria', nameEn: 'Iwori - The Wisdom' },
  4: { ...ogbeData, id: 'ogbe-004', name: 'Odi', namePt: 'Odi - A Lua', nameEn: 'Odi - The Moon' },
  5: { ...ogbeData, id: 'ogbe-005', name: 'Irosun', namePt: 'Irosun - O Sacrifício', nameEn: 'Irosun - The Sacrifice' },
  6: { ...ogbeData, id: 'ogbe-006', name: 'Owon', namePt: 'Owon - A Fortuna', nameEn: 'Owon - The Fortune' },
  7: { ...ogbeData, id: 'ogbe-007', name: 'Obara', namePt: 'Obara - A Mente', nameEn: 'Obara - The Mind' },
  8: { ...ogbeData, id: 'ogbe-008', name: 'Okanran', namePt: 'Okanran - A Terra', nameEn: 'Okanran - The Earth' },
  9: { ...ogbeData, id: 'ogbe-009', name: 'Ogo', namePt: 'Ogo - A Transformação', nameEn: 'Ogo - The Transformation' },
  10: { ...ogbeData, id: 'ogbe-010', name: 'Oyonu', namePt: 'Oyonu - A União', nameEn: 'Oyonu - The Union' },
  11: { ...ogbeData, id: 'ogbe-011', name: 'Iwere', namePt: 'Iwere - A Coroa', nameEn: 'Iwere - The Crown' },
  12: { ...ogbeData, id: 'ogbe-012', name: 'Ayabu', namePt: 'Ayabu - A Paz', nameEn: 'Ayabu - The Peace' },
  13: { ...ogbeData, id: 'ogbe-013', name: 'Oloku', namePt: 'Oloku - A Águia', nameEn: 'Oloku - The Eagle' },
  14: { ...ogbeData, id: 'ogbe-014', name: 'Ika', namePt: 'Ika - O Veneno', nameEn: 'Ika - The Poison' },
  15: { ...ogbeData, id: 'ogbe-015', name: 'Ogbogbe', namePt: 'Ogbogbe - O Caminho', nameEn: 'Ogbogbe - The Path' },
  16: { ...ogbeData, id: 'ogbe-016', name: 'Oji', namePt: 'Oji - A Mão', nameEn: 'Oji - The Hand' },
};

/**
 * GET /api/ogbe/data
 * Returns Ogbe-related data including Ogbe Odu and associated spiritual values
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

    case 'ogbe':
      return NextResponse.json({ data: ogbeData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: odus.indexOf(o) + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: ogbeData.keywords },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: ogbeData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: ogbeData.colors },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: ogbeData.rulingOrishas },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: ogbeData.rituals },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: ogbeData.affirmations },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: ogbeData.offerings },
      });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: ogbeData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: ogbeData.id,
          name: ogbeData.name,
          namePt: ogbeData.namePt,
          nameEn: ogbeData.nameEn,
          symbol: ogbeData.symbol,
          yoruba: ogbeData.yoruba,
          meaning: ogbeData.meaning,
          totalOdus: 16,
          description: ogbeData.meaningPt,
        },
      });
  }
}
