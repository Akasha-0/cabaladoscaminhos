// Testes unitários para credit-reconciliation.ts (Wave 11.2).
//
// Cobre o algoritmo batch (F-103):
// - Janela padrão 24h vs custom
// - Match (delta == esperado) → nada a fazer
// - Over-debit (delta mais negativo) → refund automático
// - Under-debit (delta menos negativo) → marcar para revisão
// - Consultation sem mensagens com creditCost → skip
// - Cálculo correto de balance após refund
//
// Algoritmo usa 5 queries Prisma (findMany batch + groupBy mental + createMany).
// Mockamos TODAS essas chamadas para validar lógica em isolamento.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockConsultationFindMany = vi.fn();
const mockChatMessageFindMany = vi.fn();
const mockCreditEntryFindMany = vi.fn();
const mockCreditEntryCreateMany = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    consultation: { findMany: mockConsultationFindMany },
    chatMessage: { findMany: mockChatMessageFindMany },
    creditEntry: {
      findMany: mockCreditEntryFindMany,
      createMany: mockCreditEntryCreateMany,
    },
  },
}));

async function loadModule() {
  vi.resetModules();
  return import('./credit-reconciliation');
}

beforeEach(() => {
  mockConsultationFindMany.mockReset();
  mockChatMessageFindMany.mockReset();
  mockCreditEntryFindMany.mockReset();
  mockCreditEntryCreateMany.mockReset();

  // Default: empty state.
  mockConsultationFindMany.mockResolvedValue([]);
  mockChatMessageFindMany.mockResolvedValue([]);
  mockCreditEntryFindMany.mockResolvedValue([]);
  mockCreditEntryCreateMany.mockResolvedValue({ count: 0 });
});

describe('reconcileCredits() — happy paths', () => {
  it('retorna relatório zerado quando não há consultas', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([]);

    const { reconcileCredits } = await loadModule();
    const report = await reconcileCredits();

    expect(report).toEqual({
      totalConsultas: 0,
      totalDebitos: 0,
      totalCreditosDevolvidos: 0,
      discrepancias: [],
    });

    // Sem consultas, não deve chamar queries subsequentes.
    expect(mockChatMessageFindMany).not.toHaveBeenCalled();
    expect(mockCreditEntryFindMany).not.toHaveBeenCalled();
    expect(mockCreditEntryCreateMany).not.toHaveBeenCalled();
  });

  it('usa janela default de 24h quando since não é fornecido', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([]);

    const { reconcileCredits } = await loadModule();
    const before = Date.now();
    await reconcileCredits();
    const after = Date.now();

    expect(mockConsultationFindMany).toHaveBeenCalledOnce();
    const call = mockConsultationFindMany.mock.calls[0][0];
    const since: Date = call.where.createdAt.gte;
    const diffMs = after - since.getTime();
    // 24h ± margem de execução.
    expect(diffMs).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 100);
    expect(diffMs).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 100);
    void before;
  });

  it('respeita since custom', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([]);
    const custom = new Date('2026-06-01T00:00:00Z');

    const { reconcileCredits } = await loadModule();
    await reconcileCredits({ since: custom });

    const call = mockConsultationFindMany.mock.calls[0][0];
    expect(call.where.createdAt.gte).toBe(custom);
  });

  it('consulta mensagens apenas para consultations existentes', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: new Date('2026-06-24T12:00:00Z') },
      { id: 'c-2', userId: 'u-2', createdAt: new Date('2026-06-24T12:05:00Z') },
    ]);
    mockChatMessageFindMany.mockResolvedValueOnce([]);

    const { reconcileCredits } = await loadModule();
    await reconcileCredits();

    expect(mockChatMessageFindMany).toHaveBeenCalledOnce();
    const call = mockChatMessageFindMany.mock.calls[0][0];
    expect(call.where.consultationId.in).toEqual(['c-1', 'c-2']);
    expect(call.where.creditCost).toEqual({ gt: 0 });
  });

  it('filtra creditEntries por reason in [consult_simple, consult_complex]', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: new Date('2026-06-24T12:00:00Z') },
    ]);
    mockChatMessageFindMany.mockResolvedValueOnce([]);
    mockCreditEntryFindMany.mockResolvedValueOnce([]);

    const { reconcileCredits } = await loadModule();
    await reconcileCredits();

    const call = mockCreditEntryFindMany.mock.calls[0][0];
    expect(call.where.reason.in).toEqual(['consult_simple', 'consult_complex']);
  });

  it('expande janela para entries: 1min antes a 5s depois do range', async () => {
    const t1 = new Date('2026-06-24T12:00:00Z');
    const t2 = new Date('2026-06-24T12:30:00Z');
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: t1 },
      { id: 'c-2', userId: 'u-2', createdAt: t2 },
    ]);
    mockChatMessageFindMany.mockResolvedValueOnce([]);
    mockCreditEntryFindMany.mockResolvedValueOnce([]);

    const { reconcileCredits } = await loadModule();
    await reconcileCredits();

    const call = mockCreditEntryFindMany.mock.calls[0][0];
    expect(call.where.createdAt.gte).toEqual(new Date(t1.getTime() - 60_000));
    expect(call.where.createdAt.lte).toEqual(new Date(t2.getTime() + 5_000));
  });
});

