// Obara-Meji API - Cabala Dos Caminhos
// GET endpoints for Obara-Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Obara-Meji data structure based on Ifá lore
interface ObaraMejiData {
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

const obaraMejiData: ObaraMejiData = {
  id: 'obara-meji-001',
  name: 'Obara-Meji',
  namePt: 'Obara-Meji - A Roupa Duplicada',
  nameEn: 'Obara-Meji - The Duplicated Cloth',
  symbol: '☰☰',
  yoruba: 'Òbàrà Méjì',
  meaning: 'Obara-Meji',
  meaningPt: 'Obara-Meji representa a roupa duplicada, o véu sagrado que cobre e revela simultaneamente. É o Odu da generosidade refinada, da proteção amorosa, da humildade elegante e da cobertura divina que veste a alma em sua jornada espiritual. A duplicação traz expansão aos dons de Obara.',
  meaningEn: 'Obara-Meji represents the duplicated cloth, the sacred veil that covers and reveals simultaneously. It is the Odu of refined generosity, loving protection, elegant humility, and divine covering that dresses the soul on its spiritual journey. The duplication brings expansion to the gifts of Obara.',
  spiritualGuidance: [
    'A generosidade verdadeira veste tanto o doador quanto o receptor.',
    'A proteção divina cobre aqueles que cobrem os outros com amor.',
    'A humildade é a mais elegante das vestes sagradas.',
    'O véu entre mundos se тончает quando agimos com generosidade.',
    'Cobertura e revelação são dois aspectos do mesmo mistério.',
  ],
  keywords: ['roupa', 'cobertura', 'generosidade', 'proteção', 'humildade', 'véu', 'revelação', 'manto', 'caridade', 'dádiva'],
  elements: ['Tecido Sagrado', 'Linho Puro', 'Seda Lunar', 'Velo de Ovelha'],
  colors: ['#8B4513', '#DEB887', '#F5DEB3', '#FFFFFF'],
  dayOfWeek: 'Segunda-feira',
  rulingOrishas: ['Obatalá', 'Oxum', 'Olódùmarè'],
  sacredNumbers: [2, 7, 14, 21],
  greeting: 'A Cobertura Revela!',
  rituals: [
    'Vestir roupas brancas em sinal de pureza protegida',
    'Oração de cobertura antes de novos empreendimentos',
    'Doar roupas a quem precisa como oferenda sagrada',
    'Meditar sobre o véu entre o visível e o invisível',
    'Ritual de proteção com tecidos abençoados',
  ],
  offerings: [
    'Tecido branco de linho puro',
    'Óleo de coco辛草',
    'Água de obi',
    'Milho torrado',
    'Duas velas brancas',
    'Flores de alguidar',
  ],
  affirmations: [
    'Eu sou coberto pela graça divina.',
    'Minha generosidade veste o mundo com amor.',
    'A humildade é minha mais bela ornamentação.',
    'O véu sagrado protege minha jornada.',
    'Eu dou e recebo com graça infinita.',
  ],
};

// Combined 16 Obara-Meji Odus
const obaraMejiOdusData: Record<number, ObaraMejiData> = {
  1: { ...obaraMejiData, id: 'obara-meji-001', name: 'Obara-Meji I' },
  2: { ...obaraMejiData, id: 'obara-meji-002', name: 'Obara-Meji II' },
  3: { ...obaraMejiData, id: 'obara-meji-003', name: 'Obara-Meji III' },
  4: { ...obaraMejiData, id: 'obara-meji-004', name: 'Obara-Meji IV' },
  5: { ...obaraMejiData, id: 'obara-meji-005', name: 'Obara-Meji V' },
  6: { ...obaraMejiData, id: 'obara-meji-006', name: 'Obara-Meji VI' },
  7: { ...obaraMejiData, id: 'obara-meji-007', name: 'Obara-Meji VII' },
  8: { ...obaraMejiData, id: 'obara-meji-008', name: 'Obara-Meji VIII' },
  9: { ...obaraMejiData, id: 'obara-meji-009', name: 'Obara-Meji IX' },
  10: { ...obaraMejiData, id: 'obara-meji-010', name: 'Obara-Meji X' },
  11: { ...obaraMejiData, id: 'obara-meji-011', name: 'Obara-Meji XI' },
  12: { ...obaraMejiData, id: 'obara-meji-012', name: 'Obara-Meji XII' },
  13: { ...obaraMejiData, id: 'obara-meji-013', name: 'Obara-Meji XIII' },
  14: { ...obaraMejiData, id: 'obara-meji-014', name: 'Obara-Meji XIV' },
  15: { ...obaraMejiData, id: 'obara-meji-015', name: 'Obara-Meji XV' },
  16: { ...obaraMejiData, id: 'obara-meji-016', name: 'Obara-Meji XVI' },
};

/**
 * GET /api/obara-meji/data
 * Returns Obara-Meji-related data including Obara-Meji Odu and associated spiritual values
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
    const odu = obaraMejiOdusData[num];

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
    const odu = Object.values(obaraMejiOdusData).find((o) =>
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

  const odus = Object.values(obaraMejiOdusData);

  switch (type) {
    case 'all':
      return NextResponse.json({ data: odus });

    case 'obara-meji':
      return NextResponse.json({ data: obaraMejiData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: odus.indexOf(o) + 1, name: o.name })),
      });

    case 'keywords':
      return NextResponse.json({
        data: { keywords: obaraMejiData.keywords },
      });

    case 'elements':
      return NextResponse.json({
        data: { elements: obaraMejiData.elements },
      });

    case 'colors':
      return NextResponse.json({
        data: { colors: obaraMejiData.colors },
      });

    case 'orishas':
      return NextResponse.json({
        data: { rulingOrishas: obaraMejiData.rulingOrishas },
      });

    case 'rituals':
      return NextResponse.json({
        data: { rituals: obaraMejiData.rituals },
      });

    case 'affirmations':
      return NextResponse.json({
        data: { affirmations: obaraMejiData.affirmations },
      });

    case 'offerings':
      return NextResponse.json({
        data: { offerings: obaraMejiData.offerings },
      });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: obaraMejiData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: obaraMejiData.id,
          name: obaraMejiData.name,
          namePt: obaraMejiData.namePt,
          nameEn: obaraMejiData.nameEn,
          symbol: obaraMejiData.symbol,
          yoruba: obaraMejiData.yoruba,
          meaning: obaraMejiData.meaning,
          totalOdus: 16,
          description: obaraMejiData.meaningPt,
        },
      });
  }
}