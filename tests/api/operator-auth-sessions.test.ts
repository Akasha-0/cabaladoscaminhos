// tests/api/operator-auth-sessions.test.ts
// Integração das rotas de auth com OperatorSession (Fase 13 + 15 + 18).
// Cobre: login cria 2 sessions (ACCESS+REFRESH), logout revoga ambas,
// /me valida não-revogação + type=access, /refresh faz rotação e
// detecta reuso.

// Fase 18: desabilita rate-limit (sufixos altos) — ver nota em
// `tests/api/operator-auth.test.ts`.
process.env.AUTH_RL_LOGIN_MAX = '10000';
process.env.AUTH_RL_REGISTER_MAX = '10000';
process.env.AUTH_RL_REFRESH_MAX = '10000';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const TEST_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-that-is-at-least-32-bytes-long';

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockOperatorSessionFindUnique = vi.fn();
const mockOperatorSessionCreate = vi.fn();
const mockOperatorSessionUpdate = vi.fn();
const mockOperatorSessionUpdateMany = vi.fn();
const mockTransaction = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: (args: unknown) => mockFindUnique(args),
      create: (args: unknown) => mockCreate(args),
    },
    operatorSession: {
      findUnique: (args: unknown) => mockOperatorSessionFindUnique(args),
      create: (args: unknown) => mockOperatorSessionCreate(args),
      update: (args: unknown) => mockOperatorSessionUpdate(args),
      updateMany: (args: unknown) => mockOperatorSessionUpdateMany(args),
    },
    $transaction: (args: unknown) => mockTransaction(args),
  },
}));

// bcryptjs
const mockBcryptHash = vi.fn();
const mockBcryptCompare = vi.fn();
vi.mock('bcryptjs', () => {
  const hash = (...args: unknown[]) => mockBcryptHash(...args);
  const compare = (...args: unknown[]) => mockBcryptCompare(...args);
  return { default: { hash, compare }, hash, compare };
});

const cookieStore: { current: Record<string, string> } = { current: {} };
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const v = cookieStore.current[name];
      return v ? { name, value: v } : undefined;
    },
  })),
  headers: vi.fn(async () => ({ get: () => null })),
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

function makeJsonRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function getSetCookie(response: Response): string | null {
  return response.headers.get('set-cookie');
}

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.current = {};
  mockBcryptHash.mockImplementation(async (pw: string) => `hashed:${pw}`);
  mockBcryptCompare.mockImplementation(async (pw: string, hash: string) => hash === `hashed:${pw}`);
});

// ============================================================================
// Login cria DUAS OperatorSession (Fase 15)
// ============================================================================

describe('POST /api/operator/auth/login — OperatorSession (Fase 13 + 15)', () => {
  it('cria OperatorSession ACCESS com hash SHA-256 do token após login', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-1' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ramiro@cabala.com',
      password: 'secret123',
    }));

    expect(res.status).toBe(200);
    expect(mockOperatorSessionCreate).toHaveBeenCalledTimes(2);

    const accessCall = mockOperatorSessionCreate.mock.calls.find(
      (call) => (call[0] as { data: { type: string } }).data.type === 'ACCESS'
    );
    expect(accessCall).toBeDefined();
    const callArg = (accessCall![0] as {
      data: {
        operatorId: string;
        tokenHash: string;
        expiresAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
      };
    });
    expect(callArg.data.operatorId).toBe('op-1');
    expect(callArg.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(callArg.data.expiresAt).toBeInstanceOf(Date);
  });

  it('cria OperatorSession REFRESH com TTL de 30d (Fase 15)', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-2' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ramiro@cabala.com',
      password: 'secret123',
    }));

    expect(res.status).toBe(200);

    const refreshCall = mockOperatorSessionCreate.mock.calls.find(
      (call) => (call[0] as { data: { type: string } }).data.type === 'REFRESH'
    );
    expect(refreshCall).toBeDefined();
    const callArg = (refreshCall![0] as {
      data: {
        operatorId: string;
        tokenHash: string;
        type: string;
        refreshExpiresAt: Date;
      };
    });
    expect(callArg.data.operatorId).toBe('op-1');
    expect(callArg.data.type).toBe('REFRESH');
    expect(callArg.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    // refreshExpiresAt deve ser ~agora + 30d
    const expected = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const actual = callArg.data.refreshExpiresAt.getTime();
    expect(actual).toBeGreaterThanOrEqual(expected - 1000);
    expect(actual).toBeLessThanOrEqual(expected + 1000);
  });

  it('passa ipAddress e userAgent do request para ambas as sessions', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-2' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const req = new NextRequest('http://l/api/operator/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.42',
        'user-agent': 'Mozilla/5.0 (Test)',
      },
      body: JSON.stringify({
        email: 'ramiro@cabala.com',
        password: 'secret123',
      }),
    });
    await POST(req);

    expect(mockOperatorSessionCreate).toHaveBeenCalledTimes(2);
    for (const call of mockOperatorSessionCreate.mock.calls) {
      const arg = call[0] as { data: { ipAddress: string | null; userAgent: string | null } };
      expect(arg.data.ipAddress).toBe('203.0.113.42');
      expect(arg.data.userAgent).toBe('Mozilla/5.0 (Test)');
    }
  });

  it('login ainda funciona se createSession falhar (degradação suave)', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    mockOperatorSessionCreate.mockRejectedValue(new Error('DB timeout'));

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ramiro@cabala.com',
      password: 'secret123',
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.operator).toBeDefined();
  });

  it('NÃO cria session se credenciais inválidas (404/401 path)', async () => {
    mockFindUnique.mockResolvedValue(null); // operator não existe

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ghost@cabala.com',
      password: 'wrong',
    }));

    expect(res.status).toBe(401);
    expect(mockOperatorSessionCreate).not.toHaveBeenCalled();
  });
});

