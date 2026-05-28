import { NextResponse } from 'next/server';

/**
 * GET /api/meji-ika/data
 * Returns Meji-Ika-related data
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  // Meji-Ika data structure
  const mejiIkaData = {
    nome: 'Meji-Ika',
    nomePortugues: 'Transformacao',
    categoria: 'Odu principal',
    combinacoes: ['Meji-Ika-Meji', 'Meji-Ika-Ogunda', 'Meji-Ika-Osa'],
    elementos: ['Agua', 'Mar'],
    meses: ['Maio', 'Junho'],
    dias: ['Quarta-feira', 'Domingo'],
    orixas: ['Oxum', 'Olokun', 'Omolu'],
   花草: ['Lirio aquatico', 'Algodao'],
    ebós: ['Agua salgada', 'Perfume de flor do mar', 'Conchas'],
    quizilas: ['Nao comer frutos do mar contaminados', 'Nao frequentar aguas paradas'],
    mensagens: [
      'A transformacao vem com a forca das ondas',
      'Mergulhe profundo para encontrar sua verdade',
      'A agua lava mas tambem transforma',
    ],
    significado: {
      positivo: 'Renovacao, transformacao, purificacao, fluxo',
      negativo: 'Afogamento, inundaçao, perda de controle',
    },
  };

  if (name) {
    if (name.toLowerCase() === 'meji-ika') {
      return NextResponse.json({ data: mejiIkaData });
    }
    return NextResponse.json(
      { error: 'Meji-Ika nao encontrado' },
      { status: 404 }
    );
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data: mejiIkaData });

    case 'names':
      return NextResponse.json({
        data: {
          nome: mejiIkaData.nome,
          nomePortugues: mejiIkaData.nomePortugues,
        },
      });

    case 'elements':
      return NextResponse.json({
        data: {
          elementos: mejiIkaData.elementos,
          orixas: mejiIkaData.orixas,
        },
      });

    case 'rituals':
      return NextResponse.json({
        data: {
          ebós: mejiIkaData.ebós,
          quizilas: mejiIkaData.quizilas,
        },
      });

    case 'messages':
      return NextResponse.json({
        data: {
          mensagens: mejiIkaData.mensagens,
        },
      });

    case 'combinations':
      return NextResponse.json({
        data: {
          combinacoes: mejiIkaData.combinacoes,
        },
      });

    default:
      return NextResponse.json({
        data: mejiIkaData,
        meta: {
          total: 1,
          types: ['all', 'names', 'elements', 'rituals', 'messages', 'combinations'],
        },
      });
  }
}