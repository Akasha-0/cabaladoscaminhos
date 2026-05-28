import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ data: 'Obara data endpoint' })
}