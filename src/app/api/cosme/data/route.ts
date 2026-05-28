// ============================================================
// COSME DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Cosme spiritual data
// - Cosme orixá wisdom and practices
// - Healing and medicine traditions
// - Sacred healing arts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cosmeData: any = {};

// ============================================================
// TYPES
// ============================================================

export interface CosmePractice {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  elements: string[];
  orixas: string[];
  benefits: string[];
  benefitsPt: string[];
  difficulty: 'iniciante' | 'intermediario' | 'avancado' | 'mestre';
  duration: string;
  category: string;
}

export interface CosmeCategory {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  icon: string;
}

// ============================================================
// COSME DATA
// ============================================================

const COSME_CATEGORIES: CosmeCategory[] = [
  {
    id: 'oracao',
    name: 'Prayer',
    namePt: 'Oração',
    description: 'Sacred prayers and invocations for Cosme',
    descriptionPt: 'Orações sagradas e invocações para Cosme',
    icon: 'pray',
  },
  {
    id: 'meditacao',
    name: 'Meditation',
    namePt: 'Meditação',
    description: 'Meditation practices for spiritual healing',
    descriptionPt: 'Práticas de meditação para cura espiritual',
    icon: 'zen',
  },
  {
    id: 'ritual',
    name: 'Ritual',
    namePt: 'Ritual',
    description: 'Sacred healing rituals and ceremonies',
    descriptionPt: 'Rituais de cura sagrada e cerimônias',
    icon: 'flame',
  },
  {
    id: 'oferenda',
    name: 'Offering',
    namePt: 'Oferenda',
    description: 'Sacred offerings for healing',
    descriptionPt: 'Oferendas sagradas para cura',
    icon: 'gift',
  },
  {
    id: 'cura',
    name: 'Healing',
    namePt: 'Cura',
    description: 'Sacred healing practices and traditions',
    descriptionPt: 'Práticas e tradições de cura sagrada',
    icon: 'heart',
  },
];

