import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
])
const ChakraSchema = z.coerce.number().int().min(1).max(7)
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter'])

const JourneyQuerySchema = z.object({
  completed: z.string().optional(),
  milestoneId: z.string().optional(),
  action: z.enum(['progress', 'milestones', 'complete']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  category: z.enum(['prática', 'conhecimento', 'transformação']).optional(),
})

const MarkMilestoneSchema = z.object({
  id: z.string(),
  completed: z.boolean().optional(),
})

const JourneyBodySchema = z.object({
  markMilestone: MarkMilestoneSchema.optional(),
  trackEvent: z.object({
    type: z.string(),
  }).optional(),
})

// ─── Type Definitions ──────────────────────────────────────────────────────────
type MilestoneCategory = 'prática' | 'conhecimento' | 'transformação'

interface Milestone {
  id: string
  title: string
  category: MilestoneCategory
  completedAt?: string
  sefirot: string[]
  chakra: number
  element: string
  orixa: string
  affirmation: string
}

interface JourneyProgress {
  totalPoints: number
  completedMilestones: number
  totalMilestones: number
  lastUpdated: string
}

interface JourneyState {
  progress: JourneyProgress
  milestones: Milestone[]
}

// ─── Storage Keys ──────────────────────────────────────────────────────────
const JOUKEY = 'journey_state'

// ─── Milestone Definitions with Spiritual Correlations ──────────────────────────────────────────
const MILESTONE_DEFS: Milestone[] = [
  // Prática
  {
    id: 'p1',
    title: 'Primeiro Ritual',
    category: 'prática',
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'Eu sou um canal de luz sagrada',
  },
  {
    id: 'p2',
    title: 'Disciplina Diária',
    category: 'prática',
    sefirot: ['Gevurah', 'Hod'],
    chakra: 3,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Minha disciplina fortalece minha prática',
 },
  {
    id: 'p3',
    title: 'Mestre dos Elementos',
    category: 'prática',
    sefirot: ['Malkuth', 'Chokhmah'],
    chakra: 5,
    element: 'Éter',
    orixa: 'Orunmilá',
    affirmation: 'Domino a energia dos quatro elementos',
  },
  {
    id: 'p4',
    title: 'Guardião do Fogo',
    category: 'prática',
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'A chama sagrada ilumina meu caminho',
  },
  {
    id: 'p5',
    title: 'Filho das Águas',
    category: 'prática',
    sefirot: ['Yesod', 'Binah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'As águas sagradas me purificam e renovam',
  },

  // Conhecimento
  {
    id: 'c1',
    title: 'Iniciando no Merindilogun',
    category: 'conhecimento',
    sefirot: ['Chokhmah', 'Hod'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'A sabedoria dos Odús guia meus passos',
  },
  {
    id: 'c2',
    title: 'Caminho das Sephiroth',
    category: 'conhecimento',
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Caminho pela Árvore da Vida com clareza',
  },
  {
    id: 'c3',
    title: 'Arquétipos em Foco',
    category: 'conhecimento',
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Compreendo a essência de cada Orixá',
  },
  {
    id: 'c4',
    title: 'Sabedoria Antiga',
    category: 'conhecimento',
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'A sabedoria antiga me ilumina',
  },
  {
    id: 'c5',
    title: 'Mapa Interior',
    category: 'conhecimento',
    sefirot: ['Yesod', 'Tipheret'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Compreendo meu mapa cósmico com clareza',
  },

  // Transformação
  {
    id: 't1',
    title: 'Despertar',
    category: 'transformação',
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'Desperto para a verdade interior',
 },
  {
    id: 't2',
    title: 'Transmutação',
    category: 'transformação',
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Transmuto energia densa em luz',
 },
  {
    id: 't3',
    title: 'Alinhamento',
    category: 'transformação',
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Estou alinhado com o cosmos sagrado',
  },
  {
    id: 't4',
    title: 'Renascimento',
    category: 'transformação',
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Renasco renovado a cada ciclo',
 },
  {
    id: 't5',
    title: 'Iluminação',
    category: 'transformação',
    sefirot: ['Kether', 'Tipheret', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Meus chakras irradiam luz harmoniosa',
  },
]

// ─── Storage Helpers ──────────────────────────────────────────────────────────
function getMilestoneWithProgress(id: string): Milestone {
  const def = MILESTONE_DEFS.find(m => m.id === id)
  return def ? { ...def } : { id, title: id, category: 'prática', sefirot: [], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: '' }
}

function calculateProgress(milestones: Milestone[]): JourneyProgress {
  const completed = milestones.filter(m => m.completedAt).length
  const totalPoints = completed * 100
  const total = MILESTONE_DEFS.length
  
  return {
    totalPoints,
    completedMilestones: completed,
    totalMilestones: total,
    lastUpdated: new Date().toISOString(),
  }
}

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const parseResult = JourneyQuerySchema.safeParse({
      completed: url.searchParams.get('completed'),
      milestoneId: url.searchParams.get('milestoneId'),
      action: url.searchParams.get('action'),
      sefirot: url.searchParams.get('sefirot'),
      chakra: url.searchParams.get('chakra'),
      element: url.searchParams.get('element'),
      category: url.searchParams.get('category'),
    })

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const { completed, milestoneId, action, sefirot, chakra, element, category } = parseResult.data

    let milestones = [...MILESTONE_DEFS]

    // Filter by spiritual correlations
    if (sefirot) {
      milestones = milestones.filter(m => m.sefirot.includes(sefirot))
    }
    if (chakra) {
      milestones = milestones.filter(m => m.chakra === chakra)
    }
    if (element) {
      milestones = milestones.filter(m => m.element === element)
    }
    if (category) {
      milestones = milestones.filter(m => m.category === category)
    }

    // Statistics
    const stats = {
      byCategory: MILESTONE_DEFS.reduce((acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byElement: MILESTONE_DEFS.reduce((acc, m) => {
        acc[m.element] = (acc[m.element] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byChakra: MILESTONE_DEFS.reduce((acc, m) => {
        acc[m.chakra] = (acc[m.chakra] || 0) + 1
        return acc
      }, {} as Record<number, number>),
      bySefirot: MILESTONE_DEFS.reduce((acc, m) => {
        m.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>),
      byOrixa: MILESTONE_DEFS.reduce((acc, m) => {
        acc[m.orixa] = (acc[m.orixa] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      totalMilestones: MILESTONE_DEFS.length,
    }

    switch (action) {
      case 'progress': {
        const progress = calculateProgress(milestones)
        return NextResponse.json({
          success: true,
          progress,
          stats,
        })
      }
      case 'milestones': {
        return NextResponse.json({
          success: true,
          milestones,
          total: milestones.length,
          stats,
        })
      }
      case 'complete': {
        if (!milestoneId) {
          return NextResponse.json({
            success: false,
            error: 'milestoneId é obrigatório',
          }, { status: 400 })
        }
        const milestone = getMilestoneWithProgress(milestoneId)
        return NextResponse.json({
          success: true,
          milestone: { ...milestone, completedAt: new Date().toISOString() },
        })
      }
      default: {
        const progress = calculateProgress(milestones)
        return NextResponse.json({
          success: true,
          progress,
          milestones,
          stats,
        })
      }
    }
  } catch (error) {
    const err = error as Error
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 })
  }
}