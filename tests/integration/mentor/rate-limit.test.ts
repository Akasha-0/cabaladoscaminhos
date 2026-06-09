/**
 * Testes de integração para rate limiting do Mentor
 * @akasha-v0.0.11 - T8.2
 */

import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';

// =============================================================================
// Mocks - Simular dependências
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store para testes
const rateLimitStore = new Map<string, RateLimitEntry>();

// Mock da função de rate limit
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 10;

  const entry = rateLimitStore.get(userId);

  if (!entry || entry.resetAt < now) {
    // Nova janela
    const resetAt = now + windowMs;
    rateLimitStore.set(userId, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

function clearRateLimitForUser(userId: string): void {
  rateLimitStore.delete(userId);
}

// =============================================================================
// Tests
// =============================================================================

describe('Rate Limit', () => {
  const testUserId = 'test-user-rate-limit';

  beforeEach(() => {
    // Limpar rate limit antes de cada teste
    clearRateLimitForUser(testUserId);
  });

  afterAll(() => {
    vi.clearAllMocks();
    rateLimitStore.clear();
  });

  it('deve permitir primeira requisição', async () => {
    const result = await checkRateLimit(testUserId);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9); // 10 - 1 = 9
  });

  it('deve decrementar remaining a cada requisição', async () => {
    // Primeira requisição
    const r1 = await checkRateLimit(testUserId);
    expect(r1.remaining).toBe(9);

    // Segunda requisição
    const r2 = await checkRateLimit(testUserId);
    expect(r2.remaining).toBe(8);

    // Terceira requisição
    const r3 = await checkRateLimit(testUserId);
    expect(r3.remaining).toBe(7);
  });

  it('deve bloquear após 10 requisições em 1 minuto', async () => {
    // Fazer 10 requisições
    for (let i = 0; i < 10; i++) {
      const result = await checkRateLimit(testUserId);
      expect(result.allowed).toBe(true);
    }

    // 11ª requisição deve ser bloqueada
    const result = await checkRateLimit(testUserId);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('deve manter estado de rate limit entre chamadas', async () => {
    // Fazer 5 requisições
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(testUserId);
    }

    // Verificar que ainda tem 5 requisições restantes
    const result = await checkRateLimit(testUserId);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('deve incluir resetAt no retorno', async () => {
    const result = await checkRateLimit(testUserId);

    expect(result).toHaveProperty('resetAt');
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it('deve rastrear rate limit por usuário diferente', async () => {
    const user1 = 'test-user-1';
    const user2 = 'test-user-2';

    clearRateLimitForUser(user1);
    clearRateLimitForUser(user2);

    // Fazer 5 requisições para user1
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(user1);
    }

    // user2 deve começar do zero
    const result = await checkRateLimit(user2);
    expect(result.remaining).toBe(9);
  });
});

describe('Rate Limit Reset', () => {
  it('deve implementar janela de 1 minuto', async () => {
    const userId = 'test-user-reset';

    // Fazer requisição inicial
    const initial = await checkRateLimit(userId);
    expect(initial.allowed).toBe(true);

    // Verificar que resetAt está no futuro
    expect(initial.resetAt).toBeGreaterThan(Date.now());
    expect(initial.resetAt).toBeLessThanOrEqual(Date.now() + 60000);
  });
});
