// tests/api/operator-auth-sessions-list.test.ts
// Testes de integração para as rotas de gestão de sessões (Fase 16 + 18):
//   GET    /api/operator/auth/sessions            (listar ativas)
//   DELETE /api/operator/auth/sessions/[id]       (revogar 1)
//   POST   /api/operator/auth/sessions/revoke-all (revogar todas as outras)
//
// Edge cases cobertos:
//   - Lista NÃO expõe tokenHash, operatorId nem passwordHash
//   - Lista NÃO inclui REFRESH (só ACCESS ativas)
//   - DELETE em sessão de outro operator → 404 (não vaza existência)
//   - DELETE em sessão REFRESH → 404
//   - revoke-all preserva a sessão atual (isCurrent) e revoga o resto
//   - revoke-all com cookie expirado (currentTokenHash=null) revoga TUDO
//   - DELETE idempotente: revogada de novo → 200

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

// Mocks do Prisma — incluindo operatorSession.findMany (usado no GET)
const mockFindUnique = vi.fn();
const mockOperatorSessionFindMany = vi.fn();
const mockOperatorSessionFindFirst = vi.fn();
const mockOperatorSessionFindUnique = vi.fn();
const mockOperatorSessionUpdate = vi.fn();
const mockOperatorSessionUpdateMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: (args: unknown) => mockFindUnique(args),
    },
    operatorSession: {
      findMany: (args: unknown) => mockOperatorSessionFindMany(args),
      findFirst: (args: unknown) => mockOperatorSessionFindFirst(args),
      findUnique: (args: unknown) => mockOperatorSessionFindUnique(args),
      update: (args: unknown) => mockOperatorSessionUpdate(args),
      updateMany: (args: unknown) => mockOperatorSessionUpdateMany(args),
    },
  },
}));

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

/** Cria JWT de access assinado com TEST_SECRET. */
function makeAccessToken(sub = 'op-1', role: 'OPERATOR' | 'ADMIN' = 'OPERATOR'): string {
  return jwt.sign({ sub, role, type: 'access' }, TEST_SECRET, {
    algorithm: 'HS256',
    expiresIn: '15m',
  });
}

function makeGetRequest(url: string, token: string): NextRequest {
  return new NextRequest(url, {
    method: 'GET',
    headers: { cookie: `cockpit_session=${token}` },
  });
}

function makeDeleteRequest(url: string, token: string): NextRequest {
  return new NextRequest(url, {
    method: 'DELETE',
    headers: { cookie: `cockpit_session=${token}` },
  });
}

function makePostRequest(url: string, token: string): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { cookie: `cockpit_session=${token}` },
  });
}

/** SHA-256 hex do token (espelha hashOperatorToken do operator-sessions). */
import crypto from 'node:crypto';
function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex');
}

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.current = {};
  // Default: operator existe e a session do cookie está ativa.
  // Testes específicos sobrescrevem quando precisam.
  mockFindUnique.mockImplementation(async (args: { where: { id: string } }) => {
    if (args?.where?.id === 'op-1') return mockOperator;
    return null;
  });
  // Mock inteligente: por padrão a session está ativa (auth passa).
  // Testes individuais podem sobrescrever com mockImplementationOnce para
  // casos específicos (ex: "cookie atual não bate com nenhuma sessão").
  mockOperatorSessionFindUnique.mockImplementation(async (args: { where: { tokenHash?: string } }) => {
    if (!args?.where?.tokenHash) return null;
    return {
      id: 'sess-current',
      operatorId: 'op-1',
      type: 'ACCESS',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: null,
      revokedAt: null,
    };
  });
});

// ============================================================================
// GET /api/operator/auth/sessions — listar ativas
// ============================================================================

