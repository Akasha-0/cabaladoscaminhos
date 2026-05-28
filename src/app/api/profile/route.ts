// ============================================================
// PROFILE API - CABALA DOS CAMINHOS
// ============================================================
// GET/PUT user profile with spiritual preferences
// ============================================================

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api/base-route';
// ============================================================

const BirthDataSchema = z.object({
  dataNascimento: z.string().datetime().optional(),
  horaNascimento: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato hora inválido (HH:MM)').optional().nullable(),
  localNascimento: z.string().min(1).max(255).optional().nullable(),
});

const SpiritualPreferencesSchema = z.object({
  orixAprincipal: z.string().max(100).optional().nullable(),
  orixASecundarios: z.array(z.string().max(100)).max(5).optional(),
  caminhoCabalistico: z.enum(['caminho-do-poder', 'caminho-da-sabedoria', 'caminho-da-beleza', 'nenhum']).optional().nullable(),
  caminhoTantrico: z.enum(['shiva', 'shakti', 'uniao', 'nenhum']).optional().nullable(),
 ElementoDominante: z.enum(['fogo', 'agua', 'ar', 'terra', 'eter']).optional().nullable(),
  praticaEspiritual: z.array(z.enum(['meditacao', 'ritual', 'rezas', 'oferendas', 'yoga', 'tarot', 'astrologia'])).max(7).optional(),
});

const ProfileUpdateSchema = z.object({
  nomeCompleto: z.string().min(1).max(255).optional(),
  temaPreferido: z.enum(['mystical', 'dark', 'light', 'nature']).optional(),
  ...BirthDataSchema.shape,
  ...SpiritualPreferencesSchema.shape,
});

const ProfileResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  nomeCompleto: z.string(),
  temaPreferido: z.string(),
  dataNascimento: z.string().nullable(),
  horaNascimento: z.string().nullable(),
  localNascimento: z.string().nullable(),
  mapaNatal: z.object({
    signoSolar: z.string().nullable(),
    signoLunar: z.string().nullable(),
    ascendente: z.string().nullable(),
    numeroCabalistico: z.number().nullable(),
    numeroTantrico: z.number().nullable(),
    numeroPitagorico: z.number().nullable(),
    numeroCaldeu: z.number().nullable(),
    numeroCarmico: z.number().nullable(),
    oduPrincipal: z.string().nullable(),
    oduSecundario: z.string().nullable(),
    arcanoPessoal: z.number().nullable(),
    cartaCaminho: z.string().nullable(),
    sefirotDominante: z.string().nullable(),
  }).nullable(),
  espiritual: z.object({
    orixaPrincipal: z.string().nullable(),
    orixasSecundarios: z.array(z.string()).nullable(),
    caminhoCabalistico: z.string().nullable(),
    caminhoTantrico: z.string().nullable(),
    elementoDominante: z.string().nullable(),
    praticaEspiritual: z.array(z.string()).nullable(),
  }).nullable(),
  assinatura: z.object({
    plano: z.string(),
    status: z.string(),
    moduloPlanetas: z.boolean(),
    moduloLetras: z.boolean(),
    moduloGeometria: z.boolean(),
    moduloFrequencias: z.boolean(),
    moduloEmpresa: z.boolean(),
  }).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function buildProfileResponse(user: {
  id: string;
  email: string;
  nomeCompleto: string;
  temaPreferido: string;
  dataNascimento: Date | null;
  horaNascimento: string | null;
  localNascimento: string | null;
  mapaNatal: {
    signoSolar: string | null;
    signoLunar: string | null;
    ascendente: string | null;
    numeroCabalistico: number | null;
    numeroTantrico: number | null;
    numeroPitagorico: number | null;
    numeroCaldeu: number | null;
    numeroCarmico: number | null;
    oduPrincipal: string | null;
    oduSecundario: string | null;
    arcanoPessoal: number | null;
    cartaCaminho: string | null;
    sefirotDominante: string | null;
  } | null;
  assinatura: {
    plano: string;
    status: string;
    moduloPlanetas: boolean;
    moduloLetras: boolean;
    moduloGeometria: boolean;
    moduloFrequencias: boolean;
    moduloEmpresa: boolean;
  } | null;
  espiritual: {
    orixaPrincipal: string | null;
    orixasSecundarios: string[];
    caminhoCabalistico: string | null;
    caminhoTantrico: string | null;
    elementoDominante: string | null;
    praticaEspiritual: string[];
  } | null;
  createdAt: Date;
  updatedAt: Date;
}): ProfileResponse {
  return {
    id: user.id,
    email: user.email,
    nomeCompleto: user.nomeCompleto,
    temaPreferido: user.temaPreferido,
    dataNascimento: user.dataNascimento?.toISOString() ?? null,
    horaNascimento: user.horaNascimento,
    localNascimento: user.localNascimento,
    mapaNatal: user.mapaNatal ? {
      signoSolar: user.mapaNatal.signoSolar,
      signoLunar: user.mapaNatal.signoLunar,
      ascendente: user.mapaNatal.ascendente,
      numeroCabalistico: user.mapaNatal.numeroCabalistico,
      numeroTantrico: user.mapaNatal.numeroTantrico,
      numeroPitagorico: user.mapaNatal.numeroPitagorico,
      numeroCaldeu: user.mapaNatal.numeroCaldeu,
      numeroCarmico: user.mapaNatal.numeroCarmico,
      oduPrincipal: user.mapaNatal.oduPrincipal,
      oduSecundario: user.mapaNatal.oduSecundario,
      arcanoPessoal: user.mapaNatal.arcanoPessoal,
      cartaCaminho: user.mapaNatal.cartaCaminho,
      sefirotDominante: user.mapaNatal.sefirotDominante,
    } : null,
    espiritual: user.espiritual,
    assinatura: user.assinatura,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/profile
 * Retrieve current user's profile with spiritual preferences
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser(request);

    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        temaPreferido: true,
        dataNascimento: true,
        horaNascimento: true,
        localNascimento: true,
        mapaNatal: {
          select: {
            signoSolar: true,
            signoLunar: true,
            ascendente: true,
            numeroCabalistico: true,
            numeroTantrico: true,
            numeroPitagorico: true,
            numeroCaldeu: true,
            numeroCarmico: true,
            oduPrincipal: true,
            oduSecundario: true,
            arcanoPessoal: true,
            cartaCaminho: true,
            sefirotDominante: true,
          },
        },
        assinatura: {
          select: {
            plano: true,
            status: true,
            moduloPlanetas: true,
            moduloLetras: true,
            moduloGeometria: true,
            moduloFrequencias: true,
            moduloEmpresa: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // espiritual is not in the schema yet, pass null for now
    const response = buildProfileResponse({
      ...user,
      espiritual: null,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update current user's profile including spiritual preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthUser(request);

    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = ProfileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data as ProfileUpdate;

    // Update user profile
    const user = await prisma.user.update({
      where: { id: authResult.user.id },
      data: {
        ...(data.nomeCompleto !== undefined && { nomeCompleto: data.nomeCompleto }),
        ...(data.temaPreferido !== undefined && { temaPreferido: data.temaPreferido }),
        ...(data.dataNascimento !== undefined && { dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined }),
        ...(data.horaNascimento !== undefined && { horaNascimento: data.horaNascimento }),
        ...(data.localNascimento !== undefined && { localNascimento: data.localNascimento }),
      },
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        temaPreferido: true,
        dataNascimento: true,
        horaNascimento: true,
        localNascimento: true,
        mapaNatal: {
          select: {
            signoSolar: true,
            signoLunar: true,
            ascendente: true,
            numeroCabalistico: true,
            numeroTantrico: true,
            numeroPitagorico: true,
            numeroCaldeu: true,
            numeroCarmico: true,
            oduPrincipal: true,
            oduSecundario: true,
            arcanoPessoal: true,
            cartaCaminho: true,
            sefirotDominante: true,
          },
        },
        assinatura: {
          select: {
            plano: true,
            status: true,
            moduloPlanetas: true,
            moduloLetras: true,
            moduloGeometria: true,
            moduloFrequencias: true,
            moduloEmpresa: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    const response = buildProfileResponse({
      ...user,
      espiritual: null,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}