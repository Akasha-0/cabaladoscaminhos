// fallow-ignore-file unused-file
import { prisma } from '@/lib/prisma';

export interface CreditInfo {
  userId: string;
  balance: number;
  lastUpdated: Date | null;
}

export async function getCredits(userId: string): Promise<number> {
  const credit = await prisma.credito.findUnique({
    where: { userId },
  });

  return credit?.saldo ?? 0;
}

export async function getCreditInfo(userId: string): Promise<CreditInfo> {
  const credit = await prisma.credito.findUnique({
    where: { userId },
  });

  return {
    userId,
    balance: credit?.saldo ?? 0,
    lastUpdated: credit?.updatedAt ?? null,
  };
}

export class InsufficientCreditsError extends Error {
  constructor(
    public currentBalance: number,
    public requiredAmount: number
  ) {
    super(`Insufficient credits: have ${currentBalance}, need ${requiredAmount}`);
    this.name = 'InsufficientCreditsError';
  }
}

export async function deductCredits(
  userId: string,
  amount: number,
  operation: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const currentBalance = await getCredits(userId);

  if (currentBalance < amount) {
    return {
      success: false,
      error: `Insufficient credits: have ${currentBalance}, need ${amount}`,
    };
  }

  try {
    const credit = await prisma.credito.update({
      where: { userId },
      data: {
        saldo: { decrement: amount },
      },
    });

    await trackCreditUsage(credit.id, operation, amount);

    return { success: true, newBalance: credit.saldo };
  } catch (error) {
    console.error('Failed to deduct credits:', error);
    return { success: false, error: 'Failed to deduct credits' };
  }
}

export async function addCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ newBalance: number }> {
  const credit = await prisma.credito.upsert({
    where: { userId },
    update: {
      saldo: { increment: amount },
    },
    create: {
      userId,
      saldo: amount,
    },
  });

  await prisma.transacaoCredito.create({
    data: {
      creditoId: credit.id,
      tipo: 'CREDITO',
      quantidade: amount,
      descricao: description,
    },
  });

  return { newBalance: credit.saldo };
}

export async function trackCreditUsage(
  creditoId: string,
  operation: string,
  amount: number
): Promise<void> {
  const credito = await prisma.credito.findUnique({
    where: { id: creditoId },
  });
  
  if (!credito) return;

  await prisma.transacaoCredito.create({
    data: {
      creditoId,
      tipo: 'DEBITO',
      quantidade: amount,
      operacao: operation,
    },
  });
}