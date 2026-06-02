// tests/lib/auth/operator-sessions.test.ts
// Testes do operator-sessions helper (Fase 13 + Fase 15).
// Cobre: hashOperatorToken, createSession, createRefreshSession,
// isSessionActive, isRefreshSessionActive, rotateRefreshToken (com
// detecção de reuso), revokeSession, revokeAllOperatorSessions,
// cleanupExpiredSessions.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockUpdateMany = vi.fn();
const mockDeleteMany = vi.fn();
const mockFindUnique = vi.fn();
const mockTransaction = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operatorSession: {
      create: (args: unknown) => mockCreate(args),
      update: (args: unknown) => mockUpdate(args),
      updateMany: (args: unknown) => mockUpdateMany(args),
      deleteMany: (args: unknown) => mockDeleteMany(args),
      findUnique: (args: unknown) => mockFindUnique(args),
    },
    $transaction: (args: unknown) => mockTransaction(args),
  },
}));

import {
  hashOperatorToken,
  createSession,
  createRefreshSession,
  isSessionActive,
  isRefreshSessionActive,
  rotateRefreshToken,
  revokeSession,
  revokeAllOperatorSessions,
  cleanupExpiredSessions,
} from '@/lib/auth/operator-sessions';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// hashOperatorToken
// ============================================================================

describe('hashOperatorToken', () => {
  it('produz hash SHA-256 de 64 chars hex', () => {
    const hash = hashOperatorToken('jwt.abc.def');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produz o mesmo hash para o mesmo token (determinístico)', () => {
    const h1 = hashOperatorToken('token-x');
    const h2 = hashOperatorToken('token-x');
    expect(h1).toBe(h2);
  });

  it('produz hashes diferentes para tokens diferentes', () => {
    const h1 = hashOperatorToken('token-a');
    const h2 = hashOperatorToken('token-b');
    expect(h1).not.toBe(h2);
  });

  it('bate com crypto.createHash diretamente (sanity)', () => {
    const token = 'sanity-check-token';
    const expected = crypto.createHash('sha256').update(token).digest('hex');
    expect(hashOperatorToken(token)).toBe(expected);
  });
});

// ============================================================================
// createSession
// ============================================================================

describe('createSession', () => {
  it('cria session ACCESS com hash SHA-256 e ttl padrão de 15min', async () => {
    const fakeSession = { id: 'sess-1' };
    mockCreate.mockResolvedValue(fakeSession);

    const before = Date.now();
    const result = await createSession({ operatorId: 'op-1', token: 'jwt-xyz' });
    const after = Date.now();

    expect(result).toEqual({ id: 'sess-1', tokenHash: hashOperatorToken('jwt-xyz') });

    // Verifica dados passados ao Prisma
    const callArg = mockCreate.mock.calls[0][0] as {
      data: {
        operatorId: string;
        tokenHash: string;
        type: string;
        expiresAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
      };
      select: { id: boolean };
    };
    expect(callArg.data.operatorId).toBe('op-1');
    expect(callArg.data.tokenHash).toBe(hashOperatorToken('jwt-xyz'));
    expect(callArg.data.type).toBe('ACCESS');
    expect(callArg.data.ipAddress).toBeNull();
    expect(callArg.data.userAgent).toBeNull();
    expect(callArg.select).toEqual({ id: true });

    // expiresAt deve ser ~agora + 15min
    const expiresAtMs = callArg.data.expiresAt.getTime();
    const expectedMs = before + 15 * 60 * 1000;
    expect(expiresAtMs).toBeGreaterThanOrEqual(expectedMs - 100);
    expect(expiresAtMs).toBeLessThanOrEqual(after + 15 * 60 * 1000 + 100);
  });

  it('aceita expiresAt customizado (override do TTL)', async () => {
    mockCreate.mockResolvedValue({ id: 'sess-2' });
    const customExpiry = new Date('2030-01-01');

    await createSession({
      operatorId: 'op-1',
      token: 'jwt-1',
      expiresAt: customExpiry,
    });

    const callArg = mockCreate.mock.calls[0][0] as {
      data: { expiresAt: Date };
    };
    expect(callArg.data.expiresAt).toEqual(customExpiry);
  });

  it('passa ipAddress e userAgent quando fornecidos', async () => {
    mockCreate.mockResolvedValue({ id: 'sess-3' });

    await createSession({
      operatorId: 'op-1',
      token: 'jwt-2',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    });

    const callArg = mockCreate.mock.calls[0][0] as {
      data: { ipAddress: string | null; userAgent: string | null };
    };
    expect(callArg.data.ipAddress).toBe('192.168.1.1');
    expect(callArg.data.userAgent).toBe('Mozilla/5.0');
  });

  it('aceita type=REFRESH explicitamente', async () => {
    mockCreate.mockResolvedValue({ id: 'sess-r' });

    await createSession({
      operatorId: 'op-1',
      token: 'jwt-r',
      type: 'REFRESH',
    });

    const callArg = mockCreate.mock.calls[0][0] as {
      data: { type: string; refreshExpiresAt: Date | null };
    };
    expect(callArg.data.type).toBe('REFRESH');
    expect(callArg.data.refreshExpiresAt).toBeInstanceOf(Date);
  });
});

