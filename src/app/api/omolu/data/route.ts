// src/app/api/omolu/data/route.ts
// Omolu API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OmoluLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OmoluQuery {
  level?: OmoluLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Omolu {
  id: string;
  name: string;
  level: OmoluLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OMOLU DATA
// ============================================================

const omoluData: Omolu[] = [
  {
    id: 'omolu-001',
    name: 'Omolu das Raízes',
    level: 'initiate',
    description: 'A essência primordial de Omolu, representando a terra e os segredos enterrados.',
    practices: ['meditacao-terra', 'ancestralidade-basica'],
    symbol: '🌱',
    element: 'terra'
  },
  {
    id: 'omolu-002',
    name: 'Omolu das Cicatrizes',
    level: 'practitioner',
    description: 'Transformação através da dor e regeneração, mestre das feridas curadas.',
    practices: ['cura-interna', 'reconstrucao-do-ser'],
    symbol: '🩹',
    element: 'regeneracao'
  },
  {
    id: 'omolu-003',
    name: 'Omolu das Sombras',
    level: 'adept',
    description: 'Governante do invisível, conhecedor de tudo que está enterrado e revelado.',
    practices: ['visao-interna', 'penetracao-dos-misterios'],
    symbol: '👁️',
    element: 'sombra'
  },
  {
    id: 'omolu-004',
    name: 'Omolu Supremo',
    level: 'master',
    description: 'Mestria completa sobre vida, morte e renascimento, senhor do ciclo sem fim.',
    practices: ['transmutacao-total', 'uniao-com-o-ciclo'],
    symbol: '♾️',
    element: 'ciclo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOmolu(): Omolu[] {
  return omoluData;
}

function getOmoluById(id: string): Omolu | undefined {
  return omoluData.find(o => o.id === id);
}

function filterOmolu(query: OmoluQuery): Omolu[] {
  let results = [...omoluData];

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

function getLevels(): { level: OmoluLevel; count: number }[] {
  const levels: OmoluLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: omoluData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/omolu/data
 * Retrieve omolu data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OmoluQuery = {
      level: searchParams.get('level') as OmoluLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const omolu = getOmoluById(id);
      if (!omolu) {
        return NextResponse.json(
          { error: 'Omolu not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: omolu });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOmolu(query);
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
