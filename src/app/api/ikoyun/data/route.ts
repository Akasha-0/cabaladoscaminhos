import { NextResponse } from 'next/server';

/**
 * GET /api/ikoyun/data
 * Returns ikoyun-related data
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  const ikoyunData = [
    {
      id: 'ikoyun-1',
      nome: 'Ikoyun',
      descricao: 'Guardião dos segredos ancestrais e da sabedoria oculta',
      saudacao: 'E ku itoju!',
      elementos: ['ar', 'fogo'],
      cores: ['branco', 'dourado'],
      planeta: 'mercúrio',
      chakra: 'coroa',
      orixas: [],
      hierbas: [],
      qualidades: ['discrição', 'sabedoria', 'proteção espiritual'],
    },
  ];

  if (name) {
    const item = ikoyunData.find((i) =>
      i.nome.toLowerCase() === name.toLowerCase()
    );

    if (!item) {
      return NextResponse.json(
        { error: 'Ikoyun não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: item });
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data: ikoyunData });

    case 'names':
      return NextResponse.json({
        data: ikoyunData.map((i) => ({ nome: i.nome, saudacao: i.saudacao })),
      });

    case 'elements':
      return NextResponse.json({
        data: ikoyunData.map((i) => ({
          nome: i.nome,
          elementos: i.elementos,
          cores: i.cores,
        })),
      });

    default:
      return NextResponse.json({
        data: ikoyunData,
        meta: {
          total: ikoyunData.length,
          types: ['all', 'names', 'elements'],
        },
      });
  }
}