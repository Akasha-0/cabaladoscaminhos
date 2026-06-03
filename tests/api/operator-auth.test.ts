// tests/api/operator-auth.test.ts
// Integração das rotas /api/operator/auth/* (Fase 8 + 13 + 15 + 18).
// Cobre: login (emite par access+refresh, 2 cookies), logout (revoga
// 2 sessions, limpa 2 cookies), register (auto-login com 2 cookies),
// me (só aceita access, não refresh), rate-limit (Fase 18).

// Fase 18: desabilita rate-limit por padrão neste suite — os testes
// rodam muitas requests em sequência e não queremos que se bloqueiem
// mutuamente. O comportamento de rate-limit em si é coberto por
// `tests/lib/auth/rate-limit.test.ts`.
process.env.AUTH_RL_LOGIN_MAX = '10000';
process.env.AUTH_RL_REGISTER_MAX = '10000';
process.env.AUTH_RL_REFRESH_MAX = '10000';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// ----------------------------------------------------------------------------
// Mocks globais
// ----------------------------------------------------------------------------

const TEST_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-that-is-at-least-32-bytes-long';

// bcryptjs — mockado para evitar o custo real de hashing nos testes
const mockBcryptHash = vi.fn();
const mockBcryptCompare = vi.fn();

vi.mock('bcryptjs', () => {
  const hash = (...args: unknown[]) => mockBcryptHash(...args);
  const compare = (...args: unknown[]) => mockBcryptCompare(...args);
  return { default: { hash, compare }, hash, compare };
});
// Prisma — Operator + OperatorSession models mockados
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockOperatorSessionCreate = vi.fn();
const mockOperatorSessionFindUnique = vi.fn();
vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: (args: unknown) => mockFindUnique(args),
      create: (args: unknown) => mockCreate(args),
    },
    operatorMfa: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    operatorSession: {
      findUnique: (args: unknown) => mockOperatorSessionFindUnique(args),
      create: (args: unknown) => mockOperatorSessionCreate(args),
    },
  },
}));

// Cookie store mockado (compartilhado pelos testes do /me)
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

beforeEach(() => {
  vi.clearAllMocks();
  mockBcryptHash.mockImplementation(async (pw: string) => `hashed:${pw}`);
  mockBcryptCompare.mockImplementation(async (pw: string, hash: string) => hash === `hashed:${pw}`);
  cookieStore.current = {};
});

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const mockOperatorRecord = {
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

function makeGetRequest(url: string, cookie?: string): NextRequest {
  return new NextRequest(url, {
    method: 'GET',
    headers: cookie ? { cookie: `cockpit_session=${cookie}` } : {},
  });
}

/** Extrai o Set-Cookie do response. */
function getSetCookie(response: Response): string | null {
  // Em Next.js, cookies vêm em response.headers.get('set-cookie')
  return response.headers.get('set-cookie');
}

function getAllSetCookies(response: Response): string[] {
  // Pode haver múltiplos Set-Cookie headers
  const single = response.headers.get('set-cookie');
  if (!single) return [];
  return [single];
  // Em algumas plataformas é uma string com múltiplos cookies separados
  // por ', ' (mas ', ' também aparece em Expires=Wed, 01 Jan...)
  // Para simplicidade do teste, assumimos 1-2 cookies por request
}

// ============================================================================
// POST /api/operator/auth/login
// ============================================================================

describe('POST /api/operator/auth/login', () => {
  it('retorna 200 + operator + 2 cookies quando credenciais corretas (Fase 15)', async () => {
    mockFindUnique.mockResolvedValue(mockOperatorRecord);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-1' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ramiro@cabala.com',
      password: 'secret123',
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.operator).toMatchObject({
      id: 'op-1',
      email: 'ramiro@cabala.com',
      name: 'Ramiro',
      role: 'OPERATOR',
    });
    // Sem passwordHash na response
    expect(body.operator.passwordHash).toBeUndefined();

    // 2 cookies setados (access + refresh)
    const setCookie = getSetCookie(res);
    expect(setCookie).toMatch(/cockpit_session=/);
    expect(setCookie).toMatch(/cockpit_refresh=/);
  });

  it('access cookie tem JWT válido com type=access (Fase 15)', async () => {
    mockFindUnique.mockResolvedValue(mockOperatorRecord);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-1' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ramiro@cabala.com',
      password: 'secret123',
    }));

    const setCookie = getSetCookie(res);
    const tokenMatch = setCookie?.match(/cockpit_session=([^;]+)/);
    const token = tokenMatch?.[1];
    expect(token).toBeTruthy();

    const decoded = jwt.verify(token!, TEST_SECRET, { algorithms: ['HS256'] });
    expect((decoded as { sub: string }).sub).toBe('op-1');
    expect((decoded as { role: string }).role).toBe('OPERATOR');
    expect((decoded as { type: string }).type).toBe('access');
  });

  it('refresh cookie tem JWT válido com type=refresh (Fase 15)', async () => {
    mockFindUnique.mockResolvedValue(mockOperatorRecord);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-1' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ramiro@cabala.com',
      password: 'secret123',
    }));

    const setCookie = getSetCookie(res);
    const tokenMatch = setCookie?.match(/cockpit_refresh=([^;]+)/);
    const token = tokenMatch?.[1];
    expect(token).toBeTruthy();

    const decoded = jwt.verify(token!, TEST_SECRET, { algorithms: ['HS256'] });
    expect((decoded as { sub: string }).sub).toBe('op-1');
    expect((decoded as { type: string }).type).toBe('refresh');
  });

  it('cria DUAS OperatorSession (ACCESS + REFRESH) — Fase 15', async () => {
    mockFindUnique.mockResolvedValue(mockOperatorRecord);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-1' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ramiro@cabala.com',
      password: 'secret123',
    }));

    expect(res.status).toBe(200);
    expect(mockOperatorSessionCreate).toHaveBeenCalledTimes(2);

    const types = mockOperatorSessionCreate.mock.calls.map(
      (call) => (call[0] as { data: { type: string } }).data.type
    );
    expect(types).toContain('ACCESS');
    expect(types).toContain('REFRESH');
  });

  it('retorna 401 quando email não existe', async () => {
    mockFindUnique.mockResolvedValue(null);

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'naoexiste@cabala.com',
      password: 'qualquer',
    }));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/inválid/); // mensagem genérica (anti-enumeração)
    expect(getSetCookie(res)).toBeNull();
  });

  it('retorna 401 quando senha está errada', async () => {
    mockFindUnique.mockResolvedValue(mockOperatorRecord);
    // mockBcryptCompare retorna false para senhas erradas por padrão

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'ramiro@cabala.com',
      password: 'wrong',
    }));

    expect(res.status).toBe(401);
  });

  it('retorna 400 em input inválido (sem email)', async () => {
    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      password: 'x',
    }));
    expect(res.status).toBe(400);
  });

  it('retorna 400 em email mal formatado', async () => {
    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: 'not-an-email',
      password: 'x',
    }));
    expect(res.status).toBe(400);
  });

  it('normaliza email (lowercase + trim) na busca', async () => {
    mockFindUnique.mockResolvedValue(mockOperatorRecord);

    const { POST } = await import('@/app/api/operator/auth/login/route');
    await POST(makeJsonRequest('http://l/api/operator/auth/login', {
      email: '  Ramiro@Cabala.COM  ',
      password: 'secret123',
    }));

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: 'ramiro@cabala.com' },
    });
  });
});

