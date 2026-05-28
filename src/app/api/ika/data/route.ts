import { NextResponse } from 'next/server';

/**
 * GET /api/ika/data
 * Returns Ika-related data
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  // Ika data structure
  const ikaData = {
    nome: 'Ika',
    nomePortugues: 'Inveja',
    categoria: 'Odu menor',
    combinacoes: ['Ika-Okanran', 'Ika-Ogunda', 'Ika-Irosun'],
    elementos: ['Fogo', 'Água'],
    meses: ['Novembro', 'Dezembro'],
    dias: ['Segunda-feira', 'Quarta-feira'],
    orixas: ['Oxum', 'Iemanjá'],
   花草: ['Rosa', 'Cravo branco'],
    ebós: ['Água de flor', 'Perfume de rosa', 'Fumo branco'],
    quizilas: ['Não comer carne vermelha', 'Não consumir bebidas alcoólicas'],
    mensagens: [
      'A inveja é um veneno que consome a alma',
      'Desapegue-se das conquistas alheias',
      'Cultive sua própria força',
    ],
    significado: {
      positivo: 'Determinação, força interior, superação',
      negativo: 'Inveja, rancor, destruição',
    },
  };

  if (name) {
    if (name.toLowerCase() === 'ika') {
      return NextResponse.json({ data: ikaData });
    }
    return NextResponse.json(
      { error: 'Ika não encontrado' },
      { status: 404 }
    );
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data: ikaData });

    case 'names':
      return NextResponse.json({
        data: {
          nome: ikaData.nome,
          nomePortugues: ikaData.nomePortugues,
        },
      });

    case 'elements':
      return NextResponse.json({
        data: {
          elementos: ikaData.elementos,
          orixas: ikaData.orixas,
        },
      });

    case 'rituals':
      return NextResponse.json({
        data: {
          ebós: ikaData.ebós,
          quizilas: ikaData.quizilas,
        },
      });

    case 'messages':
      return NextResponse.json({
        data: {
          mensagens: ikaData.mensagens,
        },
      });

    case 'combinations':
      return NextResponse.json({
        data: {
          combinacoes: ikaData.combinacoes,
        },
      });

    default:
      return NextResponse.json({
        data: ikaData,
        meta: {
          total: 1,
          types: ['all', 'names', 'elements', 'rituals', 'messages', 'combinations'],
        },
      });
  }
}