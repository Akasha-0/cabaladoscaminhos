// ============================================================
// OA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Oa orixá data
// - Orossi Oa spiritual practices
// - Wisdom and enlightenment traditions
// - Path of light and truth
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const oaData: any = {
  name: "Oa",
  description: "Dados do sistema Oa",
  version: "1.0.0",
};

// ============================================================
// TYPES
// ============================================================

export interface OaPractice {
  id: string;
  name: string;
  description: string;
  category: string;
  elements: string[];
  associatedOrixas: string[];
  benefits: string[];
  prerequisites: string[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface OaCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// ============================================================
// OA DATA
// ============================================================

const OA_CATEGORIES: OaCategory[] = [
  { id: 'wisdom', name: 'Sabedoria', description: 'Práticas de conhecimento e discernimento', icon: 'book' },
  { id: 'light', name: 'Luz', description: 'Trabalho com luz interior e exterior', icon: 'sun' },
  { id: 'truth', name: 'Verdade', description: 'Caminho da verdade absoluta', icon: 'eye' },
  { id: 'connection', name: 'Conexão', description: 'Conexão com forças superiores', icon: 'link' },
];

const OA_PRACTICES: OaPractice[] = [
  {
    id: 'wisdom-of-light',
    name: 'Sabedoria da Luz',
    description: 'Prática de iluminação interior através do conhecimento sagrado',
    category: 'wisdom',
    elements: ['luz', 'fogo', 'conhecimento'],
    associatedOrixas: ['Oa'],
    benefits: [' clareza mental', 'discernimento', 'conhecimento profundo'],
    prerequisites: [],
    duration: '30 minutos',
    difficulty: 'beginner',
  },
  {
    id: 'path-of-truth',
    name: 'Caminho da Verdade',
    description: 'Meditação para acessar a verdade absoluta além das ilusões',
    category: 'truth',
    elements: ['verdade', 'luz', 'claridade'],
    associatedOrixas: ['Oa', 'Obatalá'],
    benefits: ['eliminação de ilusões', 'visão clara', 'integridade'],
    prerequisites: ['wisdom-of-light'],
    duration: '45 minutos',
    difficulty: 'intermediate',
  },
  {
    id: 'light-connection',
    name: 'Conexão com a Luz',
    description: 'Ritual de conexão com a luz divina de Oxum e Olodumare',
    category: 'light',
    elements: ['água', 'luz', 'amor'],
    associatedOrixas: ['Oxum', 'Olodumare', 'Oa'],
    benefits: ['proteção divina', 'amor próprio', 'clareza'],
    prerequisites: [],
    duration: '20 minutos',
    difficulty: 'beginner',
  },
  {
    id: 'truth-meditation',
    name: 'Meditação da Verdade',
    description: 'Meditação profunda para revelar a verdade interior',
    category: 'truth',
    elements: ['meditação', 'verdade', 'silêncio'],
    associatedOrixas: ['Oa'],
    benefits: [' paz interior', 'autoconhecimento', 'realidade'],
    prerequisites: ['path-of-truth'],
    duration: '60 minutos',
    difficulty: 'advanced',
  },
  {
    id: 'divine-wisdom-study',
    name: 'Estudo da Sabedoria Divina',
    description: 'Prática de estudo dos textos sagrados e ensinamentos de Oa',
    category: 'wisdom',
    elements: ['conhecimento', 'sabedoria', 'learning'],
    associatedOrixas: ['Oa', 'Oxum'],
    benefits: ['conhecimento sagrado', 'memória cósmica', 'sabedoria prática'],
    prerequisites: [],
    duration: '45 minutos',
    difficulty: 'beginner',
  },
  {
    id: 'spiritual-light-ritual',
    name: 'Ritual da Luz Espiritual',
    description: 'Ritual completo para despertar a luz interior e conexões celestiais',
    category: 'light',
    elements: ['fogo', 'luz', 'energia'],
    associatedOrixas: ['Oa', 'Olodumare', 'Oxum'],
    benefits: [' desperta luz interior', 'proteção', 'ascensão espiritual'],
    prerequisites: ['wisdom-of-light', 'light-connection'],
    duration: '90 minutos',
    difficulty: 'advanced',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPracticeById(id: string): OaPractice | undefined {
  return OA_PRACTICES.find((p) => p.id === id.toLowerCase());
}

function getPracticesByElement(element: string): OaPractice[] {
  return OA_PRACTICES.filter((p) => p.elements.includes(element.toLowerCase()));
}

function getPracticesByCategory(categoryId: string): OaPractice[] {
  return OA_PRACTICES.filter((p) => p.category.toLowerCase() === categoryId.toLowerCase());
}

function getPracticesByDifficulty(difficulty: string): OaPractice[] {
  return OA_PRACTICES.filter((p) => p.difficulty === difficulty.toLowerCase());
}

function getPracticesByOrixa(orixa: string): OaPractice[] {
  return OA_PRACTICES.filter((p) =>
    p.associatedOrixas.some((o) => o.toLowerCase() === orixa.toLowerCase())
  );
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oa/data
 * Retrieve Oa data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const element = searchParams.get('element');
    const difficulty = searchParams.get('difficulty');
    const orixa = searchParams.get('orixa');

    // Return single practice by ID
    if (id) {
      const record = getPracticeById(id);
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Oa practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return practices by category
    if (category) {
      const records = getPracticesByCategory(category);
      if (records.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No practices found for category' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: records });
    }

    // Return practices by element
    if (element) {
      const records = getPracticesByElement(element);
      if (records.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No practices found for element' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: records });
    }

    // Return practices by difficulty
    if (difficulty) {
      const records = getPracticesByDifficulty(difficulty);
      if (records.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No practices found for difficulty level' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: records });
    }

    // Return practices by orixá
    if (orixa) {
      const records = getPracticesByOrixa(orixa);
      if (records.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No practices found for orixá' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: records });
    }

    // Return categories only
    if (searchParams.get('type') === 'categories') {
      return NextResponse.json({ success: true, data: OA_CATEGORIES });
    }

    // Return practices only
    if (searchParams.get('type') === 'practices') {
      return NextResponse.json({ success: true, data: OA_PRACTICES });
    }

    // Default — return all oa data
    return NextResponse.json({
      success: true,
      data: {
        practices: OA_PRACTICES,
        categories: OA_CATEGORIES,
        info: oaData,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Oa data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