describe('reconcileCredits() — match (sem discrepância)', () => {
  it('não marca discrepância quando delta == esperado', async () => {
    const consultTs = new Date('2026-06-24T12:00:00Z');
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: consultTs },
    ]);
    // 2 créditos esperados (1 mensagem com creditCost=2).
    mockChatMessageFindMany.mockResolvedValueOnce([
      { consultationId: 'c-1', creditCost: 2 },
    ]);
    // Entry com delta = -2 = esperado.
    mockCreditEntryFindMany.mockResolvedValueOnce([
      {
        id: 'e-1',
        userId: 'u-1',
        delta: -2,
        reason: 'consult_simple',
        createdAt: new Date(consultTs.getTime() + 1_000),
      },
    ]);

    const { reconcileCredits } = await loadModule();
    const report = await reconcileCredits();

    expect(report.totalConsultas).toBe(1);
    expect(report.totalDebitos).toBe(2);
    expect(report.discrepancias).toEqual([]);
    expect(report.totalCreditosDevolvidos).toBe(0);
    expect(mockCreditEntryCreateMany).not.toHaveBeenCalled();
  });

  it('soma múltiplas mensagens com creditCost na mesma consultation', async () => {
    const consultTs = new Date('2026-06-24T12:00:00Z');
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: consultTs },
    ]);
    // 3 mensagens: 1+1+2 = 4 esperado, entry com delta=-4
    mockChatMessageFindMany.mockResolvedValueOnce([
      { consultationId: 'c-1', creditCost: 1 },
      { consultationId: 'c-1', creditCost: 1 },
      { consultationId: 'c-1', creditCost: 2 },
    ]);
    mockCreditEntryFindMany.mockResolvedValueOnce([
      {
        id: 'e-1',
        userId: 'u-1',
        delta: -4,
        reason: 'consult_complex',
        createdAt: new Date(consultTs.getTime() + 1_000),
      },
    ]);

    const { reconcileCredits } = await loadModule();
    const report = await reconcileCredits();

    expect(report.discrepancias).toEqual([]);
    expect(report.totalDebitos).toBe(4);
  });

  it('ignora consulta sem mensagens com creditCost>0', async () => {
    const consultTs = new Date('2026-06-24T12:00:00Z');
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: consultTs },
    ]);
    // Sem mensagens creditCost > 0 → expectedCost = 0 → skip.
    mockChatMessageFindMany.mockResolvedValueOnce([]);

    const { reconcileCredits } = await loadModule();
    const report = await reconcileCredits();

    expect(report.totalConsultas).toBe(1);
    expect(report.discrepancias).toEqual([]);
    expect(report.totalDebitos).toBe(0);
    // Sem refunds necessários → usersNeedingLatestBalance vazio → 2ª findMany
    // (latest balance) não é chamada. Mas a 1ª findMany (entries do range)
    // RODA incondicionalmente antes do loop de consultas.
    expect(mockCreditEntryFindMany).toHaveBeenCalledTimes(1);
  });
});

