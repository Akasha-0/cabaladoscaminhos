import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    return NextResponse.json({
      success: true,
      data: {
        category: category || 'all',
        themes: [],
      },
    })
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tema data' },
      { status: 500 }
    )
  }
}
