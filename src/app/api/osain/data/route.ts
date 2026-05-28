// src/app/api/osain/data/route.ts
// Osain API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OsainLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OsainQuery {
  level?: OsainLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Osain {
  id: string;
  name: string;
  level: OsainLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OSAIN DATA
// ============================================================

const osainData: Osain[] = [
  {
    id: 'osain-001',
    name: 'Primeiro Osain',
    level: 'initiate',
    description: 'A essência primordial de Osain, representando a cura e o reconhecimento das plantas medicinais.',
    practices: ['meditacao-verde', 'cura-natural'],
    symbol: '🌿',
    element: 'planta'
  },
  {
    id: 'osain-002',
    name: 'Osain das Raízes',
    level: 'practitioner',
    description: 'Conexão profunda com a sabedoria das raízes e ervas, curando através da terra.',
    practices: ['raizes-ancestrais', 'sabedoria-herbal'],
    symbol: '🌱',
    element: 'terra'
  },
  {
    id: 'osain-003',
    name: 'Osain das Folhas',
    level: 'adept',
    description: 'Mestria sobre as folhas sagradas, transmitindo conhecimento medicinal através da natureza.',
    practices: ['folhas-sagradas', 'transmissao-curativa'],
    symbol: '🍃',
    element: 'floresta'
  },
  {
    id: 'osain-004',
    name: 'Osain Supremo',
    level: 'master',
    description: 'Unificação com todas as formas de vida vegetal, transcendentando a cura natural.',
    practices: ['uniao-natureza', 'transformacao-viva'],
    symbol: '🌳',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOsain(): Osain[] {
  return osainData;
}

function getOsainById(id: string): Osain | undefined {
  return osainData.find(o => o.id === id);
}

function filterOsain(query: OsainQuery): Osain[] {
  let results = [...osainData];

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

function getLevels(): { level: OsainLevel; count: number }[] {
  const levels: OsainLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: osainData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/osain/data
 * Retrieve osain data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OsainQuery = {
      level: searchParams.get('level') as OsainLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const osain = getOsainById(id);
      if (!osain) {
        return NextResponse.json(
          { error: 'Osain not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: osain });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOsain(query);
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