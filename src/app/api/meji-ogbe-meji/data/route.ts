// Meji-Ogbe-Meji API - Cabala Dos Caminhos
// GET endpoints for Meji-Ogbe-Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Meji-Ogbe-Meji data structure based on Ifá lore
interface MejiOgbeMejiData {
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

const mejiOgbeMejiData: MejiOgbeMejiData = {
  id: 'meji-ogbe-meji-001',
  name: 'Meji-Ogbe-Meji',
  namePt: 'Meji-Ogbe-Meji - A Duplicação Suprema',
  nameEn: 'Meji-Ogbe-Meji - The Supreme Duplication',
  symbol: '☰☰☰',
  yoruba: 'Ògùndá Méjì Ògùndá Méjì',
  meaning: 'Meji-Ogbe-Meji',
  meaningPt: 'Meji-Ogbe-Meji representa a tríplice duplicação, o espelho infinito, a reflexão da consciência em múltiplos planos. É o Odu da auto-reflexão profunda, da sabedoria espelhada e da elevação espiritual através da contemplação interior.',
  meaningEn: 'Meji-Ogbe-Meji symbolizes the triple duplication, the infinite mirror, the reflection of consciousness across multiple planes. It is the Odu of deep self-reflection, mirrored wisdom, and spiritual elevation through inner contemplation.',
  spiritualGuidance: [
    'A tríplice duplicação revela a natureza multifacetada da alma.',
    'No espelho infinito, você encontra todos os seus reflexos ancestrais.',
    'A contemplação profunda abre portais para dimensões superiores da consciência.',
    'Cada reflexo é uma oportunidade de conhecer a si mesmo em diferentes aspectos.',
  ],
  keywords: ['tripla duplicação', 'espelho infinito', 'reflexão', 'auto-conhecimento', 'contemplação', 'múltiplos planos', 'elevação', 'sabedoria espelhada'],
  elements: ['Água Lunar Infinita', 'Espelho Tríplice', 'Prata Estelar'],
  colors: ['#E6E6FA', '#C0C0C0', '#B0C4DE', '#9370DB'],
  dayOfWeek: 'Segunda-feira',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Oxum', 'Eleggua'],
  sacredNumbers: [3, 6, 9, 33, 99],
  greeting: 'Infinite mirrors reveal truth!',
  rituals: [
    'Meditação tríplice diante de três espelhos alinhados',
    'Ritual de auto-reflexão com água lunar',
    'Oração de elevação da consciência',
    'Prática de contemplação silenciosa',
    'Sacrifício de objetos prateados em três direções',
  ],
  offerings: [
    'Mel de abelha puro',
    'Farinha de inhame branco',
    'Coco fresco em três partes',
    'Água de obi tríplice',
    'Flores brancas e lavanda',
    'Pérola prateada',
  ],
  affirmations: [
    'Eu me reflito no infinito e encontro minha verdade em cada espelho.',
    'Minha consciência se expande através das múltiplas reflexões.',
    'Cada aspecto de mim é sagrado e merece contemplação.',
    'Eu elevo minha consciência através da auto-reflexão profunda.',
    'Os reflexos da minha alma me guiam para a sabedoria verdadeira.',
  ],
};

// Combined 16 Meji-Ogbe-Meji Odus
const mejiOdusData: Record<number, MejiOgbeMejiData> = {
  1: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-001', name: 'Meji-Ogbe-Meji', namePt: 'Meji-Ogbe-Meji - A Duplicação Suprema', nameEn: 'Meji-Ogbe-Meji - The Supreme Duplication' },
  2: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-002', name: 'Meji-Ogbe-Ogunda', namePt: 'Meji-Ogbe-Ogunda - O Caminho Duplicado', nameEn: 'Meji-Ogbe-Ogunda - The Duplicated Path' },
  3: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-003', name: 'Meji-Ogbe-Ogunda-Meji', namePt: 'Meji-Ogbe-Ogunda-Meji - A Ordem Espelhada', nameEn: 'Meji-Ogbe-Ogunda-Meji - The Mirrored Order' },
  4: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-004', name: 'Meji-Ogbe-Irosun', namePt: 'Meji-Ogbe-Irosun - A Sabedoria Duplicada', nameEn: 'Meji-Ogbe-Irosun - The Duplicated Wisdom' },
  5: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-005', name: 'Meji-Ogbe-Iwori', namePt: 'Meji-Ogbe-Iwori - O Espelho Interior', nameEn: 'Meji-Ogbe-Iwori - The Inner Mirror' },
  6: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-006', name: 'Meji-Ogbe-Odi', namePt: 'Meji-Ogbe-Odi - A Vida Refletida', nameEn: 'Meji-Ogbe-Odi - The Reflected Life' },
  7: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-007', name: 'Meji-Ogbe-Ikan', namePt: 'Meji-Ogbe-Ikan - O Destino Espelhado', nameEn: 'Meji-Ogbe-Ikan - The Mirrored Destiny' },
  8: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-008', name: 'Meji-Ogbe-Ika', namePt: 'Meji-Ogbe-Ika - A Transmutação Refletida', nameEn: 'Meji-Ogbe-Ika - The Reflected Transmutation' },
  9: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-009', name: 'Meji-Ogbe-Ogbe', namePt: 'Meji-Ogbe-Ogbe - A Prosperidade Espelhada', nameEn: 'Meji-Ogbe-Ogbe - The Mirrored Prosperity' },
  10: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-010', name: 'Meji-Ogbe-Osa', namePt: 'Meji-Ogbe-Osa - A Jornada Espelhada', nameEn: 'Meji-Ogbe-Osa - The Mirrored Journey' },
  11: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-011', name: 'Meji-Ogbe-Iyanla', namePt: 'Meji-Ogbe-Iyanla - A Maternidade Espelhada', nameEn: 'Meji-Ogbe-Iyanla - The Mirrored Motherhood' },
  12: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-012', name: 'Meji-Ogbe-Ogunda', namePt: 'Meji-Ogbe-Ogunda - O Trabalho Espelhado', nameEn: 'Meji-Ogbe-Ogunda - The Mirrored Work' },
  13: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-013', name: 'Meji-Ogbe-Osa-Meji', namePt: 'Meji-Ogbe-Osa-Meji - O Fogo Refletido', nameEn: 'Meji-Ogbe-Osa-Meji - The Reflected Fire' },
  14: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-014', name: 'Meji-Ogbe-Ofun', namePt: 'Meji-Ogbe-Ofun - A Paz Espelhada', nameEn: 'Meji-Ogbe-Ofun - The Mirrored Peace' },
  15: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-015', name: 'Meji-Ogbe-Wolen', namePt: 'Meji-Ogbe-Wolen - A Graça Espelhada', nameEn: 'Meji-Ogbe-Wolen - The Mirrored Grace' },
  16: { ...mejiOgbeMejiData, id: 'meji-ogbe-meji-016', name: 'Meji-Ogbe-Ode', namePt: 'Meji-Ogbe-Ode - A Caça Espelhada', nameEn: 'Meji-Ogbe-Ode - The Mirrored Hunt' },
};

/**
 * GET /api/meji-ogbe-meji/data
 * Returns Meji-Ogbe-Meji-related data including Meji-Ogbe-Meji Odu and associated spiritual values
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

    case 'meji-ogbe-meji':
      return NextResponse.json({ data: mejiOgbeMejiData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o, i) => ({ numero: i + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: mejiOgbeMejiData.keywords },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: mejiOgbeMejiData.rulingOrishas },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: mejiOgbeMejiData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: mejiOgbeMejiData.colors },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: mejiOgbeMejiData.rituals },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: mejiOgbeMejiData.offerings },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: mejiOgbeMejiData.affirmations },
      });

    case 'spiritual':
      return NextResponse.json({
        data: { spiritualGuidance: mejiOgbeMejiData.spiritualGuidance },
      });

    default:
      return NextResponse.json({ data: mejiOgbeMejiData });
  }
}
