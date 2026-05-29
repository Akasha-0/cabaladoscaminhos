import { NextRequest, NextResponse } from 'next/server';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataNascimento = searchParams.get('data');
    const horaNascimento = searchParams.get('hora') || '12:00';
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');

    if (!dataNascimento) {
      return NextResponse.json({
        error: 'Parâmetro data é obrigatório'
      }, { status: 400 });
    }

    const data = new Date(dataNascimento);
    if (isNaN(data.getTime())) {
      return NextResponse.json({
        error: 'Data inválida'
      }, { status: 400 });
    }

    if (!latitude || !longitude) {
      return NextResponse.json({
        error: 'Parâmetros latitude e longitude são obrigatórios'
      }, { status: 400 });
    }

    const mapaNatal = calcularMapaNatal(
      data,
      horaNascimento,
      parseFloat(latitude),
      parseFloat(longitude)
    );
    const posicoes = Object.values(mapaNatal.planeta);

    return NextResponse.json({
      posicoes,
      casas: mapaNatal.casas,
      ascendente: mapaNatal.ascendente,
      mediumCoeli: mapaNatal.mediumCoeli,
      nodes: mapaNatal.nodes,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    });
  } catch (_error) {
    console.error('Erro calculando posições:', _error);
    return NextResponse.json({
      error: 'Erro ao calcular posições'
    }, { status: 500 });
  }
}
