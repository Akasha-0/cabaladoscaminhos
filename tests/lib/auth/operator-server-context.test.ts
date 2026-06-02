// tests/lib/auth/operator-server-context.test.ts
// Testes do getOperatorFromServerContext (Fase 14 — server-side auth gate).
// Cobre: cookie válido+session ativa, cookie+session revogada, sem cookie,
// dev header, NODE_ENV=production, DB fail-open.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const TEST_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-that-is-at-least-32-bytes-long';

const mockOperator = {
  id: 'op-1',
  email: 'ramiro@cabala.com',
  name: 'Ramiro',
  passwordHash: 'hash',
  role: 'OPERATOR',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const cookieStore: { current: Record<string, string> } = { current: {} };
const headerStore: { current: Record<string, string> } = { current: {} };

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const v = cookieStore.current[name];
      return v ? { name, value: v } : undefined;
    },
  })),
  headers: vi.fn(async () => ({
    get: (name: string) => headerStore.current[name.toLowerCase()] ?? null,
  })),
}));

const mockFindUnique = vi.fn(); // prisma.operator.findUnique
const mockSessionFindUnique = vi.fn(); // prisma.operatorSession.findUnique

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: (args: unknown) => mockFindUnique(args),
    },
    operatorSession: {
      findUnique: (args: unknown) => mockSessionFindUnique(args),
    },
  },
}));

import { getOperatorFromServerContext } from '@/lib/auth/operator-session';

const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  mockFindUnique.mockReset();
  mockSessionFindUnique.mockReset();
  cookieStore.current = {};
  headerStore.current = {};
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

function makeValidToken(operatorId: string, role: 'OPERATOR' | 'ADMIN' = 'OPERATOR'): string {
  // Fase 15: tokens precisam ter claim type='access' para passar a verificação.
  return jwt.sign(
    { sub: operatorId, role, type: 'access' },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '7d' }
  );
}

// ============================================================================
// Cookie JWT (caminho de produção)
// ============================================================================

describe('getOperatorFromServerContext — cookie JWT', () => {
  it('retorna operator quando cookie válido e session ativa', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    mockFindUnique.mockResolvedValue(mockOperator);

    const result = await getOperatorFromServerContext();

    expect(result).toEqual(mockOperator);
    expect(mockSessionFindUnique).toHaveBeenCalledWith({
      where: { tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/) },
      select: { type: true, expiresAt: true, refreshExpiresAt: true, revokedAt: true },
    });
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-1' } });
  });

  it('retorna null quando cookie tem JWT expirado', async () => {
    const expiredToken = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '-1s' }
    );
    cookieStore.current = { cockpit_session: expiredToken };

    const result = await getOperatorFromServerContext();

    expect(result).toBeNull();
    expect(mockSessionFindUnique).not.toHaveBeenCalled();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('retorna null quando session foi revogada (logout imediato)', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(), // ← revogada
    });

    const result = await getOperatorFromServerContext();

    expect(result).toBeNull();
    // Não tenta carregar o Operator porque a session morreu
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('retorna null quando session não existe (token inválido/fabricado)', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue(null); // session não existe

    const result = await getOperatorFromServerContext();

    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('retorna null quando session expirou (expiresAt < now)', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() - 1000), // 1s atrás
      revokedAt: null,
    });

    const result = await getOperatorFromServerContext();

    expect(result).toBeNull();
  });

  it('NÃO tenta dev header quando cookie JWT é inválido (prevenção de bypass)', async () => {
    const token = 'invalid.jwt.token';
    cookieStore.current = { cockpit_session: token };
    headerStore.current = { 'x-dev-operator-id': 'op-dev' };

    const result = await getOperatorFromServerContext();

    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('fail-open em DB error: deixa passar se isSessionActive falhar', async () => {
    // DB caiu durante session check — operador não deve ser derrubado
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockRejectedValue(new Error('DB timeout'));
    mockFindUnique.mockResolvedValue(mockOperator);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getOperatorFromServerContext();

    expect(result).toEqual(mockOperator);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

// ============================================================================
// Sem cookie
// ============================================================================

describe('getOperatorFromServerContext — sem cookie', () => {
  it('retorna null sem cookie e sem dev header', async () => {
    cookieStore.current = {};
    headerStore.current = {};

    const result = await getOperatorFromServerContext();

    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockSessionFindUnique).not.toHaveBeenCalled();
  });

  it('retorna null sem cookie em produção (mesmo com dev header)', async () => {
    process.env.NODE_ENV = 'production';
    headerStore.current = { 'x-dev-operator-id': 'op-dev' };

    const result = await getOperatorFromServerContext();

    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

// ============================================================================
// Dev header (apenas NODE_ENV !== 'production')
// ============================================================================

describe('getOperatorFromServerContext — dev header', () => {
  it('resolve operator via dev header em dev/test', async () => {
    headerStore.current = { 'x-dev-operator-id': 'op-dev' };
    mockFindUnique.mockResolvedValue(mockOperator);

    const result = await getOperatorFromServerContext();

    expect(result).toEqual(mockOperator);
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-dev' } });
  });

  it('ignora dev header em produção', async () => {
    process.env.NODE_ENV = 'production';
    headerStore.current = { 'x-dev-operator-id': 'op-prod' };

    const result = await getOperatorFromServerContext();

    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('NÃO consulta session check no caminho dev (não tem token pra hash)', async () => {
    headerStore.current = { 'x-dev-operator-id': 'op-dev' };
    mockFindUnique.mockResolvedValue(mockOperator);

    await getOperatorFromServerContext();

    expect(mockSessionFindUnique).not.toHaveBeenCalled();
  });
});

// ============================================================================
// Comportamento similar a getOperatorFromRequest
// ============================================================================

describe('getOperatorFromServerContext — consistência com getOperatorFromRequest', () => {
  it('verifica session APÓS verificar JWT (mesma precedência)', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    mockFindUnique.mockResolvedValue(mockOperator);

    await getOperatorFromServerContext();

    // Ordem das chamadas: 1) session check, 2) operator lookup
    expect(mockSessionFindUnique).toHaveBeenCalled();
    expect(mockFindUnique).toHaveBeenCalled();
    // O session check acontece ANTES do operator lookup
    expect(mockSessionFindUnique.mock.invocationCallOrder[0])
      .toBeLessThan(mockFindUnique.mock.invocationCallOrder[0]);
  });
});
