/**
 * Credits API Integration Tests
 * 
 * Tests the credits management API endpoints:
 * - GET /api/creditos - Returns current balance
 * - POST /api/creditos/adicionar - Adds credits
 * - POST /api/creditos/debitar - Deducts credits
 * 
 * Test Areas:
 * 1. Saldo: Verify GET returns current balance
 * 2. Adicionar: Verify credit purchase works
 * 3. Debitar: Verify CREDITO_CUSTO_PERGUNTA = 2 is deducted
 * 4. Insufficient credits: Test 400 when balance too low
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// MOCK PRISMA DEPENDENCIES
// ============================================================

const mockPrismaCreditoFindUnique = vi.fn();
const mockPrismaCreditoUpsert = vi.fn();
const mockPrismaCreditoUpdate = vi.fn();
const mockPrismaTransacaoCreate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    credito: {
      findUnique: mockPrismaCreditoFindUnique,
      upsert: mockPrismaCreditoUpsert,
      update: mockPrismaCreditoUpdate,
      create: vi.fn(),
    },
    transacaoCredito: {
      create: mockPrismaTransacaoCreate,
    },
  },
}));

// ============================================================
// TESTS
// ============================================================

describe('GET /api/creditos - Balance Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar saldo 0 quando usuario não tem créditos', async () => {
    mockPrismaCreditoFindUnique.mockResolvedValue(null);

    const { getCreditos } = await import('@/lib/credits/service');
    const saldo = await getCreditos('user-no-credits');

    expect(saldo).toBe(0);
    expect(mockPrismaCreditoFindUnique).toHaveBeenCalledWith({
      where: { userId: 'user-no-credits' },
    });
  });

  it('deve retornar saldo existente do usuario', async () => {
    mockPrismaCreditoFindUnique.mockResolvedValue({ saldo: 100 });

    const { getCreditos } = await import('@/lib/credits/service');
    const saldo = await getCreditos('user-with-credits');

    expect(saldo).toBe(100);
  });

  it('deve retornar getCreditosCompleto com transacoes', async () => {
    const mockTransacoes = [
      { id: '1', tipo: 'CREDITO', quantidade: 50, createdAt: new Date() },
      { id: '2', tipo: 'DEBITO', quantidade: 10, createdAt: new Date() },
    ];

    mockPrismaCreditoFindUnique.mockResolvedValue({
      saldo: 40,
      transacoes: mockTransacoes,
    });

    const { getCreditosCompleto } = await import('@/lib/credits/service');
    const resultado = await getCreditosCompleto('user-with-transactions');

    expect(resultado.saldo).toBe(40);
    expect(resultado.transacoes).toHaveLength(2);
  });
});

describe('POST /api/creditos/adicionar - Add Credits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve adicionar créditos e retornar novo saldo', async () => {
    mockPrismaCreditoUpsert.mockResolvedValue({ id: 'credito-1', saldo: 150 });
    mockPrismaTransacaoCreate.mockResolvedValue({
      id: 'trans-1',
      tipo: 'CREDITO',
      quantidade: 100,
    });

    const { adicionarCreditos } = await import('@/lib/credits/service');
    const resultado = await adicionarCreditos('user-123', 100, 'Compra de créditos');

    expect(resultado.novoSaldo).toBe(150);
    expect(mockPrismaCreditoUpsert).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      update: { saldo: { increment: 100 } },
      create: { userId: 'user-123', saldo: 100 },
    });
    expect(mockPrismaTransacaoCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tipo: 'CREDITO',
        quantidade: 100,
        descricao: 'Compra de créditos',
      }),
    });
  });

  it('deve criar registro de credito se usuario nao tem nenhum (upsert creates)', async () => {
    mockPrismaCreditoUpsert.mockResolvedValue({ id: 'credito-new', saldo: 50 });
    mockPrismaTransacaoCreate.mockResolvedValue({
      id: 'trans-new',
      tipo: 'CREDITO',
      quantidade: 50,
    });

    const { adicionarCreditos } = await import('@/lib/credits/service');
    const resultado = await adicionarCreditos('new-user', 50, 'Primeira compra');

    expect(resultado.novoSaldo).toBe(50);
  });

  it('deve validar quantidade maior que zero', async () => {
    const { adicionarCreditos } = await import('@/lib/credits/service');

    await expect(
      adicionarCreditos('user-123', 0, 'Test')
    ).rejects.toThrow('A quantidade deve ser maior que zero.');
  });
});

describe('POST /api/creditos/debitar - Debit Credits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve debitar 2 créditos (CREDITO_CUSTO_PERGUNTA) e retornar novo saldo', async () => {
    mockPrismaCreditoFindUnique.mockResolvedValue({ id: 'credito-2', saldo: 10 });
    mockPrismaCreditoUpdate.mockResolvedValue({ id: 'credito-2', saldo: 8 });
    mockPrismaTransacaoCreate.mockResolvedValue({
      id: 'trans-debit-1',
      tipo: 'DEBITO',
      quantidade: 2,
    });

    const { debitarCreditos } = await import('@/lib/credits/service');
    const resultado = await debitarCreditos('user-123', 2, 'perguntaChat');

    expect(resultado.novoSaldo).toBe(8);
    expect(mockPrismaCreditoUpdate).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      data: { saldo: { decrement: 2 } },
    });
  });

  it('deve lançar CreditosInsuficientesError quando saldo é insuficiente', async () => {
    mockPrismaCreditoFindUnique.mockResolvedValue({ id: 'credito-poor', saldo: 1 });

    const { debitarCreditos, CreditosInsuficientesError } = await import('@/lib/credits/service');

    await expect(
      debitarCreditos('user-poor', 2, 'perguntaChat')
    ).rejects.toThrow(CreditosInsuficientesError);

    try {
      await debitarCreditos('user-poor', 2, 'perguntaChat');
    } catch (error) {
      expect(error).toBeInstanceOf(CreditosInsuficientesError);
      expect((error as { saldoAtual: number }).saldoAtual).toBe(1);
      expect((error as { saldoNecessario: number }).saldoNecessario).toBe(2);
    }
  });

  it('deve funcionar quando usuario não tem registro de crédito (saldo 0)', async () => {
    mockPrismaCreditoFindUnique.mockResolvedValue(null);

    const { debitarCreditos, CreditosInsuficientesError } = await import('@/lib/credits/service');

    await expect(
      debitarCreditos('new-user', 2, 'perguntaChat')
    ).rejects.toThrow(CreditosInsuficientesError);

    try {
      await debitarCreditos('new-user', 2, 'perguntaChat');
    } catch (error) {
      expect(error).toBeInstanceOf(CreditosInsuficientesError);
      expect((error as { saldoAtual: number }).saldoAtual).toBe(0);
    }
  });

  it('deve validar quantidade maior que zero', async () => {
    const { debitarCreditos } = await import('@/lib/credits/service');

    await expect(
      debitarCreditos('user-123', 0, 'perguntaChat')
    ).rejects.toThrow();
  });
});

describe('Insufficient Credits - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CreditosInsuficientesError deve ter saldoAtual e saldoNecessario', async () => {
    const { CreditosInsuficientesError } = await import('@/lib/credits/service');
    const error = new CreditosInsuficientesError(5, 10);

    expect(error.saldoAtual).toBe(5);
    expect(error.saldoNecessario).toBe(10);
    expect(error.message).toContain('5');
    expect(error.message).toContain('10');
  });

  it('deve falhar quando tentando debit maior que saldo disponível', async () => {
    mockPrismaCreditoFindUnique.mockResolvedValue({ saldo: 5 });

    const { debitarCreditos } = await import('@/lib/credits/service');

    await expect(
      debitarCreditos('user-low-balance', 10, 'perguntaChat')
    ).rejects.toThrow();
  });
});

describe('CREDITO_CUSTO_PERGUNTA Constant', () => {
  it('deve ter custo de 2 para perguntaChat', async () => {
    const { CUSTOS_OPERACOES } = await import('@/lib/credits/custos');

    expect(CUSTOS_OPERACOES.perguntaChat).toBe(2);
  });

  it('deve ter custos corretos para todas operações', async () => {
    const { CUSTOS_OPERACOES } = await import('@/lib/credits/custos');

    expect(CUSTOS_OPERACOES.insightRapido).toBe(2);
    expect(CUSTOS_OPERACOES.insightDetalhado).toBe(5);
    expect(CUSTOS_OPERACOES.relatorioSemanal).toBe(15);
    expect(CUSTOS_OPERACOES.relatorioMensal).toBe(30);
    expect(CUSTOS_OPERACOES.perguntaChat).toBe(2);
  });

  it('obterCusto deve retornar custo correto para operação', async () => {
    const { obterCusto } = await import('@/lib/credits/custos');

    expect(obterCusto('perguntaChat')).toBe(2);
    expect(obterCusto('insightDetalhado')).toBe(5);
  });
});

describe('Verificar Credits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar true quando usuario tem créditos suficientes', async () => {
    mockPrismaCreditoFindUnique.mockResolvedValue({ saldo: 10 });

    const { verificarCreditos } = await import('@/lib/credits/service');
    const resultado = await verificarCreditos('user-rich', 5);

    expect(resultado).toBe(true);
  });

  it('deve retornar false quando usuario não tem créditos suficientes', async () => {
    mockPrismaCreditoFindUnique.mockResolvedValue({ saldo: 3 });

    const { verificarCreditos } = await import('@/lib/credits/service');
    const resultado = await verificarCreditos('user-poor', 5);

    expect(resultado).toBe(false);
  });

  it('deve retornar false quando usuario não tem registro de créditos', async () => {
    mockPrismaCreditoFindUnique.mockResolvedValue(null);

    const { verificarCreditos } = await import('@/lib/credits/service');
    const resultado = await verificarCreditos('new-user', 1);

    expect(resultado).toBe(false);
  });
});