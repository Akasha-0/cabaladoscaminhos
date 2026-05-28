// ============================================================
// TRANSMUTATION DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for transmutation data
// - List all transmutation data
// - Get specific type by ID
// - Get types by element
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Transmutation types
type TransmutationType = 'base' | 'advanced' | 'master';

interface TransmutationEntry {
  id: string;
  type: TransmutationType;
  name: string;
  element: string;
  description: string;
  properties: string[];
}

// Mock data for transmutation
const transmutationData: TransmutationEntry[] = [
  {
    id: 'lead-to-gold',
    type: 'base',
    name: 'Lead to Gold',
    element: 'earth',
    description: 'Transformation of base materials into precious ones through elemental refinement.',
    properties: ['transmutation', 'refinement', 'elevation'],
  },
  {
    id: 'spirit-to-matter',
    type: 'advanced',
    name: 'Spirit to Matter',
    element: 'fire',
    description: 'Manifestation of spiritual energy into physical form.',
    properties: ['manifestation', 'embodiment', 'actualization'],
  },
  {
    id: 'matter-to-spirit',
    type: 'advanced',
    name: 'Matter to Spirit',
    element: 'water',
    description: 'Dissolution of physical form back into spiritual essence.',
    properties: ['dissolution', 'transcendence', 'liberation'],
  },
  {
    id: 'shadow-to-light',
    type: 'master',
    name: 'Shadow to Light',
    element: 'air',
    description: 'Transformation of dark aspects into illuminated understanding.',
    properties: ['integration', 'wholeness', 'enlightenment'],
  },
  {
    id: 'time-to-eternity',
    type: 'master',
    name: 'Time to Eternity',
    element: 'ether',
    description: 'Transcendence of temporal limitations into eternal awareness.',
    properties: ['timelessness', 'infinity', 'presence'],
  },
];

// GET /api/transmutation/data - Get transmutation data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const element = searchParams.get('element');

    // Return specific transmutation by ID
    if (id) {
      const entry = transmutationData.find((t) => t.id === id);
      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Transmutation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: entry });
    }

    // Filter by type
    if (type) {
      const filtered = transmutationData.filter((t) => t.type === type);
      return NextResponse.json({ success: true, data: filtered });
    }

    // Filter by element
    if (element) {
      const filtered = transmutationData.filter((t) => t.element === element);
      return NextResponse.json({ success: true, data: filtered });
    }

    // Default — return all transmutation data
    return NextResponse.json({ success: true, data: transmutationData });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transmutation data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}