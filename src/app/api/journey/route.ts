import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const JourneyQuerySchema = z.object({
  completed: z.string().optional(),
  milestoneId: z.string().optional(),
  action: z.enum(['progress', 'milestones', 'complete']).optional(),
});
const MarkMilestoneSchema = z.object({
  id: z.string(),
  completed: z.boolean().optional(),
});
const JourneyBodySchema = z.object({
  markMilestone: MarkMilestoneSchema.optional(),
  trackEvent: z.object({
    type: z.string(),
  }).optional(),
});
// ============================================================
// TYPES
// ============================================================
type MilestoneCategory = 'prática' | 'conhecimento' | 'transformação'
interface Milestone {
  id: string
  title: string
  category: MilestoneCategory
  completedAt?: string
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

// ============================================================
// STORAGE KEYS
// ============================================================

const JOUKEY = 'journey_state'

// ============================================================
// MILESTONE DEFINITIONS
// ============================================================

const MILESTONE_DEFS = [
  // Prática
  { id: 'p1', title: 'Primeiro Ritual', description: 'Complete seu primeiro ritual sagrado', category: 'prática' as MilestoneCategory },
  { id: 'p2', title: 'Disciplina Diária', description: 'Pratique por 7 dias consecutivos', category: 'prática' as MilestoneCategory },
  { id: 'p3', title: 'Mestre dos Elementos', description: 'Realize rituais dos 4 elementos', category: 'prática' as MilestoneCategory },
  { id: 'p4', title: 'Guardião do Fogo', description: 'Acenda 30 velas em rituais', category: 'prática' as MilestoneCategory },
  { id: 'p5', title: 'Filho das Águas', description: 'Realize 15 banhos ritualísticos', category: 'prática' as MilestoneCategory },

  // Conhecimento
  { id: 'c1', title: 'Iniciando no Merindilogun', description: 'Estude os 16 Odús do destino', category: 'conhecimento' as MilestoneCategory },
  { id: 'c2', title: 'Caminho das Sephiroth', description: 'Explore as 10 Sephiroth da Árvore da Vida', category: 'conhecimento' as MilestoneCategory },
  { id: 'c3', title: 'Arquétipos em Foco', description: 'Estude 7 Orixás em profundidade', category: 'conhecimento' as MilestoneCategory },
  { id: 'c4', title: 'Sabedoria Antiga', description: 'Leia 5 textos sobre tradição ocultista', category: 'conhecimento' as MilestoneCategory },
  { id: 'c5', title: 'Mapa Interior', description: 'Complete sua primeira análise de mapa natal', category: 'conhecimento' as MilestoneCategory },

  // Transformação
  { id: 't1', title: 'Despertar', description: 'Tenha sua primeira visão ou sonho premonitório', category: 'transformação' as MilestoneCategory },
  { id: 't2', title: 'Transmutação', description: 'Supere um padrão negativo identificado', category: 'transformação' as MilestoneCategory },
  { id: 't3', title: 'Alinhamento', description: 'Realize um ritual de alinhamento cósmico', category: 'transformação' as MilestoneCategory },
  { id: 't4', title: 'Renascimento', description: 'Complete um ciclo completo de 40 dias', category: 'transformação' as MilestoneCategory },
  { id: 't5', title: 'Iluminação', description: 'Alcance harmonia entre todos os chakras', category: 'transformação' as MilestoneCategory },
]

// ============================================================
// STORAGE HELPERS (Server-side simulation via header hints)
// ============================================================

function getMilestoneWithProgress(id: string): Milestone {
  const def = MILESTONE_DEFS.find(m => m.id === id)
  return def ? { ...def } : { id, title: id, description: '', category: 'prática' }
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

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Collect milestones from the completed parameter if provided
    const url = new URL(request.url)
    const completedParam = url.searchParams.get('completed')
    const completedIds = completedParam 
      ? completedParam.split(',').filter(Boolean) 
      : []

    const milestones: Milestone[] = MILESTONE_DEFS.map(def => ({
      ...def,
      completedAt: completedIds.includes(def.id) 
        ? new Date().toISOString() 
        : undefined,
    }))

    const progress = calculateProgress(milestones)

    const state: JourneyState = {
      progress,
      milestones,
    }

    return NextResponse.json(state)
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve journey data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support for marking milestones complete
    if (body.markMilestone) {
      const { id, completed } = body.markMilestone
      if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid milestone id' }, { status: 400 })
      }
      
      const milestone = MILESTONE_DEFS.find(m => m.id === id)
      if (!milestone) {
        return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
      }
      
      const updatedMilestone: Milestone = {
        ...milestone,
        completedAt: completed ? new Date().toISOString() : undefined,
      }
      
      return NextResponse.json({ 
        success: true, 
        milestone: updatedMilestone,
        message: completed 
          ? `Milestone "${milestone.title}" completed` 
          : `Milestone "${milestone.title}" unmarked`,
      }, { status: 200 })
    }
    
    // Support for updating progress
    if (body.updateProgress) {
      const { totalPoints } = body.updateProgress
      
      return NextResponse.json({
        success: true,
        message: 'Progress updated',
        progress: {
          totalPoints: typeof totalPoints === 'number' ? totalPoints : 0,
          lastUpdated: new Date().toISOString(),
        },
      }, { status: 200 })
    }
    
    // Generic body passthrough for flexibility
    return NextResponse.json({
      success: true,
      received: body,
      message: 'Journey data received',
    }, { status: 201 })
    
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
