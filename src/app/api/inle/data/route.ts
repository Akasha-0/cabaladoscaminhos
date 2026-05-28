// Inle API - Cabala Dos Caminhos
// GET endpoints for Inle Orixa spiritual data

import { NextResponse } from 'next/server';

const inleData = {
  id: 'inle',
  name: 'Inlé',
  namePt: 'Inlé - Senhor da Beleza e da Caça',
  nameEn: 'Inle - Lord of Beauty and Hunting',
  symbol: '⚖️',
  element: 'Mata e água',
  meaning:
    'Inlé é irmão gêmeo de Oxóssi, conhecido por sua beleza incomparável. Representa a medicina e a arte da caça.',
  meaningPt:
    'Inlé é irmão gêmeo de Oxóssi, conhecido por sua beleza incomparável. Representa a medicina e a arte da caça.',
  meaningEn:
    'Inle is the twin brother of Oxossi, known for his incomparable beauty. He represents medicine and the art of hunting.',
  qualities: ['Beleza', 'Medicina', 'Caça', 'Amor', 'Mente clara', 'Criatividade'],
  challenges: ['Instabilidade', 'Indecisão', 'Perfeccionismo'],
  rulingPlanet: 'Lua e Mercúrio',
  colors: ['#00008B', '#FFD700'],
  dayOfWeek: 'Terça-feira',
  numbersSacred: [3, 7],
  greeting: 'Eyi!',
  archetype: 'O Esteta',
  sacredAnimals: ['Antílope', 'Peixe'],
  plants: ['Plantas medicinais', 'Flores brancas'],
  offerings: ['Mel', 'Flores', 'Peixe', 'Perfume'],
  chants: ['Inlé', 'Baba', 'Okê'],
  symbols: ['Espelho', 'Rede', 'Pente de ouro'],
  mythology:
    'Inlé é irmão gêmeo de Oxóssi, conhecido por sua beleza incomparável. Representa a medicina e a arte da caça.',
  spiritualLesson: 'A beleza e a cura podem coexistir em harmonia perfeita',
  affirmation:
    'Eu Alinho minha mente e coração para criar beleza e cura em minha vida',
  meditation:
    'Sinta a energia de healers, permitindo que cura e estética se unam',
  spiritualGuidance: [
    'Busque a beleza interior que reflete no exterior.',
    'A medicina e a cura vêm através da conexão com a natureza.',
    'A clareza mental é essencial para decisões importantes.',
    'O amor e a arte são expressões da mesma fonte divina.',
  ],
  keywords: [
    'beleza',
    'medicina',
    'caça',
    'amor',
    'criatividade',
    'mente clara',
    'gêmeo',
    'healing',
  ],
  path: 'Ogbe',
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  switch (type) {
    case 'all':
      return NextResponse.json({ data: inleData });

    case 'keywords':
      return NextResponse.json({ data: { keywords: inleData.keywords } });

    case 'qualities':
      return NextResponse.json({ data: { qualities: inleData.qualities } });

    case 'challenges':
      return NextResponse.json({
        data: { challenges: inleData.challenges },
      });

    case 'colors':
      return NextResponse.json({ data: { colors: inleData.colors } });

    case 'symbols':
      return NextResponse.json({ data: { symbols: inleData.symbols } });

    case 'offerings':
      return NextResponse.json({ data: { offerings: inleData.offerings } });

    case 'rituals':
      return NextResponse.json({ data: { rituals: inleData.sacredAnimals } });

    case 'spiritual-guidance':
      return NextResponse.json({
        data: { spiritualGuidance: inleData.spiritualGuidance },
      });

    default:
      return NextResponse.json({
        data: {
          id: inleData.id,
          name: inleData.name,
          namePt: inleData.namePt,
          nameEn: inleData.nameEn,
          symbol: inleData.symbol,
          meaning: inleData.meaning,
          description: inleData.meaningPt,
          archetype: inleData.archetype,
          element: inleData.element,
          dayOfWeek: inleData.dayOfWeek,
        },
      });
  }
}