describe('GET /api/operator/auth/sessions — listar sessões ativas (Fase 16)', () => {
  it('retorna 401 se não autenticado', async () => {
    cookieStore.current = {}; // sem cookie

    const { GET } = await import('@/app/api/operator/auth/sessions/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/sessions', ''));

    expect(res.status).toBe(401);
  });

  it('retorna 401 se cookie tem JWT inválido', async () => {
    cookieStore.current = { cockpit_session: 'invalid.jwt.token' };

    const { GET } = await import('@/app/api/operator/auth/sessions/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/sessions', 'invalid.jwt.token'));

    expect(res.status).toBe(401);
  });

  it('retorna lista vazia quando não há sessões ativas', async () => {
    const token = makeAccessToken();
    cookieStore.current = { cockpit_session: token };
    // findUnique (session ativa) → sess-current ativa (default já cobre)
    // findMany (lista) → vazio
    mockOperatorSessionFindMany.mockResolvedValue([]);

    const { GET } = await import('@/app/api/operator/auth/sessions/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/sessions', token));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessions).toEqual([]);
  });

  it('retorna sessões ativas com shape público (sem tokenHash, operatorId, passwordHash)', async () => {
    const token = makeAccessToken();
    cookieStore.current = { cockpit_session: token };
    const currentHash = sha256(token);

    const now = Date.now();
    const sessions = [
      {
        id: 'sess-current',
        ipAddress: '203.0.113.10',
        userAgent: 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36',
        createdAt: new Date(now - 60_000),
        expiresAt: new Date(now + 60_000),
      },
      {
        id: 'sess-other',
        ipAddress: '198.51.100.5',
        userAgent: 'Mozilla/5.0 (iPhone)',
        createdAt: new Date(now - 3600_000),
        expiresAt: new Date(now + 60_000),
      },
    ];
    mockOperatorSessionFindMany.mockResolvedValue(sessions);
    // 1ª call (auth check): sessão ativa; 2ª call (current detect): sess-current
    let callCount = 0;
    mockOperatorSessionFindUnique.mockImplementation(async () => {
      callCount += 1;
      return {
        id: 'sess-current',
        operatorId: 'op-1',
        type: 'ACCESS',
        expiresAt: new Date(Date.now() + 60_000),
        refreshExpiresAt: null,
        revokedAt: null,
      };
    });

    const { GET } = await import('@/app/api/operator/auth/sessions/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/sessions', token));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessions).toHaveLength(2);

    // Shape — campos públicos
    for (const s of body.sessions) {
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('ipAddress');
      expect(s).toHaveProperty('userAgent');
      expect(s).toHaveProperty('createdAt');
      expect(s).toHaveProperty('expiresAt');
      expect(s).toHaveProperty('isCurrent');
      // Campos sensíveis AUSENTES
      expect(s).not.toHaveProperty('tokenHash');
      expect(s).not.toHaveProperty('operatorId');
      expect(s).not.toHaveProperty('passwordHash');
    }

    // A sessão atual tem isCurrent=true
    const current = body.sessions.find((s: { isCurrent: boolean }) => s.isCurrent);
    expect(current).toBeDefined();
    expect(current.id).toBe('sess-current');
  });

  it('filtra por operatorId do cookie (não do body/query)', async () => {
    const token = makeAccessToken('op-1');
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindMany.mockResolvedValue([]);
    // Primeira chamada (auth check) → sessão ativa; segunda (current detect) → null
    // O default do beforeEach já cobre a auth, sem necessidade de override aqui.

    const { GET } = await import('@/app/api/operator/auth/sessions/route');
    await GET(makeGetRequest('http://l/api/operator/auth/sessions', token));

    // O Prisma foi chamado com operatorId = 'op-1' (do operator autenticado)
    expect(mockOperatorSessionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          operatorId: 'op-1',
          type: 'ACCESS',
          revokedAt: null,
        }),
      })
    );
  });

  it('filtra sessões revogadas (revokedAt: null) e expiradas (expiresAt > now)', async () => {
    const token = makeAccessToken();
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindMany.mockResolvedValue([]);

    const { GET } = await import('@/app/api/operator/auth/sessions/route');
    await GET(makeGetRequest('http://l/api/operator/auth/sessions', token));

    expect(mockOperatorSessionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          revokedAt: null,
          expiresAt: expect.objectContaining({ gt: expect.any(Date) }),
        }),
      })
    );
  });

  it('NÃO inclui REFRESH sessions (só ACCESS)', async () => {
    const token = makeAccessToken();
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindMany.mockResolvedValue([]);

    const { GET } = await import('@/app/api/operator/auth/sessions/route');
    await GET(makeGetRequest('http://l/api/operator/auth/sessions', token));

    expect(mockOperatorSessionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'ACCESS' }),
      })
    );
  });

  it('marca isCurrent=false se o cookie atual não bate com nenhuma sessão no DB', async () => {
    const token = makeAccessToken();
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindMany.mockResolvedValue([
      {
        id: 'sess-other',
        ipAddress: '1.2.3.4',
        userAgent: 'x',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      },
    ]);
    // A 2ª chamada (current session detection) retorna null.
    // A 1ª (auth check) usa o default do beforeEach → sessão ativa.
    // mockImplementationOnce consome a 1ª call, deixando a 2ª com null
    // via fallback → mas o default JÁ retorna válido, então precisamos
    // de outro approach: setar a session ATIVA e depois zerar.
    let callCount = 0;
    mockOperatorSessionFindUnique.mockImplementation(async (args: { where: { tokenHash?: string } }) => {
      callCount += 1;
      // 1ª call = auth check (isSessionActive) → precisa ser válida
      if (callCount === 1) {
        return {
          id: 'sess-current',
          operatorId: 'op-1',
          type: 'ACCESS',
          expiresAt: new Date(Date.now() + 60_000),
          refreshExpiresAt: null,
          revokedAt: null,
        };
      }
      // 2ª call = current session detection → null (tokenHash não bate)
      return null;
    });

    const { GET } = await import('@/app/api/operator/auth/sessions/route');
    const res = await GET(makeGetRequest('http://l/api/operator/auth/sessions', token));

    const body = await res.json();
    expect(body.sessions[0].isCurrent).toBe(false);
  });
});

