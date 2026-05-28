// src/app/api/odobande/data/route.ts
// Odobande API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OdobandeCategory = 'crossroads' | 'paths' | 'doors' | 'transitions' | 'guardian';
export type OdobandeElement = 'air' | 'earth' | 'fire' | 'water';
export type OdobandeOsain = 'odobande' | 'ogbe' | 'oyeku' | 'iwori' | 'odi' | 'osi' | 'oba' | 'ogun' | 'rosun' | 'fe' | 'ejia' | 'ka' | 'she' | 'jeshue' | 'opele' | 'yeka';

export interface OdobandeQuery {
  category?: OdobandeCategory;
  element?: OdobandeElement;
  osain?: OdobandeOsain;
  search?: string;
}

export interface OdobandePath {
  id: string;
  name: string;
  description: string;
  category: OdobandeCategory;
  element: OdobandeElement;
  osain: OdobandeOsain;
  symbols: string[];
  offerings: string[];
  prayers: string[];
  practices: string[];
  invocation: string;
  blocks_paths?: string[];
  opens_paths?: string[];
}

export interface OdobandeMetadata {
  total: number;
  categories: { category: OdobandeCategory; count: number }[];
  elements: { element: OdobandeElement; count: number }[];
  osainSigns: { osain: OdobandeOsain; count: number }[];
}

// ============================================================
// ODOBANDE DATA
// ============================================================

