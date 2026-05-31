import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const JourneyTypeSchema = z.enum([
  'awakening',
  'shadow_work',
  'initiation',
  'integration',
  'ancestral_healing',
  'orixa_encounter',
]);
const JourneyPhaseSchema = z.enum(['preparation', 'active', 'integration', 'completed']);
const JourneyQuerySchema = z.object({
  userId: z.string().optional(),
  type: JourneyTypeSchema.optional(),
  phase: JourneyPhaseSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
const CreateJourneySchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  type: JourneyTypeSchema,
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  orixa: z.string().optional(),
  phase: JourneyPhaseSchema.optional().default('preparation'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  keyInsights: z.array(z.string()).optional(),
  practices: z.array(z.string()).optional(),
});
// GET /api/mystical-journey - Retrieve mystical journey entries
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = JourneyQuerySchema.safeParse({
      userId: searchParams.get('userId'),
      type: searchParams.get('type'),
      phase: searchParams.get('phase'),
      limit: searchParams.get('limit'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { userId, type, phase, limit } = parseResult.data;
    // Return journey guidance based on type
    const journeyGuidance: Record<string, { practices: string[]; symbols: string[] }> = {
      awakening: {
        practices: ['Meditação profunda', 'Journaling espiritual', 'Respiração holotrópica'],
        symbols: ['Espelho', 'Água', 'Luz'],
      },
      shadow_work: {
        practices: ['Terapia de sombra', 'Trabalho com dreams', 'Ritual de confronto'],
        symbols: ['Espelho negro', 'Fogo', 'Shadow'],
      },
      initiation: {
        practices: ['Ritual de passagem', 'Jejum espiritual', 'Meditação isolation'],
        symbols: ['Porta', 'Fogo', 'Água'],
      },
      integration: {
        practices: ['Contemplação', 'Arte sagrada', 'Comunidade'],
        symbols: ['Círculo', 'Mandalas', 'Árvore'],
      },
      ancestral_healing: {
        practices: ['Trabalho ancestral', 'Genealogia espiritual', 'Ritual de cura'],
        symbols: ['Linhagem', 'Raízes', 'Ancestral'],
      },
      orixa_encounter: {
        practices: ['Ejulação', 'Banho de ervas', 'Oferenda', 'Meditação'],
        symbols: ['Orixá', 'Ervas sagradas', 'Vela'],
      },
    };
    return NextResponse.json({
      journeys: [],
      count: 0,
      guidance: type ? journeyGuidance[type] : null,
      filters: { userId, type, phase },
      limit: limit ?? 20,
    });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar jornada',
    }, { status: 500 });
  }
}
// POST /api/mystical-journey - Create a new mystical journey entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateJourneySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    return NextResponse.json({
      journey: {
        id: crypto.randomUUID(),
        ...parseResult.data,
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      error: 'Erro ao criar jornada',
    }, { status: 500 });
  }
}