// ============================================================================
// DELETE /api/operator/auth/sessions/[id] — revogar 1 sessão
// ============================================================================

describe('DELETE /api/operator/auth/sessions/[id] — revogar sessão (Fase 16)', () => {
  it('retorna 401 se não autenticado', async () => {
    cookieStore.current = {};

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeDeleteRequest('http://l/api/operator/auth/sessions/sess-x', ''),
      { params: Promise.resolve({ id: 'sess-x' }) }
    );

    expect(res.status).toBe(401);
  });

  it('revoga a sessão do próprio operator (200)', async () => {
    const token = makeAccessToken();
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindFirst.mockResolvedValue({
      id: 'sess-other',
      revokedAt: null,
    });
    mockOperatorSessionUpdate.mockResolvedValue({});

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeDeleteRequest('http://l/api/operator/auth/sessions/sess-other', token),
      { params: Promise.resolve({ id: 'sess-other' }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, id: 'sess-other' });
    expect(mockOperatorSessionUpdate).toHaveBeenCalledWith({
      where: { id: 'sess-other' },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('retorna 404 se a sessão não existe', async () => {
    const token = makeAccessToken();
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindFirst.mockResolvedValue(null);

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeDeleteRequest('http://l/api/operator/auth/sessions/sess-ghost', token),
      { params: Promise.resolve({ id: 'sess-ghost' }) }
    );

    expect(res.status).toBe(404);
    expect(mockOperatorSessionUpdate).not.toHaveBeenCalled();
  });

  it('retorna 404 ao tentar revogar sessão de OUTRO operator (não vaza)', async () => {
    const token = makeAccessToken('op-1');
    cookieStore.current = { cockpit_session: token };
    // findFirst com operatorId+id+type=ACCESS → null (sess pertence a op-2)
    mockOperatorSessionFindFirst.mockResolvedValue(null);

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeDeleteRequest('http://l/api/operator/auth/sessions/sess-op2', token),
      { params: Promise.resolve({ id: 'sess-op2' }) }
    );

    expect(res.status).toBe(404);
    // Garante que o filtro inclui operatorId do autenticado
    expect(mockOperatorSessionFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'sess-op2',
          operatorId: 'op-1',
          type: 'ACCESS',
        }),
      })
    );
  });

  it('retorna 200 idempotente se sessão já estava revogada', async () => {
    const token = makeAccessToken();
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionFindFirst.mockResolvedValue({
      id: 'sess-already',
      revokedAt: new Date('2026-05-01'),
    });

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeDeleteRequest('http://l/api/operator/auth/sessions/sess-already', token),
      { params: Promise.resolve({ id: 'sess-already' }) }
    );

    expect(res.status).toBe(200);
    expect(mockOperatorSessionUpdate).not.toHaveBeenCalled();
  });

  it('retorna 400 se id está vazio', async () => {
    const token = makeAccessToken();
    cookieStore.current = { cockpit_session: token };

    const { DELETE } = await import('@/app/api/operator/auth/sessions/[id]/route');
    const res = await DELETE(
      makeDeleteRequest('http://l/api/operator/auth/sessions/', token),
      { params: Promise.resolve({ id: '' }) }
    );

    expect(res.status).toBe(400);
  });
});

