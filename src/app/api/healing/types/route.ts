import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    types: [
      { id: 'mental', name: 'Mental', description: 'Healing of mental and emotional patterns' },
      { id: 'physical', name: 'Physical', description: 'Healing of physical body and energy' },
      { id: 'spiritual', name: 'Spiritual', description: 'Spiritual awakening and liberation' },
      { id: 'karmic', name: 'Karmic', description: 'Resolution of karmic imprints' },
    ],
  })
}