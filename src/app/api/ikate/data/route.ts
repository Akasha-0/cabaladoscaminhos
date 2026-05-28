import { NextResponse } from 'next/server';

/**
 * GET /api/ikate/data
 * Returns Ikate-related data
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  // Ikate data structure
  const ikateData = {
    nome: 'Ikate',
    nomePortugues: 'Transformacao',
    categoria: 'Odu menor',
    combinacoes: ['Ikate-Irosun', 'Ikate-Ogunda', 'Ikate-Okanran'],
    elementos: ['Agua', 'Fogo'],
    meses: ['Outubro', 'Novembro'],
    dias: ['Terca-feira', 'Sexta-feira'],
    orixas: ['Oxum', 'Omolu'],
ervas: ['Girassol', 'Lirio branco'],
    ebós: ['Agua de oxum', 'Perfume de flor', 'Fumo branco'],
    quizilas: ['Nao comer peixe salgado', 'Nao consumir doces em excesso'],
    mensagens: [
      'A transformacao e o caminho da vida',
      'Deixe fluir o que nao pode ser mudado',
      'Aguarde com paciencia o seu momento',
    ],
    significado: {
      positivo: 'Renovacao, cambio, superacao',
      negativo: 'Estagnacao, medo da mudanca, resistencia',
    },
  };

  if (name) {
    if (name.toLowerCase() === 'ikate') {
      return NextResponse.json({ data: ikateData });
    }
    return NextResponse.json(
      { error: 'Ikate nao encontrado' },
      { status: 404 }
    );
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data: ikateData });

    case 'names':
      return NextResponse.json({
        data: {
          nome: ikateData.nome,
          nomePortugues: ikateData.nomePortugues,
        },
      });

    case 'elements':
      return NextResponse.json({
        data: {
          elementos: ikateData.elementos,
          orixas: ikateData.orixas,
        },
      });

    case 'rituals':
      return NextResponse.json({
        data: {
          ebós: ikateData.ebós,
          quizilas: ikateData.quizilas,
        },
      });

    case 'messages':
      return NextResponse.json({
        data: {
          mensagens: ikateData.mensagens,
        },
      });

    case 'combinations':
      return NextResponse.json({
        data: {
          combinacoes: ikateData.combinacoes,
        },
      });

    default:
      return NextResponse.json({
        data: ikateData,
        meta: {
          total: 1,
          types: ['all', 'names', 'elements', 'rituals', 'messages', 'combinations'],
        },
      });
  }
}
