// Meji-Ikate API - Cabala Dos Caminhos
// GET endpoints for Meji-Ikate Odu spiritual data

import { NextResponse } from 'next/server';

// Meji-Ikate data structure based on Ifá lore
interface MejiIkateData {
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

const mejiIkateData: MejiIkateData = {
  id: 'meji-ikate-001',
  name: 'Meji-Ikate',
  namePt: 'Meji-Ikate - A Duplicação com Transformação',
  nameEn: 'Meji-Ikate - The Duplication with Transformation',
  symbol: '☰☱',
  yoruba: 'Ìkàté Méjì',
  meaning: 'Meji-Ikate',
  meaningPt: 'Meji-Ikate representa a duplicação conjugada com transformação. É o Odu que fala da mudança inevitável e da necessidade de adaptar-se às novas circunstâncias. Une o poder da duplicação com a energia da transformação.',
  meaningEn: 'Meji-Ikate represents duplication conjugated with transformation. It is the Odu that speaks of inevitable change and the need to adapt to new circumstances. It unites the power of duplication with the energy of transformation.',
  spiritualGuidance: [
    'A transformação é parte natural da vida espiritual',
    'Duplica sua energia positiva para atravessar mudanças',
    'Aceita que algumas coisas devem mudar para que outras possam nascer',
    'A sabedoria ancestral guia sua jornada de renovação',
    'Permita que o antigo se transforme em novo',
  ],
  keywords: ['transformação', 'duplicação', 'mudança', 'adaptação', 'renovação', 'transição', 'evolução', 'renascimento'],
  elements: ['Água', 'Ar', 'Fogo Transformador'],
  colors: ['#1E90FF', '#FFD700', '#8B0000'],
  dayOfWeek: 'Segunda-feira',
  rulingOrishas: ['Olódùmarè', 'Oxum', 'Orunmila'],
  sacredNumbers: [2, 8, 16, 32],
  greeting: 'Transformation brings renewal!',
  rituals: [
    'Banho de folhas de ikate em água de flor de oxum',
    'Oração ao nascer do sol pedindo transformação',
    'Oferecer água doce ao orixá Oxum',
    'Queimar incenso de Alecrim para renovação espiritual',
    'Meditar sobre mudanças necessárias na vida',
  ],
  offerings: [
    'Água doce fresca',
    'Flores amarelas e azuis',
    'Mel',
    'Oponente (moeda)',
    'Inhame cozido',
  ],
  affirmations: [
    'Eu abraço a transformação com coragem',
    'Minha energia se multiplica na luz',
    'Aceito as mudanças que tragam crescimento',
    'A transformação flui através de mim',
  ],
};

/**
 * GET /api/meji-ikate/data
 * Returns Meji-Ikate-related data including Meji-Ikate Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const numero = url.searchParams.get('numero');
  const nome = url.searchParams.get('nome');

  // Handle specific query types
  if (type) {
    switch (type) {
      case 'all':
        return NextResponse.json({
          data: mejiIkateData,
          meta: {
            source: 'Cabala Dos Caminhos - Meji-Ikate API',
            version: '1.0.0',
          },
        });

      case 'meaning':
        return NextResponse.json({
          data: {
            meaning: mejiIkateData.meaning,
            meaningPt: mejiIkateData.meaningPt,
            meaningEn: mejiIkateData.meaningEn,
          },
        });

      case 'spiritual':
        return NextResponse.json({
          data: {
            spiritualGuidance: mejiIkateData.spiritualGuidance,
            keywords: mejiIkateData.keywords,
            greeting: mejiIkateData.greeting,
          },
        });

      case 'elements':
        return NextResponse.json({
          data: {
            elements: mejiIkateData.elements,
            colors: mejiIkateData.colors,
            dayOfWeek: mejiIkateData.dayOfWeek,
          },
        });

      case 'orishas':
        return NextResponse.json({
          data: {
            rulingOrishas: mejiIkateData.rulingOrishas,
            sacredNumbers: mejiIkateData.sacredNumbers,
          },
        });

      case 'rituals':
        return NextResponse.json({
          data: {
            rituals: mejiIkateData.rituals,
            offerings: mejiIkateData.offerings,
          },
        });

      case 'affirmations':
        return NextResponse.json({
          data: {
            affirmations: mejiIkateData.affirmations,
          },
        });

      default:
        return NextResponse.json(
          { error: 'Tipo inválido. Tipos disponíveis: all, meaning, spiritual, elements, orishas, rituals, affirmations' },
          { status: 400 }
        );
    }
  }

  // Handle numero parameter for Meji-Ikate specific requests
  if (numero) {
    const num = parseInt(numero, 10);
    if (num >= 1 && num <= 16) {
      return NextResponse.json({
        data: {
          ...mejiIkateData,
          id: `meji-ikate-${num.toString().padStart(3, '0')}`,
        },
      });
    }
    return NextResponse.json(
      { error: 'Número inválido. Use 1-16 para Meji-Ikate.' },
      { status: 400 }
    );
  }

  // Handle nome parameter
  if (nome) {
    if (nome.toLowerCase() === 'meji-ikate' || nome.toLowerCase() === 'mejiikate') {
      return NextResponse.json({ data: mejiIkateData });
    }
    return NextResponse.json(
      { error: 'Meji-Ikate não encontrado' },
      { status: 404 }
    );
  }

  // Default: return full data
  return NextResponse.json({
    data: mejiIkateData,
    meta: {
      source: 'Cabala Dos Caminhos - Meji-Ikate API',
      version: '1.0.0',
      total: 1,
      types: ['all', 'meaning', 'spiritual', 'elements', 'orishas', 'rituals', 'affirmations'],
    },
  });
}