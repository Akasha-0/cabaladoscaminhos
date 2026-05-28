// ============================================================
// CHAKRA DATA API v3 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for chakra data v3
// - Enhanced chakra information with spiritual geometry
// - Vibration patterns and sacred mathematics
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export interface ChakraBalance {
  excess: string[];
  deficiency: string[];
  practice: string[];
}

export interface ChakraData {
  id: string;
  name: string;
  namePt: string;
  sanskrit: string;
  meaning: string;
  element: string;
  color: string;
  location: string;
  frequency: string;
  deity: string;
  mantra: string;
  qualities: string[];
  balance: ChakraBalance;
  associatedSefirot: string[];
  associatedPlanets: string[];
  elements: string[];
  score: number;
  vibrationPattern?: string;
  sacredGeometry?: string[];
  numerologyNumber?: number;
}

// ============================================================
// CHAKRA DATA v3
// ============================================================

const CHAKRA_DATA_V3: ChakraData[] = [
  {
    id: 'sahasrara',
    name: 'Crown Chakra',
    namePt: 'Chakra da Coroa',
    sanskrit: 'Sahasrara',
    meaning: 'Thousand-petaled lotus - enlightenment',
    element: 'Thought',
    color: 'Violet / White',
    location: 'Top of the head',
    frequency: '963 Hz',
    deity: 'Shiva / Parvati',
    mantra: 'Om',
    qualities: ['Pure consciousness', 'Inner wisdom', 'Transcendence'],
    balance: {
      excess: ['Spiritual bypass', 'Disconnection from body', 'Narcissistic spiritualization'],
      deficiency: ['Materialism', 'Lack of purpose', 'Difficulty with meditation'],
      practice: ['Meditation', 'Visualization', 'Sound healing'],
    },
    associatedSefirot: ['Kether', 'Chokhmah', 'Binah'],
    associatedPlanets: ['Sun', 'Neptune'],
    elements: ['Air', 'Ether'],
    score: 7,
    vibrationPattern: '1000-light-grid',
    sacredGeometry: ['Flower of Life', 'Merkaba', 'Sri Yantra'],
    numerologyNumber: 22,
  },
  {
    id: 'ajna',
    name: 'Third Eye Chakra',
    namePt: 'Chakra do Terceiro Olho',
    sanskrit: 'Ajna',
    meaning: 'Command center - intuition',
    element: 'Light',
    color: 'Indigo',
    location: 'Between the eyebrows',
    frequency: '852 Hz',
    deity: 'Hakini',
    mantra: 'Om',
    qualities: ['Intuition', 'Clairvoyance', 'Inner vision'],
    balance: {
      excess: ['Over-imagination', 'Paranoia', 'Disconnection from reality'],
      deficiency: ['Lack of clarity', 'Difficulty making decisions', 'Close-mindedness'],
      practice: ['Third eye meditation', 'Candle gazing', 'Visualization exercises'],
    },
    associatedSefirot: ['Daat'],
    associatedPlanets: ['Mercury', 'Moon'],
    elements: ['Light', 'Prana'],
    score: 6,
    vibrationPattern: 'third-eye-sight',
    sacredGeometry: ['Egg of Life', 'Hexagon', 'Star Tetrahedron'],
    numerologyNumber: 6,
  },
  {
    id: 'vishuddha',
    name: 'Throat Chakra',
    namePt: 'Chakra da Garganta',
    sanskrit: 'Vishuddha',
    meaning: 'Purification center - communication',
    element: 'Sound',
    color: 'Blue',
    location: 'Throat area',
    frequency: '741 Hz',
    deity: 'Sadakanta',
    mantra: 'Hum',
    qualities: ['Authentic expression', 'Creative communication', 'Truth'],
    balance: {
      excess: ['Too much talking', 'Aggressive communication', 'Verbal aggression'],
      deficiency: ['Fear of speaking', 'Difficulty expressing oneself', 'Withdrawal'],
      practice: ['Chanting', 'Breathwork', 'Singing exercises'],
    },
    associatedSefirot: ['Chesed', 'Gevurah'],
    associatedPlanets: ['Venus', 'Saturn'],
    elements: ['Ether', 'Sound'],
    score: 5,
    vibrationPattern: 'throat-resonance',
    sacredGeometry: ['Dodecahedron', 'Pentagon', 'Flower of Life segment'],
    numerologyNumber: 5,
  },
  {
    id: 'anahata',
    name: 'Heart Chakra',
    namePt: 'Chakra do Coração',
    sanskrit: 'Anahata',
    meaning: 'Unstruck sound - love',
    element: 'Air',
    color: 'Green / Pink',
    location: 'Center of the chest',
    frequency: '639 Hz',
    deity: 'Ishta',
    mantra: 'Yam',
    qualities: ['Unconditional love', 'Compassion', 'Forgiveness'],
    balance: {
      excess: ['Codependency', 'Over-giving', 'Self-sacrifice'],
      deficiency: ['Heartlessness', 'Isolation', 'Difficulty with relationships'],
      practice: ['Heart opening yoga', 'Loving-kindness meditation', 'Green crystal healing'],
    },
    associatedSefirot: ['Tiferet', 'Netzach', 'Hod'],
    associatedPlanets: ['Venus', 'Jupiter'],
    elements: ['Air', 'Water'],
    score: 4,
    vibrationPattern: 'heart-grid',
    sacredGeometry: ['Dodecahedron', 'Icosahedron', 'Star of David'],
    numerologyNumber: 12,
  },
  {
    id: 'manipura',
    name: 'Solar Plexus Chakra',
    namePt: 'Chakra do Plexo Solar',
    sanskrit: 'Manipura',
    meaning: 'Lustrous gem - personal power',
    element: 'Fire',
    color: 'Yellow',
    location: 'Upper abdomen',
    frequency: '528 Hz',
    deity: 'Lakshmi',
    mantra: 'Ram',
    qualities: ['Personal power', 'Self-confidence', 'Willpower'],
    balance: {
      excess: ['Domineering', 'Aggression', 'Control issues'],
      deficiency: ['Low self-esteem', 'Passivity', 'Difficulty setting boundaries'],
      practice: ['Solar plexus exercises', 'Core strengthening', 'Yellow crystal healing'],
    },
    associatedSefirot: ['Yesod', 'Hod'],
    associatedPlanets: ['Mars', 'Sun'],
    elements: ['Fire', 'Prana'],
    score: 3,
    vibrationPattern: 'solar-fire',
    sacredGeometry: ['Tetrahedron', 'Triangle', 'Hexagram'],
    numerologyNumber: 3,
  },
  {
    id: 'svadhisthana',
    name: 'Sacral Chakra',
    namePt: 'Chakra Sacral',
    sanskrit: 'Svadhisthana',
    meaning: 'One\'s own abode - creativity',
    element: 'Water',
    color: 'Orange',
    location: 'Lower abdomen',
    frequency: '417 Hz',
    deity: 'Rakini',
    mantra: 'Vam',
    qualities: ['Creativity', 'Emotional balance', 'Sexuality'],
    balance: {
      excess: ['Emotional instability', 'Over-sensitivity', 'Manipulation'],
      deficiency: ['Emotional numbness', 'Creative blocks', 'Difficulty with intimacy'],
      practice: ['Water rituals', 'Creative expression exercises', 'Orange crystal healing'],
    },
    associatedSefirot: ['Malkuth', 'Netzach'],
    associatedPlanets: ['Moon', 'Venus'],
    elements: ['Water', 'Earth'],
    score: 2,
    vibrationPattern: 'water-flow',
    sacredGeometry: ['Sphere', 'Icosahedron', 'Moon Phase patterns'],
    numerologyNumber: 2,
  },
  {
    id: 'muladhara',
    name: 'Root Chakra',
    namePt: 'Chakra Raiz',
    sanskrit: 'Muladhara',
    meaning: 'Root support - survival',
    element: 'Earth',
    color: 'Red',
    location: 'Base of the spine',
    frequency: '396 Hz',
    deity: 'Ganesha',
    mantra: 'Lam',
    qualities: ['Grounding', 'Survival instincts', 'Basic trust'],
    balance: {
      excess: ['Greed', 'Materialism', 'Aggression'],
      deficiency: ['Insecurity', 'Anxiety', 'Difficulty with basic needs'],
      practice: ['Grounding exercises', 'Walking meditation', 'Red crystal healing'],
    },
    associatedSefirot: ['Malkuth'],
    associatedPlanets: ['Saturn', 'Mars'],
    elements: ['Earth', 'Fire'],
    score: 1,
    vibrationPattern: 'earth-root',
    sacredGeometry: ['Cube', 'Square', 'Hexagon'],
    numerologyNumber: 1,
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getChakraById(id: string): ChakraData | undefined {
  return CHAKRA_DATA_V3.find((c) => c.id === id);
}

function getChakrasByElement(element: string): ChakraData[] {
  return CHAKRA_DATA_V3.filter((c) => c.elements.includes(element));
}

function getChakrasByScore(minScore: number): ChakraData[] {
  return CHAKRA_DATA_V3.filter((c) => c.score >= minScore);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/chakra/v3/data
 * Retrieve chakra data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const element = searchParams.get('element');
    const minScore = searchParams.get('minScore');
    const format = searchParams.get('format');

    // Single chakra by ID
    if (id) {
      const chakra = getChakraById(id);
      if (!chakra) {
        return NextResponse.json(
          { error: 'Chakra not found', id },
          { status: 404 }
        );
      }

      if (format === 'summary') {
        return NextResponse.json({
          id: chakra.id,
          name: chakra.name,
          namePt: chakra.namePt,
          frequency: chakra.frequency,
          color: chakra.color,
        });
      }

      return NextResponse.json(chakra);
    }

    // Filter by element
    if (element) {
      const filtered = getChakrasByElement(element);
      return NextResponse.json({
        element,
        chakras: filtered,
        count: filtered.length,
      });
    }

    // Filter by minimum score
    if (minScore) {
      const score = parseInt(minScore, 10);
      if (isNaN(score)) {
        return NextResponse.json(
          { error: 'Invalid minScore parameter' },
          { status: 400 }
        );
      }
      const filtered = getChakrasByScore(score);
      return NextResponse.json({
        minScore: score,
        chakras: filtered,
        count: filtered.length,
      });
    }

    // Return all chakra data
    return NextResponse.json({
      version: 'v3',
      count: CHAKRA_DATA_V3.length,
      chakras: CHAKRA_DATA_V3,
    });
  } catch (error) {
    console.error('Chakra v3 data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
