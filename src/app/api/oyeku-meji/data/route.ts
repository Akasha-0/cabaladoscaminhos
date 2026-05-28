// Oyeku-Meji API - Cabala Dos Caminhos
// GET endpoints for Oyeku-Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Oyeku-Meji data structure based on Ifá lore
interface OyekuMejiData {
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

const oyekuMejiData: OyekuMejiData = {
  id: 'oyeku-meji-001',
  name: 'Oyeku-Meji',
  namePt: 'Oyeku-Meji - A Transformação Espelhada',
  nameEn: 'Oyeku-Meji - The Mirrored Transformation',
  symbol: '☷☷☰☰',
  yoruba: 'Òyèkú Méjì',
  meaning: 'Oyeku-Meji',
  meaningPt: 'Oyeku-Meji representa a transformação espelhada, o processo sagrado de renovação através do reflexo divino. Este Odu ensina que ao olhar para dentro com honestidade, encontramos a capacidade de deixar ir o que precisa partir e abraçar novos começos com sabedoria e harmonia.',
  meaningEn: 'Oyeku-Meji represents mirrored transformation, the sacred process of renewal through divine reflection. This Odu teaches that by looking within with honesty, we find the capacity to let go of what needs to leave and embrace new beginnings with wisdom and harmony.',
  spiritualGuidance: [
    'A transformação verdadeira começa quando olhamos para o espelho interior com coragem',
    'Soltar o passado não é perder, mas ganhar espaço para o novo',
    'O reflexo divino em Oyeku-Meji mostra que somos ambos o mago e o estudante',
    'A renovação exige paciência; permita que cada estação complete seu ciclo',
    'Harmonia vem quando aceitamos both light and shadow within',
    'Cada encerramento contém a semente de um novo começo',
    'A verdadeira força está em saber quando deixar ir',
    'Através do espelho da transformação, vemos nossa essência mais pura',
  ],
  keywords: ['transformação', 'renovação', 'reflexo', 'espelho', 'recomeço', 'liberação', 'harmonia', 'dualidade'],
  elements: ['Água da Renovação', 'Espelho Lunar', 'Prata Espelhada', 'Cristal de Transformação'],
  colors: ['#2E8B57', '#98FB98', '#C0C0C0', '#E6E6FA'],
  dayOfWeek: 'Terça-feira',
  rulingOrishas: ['Olódùmarè', 'Oxum', 'Obatalá', 'Orunmila'],
  sacredNumbers: [2, 7, 11, 22, 33],
  greeting: 'A transformação espelha a verdade!',
  rituals: [
    'Banho de purificação com folhas de albahaca e água de chuva',
    'Meditação diante de espelho com vela verde ao amanhecer',
    'Ritual de soltura escrevendo o que precisa ser liberado em papel e queimando',
    'Oferenda de folhas verdes ao ar livre ao entardecer',
    'Cerimônia de novo começo com água sagrada e oración de renovação',
  ],
  offerings: [
    'Folhas verdes frescas de alabastro',
    'Água de chuva coletada ao amanhecer',
    'Velas verdes e prateadas',
    'Frutos da estação',
    'Incenso de sálvia e alecrim',
  ],
  affirmations: [
    'Eu solto o que precisa partir e abraço o novo com sabedoria',
    'Minha transformação é sagrada e meu reflexo revela minha verdade',
    'Aceito minha dualidade com compaixão e harmonia',
    'Cada encerramento traz a abertura para um novo começo',
    'Sou capaz de mudança; minha essência é fluida e renovada',
    'O espelho interior mostra-me o caminho da verdadeira transformação',
    'Permito que a renovação flua através de mim como água sagrada',
    'Transformo-me em luz, libertando o que precisa ser solto',
  ],
};

// Combined 16 Oyeku-Meji Odus
const oyekuMejiOdusData: Record<number, OyekuMejiData> = {
  1: { ...oyekuMejiData, id: 'oyeku-meji-ogbe', name: 'Oyeku-Meji-Ogbe' },
  2: { ...oyekuMejiData, id: 'oyeku-meji-oyeku', name: 'Oyeku-Meji-Oyeku' },
  3: { ...oyekuMejiData, id: 'oyeku-meji-odi', name: 'Oyeku-Meji-Odi' },
  4: { ...oyekuMejiData, id: 'oyeku-meji-irosun', name: 'Oyeku-Meji-Irosun' },
  5: { ...oyekuMejiData, id: 'oyeku-meji-ogunda', name: 'Oyeku-Meji-Ogunda' },
  6: { ...oyekuMejiData, id: 'oyeku-meji-ose', name: 'Oyeku-Meji-Ose' },
  7: { ...oyekuMejiData, id: 'oyeku-meji-oba', name: 'Oyeku-Meji-Oba' },
  8: { ...oyekuMejiData, id: 'oyeku-meji-owonrin', name: 'Oyeku-Meji-Owonrin' },
  9: { ...oyekuMejiData, id: 'oyeku-meji-logbara', name: 'Oyeku-Meji-Logbara' },
  10: { ...oyekuMejiData, id: 'oyeku-meji-osetura', name: 'Oyeku-Meji-Osetura' },
  11: { ...oyekuMejiData, id: 'oyeku-meji-ika', name: 'Oyeku-Meji-Ika' },
  12: { ...oyekuMejiData, id: 'oyeku-meji-ikate', name: 'Oyeku-Meji-Ikate' },
  13: { ...oyekuMejiData, id: 'oyeku-meji-tura', name: 'Oyeku-Meji-Tura' },
  14: { ...oyekuMejiData, id: 'oyeku-meji-tetua', name: 'Oyeku-Meji-Tetua' },
  15: { ...oyekuMejiData, id: 'oyeku-meji-turun', name: 'Oyeku-Meji-Turun' },
  16: { ...oyekuMejiData, id: 'oyeku-meji-kan', name: 'Oyeku-Meji-Kan' },
};

/**
 * GET /api/oyeku-meji/data
 * Returns Oyeku-Meji Odu spiritual data including the base Oyeku-Meji and all 16 variations
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const numero = searchParams.get('numero');
  const nome = searchParams.get('nome');

  // Default response - all Oyeku-Meji data
  if (!type && !numero && !nome) {
    return NextResponse.json({
      success: true,
      data: {
        main: oyekuMejiData,
        variations: Object.values(oyekuMejiOdusData),
        count: Object.keys(oyekuMejiOdusData).length,
      },
    });
  }

  // Get specific Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    if (oyekuMejiOdusData[num]) {
      return NextResponse.json({
        success: true,
        data: oyekuMejiOdusData[num],
      });
    }
    return NextResponse.json(
      { success: false, error: 'Invalid Odu number. Must be 1-16.' },
      { status: 400 }
    );
  }

  // Get by nome
  if (nome) {
    const normalizedNome = nome.toLowerCase().replace(/\s+/g, '-');
    const found = Object.values(oyekuMejiOdusData).find(
      (odu) => odu.name.toLowerCase().replace(/\s+/g, '-') === normalizedNome
    );
    if (found) {
      return NextResponse.json({
        success: true,
        data: found,
      });
    }
    return NextResponse.json(
      { success: false, error: 'Odu not found' },
      { status: 404 }
    );
  }

  // Get main Oyeku-Meji data
  if (type === 'main') {
    return NextResponse.json({
      success: true,
      data: oyekuMejiData,
    });
  }

  // Get all variations
  if (type === 'all') {
    return NextResponse.json({
      success: true,
      data: Object.values(oyekuMejiOdusData),
    });
  }

  return NextResponse.json({
    success: true,
    data: oyekuMejiData,
  });
}