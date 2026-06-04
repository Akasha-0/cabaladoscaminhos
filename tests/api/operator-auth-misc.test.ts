// tests/api/operator-auth-misc.test.ts
// Integração das rotas misc de auth do Operator:
//   - DELETE /api/operator/auth/sessions/[id] (Fase 16 + 24)
//   - GET  /api/operator/auth/mfa/status  (Fase 20)
//
// Nota: GET /api/operator/auth/sessions/[id] não existe nesta versão.

process.env.AUTH_RL_LOGIN_MAX = '10000';
process.env.AUTH_RL_REGISTER_MAX = '10000';
process.env.AUTH_RL_REFRESH_MAX = '10000';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-that-is-at-least-32-bytes-long';

// ----------------------------------------------------------------------------
// Mocks — Prisma
// ----------------------------------------------------------------------------

const mockOperatorFindUnique = vi.fn();
const mockOperatorSessionFindFirst = vi.fn();
const mockOperatorSessionUpdate = vi.fn();
const mockOperatorSessionFindUnique = vi.fn();
const mockOperatorMfaFindUnique = vi.fn();

// Mock rate-limit
const mockCheckOperatorRateLimit = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: (args: unknown) => mockOperatorFindUnique(args),
    },
    operatorMfa: {
      findUnique: (args: unknown) => mockOperatorMfaFindUnique(args),
    },
    operatorSession: {
      findFirst: (args: unknown) => mockOperatorSessionFindFirst(args),
      update: (args: unknown) => mockOperatorSessionUpdate(args),
      findUnique: (args: unknown) => mockOperatorSessionFindUnique(args),
    },
  },
}));

vi.mock('@/lib/auth/rate-limit', () => ({
  checkOperatorRateLimit: (...args: unknown[]) => mockCheckOperatorRateLimit(...args),
  OPERATOR_RATE_LIMITS: {
    'sessions/delete': { max: 10, windowSeconds: 60 },
  },
}));