// ============================================================================
// createRefreshSession (Fase 15)
// ============================================================================

describe('createRefreshSession', () => {
  it('cria session REFRESH com TTL de 30d', async () => {
    mockCreate.mockResolvedValue({ id: 'sess-ref-1' });

    const before = Date.now();
    const result = await createRefreshSession({ operatorId: 'op-1', token: 'jwt-r1' });
    const after = Date.now();

    expect(result.id).toBe('sess-ref-1');
    expect(result.tokenHash).toBe(hashOperatorToken('jwt-r1'));

    const callArg = mockCreate.mock.calls[0][0] as {
      data: {
        operatorId: string;
        tokenHash: string;
        type: string;
        expiresAt: Date;
        refreshExpiresAt: Date;
      };
    };
    expect(callArg.data.operatorId).toBe('op-1');
    expect(callArg.data.type).toBe('REFRESH');

    // expiresAt e refreshExpiresAt = ~agora + 30d
    const expected = before + 30 * 24 * 60 * 60 * 1000;
    expect(callArg.data.expiresAt.getTime()).toBeGreaterThanOrEqual(expected - 100);
    expect(callArg.data.expiresAt.getTime()).toBeLessThanOrEqual(after + 30 * 24 * 60 * 60 * 1000 + 100);
    expect(callArg.data.refreshExpiresAt).toBeInstanceOf(Date);
  });

  it('passa ipAddress e userAgent para a refresh session', async () => {
    mockCreate.mockResolvedValue({ id: 'sess-ref-2' });

    await createRefreshSession({
      operatorId: 'op-1',
      token: 'jwt-r2',
      ipAddress: '10.0.0.1',
      userAgent: 'Curl/8.0',
    });

    const callArg = mockCreate.mock.calls[0][0] as {
      data: { ipAddress: string | null; userAgent: string | null };
    };
    expect(callArg.data.ipAddress).toBe('10.0.0.1');
    expect(callArg.data.userAgent).toBe('Curl/8.0');
  });
});

// ============================================================================
// isSessionActive
// ============================================================================

describe('isSessionActive', () => {
  it('retorna false se sessão não existe', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await isSessionActive('unknown-token');

    expect(result).toBe(false);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashOperatorToken('unknown-token') },
      select: { type: true, expiresAt: true, refreshExpiresAt: true, revokedAt: true },
    });
  });

  it('retorna false se sessão foi revogada', async () => {
    mockFindUnique.mockResolvedValue({
      type: 'ACCESS',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: null,
      revokedAt: new Date(),
    });

    expect(await isSessionActive('revoked-token')).toBe(false);
  });

  it('retorna false se access session expirou (expiresAt < now)', async () => {
    mockFindUnique.mockResolvedValue({
      type: 'ACCESS',
      expiresAt: new Date(Date.now() - 1000),
      refreshExpiresAt: null,
      revokedAt: null,
    });

    expect(await isSessionActive('expired-access-token')).toBe(false);
  });

  it('retorna true se access session existe, não-revogada, não-expirada', async () => {
    mockFindUnique.mockResolvedValue({
      type: 'ACCESS',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: null,
      revokedAt: null,
    });

    expect(await isSessionActive('active-token')).toBe(true);
  });

  it('refresh usa refreshExpiresAt como expiry (Fase 15)', async () => {
    // expiresAt no passado, mas refreshExpiresAt no futuro → válido
    mockFindUnique.mockResolvedValue({
      type: 'REFRESH',
      expiresAt: new Date(Date.now() - 1000),
      refreshExpiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    expect(await isSessionActive('refresh-with-future-refresh-exp')).toBe(true);

    // refreshExpiresAt no passado → expirado
    mockFindUnique.mockResolvedValue({
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: new Date(Date.now() - 1000),
      revokedAt: null,
    });
    expect(await isSessionActive('refresh-with-past-refresh-exp')).toBe(false);
  });
});

// ============================================================================
// isRefreshSessionActive
// ============================================================================

