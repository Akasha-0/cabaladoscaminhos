// src/app/api/loguned/data/route.ts
// Loguned API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type LogunedLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface LogunedQuery {
  level?: LogunedLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Loguned {
  id: string;
  name: string;
  level: LogunedLevel;
  description: string;
  attributes: string[];
  symbols: string[];
  days: string[];
  offerings: string[];
  prayers: string[];
  practices: string[];
  element: string;
}

// ============================================================
// LOGUNED DATA
// ============================================================

const logunedData: Loguned[] = [
  {
    id: 'loguned-001',
    name: 'Loguned',
    level: 'initiate',
    description: 'Loguned é um Orixá que representa a intelectualidade, a comunicação e a sabedoria. É filho de Oxumambi e Obaluayé, conhecido como o patrono dos iyawós e dos iniciados.',
    attributes: [
      'Inteligência',
      'Sabedoria',
      'Comunicação',
      'Oração',
      'Proteção espiritual',
      'Conhecimento ancestral'
    ],
    symbols: [
      'Lança de ferro',
      'Escudo',
      'Adaga cerimonial',
      'Fio de contas azuis e brancas',
      'Ervas sagradas'
    ],
    days: [
      'Segunda-feira',
      'Dias de orações específicas'
    ],
    offerings: [
      'Milho torrado',
      'Amendoim',
      'Mel',
      'Água de obi',
      'Folhas verdes'
    ],
    prayers: [
      'Orokum Logunedê',
      'Logunedê me dá ouvidos',
      'Prece para proteção intelectual'
    ],
    practices: ['oracao', 'meditacao', 'estudo-sagrado'],
    element: 'intelecto'
  },
  {
    id: 'loguned-002',
    name: 'Loguned das Preces',
    level: 'practitioner',
    description: 'Domínio das preces e orações específicas para proteção intelectual e comunicação espiritual.',
    attributes: [
      'Comunicação sagrada',
      'Intercessão',
      'Proteção mental',
      'Clareza de pensamento'
    ],
    symbols: [
      'Rosário cerimonial',
      'Lança pequena',
      'Contas azuis'
    ],
    days: [
      'Segunda-feira',
      'Dias de obrigação'
    ],
    offerings: [
      'Milho torrado',
      'Amendoim torrado',
      'Mel'
    ],
    prayers: [
      'Orokum Logunedê',
      'Logunedê/protetor'
    ],
    practices: ['preces-diarias', 'evocacao'],
    element: 'som'
  },
  {
    id: 'loguned-003',
    name: 'Loguned Ancestral',
    level: 'adept',
    description: 'Conexão profunda com o conhecimento ancestral e a sabedoria dos antepassados.',
    attributes: [
      'Conhecimento ancestral',
      'Sabedoria tradicional',
      'Guarda dos segredos',
      'Transmissão de conhecimento'
    ],
    symbols: [
      'Livro ancestral',
      'Tabuinha de Ifá',
      'Fio de contas especial'
    ],
    days: [
      'Segunda-feira',
      'Sexta-feira',
      'Dias de Ifá'
    ],
    offerings: [
      'Eru',
      'Obi',
      'Akара',
      'Milho'
    ],
    prayers: [
      'Preces de Ifá',
      'Invocação ancestral'
    ],
    practices: ['ritual-ancestral', 'transmissao-sabedoria'],
    element: 'sabedoria'
  },
  {
    id: 'loguned-004',
    name: 'Loguned Supremo',
    level: 'master',
    description: 'Mestria completa sobre todos os aspectos de Loguned, unificando intelectualidade, comunicação e sabedoria espiritual.',
    attributes: [
      'Mestria intelectual',
      'Comunicação divina',
      'Sabedoria ilimitada',
      'Proteção absoluta',
      'Guia espiritual'
    ],
    symbols: [
      'Lança cerimonial',
      'Escudo de Oxumambi',
      'Adaga de Obaluayé',
      'Fio de contas completo'
    ],
    days: [
      'Segunda-feira',
      'Dias especiais de obrigação'
    ],
    offerings: [
      'Milho torrado',
      'Amendoim',
      'Mel',
      'Eru',
      'Obi',
      'Akара'
    ],
    prayers: [
      'Orokum Logunedê completo',
      'Todas as preces ancestrais'
    ],
    practices: ['ritual-completo', 'iniciacao-loguned'],
    element: 'cosmo'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllLoguned(): Loguned[] {
  return logunedData;
}

function getLogunedById(id: string): Loguned | undefined {
  return logunedData.find(l => l.id === id);
}

function filterLoguned(query: LogunedQuery): Loguned[] {
  let results = [...logunedData];

  if (query.level) {
    results = results.filter(l => l.level === query.level);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(l =>
      l.name.toLowerCase().includes(searchLower) ||
      l.description.toLowerCase().includes(searchLower) ||
      l.attributes.some(a => a.toLowerCase().includes(searchLower))
    );
  }

  return results;
}

function getLevels(): { level: LogunedLevel; count: number }[] {
  const levels: LogunedLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: logunedData.filter(l => l.level === level).length
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/loguned/data
 * Retrieve loguned data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: LogunedQuery = {
      level: searchParams.get('level') as LogunedLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const loguned = getLogunedById(id);
      if (!loguned) {
        return NextResponse.json(
          { error: 'Loguned not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: loguned });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterLoguned(query);
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