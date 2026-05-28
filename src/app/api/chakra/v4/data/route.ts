// ============================================================
// CHAKRA DATA API v4 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for chakra data v4
// - Advanced spiritual geometry and consciousness mapping
// - Quantum resonance patterns and multidimensional aspects
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
  // v4 additional fields
  quantumFrequency?: number;
  dimensionalLevel?: number;
  consciousnessAspect?: string;
  kundaliniStage?: number;
  energyCenter?: string;
  planetaryInfluence?: string;
  cosmicCorrespondences?: string[];
  healingResonance?: string[];
  activationMantra?: string;
  transmutationProcess?: string[];
}

// ============================================================
// CHAKRA DATA v4
// ============================================================

const CHAKRA_DATA_V4: ChakraData[] = [
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
    quantumFrequency: 963,
    dimensionalLevel: 12,
    consciousnessAspect: 'Pure Awareness',
    kundaliniStage: 7,
    energyCenter: 'Cosmic Gateway',
    planetaryInfluence: 'Transcendent',
    cosmicCorrespondences: ['Source', 'Unity', 'Infinite'],
    healingResonance: ['936 Hz', '528 Hz', '741 Hz'],
    activationMantra: 'Om Shrim Hum',
    transmutationProcess: ['Ego dissolution', 'Light body activation', 'Unity consciousness'],
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
    quantumFrequency: 852,
    dimensionalLevel: 11,
    consciousnessAspect: 'Inner Vision',
    kundaliniStage: 6,
    energyCenter: 'Intuitive Gateway',
    planetaryInfluence: 'Mental',
    cosmicCorrespondences: ['Akasha', 'Timelessness', 'Inner knowing'],
    healingResonance: ['741 Hz', '639 Hz', '528 Hz'],
    activationMantra: 'Om Shrim',
    transmutationProcess: ['Psychic development', 'Intuition refinement', 'Inner sight'],
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
    quantumFrequency: 741,
    dimensionalLevel: 10,
    consciousnessAspect: 'Truth Expression',
    kundaliniStage: 5,
    energyCenter: 'Vocal Gateway',
    planetaryInfluence: 'Communicative',
    cosmicCorrespondences: ['Ether', 'Vibration', 'Resonance'],
    healingResonance: ['639 Hz', '528 Hz', '396 Hz'],
    activationMantra: 'Hum Nam',
    transmutationProcess: ['Voice activation', 'Truth speaking', 'Creative expression'],
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
    quantumFrequency: 639,
    dimensionalLevel: 9,
    consciousnessAspect: 'Unconditional Love',
    kundaliniStage: 4,
    energyCenter: 'Heart Gateway',
    planetaryInfluence: 'Loving',
    cosmicCorrespondences: ['Heart', 'Compassion', 'Unity'],
    healingResonance: ['528 Hz', '417 Hz', '639 Hz'],
    activationMantra: 'Yam Ram',
    transmutationProcess: ['Heart opening', 'Compassion cultivation', 'Love integration'],
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
    quantumFrequency: 528,
    dimensionalLevel: 8,
    consciousnessAspect: 'Personal Power',
    kundaliniStage: 3,
    energyCenter: 'Power Gateway',
    planetaryInfluence: 'Dynamic',
    cosmicCorrespondences: ['Fire', 'Transformation', 'Power'],
    healingResonance: ['417 Hz', '396 Hz', '528 Hz'],
    activationMantra: 'Ram Cham',
    transmutationProcess: ['Power awakening', 'Will development', 'Self-confidence'],
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
    quantumFrequency: 417,
    dimensionalLevel: 7,
    consciousnessAspect: 'Creative Flow',
    kundaliniStage: 2,
    energyCenter: 'Creative Gateway',
    planetaryInfluence: 'Creative',
    cosmicCorrespondences: ['Water', 'Emotion', 'Creation'],
    healingResonance: ['396 Hz', '417 Hz', '528 Hz'],
    activationMantra: 'Vam Sham',
    transmutationProcess: ['Emotional balance', 'Creativity activation', 'Intimacy healing'],
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
    quantumFrequency: 396,
    dimensionalLevel: 6,
    consciousnessAspect: 'Survival Foundation',
    kundaliniStage: 1,
    energyCenter: 'Root Gateway',
    planetaryInfluence: 'Grounding',
    cosmicCorrespondences: ['Earth', 'Stability', 'Foundation'],
    healingResonance: ['396 Hz', '417 Hz', '528 Hz'],
    activationMantra: 'Lam Kam',
    transmutationProcess: ['Grounding stabilization', 'Trust building', 'Survival instincts'],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getChakraById(id: string): ChakraData | undefined {
  return CHAKRA_DATA_V4.find((c) => c.id === id);
}

function getChakrasByElement(element: string): ChakraData[] {
  return CHAKRA_DATA_V4.filter((c) => c.elements.includes(element));
}

function getChakrasByScore(minScore: number): ChakraData[] {
  return CHAKRA_DATA_V4.filter((c) => c.score >= minScore);
}

function getChakrasByDimensionalLevel(level: number): ChakraData[] {
  return CHAKRA_DATA_V4.filter((c) => c.dimensionalLevel === level);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/chakra/v4/data
 * Retrieve chakra data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const element = searchParams.get('element');
    const minScore = searchParams.get('minScore');
    const format = searchParams.get('format');
    const dimensional = searchParams.get('dimensional');

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
          quantumFrequency: chakra.quantumFrequency,
          dimensionalLevel: chakra.dimensionalLevel,
        });
      }

      if (format === 'full') {
        return NextResponse.json({
          ...chakra,
          activationDate: new Date().toISOString(),
          apiVersion: 'v4',
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
        version: 'v4',
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
        version: 'v4',
      });
    }

    // Filter by dimensional level (v4 feature)
    if (dimensional) {
      const level = parseInt(dimensional, 10);
      if (isNaN(level)) {
        return NextResponse.json(
          { error: 'Invalid dimensional parameter' },
          { status: 400 }
        );
      }
      const filtered = getChakrasByDimensionalLevel(level);
      return NextResponse.json({
        dimensionalLevel: level,
        chakras: filtered,
        count: filtered.length,
        version: 'v4',
      });
    }

    // Return all chakra data
    return NextResponse.json({
      version: 'v4',
      count: CHAKRA_DATA_V4.length,
      chakras: CHAKRA_DATA_V4,
    });
  } catch (error) {
    console.error('Chakra v4 data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}