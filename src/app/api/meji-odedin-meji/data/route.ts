import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Meji-odedin-meji data endpoint' })
}