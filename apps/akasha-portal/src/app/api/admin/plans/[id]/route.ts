/**
 * /api/admin/plans/:id — Wave 14.3
 *
 * PUT    : Atualiza plano existente. Todos os campos opcionais (partial update).
 *          404 se plano não existe. 409 se `name` duplicar outro plano.
 *
 * DELETE : Soft-delete (isActive=false). Plano continua no banco, mas
 *          some do /conta e do select de "atribuir plano" na UI admin.
 *          Hard delete intencionalmente NÃO exposto — risco de cascade.
 *          Pra deletar de vez, fazer via SQL admin.
 *
 * Segurança: requireAkashaAdmin.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/infrastructure/prisma';
import { requireAkashaAdmin } from '@/lib/application/auth/akasha-guard';

export const dynamic = 'force-dynamic';

const updatePlanSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_-]+$/)
    .optional(),
  displayName: z.string().min(1).max(80).optional(),
  priceCents: z.number().int().min(0).max(1_000_000).optional(),
  creditsPerMonth: z
    .number()
    .int()
    .min(0)
    .max(100_000)
    .nullable()
    .optional(),
  features: z.array(z.string().min(1).max(200)).max(50).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(-1000).max(1000).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAkashaAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  let body: z.infer<typeof updatePlanSchema>;
  try {
    body = updatePlanSchema.parse(await request.json());
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
    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.displayName !== undefined && { displayName: body.displayName }),
        ...(body.priceCents !== undefined && { priceCents: body.priceCents }),
        ...(body.creditsPerMonth !== undefined && {
          creditsPerMonth: body.creditsPerMonth,
        }),
        ...(body.features !== undefined && {
          features: body.features as Prisma.InputJsonValue,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });
    return NextResponse.json({ plan });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
    }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAkashaAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  // Idempotência: se já estiver inativo, retorna 200 sem efeito.
  try {
    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
    }
    if (existing.isActive) {
      await prisma.plan.update({
        where: { id },
        data: { isActive: false },
      });
    }
    return NextResponse.json({ ok: true, softDeleted: true });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
    }
    throw err;
  }
}