const odobandeData: OdobandePath[] = [
  {
    id: 'odobande-crossroads',
    name: 'Odobande Crossroads Path',
    description: 'The foundational path of Odobande at the crossroads where all paths meet. This path represents the power of choice and the guardian of all intersections.',
    category: 'crossroads',
    element: 'air',
    osain: 'odobande',
    symbols: ['crossroads', 'key', 'threshold'],
    offerings: ['palm wine', 'coconut', 'white cloth', 'salt'],
    prayers: ['Odobande at the crossroads', 'Odobande opens the way'],
    practices: ['crossroads meditation', 'path honoring', 'threshold ritual'],
    invocation: 'Odobande keeper of all paths, guardian of every crossroads, open the way that is meant for me.',
    blocks_paths: [],
    opens_paths: ['odobande-paths', 'odobande-transitions']
  },
  {
    id: 'odobande-paths',
    name: 'Odobande Paths Guardian',
    description: 'The guardian aspect of Odobande overseeing all life paths. This path represents the guidance through life journeys and the protection at each turning point.',
    category: 'paths',
    element: 'earth',
    osain: 'ogbe',
    symbols: ['path markers', 'compass', 'way signs'],
    offerings: ['kola nuts', 'parrots feathers', 'bread', 'honey'],
    prayers: ['Guide my path', 'Protect my journey'],
    practices: ['path divination', 'way offerings', 'journey protection ritual'],
    invocation: 'Odobande who guards all paths, show me the way and protect my journey from beginning to end.',
    blocks_paths: [],
    opens_paths: ['odobande-transitions', 'odobande-doors']
  },
  {
    id: 'odobande-doors',
    name: 'Odobande Doors Path',
    description: 'The path of Odobande as keeper of doors and thresholds. This path represents the power to open and close passages between worlds and states of being.',
    category: 'doors',
    element: 'fire',
    osain: 'opele',
    symbols: ['doorway', 'keys', 'lintels'],
    offerings: ['iron keys', 'door frames', 'vinegar', 'candle'],
    prayers: ['Open the door', 'Close what should not pass'],
    practices: ['door opening ritual', 'threshold crossing', 'portal ceremony'],
    invocation: 'Odobande who opens and closes doors, grant me passage to where I need to be and protect me from what should remain closed.',
    blocks_paths: [],
    opens_paths: ['odobande-transitions']
  },
  {
    id: 'odobande-transitions',
    name: 'Odobande Transitions Path',
    description: 'The path of Odobande governing all transitions and passages. This path represents the power to move between states, times, and realities.',
    category: 'transitions',
    element: 'water',
    osain: 'ejia',
    symbols: ['bridge', 'gate', 'portal'],
    offerings: ['milk', 'candle', 'white flowers', 'sea water'],
    prayers: ['Carry me across', 'Guide my transition'],
    practices: ['transition meditation', 'passage ritual', 'crossing ceremony'],
    invocation: 'Odobande of all transitions, carry me safely from what was to what will be, from where I am to where I must go.',
    blocks_paths: [],
    opens_paths: ['odobande-guardian']
  },
  {
    id: 'odobande-guardian',
    name: 'Odobande Guardian Path',
    description: 'The supreme guardian aspect of Odobande. This path represents the ultimate protector who stands at all boundaries and ensures safe passage.',
    category: 'guardian',
    element: 'air',
    osain: 'osi',
    symbols: ['shield', 'guardian figure', 'boundary markers'],
    offerings: ['sweet wine', 'roasted corn', 'white cloth', 'copper coin'],
    prayers: ['Guard me guardian', 'Protect my passage'],
    practices: ['guardian invocation', 'boundary protection', 'patron blessing'],
    invocation: 'Odobande supreme guardian, protector of all boundaries, I call upon your power to guard my life and ensure safe passage through all thresholds.',
    blocks_paths: [],
    opens_paths: ['odobande-crossroads']
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOdobandes(): OdobandePath[] {
  return odobandeData;
}

function getOdobandeById(id: string): OdobandePath | undefined {
  return odobandeData.find(o => o.id === id);
}

function filterOdobandes(query: OdobandeQuery): OdobandePath[] {
  let results = odobandeData;

  if (query.category) {
    results = results.filter(o => o.category === query.category);
  }

  if (query.element) {
    results = results.filter(o => o.element === query.element);
  }

  if (query.osain) {
    results = results.filter(o => o.osain === query.osain);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(o =>
      o.name.toLowerCase().includes(searchLower) ||
      o.description.toLowerCase().includes(searchLower) ||
      o.symbols.some(s => s.toLowerCase().includes(searchLower))
    );
  }

  return results;
}

function getCategories(): { category: OdobandeCategory; count: number }[] {
  const categories: Record<OdobandeCategory, number> = {
    crossroads: 0,
    paths: 0,
    doors: 0,
    transitions: 0,
    guardian: 0
  };

  odobandeData.forEach(o => {
    categories[o.category]++;
  });

  return Object.entries(categories).map(([category, count]) => ({
    category: category as OdobandeCategory,
    count
  }));
}

function getElements(): { element: OdobandeElement; count: number }[] {
  const elements: Record<OdobandeElement, number> = {
    air: 0,
    earth: 0,
    fire: 0,
    water: 0
  };

  odobandeData.forEach(o => {
    elements[o.element]++;
  });

  return Object.entries(elements).map(([element, count]) => ({
    element: element as OdobandeElement,
    count
  }));
}

function getOsainSigns(): { osain: OdobandeOsain; count: number }[] {
  const osainSigns: Record<OdobandeOsain, number> = {
    odobande: 0,
    ogbe: 0,
    oyeku: 0,
    iwori: 0,
    odi: 0,
    osi: 0,
    oba: 0,
    ogun: 0,
    rosun: 0,
    fe: 0,
    ejia: 0,
    ka: 0,
    she: 0,
    jeshue: 0,
    opele: 0,
    yeka: 0
  };

  odobandeData.forEach(o => {
    osainSigns[o.osain]++;
  });

  return Object.entries(osainSigns)
    .filter(([_, count]) => count > 0)
    .map(([osain, count]) => ({
      osain: osain as OdobandeOsain,
      count
    }));
}

function getMetadata(): OdobandeMetadata {
  return {
    total: odobandeData.length,
    categories: getCategories(),
    elements: getElements(),
    osainSigns: getOsainSigns()
  };
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/odobande/data
 * Retrieve Odobande data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OdobandeQuery = {
      category: searchParams.get('category') as OdobandeCategory | undefined,
      element: searchParams.get('element') as OdobandeElement | undefined,
      osain: searchParams.get('osain') as OdobandeOsain | undefined,
      search: searchParams.get('search') || undefined
    };

    const id = searchParams.get('id');
    const metadata = searchParams.get('metadata') === 'true';

    // If requesting specific id
    if (id) {
      const odobande = getOdobandeById(id);
      if (!odobande) {
        return NextResponse.json(
          { error: 'Odobande path not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: odobande });
    }

    // If requesting metadata
    if (metadata) {
      return NextResponse.json({ data: getMetadata() });
    }

    // Return filtered results
    const results = filterOdobandes(query);
    return NextResponse.json({
      data: results,
      total: results.length
    });
  } catch (error) {
    console.error('Odobande API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}