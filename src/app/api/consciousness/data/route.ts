// ============================================================
// CONSCIOUSNESS DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for consciousness data
// - List all consciousness data
// - Get specific consciousness by ID
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface ConsciousnessData {
  id: string;
  level: string;
  frequency: number;
  description: string;
  attributes: string[];
}

const CONSCIOUSNESS_DATA: ConsciousnessData[] = [
  {
    id: 'physical',
    level: 'Physical',
    frequency: 100,
    description: 'Material plane consciousness focused on physical existence and survival',
    attributes: ['survival', 'stability', 'body awareness', 'physical form']
  },
  {
    id: 'emotional',
    level: 'Emotional',
    frequency: 200,
    description: 'Feeling consciousness connected to heart energy and emotional intelligence',
    attributes: ['emotions', 'relationships', 'intuition', 'feeling']
  },
  {
    id: 'mental',
    level: 'Mental',
    frequency: 300,
    description: 'Thinking consciousness of the mind and rational awareness',
    attributes: ['logic', 'reasoning', 'analysis', 'thought']
  },
  {
    id: 'spiritual',
    level: 'Spiritual',
    frequency: 400,
    description: 'Higher consciousness connected to spirit and inner wisdom',
    attributes: ['wisdom', 'compassion', 'truth', 'inner peace']
  },
  {
    id: 'cosmic',
    level: 'Cosmic',
    frequency: 500,
    description: 'Universal consciousness beyond individual self and separation',
    attributes: ['unity', 'interconnection', 'transcendence', 'oneness']
  },
  {
    id: 'divine',
    level: 'Divine',
    frequency: 600,
    description: 'Divine consciousness united with source and infinite awareness',
    attributes: ['oneness', 'eternal', 'infinite', 'source']
  }
];

// GET /api/consciousness/data - Get consciousness data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const item = CONSCIOUSNESS_DATA.find(c => c.id === id);
      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Consciousness data not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: item });
    }

    return NextResponse.json({
      success: true,
      data: CONSCIOUSNESS_DATA,
      total: CONSCIOUSNESS_DATA.length
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve consciousness data'
      },
      { status: 500 }
    );
  }
}
