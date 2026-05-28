// src/app/api/io/data/route.ts
// Io API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type IoLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface IoQuery {
  level?: IoLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Io {
  id: string;
  name: string;
  level: IoLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// IO DATA
// ============================================================

const ioData: Io[] = [
  {
    id: 'io-001',
    name: 'Primeiro Io',
    level: 'initiate',
    description: 'A essência primordial de Io, representando a claridade mental e percepção elevada.',
    practices: ['claridade-interior', 'percepcao-elevada'],
    symbol: '🌟',
    element: 'luz'
  },
  {
    id: 'io-002',
    name: 'Io das Profundezas',
    level: 'practitioner',
    description: 'Guardião dos conhecimentos ocultos e mestre das artes contemplativas.',
    practices: ['sabedoria-profuncunda', 'arte-contemplativa'],
    symbol: '🔮',
    element: 'sabedoria'
  },
  {
    id: 'io-003',
    name: 'Io Protetor',
    level: 'adept',
    description: 'Shield against negative energies and guide through spiritual darkness.',
    practices: ['protecao-espiritual', 'guia-na-escuridao'],
    symbol: '🛡️',
    element: 'protecao'
  },
  {
    id: 'io-004',
    name: 'Io Supremo',
    level: 'master',
    description: 'Mestria completa da illuminação interior, transcendendo todos os obstáculos.',
    practices: ['illuminacao-total', 'transcendencia-mxima'],
    symbol: '✨',
    element: 'transcendência'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllIo(): Io[] {
  return ioData;
}

function getIoById(id: string): Io | undefined {
  return ioData.find(i => i.id === id);
}

function filterIo(query: IoQuery): Io[] {
  let results = [...ioData];

  if (query.level) {
    results = results.filter(i => i.level === query.level);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(i =>
      i.name.toLowerCase().includes(searchLower) ||
      i.description.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: IoLevel; count: number }[] {
  const levels: IoLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: ioData.filter(i => i.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/io/data
 * Retrieve io data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: IoQuery = {
      level: searchParams.get('level') as IoLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const io = getIoById(id);
      if (!io) {
        return NextResponse.json(
          { error: 'Io not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: io });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterIo(query);
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

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