// Cookie store mockado
const cookieStore: { current: Record<string, string> } = { current: {} };
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const v = cookieStore.current[name];
      return v ? { name, value: v } : undefined;
    },
  })),
  headers: vi.fn(async () => ({
    get: () => null,
  })),
}));

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const mockOperator = {
  id: 'op-1',
  email: 'ramiro@cabala.com',
  name: 'Ramiro',
  passwordHash: 'hashed:secret123',
  role: 'OPERATOR' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockAdminOperator = {
  id: 'op-admin',
  email: 'admin@cabala.com',
  name: 'Admin',
  passwordHash: 'hashed:admin123',
  role: 'ADMIN' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

/** Sessão ACCESS ativa padrão para mockar em beforeEach. */
const defaultActiveSession = {
  id: 'sess-1',
  operatorId: 'op-1',
  type: 'ACCESS' as const,
  expiresAt: new Date(Date.now() + 3600_000),
  refreshExpiresAt: null,
  revokedAt: null,
};

/** Gera um JWT de access válido para o operator. */
function makeAccessToken(operatorId: string, role: string): string {
  return jwt.sign(
    { sub: operatorId, role, type: 'access' },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '7d' }
  );
}

function makeGetRequest(url: string, cookie?: string): NextRequest {
  return new NextRequest(url, {
    method: 'GET',
    headers: cookie ? { cookie: `cockpit_session=${cookie}` } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.current = {};
  mockOperatorFindUnique.mockResolvedValue(null);
  mockOperatorSessionFindFirst.mockResolvedValue(null);
  mockOperatorSessionUpdate.mockResolvedValue({ id: 'sess-1', revokedAt: new Date() });
  // isSessionActive (via isSessionActive→findUnique) precisa de sessão ativa
  // para que requireOperator resolva o operator → 401 se null
  mockOperatorSessionFindUnique.mockResolvedValue(defaultActiveSession);
  mockOperatorMfaFindUnique.mockResolvedValue(null);
  // Rate-limit sempre permite por defeito
  mockCheckOperatorRateLimit.mockResolvedValue({
    allowed: true,
    limit: 10,
    remaining: 9,
    resetAt: new Date(Date.now() + 60_000),
    retryAfterSeconds: 0,
  });
});

// ============================================================================
// DELETE /api/operator/auth/sessions/[id]
// ============================================================================

describe('DELETE /api/operator/auth/sessions/[id]', () => {
  it('retorna 200 e revoga a sessão quando é do próprio operator (Fase 16)', async () => {
    const token = makeAccessToken('op-1', 'OPERATOR');
    cookieStore.current = { cockpit_session: token };
    mockOperatorFindUnique.mockResolvedValue(mockOperator);
    mockOperatorSessionFindFirst.mockResolvedValue({
      id: 'sess-1',
      revokedAt: null,
    });

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeGetRequest('http://test/api/operator/auth/sessions/sess-1'),
      { params: Promise.resolve({ id: 'sess-1' }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, id: 'sess-1' });
    expect(mockOperatorSessionUpdate).toHaveBeenCalledWith({
      where: { id: 'sess-1' },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('retorna 200 idempotente quando a sessão já está revogada (Fase 16)', async () => {
    const token = makeAccessToken('op-1', 'OPERATOR');
    cookieStore.current = { cockpit_session: token };
    mockOperatorFindUnique.mockResolvedValue(mockOperator);
    // findFirst retorna a sessão, mas revokedAt !== null
    mockOperatorSessionFindFirst.mockResolvedValue({
      id: 'sess-1',
      revokedAt: new Date(),
    });

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeGetRequest('http://test/api/operator/auth/sessions/sess-1'),
      { params: Promise.resolve({ id: 'sess-1' }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, id: 'sess-1' });
    // Não tenta fazer update porque já está revogada
    expect(mockOperatorSessionUpdate).not.toHaveBeenCalled();
  });

  it('retorna 404 quando a sessão não existe', async () => {
    const token = makeAccessToken('op-1', 'OPERATOR');
    cookieStore.current = { cockpit_session: token };
    mockOperatorFindUnique.mockResolvedValue(mockOperator);
    mockOperatorSessionFindFirst.mockResolvedValue(null);

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeGetRequest('http://test/api/operator/auth/sessions/ghost-session'),
      { params: Promise.resolve({ id: 'ghost-session' }) }
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/não encontrada/);
  });

  it('retorna 404 para sessão pertencente a outro operator (filtro operatorId)', async () => {
    // O route usa findFirst com { operatorId: operator.id } como filtro.
    // Uma sessão de outro operator nunca é retornada → 404 (não vaza existência).
    const token = makeAccessToken('op-1', 'OPERATOR');
    cookieStore.current = { cockpit_session: token };
    mockOperatorFindUnique.mockResolvedValue(mockOperator);
    mockOperatorSessionFindFirst.mockResolvedValue(null);

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeGetRequest('http://test/api/operator/auth/sessions/sess-other-op'),
      { params: Promise.resolve({ id: 'sess-other-op' }) }
    );

    expect(res.status).toBe(404);
  });

  it('retorna 401 sem token de acesso', async () => {
    cookieStore.current = {};

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeGetRequest('http://test/api/operator/auth/sessions/sess-1'),
      { params: Promise.resolve({ id: 'sess-1' }) }
    );

    expect(res.status).toBe(401);
  });

  it('retorna 401 com JWT inválido', async () => {
    cookieStore.current = { cockpit_session: 'invalid.jwt.token' };

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeGetRequest('http://test/api/operator/auth/sessions/sess-1'),
      { params: Promise.resolve({ id: 'sess-1' }) }
    );

    expect(res.status).toBe(401);
  });

  it('retorna 429 quando rate-limit por operator é excedido (Fase 24)', async () => {
    const token = makeAccessToken('op-1', 'OPERATOR');
    cookieStore.current = { cockpit_session: token };
    mockOperatorFindUnique.mockResolvedValue(mockOperator);
    mockCheckOperatorRateLimit.mockResolvedValue({
      allowed: false,
      limit: 10,
      remaining: 0,
      resetAt: new Date(Date.now() + 60_000),
      retryAfterSeconds: 45,
    });

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeGetRequest('http://test/api/operator/auth/sessions/sess-1'),
      { params: Promise.resolve({ id: 'sess-1' }) }
    );

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/excedido|Tente novamente/i);
    expect(res.headers.get('Retry-After')).toBe('45');
  });
});

