import { NextResponse } from 'next/server';

/**
 * GET /api/meji-ile/data
 * Returns Meji-Ile-related data
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  // Meji-Ile data structure
  const mejiIleData = {
    nome: 'Meji-Ile',
    nomePortugues: 'Destino Terreno',
    categoria: 'Odu principal',
    combinacoes: ['Meji-Ile-Oshe', 'Meji-Ile-Ogunda', 'Meji-Ile-Irosun'],
    elementos: ['Terra', 'Agua'],
    meses: ['Marco', 'Abril'],
    dias: ['Quarta-feira', 'Domingo'],
    orixas: ['Obatala', 'Oxum'],
   花草: ['Margarida', 'Violeta branca'],
    ebós: ['Agua de obatala', 'Farinha de mandioca', 'Milho branco'],
    quizilas: ['Nao comer carne de porco', 'Nao consumir bebidas alcoólicas'],
    mensagens: [
      'O destino se revela atraves da terra',
      'Conecte-se com a forca natural',
      'Honre seus antepassados e a terra',
    ],
    significado: {
      positivo: 'Conexao com a terra, estabilidad, destino revelado',
      negativo: 'Desconexao, instabilidad, negacao do destino',
    },
  };

  if (name) {
    if (name.toLowerCase() === 'meji-ile' || name.toLowerCase() === 'mejile') {
      return NextResponse.json({ data: mejiIleData });
    }
    return NextResponse.json(
      { error: 'Meji-Ile nao encontrado' },
      { status: 404 }
    );
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data: mejiIleData });

    case 'names':
      return NextResponse.json({
        data: {
          nome: mejiIleData.nome,
          nomePortugues: mejiIleData.nomePortugues,
        },
      });

    case 'elements':
      return NextResponse.json({
        data: {
          elementos: mejiIleData.elementos,
          orixas: mejiIleData.orixas,
        },
      });

    case 'rituals':
      return NextResponse.json({
        data: {
          ebós: mejiIleData.ebós,
          quizilas: mejiIleData.quizilas,
        },
      });

    case 'messages':
      return NextResponse.json({
        data: {
          mensagens: mejiIleData.mensagens,
        },
      });

    case 'combinations':
      return NextResponse.json({
        data: {
          combinacoes: mejiIleData.combinacoes,
        },
      });

    default:
      return NextResponse.json({
        data: mejiIleData,
        meta: {
          total: 1,
          types: ['all', 'names', 'elements', 'rituals', 'messages', 'combinations'],
        },
      });
  }
}
