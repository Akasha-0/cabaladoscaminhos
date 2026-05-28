import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'GET /api/users/profile' }, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ message: 'POST /api/users/profile' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
