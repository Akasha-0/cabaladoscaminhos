import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// ============================================================
// GET /api/user/profile — Return user profile data
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Ignore errors in read-only context
            }
          },
        },
      }
    )

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { supabaseUserId: authUser.id },
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        dataNascimento: true,
        horaNascimento: true,
        localNascimento: true,
        temaPreferido: true,
        planoAssinatura: true,
        createdAt: true,
        updatedAt: true,
        mapaNatal: {
          select: {
            signoSolar: true,
            signoLunar: true,
            ascendente: true,
            numeroCabalistico: true,
            numeroTantrico: true,
            numeroPitagorico: true,
            numeroCaldeu: true,
            oduPrincipal: true,
            oduSecundario: true,
          },
        },
        assinatura: {
          select: {
            plano: true,
            status: true,
            dataInicio: true,
            dataProximoCobro: true,
            moduloPlanetas: true,
            moduloLetras: true,
            moduloGeometria: true,
            moduloFrequencias: true,
            moduloEmpresa: true,
          },
        },
        credito: {
          select: {
            saldo: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (err) {
    console.error('[API /user/profile GET]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// ============================================================
// PUT /api/user/profile — Update user profile
// ============================================================
// fallow-ignore-next-line complexity
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Ignore errors in read-only context
            }
          },
        },
      }
    )

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()

    // Allowed fields for update
    const {
      nomeCompleto,
      dataNascimento,
      horaNascimento,
      localNascimento,
      temaPreferido,
    } = body

    const updateData: Record<string, unknown> = {}

    if (nomeCompleto !== undefined) {
      if (typeof nomeCompleto !== 'string' || nomeCompleto.trim().length === 0) {
        return NextResponse.json({ error: 'nomeCompleto deve ser uma string não vazia' }, { status: 400 })
      }
      updateData.nomeCompleto = nomeCompleto.trim()
    }

    if (dataNascimento !== undefined) {
      if (typeof dataNascimento !== 'string') {
        return NextResponse.json({ error: 'dataNascimento deve ser uma string ISO' }, { status: 400 })
      }
      const parsed = new Date(dataNascimento)
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'dataNascimento inválida' }, { status: 400 })
      }
      updateData.dataNascimento = parsed
    }

    if (horaNascimento !== undefined) {
      if (typeof horaNascimento !== 'string') {
        return NextResponse.json({ error: 'horaNascimento deve ser uma string' }, { status: 400 })
      }
      updateData.horaNascimento = horaNascimento.trim()
    }

    if (localNascimento !== undefined) {
      if (typeof localNascimento !== 'string') {
        return NextResponse.json({ error: 'localNascimento deve ser uma string' }, { status: 400 })
      }
      updateData.localNascimento = localNascimento.trim()
    }

    if (temaPreferido !== undefined) {
      if (typeof temaPreferido !== 'string') {
        return NextResponse.json({ error: 'temaPreferido deve ser uma string' }, { status: 400 })
      }
      updateData.temaPreferido = temaPreferido.trim()
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { supabaseUserId: authUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        dataNascimento: true,
        horaNascimento: true,
        localNascimento: true,
        temaPreferido: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ profile: updated }, { status: 200 })
  } catch (err) {
    console.error('[API /user/profile PUT]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// ============================================================
// PATCH /api/user/profile — Partial update (alias for PUT)
// ============================================================
export async function PATCH(request: NextRequest) {
  // PATCH behaves identically to PUT for this resource
  return PUT(request)
}
