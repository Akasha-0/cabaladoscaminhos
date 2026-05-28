// ============================================================
// VOVOCHICO DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Vovochico spiritual data
// - Vovochico ancestral wisdom and practices
// - Traditional healing knowledge
// - Sacred ancestral traditions
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vovochicoData: any = {};

// ============================================================
// TYPES
// ============================================================

export interface VovochicoPractice {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  elements: string[];
  ancestors: string[];
  benefits: string[];
  benefitsPt: string[];
  difficulty: 'iniciante' | 'intermediario' | 'avancado' | 'mestre';
  duration: string;
  category: string;
}

export interface VovochicoCategory {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  icon: string;
}

// ============================================================
// VOVOCHICO DATA
// ============================================================

const VOVOCHICO_CATEGORIES: VovochicoCategory[] = [
  {
    id: 'Ancestral',
    name: 'Ancestral',
    namePt: 'Ancestral',
    description: 'Sacred ancestral practices and wisdom',
    descriptionPt: 'Práticas e sabedoria ancestral sagrada',
    icon: 'users',
  },
  {
    id: 'Traditional',
    name: 'Traditional',
    namePt: 'Tradicional',
    description: 'Traditional healing practices',
    descriptionPt: 'Práticas tradicionais de cura',
    icon: 'heart',
  },
  {
    id: 'Spiritual',
    name: 'Spiritual',
    namePt: 'Espiritual',
    description: 'Spiritual connection practices',
    descriptionPt: 'Práticas de conexão espiritual',
    icon: 'sparkles',
  },
  {
    id: 'Ritual',
    name: 'Ritual',
    namePt: 'Ritual',
    description: 'Sacred rituals and ceremonies',
    descriptionPt: 'Rituais e cerimônias sagradas',
    icon: 'flame',
  },
  {
    id: 'Healing',
    name: 'Healing',
    namePt: 'Cura',
    description: 'Traditional healing practices',
    descriptionPt: 'Práticas tradicionais de cura',
    icon: 'cross',
  },
];