// ============================================================================
// Logout revoga AMBAS as OperatorSession (Fase 15)
// ============================================================================

describe('POST /api/operator/auth/logout — revoga OperatorSession (Fase 13 + 15)', () => {
  it('revoga a session do access token no cookie', async () => {
    const token = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindUnique.mockResolvedValue({
      id: 'sess-1',
      revokedAt: null,
    });
    mockOperatorSessionUpdate.mockResolvedValue({ id: 'sess-1', revokedAt: new Date() });

    const { POST } = await import('@/app/api/operator/auth/logout/route');
    const res = await POST();

    expect(res.status).toBe(200);
    expect(mockOperatorSessionUpdate).toHaveBeenCalledWith({
      where: { id: 'sess-1' },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('revoga também a session do refresh token (Fase 15)', async () => {
    const accessToken = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    const refreshToken = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = {
      cockpit_session: accessToken,
      cockpit_refresh: refreshToken,
    };
    mockOperatorSessionFindUnique
      .mockResolvedValueOnce({ id: 'sess-1', revokedAt: null }) // access
      .mockResolvedValueOnce({ id: 'sess-2', revokedAt: null }); // refresh
    mockOperatorSessionUpdate.mockResolvedValue({ id: 'sess-1', revokedAt: new Date() });

    const { POST } = await import('@/app/api/operator/auth/logout/route');
    const res = await POST();

    expect(res.status).toBe(200);
    // update foi chamado 2x (access + refresh)
    expect(mockOperatorSessionUpdate).toHaveBeenCalledTimes(2);
  });

  it('é idempotente — sem cookie, retorna 200 e não tenta update', async () => {
    cookieStore.current = {};

    const { POST } = await import('@/app/api/operator/auth/logout/route');
    const res = await POST();

    expect(res.status).toBe(200);
    expect(mockOperatorSessionUpdate).not.toHaveBeenCalled();
  });

  it('falha de DB no revoke não bloqueia o logout (best-effort)', async () => {
    const token = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindUnique.mockResolvedValue({
      id: 'sess-1',
      revokedAt: null,
    });
    mockOperatorSessionUpdate.mockRejectedValue(new Error('DB timeout'));

    const { POST } = await import('@/app/api/operator/auth/logout/route');
    const res = await POST();

    expect(res.status).toBe(200);
    // Cookie é limpo mesmo se revoke falhar
    const setCookie = getSetCookie(res);
    expect(setCookie).toMatch(/cockpit_session=/);
  });
});

// ============================================================================
// /me valida session ativa + type=access (Fase 13 + 15)
// ============================================================================

describe('GET /api/operator/auth/me — valida não-revogação (Fase 13 + 15)', () => {
  it('retorna 401 se session foi revogada (mesmo com JWT válido)', async () => {
    const token = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindUnique.mockResolvedValue({
      type: 'ACCESS',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: null,
      revokedAt: new Date(),
    });

    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(
      new NextRequest('http://l/api/operator/auth/me', {
        method: 'GET',
        headers: { cookie: `cockpit_session=${token}` },
      })
    );

    expect(res.status).toBe(401);
  });

  it('retorna 401 se session não existe (token inválido/fabricado)', async () => {
    const token = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindUnique.mockResolvedValue(null);

    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(
      new NextRequest('http://l/api/operator/auth/me', {
        method: 'GET',
        headers: { cookie: `cockpit_session=${token}` },
      })
    );

    expect(res.status).toBe(401);
  });

  it('retorna 401 se session expirou (expiresAt < now)', async () => {
    const token = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindUnique.mockResolvedValue({
      type: 'ACCESS',
      expiresAt: new Date(Date.now() - 1000),
      refreshExpiresAt: null,
      revokedAt: null,
    });

    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(
      new NextRequest('http://l/api/operator/auth/me', {
        method: 'GET',
        headers: { cookie: `cockpit_session=${token}` },
      })
    );

    expect(res.status).toBe(401);
  });

  it('retorna 200 se session é válida e ativa', async () => {
    const token = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindUnique.mockResolvedValue({
      type: 'ACCESS',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: null,
      revokedAt: null,
    });
    mockFindUnique.mockResolvedValue(mockOperator);

    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(
      new NextRequest('http://l/api/operator/auth/me', {
        method: 'GET',
        headers: { cookie: `cockpit_session=${token}` },
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.operator).toMatchObject({ id: 'op-1' });
  });

  it('retorna 401 se cookie é REFRESH (não access) — Fase 15', async () => {
    const refresh = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: refresh };
    // session ativa no DB — mas cookie errado
    mockOperatorSessionFindUnique.mockResolvedValue({
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });

    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(
      new NextRequest('http://l/api/operator/auth/me', {
        method: 'GET',
        headers: { cookie: `cockpit_session=${refresh}` },
      })
    );

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// POST /api/operator/auth/refresh (Fase 15)
// ============================================================================

describe('POST /api/operator/auth/refresh — rotação (Fase 15)', () => {
  function setupRefreshSession(opts: {
    type?: string;
    revoked?: boolean | null;
    expiresIn?: number;
  } = {}) {
    const type = opts.type ?? 'REFRESH';
    const revokedAt = opts.revoked === true ? new Date() : null;
    const expiresAt = new Date(Date.now() + (opts.expiresIn ?? 60_000) * 1000);
    mockOperatorSessionFindUnique.mockResolvedValue({
      id: 'sess-refresh',
      operatorId: 'op-1',
      type,
      expiresAt,
      refreshExpiresAt: expiresAt,
      revokedAt,
    });
  }

  it('happy path: rotaciona refresh válido e seta 2 cookies novos', async () => {
    const refresh = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '30d' }
    );
    cookieStore.current = { cockpit_refresh: refresh };
    setupRefreshSession({ type: 'REFRESH', revoked: false, expiresIn: 30 * 24 * 60 * 60 });
    mockFindUnique.mockResolvedValue(mockOperator);
    mockTransaction.mockResolvedValue([{}, {}, {}]);

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    const res = await POST();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.operator).toMatchObject({ id: 'op-1' });

    // 2 cookies setados
    const setCookie = getSetCookie(res);
    expect(setCookie).toMatch(/cockpit_session=/);
    expect(setCookie).toMatch(/cockpit_refresh=/);

    // Transação: 1 update (revoga antiga) + 2 creates (novo access + refresh)
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it('retorna 401 se refresh cookie ausente', async () => {
    cookieStore.current = {};

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    const res = await POST();

    expect(res.status).toBe(401);
  });

  it('retorna 401 se refresh JWT é inválido (assinatura)', async () => {
    cookieStore.current = { cockpit_refresh: 'invalid.jwt.token' };

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    const res = await POST();

    expect(res.status).toBe(401);
  });

  it('retorna 401 se JWT é access, não refresh', async () => {
    const access = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_refresh: access };

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    const res = await POST();

    expect(res.status).toBe(401);
  });

  it('retorna 401 se refresh session não existe no DB', async () => {
    const refresh = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '30d' }
    );
    cookieStore.current = { cockpit_refresh: refresh };
    mockOperatorSessionFindUnique.mockResolvedValue(null); // hash não bate

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    const res = await POST();

    expect(res.status).toBe(401);
  });

  it('retorna 401 se refresh expirou', async () => {
    const refresh = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '30d' }
    );
    cookieStore.current = { cockpit_refresh: refresh };
    setupRefreshSession({ type: 'REFRESH', revoked: false, expiresIn: -1 });
    mockOperatorSessionUpdate.mockResolvedValue({});

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    const res = await POST();

    expect(res.status).toBe(401);
  });

  it('retorna 403 + revoga TODAS as sessões se refresh revogado é reusado (roubo)', async () => {
    const stolen = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '30d' }
    );
    cookieStore.current = { cockpit_refresh: stolen };
    setupRefreshSession({ type: 'REFRESH', revoked: true, expiresIn: 30 * 24 * 60 * 60 });
    mockOperatorSessionUpdateMany.mockResolvedValue({ count: 5 });

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    const res = await POST();

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/comprometid/i);

    // revokeAllOperatorSessions foi chamado
    expect(mockOperatorSessionUpdateMany).toHaveBeenCalledWith({
      where: { operatorId: 'op-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });

    // Cookies são limpos
    const setCookie = getSetCookie(res);
    expect(setCookie).toMatch(/Max-Age=0/);
  });
});
