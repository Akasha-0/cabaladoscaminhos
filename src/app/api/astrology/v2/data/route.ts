import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json(
      { data: data.toISOString() },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Erro no endpoint de dados astrológicos v2:', error);
    return NextResponse.json({
      error: 'Erro ao processar dados astrológicos'
    }, { status: 500 });
  }
}