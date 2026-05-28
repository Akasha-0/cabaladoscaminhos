import { NextRequest, NextResponse } from 'next/server'

// GET /api/user/profile — fetch current user profile
export async function GET(request: NextRequest) {
  // TODO: integrate with auth session
  return NextResponse.json({ message: 'GET /api/user/profile' }, { status: 200 })
}

// POST /api/user/profile — create user profile
export async function POST(request: NextRequest) {
  try {
    // TODO: integrate with auth session
    return NextResponse.json({ message: 'POST /api/user/profile' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
