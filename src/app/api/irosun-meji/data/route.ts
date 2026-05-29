// Irosun Meji API - Cabala Dos Caminhos
// GET endpoints for Irosun Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Irosun Meji data structure based on Ifá lore
interface IrosunMejiData {
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

const irosunMejiData: IrosunMejiData = {
  id: 'irosun-meji-001',
  name: 'Irosun Meji',
  namePt: 'Irosun Meji - A Crítica que Ilumina',
  nameEn: 'Irosun Meji - The Criticism that Illuminates',
  symbol: '☱☲',
  yoruba: 'Ìrosùn Méjì',
  meaning: 'Irosun Meji',
  meaningPt: 'Irosun Meji representa a crítica construtiva, a introspecção, e a autodescoberta. É o Odu do espelho que reflete a alma.',
  meaningEn: 'Irosun Meji symbolizes constructive criticism, introspection, and self-discovery. It is the Odu of the mirror that reflects the soul.',
  spiritualGuidance: [
    'A crítica construtiva ilumina o caminho da evolução espiritual',
    'A introspecção é a ferramenta mais poderosa para o autoconhecimento',
    'O espelho interno revela as verdades que precisamos enfrentar',
    'A autocrítica sagrada leva à transformação e ao crescimento'
  ],
  keywords: ['crítica', 'introspecção', 'reflexão', 'autoconhecimento', 'espelho', 'descoberta'],
  elements: ['Espelho', 'Reflexo', 'Luz Interior'],
  colors: ['#4A0E0E', '#8B0000', '#CD5C5C'],
  dayOfWeek: 'Domingo',
  rulingOrishas: ['Irosun', 'Olódùmarè', 'Orunmila'],
  sacredNumbers: [8, 16, 24, 88],
  greeting: 'Ewo!',
  rituals: [
    'Consultar o merindilogun com arroz e cocos para receber orientação',
    'Oferecer Ebo de purificação com folhas sagradas de Irosun',
    'Fazer ebó de autocrítica para reconhecer falhas e transformá-las',
    'Pedir orientação de Ifá nos momentos de dúvida e reflexão'
  ],
  offerings: [
    'Coco ralado (obí)',
    'Água de obi',
    'Folhas de ewe (plantas sagradas)',
    'Duas velas vermelhas',
    'Din fário (moedas)'
  ],
  affirmations: [
    'Eu abraço a autocrítica como ferramenta de crescimento',
    'Minha natureza dupla me traz poder e equilíbrio',
    'A luz da introspecção ilumina meu caminho',
    'Eu sou Odu de sabedoria e descoberta interior',
    'O espelho da alma revela minha verdade sagrada'
  ]
};

/**
 * GET /api/irosun-meji/data
 * Returns Irosun Meji-related data including spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const numero = searchParams.get('numero');
  const nome = searchParams.get('nome');

  if (type === 'full') {
    return NextResponse.json({
      success: true,
      data: irosunMejiData
    });
  }

  if (numero || nome) {
    const filteredByNumero = numero ? Object.values(mejiOdusData).find(o => o.sacredNumbers.includes(parseInt(numero))) : null;
    const filteredByNome = nome ? Object.values(mejiOdusData).find(o => o.name.toLowerCase().includes(nome.toLowerCase())) : null;
    
    if (filteredByNumero || filteredByNome) {
      return NextResponse.json({
        success: true,
        data: filteredByNumero || filteredByNome
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: irosunMejiData,
    greeting: irosunMejiData.greeting,
    odu: irosunMejiData.name,
    yoruba: irosunMejiData.yoruba
  });
}

// Combined 16 Meji Odus
const mejiOdusData: Record<number, IrosunMejiData> = {
  3: irosunMejiData
};
