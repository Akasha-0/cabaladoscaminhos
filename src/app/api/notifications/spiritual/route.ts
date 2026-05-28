import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ spiritualNotifications: [] })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ success: true, notification: body }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
