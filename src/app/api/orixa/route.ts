import { NextRequest, NextResponse } from 'next/server';
import { orixas } from '@/lib/data/spiritual-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nome = searchParams.get('nome');

  if (nome) {
    const orixa = orixas.find((o) =>
      o.nome.toLowerCase() === nome.toLowerCase()
    );

    if (!orixa) {
      const suggestions = orixas
        .filter((o) => o.nome.toLowerCase().includes(nome.toLowerCase()))
        .map((o) => o.nome);

      return NextResponse.json(
        {
          orixa: null,
          error: 'Orixá não encontrado',
          suggestions: suggestions.length > 0 ? suggestions : orixas.map((o) => o.nome),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ orixa });
  }

  return NextResponse.json({
    orixas,
    meta: {
      total: orixas.length,
    },
  });
}
