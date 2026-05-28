// src/app/api/oxaquece/data/route.ts
// Oxaquece API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type OxaqueceLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface OxaqueceQuery {
  level?: OxaqueceLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Oxaquece {
  id: string;
  name: string;
  level: OxaqueceLevel;
  description: string;
  practices: string[];
  symbol: string;
  element: string;
}

// ============================================================
// OXAQUECE DATA
// ============================================================

const oxaqueceData: Oxaquece[] = [
  {
    id: 'oxaquece-001',
    name: 'Primeiro Oxaquece',
    level: 'initiate',
    description: 'A essência primordial de Oxaquece, representando a sabedoria ancestral e a conexão com os mistérios antigos.',
    practices: ['meditacao-sabedoria', 'afirmações-de-conhecimento'],
    symbol: '🔮',
    element: 'sabedoria'
  },
  {
    id: 'oxaquece-002',
    name: 'Oxaquece dos Segredos',
    level: 'practitioner',
    description: 'Guardião dos segredos ocultos, desbloqueando conhecimentos arcanos e mistérios do universo.',
    practices: ['revelacao-arcana', 'protecao-espiritual'],
    symbol: '🗝️',
    element: 'segredo'
  },
  {
    id: 'oxaquece-003',
    name: 'Oxaquece Sábio',
    level: 'adept',
    description: 'Mestre da sabedoria oculta, guia das mentes buscando iluminação e verdade interior.',
    practices: ['iluminacao-interior', 'discernimento'],
    symbol: '📿',
    element: 'conhecimento'
  },
  {
    id: 'oxaquece-004',
    name: 'Oxaquece Supremo',
    level: 'master',
    description: 'Mestria completa sobre os mistérios do universo, transcendendo o conhecimento terreno.',
    practices: ['uniao-cosmica', 'sabedoria-infinita'],
    symbol: '🌟',
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllOxaqeue(): Oxaquece[] {
  return oxaqueceData;
}

function getOxaqeueById(id: string): Oxaquece | undefined {
  return oxaqueceData.find(o => o.id === id);
}

function filterOxaqeue(query: OxaqueceQuery): Oxaquece[] {
  let results = [...oxaqueceData];

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

function getLevels(): { level: OxaqueceLevel; count: number }[] {
  const levels: OxaqueceLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: oxaqueceData.filter(o => o.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oxaquece/data
 * Retrieve oxaquece data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: OxaqueceQuery = {
      level: searchParams.get('level') as OxaqueceLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const oxaquece = getOxaqeueById(id);
      if (!oxaquece) {
        return NextResponse.json(
          { error: 'Oxaqeue not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: oxaquece });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterOxaqeue(query);
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