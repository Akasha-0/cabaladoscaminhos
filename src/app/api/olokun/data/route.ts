// ============================================================
// OLOKUN DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Olokun orixá data
// - Deep water mysteries and ocean wisdom
// - Wealth and abundance traditions
// - Keeper of the depths and hidden treasures
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const olokunData: any = {
  name: "Olokun",
  description: "Dados do sistema Olokun",
  version: "1.0.0",
};

// ============================================================
// TYPES
// ============================================================

export interface OlokunPractice {
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

export interface OlokunCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// ============================================================
// OLOKUN DATA
// ============================================================

const OLOKUN_CATEGORIES: OlokunCategory[] = [
  { id: 'waters', name: 'Águas Profundas', description: 'Práticas de conexão com as águas e oceanos', icon: 'waves' },
  { id: 'abundance', name: 'Abundância', description: 'Trabalho com riqueza e prosperidade', icon: 'treasure' },
  { id: 'mystery', name: 'Mistérios', description: 'Mistérios das profundezas e sabedoria oculta', icon: 'key' },
  { id: 'healing', name: ' Cura das Águas', description: 'Purificação e cura através das águas', icon: 'droplet' },
];

const OLOKUN_PRACTICES: OlokunPractice[] = [
  {
    id: 'ocean-meditation',
    name: 'Meditação do Oceano',
    description: 'Prática de mergulho interior nas profundezas da consciência',
    category: 'waters',
    elements: ['água', 'oceano', 'profundidade'],
    associatedOrixas: ['Olokun'],
    benefits: [' paz interior', ' clareza emocional', 'profundidade espiritual'],
    prerequisites: [],
    duration: '30 minutos',
    difficulty: 'beginner',
  },
  {
    id: 'abundance-ritual',
    name: 'Ritual de Abundância',
    description: 'Ritual para abrir os canais de prosperidade e riqueza',
    category: 'abundance',
    elements: ['água', 'ouro', 'abundância'],
    associatedOrixas: ['Olokun', 'Oxum'],
    benefits: ['prosperidade', 'abundância material', 'fluxo financeiro'],
    prerequisites: [],
    duration: '45 minutos',
    difficulty: 'beginner',
  },
  {
    id: 'depth-wisdom',
    name: 'Sabedoria das Profundezas',
    description: 'Meditação para accessing the hidden wisdom of the deep',
    category: 'mystery',
    elements: ['mistério', 'sabedoria oculta', 'profundidade'],
    associatedOrixas: ['Olokun'],
    benefits: [' autoconhecimento profundo', 'insights ocultos', 'discernimento'],
    prerequisites: ['ocean-meditation'],
    duration: '60 minutos',
    difficulty: 'intermediate',
  },
  {
    id: 'water-healing',
    name: 'Cura das Águas',
    description: 'Ritual de purificação e cura utilizando águas sagradas',
    category: 'healing',
    elements: ['água', ' purificação', 'cura'],
    associatedOrixas: ['Olokun', 'Oxum'],
    benefits: ['purificação emocional', 'limpeza áurica', 'renovação'],
    prerequisites: [],
    duration: '40 minutos',
    difficulty: 'beginner',
  },
  {
    id: 'treasure-meditation',
    name: 'Meditação do Tesouro Escondido',
    description: 'Prática para descobrir tesouros ocultos dentro da consciência',
    category: 'mystery',
    elements: ['tesouro', 'descobrimento', 'riqueza interior'],
    associatedOrixas: ['Olokun'],
    benefits: ['auto-descoberta', 'riqueza interna', 'potencial oculto'],
    prerequisites: ['depth-wisdom'],
    duration: '45 minutos',
    difficulty: 'intermediate',
  },
  {
    id: 'sacred-bath',
    name: 'Banho Sagrado de Olokun',
    description: 'Ritual completo de banho sagrado para purificação e bênção',
    category: 'healing',
    elements: ['água', 'sal mar', ' ervas'],
    associatedOrixas: ['Olokun', 'Oxum', 'Iemanjá'],
    benefits: ['purificação completa', 'proteção', 'renovação energética'],
    prerequisites: ['water-healing', 'abundance-ritual'],
    duration: '90 minutos',
    difficulty: 'advanced',
  },
  {
    id: 'deep-ocean-journey',
    name: 'Jornada ao Oceano Profundo',
    description: 'Ritual de imersão profunda nas águas do inconsciente',
    category: 'waters',
    elements: ['água', 'inconsciente', 'visão'],
    associatedOrixas: ['Olokun'],
    benefits: [' acesso ao inconsciente', 'visão profética', 'transformação'],
    prerequisites: ['ocean-meditation', 'depth-wisdom'],
    duration: '120 minutos',
    difficulty: 'advanced',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPracticeById(id: string): OlokunPractice | undefined {
  return OLOKUN_PRACTICES.find((p) => p.id === id.toLowerCase());
}

function getPracticesByElement(element: string): OlokunPractice[] {
  return OLOKUN_PRACTICES.filter((p) => p.elements.includes(element.toLowerCase()));
}

function getPracticesByCategory(categoryId: string): OlokunPractice[] {
  return OLOKUN_PRACTICES.filter((p) => p.category.toLowerCase() === categoryId.toLowerCase());
}

function getPracticesByDifficulty(difficulty: string): OlokunPractice[] {
  return OLOKUN_PRACTICES.filter((p) => p.difficulty === difficulty.toLowerCase());
}

function getPracticesByOrixa(orixa: string): OlokunPractice[] {
  return OLOKUN_PRACTICES.filter((p) =>
    p.associatedOrixas.some((o) => o.toLowerCase() === orixa.toLowerCase())
  );
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/olokun/data
 * Retrieve Olokun data with optional filtering
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
          { success: false, error: 'Olokun practice not found' },
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
      return NextResponse.json({ success: true, data: OLOKUN_CATEGORIES });
    }

    // Return practices only
    if (searchParams.get('type') === 'practices') {
      return NextResponse.json({ success: true, data: OLOKUN_PRACTICES });
    }

    // Default — return all olokun data
    return NextResponse.json({
      success: true,
      data: {
        practices: OLOKUN_PRACTICES,
        categories: OLOKUN_CATEGORIES,
        info: olokunData,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Olokun data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
