/**
 * POST /api/admin/credits/grant
 *
 * Manually grant credits to a user. ADMIN-only.
 *
 * Body: { userId: string, amount: number, reason?: string }
 *
 * Response: { userId, newBalance, entry: CreditEntry }
 *
 * Use cases:
 * - Gabriel (the founder) wants to top up his own account to test Mentor
 *   without going through Stripe.
 * - Customer support comping credits for a refund or promotion.
 * - Signup grant failed (race condition, Prisma 7 issue) and we need to
 *   backfill manually.
 *
 * Audit trail: the grant creates a CreditEntry row with reason='admin_grant'
 * so it's queryable and countable in reconciliation reports.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/infrastructure/prisma';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

export const dynamic = 'force-dynamic';

const grantSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().int().positive().max(1000),
  reason: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  // Verifica role ADMIN
  const caller = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { role: true, email: true },
  });
  if (caller?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso restrito a ADMIN' }, { status: 403 });
  }

  // Valida body
  let body: z.infer<typeof grantSchema>;
  try {
    body = grantSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  // Confirma que o user alvo existe
  const target = await prisma.user.findUnique({
    where: { id: body.userId },
    select: { id: true, email: true },
  });
  if (!target) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  // Calcula novo saldo (somando ao ledger)
  const ledger = await prisma.creditEntry.aggregate({
    where: { userId: body.userId },
    _sum: { delta: true },
  });
  const currentBalance = ledger._sum.delta ?? 0;
  const newBalance = currentBalance + body.amount;

  // Cria a CreditEntry de grant
  const entry = await prisma.creditEntry.create({
    data: {
      userId: body.userId,
      delta: body.amount,
      reason: body.reason ?? 'admin_grant',
      balance: newBalance,
    },
  });

  return NextResponse.json({
    userId: target.id,
    email: target.email,
    grantedBy: caller.email,
    newBalance,
    entry,
  });
}
