// src/app/api/euya/data/route.ts
// Euyá API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type EuyáLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface EuyáQuery {
  level?: EuyáLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Euyá {
  id: string;
  name: string;
  level: EuyáLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// EUYÁ DATA
// ============================================================

const euyáData: Euyá[] = [
  {
    id: 'euya-001',
    name: 'Primeiro Euyá',
    level: 'initiate',
    description: 'A essência primordial de Euyá, representando o despertar espiritual e a conexão inicial.',
    practices: ['meditacao-espiritual', 'afirmações-de-proteção'],
    symbol: '🌅',
    element: 'aurora'
  },
  {
    id: 'euya-002',
    name: 'Euyá das Verdades',
    level: 'practitioner',
    description: 'Guardião das verdades ocultas e revelações, iluminando o caminho da sabedoria.',
    practices: ['ritual-de-verdade', 'desvendamento'],
    symbol: '🔮',
    element: 'cristal'
  },
  {
    id: 'euya-003',
    name: 'Euyá Arquive',
    level: 'adept',
    description: 'Mestre dos arquivos cósmicos e conhecimento ancestral, detentor de saberes eternos.',
    practices: ['acesso-arcanos', 'memória-cósmica'],
    symbol: '📜',
    element: 'sabedoria'
  },
  {
    id: 'euya-004',
    name: 'Euyá Supremo',
    level: 'master',
    description: 'Transcendência completa da consciência, fundindo-se com a inteligência universal.',
    practices: ['uniao-consciência', 'expansão-total'],
    symbol: '💫',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllEuyá(): Euyá[] {
  return euyáData;
}

function getEuyáById(id: string): Euyá | undefined {
  return euyáData.find(e => e.id === id);
}

function filterEuyá(query: EuyáQuery): Euyá[] {
  let results = [...euyáData];

  if (query.level) {
    results = results.filter(e => e.level === query.level);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(e =>
      e.name.toLowerCase().includes(searchLower) ||
      e.description.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: EuyáLevel; count: number }[] {
  const levels: EuyáLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: euyáData.filter(e => e.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/euyá/data
 * Retrieve euyá data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: EuyáQuery = {
      level: searchParams.get('level') as EuyáLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const euyá = getEuyáById(id);
      if (!euyá) {
        return NextResponse.json(
          { error: 'Euyá not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: euyá });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterEuyá(query);
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