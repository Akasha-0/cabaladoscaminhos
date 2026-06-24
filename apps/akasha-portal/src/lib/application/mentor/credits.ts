/**
 * Credits checking and deduction for Mentor API
 *
 * ADR-010 (Wave 10): Credits system NEUTRALIZED.
 *
 * Gabriel asked to disable the credit gate so he can test the app end-to-end
 * without friction. Stripe billing is deferred to a future wave when we have
 * real users. We keep:
 * - The CreditEntry schema (no migration to drop)
 * - The signup_grant (45e709df) + admin/claim routes (0fa1db66)
 * - The checkCredits/deductCredit functions (still callable, just no-op)
 *
 * To REACTIVATE the gate when Stripe arrives:
 * 1. Set CREDIT_GATE_ENABLED=true in env (or remove this constant)
 * 2. Verify the CreditEntry ledger is being populated for paying users
 * 3. Restore the original logic in checkCredits/deductCredit below
 *    (git log shows the pre-neutralization version)
 *
 * The 'balance' returned is the actual ledger sum — useful for /conta
 * display if we ever want to show "X grants received" instead of "balance".
 */
import { prisma } from '@/lib/infrastructure/prisma';

const MENTOR_CREDIT_COST = 1;

// ADR-010: feature flag for the credit gate. Set true to re-enable billing.
const CREDIT_GATE_ENABLED = false;

export async function checkCredits(userId: string): Promise<{
  hasCredits: boolean;
  balance: number;
}> {
  // ADR-010: try to read real balance for display, but never block.
  let balance = 0;
  try {
    const ledger = await prisma.creditEntry.aggregate({
      where: { userId },
      _sum: { delta: true },
    });
    balance = ledger._sum.delta ?? 0;
  } catch {
    // DB unavailable or table missing — return safe defaults.
  }

  return {
    // ADR-010: always allow while gate is disabled.
    hasCredits: !CREDIT_GATE_ENABLED || balance >= MENTOR_CREDIT_COST,
    balance,
  };
}

export async function deductCredit(userId: string): Promise<number> {
  // ADR-010: no-op while gate is disabled. Keeps the call site stable.
  if (!CREDIT_GATE_ENABLED) {
    return 999999;
  }

  // Original logic preserved for when we re-enable billing.
  const ledger = await prisma.creditEntry.aggregate({
    where: { userId },
    _sum: { delta: true },
  });

  const currentBalance = ledger._sum.delta ?? 0;
  const newBalance = currentBalance - MENTOR_CREDIT_COST;

  await prisma.creditEntry.create({
    data: {
      userId,
      delta: -MENTOR_CREDIT_COST,
      reason: 'mentor_chat',
      balance: newBalance,
    },
  });

  return newBalance;
}

export function noCreditsMessage(): string {
  return 'Você não tem créditos suficientes. Adquira mais para continuar usando o Akáshico.';
}
