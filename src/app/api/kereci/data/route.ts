// src/app/api/kereci/data/route.ts
// Kereci API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type KereciLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface KereciQuery {
  level?: KereciLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Kereci {
  id: string;
  name: string;
  level: KereciLevel;
  description: string;
  practices: string[];
}

// ============================================================
// KERECI DATA
// ============================================================

const kereciData: Kereci[] = [
  {
    id: 'kereci-001',
    name: 'Foundation of Kereci',
    level: 'initiate',
    description: 'The foundational teachings of the Kereci tradition, introducing core concepts and beginning practices.',
    practices: ['breathing', 'centering', 'basic meditation']
  },
  {
    id: 'kereci-002',
    name: 'Sacred Elements',
    level: 'practitioner',
    description: 'Study of the five sacred elements and their integration within Kereci practice.',
    practices: ['elemental meditation', 'energy channeling', 'sacred geometry']
  },
  {
    id: 'kereci-003',
    name: 'Path of Illumination',
    level: 'adept',
    description: 'Advanced teachings focusing on inner illumination and awakening the light body.',
    practices: ['light meditation', 'energy weaving', 'consciousness expansion']
  },
  {
    id: 'kereci-004',
    name: 'Master Integration',
    level: 'master',
    description: 'Complete mastery of Kereci principles, integrating all aspects into unified practice.',
    practices: ['complete integration', 'teaching methods', 'advanced transmission']
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllKereci(): Kereci[] {
  return kereciData;
}

function getKereciById(id: string): Kereci | undefined {
  return kereciData.find(k => k.id === id);
}

function filterKereci(query: KereciQuery): Kereci[] {
  let results = [...kereciData];

  if (query.level) {
    results = results.filter(k => k.level === query.level);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(k =>
      k.name.toLowerCase().includes(searchLower) ||
      k.description.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: KereciLevel; count: number }[] {
  const counts: Record<KereciLevel, number> = {
    initiate: 0,
    practitioner: 0,
    adept: 0,
    master: 0
  };

  kereciData.forEach(k => {
    counts[k.level]++;
  });

  return Object.entries(counts).map(([level, count]) => ({
    level: level as KereciLevel,
    count
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/kereci/data
 * Retrieve kereci data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: KereciQuery = {
      level: searchParams.get('level') as KereciLevel | undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const kereci = getKereciById(id);
      if (!kereci) {
        return NextResponse.json(
          { error: 'Kereci not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: kereci });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Filter and paginate results
    const filtered = filterKereci(query);
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