import { prisma } from '@/lib/prisma';
import { TipoTransacao } from '@prisma/client';

export class CreditosInsuficientesError extends Error {
  constructor(
    public saldoAtual: number,
    public saldoNecessario: number
  ) {
    super(`Saldo insuficiente. Você tem ${saldoAtual} créditos, mas precisa de ${saldoNecessario}.`);
    this.name = 'CreditosInsuficientesError';
  }
}

export async function getCreditos(userId: string): Promise<number> {
  const credito = await prisma.credito.findUnique({
    where: { userId },
  });

  return credito?.saldo ?? 0;
}

export async function getCreditosCompleto(userId: string) {
  const credito = await prisma.credito.findUnique({
    where: { userId },
    include: {
      transacoes: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!credito) {
    return {
      saldo: 0,
      transacoes: [],
    };
  }

  return credito;
}

export async function adicionarCreditos(
  userId: string,
  quantidade: number,
  descricao: string
): Promise<{ novoSaldo: number }> {
  if (quantidade <= 0) {
    throw new Error('A quantidade deve ser maior que zero.');
  }

  const credito = await prisma.credito.upsert({
    where: { userId },
    update: {
      saldo: { increment: quantidade },
    },
    create: {
      userId,
      saldo: quantidade,
    },
  });

  await prisma.transacaoCredito.create({
    data: {
      creditoId: credito.id,
      tipo: TipoTransacao.CREDITO,
      quantidade,
      descricao,
    },
  });

  return { novoSaldo: credito.saldo };
}

export async function debitarCreditos(
  userId: string,
  quantidade: number,
  operacao: string
): Promise<{ novoSaldo: number }> {
  if (quantidade <= 0) {
    throw new Error('A quantidade deve ser maior que zero.');
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.credito.updateMany({
      where: { userId, saldo: { gte: quantidade } },
      data: { saldo: { decrement: quantidade } },
    });

    if (updated.count === 0) {
      const atual = await tx.credito.findUnique({
        where: { userId },
        select: { saldo: true },
      });
      throw new CreditosInsuficientesError(atual?.saldo ?? 0, quantidade);
    }

    const credito = await tx.credito.findUniqueOrThrow({
      where: { userId },
    });

    await tx.transacaoCredito.create({
      data: {
        creditoId: credito.id,
        tipo: TipoTransacao.DEBITO,
        quantidade,
        operacao,
      },
    });

    return { novoSaldo: credito.saldo };
  });
}

export async function verificarCreditos(
  userId: string,
  quantidade: number
): Promise<boolean> {
  const saldo = await getCreditos(userId);
  return saldo >= quantidade;
}

export async function usarCreditos(
  userId: string,
  quantidade: number,
  operacao: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _descricao?: string
): Promise<{ sucesso: boolean; novoSaldo?: number; erro?: string }> {
  try {
    const novoSaldo = await debitarCreditos(userId, quantidade, operacao);
    return { sucesso: true, novoSaldo: novoSaldo.novoSaldo };
  } catch (error) {
    if (error instanceof CreditosInsuficientesError) {
      return { sucesso: false, erro: error.message };
    }
    throw error;
  }
}