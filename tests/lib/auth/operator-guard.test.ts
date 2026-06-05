// tests/lib/auth/operator-guard.test.ts
// Testes do helper `requireOperatorPage` / `requireOperatorApi`
// (Fase 17 — auth gate padronizado em todas as páginas Operator).
//
// Cobre:
//   - `requireOperatorPage` → Operator: passa; null: redireciona.
//   - `requireOperatorApi` → Operator: passa; null: devolve 401.
//   - Helpers são thin wrappers em torno de getOperatorFromServerContext
//     e getOperatorFromRequest (Fase 14), então os edge cases (cookie
//     inválido, session revogada, etc.) são cobertos por
//     `operator-server-context.test.ts` e `operator-session.test.ts`.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

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

const mockFindUnique = vi.fn();
const mockSessionFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: { findUnique: (args: unknown) => mockFindUnique(args) },
    operatorSession: { findUnique: (args: unknown) => mockSessionFindUnique(args) },
  },
}));

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    mockRedirect(path);
    // Replicar o comportamento de next/navigation: lançar para abortar o render
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
}));

import { OPERATOR_LOGIN_PATH, requireOperatorPage, requireOperatorApi } from '@/lib/auth/operator-guard';

const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  mockFindUnique.mockReset();
  mockSessionFindUnique.mockReset();
  mockRedirect.mockReset();
  cookieStore.current = {};
  headerStore.current = {};
  process.env.NODE_ENV = 'test';
  // Habilita dev auth bypass para testes (comportamento secure: opt-in explícito)
  process.env.ALLOW_DEV_AUTH_BYPASS = 'true';
});
afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  delete process.env.ALLOW_DEV_AUTH_BYPASS;
});

function makeValidToken(operatorId: string, role: 'OPERATOR' | 'ADMIN' = 'OPERATOR'): string {
  return jwt.sign(
    { sub: operatorId, role, type: 'access' },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '7d' }
  );
}

// ============================================================================
// Constante exportada
// ============================================================================

describe('OPERATOR_LOGIN_PATH', () => {
  it('aponta para /login', () => {
    expect(OPERATOR_LOGIN_PATH).toBe('/login');
  });
});

// ============================================================================
// requireOperatorPage (Server Component)
// ============================================================================

describe('requireOperatorPage', () => {
  it('retorna o Operator quando o cookie é válido e a session está ativa', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    mockFindUnique.mockResolvedValue(mockOperator);

    const result = await requireOperatorPage();

    expect(result).toEqual(mockOperator);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redireciona para /login quando não há cookie', async () => {
    cookieStore.current = {};

    await expect(requireOperatorPage()).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redireciona quando o cookie JWT é inválido', async () => {
    cookieStore.current = { cockpit_session: 'invalid.jwt' };

    await expect(requireOperatorPage()).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redireciona quando a session foi revogada', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
    });

    await expect(requireOperatorPage()).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('NÃO redireciona via dev header em produção', async () => {
    process.env.NODE_ENV = 'production';
    headerStore.current = { 'x-dev-operator-id': 'op-dev' };

    await expect(requireOperatorPage()).rejects.toThrow('NEXT_REDIRECT:/login');
  });
});

// ============================================================================
// requireOperatorApi (Route Handler)
// ============================================================================

describe('requireOperatorApi', () => {
  function makeRequest(): NextRequest {
    // O NextRequest real lê do cookies()/headers() do next/headers, que já
    // está mockado acima — então a request é só um envelope.
    return new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
    });
  }

  it('retorna o Operator quando o cookie é válido', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    mockFindUnique.mockResolvedValue(mockOperator);

    const result = await requireOperatorApi(makeRequest());

    expect(result).toEqual(mockOperator);
    expect(result).not.toBeInstanceOf(NextResponse);
  });

  it('retorna NextResponse 401 quando não há cookie', async () => {
    cookieStore.current = {};

    const result = await requireOperatorApi(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    const response = result as NextResponse;
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('retorna NextResponse 401 quando o cookie JWT é inválido', async () => {
    cookieStore.current = { cockpit_session: 'invalid.jwt' };

    const result = await requireOperatorApi(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    const response = result as NextResponse;
    expect(response.status).toBe(401);
  });

  it('retorna NextResponse 401 quando a session foi revogada', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
    });

    const result = await requireOperatorApi(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('em produção, dev header NÃO autentica (defense in depth)', async () => {
    process.env.NODE_ENV = 'production';
    headerStore.current = { 'x-dev-operator-id': 'op-prod' };

    const result = await requireOperatorApi(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('em test/dev, dev header autentica (caminho de bypass para testes)', async () => {
    // requireOperatorApi lê o dev header de `request.headers` (NextRequest),
    // NÃO de `next/headers`. Aqui o setamos no envelope do request.
    const request = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'x-dev-operator-id': 'op-dev' },
    });
    mockFindUnique.mockResolvedValue(mockOperator);

    const result = await requireOperatorApi(request);

    expect(result).toEqual(mockOperator);
  });
});
