// src/app/api/rogga/data/route.ts
// Rogga API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type RoggaLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface RoggaQuery {
  level?: RoggaLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Rogga {
  id: string;
  name: string;
  level: RoggaLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// ROGGA DATA
// ============================================================

const rogGaData: Rogga[] = [
  {
    id: 'rogga-001',
    name: 'Primeiro Rogga',
    level: 'initiate',
    description: 'A essência primordial de Rogga, representando a transformação e o trabalho secreto.',
    practices: ['transformacao-inicial', 'trabalho-oculto'],
    symbol: '🔥',
    element: 'fogo'
  },
  {
    id: 'rogga-002',
    name: 'Rogga das Profundezas',
    level: 'practitioner',
    description: 'Conexão profunda com a sabedoria das profundezas, trabalhando através das sombras.',
    practices: ['profundezas-sagradas', 'trabalho-noturno'],
    symbol: '🌑',
    element: 'subterraneo'
  },
  {
    id: 'rogga-003',
    name: 'Rogga das Cinzas',
    level: 'adept',
    description: 'Mestria sobre as cinzas sagradas, renovando através da destruição criativa.',
    practices: ['cinzas-sagradas', 'renovacao-destrutiva'],
    symbol: '⚡',
    element: 'regeneracao'
  },
  {
    id: 'rogga-004',
    name: 'Rogga Supremo',
    level: 'master',
    description: 'Unificação com todas as formas de trabalho oculto, transcendentando a transformação.',
    practices: ['uniao-oculta', 'metabolismo-vivo'],
    symbol: '🌀',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllRogga(): Rogga[] {
  return rogGaData;
}

function getRoggaById(id: string): Rogga | undefined {
  return rogGaData.find(o => o.id === id);
}

function filterRogga(query: RoggaQuery): Rogga[] {
  let results = [...rogGaData];

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

function getLevels(): { level: RoggaLevel; count: number }[] {
  const levels: RoggaLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: rogGaData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/rogga/data
 * Retrieve rogGA data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: RoggaQuery = {
      level: searchParams.get('level') as RoggaLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const rogGa = getRoggaById(id);
      if (!rogGa) {
        return NextResponse.json(
          { error: 'Rogga not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: rogGa });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterRogga(query);
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
