// Meji-Je API - Cabala Dos Caminhos
// GET endpoints for Meji-Je Odu spiritual data

import { NextResponse } from 'next/server';

// Meji-Je data structure based on Ifá lore
interface MejiJeData {
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

const mejiJeData: MejiJeData = {
  id: 'meji-je-001',
  name: 'Meji-Je',
  namePt: 'Meji-Je - A Bênção da Abundância',
  nameEn: 'Meji-Je - The Blessing of Abundance',
  symbol: '☰☷☷',
  yoruba: 'Ògùndá Méjì Ẹ̀yẹ́',
  meaning: 'Meji-Je',
  meaningPt: 'Meji-Je representa a bênção da abundância, a graça溢出的 generosidade e a proteção divina sobre os caminhos do buscador. É o Odu da prosperidade espiritual, da graça alcançada e da开门迎接美好祝福.',
  meaningEn: 'Meji-Je symbolizes the blessing of abundance, overflowing grace, and divine protection on the seekers path. It is the Odu of spiritual prosperity, earned grace, and the opening of doors to beautiful blessings.',
  spiritualGuidance: [
    'A abundância vem através da graça divina, não apenas do esforço humano',
    'Receba com gratidão as bênçãos que chegam, mesmo quando não as esperava',
    'A generosidade cria um fluxo contínuo de prosperidade em sua vida',
    'Permita-se ser abençoado; não evite a graça que lhe é oferecida',
    'Compartilhe suas bênçãos com outros para multiplicar a abundância',
    'Confie que o universo proverá em tempos de necessidade',
    'Celebre suas conquistas sem culpa, reconhecendo a mão divina',
    'O trabalho diligente combinado com a fé atrai prosperidade duradoura',
  ],
  keywords: ['abundância', 'bênção', 'graça', 'prosperidade', 'proteção', 'generosidade', 'gratidão', 'abertura'],
  elements: ['Ouro Celestial', 'Mel dourado', 'Luz Solar Bendita'],
  colors: ['#FFD700', '#FFA500', '#FFB347', '#DAA520'],
  dayOfWeek: 'Domingo',
  rulingOrishas: ['Olódùmarè', 'Ogun', 'Oxum', 'Obatalá'],
  sacredNumbers: [3, 7, 12, 40, 100],
  greeting: 'Blessed abundance flows to you!',
  rituals: [
    'Ofertar mel ao céu aberto ao amanhecer para invocar bênçãos',
    'Meditação com cristais dourados sobre o chakra do plexo solar',
    'Ritual de gratidão diários antes das refeições',
    'Banho de infusão de mel e alecrim para atrair prosperidade',
    'Oração de agradecimento antes de dormir',
  ],
  offerings: [
    'Mel silvestre fresco',
    'Oro simbólico representando gratidão',
    'Frutos dourados como manga e banana da terra',
    'Velas douradas',
    'Água com açúcar mascavo',
  ],
  affirmations: [
    'Sou digno de toda a abundância que flui em minha vida',
    'Aceito graciosamente as bênçãos que o universo me oferece',
    'Minha prosperidade aumenta quando compartilho com outros',
    'Sou um canal de abundância, recebendo e dando em equilíbrio',
    'Agradeço por todas as bênçãos, grandes e pequenas',
    'A porta da abundância se abre para mim a cada novo dia',
    'Merezco e aceito asGraças de Olodumare em minha vida',
    'Permito que a prosperidade flua livremente em todas as áreas da minha existência',
  ],
};

// Combined 16 Meji-Je Odus
const mejiOdusData: Record<number, MejiJeData> = {
  1: { ...mejiJeData, id: 'meji-je-ogbe', name: 'Meji-Je-Ogbe' },
  2: { ...mejiJeData, id: 'meji-je-odi', name: 'Meji-Je-Odi' },
  3: { ...mejiJeData, id: 'meji-je-ogunda', name: 'Meji-Je-Ogunda' },
  4: { ...mejiJeData, id: 'meji-je-rosun', name: 'Meji-Je-Rosun' },
  5: { ...mejiJeData, id: 'meji-je-iron', name: 'Meji-Je-Iron' },
  6: { ...mejiJeData, id: 'meji-je-oton', name: 'Meji-Je-Oton' },
  7: { ...mejiJeData, id: 'meji-je-megi', name: 'Meji-Je-Megi' },
  8: { ...mejiJeData, id: 'meji-je-ogun', name: 'Meji-Je-Ogun' },
  9: { ...mejiJeData, id: 'meji-je-rosi', name: 'Meji-Je-Rosi' },
  10: { ...mejiJeData, id: 'meji-je-oshe', name: 'Meji-Je-Oshe' },
  11: { ...mejiJeData, id: 'meji-je-ika', name: 'Meji-Je-Ika' },
  12: { ...mejiJeData, id: 'meji-je-ikate', name: 'Meji-Je-Ikate' },
  13: { ...mejiJeData, id: 'meji-je-tura', name: 'Meji-Je-Tura' },
  14: { ...mejiJeData, id: 'meji-je-tetua', name: 'Meji-Je-Tetua' },
  15: { ...mejiJeData, id: 'meji-je-turun', name: 'Meji-Je-Turun' },
  16: { ...mejiJeData, id: 'meji-je-kan', name: 'Meji-Je-Kan' },
};

/**
 * GET /api/meji-je/data
 * Returns Meji-Je-related data including Meji-Je Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const numero = searchParams.get('numero');
  const nome = searchParams.get('nome');

  // Default response - all Meji-Je data
  if (!type && !numero && !nome) {
    return NextResponse.json({
      success: true,
      data: {
        main: mejiJeData,
        variations: Object.values(mejiOdusData),
        count: Object.keys(mejiOdusData).length,
      },
    });
  }

  // Get specific Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    if (mejiOdusData[num]) {
      return NextResponse.json({
        success: true,
        data: mejiOdusData[num],
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
    const found = Object.values(mejiOdusData).find(
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

  // Get main Meji-Je data
  if (type === 'main') {
    return NextResponse.json({
      success: true,
      data: mejiJeData,
    });
  }

  // Get all variations
  if (type === 'all') {
    return NextResponse.json({
      success: true,
      data: Object.values(mejiOdusData),
    });
  }

  return NextResponse.json({
    success: true,
    data: mejiJeData,
  });
}
