// Meji-Iwori API - Cabala Dos Caminhos
// GET endpoints for Meji-Iwori Odu spiritual data

import { NextResponse } from 'next/server';

// Meji-Iwori data structure based on Ifá lore
interface MejiIworiData {
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

const mejiIworiData: MejiIworiData = {
  id: 'meji-iwori-003',
  name: 'Meji-Iwori',
  namePt: 'Meji-Iwori - A Sabedoria Duplicada',
  nameEn: 'Meji-Iwori - The Duplicated Wisdom',
  symbol: '☷☷',
  yoruba: 'Ìwòrì Méjì',
  meaning: 'Meji-Iwori',
  meaningPt: 'Meji-Iwori representa a sabedoria duplicada, o conhecimento ancestral refletido, a paciência sagrada e a verdade revelada. É o Odu que governa a busca pelo saber verdadeiro através da introspecção e da conexão com os ancestrais.',
  meaningEn: 'Meji-Iwori symbolizes duplicated wisdom, reflected ancestral knowledge, sacred patience, and revealed truth. It is the Odu that governs the search for true knowledge through introspection and connection with ancestors.',
  spiritualGuidance: [
    'A sabedoria verdadeira vem da escuta atenta e da paciência sagrada.',
    'Conecte-se com seus ancestrais para receber orientação nos momentos de dúvida.',
    'A verdade se revela àqueles que sabem esperar com coração aberto.',
    'O conhecimento herdado dos antigos é a base para a compreensão do presente.',
  ],
  keywords: ['sabedoria', 'ancestralidade', 'paciência', 'verdade', 'conhecimento', 'tradição', 'introspecção', 'consciência'],
  elements: ['Terra Ancestral', 'Lua de Prata', 'Cristal'],
  colors: ['#D4AF37', '#C9A227', '#F5DEB3'],
  dayOfWeek: 'Terça-feira',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Obatalá'],
  sacredNumbers: [3, 7, 12, 33],
  greeting: 'Wisdom reveals truth!',
  rituals: [
    'Meditação com consultas ancestrais para orientação',
    'Oração de gratidão aos anciãos espirituais',
    'Sacrifício de objetos dourados para sabedoria',
    'Prática de escuta profunda e silêncio sagrado',
  ],
  offerings: [
    'Mel de abelha',
    'Farinha de milho',
    'Coco fresco',
    'Água de obi',
    'Flores douradas',
  ],
  affirmations: [
    'Eu abraço a sabedoria dos meus ancestrais.',
    'A paciência me revela a verdade no momento certo.',
    'Eu sou um receptáculo de conhecimento sagrado.',
    'Minha busca pela verdade é abençoada.',
  ],
};

// Combined 16 Meji Odus with Meji-Iwori as Odu 3
const mejiOdusData: Record<number, MejiIworiData> = {
  1: { ...mejiIworiData, id: 'meji-iwori-001', name: 'Meji-Ogbe', namePt: 'Meji-Ogbe - A Duplicação', nameEn: 'Meji-Ogbe - The Duplication' },
  2: { ...mejiIworiData, id: 'meji-iwori-002', name: 'Meji-Oyeku', namePt: 'Meji-Oyeku - O Livro Espelhado', nameEn: 'Meji-Oyeku - The Mirrored Book' },
  3: { ...mejiIworiData, id: 'meji-iwori-003', name: 'Meji-Iwori', namePt: 'Meji-Iwori - A Sabedoria Duplicada', nameEn: 'Meji-Iwori - The Duplicated Wisdom' },
  4: { ...mejiIworiData, id: 'meji-iwori-004', name: 'Meji-Odi', namePt: 'Meji-Odi - A Lua Espelhada', nameEn: 'Meji-Odi - The Mirrored Moon' },
  5: { ...mejiIworiData, id: 'meji-iwori-005', name: 'Meji-Irosun', namePt: 'Meji-Irosun - O Sacrifício Reflexivo', nameEn: 'Meji-Irosun - The Reflective Sacrifice' },
  6: { ...mejiIworiData, id: 'meji-iwori-006', name: 'Meji-Owon', namePt: 'Meji-Owon - A Fortuna Duplicada', nameEn: 'Meji-Owon - The Duplicated Fortune' },
  7: { ...mejiIworiData, id: 'meji-iwori-007', name: 'Meji-Obara', namePt: 'Meji-Obara - A Mente Espelhada', nameEn: 'Meji-Obara - The Mirrored Mind' },
  8: { ...mejiIworiData, id: 'meji-iwori-008', name: 'Meji-Okanran', namePt: 'Meji-Okanran - A Terra Reflexiva', nameEn: 'Meji-Okanran - The Reflective Earth' },
  9: { ...mejiIworiData, id: 'meji-iwori-009', name: 'Meji-Ogo', namePt: 'Meji-Ogo - A Transformação Duplicada', nameEn: 'Meji-Ogo - The Duplicated Transformation' },
  10: { ...mejiIworiData, id: 'meji-iwori-010', name: 'Meji-Oyonu', namePt: 'Meji-Oyonu - A União Espelhada', nameEn: 'Meji-Oyonu - The Mirrored Union' },
  11: { ...mejiIworiData, id: 'meji-iwori-011', name: 'Meji-Iwere', namePt: 'Meji-Iwere - A Coroa Duplicada', nameEn: 'Meji-Iwere - The Duplicated Crown' },
  12: { ...mejiIworiData, id: 'meji-iwori-012', name: 'Meji-Ayabu', namePt: 'Meji-Ayabu - A Paz Reflexiva', nameEn: 'Meji-Ayabu - The Reflective Peace' },
  13: { ...mejiIworiData, id: 'meji-iwori-013', name: 'Meji-Oloku', namePt: 'Meji-Oloku - A Águia Espelhada', nameEn: 'Meji-Oloku - The Mirrored Eagle' },
  14: { ...mejiIworiData, id: 'meji-iwori-014', name: 'Meji-Ika', namePt: 'Meji-Ika - O Veneno Reflexivo', nameEn: 'Meji-Ika - The Reflective Poison' },
  15: { ...mejiIworiData, id: 'meji-iwori-015', name: 'Meji-Ogbogbe', namePt: 'Meji-Ogbogbe - O Caminho Duplicado', nameEn: 'Meji-Ogbogbe - The Duplicated Path' },
  16: { ...mejiIworiData, id: 'meji-iwori-016', name: 'Meji-Oji', namePt: 'Meji-Oji - A Mão Espelhada', nameEn: 'Meji-Oji - The Mirrored Hand' },
};

/**
 * GET /api/meji-iwori/data
 * Returns Meji-Iwori-related data including Meji-Iwori Odu and associated spiritual values
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

    case 'meji-iwori':
      return NextResponse.json({ data: mejiIworiData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: odus.indexOf(o) + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: mejiIworiData.keywords },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: mejiIworiData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: mejiIworiData.colors },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: mejiIworiData.rulingOrishas },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: mejiIworiData.rituals },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: mejiIworiData.affirmations },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: mejiIworiData.offerings },
      });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: mejiIworiData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: mejiIworiData.id,
          name: mejiIworiData.name,
          namePt: mejiIworiData.namePt,
          nameEn: mejiIworiData.nameEn,
          symbol: mejiIworiData.symbol,
          yoruba: mejiIworiData.yoruba,
          meaning: mejiIworiData.meaning,
          totalOdus: 16,
          description: mejiIworiData.meaningPt,
        },
      });
  }
}