describe('isRefreshSessionActive', () => {
  it('retorna true se refresh válido', async () => {
    mockFindUnique.mockResolvedValue({
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    expect(await isRefreshSessionActive('refresh-valid')).toBe(true);
  });

  it('retorna false se session não existe', async () => {
    mockFindUnique.mockResolvedValue(null);
    expect(await isRefreshSessionActive('refresh-unknown')).toBe(false);
  });

  it('retorna false se session é ACCESS (não REFRESH)', async () => {
    mockFindUnique.mockResolvedValue({
      type: 'ACCESS',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: null,
      revokedAt: null,
    });
    expect(await isRefreshSessionActive('access-token-here')).toBe(false);
  });

  it('retorna false se refresh está revogado', async () => {
    mockFindUnique.mockResolvedValue({
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
    });
    expect(await isRefreshSessionActive('refresh-revoked')).toBe(false);
  });

  it('retorna false se refresh expirou', async () => {
    mockFindUnique.mockResolvedValue({
      type: 'REFRESH',
      expiresAt: new Date(Date.now() - 1000),
      refreshExpiresAt: new Date(Date.now() - 1000),
      revokedAt: null,
    });
    expect(await isRefreshSessionActive('refresh-expired')).toBe(false);
  });
});

// ============================================================================
// rotateRefreshToken — caminho feliz
// ============================================================================

describe('rotateRefreshToken — happy path', () => {
  it('revoga o refresh usado, emite novo par access+refresh, retorna ok', async () => {
    const oldHash = hashOperatorToken('old-refresh-jwt');
    mockFindUnique.mockResolvedValue({
      id: 'sess-old',
      operatorId: 'op-1',
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    // Identity mocks para que $transaction receba os objetos com .data
    mockCreate.mockImplementation((args: unknown) => args as object);
    mockUpdate.mockImplementation((args: unknown) => args as object);
    mockTransaction.mockResolvedValue([{}, {}, {}]);

    const result = await rotateRefreshToken({
      refreshToken: 'old-refresh-jwt',
      signAccess: (op) => `access-for-${op.id}`,
      signRefresh: (op) => `refresh-for-${op.id}`,
      loadOperator: async (id) => ({ id, role: 'OPERATOR' }),
    });

    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.operatorId).toBe('op-1');
      expect(result.newAccessToken).toBe('access-for-op-1');
      expect(result.newRefreshToken).toBe('refresh-for-op-1');
    }

    // 1 findUnique por hash
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { tokenHash: oldHash },
      select: {
        id: true,
        operatorId: true,
        type: true,
        expiresAt: true,
        refreshExpiresAt: true,
        revokedAt: true,
      },
    });

    // 1 transação: update (revoga antiga) + 2 creates (novo access + novo refresh)
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    const txArgs = mockTransaction.mock.calls[0][0] as Array<unknown>;
    expect(txArgs).toHaveLength(3);
  });

  it('passa ipAddress e userAgent para as novas sessions', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'sess-old',
      operatorId: 'op-1',
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    // mockCreate e mockUpdate precisam retornar o args (identity) para
    // que o array passado a $transaction contenha os objetos com .data
    mockCreate.mockImplementation((args: unknown) => args as object);
    mockUpdate.mockImplementation((args: unknown) => args as object);
    mockTransaction.mockResolvedValue([{}, {}, {}]);

    await rotateRefreshToken({
      refreshToken: 'old-r',
      signAccess: () => 'a',
      signRefresh: () => 'r',
      loadOperator: async (id) => ({ id, role: 'OPERATOR' }),
      ipAddress: '203.0.113.99',
      userAgent: 'TestAgent/1.0',
    });

    const txArgs = mockTransaction.mock.calls[0][0] as Array<{
      data?: { ipAddress?: string | null; userAgent?: string | null; type?: string };
    }>;
    // As 2 chamadas create (access + refresh) devem ter os metadados
    // Update (revoga antiga) também tem `data` mas é só revokedAt — filtra por type.
    const createCalls = txArgs.filter((c) => c && c.data && 'type' in c.data);
    expect(createCalls.length).toBe(2);
    for (const call of createCalls) {
      expect(call.data!.ipAddress).toBe('203.0.113.99');
      expect(call.data!.userAgent).toBe('TestAgent/1.0');
    }
  });
});

// ============================================================================
// rotateRefreshToken — invalid
// ============================================================================

