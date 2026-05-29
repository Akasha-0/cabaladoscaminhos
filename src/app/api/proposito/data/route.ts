import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ data: [], success: true })
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}