describe('reconcileCredits() — over-debit (refund)', () => {
  it('detecta over-debit e cria refund automático', async () => {
    const consultTs = new Date('2026-06-24T12:00:00Z');
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: consultTs },
    ]);
    // Esperado: 2 (1 mensagem com creditCost=2).
    mockChatMessageFindMany.mockResolvedValueOnce([
      { consultationId: 'c-1', creditCost: 2 },
    ]);
    // Debitado: -5 (over-debit por 3).
    mockCreditEntryFindMany
      .mockResolvedValueOnce([
        // 1ª chamada: entries do range expandido.
        {
          id: 'e-1',
          userId: 'u-1',
          delta: -5,
          reason: 'consult_simple',
          createdAt: new Date(consultTs.getTime() + 1_000),
        },
      ])
      .mockResolvedValueOnce([
        // 2ª chamada: latest entry por user (para calcular balance do refund).
        {
          userId: 'u-1',
          balance: 10,
          createdAt: new Date(consultTs.getTime() + 2_000),
        },
      ]);

    const { reconcileCredits } = await loadModule();
    const report = await reconcileCredits();

    expect(report.discrepancias).toHaveLength(1);
    expect(report.discrepancias[0]).toEqual({
      userId: 'u-1',
      consultationId: 'c-1',
      debitado: -5,
      esperado: -2,
      acao: 'devolver',
    });
    expect(report.totalCreditosDevolvidos).toBe(3); // |expected - debitado| = |-2 - (-5)| = 3

    // createMany chamado com 1 refund de 3 (positivo).
    expect(mockCreditEntryCreateMany).toHaveBeenCalledOnce();
    const created = mockCreditEntryCreateMany.mock.calls[0][0];
    expect(created.data).toEqual([
      {
        userId: 'u-1',
        delta: 3,
        reason: 'reconciliation_refund',
        balance: 13, // latest 10 + refund 3
      },
    ]);
  });

  it('escolhe latest entry do user (first match em ordem desc)', async () => {
    const consultTs = new Date('2026-06-24T12:00:00Z');
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: consultTs },
    ]);
    mockChatMessageFindMany.mockResolvedValueOnce([
      { consultationId: 'c-1', creditCost: 2 },
    ]);
    mockCreditEntryFindMany
      .mockResolvedValueOnce([
        {
          id: 'e-1',
          userId: 'u-1',
          delta: -5,
          reason: 'consult_simple',
          createdAt: new Date(consultTs.getTime() + 1_000),
        },
      ])
      .mockResolvedValueOnce([
        // 3 entries em qualquer ordem — a primeira a aparecer vira latestBalance.
        { userId: 'u-1', balance: 7, createdAt: new Date('2026-06-25T00:00:00Z') },
        { userId: 'u-1', balance: 99, createdAt: new Date('2026-06-24T00:00:00Z') },
      ]);

    const { reconcileCredits } = await loadModule();
    await reconcileCredits();

    const created = mockCreditEntryCreateMany.mock.calls[0][0];
    // Primeiro match = balance 7. Refund = 7 + 3 = 10.
    expect(created.data[0].balance).toBe(10);
  });

  it('assume balance 0 quando user não tem latest entry', async () => {
    const consultTs = new Date('2026-06-24T12:00:00Z');
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-new', createdAt: consultTs },
    ]);
    mockChatMessageFindMany.mockResolvedValueOnce([
      { consultationId: 'c-1', creditCost: 2 },
    ]);
    mockCreditEntryFindMany
      .mockResolvedValueOnce([
        {
          id: 'e-1',
          userId: 'u-new',
          delta: -5,
          reason: 'consult_simple',
          createdAt: new Date(consultTs.getTime() + 1_000),
        },
      ])
      .mockResolvedValueOnce([]); // sem latest entry

    const { reconcileCredits } = await loadModule();
    const report = await reconcileCredits();

    expect(report.discrepancias).toHaveLength(1);
    expect(report.totalCreditosDevolvidos).toBe(3);

    const created = mockCreditEntryCreateMany.mock.calls[0][0];
    expect(created.data[0].balance).toBe(0 + 3); // fallback 0 + refund
  });
});

describe('reconcileCredits() — under-debit (revisão manual)', () => {
  it('marca discrepância quando delta é menos negativo que esperado', async () => {
    const consultTs = new Date('2026-06-24T12:00:00Z');
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: consultTs },
    ]);
    // Esperado: 5 (1 mensagem com creditCost=5).
    mockChatMessageFindMany.mockResolvedValueOnce([
      { consultationId: 'c-1', creditCost: 5 },
    ]);
    // Debitado: -3 (under-debit por 2).
    mockCreditEntryFindMany.mockResolvedValueOnce([
      {
        id: 'e-1',
        userId: 'u-1',
        delta: -3,
        reason: 'consult_simple',
        createdAt: new Date(consultTs.getTime() + 1_000),
      },
    ]);

    const { reconcileCredits } = await loadModule();
    const report = await reconcileCredits();

    expect(report.discrepancias).toHaveLength(1);
    expect(report.discrepancias[0]).toEqual({
      userId: 'u-1',
      consultationId: 'c-1',
      debitado: -3,
      esperado: -5,
      acao: 'debitar_diferenca',
    });
    expect(report.totalCreditosDevolvidos).toBe(0);
    // Under-debit NÃO cria refund — apenas marca para revisão.
    expect(mockCreditEntryCreateMany).not.toHaveBeenCalled();
  });
});

