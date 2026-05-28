// Meji API - Cabala Dos Caminhos
// GET endpoints for Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Meji data structure based on Ifá lore
interface MejiData {
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

const mejiData: MejiData = {
  id: 'meji-001',
  name: 'Meji',
  namePt: 'Meji - A Duplicação Primordial',
  nameEn: 'Meji - The Primordial Duplication',
  symbol: '☰☰',
  yoruba: 'Méjì',
  meaning: 'Meji',
  meaningPt: 'Meji representa a duplicação primordial, o reflexo divino, a dualidade sagrada que sustenta toda a criação. É o princípio fundamental de parceria, espelhamento eharmonia que governa as relações entre opostos complementares.',
  meaningEn: 'Meji represents the primordial duplication, the divine reflection, the sacred duality that sustains all creation. It is the fundamental principle of partnership, mirroring, and harmony that governs the relationships between complementary opposites.',
  spiritualGuidance: [
    'A duplicação é o fundamento de toda existência; o reflexo revela verdades ocultas.',
    'Na dualidade reside a completude; reconheça o sagrado nos opostos.',
    'Todo reflexo carrega uma mensagem do divino; preste atenção aos espelhos da vida.',
    'A harmonia surge quando aceita que a luz e a sombra são uma só essência.',
    'Parcerias sagradas são espelhos que revelam quem você realmente é.',
    'O espelho interior mostra mais do que qualquer superfície reflexiva.',
  ],
  keywords: ['duplicação', 'reflexo', 'espelho', 'dualidade', 'parceria', 'harmonia', 'unificação', 'introspecção', 'completude', 'complementaridade'],
  elements: ['Água Lunar', 'Espelho Sagrada', 'Prata Lunar', 'Luz Estelar'],
  colors: ['#C0C0C0', '#E6E6FA', '#B0C4DE', '#F5F5F5'],
  dayOfWeek: 'Segunda-feira',
  rulingOrishas: ['Olódùmarè', 'Oxum', 'Orunmila'],
  sacredNumbers: [2, 6, 11, 22, 33],
  greeting: 'O Espelho Revela!',
  rituals: [
    'Meditação diante do espelho para autoconhecimento',
    'Oração de harmonização com o reflexo interior',
    'Sacrifício de elementos prateados para equilíbrio',
    'Prática de gratidão em dupla sagrada',
    'Ritual de espelhamento com o divino',
    'Cerimônia de unicidade dos opostos',
  ],
  offerings: [
    'Mel de abelha pura',
    'Farinha de inhame branco',
    'Coco fresco',
    'Água de obi',
    'Flores brancas e prateadas',
    'Perfume de ozônio',
    'Ovo branco',
  ],
  affirmations: [
    'Eu vejo meu reflexo sagrado em todos os seres.',
    'Minhas parcerias são abençoadas e harmoniosas.',
    'A dualidade me ensina e me fortalece.',
    'Eu unifico os opostos em minha vida com sabedoria.',
    'O espelho revela verdades que me libertam.',
    'Aceito a luz e a sombra como partes de mim.',
  ],
};

// Combined Meji Odus (16 variations based on Meji + 16 principal Odus)
const mejiOdusData: Record<number, MejiData> = {
  1: { ...mejiData, id: 'meji-ogbe-001', name: 'Meji-Ogbe', namePt: 'Meji-Ogbe - A Duplicação do Início', nameEn: 'Meji-Ogbe - The Duplication of the Beginning' },
  2: { ...mejiData, id: 'meji-oyeku-002', name: 'Meji-Oyeku', namePt: 'Meji-Oyeku - O Veneno Duplicado', nameEn: 'Meji-Oyeku - The Duplicated Poison' },
  3: { ...mejiData, id: 'meji-iwori-003', name: 'Meji-Iwori', namePt: 'Meji-Iwori - A Sabedoria Refletida', nameEn: 'Meji-Iwori - The Reflected Wisdom' },
  4: { ...mejiData, id: 'meji-odi-004', name: 'Meji-Odi', namePt: 'Meji-Odi - O Destino Espelhado', nameEn: 'Meji-Odi - The Mirrored Destiny' },
  5: { ...mejiData, id: 'meji-irosun-005', name: 'Meji-Irosun', namePt: 'Meji-Irosun - As Folhas Duplicadas', nameEn: 'Meji-Irosun - The Duplicated Leaves' },
  6: { ...mejiData, id: 'meji-owa-006', name: 'Meji-Owa', namePt: 'Meji-Owa - A Mão Espelhada', nameEn: 'Meji-Owa - The Mirrored Hand' },
  7: { ...mejiData, id: 'meji-obara-007', name: 'Meji-Obara', namePt: 'Meji-Obara - A Camisa Duplicada', nameEn: 'Meji-Obara - The Duplicated Cloth' },
  8: { ...mejiData, id: 'meji-okanran-008', name: 'Meji-Okanran', namePt: 'Meji-Okanran - As Pedras Refletidas', nameEn: 'Meji-Okanran - The Reflected Stones' },
  9: { ...mejiData, id: 'meji-ogunda-009', name: 'Meji-Ogunda', namePt: 'Meji-Ogunda - O Ferramental Espelhado', nameEn: 'Meji-Ogunda - The Mirrored Tools' },
  10: { ...mejiData, id: 'meji-osa-010', name: 'Meji-Osa', namePt: 'Meji-Osa - A Floresta Duplicada', nameEn: 'Meji-Osa - The Duplicated Forest' },
  11: { ...mejiData, id: 'meji-ikate-011', name: 'Meji-Ikate', namePt: 'Meji-Ikate - O Rio Espelhado', nameEn: 'Meji-Ikate - The Mirrored River' },
  12: { ...mejiData, id: 'meji-turupu-012', name: 'Meji-Turupu', namePt: 'Meji-Turupu - O Cesto Duplicado', nameEn: 'Meji-Turupu - The Duplicated Basket' },
  13: { ...mejiData, id: 'meji-loni-013', name: 'Meji-Loni', namePt: 'Meji-Loni - O Pássaro Espelhado', nameEn: 'Meji-Loni - The Mirrored Bird' },
  14: { ...mejiData, id: 'meji-she-014', name: 'Meji-She', namePt: 'Meji-She - A Rã Duplicada', nameEn: 'Meji-She - The Duplicated Toad' },
  15: { ...mejiData, id: 'meji-fun-015', name: 'Meji-Fun', namePt: 'Meji-Fun - A Flecha Refletida', nameEn: 'Meji-Fun - The Mirrored Arrow' },
  16: { ...mejiData, id: 'meji-ros-016', name: 'Meji-Ros', namePt: 'Meji-Ros - A Rosa Espelhada', nameEn: 'Meji-Ros - The Mirrored Rose' },
};

/**
 * GET /api/meji/data
 * Returns Meji Odu spiritual data including the base Meji and all 16 Meji variations
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

    case 'meji':
      return NextResponse.json({ data: mejiData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: odus.indexOf(o) + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: mejiData.keywords },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: mejiData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: mejiData.colors },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: mejiData.rulingOrishas },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: mejiData.rituals },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: mejiData.affirmations },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: mejiData.offerings },
      });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: mejiData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: mejiData.id,
          name: mejiData.name,
          namePt: mejiData.namePt,
          nameEn: mejiData.nameEn,
          symbol: mejiData.symbol,
          yoruba: mejiData.yoruba,
          meaning: mejiData.meaning,
          totalOdus: 16,
          description: mejiData.meaningPt,
        },
      });
  }
}