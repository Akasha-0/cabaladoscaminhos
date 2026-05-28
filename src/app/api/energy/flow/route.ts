// ============================================================
// ENERGY FLOW API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for energy flow visualization and tracking
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

const ENERGY_FLOW_MODES = ['inhale', 'exhale', 'hold'] as const;
type FlowMode = typeof ENERGY_FLOW_MODES[number];

interface FlowPattern {
  id: string;
  name: string;
  phases: {
    mode: FlowMode;
    duration: number;
    description: string;
  }[];
  benefits: string[];
}

const FLOW_PATTERNS: FlowPattern[] = [
  {
    id: 'balanced',
    name: 'Balanced Flow',
    phases: [
      { mode: 'inhale', duration: 4, description: 'Inhale deeply through the nose' },
      { mode: 'hold', duration: 4, description: 'Hold breath gently' },
      { mode: 'exhale', duration: 4, description: 'Exhale slowly through the mouth' },
    ],
    benefits: ['Balances energy centers', 'Calms the nervous system', 'Promotes inner peace'],
  },
  {
    id: 'energizing',
    name: 'Energizing Breath',
    phases: [
      { mode: 'inhale', duration: 6, description: 'Rapid inhale through the nose' },
      { mode: 'exhale', duration: 2, description: 'Sharp exhale through the mouth' },
    ],
    benefits: ['Increases vital energy', 'Activates solar plexus', 'Boosts motivation'],
  },
  {
    id: 'calming',
    name: 'Calming Breath',
    phases: [
      { mode: 'inhale', duration: 4, description: 'Slow inhale through the nose' },
      { mode: 'hold', duration: 7, description: 'Hold breath peacefully' },
      { mode: 'exhale', duration: 8, description: 'Extended exhale through pursed lips' },
    ],
    benefits: ['Activates parasympathetic system', 'Reduces anxiety', 'Deepens relaxation'],
  },
  {
    id: 'sufi',
    name: 'Sufi Breathing',
    phases: [
      { mode: 'inhale', duration: 6, description: 'Belly expansion breathing' },
      { mode: 'hold', duration: 0, description: 'No hold' },
      { mode: 'exhale', duration: 6, description: 'Belly contraction breathing' },
    ],
    benefits: ['Opens heart chakra', 'Connects breath with movement', 'Elevates consciousness'],
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const patternId = searchParams.get('pattern');

  if (patternId) {
    const pattern = FLOW_PATTERNS.find(p => p.id === patternId);
    if (!pattern) {
      return NextResponse.json(
        { error: 'Flow pattern not found', availablePatterns: FLOW_PATTERNS.map(p => p.id) },
        { status: 404 }
      );
    }
    return NextResponse.json({ pattern });
  }

  return NextResponse.json({
    patterns: FLOW_PATTERNS,
    total: FLOW_PATTERNS.length,
  });
}