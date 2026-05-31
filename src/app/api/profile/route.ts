import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ProfileSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  genero: z.enum(['masculino', 'feminino', 'outro', 'prefiro_nao_dizer']).optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
  idioma: z.string().optional().default('pt-BR'),
  fusoHorario: z.string().optional(),
})
const UpdateProfileSchema = ProfileSchema.partial()
const ProfileQuerySchema = z.object({
  incluirPreferencias: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
})
// GET /api/profile — fetch current user profile
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const parseResult = ProfileQuerySchema.safeParse({
    incluirPreferencias: searchParams.get('incluirPreferencias'),
  })
  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 })
  }
  // TODO: integrate with auth session
  return NextResponse.json({
    message: 'GET /api/profile',
    incluirPreferencias: parseResult.data.incluirPreferencias,
  }, { status: 200 })
}
// POST /api/profile — create user profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = ProfileSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 })
    }
    // TODO: integrate with auth session and database
    return NextResponse.json({
      message: 'Perfil criado com sucesso',
      profile: {
        ...parseResult.data,
        id: crypto.randomUUID(),
        criadoEm: new Date().toISOString(),
      },
    }, { status: 201 })
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar perfil',
    }, { status: 500 })
  }
}
// PUT /api/profile — update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = UpdateProfileSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 })
    }
    // TODO: integrate with auth session and database
    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      profile: parseResult.data,
    }, { status: 200 })
  } catch {
    return NextResponse.json({
      error: 'Erro ao atualizar perfil',
    }, { status: 500 })
  }
}