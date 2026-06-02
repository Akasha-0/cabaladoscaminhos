// tests/lib/auth/operator-session.test.ts
// Testes do helper de sessão do Operator (Fase 7).
// Cobre os 3 paths: cookie válido, header dev-only, e ausência (→ null/401).

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

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

function makeRequest(opts: {
  cookieValue?: string;
  devHeaderValue?: string;
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
// getOperatorFromRequest
// ============================================================================

describe('getOperatorFromRequest', () => {
  it('returns null when no cookie and no dev header', async () => {
    const req = makeRequest();
    const result = await getOperatorFromRequest(req);
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('resolves operator from cookie', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    const req = makeRequest({ cookieValue: 'op-1' });

    const result = await getOperatorFromRequest(req);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-1' } });
    expect(result).toEqual(mockOperator);
  });

  it('resolves operator from x-dev-operator-id header (dev only)', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    const req = makeRequest({ devHeaderValue: 'op-dev' });

    const result = await getOperatorFromRequest(req);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-dev' } });
    expect(result).toEqual(mockOperator);
  });

  it('cookie wins over dev header when both present', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    const req = makeRequest({
      cookieValue: 'op-cookie',
      devHeaderValue: 'op-dev',
    });

    await getOperatorFromRequest(req);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-cookie' } });
  });

  it('returns null when DB lookup throws', async () => {
    mockFindUnique.mockRejectedValue(new Error('connection refused'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const req = makeRequest({ cookieValue: 'op-1' });
    const result = await getOperatorFromRequest(req);

    expect(result).toBeNull();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('returns null when operator not found in DB', async () => {
    mockFindUnique.mockResolvedValue(null);
    const req = makeRequest({ cookieValue: 'unknown' });

    const result = await getOperatorFromRequest(req);

    expect(result).toBeNull();
  });
});

// ============================================================================
// requireOperator
// ============================================================================

describe('requireOperator', () => {
  it('returns Operator when authenticated', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    const req = makeRequest({ cookieValue: 'op-1' });

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
    expect(body.message).toMatch(/cockpit_session/);
    expect(body.message).toMatch(/x-dev-operator-id/);
  });
});

// ============================================================================
// getOperatorFromServerContext
// ============================================================================

describe('getOperatorFromServerContext', () => {
  it('reads from cookie store', async () => {
    mockFindUnique.mockResolvedValue(mockOperator);
    cookieStore.current = { cockpit_session: 'op-server' };

    const result = await getOperatorFromServerContext();

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'op-server' } });
    expect(result).toEqual(mockOperator);
  });

  it('falls back to header in server context', async () => {
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
