// Oaxoare API - Cabala Dos Caminhos
// GET endpoints for Oaxoare Odu spiritual data

import { NextResponse } from 'next/server';

// Oaxoare data structure based on Ifá lore
interface OaxoareData {
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

const oaxoareData: OaxoareData = {
  id: 'oaxoare-001',
  name: 'Oaxoare',
  namePt: 'Oaxoare - O Mensageiro',
  nameEn: 'Oaxoare - The Messenger',
  symbol: '✦',
  yoruba: 'Ọ̀xọ́arẹ́',
  meaning: 'Oaxoare',
  meaningPt: 'Oaxoare representa comunicação, transformação, movimento e conexão espiritual. É o Odu do mensageiro entre mundos.',
  meaningEn: 'Oaxoare symbolizes communication, transformation, movement, and spiritual connection. It is the Odu of the messenger between worlds.',
  spiritualGuidance: [
    'Seek clarity in communication',
    'Embrace transformation with grace',
    'Trust the journey between worlds',
    'Connect with ancestral wisdom',
    'Move with intention and purpose'
  ],
  keywords: ['comunicação', 'transformação', 'movimento', 'mensagem', 'conexão', 'sabedoria'],
  elements: ['Ar', 'Espírito', 'Luz Lunar'],
  colors: ['#E6E6FA', '#9370DB', '#8A2BE2'],
  dayOfWeek: 'Segunda-feira',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Elefún'],
  sacredNumbers: [3, 6, 9, 12],
  greeting: 'The messenger arrives!',
  rituals: [
    'Light violet candles to enhance spiritual communication',
    'Burn sage for purification before ritual',
    'Recite ancient verses of transformation',
    'Honor the messenger spirits with offerings'
  ],
  offerings: [
    'White flowers',
    'Incense (sandalwood)',
    'Clear water in a silver vessel',
    'Honey and coconut'
  ],
  affirmations: [
    'I communicate with clarity and purpose',
    'I embrace transformation with grace',
    'My words carry wisdom and truth',
    'I am connected to all realms of existence'
  ]
};

// Combined 16 Odus with Oaxoare
const odusData: Record<number, OaxoareData> = {
  1: { ...oaxoareData, id: 'oaxoare-001', name: 'Oaxoare', symbol: '✦' },
};

/**
 * GET /api/oaxoare/data
 * Returns Oaxoare-related data including Oaxoare Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'full';
  const numero = searchParams.get('numero');
  const nome = searchParams.get('nome');

  // Handle specific odu number request
  if (numero && odusData[parseInt(numero)]) {
    return NextResponse.json({
      success: true,
      data: odusData[parseInt(numero)],
      source: 'cabala-dos-caminhos'
    });
  }

  // Handle odu name request
  if (nome) {
    const normalizedNome = nome.toLowerCase().trim();
    const found = Object.values(odusData).find(
      odu => odu.name.toLowerCase() === normalizedNome || 
             odu.namePt.toLowerCase().includes(normalizedNome)
    );
    if (found) {
      return NextResponse.json({
        success: true,
        data: found,
        source: 'cabala-dos-caminhos'
      });
    }
  }

  // Default: return full Oaxoare data or requested type
  if (type === 'full') {
    return NextResponse.json({
      success: true,
      data: oaxoareData,
      source: 'cabala-dos-caminhos'
    });
  }

  if (type === 'guidance') {
    return NextResponse.json({
      success: true,
      data: {
        spiritualGuidance: oaxoareData.spiritualGuidance,
        affirmations: oaxoareData.affirmations
      },
      source: 'cabala-dos-caminhos'
    });
  }

  if (type === 'ritual') {
    return NextResponse.json({
      success: true,
      data: {
        rituals: oaxoareData.rituals,
        offerings: oaxoareData.offerings
      },
      source: 'cabala-dos-caminhos'
    });
  }

  if (type === 'basic') {
    return NextResponse.json({
      success: true,
      data: {
        id: oaxoareData.id,
        name: oaxoareData.name,
        namePt: oaxoareData.namePt,
        symbol: oaxoareData.symbol,
        meaning: oaxoareData.meaningPt
      },
      source: 'cabala-dos-caminhos'
    });
  }

  // Default response
  return NextResponse.json({
    success: true,
    data: oaxoareData,
    source: 'cabala-dos-caminhos'
  });
}