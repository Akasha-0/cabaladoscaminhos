/**
 * POST /api/akasha/credits/claim-signup-bonus
 *
 * Self-service: any authenticated user can claim the 10-credit signup
 * bonus once if they have never received a 'signup_grant' entry.
 *
 * Use case: user signed up BEFORE the signup_grant feature shipped (commit
 * 45e709df). They get one retroactive grant so they can test the Mentor.
 *
 * Idempotency: if a CreditEntry with reason='signup_grant' already exists
 * for the user, returns 409 Conflict.
 *
 * Trade-off accepted: this is a one-shot backfill, not a recurring
 * promotion. After Wave 10 Stripe integration, the canonical signup flow
 * is the only grant path; this route can stay for support / testing.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

export const dynamic = 'force-dynamic';

const SIGNUP_GRANT_CREDITS = 10;

export async function POST(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  // Já recebeu? → 409
  const existing = await prisma.creditEntry.findFirst({
    where: { userId: auth.id, reason: 'signup_grant' },
    select: { id: true, balance: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: 'Bônus de cadastro já foi resgatado anteriormente.',
        existingEntry: existing,
      },
      { status: 409 }
    );
  }

  // Calcula saldo atual
  const ledger = await prisma.creditEntry.aggregate({
    where: { userId: auth.id },
    _sum: { delta: true },
  });
  const currentBalance = ledger._sum.delta ?? 0;
  const newBalance = currentBalance + SIGNUP_GRANT_CREDITS;

  const entry = await prisma.creditEntry.create({
    data: {
      userId: auth.id,
      delta: SIGNUP_GRANT_CREDITS,
      reason: 'signup_grant',
      balance: newBalance,
    },
  });

  return NextResponse.json({
    message: 'Bônus de cadastro resgatado com sucesso.',
    userId: auth.id,
    granted: SIGNUP_GRANT_CREDITS,
    newBalance,
    entry,
  });
}
