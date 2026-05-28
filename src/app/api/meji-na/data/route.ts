// Meji-Na API - Cabala Dos Caminhos
// GET endpoints for Meji-Na Odu spiritual data

import { NextResponse } from 'next/server';

// Meji-Na data structure based on Ifá lore
interface MejiNaData {
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

const mejiNaData: MejiNaData = {
  id: 'meji-na-001',
  name: 'Meji-Na',
  namePt: 'Meji-Na - A Terra',
  nameEn: 'Meji-Na - The Earth',
  symbol: '☰☱',
  yoruba: 'Ògùndá Méjì',
  meaning: 'Meji-Na',
  meaningPt: 'Meji-Na representa a terra, a estabilidade, a fundação, a материализацию и о novamente начинает. É o Odu da construção e da presença física.',
  meaningEn: 'Meji-Na symbolizes earth, stability, foundation, materialization, and beginnings anew. It is the Odu of construction and physical presence.',
  spiritualGuidance: [
    'Grounding your energy in the present moment',
    'Building solid foundations for future endeavors',
    'Honoring the physical body as sacred vessel',
    'Connecting with ancestral wisdom through earth rituals',
    'Manifesting intentions through disciplined action'
  ],
  keywords: ['terra', 'estabilidade', 'fundação', 'materialização', 'presença', 'corpo', 'ancestralidade'],
  elements: ['Terra', 'Mineral', 'Cristal'],
  colors: ['#8B4513', '#D2691E', '#F5DEB3'],
  dayOfWeek: 'Terça-feira',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Obatalá'],
  sacredNumbers: [4, 8, 12, 20],
  greeting: 'Earth calls us home!',
  rituals: [
    'Grounding meditation at dawn',
    'Offering white cloth to the earth',
    'Planting seeds as sacred practice',
    'Walking barefoot on natural ground',
    'Building an altar with earth elements'
  ],
  offerings: [
    'Fresh water in clay vessel',
    'White maize',
    'Earth from four directions',
    'Clear quartz crystal',
    'Palm wine'
  ],
  affirmations: [
    'I am grounded and stable',
    'My foundation is unshakeable',
    'I honor the earth that sustains me',
    'I manifest my intentions with discipline',
    'I am connected to all life'
  ]
};

// Combined 16 Meji Odus with Meji-Na as Odu 2
const mejiOdusData: Record<number, MejiNaData> = {
  1: mejiNaData,
  2: mejiNaData
};

/**
 * GET /api/meji-na/data
 * Returns Meji-Na-related data including Meji-Na Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const numero = searchParams.get('numero');
  const nome = searchParams.get('nome');

  // Return specific Odu data if requested
  if (numero) {
    const num = parseInt(numero, 10);
    if (mejiOdusData[num]) {
      return NextResponse.json({ data: mejiOdusData[num] });
    }
  }

  // Filter by name if requested
  if (nome) {
    const filtered = Object.values(mejiOdusData).filter(
      odu => odu.name.toLowerCase().includes(nome.toLowerCase())
    );
    return NextResponse.json({ data: filtered });
  }

  // Return type-specific data
  if (type === 'meji-na') {
    return NextResponse.json({ data: mejiNaData });
  }

  if (type === 'all') {
    return NextResponse.json({ data: Object.values(mejiOdusData) });
  }

  // Default: return Meji-Na data
  return NextResponse.json({ data: mejiNaData });
}
