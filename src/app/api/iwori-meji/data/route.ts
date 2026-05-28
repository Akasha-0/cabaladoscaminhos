// Iwori-Meji API - Cabala Dos Caminhos
// GET endpoints for Iwori-Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Iwori-Meji data structure based on Ifá lore
interface IworiMejiData {
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

const iworiMejiData: IworiMejiData = {
  id: 'iwori-meji-004',
  name: 'Iwori-Meji',
  namePt: 'Iwori-Meji - A Dualidade Revelada',
  nameEn: 'Iwori-Meji - The Revealed Duality',
  symbol: '☷☷',
  yoruba: 'Ìwòrì Méjì',
  meaning: 'Iwori-Meji',
  meaningPt: 'Iwori-Meji representa a dualidade revelada, o espelho entre mundos, a sabedoria oculta que emerge. É o Odu que governa a comunicação entre o visível e o invisível, o encontro do sagrado e do profano através da revelação.',
  meaningEn: 'Iwori-Meji symbolizes the revealed duality, the mirror between worlds, the hidden wisdom that emerges. It is the Odu that governs communication between the visible and invisible, the encounter of the sacred and profane through revelation.',
  spiritualGuidance: [
    'Busque a verdade nos dualismos da vida',
    'Reconheça que opposites se complementam',
    'Abrace a sabedoria oculta que emerge',
    'Desenvolva visão além das aparências',
    'Honre a conexão entre mundos',
  ],
  keywords: ['dualidade', 'revelação', 'espelho', 'oculto', 'complementaridade', 'visível', 'invisível', 'sagrado'],
  elements: ['Fogo Solar', 'Água Lunar', 'Ar Espiritual'],
  colors: ['#FFD700', '#4169E1', '#8B008B'],
  dayOfWeek: 'Domingo',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Oxum', 'Eshu'],
  sacredNumbers: [2, 4, 8, 44],
  greeting: 'Duality reveals the truth!',
  rituals: [
    'Aquecimento de两块一块',
    'Mergulho ritual em águas sagradas',
    'Jogo de opostos sagrados',
    'Luz e sombra meditativos',
  ],
  offerings: [
    'Melão amargo (Melão de Ewá)',
    'Duas velas acesas',
    'Coco fresco',
    'Flores brancas e douradas',
  ],
  affirmations: [
    'Eu abraço a dualidade como caminho de iluminação',
    'Na opposição encontro harmonia',
    'A verdade emerge do espelho',
  ],
};

// Combined 16 Iwori-Meji Odus
const iworiMejiOdusData: Record<number, IworiMejiData> = {
  1: { ...iworiMejiData, id: 'iwori-meji-001', name: 'Iwori-Meji Odu 1' },
  2: { ...iworiMejiData, id: 'iwori-meji-002', name: 'Iwori-Meji Odu 2' },
  3: { ...iworiMejiData, id: 'iwori-meji-003', name: 'Iwori-Meji Odu 3' },
  4: { ...iworiMejiData, id: 'iwori-meji-004', name: 'Iwori-Meji Odu 4' },
  5: { ...iworiMejiData, id: 'iwori-meji-005', name: 'Iwori-Meji Odu 5' },
  6: { ...iworiMejiData, id: 'iwori-meji-006', name: 'Iwori-Meji Odu 6' },
  7: { ...iworiMejiData, id: 'iwori-meji-007', name: 'Iwori-Meji Odu 7' },
  8: { ...iworiMejiData, id: 'iwori-meji-008', name: 'Iwori-Meji Odu 8' },
  9: { ...iworiMejiData, id: 'iwori-meji-009', name: 'Iwori-Meji Odu 9' },
  10: { ...iworiMejiData, id: 'iwori-meji-010', name: 'Iwori-Meji Odu 10' },
  11: { ...iworiMejiData, id: 'iwori-meji-011', name: 'Iwori-Meji Odu 11' },
  12: { ...iworiMejiData, id: 'iwori-meji-012', name: 'Iwori-Meji Odu 12' },
  13: { ...iworiMejiData, id: 'iwori-meji-013', name: 'Iwori-Meji Odu 13' },
  14: { ...iworiMejiData, id: 'iwori-meji-014', name: 'Iwori-Meji Odu 14' },
  15: { ...iworiMejiData, id: 'iwori-meji-015', name: 'Iwori-Meji Odu 15' },
  16: { ...iworiMejiData, id: 'iwori-meji-016', name: 'Iwori-Meji Odu 16' },
};

/**
 * GET /api/iwori-meji/data
 * Returns Iwori-Meji-related data including Iwori-Meji Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const numero = searchParams.get('numero');
    const nome = searchParams.get('nome');

    // Default: return all Iwori-Meji data
    if (!type && !numero && !nome) {
      return NextResponse.json({
        success: true,
        odu: iworiMejiData,
        odus: iworiMejiOdusData,
        message: 'Iwori-Meji spiritual data retrieved successfully',
      });
    }

    // Filter by type
    if (type === 'principal') {
      return NextResponse.json({
        success: true,
        odu: iworiMejiData,
        message: 'Iwori-Meji principal Odu retrieved',
      });
    }

    if (type === 'todos') {
      return NextResponse.json({
        success: true,
        odus: iworiMejiOdusData,
        total: 16,
        message: 'All Iwori-Meji Odus retrieved',
      });
    }

    // Filter by numero (1-16)
    if (numero) {
      const num = parseInt(numero, 10);
      if (num >= 1 && num <= 16) {
        return NextResponse.json({
          success: true,
          odu: iworiMejiOdusData[num],
          numero: num,
          message: `Iwori-Meji Odu ${num} retrieved`,
        });
      }
      return NextResponse.json(
        { success: false, error: 'Número must be between 1 and 16' },
        { status: 400 }
      );
    }

    // Filter by nome
    if (nome) {
      const matchedOdu = Object.values(iworiMejiOdusData).find(
        (o) => o.name.toLowerCase().includes(nome.toLowerCase())
      );
      if (matchedOdu) {
        return NextResponse.json({
          success: true,
          odu: matchedOdu,
          message: `Iwori-Meji Odu matching "${nome}" retrieved`,
        });
      }
      return NextResponse.json(
        { success: false, error: `No Iwori-Meji Odu found matching "${nome}"` },
        { status: 404 }
      );
    }

    // Fallback: return all data
    return NextResponse.json({
      success: true,
      odu: iworiMejiData,
      odus: iworiMejiOdusData,
      message: 'Iwori-Meji spiritual data retrieved',
    });
  } catch (error) {
    console.error('Iwori-Meji API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}