// ============================================================
// TRANSFORMATION DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET/POST endpoints for transformation data
// - Retrieve transformation archetypes and stages
// - Process transformation requests
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Transformation archetypes following spiritual metamorphosis
const TRANSFORMATION_ARCHETYPES = [
  {
    id: 'death-rebirth',
    name: 'Death & Rebirth',
    description: 'Complete spiritual metamorphosis through endings and new beginnings',
    interpretation: 'The death and rebirth archetype represents the fundamental cycle of spiritual transformation. What must end will dissolve to make space for renewed existence.',
    stages: ['Dissolution', 'Liminal Space', 'Emergence', 'Integration'],
    elements: ['Water', 'Fire'],
  },
  {
    id: 'caterpillar-butterfly',
    name: 'Caterpillar to Butterfly',
    description: 'Radical change in form while maintaining essence',
    interpretation: 'Like the caterpillar dissolving into formless matter before emerging as a butterfly, this transformation preserves the soul while transcending previous limitations.',
    stages: ['Encapsulation', 'Dissolution', 'Cell Restructuring', 'Wing Formation', 'Emergence'],
    elements: ['Earth', 'Air'],
  },
  {
    id: 'phoenix',
    name: 'Phoenix Rising',
    description: 'Transformation through fire and renewal',
    interpretation: 'The phoenix burns and rises from its own ashes, embodying the power of self-renewal. This archetype teaches that we can be the instrument of our own transformation.',
    stages: ['Gathering', 'Ignition', 'Consumption', 'Incubation', 'Rebirth'],
    elements: ['Fire'],
  },
  {
    id: 'moon-cycle',
    name: 'Moon Cycle Transformation',
    description: 'Gradual transformation following lunar rhythms',
    interpretation: 'Like the moon waxing and waning, this transformation follows natural rhythms of growth and release. Patience with the cycle leads to profound inner change.',
    stages: ['New Moon Intention', 'Waxing Action', 'Full Moon Illumination', 'Waning Release'],
    elements: ['Water'],
  },
  {
    id: 'alchemy',
    name: 'Alchemical Transformation',
    description: 'The Great Work of transmuting lead into gold',
    interpretation: 'Drawing from ancient alchemical traditions, this transformation represents the refinement of base qualities into spiritual gold through dedicated inner work.',
    stages: ['Nigredo (Blackening)', 'Albedo (Whitening)', 'Citrinitas (Yellowing)', 'Rubedo (Reddening)'],
    elements: ['Fire', 'Earth'],
  },
  {
    id: 'seed-tree',
    name: 'Seed to Sacred Tree',
    description: 'Slow growth into expansive consciousness',
    interpretation: 'From a tiny seed emerges a mighty tree. This transformation honors the slow, steady process of spiritual deepening through daily practice and dedication.',
    stages: ['Seed Planting', 'Rooting', 'Sprouting', 'Growing', 'Branching', 'Flowering', 'Fruiting'],
    elements: ['Earth', 'Water'],
  },
];

// GET /api/transformation/data - Get all transformation data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const archetypeId = searchParams.get('archetype');

    if (archetypeId) {
      const archetype = TRANSFORMATION_ARCHETYPES.find((a) => a.id === archetypeId);
      if (!archetype) {
        return NextResponse.json(
          { error: 'Transformation archetype not found', archetypeId },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: archetype,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        archetypes: TRANSFORMATION_ARCHETYPES,
        total: TRANSFORMATION_ARCHETYPES.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to retrieve transformation data' },
      { status: 500 }
    );
  }
}

// POST /api/transformation/data - Process transformation request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { archetypeId, inputData, action } = body;

    if (action === 'calculate') {
      // Calculate transformation metrics
      const archetype = TRANSFORMATION_ARCHETYPES.find((a) => a.id === archetypeId);
      if (!archetype) {
        return NextResponse.json(
          { error: 'Transformation archetype not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          archetype,
          metrics: {
            stages: archetype.stages.length,
            elements: archetype.elements,
            complexity: archetype.stages.length > 4 ? 'advanced' : 'standard',
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (action === 'register') {
      // Register a new transformation intention
      if (!archetypeId || !inputData) {
        return NextResponse.json(
          { error: 'archetypeId and inputData are required for registration' },
          { status: 400 }
        );
      }

      const archetype = TRANSFORMATION_ARCHETYPES.find((a) => a.id === archetypeId);
      if (!archetype) {
        return NextResponse.json(
          { error: 'Transformation archetype not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          registrationId: `trans-${Date.now()}`,
          archetype,
          inputData,
          status: 'initiated',
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "calculate" or "register"' },
      { status: 400 }
    );
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to process transformation request' },
      { status: 500 }
    );
  }
}
