import { NextRequest, NextResponse } from 'next/server';

import { getData, type XingoData } from '@/lib/orixa/xingo-data';

export async function GET(_request: NextRequest) {
  try {
    const data: XingoData[] = [getData()];

    return NextResponse.json(
      { data },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Erro no endpoint de dados Xingo:', error);
    return NextResponse.json({
      error: 'Erro ao processar dados de Xingo'
    }, { status: 500 });
  }
}