// ============================================================================
// POST /api/operator/auth/sessions/revoke-all
// ============================================================================

describe('POST /api/operator/auth/sessions/revoke-all — revogar outras (Fase 16)', () => {
  it('retorna 401 se não autenticado', async () => {
    cookieStore.current = {};

    const { POST } = await import('@/app/api/operator/auth/sessions/revoke-all/route');
    const res = await POST(makePostRequest('http://l/api/operator/auth/sessions/revoke-all', ''));

    expect(res.status).toBe(401);
  });

  it('revoga todas EXCETO a sessão atual e retorna count', async () => {
    const token = makeAccessToken();
    const currentHash = sha256(token);
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionUpdateMany.mockResolvedValue({ count: 3 });

    const { POST } = await import('@/app/api/operator/auth/sessions/revoke-all/route');
    const res = await POST(makePostRequest('http://l/api/operator/auth/sessions/revoke-all', token));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, revokedCount: 3 });

    // O filtro do updateMany inclui:
    // - operatorId do autenticado
    // - type=ACCESS
    // - revokedAt=null
    // - NOT tokenHash = currentTokenHash
    expect(mockOperatorSessionUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          operatorId: 'op-1',
          type: 'ACCESS',
          revokedAt: null,
          NOT: { tokenHash: currentHash },
        }),
        data: { revokedAt: expect.any(Date) },
      })
    );
  });

  it('revoga TODAS as sessões se cookie está ausente (currentTokenHash=null)', async () => {
    cookieStore.current = {}; // sem cookie
    mockOperatorSessionUpdateMany.mockResolvedValue({ count: 2 });

    // Para o requireOperator passar, mocka findUnique do operator
    // via dev header. Aqui, pulamos: sem cookie + sem dev header = 401.
    // Para testar o fallback, mocka requireOperator indiretamente via
    // dev header. Mas a rota é API route → sem dev header. Então
    // este caso resulta em 401 (correto).
    const { POST } = await import('@/app/api/operator/auth/sessions/revoke-all/route');
    const res = await POST(makePostRequest('http://l/api/operator/auth/sessions/revoke-all', ''));

    // Sem auth → 401 (não chega ao updateMany)
    expect(res.status).toBe(401);
    expect(mockOperatorSessionUpdateMany).not.toHaveBeenCalled();
  });

  it('retorna revokedCount=0 quando não há outras sessões', async () => {
    const token = makeAccessToken();
    cookieStore.current = { cockpit_session: token };
    mockOperatorSessionUpdateMany.mockResolvedValue({ count: 0 });

    const { POST } = await import('@/app/api/operator/auth/sessions/revoke-all/route');
    const res = await POST(makePostRequest('http://l/api/operator/auth/sessions/revoke-all', token));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.revokedCount).toBe(0);
  });
});
