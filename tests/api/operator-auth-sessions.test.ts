// tests/api/operator-auth-sessions.test.ts
// Integração das rotas de auth com OperatorSession (Fase 13).
// Cobre: login cria session, logout revoga, /me valida não-revogação.

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
    },
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
// Login cria OperatorSession
// ============================================================================

describe('POST /api/operator/auth/login — OperatorSession (Fase 13)', () => {
  it('cria OperatorSession com hash SHA-256 do token após login bem-sucedido', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-1' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ramiro@cabala.com',
      password: 'secret123',
    }));

    expect(res.status).toBe(200);
    expect(mockOperatorSessionCreate).toHaveBeenCalledTimes(1);

    const callArg = mockOperatorSessionCreate.mock.calls[0][0] as {
      data: {
        operatorId: string;
        tokenHash: string;
        expiresAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
      };
    };
    expect(callArg.data.operatorId).toBe('op-1');
    expect(callArg.data.tokenHash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
    expect(callArg.data.expiresAt).toBeInstanceOf(Date);
    expect(callArg.data.ipAddress).toBeNull();
    expect(callArg.data.userAgent).toBeNull();
  });

  it('passa ipAddress e userAgent do request para a session', async () => {
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

    const callArg = mockOperatorSessionCreate.mock.calls[0][0] as {
      data: { ipAddress: string | null; userAgent: string | null };
    };
    expect(callArg.data.ipAddress).toBe('203.0.113.42');
    expect(callArg.data.userAgent).toBe('Mozilla/5.0 (Test)');
  });

  it('login ainda funciona se createSession falhar (degradação suave)', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    mockOperatorSessionCreate.mockRejectedValue(new Error('DB timeout'));

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ramiro@cabala.com',
      password: 'secret123',
    }));

    // 200 mesmo se session-create falha
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
// Logout revoga OperatorSession
// ============================================================================

describe('POST /api/operator/auth/logout — revoga OperatorSession (Fase 13)', () => {
  it('revoga a session do token no cookie', async () => {
    const token = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR' },
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

  it('é idempotente — sem cookie, retorna 200 e não tenta update', async () => {
    cookieStore.current = {};

    const { POST } = await import('@/app/api/operator/auth/logout/route');
    const res = await POST();

    expect(res.status).toBe(200);
    expect(mockOperatorSessionUpdate).not.toHaveBeenCalled();
  });

  it('falha de DB no revoke não bloqueia o logout (best-effort)', async () => {
    const token = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR' },
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
// /me valida session ativa
// ============================================================================

describe('GET /api/operator/auth/me — valida não-revogação (Fase 13)', () => {
  it('retorna 401 se session foi revogada (mesmo com JWT válido)', async () => {
    const token = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(), // ← revogada!
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
      { sub: 'op-1', role: 'OPERATOR' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindUnique.mockResolvedValue(null); // session não existe

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
      { sub: 'op-1', role: 'OPERATOR' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() - 1000), // 1s atrás
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
      { sub: 'op-1', role: 'OPERATOR' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
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
});
