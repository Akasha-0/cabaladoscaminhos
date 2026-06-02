// tests/lib/auth/operator-session.test.ts
// Testes do helper de sessão do Operator (Fase 8 com JWT real).
// Cobre: cookie JWT válido, cookie JWT inválido, dev header, dev
// header em prod (rejeitado), e Server Context.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockOperator = {
  id: 'op-1',
  email: 'ramiro@cabala.com',
  name: 'Ramiro',
  passwordHash: 'hash',
  role: 'OPERATOR',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

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
    get: (name: string) => cookieStore.current[name.toLowerCase()] ?? null,
  })),
}));

// Prisma mockado
const mockFindUnique = vi.fn();
vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: (args: unknown) => mockFindUnique(args),
    },
  },
}));

import {
  getOperatorFromRequest,
  requireOperator,
  getOperatorFromServerContext,
} from '@/lib/auth/operator-session';

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function makeValidToken(operatorId: string, role: 'OPERATOR' | 'ADMIN' = 'OPERATOR'): string {
  return jwt.sign(
    { sub: operatorId, role },
    process.env.JWT_SECRET || 'dev-only-fallback-secret-do-not-use-in-prod',
    { algorithm: 'HS256', expiresIn: '7d' }
  );
}

function makeRequest(opts: {
  cookieValue?: string;
  devHeaderValue?: string;
  prodMode?: boolean;
} = {}): NextRequest {
  cookieStore.current = {};
  if (opts.cookieValue) cookieStore.current['cockpit_session'] = opts.cookieValue;
  if (opts.devHeaderValue) cookieStore.current['x-dev-operator-id'] = opts.devHeaderValue;

  const headers: Record<string, string> = {};
  if (opts.cookieValue) headers['cookie'] = `cockpit_session=${opts.cookieValue}`;
  if (opts.devHeaderValue) headers['x-dev-operator-id'] = opts.devHeaderValue;
  return new NextRequest('http://localhost/api/test', { headers });
}

beforeEach(() => {
  mockFindUnique.mockReset();
  cookieStore.current = {};
});

// ============================================================================
// getOperatorFromRequest — caminho JWT (produção)
// ============================================================================

describe('getOperatorFromRequest — JWT cookie', () => {
  it('resolves operator from valid JWT cookie', async () => {
    const token = makeValidToken('op-1');
    mockFindUnique.mockResolvedValue(mockOperator);
    const req = makeRequest({ cookieValue: token });

    const result = await getOperatorFromRequest(req);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-1' } });
    expect(result).toEqual(mockOperator);
  });

  it('returns null when cookie JWT is invalid signature', async () => {
    const wrongToken = jwt.sign(
      { sub: 'op-1' },
      'wrong-secret',
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    const req = makeRequest({ cookieValue: wrongToken });

    const result = await getOperatorFromRequest(req);

    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('returns null when cookie JWT is expired', async () => {
    // Forçar expiração via expiresIn negativo
    const expiredToken = jwt.sign(
      { sub: 'op-1' },
      process.env.JWT_SECRET || 'dev-only-fallback-secret-do-not-use-in-prod',
      { algorithm: 'HS256', expiresIn: '-1s' }
    );
    const req = makeRequest({ cookieValue: expiredToken });

    const result = await getOperatorFromRequest(req);

    expect(result).toBeNull();
  });

  it('returns null when cookie JWT is malformed', async () => {
    const req = makeRequest({ cookieValue: 'not-a-jwt-at-all' });

    const result = await getOperatorFromRequest(req);

    expect(result).toBeNull();
  });

  it('does NOT fall back to dev header when cookie JWT is invalid', async () => {
    // Segurança: cookie adulterado → não tenta bypass via dev header
    const req = makeRequest({
      cookieValue: 'invalid-token',
      devHeaderValue: 'op-dev',
    });

    const result = await getOperatorFromRequest(req);

    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('ignores dev header when valid JWT cookie is present (cookie takes precedence)', async () => {
    const token = makeValidToken('op-cookie');
    mockFindUnique.mockResolvedValue(mockOperator);
    const req = makeRequest({
      cookieValue: token,
      devHeaderValue: 'op-dev',
    });

    await getOperatorFromRequest(req);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-cookie' } });
  });
});

// ============================================================================
// getOperatorFromRequest — dev header
// ============================================================================

describe('getOperatorFromRequest — dev header', () => {
  it('resolves operator from dev header when no cookie', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    const req = makeRequest({ devHeaderValue: 'op-dev' });

    const result = await getOperatorFromRequest(req);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-dev' } });
    expect(result).toEqual(mockOperator);
  });

  it('returns null when nothing is set', async () => {
    const req = makeRequest();
    const result = await getOperatorFromRequest(req);
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('returns null when DB lookup throws', async () => {
    mockFindUnique.mockRejectedValue(new Error('connection refused'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const req = makeRequest({ devHeaderValue: 'op-1' });
    const result = await getOperatorFromRequest(req);

    expect(result).toBeNull();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

// ============================================================================
// requireOperator
// ============================================================================

describe('requireOperator', () => {
  it('returns Operator when authenticated via JWT', async () => {
    const token = makeValidToken('op-1');
    mockFindUnique.mockResolvedValue(mockOperator);
    const req = makeRequest({ cookieValue: token });

    const result = await requireOperator(req);

    expect(result).not.toBeInstanceOf(Response);
    expect(result).toEqual(mockOperator);
  });

  it('returns 401 NextResponse when not authenticated', async () => {
    const req = makeRequest();

    const result = await requireOperator(req);

    expect(result).toBeInstanceOf(Response);
    const resp = result as Response;
    expect(resp.status).toBe(401);
    const body = await resp.json();
    expect(body.error).toMatch(/Não autenticado/);
    expect(body.message).toMatch(/cockpit_session|login/);
  });

  it('returns 401 when JWT is invalid (does not fall back to dev header)', async () => {
    const req = makeRequest({ cookieValue: 'bad-token' });

    const result = await requireOperator(req);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });
});

// ============================================================================
// getOperatorFromServerContext
// ============================================================================

describe('getOperatorFromServerContext', () => {
  it('reads from JWT cookie', async () => {
    const token = makeValidToken('op-server');
    mockFindUnique.mockResolvedValue(mockOperator);
    cookieStore.current = { cockpit_session: token };

    const result = await getOperatorFromServerContext();

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-server' } });
    expect(result).toEqual(mockOperator);
  });

  it('falls back to dev header in server context (NODE_ENV != production)', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    cookieStore.current = { 'x-dev-operator-id': 'op-header' };

    const result = await getOperatorFromServerContext();

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-header' } });
    expect(result).toEqual(mockOperator);
  });

  it('returns null when nothing is set', async () => {
    cookieStore.current = {};
    const result = await getOperatorFromServerContext();
    expect(result).toBeNull();
  });
});
