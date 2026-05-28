// src/app/api/oloxum/data/route.ts
// Oloxum API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OloxumLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OloxumQuery {
  level?: OloxumLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Oloxum {
  id: string;
  name: string;
  level: OloxumLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OLOXUM DATA
// ============================================================

const oloxumData: Oloxum[] = [
  {
    id: 'oloxum-001',
    name: 'Oloxum Primordial',
    level: 'initiate',
    description: 'A essência inicial de Oloxum, o uno que precede a dualidade e dá origem aos caminhos.',
    practices: ['unidade-primordial', 'vazio-sagrado'],
    symbol: '○',
    element: 'vazio'
  },
  {
    id: 'oloxum-002',
    name: 'Oloxum Dual',
    level: 'practitioner',
    description: 'A manifestação de Oloxum como拆分 e reunificação, representando os dois caminhos da cabala.',
    practices: ['divisao-sagrada', 'reuniao-dos-caminhos'],
    symbol: '◐',
    element: 'dualidade'
  },
  {
    id: 'oloxum-003',
    name: 'Oloxum Triplo',
    level: 'adept',
    description: 'Oloxum em sua forma trina,harmonizando mente, corpo e espírito através dos caminhos.',
    practices: ['trinidade-interna', 'equilibrio-triplo'],
    symbol: '△',
    element: 'trinidade'
  },
  {
    id: 'oloxum-004',
    name: 'Oloxum Supremo',
    level: 'master',
    description: 'A completa integração de Oloxum, onde todos os caminhos convergem na unidade transcendental.',
    practices: ['uniao-cosmica', 'transcendência-dos-caminhos'],
    symbol: '☆',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOloxum(): Oloxum[] {
  return oloxumData;
}

function getOloxumById(id: string): Oloxum | undefined {
  return oloxumData.find(o => o.id === id);
}

function filterOloxum(query: OloxumQuery): Oloxum[] {
  let results = [...oloxumData];

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

function getLevels(): { level: OloxumLevel; count: number }[] {
  const levels: OloxumLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: oloxumData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oloxum/data
 * Retrieve oloxum data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OloxumQuery = {
      level: searchParams.get('level') as OloxumLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const oloxum = getOloxumById(id);
      if (!oloxum) {
        return NextResponse.json(
          { error: 'Oloxum not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: oloxum });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOloxum(query);
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
