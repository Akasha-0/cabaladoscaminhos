import { NextRequest, NextResponse } from 'next/server'

// GET /api/oturupon/data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Placeholder data - replace with real data source
    const data = {
      items: [],
      total: 0,
      page,
      limit,
    }

    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}