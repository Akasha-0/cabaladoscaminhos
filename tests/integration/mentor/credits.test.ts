/**
 * Testes de integração para créditos do Mentor
 * @akasha-v0.0.11 - T8.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// =============================================================================
// Mocks - Simular dependências
// =============================================================================

interface CreditEntry {
  id: string;
  userId: string;
  delta: number;
  balance: number;
  reason?: string;
  createdAt: Date;
}

// In-memory store para testes
const creditStore = new Map<string, CreditEntry[]>();

async function checkCredits(userId: string): Promise<{ hasCredits: boolean; balance: number }> {
  const entries = creditStore.get(userId) || [];
  const balance = entries.reduce((sum, e) => sum + e.delta, 0);

  return {
    hasCredits: balance > 0,
    balance,
  };
}

async function deductCredit(userId: string): Promise<{ success: boolean; newBalance: number }> {
  const entries = creditStore.get(userId) || [];
  const currentBalance = entries.reduce((sum, e) => sum + e.delta, 0);

  if (currentBalance < 1) {
    return { success: false, newBalance: currentBalance };
  }

  const newEntry: CreditEntry = {
    id: `ce-${Date.now()}`,
    userId,
    delta: -1,
    balance: currentBalance - 1,
    reason: 'mentor_question',
    createdAt: new Date(),
  };

  entries.push(newEntry);
  creditStore.set(userId, entries);

  return { success: true, newBalance: currentBalance - 1 };
}

async function addCredits(userId: string, amount: number): Promise<{ balance: number }> {
  const entries = creditStore.get(userId) || [];
  const currentBalance = entries.reduce((sum, e) => sum + e.delta, 0);

  const newEntry: CreditEntry = {
    id: `ce-${Date.now()}`,
    userId,
    delta: amount,
    balance: currentBalance + amount,
    reason: 'test_credit',
    createdAt: new Date(),
  };

  entries.push(newEntry);
  creditStore.set(userId, entries);

  return { balance: currentBalance + amount };
}

function clearCreditsForUser(userId: string): void {
  creditStore.delete(userId);
}

// =============================================================================
// Tests
// =============================================================================

describe('Credits', () => {
  const testUserId = 'test-user-credits';

  beforeEach(() => {
    clearCreditsForUser(testUserId);
    // Adicionar 5 créditos iniciais para testes
    addCredits(testUserId, 5);
  });

  afterEach(() => {
    clearCreditsForUser(testUserId);
  });

  it('deve retornar hasCredits true para usuário com créditos', async () => {
    const result = await checkCredits(testUserId);

    expect(result.hasCredits).toBe(true);
    expect(result.balance).toBe(5);
  });

  it('deve retornar hasCredits false para usuário sem créditos', async () => {
    clearCreditsForUser('user-no-credits');

    const result = await checkCredits('user-no-credits');

    expect(result.hasCredits).toBe(false);
    expect(result.balance).toBe(0);
  });

  it('deve descontar 1 crédito após pergunta', async () => {
    const before = await checkCredits(testUserId);
    expect(before.balance).toBe(5);

    const deductResult = await deductCredit(testUserId);
    expect(deductResult.success).toBe(true);
    expect(deductResult.newBalance).toBe(4);

    const after = await checkCredits(testUserId);
    expect(after.balance).toBe(4);
  });

  it('deve falhar ao descontar sem créditos suficientes', async () => {
    clearCreditsForUser('user-poor');

    const deductResult = await deductCredit('user-poor');
    expect(deductResult.success).toBe(false);
  });

  it('deve decrementar corretamente após múltiplas perguntas', async () => {
    await deductCredit(testUserId);
    await deductCredit(testUserId);
    await deductCredit(testUserId);

    const result = await checkCredits(testUserId);
    expect(result.balance).toBe(2);
    expect(result.hasCredits).toBe(true);
  });

  it('deve bloquear após zerar créditos', async () => {
    // Descontar todos os 5 créditos
    for (let i = 0; i < 5; i++) {
      await deductCredit(testUserId);
    }

    const result = await checkCredits(testUserId);
    expect(result.balance).toBe(0);
    expect(result.hasCredits).toBe(false);

    // Próxima tentativa deve falhar
    const deductResult = await deductCredit(testUserId);
    expect(deductResult.success).toBe(false);
  });
});

describe('Credits Operations', () => {
  const testUserId = 'test-user-ops';

  afterEach(() => {
    clearCreditsForUser(testUserId);
  });

  it('deve adicionar créditos corretamente', async () => {
    const result = await addCredits(testUserId, 10);
    expect(result.balance).toBe(10);
  });

  it('deve acumular créditos de múltiplas operações', async () => {
    await addCredits(testUserId, 5);
    await addCredits(testUserId, 3);

    const result = await checkCredits(testUserId);
    expect(result.balance).toBe(8);
  });
});
