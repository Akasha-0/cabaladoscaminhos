// src/app/api/mudra/data/route.ts
// Mudra API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type MudraCategory = 'connection' | 'meditation' | 'breathing' | 'healing' | 'manifestation' | 'protection';
export type MudraElement = 'earth' | 'water' | 'fire' | 'air' | 'ether' | 'all';
export type MudraChakra = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third_eye' | 'crown' | 'all';
export type MudraDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface MudraQuery {
  category?: MudraCategory;
  element?: MudraElement;
  chakra?: MudraChakra;
  difficulty?: MudraDifficulty;
  name?: string;
}

export interface Mudra {
  id: string;
  name: string;
  sanskrit: string;
  meaning: string;
  category: MudraCategory;
  element: MudraElement;
  chakra: MudraChakra;
  difficulty: MudraDifficulty;
  handPositions: string[];
  benefits: string[];
  instructions: string[];
  duration?: string;
  contraindications?: string[];
}

// ============================================================
// MUDRA DATA
// ============================================================

const mudraData: Mudra[] = [
  // Connection Mudras
  {
    id: 'jnana-mudra',
    name: 'Jnana Mudra',
    sanskrit: 'ज्ञान mudrā',
    meaning: 'Gesture of Knowledge',
    category: 'connection',
    element: 'ether',
    chakra: 'third_eye',
    difficulty: 'beginner',
    handPositions: ['Palm facing up', 'Index finger touches thumb at the base', 'Other fingers extended'],
    benefits: ['Enhances concentration', 'Activates pituitary gland', 'Calms the mind', 'Improves memory'],
    instructions: [
      'Sit comfortably in a cross-legged position',
      'Place hands on knees with palms facing up',
      'Join the tip of the index finger with the tip of the thumb',
      'Keep other fingers extended and relaxed',
      'Close your eyes and breathe deeply',
      'Maintain for 5-30 minutes'
    ],
    duration: '5-30 minutes',
    contraindications: ['Pregnancy', 'Hand injuries']
  },
  {
    id: 'chin-mudra',
    name: 'Chin Mudra',
    sanskrit: 'चिन mudrā',
    meaning: 'Gesture of Consciousness',
    category: 'connection',
    element: 'ether',
    chakra: 'crown',
    difficulty: 'beginner',
    handPositions: ['Palm facing up', 'Index finger and thumb form a circle', 'Other fingers extended'],
    benefits: ['Connects to higher consciousness', 'Reduces anxiety', 'Promotes inner peace', 'Balances hemispheres'],
    instructions: [
      'Sit in a meditative posture',
      'Bring hands to rest on knees',
      'Form a circle with thumb and index finger',
      'Extend remaining three fingers',
      'Breathe naturally',
      'Focus on the third eye'
    ],
    duration: '10-45 minutes'
  },
  {
    id: 'ankh-mudra',
    name: 'Ankh Mudra',
    sanskrit: 'आँख mudrā',
    meaning: 'Eye Mudra',
    category: 'connection',
    element: 'fire',
    chakra: 'third_eye',
    difficulty: 'intermediate',
    handPositions: ['Fists with index finger pointing up', 'Other fingers wrapped around'],
    benefits: ['Opens inner vision', 'Activates third eye', 'Enhances intuition', 'Improves focus'],
    instructions: [
      'Sit comfortably with spine straight',
      'Make gentle fists with both hands',
      'Extend index fingers straight up',
      'Point thumbs to the right side of index fingers',
      'Hold position while breathing deeply',
      'Focus on the space between eyebrows'
    ],
    duration: '5-15 minutes',
    contraindications: ['Glaucoma', 'Eye infections']
  },

  // Meditation Mudras
  {
    id: 'dhyana-mudra',
    name: 'Dhyana Mudra',
    sanskrit: 'ध्यान mudrā',
    meaning: 'Gesture of Meditation',
    category: 'meditation',
    element: 'earth',
    chakra: 'crown',
    difficulty: 'beginner',
    handPositions: ['Hands stacked in lap', 'Right hand over left', 'Thumbs touching'],
    benefits: ['Deepens meditation', 'Promotes tranquility', 'Balances energy', 'Connects to stillness'],
    instructions: [
      'Sit in lotus or half-lotus position',
      'Place hands in your lap',
      'Right palm faces up, left palm faces up',
      'Stack right hand over left',
      'Touch thumbs together at tips',
      'Relax shoulders and breathe'
    ],
    duration: '15-60 minutes'
  },
  {
    id: 'bhumisparsha-mudra',
    name: 'Bhumisparsha Mudra',
    sanskrit: 'भूमिस्पर्श mudrā',
    meaning: 'Earth-Touching Gesture',
    category: 'meditation',
    element: 'earth',
    chakra: 'root',
    difficulty: 'intermediate',
    handPositions: ['Right hand over knee', 'Left hand in lap', 'Fingers touch earth'],
    benefits: ['Overcomes fear', 'Grounds energy', 'Symbolizes enlightenment', 'Connects to earth wisdom'],
    instructions: [
      'Sit in lotus position',
      'Place right hand over right knee',
      'Let fingers touch the earth',
      'Left hand rests in lap palm up',
      'Bow head slightly',
      'Invoke earth as witness'
    ],
    duration: '10-30 minutes'
  },
  {
    id: 'samadhi-mudra',
    name: 'Samadhi Mudra',
    sanskrit: 'समाधि mudrā',
    meaning: 'Gesture of Total Absorption',
    category: 'meditation',
    element: 'ether',
    chakra: 'crown',
    difficulty: 'advanced',
    handPositions: ['Hands interlocked', 'Index fingers pointing up', 'Arms crossed'],
    benefits: ['Achieves meditative absorption', 'Unites opposing energies', 'Activates crown chakra', 'Profound stillness'],
    instructions: [
      'Sit in deep meditation posture',
      'Interlock all fingers except index fingers',
      'Extend both index fingers upward',
      'Cross arms at chest level',
      'Breathe slowly and deeply',
      'Enter profound stillness'
    ],
    duration: '20-90 minutes',
    contraindications: ['Shoulder injuries']
  },

  // Breathing Mudras
  {
    id: 'prana-mudra',
    name: 'Prana Mudra',
    sanskrit: 'प्राण mudrā',
    meaning: 'Gesture of Life Force',
    category: 'breathing',
    element: 'all',
    chakra: 'all',
    difficulty: 'beginner',
    handPositions: ['Palm facing up', 'Pinky, ring, middle fingers touch thumb tip', 'Index finger extended'],
    benefits: ['Activates life force', 'Boosts vitality', 'Reduces fatigue', 'Improves immunity'],
    instructions: [
      'Sit comfortably or stand',
      'Hold hands in front of you',
      'Touch pinky, ring, and middle fingertips to thumb tip',
      'Keep index fingers extended',
      'Breathe deeply while holding',
      'Practice for 5-15 minutes'
    ],
    duration: '5-15 minutes'
  },
  {
    id: 'apan-mudra',
    name: 'Apana Mudra',
    sanskrit: 'आपान mudrā',
    meaning: 'Gesture of Elimination',
    category: 'breathing',
    element: 'water',
    chakra: 'root',
    difficulty: 'beginner',
    handPositions: ['Palm facing up', 'Thumb touches middle and ring fingers', 'Index and pinky extended'],
    benefits: ['Aids detoxification', 'Regulates elimination', 'Balances apana vayu', 'Grounds energy'],
    instructions: [
      'Sit in comfortable position',
      'Hold hands with palms up',
      'Touch thumb tip to middle and ring fingertips',
      'Extend index and pinky fingers',
      'Breathe naturally',
      'Hold for 15-45 minutes daily'
    ],
    duration: '15-45 minutes'
  },
  {
    id: 'shunya-mudra',
    name: 'Shunya Mudra',
    sanskrit: 'शून्य mudrā',
    meaning: 'Gesture of Emptiness',
    category: 'breathing',
    element: 'air',
    chakra: 'throat',
    difficulty: 'intermediate',
    handPositions: ['Palm facing up', 'Middle finger touches thumb base', 'Other fingers extended'],
    benefits: ['Reduces ear pain', 'Balances air element', 'Clears throat chakra', 'Alleviates vertigo'],
    instructions: [
      'Sit or stand comfortably',
      'Place hands palm up',
      'Bend middle finger to touch thumb base',
      'Press thumb onto middle finger',
      'Keep other fingers relaxed',
      'Practice for 5-10 minutes'
    ],
    duration: '5-10 minutes',
    contraindications:['Heart conditions', 'High blood pressure']
  },

  // Healing Mudras
  {
    id: 'surya-mudra',
    name: 'Surya Mudra',
    sanskrit: 'सूर्य mudrā',
    meaning: 'Gesture of Sun',
    category: 'healing',
    element: 'fire',
    chakra: 'solar',
    difficulty: 'beginner',
    handPositions: ['Palm facing up', 'Ring finger touches thumb base', 'Thumb presses ring finger'],
    benefits: ['Stimulates metabolism', 'Aids weight management', 'Increases body heat', 'Balances fire element'],
    instructions: [
      'Sit comfortably',
      'Place hands palm up',
      'Bend ring finger to touch thumb base',
      'Press thumb onto ring finger',
      'Keep other fingers relaxed',
      'Practice for 5-15 minutes'
    ],
    duration: '5-15 minutes',
    contraindications: ['Fever', 'Hyperthyroidism', 'Heart inflammation']
  },
  {
    id: 'varuna-mudra',
    name: 'Varuna Mudra',
    sanskrit: 'वरुण mudrā',
    meaning: 'Gesture of Water',
    category: 'healing',
    element: 'water',
    chakra: 'heart',
    difficulty: 'beginner',
    handPositions: ['Palm facing up', 'Pinky finger touches thumb base', 'Thumb presses pinky'],
    benefits: ['Hydrates body', 'Balances water element', 'Improves skin', 'Reduces joint pain'],
    instructions: [
      'Sit in meditation pose',
      'Hold hands with palms up',
      'Bend pinky finger to touch thumb base',
      'Press thumb onto pinky finger',
      'Keep other fingers relaxed',
      'Practice for 5-20 minutes'
    ],
    duration: '5-20 minutes',
    contraindications: ['Edema', 'Kidney disease']
  },
  {
    id: 'rudra-mudra',
    name: 'Rudra Mudra',
    sanskrit: 'रुद्र mudrā',
    meaning: 'Gesture of Storm God',
    category: 'healing',
    element: 'all',
    chakra: 'heart',
    difficulty: 'intermediate',
    handPositions: ['Palms facing up', 'Index finger touches thumb base', 'Thumb and fingers form circle'],
    benefits: ['Strengthens heart', 'Improves circulation', 'Balances all elements', 'Increases energy flow'],
    instructions: [
      'Sit comfortably with hands open',
      'Bring hands in front of heart',
      'Touch index fingertips to thumb bases',
      'Press thumbs onto index fingers',
      'Keep ring and pinky fingers extended',
      'Breathe deeply into the heart'
    ],
    duration: '10-30 minutes',
    contraindications: ['Heart pacemakers']
  },

  // Manifestation Mudras
  {
    id: 'lapa-mudra',
    name: 'Lapa Mudra',
    sanskrit: 'लापा mudrā',
    meaning: 'Gesture of Abundance',
    category: 'manifestation',
    element: 'earth',
    chakra: 'root',
    difficulty: 'beginner',
    handPositions: ['Fists with index and middle fingers interlaced', 'Thumbs wrapped over'],
    benefits: ['Attracts abundance', 'Manifests desires', 'Grounds intentions', 'Opens prosperity channels'],
    instructions: [
      'Sit comfortably',
      'Interlace index and middle fingers',
      'Make gentle fists with both hands',
      'Wrap thumbs over the fist',
      'Place hands on lower abdomen',
      'Visualize abundance flowing'
    ],
    duration: '5-15 minutes'
  },
  {
    id: 'kuber-mudra',
    name: 'Kuber Mudra',
    sanskrit: 'कुबेर mudrā',
    meaning: 'Gesture of Wealth',
    category: 'manifestation',
    element: 'earth',
    chakra: 'root',
    difficulty: 'beginner',
    handPositions: ['Index fingers interlocked', 'Thumbs touching', 'Other fingers interlaced'],
    benefits: ['Attracts wealth', 'Opens financial flows', 'Honors abundance deities', 'Balances wealth energy'],
    instructions: [
      'Sit in meditation posture',
      'Interlock index fingers loosely',
      'Touch thumb tips together',
      'Interlace remaining fingers',
      'Hold near the heart',
      ' Chant or think of abundance'
    ],
    duration: '10-20 minutes'
  },
  {
    id: 'abhic-mudra',
    name: 'Abhic Mudra',
    sanskrit: 'अभीच mudrā',
    meaning: 'Gesture of Intention',
    category: 'manifestation',
    element: 'fire',
    chakra: 'solar',
    difficulty: 'intermediate',
    handPositions: ['Fists with thumbs pointing up', 'Right thumb over left', 'Fists touching'],
    benefits: ['Sets powerful intention', 'Amplifies will', 'Creates magical impact', 'Focuses personal power'],
    instructions: [
      'Sit or stand with purpose',
      'Make fists with thumbs extended up',
      'Place fists together touching',
      'Right thumb over left thumb',
      'Breathe fire energy into fists',
      'Set your highest intention'
    ],
    duration: '3-7 minutes'
  },

  // Protection Mudras
  {
    id: 'vajra-prakpti-mudra',
    name: 'Vajra Prakpti Mudra',
    sanskrit: 'वज्र प्रकृति mudrā',
    meaning: 'Gesture of Indestructible Nature',
    category: 'protection',
    element: 'all',
    chakra: 'all',
    difficulty: 'intermediate',
    handPositions: ['Index fingers bent touching thumbs', 'Middle fingers touching', 'Ring and pinky fingers touch'],
    benefits: ['Creates protective shield', 'Strengthens aura', 'Blocks negative energy', 'Connects to immutable self'],
    instructions: [
      'Sit comfortably with hands open',
      'Bend index fingers to touch thumbs',
      'Touch middle fingers at tips',
      'Touch ring fingers at tips',
      'Touch pinky fingers at tips',
      'Visualize protective light forming'
    ],
    duration: '5-20 minutes'
  },
  {
    id: 'avahan-mudra',
    name: 'Avahan Mudra',
    sanskrit: 'आवाहन mudrā',
    meaning: 'Gesture of Invocation',
    category: 'protection',
    element: 'ether',
    chakra: 'crown',
    difficulty: 'intermediate',
    handPositions: ['Palms facing up', 'All fingertips touching', 'Like holding a ball'],
    benefits: ['Invokes divine presence', 'Opens channel for guidance', 'Protects during channeling', 'Connects to higher realms'],
    instructions: [
      'Sit in prayer position',
      'Slowly open palms facing up',
      'Touch all fingertips together',
      'Imagine holding sacred energy',
      'Invite divine presence',
      'Receive guidance with open heart'
    ],
    duration: '5-30 minutes'
  },
  {
    id: 'ksep-mudra',
    name: 'Ksep Mudra',
    sanskrit: 'क्षेप mudrā',
    meaning: 'Gesture of Release',
    category: 'protection',
    element: 'air',
    chakra: 'heart',
    difficulty: 'beginner',
    handPositions: ['Fists with pinkies extended', 'Shake gently'],
    benefits: ['Releases negative energy', 'Shakes off burdens', 'Clears emotional blockages', 'Restores lightness'],
    instructions: [
      'Sit or stand comfortably',
      'Make loose fists with pinky fingers extended',
      'Begin shaking hands gently',
      'Release tension with each shake',
      'Breathe out with each movement',
      'Continue until feel lighter'
    ],
    duration: '2-5 minutes'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllMudras(): Mudra[] {
  return mudraData;
}

function getMudraById(id: string): Mudra | undefined {
  return mudraData.find(m => m.id === id);
}

function filterMudras(query: MudraQuery): Mudra[] {
  return mudraData.filter(mudra => {
    if (query.category && mudra.category !== query.category) return false;
    if (query.element && mudra.element !== query.element && mudra.element !== 'all') return false;
    if (query.chakra && mudra.chakra !== query.chakra && mudra.chakra !== 'all') return false;
    if (query.difficulty && mudra.difficulty !== query.difficulty) return false;
    if (query.name) {
      const searchName = query.name.toLowerCase();
      if (!mudra.name.toLowerCase().includes(searchName) &&
          !mudra.sanskrit.toLowerCase().includes(searchName)) {
        return false;
      }
    }
    return true;
  });
}

function getCategories(): { category: MudraCategory; count: number }[] {
  const counts: Record<MudraCategory, number> = {
    connection: 0,
    meditation: 0,
    breathing: 0,
    healing: 0,
    manifestation: 0,
    protection: 0
  };
  mudraData.forEach(m => counts[m.category]++);
  return Object.entries(counts).map(([category, count]) => ({
    category: category as MudraCategory,
    count
  }));
}

function getElements(): { element: MudraElement; count: number }[] {
  const counts: Record<MudraElement, number> = {
    earth: 0,
    water: 0,
    fire: 0,
    air: 0,
    ether: 0,
    all: 0
  };
  mudraData.forEach(m => counts[m.element]++);
  return Object.entries(counts).map(([element, count]) => ({
    element: element as MudraElement,
    count
  }));
}

function getChakras(): { chakra: MudraChakra; count: number }[] {
  const counts: Record<MudraChakra, number> = {
    root: 0,
    sacral: 0,
    solar: 0,
    heart: 0,
    throat: 0,
    third_eye: 0,
    crown: 0,
    all: 0
  };
  mudraData.forEach(m => counts[m.chakra]++);
  return Object.entries(counts).map(([chakra, count]) => ({
    chakra: chakra as MudraChakra,
    count
  }));
}

function getMetadata() {
  return {
    total: mudraData.length,
    categories: getCategories(),
    elements: getElements(),
    chakras: getChakras(),
    difficulties: {
      beginner: mudraData.filter(m => m.difficulty === 'beginner').length,
      intermediate: mudraData.filter(m => m.difficulty === 'intermediate').length,
      advanced: mudraData.filter(m => m.difficulty === 'advanced').length
    }
  };
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/mudra/data
 * Retrieve mudra data with optional filtering
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const action = searchParams.get('action');
  const id = searchParams.get('id');
  const category = searchParams.get('category') as MudraCategory | null;
  const element = searchParams.get('element') as MudraElement | null;
  const chakra = searchParams.get('chakra') as MudraChakra | null;
  const difficulty = searchParams.get('difficulty') as MudraDifficulty | null;
  const name = searchParams.get('name');

  try {
    // Get single mudra by ID
    if (id) {
      const mudra = getMudraById(id);
      if (!mudra) {
        return NextResponse.json(
          { error: 'Mudra not found', id },
          { status: 404 }
        );
      }
      return NextResponse.json({ mudra });
    }

    // Get metadata/stats
    if (action === 'metadata') {
      return NextResponse.json({ metadata: getMetadata() });
    }

    // Get all mudras with optional filtering
    const query: MudraQuery = {};
    if (category) query.category = category;
    if (element) query.element = element;
    if (chakra) query.chakra = chakra;
    if (difficulty) query.difficulty = difficulty;
    if (name) query.name = name;

    const hasFilters = Object.keys(query).length > 0;
    const mudras = hasFilters ? filterMudras(query) : getAllMudras();

    return NextResponse.json({
      mudras,
      count: mudras.length,
      ...(hasFilters && { filters: query })
    });

  } catch (error) {
    console.error('Mudra API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
