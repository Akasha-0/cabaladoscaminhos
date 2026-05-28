import { NextResponse } from 'next/server';

// GET /api/materials - List all materials
export async function GET() {
  const materials = [
    { id: '1', name: 'Aether', type: 'elemental', rarity: 'legendary' },
    { id: '2', name: 'Spirit Dust', type: 'essence', rarity: 'rare' },
    { id: '3', name: 'Celestial Shard', type: 'crystal', rarity: 'epic' },
  ];

  return NextResponse.json({ materials });
}