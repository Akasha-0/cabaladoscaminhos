// ============================================================
// OLUWANDE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Oluwande spiritual data
// - Oluwande orixá wisdom and practices
// - Spiritual enlightenment traditions
// - Path of divine connection
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const oluwandeData: any = {};

// ============================================================
// TYPES
// ============================================================

export interface OluwandePractice {
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

export interface OluwandeCategory {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  icon: string;
}

// ============================================================
// OLUWANDE DATA
// ============================================================

const OLUWANDE_CATEGORIES: OluwandeCategory[] = [
  {
    id: 'oracao',
    name: 'Prayer',
    namePt: 'Oração',
    description: 'Sacred prayers and invocations for Oluwande',
    descriptionPt: 'Orações sagradas e invocações para Oluwande',
    icon: 'pray',
  },
  {
    id: 'meditacao',
    name: 'Meditation',
    namePt: 'Meditação',
    description: 'Meditation practices for spiritual connection',
    descriptionPt: 'Práticas de meditação para conexão espiritual',
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
    description: 'Sacred offerings and offerings',
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

const OLUWANDE_PRACTICES: OluwandePractice[] = [
  {
    id: 'prece-oluwande',
    name: 'Oluwande Prayer',
    namePt: 'Prece a Oluwande',
    description: 'Sacred prayer invoking the divine light of Oluwande',
    descriptionPt: 'Oração sagrada invocando a luz divina de Oluwande',
    elements: ['luz', 'divino', 'purificacao'],
    orixas: ['Oluwande'],
    benefits: ['Conexão divina', 'Iluminação interior', 'Purificação espiritual'],
    benefitsPt: ['Conexão divina', 'Iluminação interior', 'Purificação espiritual'],
    difficulty: 'iniciante',
    duration: '5-10 minutos',
    category: 'oracao',
  },
  {
    id: 'meditacao-luz',
    name: 'Light Meditation',
    namePt: 'Meditação da Luz',
    description: 'Meditation to connect with divine light energy',
    descriptionPt: 'Meditação para conectar com a energia da luz divina',
    elements: ['luz', 'luz-divina', 'energia'],
    orixas: ['Oluwande'],
    benefits: ['Expansão da consciência', 'clareza mental', 'proteção espiritual'],
    benefitsPt: ['Expansão da consciência', 'Clareza mental', 'Proteção espiritual'],
    difficulty: 'intermediario',
    duration: '15-30 minutos',
    category: 'meditacao',
  },
  {
    id: 'ritual-luz-divina',
    name: 'Divine Light Ritual',
    namePt: 'Ritual da Luz Divina',
    description: 'Sacred ritual for divine light activation',
    descriptionPt: 'Ritual sagrado para ativação da luz divina',
    elements: ['luz', 'divino', 'ativacao'],
    orixas: ['Oluwande'],
    benefits: ['Ativação da luz interior', ' Ascensão espiritual', 'União com o divino'],
    benefitsPt: ['Ativação da luz interior', 'Ascensão espiritual', 'União com o divino'],
    difficulty: 'avancado',
    duration: '45-60 minutos',
    category: 'ritual',
  },
  {
    id: 'oferenda-luz',
    name: 'Light Offering',
    namePt: 'Oferenda de Luz',
    description: 'Offering of light to honor Oluwande',
    descriptionPt: 'Oferenda de luz para honrar Oluwande',
    elements: ['luz', 'honra', 'gratidao'],
    orixas: ['Oluwande'],
    benefits: ['Gratidão divina', 'Bênçãos espirituais', 'Conexão sagrada'],
    benefitsPt: ['Gratidão divina', 'Bênçãos espirituais', 'Conexão sagrada'],
    difficulty: 'iniciante',
    duration: '10-15 minutos',
    category: 'oferenda',
  },
  {
    id: 'invocacao-sagrada',
    name: 'Sacred Invocation',
    namePt: 'Invocação Sagrada',
    description: 'Sacred invocation for divine presence',
    descriptionPt: 'Invocação sagrada para presença divina',
    elements: ['presenca', 'divino', 'sagrado'],
    orixas: ['Oluwande'],
    benefits: ['Presença divina', 'Proteção espiritual', 'Sabedoria superior'],
    benefitsPt: ['Presença divina', 'Proteção espiritual', 'Sabedoria superior'],
    difficulty: 'intermediario',
    duration: '10-20 minutos',
    category: 'sagrado',
  },
  {
    id: 'caminho-da-luz',
    name: 'Path of Light',
    namePt: 'Caminho da Luz',
    description: 'Practice following the path of divine light',
    descriptionPt: 'Prática de seguir o caminho da luz divina',
    elements: ['luz', 'caminho', 'transformacao'],
    orixas: ['Oluwande'],
    benefits: ['Transformação espiritual', 'Iluminação', 'Evolução da alma'],
    benefitsPt: ['Transformação espiritual', 'Iluminação', 'Evolução da alma'],
    difficulty: 'avancado',
    duration: '30-45 minutos',
    category: 'meditacao',
  },
  {
    id: 'banho-de-luz',
    name: 'Bath of Light',
    namePt: 'Banho de Luz',
    description: 'Spiritual cleansing with divine light',
    descriptionPt: 'Limpeza espiritual com luz divina',
    elements: ['luz', 'purificacao', 'limpeza'],
    orixas: ['Oluwande'],
    benefits: ['Purificação completa', 'Renovação espiritual', 'Proteção'],
    benefitsPt: ['Purificação completa', 'Renovação espiritual', 'Proteção'],
    difficulty: 'intermediario',
    duration: '20-30 minutos',
    category: 'ritual',
  },
  {
    id: 'oracao-noturna',
    name: 'Night Prayer',
    namePt: 'Oração Noturna',
    description: 'Night prayer for divine protection and rest',
    descriptionPt: 'Oração noturna para proteção divina e descanso',
    elements: ['luz', 'protecao', 'descanso'],
    orixas: ['Oluwande'],
    benefits: ['Proteção noturna', 'Sono tranquilo', 'Bênçãos ao amanhecer'],
    benefitsPt: ['Proteção noturna', 'Sono tranquilo', 'Bênçãos ao amanhecer'],
    difficulty: 'iniciante',
    duration: '5-10 minutos',
    category: 'oracao',
  },
  {
    id: 'comunhao-divina',
    name: 'Divine Communion',
    namePt: 'Comunhão Divina',
    description: 'Practice of communion with divine energy',
    descriptionPt: 'Prática de comunhão com energia divina',
    elements: ['energia', 'divino', 'uniao'],
    orixas: ['Oluwande'],
    benefits: ['União com o divino', 'Expansão da consciência', 'Sabedoria'],
    benefitsPt: ['União com o divino', 'Expansão da consciência', 'Sabedoria'],
    difficulty: 'avancado',
    duration: '45-60 minutos',
    category: 'sagrado',
  },
  {
    id: 'oferecer-luz',
    name: 'Offer Light',
    namePt: 'Oferecer Luz',
    description: 'Practice of offering light to others',
    descriptionPt: 'Prática de oferecer luz aos outros',
    elements: ['luz', 'generosidade', 'compaixao'],
    orixas: ['Oluwande'],
    benefits: ['Compaixão', 'Generosidade espiritual', 'Luz compartilhada'],
    benefitsPt: ['Compaixão', 'Generosidade espiritual', 'Luz compartilhada'],
    difficulty: 'iniciante',
    duration: '10-15 minutos',
    category: 'oferenda',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPracticeById(id: string): OluwandePractice | undefined {
  return OLUWANDE_PRACTICES.find((p) => p.id === id.toLowerCase());
}

function getPracticesByElement(element: string): OluwandePractice[] {
  return OLUWANDE_PRACTICES.filter((p) => p.elements.includes(element.toLowerCase()));
}

function getPracticesByCategory(categoryId: string): OluwandePractice[] {
  return OLUWANDE_PRACTICES.filter((p) => p.category.toLowerCase() === categoryId.toLowerCase());
}

function getPracticesByDifficulty(difficulty: string): OluwandePractice[] {
  return OLUWANDE_PRACTICES.filter((p) => p.difficulty === difficulty.toLowerCase());
}

function getPracticesByOrixa(orixa: string): OluwandePractice[] {
  return OLUWANDE_PRACTICES.filter((p) => p.orixas.some((o) => o.toLowerCase() === orixa.toLowerCase()));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oluwande/data
 * Retrieve Oluwande data with optional filtering
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
        category: OLUWANDE_CATEGORIES.find((c) => c.id.toLowerCase() === category.toLowerCase()) || { id: category },
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
      data: OLUWANDE_CATEGORIES,
    });
  }

  if (type === 'practices') {
    return NextResponse.json({
      data: OLUWANDE_PRACTICES,
    });
  }

  // Default: return summary with categories and practices count
  return NextResponse.json({
    data: {
      categories: OLUWANDE_CATEGORIES,
      practices: OLUWANDE_PRACTICES,
      summary: {
        totalCategories: OLUWANDE_CATEGORIES.length,
        totalPractices: OLUWANDE_PRACTICES.length,
        byDifficulty: {
          iniciante: OLUWANDE_PRACTICES.filter((p) => p.difficulty === 'iniciante').length,
          intermediario: OLUWANDE_PRACTICES.filter((p) => p.difficulty === 'intermediario').length,
          avancado: OLUWANDE_PRACTICES.filter((p) => p.difficulty === 'avancado').length,
          mestre: OLUWANDE_PRACTICES.filter((p) => p.difficulty === 'mestre').length,
        },
      },
    },
  });
}