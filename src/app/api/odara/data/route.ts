// src/app/api/odara/data/route.ts
// Odara API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OdaraLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OdaraQuery {
  level?: OdaraLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Odara {
  id: string;
  name: string;
  level: OdaraLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// ODARA DATA
// ============================================================

const odaraData: Odara[] = [
  {
    id: 'odara-001',
    name: 'Primeira Odara',
    level: 'initiate',
    description: 'A essência primordial de Odara, representando a beleza interior e a harmonia natural.',
    practices: ['meditacao-beleza', 'afirmações-de-harmonia'],
    symbol: '🌸',
    element: 'harmonia'
  },
  {
    id: 'odara-002',
    name: 'Odara das Flores',
    level: 'practitioner',
    description: 'Floração contínua de energia estética e espiritual, conectando Schönheit e relationships.',
    practices: ['jardim-interior', 'beleza-compassiva'],
    symbol: '🌺',
    element: 'flores'
  },
  {
    id: 'odara-003',
    name: 'Odara Rainha',
    level: 'adept',
    description: 'Soberania sobre a percepção estética e a essência beautificada, governanta da graça terrenal.',
    practices: ['coroa-de-rosa', 'elegancia-sagrada'],
    symbol: '👸',
    element: 'reino'
  },
  {
    id: 'odara-004',
    name: 'Odara Suprema',
    level: 'master',
    description: 'Mestria completa sobre todas as expressões de Odara, transcendendo a manifestação bela.',
    practices: ['uniao-estetica', 'transformacao-beautiful'],
    symbol: '✨',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOdara(): Odara[] {
  return odaraData;
}

function getOdaraById(id: string): Odara | undefined {
  return odaraData.find(o => o.id === id);
}

function filterOdara(query: OdaraQuery): Odara[] {
  let results = [...odaraData];

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

function getLevels(): { level: OdaraLevel; count: number }[] {
  const levels: OdaraLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: odaraData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/odara/data
 * Retrieve odara data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OdaraQuery = {
      level: searchParams.get('level') as OdaraLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const odara = getOdaraById(id);
      if (!odara) {
        return NextResponse.json(
          { error: 'Odara not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: odara });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOdara(query);
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