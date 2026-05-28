// ============================================================
// OYANDA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Oyanda spiritual data
// - Oyanda orixá wisdom and practices
// - Spiritual enlightenment traditions
// - Path of divine connection
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const oyandaData: any = {};

// ============================================================
// TYPES
// ============================================================

export interface OyandaPractice {
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

export interface OyandaCategory {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  icon: string;
}

// ============================================================
// OYANDA DATA
// ============================================================

const OYANDA_CATEGORIES: OyandaCategory[] = [
  {
    id: 'oracao',
    name: 'Prayer',
    namePt: 'Oração',
    description: 'Sacred prayers and invocations for Oyanda',
    descriptionPt: 'Orações sagradas e invocações para Oyanda',
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

const OYANDA_PRACTICES: OyandaPractice[] = [
  {
    id: 'prece-oyanda',
    name: 'Oyanda Prayer',
    namePt: 'Prece a Oyanda',
    description: 'Sacred prayer invoking the divine light of Oyanda',
    descriptionPt: 'Oração sagrada invocando a luz divina de Oyanda',
    elements: ['luz', 'divino', 'purificacao'],
    orixas: ['Oyanda'],
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
    orixas: ['Oyanda'],
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
    orixas: ['Oyanda'],
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
    description: 'Offering of light to honor Oyanda',
    descriptionPt: 'Oferenda de luz para honrar Oyanda',
    elements: ['luz', 'honra', 'gratidao'],
    orixas: ['Oyanda'],
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
    orixas: ['Oyanda'],
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
    orixas: ['Oyanda'],
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
    orixas: ['Oyanda'],
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
    orixas: ['Oyanda'],
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
    orixas: ['Oyanda'],
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
    orixas: ['Oyanda'],
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

function getPracticeById(id: string): OyandaPractice | undefined {
  return OYANDA_PRACTICES.find((p) => p.id === id.toLowerCase());
}

function getPracticesByElement(element: string): OyandaPractice[] {
  return OYANDA_PRACTICES.filter((p) => p.elements.includes(element.toLowerCase()));
}

function getPracticesByCategory(categoryId: string): OyandaPractice[] {
  return OYANDA_PRACTICES.filter((p) => p.category.toLowerCase() === categoryId.toLowerCase());
}

function getPracticesByDifficulty(difficulty: string): OyandaPractice[] {
  return OYANDA_PRACTICES.filter((p) => p.difficulty === difficulty.toLowerCase());
}

function getPracticesByOrixa(orixa: string): OyandaPractice[] {
  return OYANDA_PRACTICES.filter((p) => p.orixas.some((o) => o.toLowerCase() === orixa.toLowerCase()));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/oyanda/data
 * Retrieve Oyanda data with optional filtering
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
        category: OYANDA_CATEGORIES.find((c) => c.id.toLowerCase() === category.toLowerCase()) || { id: category },
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

  // Return based on type
  switch (type) {
    case 'full':
      return NextResponse.json({
        data: {
          categories: OYANDA_CATEGORIES,
          practices: OYANDA_PRACTICES,
        },
      });

    case 'categories':
      return NextResponse.json({ data: OYANDA_CATEGORIES });

    case 'practices':
      return NextResponse.json({ data: OYANDA_PRACTICES });

    case 'summary':
    default:
      return NextResponse.json({
        data: {
          name: 'Oyanda',
          description: 'Divine Light and Sacred Wisdom',
          descriptionPt: 'Luz Divina e Sabedoria Sagrada',
          categories: OYANDA_CATEGORIES.length,
          practices: OYANDA_PRACTICES.length,
          elements: Array.from(new Set(OYANDA_PRACTICES.flatMap((p) => p.elements))),
          orixas: Array.from(new Set(OYANDA_PRACTICES.flatMap((p) => p.orixas))),
        },
      });
  }
}