const COSME_PRACTICES: CosmePractice[] = [
  {
    id: 'prece-cosme',
    name: 'Cosme Prayer',
    namePt: 'Prece a Cosme',
    description: 'Sacred prayer invoking the healing energy of Cosme',
    descriptionPt: 'Oração sagrada invocando a energia de cura de Cosme',
    elements: ['cura', 'luz', 'sagrado'],
    orixas: ['Cosme'],
    benefits: ['Cura espiritual', 'Proteção', 'Renovação'],
    benefitsPt: ['Cura espiritual', 'Proteção', 'Renovação'],
    difficulty: 'iniciante',
    duration: '5-10 minutos',
    category: 'oracao',
  },
  {
    id: 'meditacao-cura',
    name: 'Healing Meditation',
    namePt: 'Meditação de Cura',
    description: 'Meditation to connect with healing energy',
    descriptionPt: 'Meditação para conectar com energia de cura',
    elements: ['cura', 'luz', 'energia'],
    orixas: ['Cosme'],
    benefits: ['Cura interior', 'Equilíbrio', 'Paz'],
    benefitsPt: ['Cura interior', 'Equilíbrio', 'Paz'],
    difficulty: 'intermediario',
    duration: '15-30 minutos',
    category: 'meditacao',
  },
  {
    id: 'ritual-saude',
    name: 'Health Ritual',
    namePt: 'Ritual de Saúde',
    description: 'Sacred ritual for physical and spiritual health',
    descriptionPt: 'Ritual sagrado para saúde física e espiritual',
    elements: ['saude', 'cura', 'protecao'],
    orixas: ['Cosme'],
    benefits: ['Saúde restaurada', 'Vitalidade', 'Proteção'],
    benefitsPt: ['Saúde restaurada', 'Vitalidade', 'Proteção'],
    difficulty: 'avancado',
    duration: '45-60 minutos',
    category: 'ritual',
  },
  {
    id: 'oferenda-medicina',
    name: 'Medicine Offering',
    namePt: 'Oferenda de Medicina',
    description: 'Offering to honor the healing spirits',
    descriptionPt: 'Oferenda para honrar os espíritos de cura',
    elements: ['medicina', 'honra', 'gratidao'],
    orixas: ['Cosme'],
    benefits: ['Gratidão', 'Bênçãos de saúde', 'Conexão sagrada'],
    benefitsPt: ['Gratidão', 'Bênçãos de saúde', 'Conexão sagrada'],
    difficulty: 'iniciante',
    duration: '10-15 minutos',
    category: 'oferenda',
  },
  {
    id: 'banho-cura',
    name: 'Healing Bath',
    namePt: 'Banho de Cura',
    description: 'Spiritual cleansing bath for healing',
    descriptionPt: 'Banho de limpeza espiritual para cura',
    elements: ['cura', 'limpeza', 'renovacao'],
    orixas: ['Cosme'],
    benefits: ['Purificação', 'Renovação', 'Cura'],
    benefitsPt: ['Purificação', 'Renovação', 'Cura'],
    difficulty: 'intermediario',
    duration: '20-30 minutos',
    category: 'cura',
  },
  {
    id: 'invocacao-saude',
    name: 'Health Invocation',
    namePt: 'Invocação de Saúde',
    description: 'Sacred invocation for health and wellbeing',
    descriptionPt: 'Invocação sagrada para saúde e bem-estar',
    elements: ['saude', 'protecao', 'vitalidade'],
    orixas: ['Cosme'],
    benefits: ['Saúde protegida', 'Vitalidade', 'Bem-estar'],
    benefitsPt: ['Saúde protegida', 'Vitalidade', 'Bem-estar'],
    difficulty: 'intermediario',
    duration: '10-20 minutos',
    category: 'oracao',
  },
  {
    id: 'rezador-sagrado',
    name: 'Sacred Healing Prayer',
    namePt: 'Rezador Sagrado',
    description: 'Traditional prayer for sacred healing',
    descriptionPt: 'Reza tradicional para cura sagrada',
    elements: ['cura', 'tradicao', 'sagrado'],
    orixas: ['Cosme'],
    benefits: ['Cura profunda', 'Tradição sagrada', 'Proteção'],
    benefitsPt: ['Cura profunda', 'Tradição sagrada', 'Proteção'],
    difficulty: 'avancado',
    duration: '30-45 minutos',
    category: 'ritual',
  },
  {
    id: 'ervas-sagradas',
    name: 'Sacred Herbs',
    namePt: 'Ervas Sagradas',
    description: 'Practice with sacred healing herbs',
    descriptionPt: 'Prática com ervas sagradas de cura',
    elements: ['ervas', 'cura', 'natureza'],
    orixas: ['Cosme'],
    benefits: ['Cura natural', 'Conexão com a natureza', 'Sabedoria'],
    benefitsPt: ['Cura natural', 'Conexão com a natureza', 'Sabedoria'],
    difficulty: 'intermediario',
    duration: '20-30 minutos',
    category: 'cura',
  },
  {
    id: ' unguento-sagrado',
    name: 'Sacred Ointment',
    namePt: 'Unguento Sagrado',
    description: 'Preparation of sacred healing ointment',
    descriptionPt: 'Preparação de unguento sagrado de cura',
    elements: [' unguento', 'cura', 'sagrado'],
    orixas: ['Cosme'],
    benefits: ['Cura física', 'Proteção', 'Bênçãos'],
    benefitsPt: ['Cura física', 'Proteção', 'Bênçãos'],
    difficulty: 'avancado',
    duration: '45-60 minutos',
    category: 'cura',
  },
  {
    id: ' oracao-manha',
    name: 'Morning Prayer',
    namePt: 'Oração da Manhã',
    description: 'Morning prayer for daily health and protection',
    descriptionPt: 'Oração matinal para saúde e proteção diária',
    elements: ['luz', 'protecao', 'saude'],
    orixas: ['Cosme'],
    benefits: ['Proteção matinal', 'Saúde do dia', 'Energia positiva'],
    benefitsPt: ['Proteção matinal', 'Saúde do dia', 'Energia positiva'],
    difficulty: 'iniciante',
    duration: '5-10 minutos',
    category: 'oracao',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPracticeById(id: string): CosmePractice | undefined {
  return COSME_PRACTICES.find((p) => p.id === id.toLowerCase());
}

function getPracticesByElement(element: string): CosmePractice[] {
  return COSME_PRACTICES.filter((p) => p.elements.includes(element.toLowerCase()));
}

function getPracticesByCategory(categoryId: string): CosmePractice[] {
  return COSME_PRACTICES.filter((p) => p.category.toLowerCase() === categoryId.toLowerCase());
}

function getPracticesByDifficulty(difficulty: string): CosmePractice[] {
  return COSME_PRACTICES.filter((p) => p.difficulty === difficulty.toLowerCase());
}

function getPracticesByOrixa(orixa: string): CosmePractice[] {
  return COSME_PRACTICES.filter((p) => p.orixas.some((o) => o.toLowerCase() === orixa.toLowerCase()));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/cosme/data
 * Retrieve Cosme data with optional filtering
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
        category: COSME_CATEGORIES.find((c) => c.id.toLowerCase() === category.toLowerCase()) || { id: category },
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
      data: COSME_CATEGORIES,
    });
  }

  if (type === 'practices') {
    return NextResponse.json({
      data: COSME_PRACTICES,
    });
  }

  // Default: return summary with categories and practices count
  return NextResponse.json({
    data: {
      categories: COSME_CATEGORIES,
      practices: COSME_PRACTICES,
      summary: {
        totalCategories: COSME_CATEGORIES.length,
        totalPractices: COSME_PRACTICES.length,
        byDifficulty: {
          iniciante: COSME_PRACTICES.filter((p) => p.difficulty === 'iniciante').length,
          intermediario: COSME_PRACTICES.filter((p) => p.difficulty === 'intermediario').length,
          avancado: COSME_PRACTICES.filter((p) => p.difficulty === 'avancado').length,
          mestre: COSME_PRACTICES.filter((p) => p.difficulty === 'mestre').length,
        },
      },
    },
  });
}
