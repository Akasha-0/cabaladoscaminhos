import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    return NextResponse.json({
      success: true,
      data: {
        category: category || 'all',
        features: [],
      },
    })
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar dados de acessibilidade' },
      { status: 500 }
    )
  }
}