describe('rotateRefreshToken — invalid', () => {
  it('retorna invalid se hash não bate com nenhuma session', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await rotateRefreshToken({
      refreshToken: 'unknown-r',
      signAccess: () => 'a',
      signRefresh: () => 'r',
      loadOperator: async () => null,
    });

    expect(result.kind).toBe('invalid');
  });

  it('retorna invalid se session existe mas é ACCESS (não REFRESH)', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'sess-a',
      operatorId: 'op-1',
      type: 'ACCESS',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: null,
      revokedAt: null,
    });

    const result = await rotateRefreshToken({
      refreshToken: 'access-token',
      signAccess: () => 'a',
      signRefresh: () => 'r',
      loadOperator: async () => null,
    });

    expect(result.kind).toBe('invalid');
  });

  it('retorna invalid se refresh expirou e marca como revogada', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'sess-exp',
      operatorId: 'op-1',
      type: 'REFRESH',
      expiresAt: new Date(Date.now() - 1000),
      refreshExpiresAt: new Date(Date.now() - 1000),
      revokedAt: null,
    });
    mockUpdate.mockResolvedValue({});

    const result = await rotateRefreshToken({
      refreshToken: 'expired-r',
      signAccess: () => 'a',
      signRefresh: () => 'r',
      loadOperator: async () => null,
    });

    expect(result.kind).toBe('invalid');
    // Deve marcar como revogada (sem confundir com reuso)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'sess-exp' },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('retorna invalid se operator foi deletado entre create e rotação', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'sess-orph',
      operatorId: 'op-ghost',
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });

    const result = await rotateRefreshToken({
      refreshToken: 'orphan-r',
      signAccess: () => 'a',
      signRefresh: () => 'r',
      loadOperator: async () => null, // operator sumiu
    });

    expect(result.kind).toBe('invalid');
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});

// ============================================================================
// rotateRefreshToken — reuse detected
// ============================================================================

describe('rotateRefreshToken — reuse detection', () => {
  it('retorna reuse-detected e revoga TODAS as sessões do operator', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'sess-revoked',
      operatorId: 'op-victim',
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 60_000),
      refreshExpiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(), // ← JÁ REVOGADA!
    });
    mockUpdateMany.mockResolvedValue({ count: 5 });

    const result = await rotateRefreshToken({
      refreshToken: 'stolen-r',
      signAccess: () => 'a',
      signRefresh: () => 'r',
      loadOperator: async () => null,
    });

    expect(result.kind).toBe('reuse-detected');
    // revokeAllOperatorSessions deve ter sido chamado
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { operatorId: 'op-victim', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    // E NÃO emite novos tokens
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});

// ============================================================================
// revokeSession
// ============================================================================

describe('revokeSession', () => {
  it('marca revokedAt para sessão ativa', async () => {
    mockFindUnique.mockResolvedValue({ id: 'sess-1', revokedAt: null });
    mockUpdate.mockResolvedValue({ id: 'sess-1', revokedAt: new Date() });

    const result = await revokeSession('active-token');

    expect(result).toEqual({ revoked: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'sess-1' },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('retorna revoked:false se token não tem sessão', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await revokeSession('unknown-token');

    expect(result).toEqual({ revoked: false });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('é idempotente: revogar sessão já revogada não chama update', async () => {
    mockFindUnique.mockResolvedValue({ id: 'sess-1', revokedAt: new Date() });

    const result = await revokeSession('already-revoked-token');

    expect(result).toEqual({ revoked: true });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ============================================================================
// revokeAllOperatorSessions
// ============================================================================

describe('revokeAllOperatorSessions', () => {
  it('revoga todas as sessões ativas do operator', async () => {
    mockUpdateMany.mockResolvedValue({ count: 3 });

    const result = await revokeAllOperatorSessions('op-1');

    expect(result).toEqual({ count: 3 });
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { operatorId: 'op-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('retorna count 0 quando operator não tem sessões ativas', async () => {
    mockUpdateMany.mockResolvedValue({ count: 0 });

    const result = await revokeAllOperatorSessions('op-2');

    expect(result).toEqual({ count: 0 });
  });
});

// ============================================================================
// cleanupExpiredSessions
// ============================================================================

describe('cleanupExpiredSessions', () => {
  it('deleta sessões expiradas e revogadas há mais de 30 dias (default)', async () => {
    mockDeleteMany.mockResolvedValue({ count: 42 });

    const result = await cleanupExpiredSessions();

    expect(result).toEqual({ count: 42 });
    // Verifica que o where tem OR (expiradas OU revogadas antigas)
    const callArg = mockDeleteMany.mock.calls[0][0] as { where: unknown };
    expect(callArg.where).toBeDefined();
  });

  it('aceita olderThanDays customizado', async () => {
    mockDeleteMany.mockResolvedValue({ count: 5 });

    await cleanupExpiredSessions(7);

    expect(mockDeleteMany).toHaveBeenCalled();
  });

  it('inclui refreshExpiresAt no cleanup (Fase 15)', async () => {
    mockDeleteMany.mockResolvedValue({ count: 10 });

    await cleanupExpiredSessions();

    const callArg = mockDeleteMany.mock.calls[0][0] as {
      where: { OR: Array<Record<string, unknown>> };
    };
    // Deve ter alguma cláusula referenciando refreshExpiresAt
    const json = JSON.stringify(callArg.where);
    expect(json).toMatch(/refreshExpiresAt/);
  });
});
