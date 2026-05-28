// ============================================================
// NIRVANA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for nirvana data
// - Retrieve all nirvana states
// - Retrieve single nirvana state by ID
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Nirvana states data
interface NirvanaState {
  id: string;
  name: string;
  description: string;
  level: number;
  attributes: string[];
  practices: string[];
}

const nirvanaStates: NirvanaState[] = [
  {
    id: 'dhyana',
    name: 'Dhyana',
    description: 'Deep meditative absorption',
    level: 1,
    attributes: ['concentration', 'mindfulness', 'stillness'],
    practices: ['meditation', 'breath awareness'],
  },
  {
    id: 'samadhi',
    name: 'Samadhi',
    description: 'Union with the divine',
    level: 2,
    attributes: ['oneness', 'bliss', 'transcendence'],
    practices: ['contemplation', 'devotion'],
  },
  {
    id: 'nirvana',
    name: 'Nirvana',
    description: 'Liberation from suffering',
    level: 3,
    attributes: ['enlightenment', 'compassion', 'freedom'],
    practices: ['wisdom', 'service'],
  },
];

// GET /api/nirvana/data - Get nirvana data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Return single nirvana state by ID
    if (id) {
      const state = nirvanaStates.find((s) => s.id === id);
      if (!state) {
        return NextResponse.json(
          { success: false, error: 'Nirvana state not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: state });
    }

    // Return all nirvana states
    return NextResponse.json({ success: true, data: nirvanaStates });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch nirvana data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}