// Xoro API - Cabala Dos Caminhos
// GET endpoints for Xoro spiritual data

import { NextResponse } from 'next/server';
import { getData } from '@/lib/orixa/xoro-data';

// Xoro data structure
interface XoroData {
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

const xoroData: XoroData = {
  id: 'xoro-001',
  name: 'Xoro',
  namePt: 'Xoro - A Força Primordial',
  nameEn: 'Xoro - The Primal Force',
  symbol: '✧',
  yoruba: 'Xoro',
  meaning: 'Xoro',
  meaningPt: 'Xoro representa a força primordial da criação e transformação. É o arquétipo do princípio gerador que permeia toda a existência.',
  meaningEn: 'Xoro represents the primal force of creation and transformation. It is the archetype of the generating principle that permeates all existence.',
  spiritualGuidance: [
    'Reconheça o poder da transformação em sua vida',
    'Abra-se para novas possibilidades de criação',
    'Honre o princípio gerador que habita em você',
    'Cultive a energia criativa em todas as suas formas',
    'Permita que a transformação ocorra naturalmente',
  ],
  keywords: ['criação', 'transformação', 'primordial', 'geração', 'força vital', 'potencial', 'manifestação'],
  elements: ['Espírito', 'Fogo', 'Éxtase'],
  colors: ['#FFD700', '#FFA500', '#FF6347'],
  dayOfWeek: 'Domingo',
  rulingOrishas: ['Olódùmarè', 'Xoro'],
  sacredNumbers: [1, 7, 10, 21],
  greeting: 'Que a força primordial te guie!',
  rituals: [
    'Meditação de criação consciente',
    'Rituais de transformação pessoal',
    'Práticas de manifestação',
    'Cerimônias de renovação',
  ],
  offerings: [
    'Luz e fogo sagrado',
    'Águas de transformação',
    'Sementes de intenção',
    'Arte e criatividade',
  ],
  affirmations: [
    'Eu sou a força criadora em ação',
    'Transformo minha realidade com cada pensamento',
    'A source primordial flui através de mim',
    'Manifesto minha verdade com poder',
  ],
};

/**
 * GET /api/xoro/data
 * Returns Xoro-related data including Xoro archetype and associated spiritual values
 * Supports query parameters: type
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'full') {
    return NextResponse.json({
      data: xoroData,
    });
  }

  if (type === 'simple') {
    return NextResponse.json({
      data: {
        id: xoroData.id,
        name: xoroData.name,
        symbol: xoroData.symbol,
        meaning: xoroData.meaning,
      },
    });
  }

  // Default: return full data with lib data merged
  const libData = getData();
  return NextResponse.json({
    data: {
      ...xoroData,
      libData,
    },
  });
}
