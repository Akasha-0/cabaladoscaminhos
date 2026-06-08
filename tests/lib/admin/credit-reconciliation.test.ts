import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockConsultationFindMany = vi.fn();
const mockChatMessageFindMany = vi.fn();
const mockCreditEntryFindMany = vi.fn();
const mockCreditEntryFindFirst = vi.fn();
const mockCreditEntryCreate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    consultation: { findMany: (...args: unknown[]) => mockConsultationFindMany(...args) },
    chatMessage: { findMany: (...args: unknown[]) => mockChatMessageFindMany(...args) },
    creditEntry: {
      findMany: (...args: unknown[]) => mockCreditEntryFindMany(...args),
      findFirst: (...args: unknown[]) => mockCreditEntryFindFirst(...args),
      create: (...args: unknown[]) => mockCreditEntryCreate(...args),
    },
  },
}));

const { reconcileCredits } = await import('@/lib/admin/credit-reconciliation');

beforeEach(() => {
  vi.clearAllMocks();
  mockConsultationFindMany.mockResolvedValue([]);
  mockCreditEntryCreate.mockResolvedValue({ id: 'ce-1' });
  mockCreditEntryFindFirst.mockResolvedValue({ balance: 10 });
});

describe('reconcileCredits', () => {
  it('retorna report vazio quando nao ha consultas no periodo', async () => {
    const report = await reconcileCredits();

    expect(report.totalConsultas).toBe(0);
    expect(report.discrepancias).toEqual([]);
  });

  it('nao reporta discrepancia quando debito bate com creditCost total', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c1', userId: 'u1', createdAt: new Date() },
    ]);
    mockChatMessageFindMany.mockResolvedValueOnce([{ creditCost: 1 }]);
    mockCreditEntryFindMany.mockResolvedValueOnce([{ id: 'ce-1', delta: -1, reason: 'consult_simple' }]);

    const report = await reconcileCredits();

    expect(report.discrepancias).toHaveLength(0);
    expect(report.totalDebitos).toBe(1);
  });

  it('detecta over-debit e devolve automaticamente', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c1', userId: 'u1', createdAt: new Date() },
    ]);
    mockChatMessageFindMany.mockResolvedValueOnce([{ creditCost: 1 }]);
    // Anomalia: debitou -2 em vez de -1
    mockCreditEntryFindMany.mockResolvedValueOnce([{ id: 'ce-1', delta: -2, reason: 'consult_simple' }]);

    const report = await reconcileCredits();

    expect(report.discrepancias).toHaveLength(1);
    expect(report.discrepancias[0].acao).toBe('devolver');
    expect(report.discrepancias[0].esperado).toBe(-1);
    expect(report.totalCreditosDevolvidos).toBe(1);

    // Verifica que creditEntry de devolução foi criado
    expect(mockCreditEntryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'u1',
          delta: 1,
          reason: 'reconciliation_refund',
          balance: 11, // 10 + 1
        }),
      })
    );
  });

  it('detecta under-debit e marca para revisão manual (sem correção automática)', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c1', userId: 'u1', createdAt: new Date() },
    ]);
    // Consulta complexa (3 creditos)
    mockChatMessageFindMany.mockResolvedValueOnce([{ creditCost: 3 }]);
    // Anomalia: debitou apenas -1
    mockCreditEntryFindMany.mockResolvedValueOnce([{ id: 'ce-1', delta: -1, reason: 'consult_complex' }]);

    const report = await reconcileCredits();

    expect(report.discrepancias).toHaveLength(1);
    expect(report.discrepancias[0].acao).toBe('debitar_diferenca');
    expect(report.discrepancias[0].esperado).toBe(-3);
    // NÃO aplica correção automática
    expect(mockCreditEntryCreate).not.toHaveBeenCalled();
  });

  it('ignora consultas com creditCost total = 0 (free)', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c1', userId: 'u1', createdAt: new Date() },
    ]);
    mockChatMessageFindMany.mockResolvedValueOnce([{ creditCost: 0 }]);

    const report = await reconcileCredits();

    expect(report.totalConsultas).toBe(1);
    expect(report.discrepancias).toEqual([]);
    // Não tenta buscar creditEntry
    expect(mockCreditEntryFindMany).not.toHaveBeenCalled();
  });

  it('soma creditCost de multiplas mensagens da mesma consulta', async () => {
    mockConsultationFindMany.mockResolvedValueOnce([
      { id: 'c1', userId: 'u1', createdAt: new Date() },
    ]);
    // 3 mensagens: 1+1+1 = 3 creditos
    mockChatMessageFindMany.mockResolvedValueOnce([
      { creditCost: 1 },
      { creditCost: 1 },
      { creditCost: 1 },
    ]);
    // Débito bate (-3)
    mockCreditEntryFindMany.mockResolvedValueOnce([{ id: 'ce-1', delta: -3, reason: 'consult_complex' }]);

    const report = await reconcileCredits();

    expect(report.discrepancias).toHaveLength(0);
    expect(report.totalDebitos).toBe(3);
  });
});
