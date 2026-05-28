// src/app/api/ogun/data/route.ts
// Ogun API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OgunCategory = 'iron' | 'fire' | 'war' | 'craft' | 'protection' | 'paths';
export type OgunElement = 'fire' | 'iron' | 'earth' | 'air';
export type OgunOsain = 'ogbe' | 'oyeku' | 'iwori' | 'odi' | 'osi' | 'oba' | 'ogun' | 'rosun' | 'fe' | 'ejia' | 'ka' | 'she' | 'jeshue' | 'opele' | 'yeka';

export interface OgunQuery {
  category?: OgunCategory;
  element?: OgunElement;
  osain?: OgunOsain;
  search?: string;
}

export interface OgunPath {
  id: string;
  name: string;
  description: string;
  category: OgunCategory;
  element: OgunElement;
  osain: OgunOsain;
  symbols: string[];
  offerings: string[];
  prayers: string[];
  practices: string[];
  invocation: string;
  blocks_paths?: string[];
  opens_paths?: string[];
}

export interface OgunMetadata {
  total: number;
  categories: { category: OgunCategory; count: number }[];
  elements: { element: OgunElement; count: number }[];
  osainSigns: { osain: OgunOsain; count: number }[];
}

// ============================================================
// OGUN DATA
// ============================================================

