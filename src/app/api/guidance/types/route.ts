import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    types: [
      {
        id: 'tarot',
        name: 'Tarot',
        description: 'Guidance through tarot card readings',
        icon: 'cards',
      },
      {
        id: 'numerology',
        name: 'Numerologia',
        description: 'Guidance through numerological analysis',
        icon: 'numbers',
      },
      {
        id: 'astrology',
        name: 'Astrologia',
        description: 'Guidance through astrological insights',
        icon: 'stars',
      },
      {
        id: 'cabala',
        name: 'Cabala',
        description: 'Guidance through kabbalistic wisdom',
        icon: 'tree',
      },
      {
        id: 'ifa',
        name: 'Ifa',
        description: 'Guidance through Ifa divination',
        icon: 'oracle',
      },
      {
        id: 'meditation',
        name: 'Meditacao',
        description: 'Guidance through sacred meditation',
        icon: 'lotus',
      },
    ],
  })
}