describe('reconcileCredits() — janela por consulta (matching)', () => {
  it('associa entries à consulta apenas dentro da janela ±60s/+5s', async () => {
    const consultTs = new Date('2026-06-24T12:00:00Z');
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: consultTs },
    ]);
    mockChatMessageFindMany.mockResolvedValueOnce([
      { consultationId: 'c-1', creditCost: 2 },
    ]);
    // Entry ANTES da janela (>60s antes) — NÃO deve ser pareada.
    // Entry DENTRO da janela — pareada.
    mockCreditEntryFindMany.mockResolvedValueOnce([
      {
        id: 'e-out',
        userId: 'u-1',
        delta: -100,
        reason: 'consult_simple',
        createdAt: new Date(consultTs.getTime() - 90_000),
      },
      {
        id: 'e-in',
        userId: 'u-1',
        delta: -2,
        reason: 'consult_simple',
        createdAt: new Date(consultTs.getTime() + 1_000),
      },
    ]);

    const { reconcileCredits } = await loadModule();
    const report = await reconcileCredits();

    // Só o entry dentro da janela conta → debitado = -2 = esperado → MATCH.
    expect(report.discrepancias).toEqual([]);
    expect(report.totalDebitos).toBe(2);
  });
});

describe('reconcileCredits() — múltiplos usuários', () => {
  it('processa vários usuários e acumula totais', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c-1', userId: 'u-1', createdAt: new Date('2026-06-24T12:00:00Z') },
      { id: 'c-2', userId: 'u-2', createdAt: new Date('2026-06-24T12:10:00Z') },
      { id: 'c-3', userId: 'u-1', createdAt: new Date('2026-06-24T12:20:00Z') },
    ]);
    mockChatMessageFindMany.mockResolvedValueOnce([
      { consultationId: 'c-1', creditCost: 2 }, // u-1 ok
      { consultationId: 'c-2', creditCost: 3 }, // u-2 over-debit (entry -5)
      { consultationId: 'c-3', creditCost: 1 }, // u-1 under-debit (entry 0)
    ]);
    // Entries com timestamps DENTRO da janela de cada consult (consult.createdAt
    // + 5s = janela termina em +5s). Todos os offsets abaixo cabem.
    mockCreditEntryFindMany
      .mockResolvedValueOnce([
        {
          id: 'e-1',
          userId: 'u-1',
          delta: -2,
          reason: 'consult_simple',
          createdAt: new Date('2026-06-24T12:00:01Z'), // +1s de c-1
        },
        {
          id: 'e-2',
          userId: 'u-2',
          delta: -5,
          reason: 'consult_simple',
          createdAt: new Date('2026-06-24T12:10:02Z'), // +2s de c-2
        },
        {
          id: 'e-3',
          userId: 'u-1',
          delta: 0, // under-debit (esperado era -1)
          reason: 'consult_simple',
          createdAt: new Date('2026-06-24T12:20:03Z'), // +3s de c-3
        },
      ])
      .mockResolvedValueOnce([
        // latest entry de u-2 (único que precisa refund)
        { userId: 'u-2', balance: 8, createdAt: new Date('2026-06-24T12:30:00Z') },
      ]);

    const { reconcileCredits } = await loadModule();
    const report = await reconcileCredits();

    expect(report.totalConsultas).toBe(3);
    expect(report.totalDebitos).toBe(2 + 5 + 0); // match u-1 + over u-2 + under u-1
    expect(report.discrepancias).toHaveLength(2); // u-2 over + u-1 under
    expect(report.totalCreditosDevolvidos).toBe(2); // |−3 − (−5)| = 2

    const refunds = mockCreditEntryCreateMany.mock.calls[0][0].data;
    expect(refunds).toHaveLength(1);
    expect(refunds[0]).toEqual({
      userId: 'u-2',
      delta: 2,
      reason: 'reconciliation_refund',
      balance: 10, // 8 + 2
    });
  });
});