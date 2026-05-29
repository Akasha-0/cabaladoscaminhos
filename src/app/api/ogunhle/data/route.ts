// src/app/api/ogunhle/data/route.ts
// Ogunhle API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OgunhleLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OgunhleQuery {
  level?: OgunhleLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Ogunhle {
  id: string;
  name: string;
  level: OgunhleLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OGUNHLE DATA
// ============================================================

const ogunhleData: Ogunhle[] = [
  {
    id: 'ogunhle-001',
    name: 'Ogunhle Primordial',
    level: 'initiate',
    description: 'A essência original de Ogunhle, guardião das ferramentas e do conhecimento metálico ancestral.',
    practices: ['saberes-basicos', 'introducao-ferramentas'],
    symbol: '🛠️',
    element: 'ferro-ancestral'
  },
  {
    id: 'ogunhle-002',
    name: 'Ogunhle das Encomendas',
    level: 'practitioner',
    description: 'Protetor das promessas e acordos, garantindo que palavras dadas sejam cumpridas.',
    practices: ['compromisso-sagrado', 'fe-palavra'],
    symbol: '🤝',
    element: 'pacto'
  },
  {
    id: 'ogunhle-003',
    name: 'Ogunhle dos Pactos',
    level: 'adept',
    description: 'Mestre dos contratos e tratados, velando pelo equilíbrio entre partes.',
    practices: ['negociacao-sagrada', 'alianca-poder'],
    symbol: '📜',
    element: 'acordo'
  },
  {
    id: 'ogunhle-004',
    name: 'Ogunhle Supremo',
    level: 'master',
    description: 'Domínio completo sobre Metal, Pactos e Promise, transcendendo os limites do mundo físico.',
    practices: ['metal-cosmico', 'transcendencia-pacto'],
    symbol: '✨',
    element: 'transcendencia'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOgunhle(): Ogunhle[] {
  return ogunhleData;
}

function getOgunhleById(id: string): Ogunhle | undefined {
  return ogunhleData.find(o => o.id === id);
}

function filterOgunhle(query: OgunhleQuery): Ogunhle[] {
  let results = [...ogunhleData];

  if (query.level) {
    results = results.filter(o => o.level === query.level);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(o =>
      o.name.toLowerCase().includes(searchLower) ||
      o.description.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: OgunhleLevel; count: number }[] {
  const levels: OgunhleLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: ogunhleData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/ogunhle/data
 * Retrieve ogunhle data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OgunhleQuery = {
      level: searchParams.get('level') as OgunhleLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const ogunhle = getOgunhleById(id);
      if (!ogunhle) {
        return NextResponse.json(
          { error: 'Ogunhle not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: ogunhle });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOgunhle(query);
    const page = query.page || 1;
    const limit = query.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedResults = filtered.slice(start, end);

    return NextResponse.json({
      data: paginatedResults,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}