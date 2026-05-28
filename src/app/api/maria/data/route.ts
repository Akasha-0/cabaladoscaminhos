// ============================================================
// MARIA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Maria spiritual data
// - Maria orixá wisdom and practices
// - Sacred feminine traditions
// - Devotion and prayer practices
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mariaData: any = {};

// ============================================================
// TYPES
// ============================================================

export interface MariaPractice {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  elements: string[];
  orixas: string[];
  practices: string[];
  warnings?: string[];
}

export interface MariaCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// ============================================================
// MARIA DATA
// ============================================================

const MARIA_CATEGORIES: MariaCategory[] = [
  {
    id: 'devotion',
    name: 'Devoção',
    description: 'Práticas de devoção e entrega à energia sagrada feminina',
    icon: 'heart',
  },
  {
    id: 'oracao',
    name: 'Oração',
    description: 'Orações sagradas para conexão espiritual',
    icon: 'pray',
  },
  {
    id: 'ritual',
    name: 'Ritual',
    description: 'Rituais de proteção e elevação espiritual',
    icon: 'flame',
  },
];

const MARIA_PRACTICES: MariaPractice[] = [
  {
    id: 'sagrado-feminino',
    name: 'Sagrado Feminino',
    description: 'Conexão com a energia sagrada feminina através de práticas devocionais',
    category: 'devotion',
    difficulty: 'iniciante',
    elements: ['água', 'terra', 'fogo', 'ar', 'éter'],
    orixas: ['iemoja', 'oxum', 'nanã'],
    practices: ['meditação', 'visualização', 'rezar', 'contemplar'],
  },
  {
    id: 'prece-da-luz',
    name: 'Prece da Luz',
    description: 'Oração para iluminação interior e proteção espiritual',
    category: 'oracao',
    difficulty: 'iniciante',
    elements: ['luz', 'fogo'],
    orixas: ['iemoja'],
    practices: ['rezar', 'cantar', 'meditar'],
  },
  {
    id: 'banho-sagrado',
    name: 'Banho Sagrado',
    description: 'Ritual de limpeza energética com ervas e águas sagradas',
    category: 'ritual',
    difficulty: 'intermediario',
    elements: ['água', 'terra', 'plantas'],
    orixas: ['oxum', 'nanã', 'iemoja'],
    practices: ['ritual', 'oração', 'oferenda'],
    warnings: ['Não utilizar em dias de jejum sem orientação'],
  },
  {
    id: 'vela-da-devocao',
    name: 'Vela da Devoção',
    description: 'Acender vela em devoção para fortalecer conexão espiritual',
    category: 'ritual',
    difficulty: 'iniciante',
    elements: ['fogo', 'luz'],
    orixas: ['iemoja', 'oxum'],
    practices: ['ritual', 'oração', 'gratidão'],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPracticeById(id: string): MariaPractice | undefined {
  return MARIA_PRACTICES.find((p) => p.id === id.toLowerCase());
}

function getPracticesByElement(element: string): MariaPractice[] {
  return MARIA_PRACTICES.filter((p) => p.elements.includes(element.toLowerCase()));
}

function getPracticesByCategory(categoryId: string): MariaPractice[] {
  return MARIA_PRACTICES.filter((p) => p.category.toLowerCase() === categoryId.toLowerCase());
}

function getPracticesByDifficulty(difficulty: string): MariaPractice[] {
  return MARIA_PRACTICES.filter((p) => p.difficulty === difficulty.toLowerCase());
}

function getPracticesByOrixa(orixa: string): MariaPractice[] {
  return MARIA_PRACTICES.filter((p) => p.orixas.some((o) => o.toLowerCase() === orixa.toLowerCase()));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/maria/data
 * Retrieve Maria data with optional filtering
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'summary';
  const category = url.searchParams.get('category');
  const difficulty = url.searchParams.get('difficulty');
  const element = url.searchParams.get('element');
  const orixa = url.searchParams.get('orixa');
  const id = url.searchParams.get('id');

  // If requesting a specific practice by ID
  if (id) {
    const practice = getPracticeById(id);
    if (!practice) {
      return NextResponse.json(
        { error: 'Practice not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: practice });
  }

  // Filter by category
  if (category) {
    const practices = getPracticesByCategory(category);
    return NextResponse.json({
      data: {
        category: MARIA_CATEGORIES.find((c) => c.id.toLowerCase() === category.toLowerCase()) || { id: category },
        practices,
      },
    });
  }

  // Filter by difficulty
  if (difficulty) {
    const practices = getPracticesByDifficulty(difficulty);
    return NextResponse.json({ data: practices });
  }

  // Filter by element
  if (element) {
    const practices = getPracticesByElement(element);
    return NextResponse.json({ data: practices });
  }

  // Filter by orixá
  if (orixa) {
    const practices = getPracticesByOrixa(orixa);
    return NextResponse.json({ data: practices });
  }

  // Return based on type parameter
  if (type === 'categories') {
    return NextResponse.json({
      data: MARIA_CATEGORIES,
    });
  }

  if (type === 'practices') {
    return NextResponse.json({
      data: MARIA_PRACTICES,
    });
  }

  // Default: return summary with categories and practices count
  return NextResponse.json({
    data: {
      categories: MARIA_CATEGORIES,
      practices: MARIA_PRACTICES,
      summary: {
        totalCategories: MARIA_CATEGORIES.length,
        totalPractices: MARIA_PRACTICES.length,
        byDifficulty: {
          iniciante: MARIA_PRACTICES.filter((p) => p.difficulty === 'iniciante').length,
          intermediario: MARIA_PRACTICES.filter((p) => p.difficulty === 'intermediario').length,
          avancado: MARIA_PRACTICES.filter((p) => p.difficulty === 'avancado').length,
          mestre: MARIA_PRACTICES.filter((p) => p.difficulty === 'mestre').length,
        },
      },
    },
  });
}