// ============================================================================
// POST /api/operator/auth/logout
// ============================================================================

describe('POST /api/operator/auth/logout', () => {
  it('sempre retorna 200', async () => {
    const { POST } = await import('@/app/api/operator/auth/logout/route');
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('limpa os 2 cookies cockpit_session + cockpit_refresh (Fase 15)', async () => {
    const { POST } = await import('@/app/api/operator/auth/logout/route');
    const res = await POST();
    const setCookie = getSetCookie(res);
    expect(setCookie).toMatch(/cockpit_session=/);
    expect(setCookie).toMatch(/cockpit_refresh=/);
    expect(setCookie).toMatch(/Max-Age=0/);
  });

  it('é idempotente — funciona mesmo sem login prévio', async () => {
    const { POST } = await import('@/app/api/operator/auth/logout/route');
    const res1 = await POST();
    const res2 = await POST();
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });
});

// ============================================================================
// POST /api/operator/auth/register
// ============================================================================

describe('POST /api/operator/auth/register', () => {
  it('cria Operator + auto-login (seta 2 cookies) com dados válidos', async () => {
    mockFindUnique.mockResolvedValue(null); // email não existe
    mockCreate.mockResolvedValue(mockOperatorRecord);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-1' });

    const { POST } = await import('@/app/api/operator/auth/register/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/register', {
      email: 'novo@cabala.com',
      name: 'Novo Operator',
      password: 'senha12345',
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.operator).toMatchObject({
      id: 'op-1',
      email: 'ramiro@cabala.com', // mockOperatorRecord
      name: 'Ramiro',
      role: 'OPERATOR',
    });
    expect(body.operator.passwordHash).toBeUndefined();

    const setCookie = getSetCookie(res);
    expect(setCookie).toMatch(/cockpit_session=/);
    expect(setCookie).toMatch(/cockpit_refresh=/);
  });

  it('bcrypt.hash é chamado com a senha e cost factor 12', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockImplementation(async (args) => ({
      ...mockOperatorRecord,
      ...args.data,
    }));

    const { POST } = await import('@/app/api/operator/auth/register/route');
    await POST(makeJsonRequest('http://l/api/operator/auth/register', {
      email: 'novo@cabala.com',
      name: 'Novo',
      password: 'senha12345',
    }));

    expect(mockBcryptHash).toHaveBeenCalledWith('senha12345', 12);
  });

  it('retorna 409 se email já existe', async () => {
    mockFindUnique.mockResolvedValue(mockOperatorRecord);

    const { POST } = await import('@/app/api/operator/auth/register/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/register', {
      email: 'ramiro@cabala.com',
      name: 'Outro',
      password: 'senha12345',
    }));

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/já cadastrado/);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('retorna 400 em senha muito curta', async () => {
    const { POST } = await import('@/app/api/operator/auth/register/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/register', {
      email: 'novo@cabala.com',
      name: 'Novo',
      password: 'short',
    }));
    expect(res.status).toBe(400);
  });

  it('retorna 400 em email inválido', async () => {
    const { POST } = await import('@/app/api/operator/auth/register/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/register', {
      email: 'not-an-email',
      name: 'Novo',
      password: 'senha12345',
    }));
    expect(res.status).toBe(400);
  });

  it('retorna 400 em nome vazio', async () => {
    const { POST } = await import('@/app/api/operator/auth/register/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/register', {
      email: 'novo@cabala.com',
      name: '',
      password: 'senha12345',
    }));
    expect(res.status).toBe(400);
  });

  it('retorna 403 em produção quando ALLOW_OPERATOR_REGISTRATION=false', async () => {
    const savedEnv = process.env.NODE_ENV;
    const savedFlag = process.env.ALLOW_OPERATOR_REGISTRATION;
    (process.env as Record<string, string>).NODE_ENV = 'production';
    process.env.ALLOW_OPERATOR_REGISTRATION = 'false';

    const { POST } = await import('@/app/api/operator/auth/register/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/register', {
      email: 'novo@cabala.com',
      name: 'Novo',
      password: 'senha12345',
    }));
    expect(res.status).toBe(403);

    (process.env as Record<string, string>).NODE_ENV = savedEnv as string;
    if (savedFlag !== undefined) process.env.ALLOW_OPERATOR_REGISTRATION = savedFlag;
  });

  it('em dev, registro funciona sem flag (default ligado)', async () => {
    const savedEnv = process.env.NODE_ENV;
    const savedFlag = process.env.ALLOW_OPERATOR_REGISTRATION;
    (process.env as Record<string, string>).NODE_ENV = 'development';
    delete process.env.ALLOW_OPERATOR_REGISTRATION;

    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue(mockOperatorRecord);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-1' });

    const { POST } = await import('@/app/api/operator/auth/register/route');
    const res = await POST(makeJsonRequest('http://l/api/operator/auth/register', {
      email: 'novo@cabala.com',
      name: 'Novo',
      password: 'senha12345',
    }));
    expect(res.status).toBe(201);

    (process.env as Record<string, string>).NODE_ENV = savedEnv as string;
    if (savedFlag !== undefined) process.env.ALLOW_OPERATOR_REGISTRATION = savedFlag;
  });
});

