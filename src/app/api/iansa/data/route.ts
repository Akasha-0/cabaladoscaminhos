// src/app/api/iansa/data/route.ts
// Iansã API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type IansaLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface IansaQuery {
  level?: IansaLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Iansa {
  id: string;
  name: string;
  level: IansaLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// IANSÃ DATA
// ============================================================

const iansaData: Iansa[] = [
  {
    id: 'iansa-001',
    name: 'Primeira Iansã',
    level: 'initiate',
    description: 'A essência primordial de Iansã, representando o vento e a liberdade inicial.',
    practices: ['meditacao-vento', 'afirmações-de-liberdade'],
    symbol: '🌬️',
    element: 'vento'
  },
  {
    id: 'iansa-002',
    name: 'Iansã das Tempestades',
    level: 'practitioner',
    description: 'Força das tempestades e transformação, governando os ventos e mudanças climáticas.',
    practices: ['tempestade-interior', 'transformacao-vento'],
    symbol: '🌀',
    element: 'tempestade'
  },
  {
    id: 'iansa-003',
    name: 'Iansã Rainha dos Ventos',
    level: 'adept',
    description: 'Soberania sobre os ventos e tempestades, senhor(a) das corrientes aéreas.',
    practices: ['coroa-de-vento', 'realeza-temporal'],
    symbol: '🌪️',
    element: 'ventos-reais'
  },
  {
    id: 'iansa-004',
    name: 'Iansã Suprema',
    level: 'master',
    description: 'Mestria completa sobre todas as correntes de Iansã, transcendendo os elementos atmosféricos.',
    practices: ['uniao-cosmica', 'controle-total'],
    symbol: '⚡',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllIansa(): Iansa[] {
  return iansaData;
}

function getIansaById(id: string): Iansa | undefined {
  return iansaData.find(i => i.id === id);
}

function filterIansa(query: IansaQuery): Iansa[] {
  let results = [...iansaData];

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

function getLevels(): { level: IansaLevel; count: number }[] {
  const levels: IansaLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: iansaData.filter(i => i.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/iansa/data
 * Retrieve iansã data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: IansaQuery = {
      level: searchParams.get('level') as IansaLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const iansa = getIansaById(id);
      if (!iansa) {
        return NextResponse.json(
          { error: 'Iansã not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: iansa });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterIansa(query);
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
