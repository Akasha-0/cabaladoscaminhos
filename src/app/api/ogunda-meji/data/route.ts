import { NextResponse } from 'next/server';

/**
 * GET /api/ogunda-meji/data
 * Returns Ogunda-Meji-related data
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  // Ogunda-Meji data structure
  const ogundaMejiData = {
    nome: 'Ogunda-Meji',
    nomePortugues: 'Ogunda-Meji - A Duplicacao',
    categoria: 'Odu duplicado',
    combinacoes: ['Ogunda-Meji-Ogunda', 'Ogunda-Meji-Meji', 'Ogunda-Meji-Osa'],
    elementos: ['Ferro', 'Fogo', 'Metal'],
    meses: ['Janeiro', 'Maio', 'Setembro'],
    dias: ['Quarta-feira', 'Domingo'],
    orixas: ['Ogunda', 'Ogun', 'Shango'],
    ebós: ['Alcool de cerebro', 'Pedras de ferro', 'Musgo de ferro'],
    quizilas: ['Nao mentir', 'Nao usar palavras erradas', 'Nao quebrar promessas'],
    mensagens: [
      'A forca do ferro corta todos os obstaculos',
      'O guerreiro que duplica sua forca conquista o destino',
      'O ferro forja o destino nas maos daquele que trabalha',
    ],
    significado: {
      positivo: 'Forca, coragem, conquista, trabalho, determinacao',
      negativo: 'Brutalidade, violencia, orgulho excessivo',
    },
  };

  if (name) {
    if (name.toLowerCase() === 'ogunda-meji') {
      return NextResponse.json({ data: ogundaMejiData });
    }
    return NextResponse.json(
      { error: 'Ogunda-Meji nao encontrado' },
      { status: 404 }
    );
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data: ogundaMejiData });

    case 'names':
      return NextResponse.json({
        data: {
          nome: ogundaMejiData.nome,
          nomePortugues: ogundaMejiData.nomePortugues,
        },
      });

    case 'elements':
      return NextResponse.json({
        data: {
          elementos: ogundaMejiData.elementos,
          orixas: ogundaMejiData.orixas,
        },
      });

    case 'rituals':
      return NextResponse.json({
        data: {
          ebós: ogundaMejiData.ebós,
          quizilas: ogundaMejiData.quizilas,
        },
      });

    case 'messages':
      return NextResponse.json({
        data: {
          mensagens: ogundaMejiData.mensagens,
        },
      });

    case 'combinations':
      return NextResponse.json({
        data: {
          combinacoes: ogundaMejiData.combinacoes,
        },
      });

    default:
      return NextResponse.json({
        data: ogundaMejiData,
        meta: {
          total: 1,
          types: ['all', 'names', 'elements', 'rituals', 'messages', 'combinations'],
        },
      });
  }
}