// ============================================================================
// GET /api/operator/auth/me
// ============================================================================

describe('GET /api/operator/auth/me', () => {
  it('retorna operator quando autenticado via JWT cookie (access)', async () => {
    const token = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: token };
    mockFindUnique.mockResolvedValue(mockOperatorRecord);
    mockOperatorSessionFindUnique.mockResolvedValue({
      id: 'sess-1',
      operatorId: 'op-1',
      type: 'ACCESS',
      expiresAt: new Date(Date.now() + 3600_000),
      refreshExpiresAt: null,
      revokedAt: null,
    });
    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/me'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.operator).toMatchObject({
      id: 'op-1',
      email: 'ramiro@cabala.com',
      role: 'OPERATOR',
    });
    expect(body.operator.passwordHash).toBeUndefined();
  });

  it('retorna 401 quando não há cookie', async () => {
    cookieStore.current = {};
    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/me'));
    expect(res.status).toBe(401);
  });

  it('retorna 401 quando cookie JWT é inválido', async () => {
    cookieStore.current = { cockpit_session: 'invalid-jwt' };
    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/me'));
    expect(res.status).toBe(401);
  });

  it('retorna 401 quando token é expirado', async () => {
    const expired = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '-1s' }
    );
    cookieStore.current = { cockpit_session: expired };
    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/me'));
    expect(res.status).toBe(401);
  });

  it('retorna 401 quando cookie é REFRESH (não access) — Fase 15', async () => {
    const refresh = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: refresh };
    mockFindUnique.mockResolvedValue(mockOperatorRecord);

    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/me'));
    expect(res.status).toBe(401);
  });

  it('retorna 401 quando token não tem type (back-compat Fase 13)', async () => {
    const oldToken = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR' }, // sem type
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: oldToken };
    mockFindUnique.mockResolvedValue(mockOperatorRecord);

    const { GET } = await import('@/app/api/operator/auth/me/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/me'));
    expect(res.status).toBe(401);
  });
});
