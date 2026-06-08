/**
 * Reconciliação LLM × Créditos — Doc 25 §8
 *
 * Detecta discrepâncias entre o `creditCost` esperado (somatório das mensagens
 * da consulta) e o `delta` total de `creditEntry` correspondente.
 *
 * Casos:
 * - Match: nada a fazer
 * - Over-debit (delta mais negativo): devolve automaticamente a diferença
 * - Under-debit (delta menos negativo): marca para revisão manual
 *
 * Roda sob demanda via painel admin ou como job (cron semanal).
 */

import { prisma } from '@/lib/infrastructure/prisma';

export interface ReconciliationDiscrepancy {
  userId: string;
  consultationId: string;
  debitado: number;
  esperado: number;
  acao: 'devolver' | 'debitar_diferenca';
}

export interface ReconciliationReport {
  totalConsultas: number;
  totalDebitos: number;
  totalCreditosDevolvidos: number;
  discrepancias: ReconciliationDiscrepancy[];
}

/**
 * Reconcilia créditos de consultas recentes.
 * Janela padrão: últimas 24h.
 */
export async function reconcileCredits(opts: { since?: Date } = {}): Promise<ReconciliationReport> {
  const since = opts.since ?? new Date(Date.now() - 24 * 60 * 60 * 1000);

  const consultations = await prisma.consultation.findMany({
    where: { createdAt: { gte: since } },
    select: { id: true, userId: true, createdAt: true },
  });

  const report: ReconciliationReport = {
    totalConsultas: consultations.length,
    totalDebitos: 0,
    totalCreditosDevolvidos: 0,
    discrepancias: [],
  };

  for (const consult of consultations) {
    // 1. creditCost esperado = soma de creditCost das mensagens da consulta
    const messages = await prisma.chatMessage.findMany({
      where: { consultationId: consult.id },
      select: { creditCost: true },
    });
    const expectedCost = messages.reduce((sum, m) => sum + m.creditCost, 0);
    if (expectedCost === 0) continue;

    // 2. delta debitado = soma de creditEntry com reason consult_* próximos da criação
    const windowStart = new Date(consult.createdAt.getTime() - 60_000); // 1 min antes
    const windowEnd = new Date(consult.createdAt.getTime() + 5_000);
    const entries = await prisma.creditEntry.findMany({
      where: {
        userId: consult.userId,
        reason: { in: ['consult_simple', 'consult_complex'] },
        createdAt: { gte: windowStart, lte: windowEnd },
      },
      select: { id: true, delta: true, reason: true },
    });
    const totalDebitado = entries.reduce((sum, e) => sum + e.delta, 0);
    const expectedDelta = -expectedCost;
    report.totalDebitos += Math.abs(totalDebitado);

    if (totalDebitado === expectedDelta) continue;

    if (totalDebitado < expectedDelta) {
      // over-debit: devolve a diferença (positivo)
      const refund = expectedDelta - totalDebitado;
      report.totalCreditosDevolvidos += refund;
      report.discrepancias.push({
        userId: consult.userId,
        consultationId: consult.id,
        debitado: totalDebitado,
        esperado: expectedDelta,
        acao: 'devolver',
      });

      // Calcula novo balance — soma todos os deltas anteriores do user
      const lastEntry = await prisma.creditEntry.findFirst({
        where: { userId: consult.userId },
        orderBy: { createdAt: 'desc' },
        select: { balance: true },
      });
      const newBalance = (lastEntry?.balance ?? 0) + refund;

      await prisma.creditEntry.create({
        data: {
          userId: consult.userId,
          delta: refund,
          reason: 'reconciliation_refund',
          balance: newBalance,
        },
      });
    } else {
      // under-debit: revisão manual necessária
      report.discrepancias.push({
        userId: consult.userId,
        consultationId: consult.id,
        debitado: totalDebitado,
        esperado: expectedDelta,
        acao: 'debitar_diferenca',
      });
    }
  }

  return report;
}
