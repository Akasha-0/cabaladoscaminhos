import { NextResponse } from 'next/server';
import { orixas } from '@/lib/data/spiritual-data';

/**
 * GET /api/orixa/data
 * Returns orixá-related data including all orixás and their details
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  if (name) {
    const orixa = orixas.find((o) =>
      o.nome.toLowerCase() === name.toLowerCase()
    );

    if (!orixa) {
      return NextResponse.json(
        { error: 'Orixá não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: orixa });
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data: orixas });

    case 'names':
      return NextResponse.json({
        data: orixas.map((o) => ({ nome: o.nome, saudacao: o.saudacao })),
      });

    case 'elements':
      return NextResponse.json({
        data: orixas.map((o) => ({
          nome: o.nome,
          cores: o.cores,
          chakra: o.chakra,
          planeta: o.planeta,
        })),
      });

    case 'rituals':
      return NextResponse.json({
        data: orixas.map((o) => ({
          nome: o.nome,
          ervas: o.ervas,
          quizilas: o.quizilas,
        })),
      });

    default:
      return NextResponse.json({
        data: orixas,
        meta: {
          total: orixas.length,
          types: ['all', 'names', 'elements', 'rituals'],
        },
      });
  }
}
