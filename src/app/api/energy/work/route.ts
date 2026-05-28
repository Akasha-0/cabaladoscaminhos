// ============================================================
// ENERGY WORK API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for energy work practices and techniques
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

const ENERGY_WORK_TYPES = ['channeling', 'healing', 'cleansing', 'balancing', 'manifestation', 'protection'] as const;
type EnergyWorkType = typeof ENERGY_WORK_TYPES[number];

interface EnergyTechnique {
  id: string;
  name: string;
  type: EnergyWorkType;
  description: string;
  steps: string[];
  benefits: string[];
  precautions: string[];
}

const ENERGY_TECHNIQUES: EnergyTechnique[] = [
  {
    id: 'reiiki',
    name: 'Reiki Energy Channeling',
    type: 'healing',
    description: 'Channel universal life force energy through the palms for healing and balance.',
    steps: [
      'Center yourself with three deep breaths',
      'Set your intention for healing',
      'Place hands gently on or above the recipient',
      'Visualize white light flowing through your crown',
      'Allow energy to flow naturally for 3-5 minutes',
      'Close with gratitude and energy sealing',
    ],
    benefits: ['Promotes physical healing', 'Reduces stress and anxiety', 'Balances energy field', 'Supports emotional release'],
    precautions: ['Not a substitute for medical care', 'Avoid during acute infections', 'Respect personal energy boundaries'],
  },
  {
    id: 'cord-cutting',
    name: 'Energy Cord Cutting',
    type: 'cleansing',
    description: 'Sever energetic connections to people, places, or situations that drain your energy.',
    steps: [
      'Identify the connection to release',
      'Visualize a cord connecting you to the source',
      'See golden scissors or sword of light',
      'Cut the cord with clear intention',
      'Seal the opening with white light',
      'Affirm your independence and freedom',
    ],
    benefits: ['Releases energetic attachments', 'Restores personal power', 'Clears emotional baggage', 'Creates energetic boundaries'],
    precautions: ['Ensure you are ready to release', 'May bring up emotional processing', 'Trust your readiness'],
  },
  {
    id: 'grounding',
    name: 'Energy Grounding Practice',
    type: 'balancing',
    description: 'Connect with Earth energy to stabilize and anchor your personal energy field.',
    steps: [
      'Stand or sit comfortably',
      'Visualize roots extending from your feet',
      'Allow roots to go deep into the Earth',
      'Feel the connection with Earth energy',
      'Draw Earth energy up through the roots',
      'Breathe it into your entire being',
    ],
    benefits: ['Stabilizes scattered energy', 'Increases present-moment awareness', 'Strengthens energy boundaries', 'Promotes feelings of safety'],
    precautions: ['May intensify during initial practice', 'Some may feel disoriented - start slowly'],
  },
  {
    id: 's盾箭',
    name: 'Shielding Technique',
    type: 'protection',
    description: 'Create an energetic shield to protect yourself from negative influences.',
    steps: [
      'Stand or sit in meditation posture',
      'Visualize white light surrounding your body',
      'Expand the light into an egg-shaped shield',
      'Set the intention that only love enters',
      'Feel the shield activating and sealing',
      'Carry this protection throughout your day',
    ],
    benefits: ['Blocks negative energy', 'Strengthens aura', 'Maintains personal energy integrity', 'Creates safe energetic space'],
    precautions: ['Do not use for extended periods without breaks', 'Periodically refresh the shield'],
  },
  {
    id: 'abundance',
    name: 'Energy Manifestation Practice',
    type: 'manifestation',
    description: 'Align your energy field with abundance to attract desired outcomes.',
    steps: [
      'Clarify your intention with emotion',
      'Visualize already having achieved your goal',
      'Feel the emotions as if it is real now',
      'Release attachment to the outcome',
      'Take inspired action when prompted',
      'Express gratitude for what is coming',
    ],
    benefits: ['Aligns energy with goals', 'Increases abundance awareness', 'Attracts opportunities', 'Elevates overall vibration'],
    precautions: ['Avoid forcing outcomes', 'Trust divine timing', 'Remain open to unexpected paths'],
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const techniqueId = searchParams.get('technique');
  const type = searchParams.get('type');

  // Filter by type
  if (type && ENERGY_WORK_TYPES.includes(type as EnergyWorkType)) {
    const filtered = ENERGY_TECHNIQUES.filter(t => t.type === type);
    return NextResponse.json({
      techniques: filtered,
      total: filtered.length,
      type,
    });
  }

  // Get specific technique
  if (techniqueId) {
    const technique = ENERGY_TECHNIQUES.find(t => t.id === techniqueId);
    if (!technique) {
      return NextResponse.json(
        { error: 'Technique not found', availableTechniques: ENERGY_TECHNIQUES.map(t => t.id) },
        { status: 404 }
      );
    }
    return NextResponse.json({ technique });
  }

  // Return all techniques
  return NextResponse.json({
    techniques: ENERGY_TECHNIQUES,
    total: ENERGY_TECHNIQUES.length,
    types: ENERGY_WORK_TYPES,
  });
}