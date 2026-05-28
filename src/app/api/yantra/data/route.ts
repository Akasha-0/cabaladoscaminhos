// ============================================================
// YANTRA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for yantra data
// - Sacred geometric diagrams
// - Mantra associations and vibrations
// - Spiritual correspondences
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export interface YantraBalance {
  excess: string[];
  deficiency: string[];
  practice: string[];
}

export interface YantraData {
  id: string;
  name: string;
  namePt: string;
  meaning: string;
  geometry: string;
  color: string;
  element: string;
  deity: string;
  mantra: string;
  planets: string[];
  sefirot: string[];
  qualities: string[];
  balance: YantraBalance;
  score: number;
  vibrationPattern?: string;
  sacredShape?: string[];
  numerologyNumber?: number;
}

// ============================================================
// YANTRA DATA
// ============================================================

const YANTRA_DATA: YantraData[] = [
  {
    id: 'sri-yantra',
    name: 'Sri Yantra',
    namePt: 'Yantra de Sri',
    meaning: 'Supreme instrument - cosmic creation',
    geometry: 'Nine interlocking triangles',
    color: 'Gold / Yellow',
    element: 'Ether',
    deity: 'Tripura Sundari',
    mantra: 'Om Aim Klim Sauh',
    planets: ['Venus', 'Sun'],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed'],
    qualities: ['Abundance', 'Prosperity', 'Divine feminine'],
    balance: {
      excess: ['Attachment to material wealth', 'Over-indulgence', 'Vanity'],
      deficiency: ['Financial lack', 'Low self-worth', 'Difficulty receiving'],
      practice: ['Daily meditation', 'Meru puja', 'Seed syllable chanting'],
    },
    score: 9,
    vibrationPattern: 'triangle-resonance',
    sacredShape: ['Triangle', 'Hexagon', 'Circle'],
    numerologyNumber: 9,
  },
  {
    id: 'kali-yantra',
    name: 'Kali Yantra',
    namePt: 'Yantra de Kali',
    meaning: 'Time goddess instrument - transformation',
    geometry: 'Square with inner triangles',
    color: 'Black / Dark Blue',
    element: 'Fire',
    deity: 'Kali',
    mantra: 'Om Kreem Kreem Kreem Dhah',
    planets: ['Saturn', 'Mars'],
    sefirot: ['Gevurah', 'Hod'],
    qualities: ['Transformation', 'Protection', 'Inner power'],
    balance: {
      excess: ['Aggression', 'Destructiveness', 'Fear tactics'],
      deficiency: ['Fear of change', 'Passivity', 'Weak boundaries'],
      practice: ['Chant Kali mantra', 'Visualize dark triangle', 'Worship black stone'],
    },
    score: 7,
    vibrationPattern: 'square-destruction',
    sacredShape: ['Square', 'Triangle', 'Pentagon'],
    numerologyNumber: 7,
  },
  {
    id: 'lakshmi-yantra',
    name: 'Lakshmi Yantra',
    namePt: 'Yantra de Lakshmi',
    meaning: 'Wealth goddess instrument - abundance',
    geometry: 'Eight petals with central square',
    color: 'Orange / Gold',
    element: 'Earth',
    deity: 'Lakshmi',
    mantra: 'Om Shrim',
    planets: ['Venus', 'Jupiter'],
    sefirot: ['Chesed', 'Netzach'],
    qualities: ['Wealth', 'Beauty', 'Grace'],
    balance: {
      excess: ['Greed', 'Materialism', 'uperficiality'],
      deficiency: ['Poverty consciousness', 'Insecurity', 'Jealousy'],
      practice: ['Friday worship', 'Lotus visualization', 'Wealth mantras'],
    },
    score: 8,
    vibrationPattern: 'lotus-glow',
    sacredShape: ['Circle', 'Square', 'Octagon'],
    numerologyNumber: 8,
  },
  {
    id: 'saraswati-yantra',
    name: 'Saraswati Yantra',
    namePt: 'Yantra de Saraswati',
    meaning: 'Knowledge goddess instrument - wisdom',
    geometry: 'Five triangles around a circle',
    color: 'White / Silver',
    element: 'Water',
    deity: 'Saraswati',
    mantra: 'Om Aim Saraswatiyei',
    planets: ['Mercury', 'Moon'],
    sefirot: ['Binah', 'Hod'],
    qualities: ['Knowledge', 'Arts', 'Purification'],
    balance: {
      excess: ['Intellectual pride', 'Detachment', 'Over-analysis'],
      deficiency: ['Learning difficulties', 'Creative blocks', 'Confusion'],
      practice: ['Study sacred texts', 'Play musical instruments', 'White lotus puja'],
    },
    score: 8,
    vibrationPattern: 'water-flow',
    sacredShape: ['Triangle', 'Circle', 'Diamond'],
    numerologyNumber: 5,
  },
  {
    id: 'gayatri-yantra',
    name: 'Gayatri Yantra',
    namePt: 'Yantra de Gayatri',
    meaning: 'Sun hymn instrument - enlightenment',
    geometry: 'Forty-nine triangles in grid',
    color: 'Yellow / Orange',
    element: 'Fire',
    deity: 'Gayatri',
    mantra: 'Om Bhur Bhuvah Swaha',
    planets: ['Sun', 'Jupiter'],
    sefirot: ['Tiferet', 'Chesed'],
    qualities: ['Illumination', 'Purification', 'Awakening'],
    balance: {
      excess: ['Fanaticism', 'Self-righteousness', 'Burnout'],
      deficiency: ['Low vitality', 'Mental fog', 'Spiritual stagnation'],
      practice: ['Morning Gayatri mantra', 'Sun salutations', 'Meditate at dawn'],
    },
    score: 9,
    vibrationPattern: 'sun-spoke',
    sacredShape: ['Triangle', 'Square', 'Circle'],
    numerologyNumber: 108,
  },
  {
    id: 'hanuman-yantra',
    name: 'Hanuman Yantra',
    namePt: 'Yantra de Hanuman',
    meaning: 'Monkey god instrument - protection',
    geometry: 'Hexagon with central triangle',
    color: 'Orange / Red',
    element: 'Fire',
    deity: 'Hanuman',
    mantra: 'Om Anjaneyaye',
    planets: ['Mars', 'Saturn'],
    sefirot: ['Gevurah', 'Yesod'],
    qualities: ['Strength', 'Devotion', 'Courage'],
    balance: {
      excess: ['Anger', 'Restlessness', 'Over-achievement'],
      deficiency: ['Fear', 'Self-doubt', 'Weakness'],
      practice: ['Chant Hanuman Chalisa', 'Light orange lamp', 'Serve others'],
    },
    score: 7,
    vibrationPattern: 'monkey-leap',
    sacredShape: ['Triangle', 'Hexagon', 'Pentagon'],
    numerologyNumber: 5,
  },
  {
    id: 'durga-yantra',
    name: 'Durga Yantra',
    namePt: 'Yantra de Durga',
    meaning: 'Protector goddess instrument - victory',
    geometry: 'Nine pointed star',
    color: 'Red / Orange',
    element: 'Fire',
    deity: 'Durga',
    mantra: 'Om Dum Durgayei',
    planets: ['Mars', 'Sun'],
    sefirot: ['Gevurah', 'Malchut'],
    qualities: ['Protection', 'Victory', 'Feminine power'],
    balance: {
      excess: ['Violence', 'Domination', 'Martyr complex'],
      deficiency: ['Vulnerability', 'Victim mentality', 'Indecision'],
      practice: ['Durga mantra', 'Red cloth offering', 'Battle meditation'],
    },
    score: 8,
    vibrationPattern: 'nine-star',
    sacredShape: ['Triangle', 'Pentagon', 'Circle'],
    numerologyNumber: 9,
  },
  {
    id: 'shiva-yantra',
    name: 'Shiva Yantra',
    namePt: 'Yantra de Shiva',
    meaning: 'Destroyer god instrument - transformation',
    geometry: 'Downward triangle in circle',
    color: 'White / Gray',
    element: 'Ether',
    deity: 'Shiva',
    mantra: 'Om Namah Shivaya',
    planets: ['Saturn', 'Rahu'],
    sefirot: ['Kether', 'Daat'],
    qualities: ['Transformation', 'Meditation', 'Pure consciousness'],
    balance: {
      excess: ['Destruction tendency', 'Detachment', 'Coldness'],
      deficiency: ['Stagnation', 'Attachment', 'Confusion'],
      practice: ['Shiva meditation', 'Bhasma application', 'Ice water ritual'],
    },
    score: 9,
    vibrationPattern: 'lingam-pulse',
    sacredShape: ['Triangle', 'Circle', 'Oval'],
    numerologyNumber: 5,
  },
  {
    id: 'vishnu-yantra',
    name: 'Vishnu Yantra',
    namePt: 'Yantra de Vishnu',
    meaning: 'Preserver god instrument - stability',
    geometry: 'Square within circle',
    color: 'Blue / Yellow',
    element: 'Water',
    deity: 'Vishnu',
    mantra: 'Om Namo Narayanaya',
    planets: ['Jupiter', 'Venus'],
    sefirot: ['Chesed', 'Tiferet'],
    qualities: ['Stability', 'Protection', 'Universal love'],
    balance: {
      excess: ['Inertia', 'Over-protection', 'Complacency'],
      deficiency: ['Instability', 'Anxiety', 'Lack of faith'],
      practice: ['Vishnu mantra', 'Tulsi worship', 'Blue gem meditation'],
    },
    score: 8,
    vibrationPattern: 'four-direction',
    sacredShape: ['Circle', 'Square', 'Cross'],
    numerologyNumber: 4,
  },
  {
    id: 'ganesha-yantra',
    name: 'Ganesha Yantra',
    namePt: 'Yantra de Ganesha',
    meaning: 'Remover of obstacles instrument',
    geometry: 'Four corner triangles',
    color: 'Red / Pink',
    element: 'Earth',
    deity: 'Ganesha',
    mantra: 'Om Gam Ganapatayei',
    planets: ['Mercury', 'Moon'],
    sefirot: ['Netzach', 'Malchut'],
    qualities: ['Remove obstacles', 'New beginnings', 'Wisdom'],
    balance: {
      excess: ['Stubbornness', 'Attachment to routine', 'Over-caution'],
      deficiency: ['Procrastination', 'Fear of new ventures', 'Blocks everywhere'],
      practice: ['Ganesha mantra', 'Modak offering', 'Pranayama'],
    },
    score: 7,
    vibrationPattern: 'elephant-trunk',
    sacredShape: ['Circle', 'Triangle', 'Square'],
    numerologyNumber: 4,
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getYantraById(id: string): YantraData | undefined {
  return YANTRA_DATA.find((y) => y.id === id);
}

function getYantrasByElement(element: string): YantraData[] {
  return YANTRA_DATA.filter((y) => y.element.toLowerCase() === element.toLowerCase());
}

function getYantrasByPlanet(planet: string): YantraData[] {
  return YANTRA_DATA.filter((y) => 
    y.planets.some((p) => p.toLowerCase() === planet.toLowerCase())
  );
}

function getYantrasByScore(minScore: number): YantraData[] {
  return YANTRA_DATA.filter((y) => y.score >= minScore);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/yantra/data
 * Retrieve yantra data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const element = searchParams.get('element');
    const planet = searchParams.get('planet');
    const minScore = searchParams.get('minScore');
    const format = searchParams.get('format');

    // Single yantra by ID
    if (id) {
      const yantra = getYantraById(id);
      if (!yantra) {
        return NextResponse.json(
          { error: 'Yantra not found', id },
          { status: 404 }
        );
      }

      if (format === 'summary') {
        return NextResponse.json({
          id: yantra.id,
          name: yantra.name,
          namePt: yantra.namePt,
          geometry: yantra.geometry,
          color: yantra.color,
          mantra: yantra.mantra,
        });
      }

      return NextResponse.json(yantra);
    }

    // Filter by element
    if (element) {
      const filtered = getYantrasByElement(element);
      return NextResponse.json({
        element,
        yantras: filtered,
        count: filtered.length,
      });
    }

    // Filter by planet
    if (planet) {
      const filtered = getYantrasByPlanet(planet);
      return NextResponse.json({
        planet,
        yantras: filtered,
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
      const filtered = getYantrasByScore(score);
      return NextResponse.json({
        minScore: score,
        yantras: filtered,
        count: filtered.length,
      });
    }

    // Return all yantra data
    return NextResponse.json({
      version: 'v1',
      count: YANTRA_DATA.length,
      yantras: YANTRA_DATA,
    });
  } catch (error) {
    console.error('Yantra data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}