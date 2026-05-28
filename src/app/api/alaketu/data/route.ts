// ============================================================
// ALAKETU DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Alaketu spiritual data
// - Alaketu orixá wisdom and practices
// - Sacred traditions and devotion
// - Protection and spiritual cleansing practices
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const alaketuData: any = {};

// ============================================================
// TYPES
// ============================================================

export interface AlaketuPractice {
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

export interface AlaketuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// ============================================================
// ALAKETU DATA
// ============================================================

const ALAKETU_CATEGORIES: AlaketuCategory[] = [
  {
    id: 'protecao',
    name: 'Proteção',
    description: 'Práticas de proteção espiritual e limpeza energética',
    icon: 'shield',
  },
  {
    id: 'ritual',
    name: 'Ritual',
    description: 'Rituais sagrados de limpeza e开门',
    icon: 'flame',
  },
  {
    id: 'oferenda',
    name: 'Oferenda',
    description: 'Oferendas e devoções aos orixás',
    icon: 'gift',
  },
];

const ALAKETU_PRACTICES: AlaketuPractice[] = [
  {
    id: 'limpeza-energetica',
    name: 'Limpeza Energética',
    description: 'Prática de limpeza das energias negativas e proteção espiritual',
    category: 'protecao',
    difficulty: 'iniciante',
    elements: ['fogo', 'água', 'terra'],
    orixas: ['alaketu', 'oxossi'],
    practices: ['ritual', 'oração', 'defumação'],
  },
  {
    id: 'defumacao-sagrada',
    name: 'Defumação Sagrada',
    description: 'Ritual de defumação com ervas sagradas para proteção e开门',
    category: 'ritual',
    difficulty: 'intermediario',
    elements: ['fogo', 'ar', 'plantas'],
    orixas: ['alaketu'],
    practices: ['defumar', 'rezar', 'mentalizar'],
    warnings: ['Não realizar durante a gravidez sem orientação'],
  },
  {
    id: 'banho-de-protecao',
    name: 'Banho de Proteção',
    description: 'Banho ritual para proteção e limpeza energética',
    category: 'ritual',
    difficulty: 'iniciante',
    elements: ['água', 'plantas', 'terra'],
    orixas: ['alaketu', 'oxum'],
    practices: ['banho', 'oração', 'intenção'],
  },
  {
    id: 'vela-da-protecao',
    name: 'Vela da Proteção',
    description: 'Acender vela em devoção para proteção espiritual',
    category: 'protecao',
    difficulty: 'iniciante',
    elements: ['fogo', 'luz'],
    orixas: ['alaketu'],
    practices: ['ritual', 'oração', 'gratidão'],
  },
  {
    id: 'agua-sagrada',
    name: 'Água Sagrada',
    description: 'Preparação de água sagrada para limpeza e开门',
    category: 'ritual',
    difficulty: 'iniciante',
    elements: ['água', 'luz'],
    orixas: ['alaketu', 'oxum'],
    practices: ['ritual', 'oração', 'consagração'],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPracticeById(id: string): AlaketuPractice | undefined {
  return ALAKETU_PRACTICES.find((p) => p.id === id.toLowerCase());
}

function getPracticesByElement(element: string): AlaketuPractice[] {
  return ALAKETU_PRACTICES.filter((p) => p.elements.includes(element.toLowerCase()));
}

function getPracticesByCategory(categoryId: string): AlaketuPractice[] {
  return ALAKETU_PRACTICES.filter((p) => p.category.toLowerCase() === categoryId.toLowerCase());
}

function getPracticesByDifficulty(difficulty: string): AlaketuPractice[] {
  return ALAKETU_PRACTICES.filter((p) => p.difficulty === difficulty.toLowerCase());
}

function getPracticesByOrixa(orixa: string): AlaketuPractice[] {
  return ALAKETU_PRACTICES.filter((p) => p.orixas.some((o) => o.toLowerCase() === orixa.toLowerCase()));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/alaketu/data
 * Retrieve Alaketu data with optional filtering
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
        category: ALAKETU_CATEGORIES.find((c) => c.id.toLowerCase() === category.toLowerCase()) || { id: category },
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
      data: ALAKETU_CATEGORIES,
    });
  }

  if (type === 'practices') {
    return NextResponse.json({
      data: ALAKETU_PRACTICES,
    });
  }

  // Default: return summary with categories and practices count
  return NextResponse.json({
    data: {
      categories: ALAKETU_CATEGORIES,
      practices: ALAKETU_PRACTICES,
      summary: {
        totalCategories: ALAKETU_CATEGORIES.length,
        totalPractices: ALAKETU_PRACTICES.length,
        byDifficulty: {
          iniciante: ALAKETU_PRACTICES.filter((p) => p.difficulty === 'iniciante').length,
          intermediario: ALAKETU_PRACTICES.filter((p) => p.difficulty === 'intermediario').length,
          avancado: ALAKETU_PRACTICES.filter((p) => p.difficulty === 'avancado').length,
          mestre: ALAKETU_PRACTICES.filter((p) => p.difficulty === 'mestre').length,
        },
      },
    },
  });
}