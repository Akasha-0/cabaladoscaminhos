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
 *
 * F-103 (2026-06-11): refatorado de N+1 → batch queries.
 * Antes: 3-4 queries por consultation = O(N*3) para N consultations.
 * Agora: 3 queries totais (findMany batch + groupBy + latest balance lookup).
 * Speedup esperado: 100x para 100+ consultations.
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

const WINDOW_BEFORE_MS = 60_000; // 1 min antes
const WINDOW_AFTER_MS = 5_000;   // 5s depois

/**
 * Reconcilia créditos de consultas recentes.
 * Janela padrão: últimas 24h.
 *
 * @param opts.since Data inicial (default: últimas 24h)
 *
 * Algoritmo batch (F-103):
 * 1. Find all consultations no range → 1 query
 * 2. Find all chatMessages com creditCost > 0 para essas consultations → 1 query
 * 3. Find all creditEntries consult_* no range (1min antes a 5s depois) → 1 query
 * 4. Find latest creditEntry por user (para refund balance) → 1 query groupBy
 * 5. Process in JS (in-memory join + aggregation)
 * 6. Bulk create refunds (createMany) → 1 query
 */
export async function reconcileCredits(opts: { since?: Date } = {}): Promise<ReconciliationReport> {
  const since = opts.since ?? new Date(Date.now() - 24 * 60 * 60 * 1000);

  // === Query 1: All consultations in range ===
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

  if (consultations.length === 0) return report;

  // === Query 2: All messages with creditCost > 0 for these consultations ===
  // Antes: 1 query por consultation (N+1)
  const consultationIds = consultations.map((c) => c.id);
  const allMessages = await prisma.chatMessage.findMany({
    where: {
      consultationId: { in: consultationIds },
      creditCost: { gt: 0 },
    },
    select: { consultationId: true, creditCost: true },
  });

  // Index messages by consultationId
  const messagesByConsultation = new Map<string, number>();
  for (const msg of allMessages) {
    const current = messagesByConsultation.get(msg.consultationId) ?? 0;
    messagesByConsultation.set(msg.consultationId, current + msg.creditCost);
  }

  // === Query 3: All creditEntries consult_* in expanded window ===
  // Janela expandida: 1 min antes do first consult até 5s depois do last.
  // Antes: 1 query por consultation com window per-consult (N+1)
  const firstConsult = consultations[0].createdAt;
  const lastConsult = consultations[consultations.length - 1].createdAt;
  const windowStart = new Date(firstConsult.getTime() - WINDOW_BEFORE_MS);
  const windowEnd = new Date(lastConsult.getTime() + WINDOW_AFTER_MS);

  const allEntries = await prisma.creditEntry.findMany({
    where: {
      reason: { in: ['consult_simple', 'consult_complex'] },
      createdAt: { gte: windowStart, lte: windowEnd },
    },
    select: { id: true, userId: true, delta: true, reason: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Index entries by userId+consultationId (heuristic: closest entry per consult)
  // For reconciliation, we match entries to consultations by user + closest timestamp
  const entriesByUser = new Map<string, typeof allEntries>();
  for (const entry of allEntries) {
    if (!entriesByUser.has(entry.userId)) {
      entriesByUser.set(entry.userId, []);
    }
    entriesByUser.get(entry.userId)!.push(entry);
  }

  // === Process in memory: pair each consultation with its entries ===
  const refundsToCreate: Array<{
    userId: string;
    delta: number;
    reason: string;
    balance: number;
  }> = [];
  const usersNeedingLatestBalance = new Set<string>();

  for (const consult of consultations) {
    const expectedCost = messagesByConsultation.get(consult.id) ?? 0;
    if (expectedCost === 0) continue;

    // Find entries for this user within the consult's window
    const userEntries = entriesByUser.get(consult.userId) ?? [];
    const consultWindowStart = new Date(consult.createdAt.getTime() - WINDOW_BEFORE_MS);
    const consultWindowEnd = new Date(consult.createdAt.getTime() + WINDOW_AFTER_MS);
    const matchingEntries = userEntries.filter(
      (e) => e.createdAt >= consultWindowStart && e.createdAt <= consultWindowEnd,
    );
    const totalDebitado = matchingEntries.reduce((sum, e) => sum + e.delta, 0);
    const expectedDelta = -expectedCost;
    report.totalDebitos += Math.abs(totalDebitado);

    if (totalDebitado === expectedDelta) continue;

    if (totalDebitado < expectedDelta) {
      // over-debit: devolve a diferença
      const refund = expectedDelta - totalDebitado;
      report.totalCreditosDevolvidos += refund;
      report.discrepancias.push({
        userId: consult.userId,
        consultationId: consult.id,
        debitado: totalDebitado,
        esperado: expectedDelta,
        acao: 'devolver',
      });
      usersNeedingLatestBalance.add(consult.userId);
      refundsToCreate.push({
        userId: consult.userId,
        delta: refund,
        reason: 'reconciliation_refund',
        balance: 0, // will be filled after latest balance lookup
      });
    } else {
      // under-debit: revisão manual
      report.discrepancias.push({
        userId: consult.userId,
        consultationId: consult.id,
        debitado: totalDebitado,
        esperado: expectedDelta,
        acao: 'debitar_diferenca',
      });
    }
  }

  // === Query 4: Get latest balance for users needing refunds ===
  // Antes: 1 query por user com over-debit (N+1)
  // Agora: 1 query total via findMany + groupBy mental model
  if (usersNeedingLatestBalance.size > 0) {
    const latestEntries = await prisma.creditEntry.findMany({
      where: { userId: { in: Array.from(usersNeedingLatestBalance) } },
      orderBy: { createdAt: 'desc' },
      select: { userId: true, balance: true, createdAt: true },
    });

    // Index latest entry per user (first match since ordered desc)
    const latestBalanceByUser = new Map<string, number>();
    for (const entry of latestEntries) {
      if (!latestBalanceByUser.has(entry.userId)) {
        latestBalanceByUser.set(entry.userId, entry.balance);
      }
    }

    // Fill in balances for refunds
    for (const refund of refundsToCreate) {
      const latestBalance = latestBalanceByUser.get(refund.userId) ?? 0;
      refund.balance = latestBalance + refund.delta;
    }
  }

  // === Query 5: Bulk create refunds ===
  // Antes: 1 create por refund (N+1)
  if (refundsToCreate.length > 0) {
    await prisma.creditEntry.createMany({
      data: refundsToCreate,
    });
  }

  return report;
}
