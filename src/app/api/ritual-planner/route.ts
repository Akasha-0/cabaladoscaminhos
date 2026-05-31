import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const RitualPlannerQuerySchema = z.object({
  orixa: z.string().optional(),
  tipo: z.enum(['harmonizacao', 'invocacao', 'oferenda', 'limpeza']).optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
})
const RitualPlannerBodySchema = z.object({
  nome: z.string().min(2, 'Nome do ritual é obrigatório'),
  orixa: z.string().min(1, 'Orixá é obrigatório'),
  tipo: z.enum(['harmonizacao', 'invocacao', 'oferenda', 'limpeza']),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  horario: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM').optional(),
  descricao: z.string().optional(),
})
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = RitualPlannerQuerySchema.safeParse({
    orixa: searchParams.get('orixa'),
    tipo: searchParams.get('tipo'),
    data: searchParams.get('data'),
  })
  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 })
  }
  return NextResponse.json({
    message: 'Ritual planner API',
    filters: parseResult.data,
    availableRituals: ['harmonizacao', 'invocacao', 'oferenda', 'limpeza'],
  })
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = RitualPlannerBodySchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 })
    }
    return NextResponse.json({
      message: 'Ritual criado com sucesso',
      ritual: {
        ...parseResult.data,
        id: crypto.randomUUID(),
        status: 'pendente',
      },
    }, { status: 201 })
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar ritual',
    }, { status: 500 })
  }
}