const VOVOCHICO_PRACTICES: VovochicoPractice[] = [
  {
    id: 'prece-ancestral',
    name: 'Ancestral Prayer',
    namePt: 'Prece Ancestral',
    description: 'Sacred prayer connecting with ancestral wisdom',
    descriptionPt: 'Oração sagrada conectando com a sabedoria ancestral',
    elements: ['ancestral', 'sabedoria', 'luz'],
    ancestors: ['Vovochico'],
    benefits: ['Conexão ancestral', 'Sabedoria', 'Orientação'],
    benefitsPt: ['Conexão ancestral', 'Sabedoria', 'Orientação'],
    difficulty: 'iniciante',
    duration: '5-10 minutos',
    category: 'Ancestral',
  },
  {
    id: 'meditacao-raizes',
    name: 'Roots Meditation',
    namePt: 'Meditação das Raízes',
    description: 'Meditation to connect with ancestral roots',
    descriptionPt: 'Meditação para conectar com as raízes ancestrais',
    elements: ['raízes', 'terra', 'energia'],
    ancestors: ['Vovochico'],
    benefits: ['Conexão profunda', 'Estabilidade', 'Força'],
    benefitsPt: ['Conexão profunda', 'Estabilidade', 'Força'],
    difficulty: 'intermediario',
    duration: '15-30 minutos',
    category: 'Traditional',
  },
  {
    id: 'ritual-tradição',
    name: 'Tradition Ritual',
    namePt: 'Ritual de Tradição',
    description: 'Sacred ritual honoring traditional wisdom',
    descriptionPt: 'Ritual sagrado honrando a sabedoria tradicional',
    elements: ['tradição', 'honra', 'sagrado'],
    ancestors: ['Vovochico'],
    benefits: ['Honra ancestral', 'Proteção', 'Bênçãos'],
    benefitsPt: ['Honra ancestral', 'Proteção', 'Bênçãos'],
    difficulty: 'avancado',
    duration: '45-60 minutos',
    category: 'Ritual',
  },
  {
    id: 'cura-ervas',
    name: 'Herbal Healing',
    namePt: 'Cura com Ervas',
    description: 'Traditional healing with sacred herbs',
    descriptionPt: 'Cura tradicional com ervas sagradas',
    elements: ['ervas', 'cura', 'natureza'],
    ancestors: ['Vovochico'],
    benefits: ['Cura natural', 'Sabedoria verde', 'Renovação'],
    benefitsPt: ['Cura natural', 'Sabedoria verde', 'Renovação'],
    difficulty: 'intermediario',
    duration: '20-30 minutos',
    category: 'Healing',
  },
  {
    id: 'oracão-sabedoria',
    name: 'Wisdom Prayer',
    namePt: 'Oração de Sabedoria',
    description: 'Prayer for ancestral wisdom and guidance',
    descriptionPt: 'Oração para sabedoria e orientação ancestral',
    elements: ['sabedoria', 'orientação', 'luz'],
    ancestors: ['Vovochico'],
    benefits: ['Sabedoria', 'Clareza', 'Direção'],
    benefitsPt: ['Sabedoria', 'Clareza', 'Direção'],
    difficulty: 'iniciante',
    duration: '5-10 minutos',
    category: 'Spiritual',
  },
  {
    id: 'banho-ancestral',
    name: 'Ancestral Bath',
    namePt: 'Banho Ancestral',
    description: 'Spiritual cleansing bath with ancestral herbs',
    descriptionPt: 'Banho de limpeza espiritual com ervas ancestrais',
    elements: ['limpeza', 'renovação', 'ancestral'],
    ancestors: ['Vovochico'],
    benefits: ['Purificação', 'Renovação', 'Proteção'],
    benefitsPt: ['Purificação', 'Renovação', 'Proteção'],
    difficulty: 'intermediario',
    duration: '20-30 minutos',
    category: 'Healing',
  },
  {
    id: 'invocacao-forcas',
    name: 'Forces Invocation',
    namePt: 'Invocação das Forças',
    description: 'Sacred invocation calling ancestral forces',
    descriptionPt: 'Invocação sagrada invocando as forças ancestrais',
    elements: ['força', 'poder', 'ancestral'],
    ancestors: ['Vovochico'],
    benefits: ['Força', 'Poder', 'Proteção'],
    benefitsPt: ['Força', 'Poder', 'Proteção'],
    difficulty: 'avancado',
    duration: '30-45 minutos',
    category: 'Ritual',
  },
  {
    id: 'rezador-terra',
    name: 'Earth Prayer',
    namePt: 'Rezador da Terra',
    description: 'Prayer connecting with earth energies',
    descriptionPt: 'Oração conectando com energias da terra',
    elements: ['terra', 'energia', 'conexão'],
    ancestors: ['Vovochico'],
    benefits: ['Conexão terrena', 'Estabilidade', 'Força'],
    benefitsPt: ['Conexão terrena', 'Estabilidade', 'Força'],
    difficulty: 'intermediario',
    duration: '15-20 minutos',
    category: 'Spiritual',
  },
  {
    id: 'oferenda-ancestrais',
    name: 'Ancestral Offering',
    namePt: 'Oferenda Ancestral',
    description: 'Offering to honor the ancestors',
    descriptionPt: 'Oferenda para honrar os ancestrais',
    elements: ['oferenda', 'honra', 'gratidão'],
    ancestors: ['Vovochico'],
    benefits: ['Honra', 'Gratidão', 'Bênçãos'],
    benefitsPt: ['Honra', 'Gratidão', 'Bênçãos'],
    difficulty: 'iniciante',
    duration: '10-15 minutos',
    category: 'Ritual',
  },
  {
    id: 'visita-espíritos',
    name: 'Spirit Visit',
    namePt: 'Visita aos Espíritos',
    description: 'Practice of visiting and communicating with spirits',
    descriptionPt: 'Prática de visitar e comunicar com espíritos',
    elements: ['espíritos', 'comunicação', 'transição'],
    ancestors: ['Vovochico'],
    benefits: ['Comunicação', 'Visão', 'Conhecimento'],
    benefitsPt: ['Comunicação', 'Visão', 'Conhecimento'],
    difficulty: 'mestre',
    duration: '60-90 minutos',
    category: 'Ancestral',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPracticeById(id: string): VovochicoPractice | undefined {
  return VOVOCHICO_PRACTICES.find((p) => p.id === id.toLowerCase());
}

function getPracticesByElement(element: string): VovochicoPractice[] {
  return VOVOCHICO_PRACTICES.filter((p) => p.elements.includes(element.toLowerCase()));
}

function getPracticesByCategory(categoryId: string): VovochicoPractice[] {
  return VOVOCHICO_PRACTICES.filter((p) => p.category.toLowerCase() === categoryId.toLowerCase());
}

function getPracticesByDifficulty(difficulty: string): VovochicoPractice[] {
  return VOVOCHICO_PRACTICES.filter((p) => p.difficulty === difficulty.toLowerCase());
}

function getPracticesByAncestor(ancestor: string): VovochicoPractice[] {
  return VOVOCHICO_PRACTICES.filter((p) => p.ancestors.some((a) => a.toLowerCase() === ancestor.toLowerCase()));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/vovochico/data
 * Retrieve Vovochico data with optional filtering
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'summary';
  const category = url.searchParams.get('category');
  const difficulty = url.searchParams.get('difficulty');
  const element = url.searchParams.get('element');
  const ancestor = url.searchParams.get('ancestor');
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
        category: VOVOCHICO_CATEGORIES.find((c) => c.id.toLowerCase() === category.toLowerCase()) || { id: category },
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

  // Filter by ancestor
  if (ancestor) {
    const practices = getPracticesByAncestor(ancestor);
    return NextResponse.json({ data: practices });
  }

  // Return based on type
  if (type === 'categories') {
    return NextResponse.json({ data: VOVOCHICO_CATEGORIES });
  }

  if (type === 'practices') {
    return NextResponse.json({ data: VOVOCHICO_PRACTICES });
  }

  // Default: return summary with categories and count
  return NextResponse.json({
    data: {
      categories: VOVOCHICO_CATEGORIES,
      totalPractices: VOVOCHICO_PRACTICES.length,
      practices: VOVOCHICO_PRACTICES.slice(0, 5),
    },
  });
}