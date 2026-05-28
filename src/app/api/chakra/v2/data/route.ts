// ============================================================
// CHAKRA DATA API v2 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for chakra data
// - Retrieve all chakra information
// - Chakra healing and balancing data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed chakra data for spiritual practice
const CHAKRA_DATA = [
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
    deity: 'Lakini',
    mantra: 'Ram',
    qualities: ['Personal power', 'Willpower', 'Self-esteem'],
    balance: {
      excess: ['Domination', 'Aggressiveness', 'Control issues'],
      deficiency: ['Low self-esteem', 'Passive behavior', 'Difficulty setting boundaries'],
      practice: ['Fire breathing', 'Core exercises', 'Yellow crystal healing'],
    },
    associatedSefirot: ['Chesed'],
    associatedPlanets: ['Mars', 'Sun'],
    elements: ['Fire', 'Earth'],
    score: 3,
  },
  {
    id: 'svadhisthana',
    name: 'Sacral Chakra',
    namePt: 'Chakra Sacral',
    sanskrit: 'Svadhisthana',
    meaning: 'One\'s own abode - emotions',
    element: 'Water',
    color: 'Orange',
    location: 'Lower abdomen',
    frequency: '417 Hz',
    deity: 'Rakini',
    mantra: 'Vam',
    qualities: ['Emotions', 'Creativity', 'Sexuality'],
    balance: {
      excess: ['Emotional instability', 'Addictions', 'Manipulation'],
      deficiency: ['Emotional numbness', 'Lack of creativity', 'Sexual dysfunction'],
      practice: ['Water meditation', 'Hip opening yoga', 'Orange crystal healing'],
    },
    associatedSefirot: ['Gevurah'],
    associatedPlanets: ['Moon', 'Venus'],
    elements: ['Water', 'Fire'],
    score: 2,
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
    deity: ' Ganesha',
    mantra: 'Lam',
    qualities: ['Survival', 'Security', 'Grounding'],
    balance: {
      excess: ['Hoarding', 'Material obsession', 'Aggression'],
      deficiency: ['Insecurity', 'Anxiety', 'Disconnection from body'],
      practice: ['Grounding exercises', 'Root meditation', 'Red crystal healing'],
    },
    associatedSefirot: ['Malchut'],
    associatedPlanets: ['Saturn', 'Mars'],
    elements: ['Earth', 'Fire'],
    score: 1,
  },
];

// GET /api/chakra/v2/data - Get all chakra data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chakraId = searchParams.get('id');

    if (chakraId) {
      const chakra = CHAKRA_DATA.find((c) => c.id === chakraId);
      if (!chakra) {
        return NextResponse.json(
          { error: 'Chakra not found', availableIds: CHAKRA_DATA.map((c) => c.id) },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: chakra });
    }

    return NextResponse.json({
      data: CHAKRA_DATA,
      meta: {
        count: CHAKRA_DATA.length,
        version: 'v2',
        category: 'chakra',
      },
    });
  } catch (error) {
    console.error('Chakra API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}