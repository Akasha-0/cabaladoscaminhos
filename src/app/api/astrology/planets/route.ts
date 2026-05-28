import { NextRequest, NextResponse } from 'next/server';
import { getPlanetaryPositions } from '@/lib/astrologia/planetas/positions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataStr = searchParams.get('data');

    const data = dataStr ? new Date(dataStr) : new Date();

    if (isNaN(data.getTime())) {
      return NextResponse.json({
        error: 'Data inválida'
      }, { status: 400 });
    }

    const posicoes = getPlanetaryPositions(data);

    return NextResponse.json(
      { posicoes },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Erro calculando posições planetárias:', error);
    return NextResponse.json({
      error: 'Erro ao calcular posições planetárias'
    }, { status: 500 });
  }
}
