/**
 * /api/admin/plans — Wave 14.3
 *
 * GET  : Lista todos os planos (ativos e inativos). ADMIN only.
 *        Resposta ordenada por sortOrder ASC, name ASC. Inclui contagem
 *        de usuários atribuídos (atribuição manual, não Stripe).
 *
 * POST : Cria novo plano. Slug `name` deve ser único + lowercase.
 *        Validação via Zod; 400 em payload inválido.
 *
 * Soft-delete via DELETE /api/admin/plans/:id (isActive=false).
 * Hard delete só via escape hatch (cascade SetNull nos users).
 *
 * Segurança: requireAkashaAdmin — 401 sem auth, 403 se não-ADMIN.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/infrastructure/prisma';
import { requireAkashaAdmin } from '@/lib/application/auth/akasha-guard';

export const dynamic = 'force-dynamic';

// ─── Schemas ─────────────────────────────────────────────────────────────

const createPlanSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_-]+$/, 'Use lowercase, números, _ ou -. Sem espaços.'),
  displayName: z.string().min(1).max(80),
  priceCents: z.number().int().min(0).max(1_000_000),
  creditsPerMonth: z.number().int().min(0).max(100_000).nullable().optional(),
  features: z.array(z.string().min(1).max(200)).max(50).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(-1000).max(1000).default(0),
});

// ─── Handlers ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = await requireAkashaAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const plans = await prisma.plan.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  return NextResponse.json({
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      priceCents: p.priceCents,
      creditsPerMonth: p.creditsPerMonth,
      features: p.features,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
      userCount: p._count.users,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAkashaAdmin(request);
  if (auth instanceof NextResponse) return auth;

  let body: z.infer<typeof createPlanSchema>;
  try {
    body = createPlanSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  try {
    const plan = await prisma.plan.create({
      data: {
        name: body.name,
        displayName: body.displayName,
        priceCents: body.priceCents,
        creditsPerMonth: body.creditsPerMonth ?? null,
        features: body.features as Prisma.InputJsonValue,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    });
    return NextResponse.json({ plan }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Já existe um plano com esse `name`.' },
        { status: 409 }
      );
    }
    throw err;
  }
}