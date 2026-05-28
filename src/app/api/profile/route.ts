import { NextRequest, NextResponse } from 'next/server'

// GET /api/profile — fetch current user profile
export function GET(request: NextRequest) {
  // TODO: integrate with auth session
  return NextResponse.json({ message: 'GET /api/profile' }, { status: 200 })
}

// POST /api/profile — create user profile
export function POST(request: NextRequest) {
  // TODO: integrate with auth session
  return NextResponse.json({ message: 'POST /api/profile' }, { status: 201 })
}

// PUT /api/profile — update user profile
export function PUT(request: NextRequest) {
  // TODO: integrate with auth session
  return NextResponse.json({ message: 'PUT /api/profile' }, { status: 200 })
}