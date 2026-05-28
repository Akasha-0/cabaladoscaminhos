// Oturupon-Meji API - Cabala Dos Caminhos
// GET endpoints for Oturupon-Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Oturupon-Meji data structure based on Ifá lore
interface OturuponMejiData {
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

const oturuponMejiData: OturuponMejiData = {
  id: 'oturupon-meji-001',
  name: 'Oturupon-Meji',
  namePt: 'Oturupon-Meji - O Despertar Espelhado',
  nameEn: 'Oturupon-Meji - The Mirrored Awakening',
  symbol: '☶☱☰☰',
  yoruba: 'Òtúrúpò Méjì',
  meaning: 'Oturupon-Meji',
  meaningPt: 'Oturupon-Meji representa o despertar espelhado da consciência, a iluminação que retorna a si mesma através de|reflexos sagrados. É o Odu do despertar espiritual através da contemplação profunda, do conhecimento de si mesmo revelado nosespelhos da existência e da harmonia entre o céu e a terra.',
  meaningEn: 'Oturupon-Meji represents the mirrored awakening of consciousness, the illumination that returns to itself through sacred reflections. It is the Odu of spiritual awakening through deep contemplation, self-knowledge revealed in the mirrors of existence, and harmony between heaven and earth.',
  spiritualGuidance: [
    'O despertar espiritual emerge do espelho da alma.',
    'Na contemplação profunda, a iluminação revela seus múltiplos reflexos.',
    'O céu e a terra se encontram no ponto central do despertar.',
    'A harmonia dos opostos conduz à iluminação suprema.',
    'O reflexo divino em você é a chave para o despertar.',
  ],
  keywords: ['despertar', 'iluminação', 'espelho', 'contemplação', 'harmonia', 'céu', 'terra', 'auto-conhecimento', 'reflexão sagrada'],
  elements: ['Fogo do Despertar', 'Espelho de Ouro', 'Luz Solar', 'Prata Lunar'],
  colors: ['#FFD700', '#FFA500', '#C0C0C0', '#E6E6FA'],
  dayOfWeek: 'Domingo',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Oxum', 'Obatalá'],
  sacredNumbers: [4, 8, 12, 24, 48],
  greeting: 'O desperten brilha através do espelho!',
  rituals: [
    'Ritual de despertar espiritual com espeços dorados',
    'Meditação diante do sol nascente e luar',
    'Oração deharmonia entre céu e terra',
    'Ritual de contemplação silenciosa',
    'Sacrifício deobjects dourados e prateados',
  ],
  offerings: [
    'Mel de abelha puro',
    'Óleo de dendê dourado',
    'Coco fresco',
    'Água de obi',
    'Flores douradas e brancas',
    'Pérola dourada',
  ],
  affirmations: [
    'Eu desperto para minha verdadeira natureza através do espelho sagrado.',
    'Minha consciência se ilumina com a harmonia do céu e da terra.',
    'Cada reflexo traz enlightenment e wisdom verdadera.',
    'O despertar espiritual é meu derecho divino.',
    'Eu Me reflejo en la luz eterna y encuentro mi verdad.',
  ],
};

// Combined 16 Oturupon-Meji Odus
const oturuponMejiOdusData: Record<number, OturuponMejiData> = {
  1: { ...oturuponMejiData, id: 'oturupon-meji-001', name: 'Oturupon-Meji', namePt: 'Oturupon-Meji - O Despertar Espelhado', nameEn: 'Oturupon-Meji - The Mirrored Awakening' },
  2: { ...oturuponMejiData, id: 'oturupon-meji-002', name: 'Oturupon-Ogbe', namePt: 'Oturupon-Ogbe - O Caminho do Despertar', nameEn: 'Oturupon-Ogbe - The Path of Awakening' },
  3: { ...oturuponMejiData, id: 'oturupon-meji-003', name: 'Oturupon-Ogunda', namePt: 'Oturupon-Ogunda - A Determinação Espelhada', nameEn: 'Oturupon-Ogunda - The Mirrored Determination' },
  4: { ...oturuponMejiData, id: 'oturupon-meji-004', name: 'Oturupon-Irosun', namePt: 'Oturupon-Irosun - A Sabedoria do Despertar', nameEn: 'Oturupon-Irosun - The Wisdom of Awakening' },
  5: { ...oturuponMejiData, id: 'oturupon-meji-005', name: 'Oturupon-Iwori', namePt: 'Oturupon-Iwori - O Espelho Interior', nameEn: 'Oturupon-Iwori - The Inner Mirror' },
  6: { ...oturuponMejiData, id: 'oturupon-meji-006', name: 'Oturupon-Opon', namePt: 'Oturupon-Opon - O Despertar da Mão', nameEn: 'Oturupon-Opon - The Awakening of the Hand' },
  7: { ...oturuponMejiData, id: 'oturupon-meji-007', name: 'Oturupon-Olodu', namePt: 'Oturupon-Olodu - O Despertar Divino', nameEn: 'Oturupon-Olodu - The Divine Awakening' },
  8: { ...oturuponMejiData, id: 'oturupon-meji-008', name: 'Oturupon-Ika', namePt: 'Oturupon-Ika - A Sabotagem Espelhada', nameEn: 'Oturupon-Ika - The Mirrored Subtlety' },
  9: { ...oturuponMejiData, id: 'oturupon-meji-009', name: 'Oturupon-Ikate', namePt: 'Oturupon-Ikate - A Caminho Invertido', nameEn: 'Oturupon-Ikate - The Inverted Path' },
  10: { ...oturuponMejiData, id: 'oturupon-meji-010', name: 'Oturupon-Otura', namePt: 'Oturupon-Otura - A Pureza Espelhada', nameEn: 'Oturupon-Otura - The Mirrored Purity' },
  11: { ...oturuponMejiData, id: 'oturupon-meji-011', name: 'Oturupon-Oturupon', namePt: 'Oturupon-Oturupon - O Duplo Despertar', nameEn: 'Oturupon-Oturupon - The Double Awakening' },
  12: { ...oturuponMejiData, id: 'oturupon-meji-012', name: 'Oturupon-Osa', namePt: 'Oturupon-Osa - A Tempestade Espelhada', nameEn: 'Oturupon-Osa - The Mirrored Storm' },
  13: { ...oturuponMejiData, id: 'oturupon-meji-013', name: 'Oturupon-Owu', namePt: 'Oturupon-Owu - A Decomposição Espelhada', nameEn: 'Oturupon-Owu - The Mirrored Decomposition' },
  14: { ...oturuponMejiData, id: 'oturupon-meji-014', name: 'Oturupon-Oyoube', namePt: 'Oturupon-Oyoube - O Despertar da Serra', nameEn: 'Oturupon-Oyoube - The Awakening of the Mountain' },
  15: { ...oturuponMejiData, id: 'oturupon-meji-015', name: 'Oturupon-Olowa', namePt: 'Oturupon-Olowa - O Pajé Espelhado', nameEn: 'Oturupon-Olowa - The Mirrored Chief' },
  16: { ...oturuponMejiData, id: 'oturupon-meji-016', name: 'Oturupon-Oloban', namePt: 'Oturupon-Oloban - O Despertar Completo', nameEn: 'Oturupon-Oloban - The Complete Awakening' },
};

/**
 * GET /api/oturupon-meji/data
 * Returns Oturupon-Meji Odu spiritual data including the base Oturupon-Meji and all 16 variations
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
    const odu = oturuponMejiOdusData[num];

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
    const odu = Object.values(oturuponMejiOdusData).find((o) =>
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

  const odus = Object.values(oturuponMejiOdusData);

  switch (type) {
    case 'all':
      return NextResponse.json({ data: odus });

    case 'meji':
      return NextResponse.json({ data: oturuponMejiData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: odus.indexOf(o) + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: oturuponMejiData.keywords },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: oturuponMejiData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: oturuponMejiData.colors },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: oturuponMejiData.rulingOrishas },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: oturuponMejiData.rituals },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: oturuponMejiData.affirmations },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: oturuponMejiData.offerings },
      });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: oturuponMejiData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: oturuponMejiData.id,
          name: oturuponMejiData.name,
          namePt: oturuponMejiData.namePt,
          nameEn: oturuponMejiData.nameEn,
          symbol: oturuponMejiData.symbol,
          yoruba: oturuponMejiData.yoruba,
          meaning: oturuponMejiData.meaning,
          totalOdus: 16,
          description: oturuponMejiData.meaningPt,
        },
      });
  }
}
