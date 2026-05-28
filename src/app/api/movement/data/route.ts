// ============================================================
// MOVEMENT DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for movement data
// - Retrieve all movement information
// - Movement practices and energy data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed movement data for spiritual practice
const MOVEMENT_DATA = [
  {
    id: 'breath',
    name: 'Breathwork',
    namePt: 'Trabalho Respiratório',
    category: 'breathing',
    origin: 'Various traditions',
    description: 'Conscious breathing practices for energy cultivation and spiritual awakening.',
    practices: [
      {
        id: 'coherent',
        name: 'Coherent Breathing',
        namePt: 'Respiração Coerente',
        breathsPerMinute: 5,
        duration: '10-20 minutes',
        benefits: ['Heart coherence', 'Stress reduction', 'Energy balance'],
      },
      {
        id: 'box',
        name: 'Box Breathing',
        namePt: 'Respiração Quadrada',
        inhale: 4,
        hold: 4,
        exhale: 4,
        holdAfter: 4,
        benefits: ['Calm', 'Focus', 'Grounding'],
      },
      {
        id: 'alternate',
        name: 'Alternate Nostril',
        namePt: 'Respiro Alternado',
        sanskrit: 'Nadi Shodhana',
        rounds: 10,
        benefits: ['Balance', 'Chakra alignment', 'Energy flow'],
      },
    ],
    associatedSefirot: ['Chesed', 'Gevurah'],
    associatedChakras: ['Heart', 'Solar plexus'],
    score: 9,
  },
  {
    id: 'qigong',
    name: 'Qigong',
    namePt: 'Qigong',
    category: 'energy',
    origin: 'China',
    description: 'Ancient Chinese practice combining movement, breathing, and meditation for life energy cultivation.',
    forms: [
      {
        id: 'standing',
        name: 'Standing Meditation',
        namePt: 'Meditação em Pé',
        duration: '15-45 minutes',
        stance: 'Zhan Zhuang',
        benefits: ['Energy grounding', 'Strength building', 'Inner calm'],
      },
      {
        id: 'walking',
        name: 'Walking Qigong',
        namePt: 'Qigong Caminhando',
        style: 'Mindful movement',
        benefits: ['Circulation', 'Meditation in motion', 'Grounding'],
      },
      {
        id: 'taiji',
        name: 'Taiji Qigong',
        namePt: 'Qigong Taiji',
        movements: 8,
        benefits: ['Balance', 'Energy flow', 'Spiritual connection'],
      },
    ],
    associatedSefirot: ['Netzach', 'Hod'],
    associatedChakras: ['Root', 'Dantian'],
    score: 8,
  },
  {
    id: 'yoga',
    name: 'Spiritual Yoga',
    namePt: 'Yoga Espiritual',
    category: 'movement',
    origin: 'India',
    description: 'Union of body, breath, and spirit through asana, pranayama, and meditation practices.',
    branches: [
      {
        id: 'raja',
        name: 'Raja Yoga',
        namePt: 'Yoga Raja',
        focus: 'Meditation and mental discipline',
        benefits: ['Inner peace', 'Spiritual awakening', 'Mind clarity'],
      },
      {
        id: 'kundalini',
        name: 'Kundalini Yoga',
        namePt: 'Yoga Kundalini',
        focus: 'Energy activation',
        practices: ['Breath of fire', 'Mantra', 'Mudra'],
        benefits: ['Energy awakening', 'Chakra activation', 'Transformation'],
      },
      {
        id: 'bhakti',
        name: 'Bhakti Yoga',
        namePt: 'Yoga Bhakti',
        focus: 'Devotion and love',
        practices: ['Chanting', 'Prayer', 'Community'],
        benefits: ['Heart opening', 'Divine love', 'Community connection'],
      },
    ],
    associatedSefirot: ['Tiferet', 'Chesed'],
    associatedChakras: ['All chakras', 'Kundalini'],
    score: 9,
  },
  {
    id: 'dance',
    name: 'Sacred Dance',
    namePt: 'Dança Sagrada',
    category: 'expression',
    origin: 'Universal',
    description: 'Movement practices that honor the divine through dance and embodied spiritual expression.',
    forms: [
      {
        id: 'sufi',
        name: 'Sufi Whirling',
        namePt: 'Giro Sufi',
        practice: 'Dervish meditation',
        duration: 'Continuous',
        benefits: ['Ecstasy', 'Unity', 'Divine love'],
      },
      {
        id: '5rhythms',
        name: '5 Rhythms',
        namePt: '5 Ritmos',
        creator: 'Gabrielle Roth',
        flows: ['Flowing', 'Staccato', 'Chaos', 'Lyrical', 'Stillness'],
        benefits: ['Emotional release', 'Self-expression', 'Awakening'],
      },
      {
        id: 'biodanza',
        name: 'Biodanza',
        namePt: 'Biodanza',
        focus: 'Life integration',
        benefits: ['Joy', 'Connection', 'Vital expression'],
      },
    ],
    associatedSefirot: ['Chesed', 'Netzach'],
    associatedChakras: ['Heart', 'Sacral'],
    score: 8,
  },
  {
    id: 'tai chi',
    name: 'Tai Chi Chuan',
    namePt: 'Tai Chi Chuan',
    category: 'martial',
    origin: 'China',
    description: 'Internal Chinese martial art practiced for health, meditation, and self-defense.',
    styles: [
      {
        id: 'yang',
        name: 'Yang Style',
        namePt: 'Estilo Yang',
        character: 'Slow, expansive movements',
        forms: '108 movements',
        benefits: ['Health', 'Longevity', 'Inner calm'],
      },
      {
        id: 'chen',
        name: 'Chen Style',
        namePt: 'Estilo Chen',
        character: 'Combination of slow and fast',
        benefits: ['Power', 'Flexibility', 'Energy development'],
      },
      {
        id: 'wu',
        name: 'Wu Style',
        namePt: 'Estilo Wu',
        character: 'Small, subtle movements',
        benefits: ['Refinement', 'Internal strength', 'Healing'],
      },
    ],
    associatedSefirot: ['Netzach', 'Hod'],
    associatedChakras: ['Root', 'Dantian'],
    score: 8,
  },
];

// GET /api/movement/data - Get all movement data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const movementId = searchParams.get('id');

    if (movementId) {
      const movement = MOVEMENT_DATA.find((m) => m.id === movementId);
      if (!movement) {
        return NextResponse.json(
          { error: 'Movement practice not found', availableIds: MOVEMENT_DATA.map((m) => m.id) },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: movement });
    }

    return NextResponse.json({
      data: MOVEMENT_DATA,
      meta: {
        count: MOVEMENT_DATA.length,
        version: 'v1',
        category: 'movement',
      },
    });
  } catch (error) {
    console.error('Movement API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}