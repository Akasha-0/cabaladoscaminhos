// src/app/api/oba/data/route.ts
// Oba API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type ObaLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface ObaQuery {
  level?: ObaLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Oba {
  id: string;
  name: string;
  level: ObaLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OBA DATA
// ============================================================

const obaData: Oba[] = [
  {
    id: 'oba-001',
    name: 'Primeiro Oba',
    level: 'initiate',
    description: 'A essência primordial de Oba, representando a força guerreira e a justiça divina.',
    practices: ['meditacao-fogo', 'afirmacoes-de-poder'],
    symbol: '🔥',
    element: 'fogo'
  },
  {
    id: 'oba-002',
    name: 'Oba das Lâminas',
    level: 'practitioner',
    description: 'Corte preciso de demandas e inimigos ocultos, governante das espadas espirituais.',
    practices: ['corte-de-mal', 'firmeza-guerreira'],
    symbol: '⚔️',
    element: 'aco'
  },
  {
    id: 'oba-003',
    name: 'Oba Senhora da Guerra',
    level: 'adept',
    description: 'Soberania sobre os campos de batalha espirituais, protetora contra feitiçarias.',
    practices: ['coragem-absoluta', 'protecao-arcana'],
    symbol: '🛡️',
    element: 'protecao'
  },
  {
    id: 'oba-004',
    name: 'Oba Suprema',
    level: 'master',
    description: 'Mestria completa sobre todos os poderes guerreiros de Oba, conquistadora dos obstáculos.',
    practices: ['vitoria-total', 'transcendencia-guerreira'],
    symbol: '👑',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOba(): Oba[] {
  return obaData;
}

function getObaById(id: string): Oba | undefined {
  return obaData.find(o => o.id === id);
}

function filterOba(query: ObaQuery): Oba[] {
  let results = [...obaData];

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

function getLevels(): { level: ObaLevel; count: number }[] {
  const levels: ObaLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: obaData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oba/data
 * Retrieve oba data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: ObaQuery = {
      level: searchParams.get('level') as ObaLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const oba = getObaById(id);
      if (!oba) {
        return NextResponse.json(
          { error: 'Oba not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: oba });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOba(query);
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