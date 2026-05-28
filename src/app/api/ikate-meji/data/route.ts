// Ikate-Meji API - Cabala Dos Caminhos
// GET endpoints for Ikate-Meji Odu spiritual data (compound odu)

import { NextResponse } from 'next/server';

/**
 * GET /api/ikate-meji/data
 * Returns Ikate-Meji compound Odu spiritual data
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  // Ikate-Meji data structure
  const ikateMejiData = {
    id: 'ikate-meji-001',
    nome: 'Ikate-Meji',
    nomePortugues: 'Transformacao com Duplicacao',
    categoria: 'Odu composto',
    elementos: ['Agua', 'Fogo', 'Ar'],
    meses: ['Outubro', 'Novembro', 'Janeiro'],
    dias: ['Terca-feira', 'Sexta-feira', 'Segunda-feira'],
    orixas: ['Oxum', 'Omolu', 'Orunmila'],
    ervas: ['Girassol', 'Lirio branco', 'Babosa'],
    ebós: ['Agua de oxum', 'Perfume de flor', 'Fumo branco', 'Duas velas brancas'],
    quizilas: ['Nao comer peixe salgado', 'Nao consumir doces em excesso', 'Evitar ambicao desmedida'],
    combinacoes: ['Ikate-Meji-Irosun', 'Ikate-Meji-Ogunda'],
    significado: {
      positivo: 'Duplicacao da transformacao, renovacao profunda, superacao de desafios',
      negativo: 'Transformacao excessiva, instabilidade, confusao',
    },
    mensagens: [
      'A transformacao duplicada traz forca',
      'Renove-se interiormente para receber o novo',
      'A paciencia e a chave para a sucesso',
    ],
    numerologia: {
      numerosSagrados: [2, 8, 16, 32],
      arcano: 8,
    },
    alquimia: {
      elementos: ['Agua transformadora', 'Fogo purificador', 'Ar equilibrante'],
      processo: 'Duplicacao da renovacao',
    },
  };

  if (name) {
    if (name.toLowerCase() === 'ikate-meji') {
      return NextResponse.json({ data: ikateMejiData });
    }
    return NextResponse.json(
      { error: 'Ikate-Meji nao encontrado' },
      { status: 404 }
    );
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data: ikateMejiData });

    case 'names':
      return NextResponse.json({
        data: {
          nome: ikateMejiData.nome,
          nomePortugues: ikateMejiData.nomePortugues,
        },
      });

    case 'elements':
      return NextResponse.json({
        data: {
          elementos: ikateMejiData.elementos,
          orixas: ikateMejiData.orixas,
        },
      });

    case 'rituals':
      return NextResponse.json({
        data: {
          ebós: ikateMejiData.ebós,
          quizilas: ikateMejiData.quizilas,
        },
      });

    case 'messages':
      return NextResponse.json({
        data: {
          mensagens: ikateMejiData.mensagens,
        },
      });

    case 'combinations':
      return NextResponse.json({
        data: {
          combinacoes: ikateMejiData.combinacoes,
        },
      });

    case 'numerology':
      return NextResponse.json({
        data: {
          numerosSagrados: ikateMejiData.numerologia.numerosSagrados,
          arcano: ikateMejiData.numerologia.arcano,
        },
      });

    default:
      return NextResponse.json({
        data: ikateMejiData,
        meta: {
          total: 1,
          types: ['all', 'names', 'elements', 'rituals', 'messages', 'combinations', 'numerology'],
        },
      });
  }
}