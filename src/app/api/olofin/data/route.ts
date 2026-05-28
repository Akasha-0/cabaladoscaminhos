// ============================================================
// OLOFIN DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Olofin spiritual data
// - Olofin orixá wisdom and practices
// - Divine connection traditions
// - Path of cosmic consciousness
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const olofinData: any = {};

// ============================================================
// TYPES
// ============================================================

export interface OlofinPractice {
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

export interface OlofinCategory {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  icon: string;
}

// ============================================================
// OLOFIN DATA
// ============================================================

const OLOFIN_CATEGORIES: OlofinCategory[] = [
  {
    id: 'oracao',
    name: 'Prayer',
    namePt: 'Oração',
    description: 'Sacred prayers and invocations for Olofin',
    descriptionPt: 'Orações sagradas e invocações para Olofin',
    icon: 'pray',
  },
  {
    id: 'meditacao',
    name: 'Meditation',
    namePt: 'Meditação',
    description: 'Meditation practices for cosmic connection',
    descriptionPt: 'Práticas de meditação para conexão cósmica',
    icon: 'zen',
  },
  {
    id: 'ritual',
    name: 'Ritual',
    namePt: 'Ritual',
    description: 'Sacred rituals and ceremonies',
    descriptionPt: 'Rituais e cerimônias sagradas',
    icon: 'flame',
  },
  {
    id: 'oferenda',
    name: 'Offering',
    namePt: 'Oferenda',
    description: 'Sacred offerings and presents',
    descriptionPt: 'Oferendas e presentes sagrados',
    icon: 'gift',
  },
  {
    id: 'sagrado',
    name: 'Sacred',
    namePt: 'Sagrado',
    description: 'Sacred practices and traditions',
    descriptionPt: 'Práticas e tradições sagradas',
    icon: 'star',
  },
];

const OLOFIN_PRACTICES: OlofinPractice[] = [
  {
    id: 'prece-olofin',
    name: 'Olofin Prayer',
    namePt: 'Prece a Olofin',
    description: 'Sacred prayer invoking the cosmic consciousness of Olofin',
    descriptionPt: 'Oração sagrada invocando a consciência cósmica de Olofin',
    elements: ['cosmico', 'consciencia', 'divino'],
    orixas: ['Olofin'],
    benefits: ['Conexão cósmica', 'Expansão da consciência', 'Unidade universal'],
    benefitsPt: ['Conexão cósmica', 'Expansão da consciência', 'Unidade universal'],
    difficulty: 'iniciante',
    duration: '5-10 minutos',
    category: 'oracao',
  },
  {
    id: 'meditacao-cosmica',
    name: 'Cosmic Meditation',
    namePt: 'Meditação Cósmica',
    description: 'Meditation to connect with cosmic energy',
    descriptionPt: 'Meditação para conectar com a energia cósmica',
    elements: ['cosmico', 'energia', 'expansao'],
    orixas: ['Olofin'],
    benefits: ['Expansão da consciência', 'Clareza mental', 'Visão cósmica'],
    benefitsPt: ['Expansão da consciência', 'Clareza mental', 'Visão cósmica'],
    difficulty: 'intermediario',
    duration: '15-30 minutos',
    category: 'meditacao',
  },
  {
    id: 'ritual-universo',
    name: 'Universe Ritual',
    namePt: 'Ritual do Universo',
    description: 'Sacred ritual for cosmic alignment',
    descriptionPt: 'Ritual sagrado para alinhamento cósmico',
    elements: ['universo', 'alinhamento', 'cosmico'],
    orixas: ['Olofin'],
    benefits: ['Alinhamento universal', 'Sincronicidade', 'Propósito cósmico'],
    benefitsPt: ['Alinhamento universal', 'Sincronicidade', 'Propósito cósmico'],
    difficulty: 'avancado',
    duration: '45-60 minutos',
    category: 'ritual',
  },
  {
    id: 'oferenda-cosmica',
    name: 'Cosmic Offering',
    namePt: 'Oferenda Cósmica',
    description: 'Offering to honor the cosmic order',
    descriptionPt: 'Oferenda para honrar a ordem cósmica',
    elements: ['cosmico', 'ordem', 'harmonia'],
    orixas: ['Olofin'],
    benefits: ['Harmonia cósmica', 'Bênçãos universais', 'Proteção celestial'],
    benefitsPt: ['Harmonia cósmica', 'Bênçãos universais', 'Proteção celestial'],
    difficulty: 'iniciante',
    duration: '10-15 minutos',
    category: 'oferenda',
  },
  {
    id: 'invocacao-cosmica',
    name: 'Cosmic Invocation',
    namePt: 'Invocação Cósmica',
    description: 'Sacred invocation for cosmic presence',
    descriptionPt: 'Invocação sagrada para presença cósmica',
    elements: ['presenca', 'cosmico', 'sagrado'],
    orixas: ['Olofin'],
    benefits: ['Presença cósmica', 'Sabedoria universal', 'Guia espiritual'],
    benefitsPt: ['Presença cósmica', 'Sabedoria universal', 'Guia espiritual'],
    difficulty: 'intermediario',
    duration: '10-20 minutos',
    category: 'sagrado',
  },
  {
    id: 'caminho-cosmico',
    name: 'Cosmic Path',
    namePt: 'Caminho Cósmico',
    description: 'Practice following the cosmic path',
    descriptionPt: 'Prática de seguir o caminho cósmico',
    elements: ['cosmico', 'caminho', 'destino'],
    orixas: ['Olofin'],
    benefits: ['Propósito de vida', 'Direção cósmica', 'Missão de alma'],
    benefitsPt: ['Propósito de vida', 'Direção cósmica', 'Missão de alma'],
    difficulty: 'avancado',
    duration: '30-45 minutos',
    category: 'meditacao',
  },
  {
    id: 'conexao-estrelar',
    name: 'Stellar Connection',
    namePt: 'Conexão Estelar',
    description: 'Spiritual connection with stellar energies',
    descriptionPt: 'Conexão espiritual com energias estelares',
    elements: ['estrelar', 'energia', 'luz'],
    orixas: ['Olofin'],
    benefits: ['Energia estelar', 'Iluminação cósmica', 'Conexão galáctica'],
    benefitsPt: ['Energia estelar', 'Iluminação cósmica', 'Conexão galáctica'],
    difficulty: 'intermediario',
    duration: '20-30 minutos',
    category: 'ritual',
  },
  {
    id: 'oracao-estrelar',
    name: 'Stellar Prayer',
    namePt: 'Oração Estelar',
    description: 'Prayer for cosmic guidance and wisdom',
    descriptionPt: 'Oração para orientação cósmica e sabedoria',
    elements: ['estrelar', 'sabedoria', 'guia'],
    orixas: ['Olofin'],
    benefits: ['Sabedoria cósmica', 'Orientação divina', 'Luz das estrelas'],
    benefitsPt: ['Sabedoria cósmica', 'Orientação divina', 'Luz das estrelas'],
    difficulty: 'iniciante',
    duration: '5-10 minutos',
    category: 'oracao',
  },
  {
    id: 'uniao-cosmica',
    name: 'Cosmic Union',
    namePt: 'União Cósmica',
    description: 'Practice of union with cosmic consciousness',
    descriptionPt: 'Prática de união com consciência cósmica',
    elements: ['uniao', 'consciencia', 'cosmico'],
    orixas: ['Olofin'],
    benefits: ['União universal', 'Consciência expandida', 'Paz interior'],
    benefitsPt: ['União universal', 'Consciência expandida', 'Paz interior'],
    difficulty: 'avancado',
    duration: '45-60 minutos',
    category: 'sagrado',
  },
  {
    id: 'oferecer-consciencia',
    name: 'Offer Consciousness',
    namePt: 'Oferecer Consciência',
    description: 'Practice of offering consciousness to the cosmos',
    descriptionPt: 'Prática de oferecer consciência ao cosmos',
    elements: ['consciencia', 'generosidade', 'servico'],
    orixas: ['Olofin'],
    benefits: ['Serviço cósmico', 'Propósito coletivo', 'Luz compartilhada'],
    benefitsPt: ['Serviço cósmico', 'Propósito coletivo', 'Luz compartilhada'],
    difficulty: 'iniciante',
    duration: '10-15 minutos',
    category: 'oferenda',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPracticeById(id: string): OlofinPractice | undefined {
  return OLOFIN_PRACTICES.find((p) => p.id === id.toLowerCase());
}

function getPracticesByElement(element: string): OlofinPractice[] {
  return OLOFIN_PRACTICES.filter((p) => p.elements.includes(element.toLowerCase()));
}

function getPracticesByCategory(categoryId: string): OlofinPractice[] {
  return OLOFIN_PRACTICES.filter((p) => p.category.toLowerCase() === categoryId.toLowerCase());
}

function getPracticesByDifficulty(difficulty: string): OlofinPractice[] {
  return OLOFIN_PRACTICES.filter((p) => p.difficulty === difficulty.toLowerCase());
}

function getPracticesByOrixa(orixa: string): OlofinPractice[] {
  return OLOFIN_PRACTICES.filter((p) => p.orixas.some((o) => o.toLowerCase() === orixa.toLowerCase()));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/olofin/data
 * Retrieve Olofin data with optional filtering
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
        category: OLOFIN_CATEGORIES.find((c) => c.id.toLowerCase() === category.toLowerCase()) || { id: category },
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

  // Filter by orixa
  if (orixa) {
    const practices = getPracticesByOrixa(orixa);
    return NextResponse.json({ data: practices });
  }

  // Return based on type parameter
  switch (type) {
    case 'summary':
      return NextResponse.json({
        data: {
          categories: OLOFIN_CATEGORIES,
          totalPractices: OLOFIN_PRACTICES.length,
        },
      });

    case 'categories':
      return NextResponse.json({ data: OLOFIN_CATEGORIES });

    case 'practices':
      return NextResponse.json({ data: OLOFIN_PRACTICES });

    case 'full':
    default:
      return NextResponse.json({
        data: {
          categories: OLOFIN_CATEGORIES,
          practices: OLOFIN_PRACTICES,
          totalPractices: OLOFIN_PRACTICES.length,
          totalCategories: OLOFIN_CATEGORIES.length,
        },
      });
  }
}