import { NextResponse } from 'next/server';

/**
 * GET /api/ika-meji/data
 * Returns Ika-Meji-related data
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  // Ika-Meji data structure
  const ikaMejiData = {
    nome: 'Ika-Meji',
    nomePortugues: 'Transformacao',
    categoria: 'Odu principal',
    combinacoes: ['Ika-Meji-Ika', 'Ika-Meji-Meji', 'Ika-Meji-Ogunda'],
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
    if (name.toLowerCase() === 'ika-meji') {
      return NextResponse.json({ data: ikaMejiData });
    }
    return NextResponse.json(
      { error: 'Ika-Meji nao encontrado' },
      { status: 404 }
    );
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data: ikaMejiData });

    case 'names':
      return NextResponse.json({
        data: {
          nome: ikaMejiData.nome,
          nomePortugues: ikaMejiData.nomePortugues,
        },
      });

    case 'elements':
      return NextResponse.json({
        data: {
          elementos: ikaMejiData.elementos,
          orixas: ikaMejiData.orixas,
        },
      });

    case 'rituals':
      return NextResponse.json({
        data: {
          ebós: ikaMejiData.ebós,
          quizilas: ikaMejiData.quizilas,
        },
      });

    case 'messages':
      return NextResponse.json({
        data: {
          mensagens: ikaMejiData.mensagens,
        },
      });

    case 'combinations':
      return NextResponse.json({
        data: {
          combinacoes: ikaMejiData.combinacoes,
        },
      });

    default:
      return NextResponse.json({
        data: ikaMejiData,
        meta: {
          total: 1,
          types: ['all', 'names', 'elements', 'rituals', 'messages', 'combinations'],
        },
      });
  }
}