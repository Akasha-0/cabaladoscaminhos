// src/app/api/ogum/data/route.ts
// Ogum API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OgumLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OgumQuery {
  level?: OgumLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Ogum {
  id: string;
  name: string;
  level: OgumLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OGUM DATA
// ============================================================

const ogumData: Ogum[] = [
  {
    id: 'ogum-001',
    name: 'Ogum primitivo',
    level: 'initiate',
    description: 'A essência primordial de Ogum, representando o ferro inicialmente forjado e a força bruta da natureza.',
    practices: ['saberes-basicos', 'introducao-a-ferro'],
    symbol: '⚔️',
    element: 'ferro-bruto'
  },
  {
    id: 'ogum-002',
    name: 'Ogum das Estradas',
    level: 'practitioner',
    description: 'Guardião dos caminhos e viajantes, abrindo trilhas e vencendo obstáculos.',
    practices: ['caminhar-destino', 'abrir-roads'],
    symbol: '🛤️',
    element: 'estrada'
  },
  {
    id: 'ogum-003',
    name: 'Ogum das Guerras',
    level: 'adept',
    description: 'Mestre das batalhas e conflitos, conquistando territórios e derrotando inimigos.',
    practices: ['estrategia-guerra', 'conquista-vitoria'],
    symbol: '⚔️',
    element: 'combate'
  },
  {
    id: 'ogum-004',
    name: 'Ogum Supremo',
    level: 'master',
    description: 'Mestria completa sobre todo conhecimento tecnológico e metálico, transcendendo os limites da matéria.',
    practices: ['tecnologia-cosmica', 'transformacao-ferro'],
    symbol: '🔧',
    element: 'tecnologia'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOgum(): Ogum[] {
  return ogumData;
}

function getOgumById(id: string): Ogum | undefined {
  return ogumData.find(o => o.id === id);
}

function filterOgum(query: OgumQuery): Ogum[] {
  let results = [...ogumData];

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

function getLevels(): { level: OgumLevel; count: number }[] {
  const levels: OgumLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: ogumData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/ogum/data
 * Retrieve ogum data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OgumQuery = {
      level: searchParams.get('level') as OgumLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const ogum = getOgumById(id);
      if (!ogum) {
        return NextResponse.json(
          { error: 'Ogum not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: ogum });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOgum(query);
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