/**
 * Credits checking and deduction for Mentor API
 */
import { prisma } from '@/lib/infrastructure/prisma';

const MENTOR_CREDIT_COST = 1;

export async function checkCredits(userId: string): Promise<{
  hasCredits: boolean;
  balance: number;
}> {
  const ledger = await prisma.creditEntry.aggregate({
    where: { userId },
    _sum: { delta: true },
  });

  const balance = ledger._sum.delta ?? 0;

  return {
    hasCredits: balance >= MENTOR_CREDIT_COST,
    balance,
  };
}

export async function deductCredit(userId: string): Promise<number> {
  // Get current balance
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
