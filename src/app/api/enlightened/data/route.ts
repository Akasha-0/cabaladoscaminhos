// ============================================================
// ENLIGHTENED DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for enlightened data
// - Retrieve all enlightened records
// - Retrieve single enlightened state by ID
// - Retrieve enlightenment stages
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Enlightened states data
interface EnlightenedState {
  id: string;
  name: string;
  description: string;
  stage: number;
  attributes: string[];
  practices: string[];
}

const enlightenedStates: EnlightenedState[] = [
  {
    id: 'awakened',
    name: 'Awakened',
    description: 'Direct realization of true nature',
    stage: 1,
    attributes: ['clarity', 'presence', 'truth'],
    practices: ['meditation', 'self-inquiry'],
  },
  {
    id: 'illuminated',
    name: 'Illuminated',
    description: 'Inner light recognized and cultivated',
    stage: 2,
    attributes: ['wisdom', 'compassion', 'inner-light'],
    practices: ['contemplation', 'service'],
  },
  {
    id: 'enlightened',
    name: 'Enlightened',
    description: 'Full realization of unity consciousness',
    stage: 3,
    attributes: ['oneness', 'love', 'freedom'],
    practices: ['teaching', 'integration'],
  },
];

// GET /api/enlightened/data - Get enlightened data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Return single enlightened state by ID
    if (id) {
      const state = enlightenedStates.find((s) => s.id === id);
      if (!state) {
        return NextResponse.json(
          { success: false, error: 'Enlightened state not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: state });
    }

    // Return all enlightened states
    return NextResponse.json({ success: true, data: enlightenedStates });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch enlightened data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}