const ogunData: OgunPath[] = [
  {
    id: 'ogun-iron',
    name: 'Ogun Iron Path',
    description: 'The foundational path of Ogun dealing with iron, metals, and the power of the smith. This path represents the raw force of transformation through fire and iron.',
    category: 'iron',
    element: 'iron',
    osain: 'ogun',
    symbols: ['akoko', 'ope', 'ogun-oyen'],
    offerings: ['palm wine', 'roasted yam', 'iron filings', 'cocoa leaves'],
    prayers: ['Ogun la o ma jija', 'Ogun ologbon'],
    practices: ['forge meditation', 'iron purification', 'smith craft ritual'],
    invocation: 'Ogun oni iron, Ogun oni fire, give me strength to transform raw material into sacred tool.',
    blocks_paths: [],
    opens_paths: ['ogun-fire', 'ogun-craft']
  },
  {
    id: 'ogun-fire',
    name: 'Ogun Fire Path',
    description: 'The path of Ogun through fire, representing destruction and creation. Fire is both the tool and the power of the smith.',
    category: 'fire',
    element: 'fire',
    osain: 'rosun',
    symbols: ['eye of ogun', 'flaming blade'],
    offerings: ['fire ritual', 'smoked fish', 'black soap', 'rum'],
    prayers: ['Ogun fire burn', 'Ogun destroy and create'],
    practices: ['fire ceremony', 'flame meditation', 'smelting ritual'],
    invocation: 'Ogun fire that destroys and creates, temper my spirit as iron in flame.',
    blocks_paths: [],
    opens_paths: ['ogun-war']
  },
  {
    id: 'ogun-war',
    name: 'Ogun War Path',
    description: 'The warrior aspect of Ogun, representing the divine soldier. Ogun as war deity protects his devotees in battle.',
    category: 'war',
    element: 'fire',
    osain: 'ogbe',
    symbols: ['machete', 'shield', 'spear'],
    offerings: ['roasted chicken', 'gin', 'kola nut', 'alligator pepper'],
    prayers: ['Ogun oni war', 'Ogun protect me'],
    practices: ['war dance', 'weapon meditation', 'warrior initiation'],
    invocation: 'Ogun war deity, sharp as blade, protect my path and cut down my enemies.',
    blocks_paths: [],
    opens_paths: ['ogun-protection']
  },
  {
    id: 'ogun-craft',
    name: 'Ogun Craft Path',
    description: 'The artisan aspect of Ogun, patron of all craftsmen and artists. Ogun gives the skill to create.',
    category: 'craft',
    element: 'iron',
    osain: 'opele',
    symbols: ['hammer', 'anvil', 'tongs'],
    offerings: ['bread', 'palm wine', 'iron tools', 'cotton cloth'],
    prayers: ['Ogun give me skill', 'Ogun guide my hands'],
    practices: ['craft meditation', 'tool blessing', 'creation ritual'],
    invocation: 'Ogun master craftsman, grant me the skill to create beauty from raw material.',
    blocks_paths: [],
    opens_paths: ['ogun-paths']
  },
  {
    id: 'ogun-protection',
    name: 'Ogun Protection Path',
    description: 'The guardian aspect of Ogun, protector of thresholds and sacred spaces. Ogun guards against evil.',
    category: 'protection',
    element: 'earth',
    osain: 'ka',
    symbols: ['iron gate', 'doorway', 'threshold mark'],
    offerings: ['salt', 'iron chain', 'roasted corn', 'coconut water'],
    prayers: ['Ogun protect my home', 'Ogun guard my gate'],
    practices: ['threshold ritual', 'iron ward installation', 'protection prayer'],
    invocation: 'Ogun guardian of the threshold, protect this sacred space from all harm.',
    blocks_paths: ['shadow'],
    opens_paths: []
  },
  {
    id: 'ogun-paths',
    name: 'Ogun Paths of the Roads',
    description: 'The road-opener aspect of Ogun, ruler of crossroads and all pathways. Ogun opens the way.',
    category: 'paths',
    element: 'air',
    osain: 'she',
    symbols: ['crossroads', 'road sign', 'four directions'],
    offerings: ['four kola nuts', 'palm wine', 'iron coin', 'alligator pepper'],
    prayers: ['Ogun open the road', 'Ogun clear my path'],
    practices: ['road opening ritual', 'crossroads meditation', 'direction ceremony'],
    invocation: 'Ogun lord of the crossroads, open the way before me, close the way behind me.',
    blocks_paths: [],
    opens_paths: []
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOguns(): OgunPath[] {
  return ogunData;
}

function getOgunById(id: string): OgunPath | undefined {
  return ogunData.find(o => o.id === id);
}

function filterOguns(query: OgunQuery): OgunPath[] {
  return ogunData.filter(ogun => {
    if (query.category && ogun.category !== query.category) return false;
    if (query.element && ogun.element !== query.element) return false;
    if (query.osain && ogun.osain !== query.osain) return false;
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      const matchesSearch = 
        ogun.name.toLowerCase().includes(searchLower) ||
        ogun.description.toLowerCase().includes(searchLower) ||
        ogun.symbols.some(s => s.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    return true;
  });
}

function getCategories(): { category: OgunCategory; count: number }[] {
  const categories = ['iron', 'fire', 'war', 'craft', 'protection', 'paths'] as const;
  return categories.map(category => ({
    category,
    count: ogunData.filter(o => o.category === category).length
  }));
}

function getElements(): { element: OgunElement; count: number }[] {
  const elements = ['fire', 'iron', 'earth', 'air'] as const;
  return elements.map(element => ({
    element,
    count: ogunData.filter(o => o.element === element).length
  }));
}

function getOsainSigns(): { osain: OgunOsain; count: number }[] {
  const osainSigns = ['ogbe', 'oyeku', 'iwori', 'odi', 'osi', 'oba', 'ogun', 'rosun', 'fe', 'ejia', 'ka', 'she', 'jeshue', 'opele', 'yeka'] as const;
  return osainSigns.map(osain => ({
    osain,
    count: ogunData.filter(o => o.osain === osain).length
  })).filter(item => item.count > 0);
}

function getMetadata(): OgunMetadata {
  return {
    total: ogunData.length,
    categories: getCategories(),
    elements: getElements(),
    osainSigns: getOsainSigns()
  };
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/ogun/data
 * Retrieve Ogun data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query: OgunQuery = {
      category: searchParams.get('category') as OgunCategory | null ?? undefined,
      element: searchParams.get('element') as OgunElement | null ?? undefined,
      osain: searchParams.get('osain') as OgunOsain | null ?? undefined,
      search: searchParams.get('search') ?? undefined
    };

    // Check if requesting specific path by ID
    const id = searchParams.get('id');
    if (id) {
      const ogun = getOgunById(id);
      if (!ogun) {
        return NextResponse.json(
          { error: 'Ogun path not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: ogun });
    }

    // Check if requesting metadata
    const meta = searchParams.get('meta');
    if (meta === 'true') {
      return NextResponse.json({ data: getMetadata() });
    }

    // Check if requesting categories only
    const categories = searchParams.get('categories');
    if (categories === 'true') {
      return NextResponse.json({ data: getCategories() });
    }

    // Check if requesting elements only
    const elements = searchParams.get('elements');
    if (elements === 'true') {
      return NextResponse.json({ data: getElements() });
    }

    // Filter by query parameters
    if (query.category || query.element || query.osain || query.search) {
      const filtered = filterOguns(query);
      return NextResponse.json({ 
        data: filtered,
        total: filtered.length,
        query 
      });
    }

    // Return all Ogun data
    return NextResponse.json({ 
      data: getAllOguns(),
      total: ogunData.length,
      metadata: getMetadata()
    });

  } catch (error) {
    console.error('Ogun API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}