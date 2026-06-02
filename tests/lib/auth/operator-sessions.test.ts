// tests/lib/auth/operator-sessions.test.ts
// Testes do operator-sessions helper (Fase 13).
// Cobre: hashOperatorToken, createSession, isSessionActive, revokeSession,
// revokeAllOperatorSessions, cleanupExpiredSessions.

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

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operatorSession: {
      create: (args: unknown) => mockCreate(args),
      update: (args: unknown) => mockUpdate(args),
      updateMany: (args: unknown) => mockUpdateMany(args),
      deleteMany: (args: unknown) => mockDeleteMany(args),
      findUnique: (args: unknown) => mockFindUnique(args),
    },
  },
}));

import {
  hashOperatorToken,
  createSession,
  isSessionActive,
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
  it('cria session com hash SHA-256 do token e ttl padrão de 7d', async () => {
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
        expiresAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
      };
      select: { id: boolean };
    };
    expect(callArg.data.operatorId).toBe('op-1');
    expect(callArg.data.tokenHash).toBe(hashOperatorToken('jwt-xyz'));
    expect(callArg.data.ipAddress).toBeNull();
    expect(callArg.data.userAgent).toBeNull();
    expect(callArg.select).toEqual({ id: true });

    // expiresAt deve ser ~agora + 7d (OPERATOR_TOKEN_TTL_SECONDS = 604800)
    const expiresAtMs = callArg.data.expiresAt.getTime();
    const expectedMs = before + 7 * 24 * 60 * 60 * 1000;
    expect(expiresAtMs).toBeGreaterThanOrEqual(expectedMs - 100);
    expect(expiresAtMs).toBeLessThanOrEqual(after + 7 * 24 * 60 * 60 * 1000 + 100);
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
      select: { expiresAt: true, revokedAt: true },
    });
  });

  it('retorna false se sessão foi revogada', async () => {
    mockFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
    });

    expect(await isSessionActive('revoked-token')).toBe(false);
  });

  it('retorna false se sessão expirou', async () => {
    mockFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() - 1000), // 1s atrás
      revokedAt: null,
    });

    expect(await isSessionActive('expired-token')).toBe(false);
  });

  it('retorna true se sessão existe, não-revogada, não-expirada', async () => {
    mockFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });

    expect(await isSessionActive('active-token')).toBe(true);
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
});
