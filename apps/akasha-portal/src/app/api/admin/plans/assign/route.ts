/**
 * /api/admin/plans/assign — Wave 14.3
 *
 * POST { userId: string, planId: string | null }
 *
 * Atribui (ou remove) o plano de um usuário. `planId: null` zera a atribuição
 * (= volta ao FREEMIUM implícito). Diferente de Subscription.plan (que é o
 * estado Stripe-pago), User.planId é o plano ATRIBUÍDO manualmente —
 * usado para comp/gift/admin grant.
 *
 * 200 OK com o user atualizado (id, email, planId, planName).
 * 404 se user ou plan não existe.
 *
 * Segurança: requireAkashaAdmin.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/infrastructure/prisma';
import { requireAkashaAdmin } from '@/lib/application/auth/akasha-guard';

export const dynamic = 'force-dynamic';

const assignSchema = z.object({
  userId: z.string().min(1),
  // null = desatribuir (volta a FREEMIUM implícito)
  planId: z.string().min(1).nullable(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAkashaAdmin(request);
  if (auth instanceof NextResponse) return auth;

  let body: z.infer<typeof assignSchema>;
  try {
    body = assignSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  // Verifica que o user existe
  const user = await prisma.user.findUnique({
    where: { id: body.userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
  }

  // Se planId não-null, verifica que o plano existe
  if (body.planId !== null) {
    const plan = await prisma.plan.findUnique({
      where: { id: body.planId },
      select: { id: true, name: true, isActive: true },
    });
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
    }
    if (!plan.isActive) {
      return NextResponse.json(
        { error: 'Não é possível atribuir plano desativado.' },
        { status: 400 }
      );
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id: body.userId },
      data: { planId: body.planId },
      select: {
        id: true,
        email: true,
        name: true,
        planId: true,
        plan: { select: { id: true, name: true, displayName: true } },
      },
    });
    return NextResponse.json({ user: updated });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    throw err;
  }
}