// ============================================================================
// GET /api/operator/auth/mfa/status
// ============================================================================

describe('GET /api/operator/auth/mfa/status', () => {
  it('retorna { mfaEnabled: true } quando MFA está ativo (Fase 20)', async () => {
    const token = makeAccessToken('op-admin', 'ADMIN');
    cookieStore.current = { cockpit_session: token };
    mockOperatorFindUnique.mockResolvedValue(mockAdminOperator);
    mockOperatorSessionFindUnique.mockResolvedValue({
      id: 'sess-1',
      operatorId: 'op-admin',
      type: 'ACCESS',
      expiresAt: new Date(Date.now() + 3600_000),
      refreshExpiresAt: null,
      revokedAt: null,
    });
    // MFA ativo com TOTP
    mockOperatorMfaFindUnique.mockResolvedValue({
      operatorId: 'op-admin',
      enabled: true,
      secretEncrypted: 'fake-encrypted',
      recoveryCodesHash: '[]',
      lastUsedStep: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { GET } = await import('@/app/api/operator/auth/mfa/status/route');
    const res = await GET(makeGetRequest('http://test/api/operator/auth/mfa/status'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mfaEnabled).toBe(true);
    expect(body.role).toBe('ADMIN');
  });

  it('retorna { mfaEnabled: false } quando MFA não está configurado (Fase 20)', async () => {
    const token = makeAccessToken('op-1', 'OPERATOR');
    cookieStore.current = { cockpit_session: token };
    mockOperatorFindUnique.mockResolvedValue(mockOperator);
    mockOperatorMfaFindUnique.mockResolvedValue(null);

    const { GET } = await import('@/app/api/operator/auth/mfa/status/route');
    const res = await GET(makeGetRequest('http://test/api/operator/auth/mfa/status'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mfaEnabled).toBe(false);
    expect(body.role).toBe('OPERATOR');
  });

  it('retorna { mfaEnabled: false } quando MFA está em setup pendente (enabled=false)', async () => {
    const token = makeAccessToken('op-admin', 'ADMIN');
    cookieStore.current = { cockpit_session: token };
    mockOperatorFindUnique.mockResolvedValue(mockAdminOperator);
    mockOperatorSessionFindUnique.mockResolvedValue({
      id: 'sess-1',
      operatorId: 'op-admin',
      type: 'ACCESS',
      expiresAt: new Date(Date.now() + 3600_000),
      refreshExpiresAt: null,
      revokedAt: null,
    });
    // MFA existe mas enabled=false (setup pendente)
    mockOperatorMfaFindUnique.mockResolvedValue({
      operatorId: 'op-admin',
      enabled: false,
      secretEncrypted: 'fake-encrypted',
      recoveryCodesHash: '[]',
      lastUsedStep: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { GET } = await import('@/app/api/operator/auth/mfa/status/route');
    const res = await GET(makeGetRequest('http://test/api/operator/auth/mfa/status'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mfaEnabled).toBe(false);
  });

  it('retorna 401 sem token de acesso', async () => {
    cookieStore.current = {};

    const { GET } = await import('@/app/api/operator/auth/mfa/status/route');
    const res = await GET(makeGetRequest('http://test/api/operator/auth/mfa/status'));

    expect(res.status).toBe(401);
  });

  it('retorna 401 com JWT expirado', async () => {
    const expired = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '-1s' }
    );
    cookieStore.current = { cockpit_session: expired };

    const { GET } = await import('@/app/api/operator/auth/mfa/status/route');
    const res = await GET(makeGetRequest('http://test/api/operator/auth/mfa/status'));

    expect(res.status).toBe(401);
  });

  it('retorna 401 com JWT de tipo refresh (não access)', async () => {
    const refreshToken = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: refreshToken };

    const { GET } = await import('@/app/api/operator/auth/mfa/status/route');
    const res = await GET(makeGetRequest('http://test/api/operator/auth/mfa/status'));

    expect(res.status).toBe(401);
  });
});
