import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'GET /api/profile/data' }, { status: 200 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'POST /api/profile/data' }, { status: 201 })
}