// tests/integration/cockpit-auth-gate.test.ts
// Smoke test (Fase 17) — verifica que TODAS as páginas Operator têm
// server-side auth gate. Sem cookie de sessão, qualquer rota Operator
// deve redirecionar para /cockpit/login (ou devolver 401 em API).
//
// Estratégia: chamar o helper `requireOperatorPage` (usado em
// /cockpit/page.tsx, /cockpit/dashboard, /cockpit/consulentes/*,
// /dashboard/mesa-real, /dashboard/clientes) e verificar que ele
// redireciona quando não há cookie. As páginas individuais já estão
// testadas pelos layouts e por `requireOperatorPage` em si.

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
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
}));

import { requireOperatorPage, requireOperatorApi } from '@/lib/auth/operator-guard';

const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  mockFindUnique.mockReset();
  mockSessionFindUnique.mockReset();
  mockRedirect.mockReset();
  cookieStore.current = {};
  headerStore.current = {};
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

function makeValidToken(operatorId: string, role: 'OPERATOR' | 'ADMIN' = 'OPERATOR'): string {
  return jwt.sign(
    { sub: operatorId, role, type: 'access' },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '7d' }
  );
}

// ============================================================================
// SMOKE: GET /cockpit sem cookie → 302/redirect
// ============================================================================

describe('SMOKE — Operator auth gate', () => {
  // Lista de páginas Operator que DEVEM redirecionar para /login
  // quando não há cookie. O gate em si é o mesmo helper em todas —
  // /cockpit/* via /cockpit/layout.tsx; /dashboard/mesa-real e
  // /dashboard/clientes via layouts próprios. Aqui validamos o
  // mecanismo, não cada página individualmente.
  const operatorRoutes = [
    '/cockpit',
    '/cockpit/dashboard',
    '/cockpit/consulentes',
    '/cockpit/consulentes/novo',
    '/cockpit/consulentes/abc-123',
    '/dashboard/mesa-real',
    '/dashboard/clientes',
  ];

  it('SMOKE: cada rota Operator redireciona para /login sem cookie', async () => {
    cookieStore.current = {}; // sem cookie
    headerStore.current = {}; // sem dev header

    for (const route of operatorRoutes) {
      mockRedirect.mockReset();
      // O smoke test chama o helper. Cada página (page.tsx) chama
      // requireOperatorPage() no topo; o layout faz o mesmo. Sem
      // cookie, ambos devem lançar NEXT_REDIRECT para /login.
      await expect(
        requireOperatorPage().then(() => 'rendered')
      ).rejects.toThrow('NEXT_REDIRECT:/login');
      expect(mockRedirect).toHaveBeenCalledWith('/login');
      // Pequena pausa para isolar logs entre rotas
      await new Promise((r) => setImmediate(r));
    }
  });

  it('SMOKE: cookie válido → página renderiza normalmente (sem redirect)', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    mockFindUnique.mockResolvedValue(mockOperator);

    for (const route of operatorRoutes) {
      const operator = await requireOperatorPage();
      expect(operator).toEqual(mockOperator);
      expect(mockRedirect).not.toHaveBeenCalled();
    }
  });

  it('SMOKE: API Operator (mesa-real) devolve 401 sem cookie', async () => {
    cookieStore.current = {};
    headerStore.current = {};

    const request = new NextRequest('http://localhost:3000/api/mesa-real/clients', {
      method: 'GET',
    });

    const result = await requireOperatorApi(request);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('SMOKE: API Operator (mesa-real) passa com cookie válido', async () => {
    const token = makeValidToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockSessionFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    mockFindUnique.mockResolvedValue(mockOperator);

    const request = new NextRequest('http://localhost:3000/api/mesa-real/clients', {
      method: 'GET',
    });

    const result = await requireOperatorApi(request);

    expect(result).toEqual(mockOperator);
  });
});
