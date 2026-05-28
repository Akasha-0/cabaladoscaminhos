// Ogbe-Meji API - Cabala Dos Caminhos
// GET endpoints for Ogbe-Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Ogbe-Meji data structure based on Ifá lore
interface OgbeMejiData {
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

const ogbeMejiData: OgbeMejiData = {
  id: 'ogbe-meji-001',
  name: 'Ogbe-Meji',
  namePt: 'Ogbe-Meji - O Primeiro Passo Duplicado',
  nameEn: 'Ogbe-Meji - The First Step Duplicated',
  symbol: '☰☰',
  yoruba: 'Ògùndá Méjì',
  meaning: 'Ogbe-Meji',
  meaningPt: 'Ogbe-Meji representa o início duplicado, o poder da criação manifestado em par. É o Odu da liderança iluminada, da vitória garantida, da prosperidade assegurada e da sabedoria que se expande em dualidade sagrada.',
  meaningEn: 'Ogbe-Meji represents the duplicated beginning, the power of creation manifested in pair. It is the Odu of illuminated leadership, assured victory, guaranteed prosperity, and wisdom that expands in sacred duality.',
  spiritualGuidance: [
    'O primeiro passo dado com consciência duplica seu poder',
    'A liderança iluminada cria pontes entre opostos',
    'A vitória vem para quem age com discernimento',
    'A prosperidade é atraída pela intenção pura',
  ],
  keywords: ['início', 'duplicação', 'vitória', 'liderança', 'sabedoria', 'prosperidade', 'criação', 'expansão'],
  elements: ['Luz Solar', 'Água Lunar', 'Fogo Criativo'],
  colors: ['#FFD700', '#FFA500', '#FFFF00', '#C0C0C0'],
  dayOfWeek: 'Domingo',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Oxum'],
  sacredNumbers: [1, 2, 4, 7, 11],
  greeting: 'The light doubles!',
  rituals: [
    'Iniciar novos projetos ao amanhecer',
    'Meditar sobre o propósito antes de agir',
    'Fazer oferendas de mel e luz',
    '轻柔敲击头部的仪式从东方开始',
  ],
  offerings: [
    'Mel com fumo de incenso de olibano',
    'Água de laranja com essência de goldro',
    'Duas velas douradas',
    '新项目开始时的第一个手势',
  ],
  affirmations: [
    'Eu inicio com sabedoria e propósito',
    'Minha liderança é iluminada pelo divino',
    'A vitória é garantida quando ajo com integridade',
    'A prosperidade flui através de mim para todos',
    'Eu crio realidade com pensamento puro',
  ],
};

// Combined 16 Ogbe-Meji Odus
const ogbeMejiOdusData: Record<number, OgbeMejiData> = {
  1: { ...ogbeMejiData, id: 'ogbe-meji-001', name: 'Ogbe-Meji I' },
  2: { ...ogbeMejiData, id: 'ogbe-meji-002', name: 'Ogbe-Meji II' },
  3: { ...ogbeMejiData, id: 'ogbe-meji-003', name: 'Ogbe-Meji III' },
  4: { ...ogbeMejiData, id: 'ogbe-meji-004', name: 'Ogbe-Meji IV' },
  5: { ...ogbeMejiData, id: 'ogbe-meji-005', name: 'Ogbe-Meji V' },
  6: { ...ogbeMejiData, id: 'ogbe-meji-006', name: 'Ogbe-Meji VI' },
  7: { ...ogbeMejiData, id: 'ogbe-meji-007', name: 'Ogbe-Meji VII' },
  8: { ...ogbeMejiData, id: 'ogbe-meji-008', name: 'Ogbe-Meji VIII' },
  9: { ...ogbeMejiData, id: 'ogbe-meji-009', name: 'Ogbe-Meji IX' },
  10: { ...ogbeMejiData, id: 'ogbe-meji-010', name: 'Ogbe-Meji X' },
  11: { ...ogbeMejiData, id: 'ogbe-meji-011', name: 'Ogbe-Meji XI' },
  12: { ...ogbeMejiData, id: 'ogbe-meji-012', name: 'Ogbe-Meji XII' },
  13: { ...ogbeMejiData, id: 'ogbe-meji-013', name: 'Ogbe-Meji XIII' },
  14: { ...ogbeMejiData, id: 'ogbe-meji-014', name: 'Ogbe-Meji XIV' },
  15: { ...ogbeMejiData, id: 'ogbe-meji-015', name: 'Ogbe-Meji XV' },
  16: { ...ogbeMejiData, id: 'ogbe-meji-016', name: 'Ogbe-Meji XVI' },
};

/**
 * GET /api/ogbe-meji/data
 * Returns Ogbe-Meji-related data including Ogbe-Meji Odu and associated spiritual values
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
    const odu = ogbeMejiOdusData[num];

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
    const odu = Object.values(ogbeMejiOdusData).find((o) =>
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

  const odus = Object.values(ogbeMejiOdusData);

  switch (type) {
    case 'all':
      return NextResponse.json({ data: odus });

    case 'ogbe-meji':
      return NextResponse.json({ data: ogbeMejiData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: odus.indexOf(o) + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: ogbeMejiData.keywords },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: ogbeMejiData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: ogbeMejiData.colors },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: ogbeMejiData.rulingOrishas },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: ogbeMejiData.rituals },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: ogbeMejiData.affirmations },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: ogbeMejiData.offerings },
      });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: ogbeMejiData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: ogbeMejiData.id,
          name: ogbeMejiData.name,
          namePt: ogbeMejiData.namePt,
          nameEn: ogbeMejiData.nameEn,
          symbol: ogbeMejiData.symbol,
          yoruba: ogbeMejiData.yoruba,
          meaning: ogbeMejiData.meaning,
          totalOdus: 16,
          description: ogbeMejiData.meaningPt,
        },
      });
  }
}
