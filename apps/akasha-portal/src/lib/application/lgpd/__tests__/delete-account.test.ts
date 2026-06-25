/**
 * delete-account — testes do helper unificado (Wave 19.2)
 *
 * Cobre:
 *   - softDeleteAccount: marca deletedAt + deleteGracePeriodEndsAt
 *   - softDeleteAccount: idempotente (já em grace → não recomeça)
 *   - hardDeleteAccount: cascade real via prisma.user.delete
 *   - hardDeleteAccount: rejeita não-owner não-ADMIN
 *   - verifyPasswordConfirmation: confere hash bcrypt
 *   - countCascadedData: conta models diretas + multi-tenant (zeladorId)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hash } from 'bcryptjs';

const mockUserUpdate = vi.fn();
const mockUserFindUnique = vi.fn();
const mockUserDelete = vi.fn();
const mockAuditLog = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
      delete: (...args: unknown[]) => mockUserDelete(...args),
    },
    birthChart: { count: vi.fn().mockResolvedValue(1) },
    subscription: { count: vi.fn().mockResolvedValue(0) },
    manifesto: { count: vi.fn().mockResolvedValue(1) },
    creditEntry: { count: vi.fn().mockResolvedValue(2) },
    dailyReading: { count: vi.fn().mockResolvedValue(5) },
    consultation: { count: vi.fn().mockResolvedValue(3) },
    ritualCompletion: { count: vi.fn().mockResolvedValue(4) },
    pushSubscription: { count: vi.fn().mockResolvedValue(1) },
    connection: { count: vi.fn().mockResolvedValue(0) },
    cycleSnapshot: { count: vi.fn().mockResolvedValue(2) },
    areaHistoryEntry: { count: vi.fn().mockResolvedValue(6) },
    exerciseCompletion: { count: vi.fn().mockResolvedValue(7) },
    notification: { count: vi.fn().mockResolvedValue(0) },
    caminhante: { count: vi.fn().mockResolvedValue(1) },
    caminhada: { count: vi.fn().mockResolvedValue(2) },
    sessao: { count: vi.fn().mockResolvedValue(3) },
    sessaoChunk: { count: vi.fn().mockResolvedValue(10) },
    grimorioPessoal: { count: vi.fn().mockResolvedValue(1) },
    notasConsulente: { count: vi.fn().mockResolvedValue(0) },
    mapaCalculo: { count: vi.fn().mockResolvedValue(0) },
    pilar6Calculo: { count: vi.fn().mockResolvedValue(0) },
    pilar7Calculo: { count: vi.fn().mockResolvedValue(0) },
    pilar7Estagio: { count: vi.fn().mockResolvedValue(0) },
  },
}));

vi.mock('@/lib/infrastructure/audit-log', () => ({
  auditLog: (...args: unknown[]) => mockAuditLog(...args),
  hashIpForAudit: (ip: string) => `hash:${ip}`,
  extractClientIp: () => '127.0.0.1',
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('softDeleteAccount (Wave 19.2 self-service)', () => {
  it('marca deletedAt + deleteGracePeriodEndsAt quando user ativo', async () => {
    const auth = { id: 'u-1', email: 'a@b.c', name: 'A' };
    mockUserFindUnique.mockResolvedValue({
      id: 'u-1',
      email: 'a@b.c',
      deletedAt: null,
    });
    mockUserUpdate.mockResolvedValue({ id: 'u-1' });

    const { softDeleteAccount, LGPD_DELETION_GRACE_DAYS } = await import(
      '../delete-account'
    );

    const before = Date.now();
    const result = await softDeleteAccount({ auth });
    const after = Date.now();

    expect(result.success).toBe(true);
    expect(result.graceDays).toBe(LGPD_DELETION_GRACE_DAYS);
    expect(LGPD_DELETION_GRACE_DAYS).toBe(30);

    // deletedAt ≈ now
    expect(result.deletedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.deletedAt.getTime()).toBeLessThanOrEqual(after);

    // gracePeriodEndsAt ≈ deletedAt + 30 dias
    const days = Math.round(
      (result.gracePeriodEndsAt.getTime() - result.deletedAt.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    expect(days).toBe(30);

    // prisma.user.update chamado com deletedAt + deleteGracePeriodEndsAt + currentRefreshTokenJti=null
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      data: expect.objectContaining({
        deletedAt: expect.any(Date),
        deleteGracePeriodEndsAt: expect.any(Date),
        currentRefreshTokenJti: null,
      }),
    });

    // audit log: requested + scheduled
    const actions = mockAuditLog.mock.calls.map((c) => c[0].action);
    expect(actions).toContain('lgpd_deletion_requested');
    expect(actions).toContain('lgpd_deletion_scheduled');
  });

  it('é idempotente quando user já está em grace (não recomeça)', async () => {
    const previousDeletedAt = new Date('2026-06-01T00:00:00Z');
    const auth = { id: 'u-2', email: 'b@c.d', name: 'B' };
    mockUserFindUnique.mockResolvedValue({
      id: 'u-2',
      email: 'b@c.d',
      deletedAt: previousDeletedAt,
    });

    const { softDeleteAccount } = await import('../delete-account');
    const result = await softDeleteAccount({ auth });

    expect(result.success).toBe(true);
    expect(result.deletedAt).toEqual(previousDeletedAt);

    // NÃO chama update (já está em grace)
    expect(mockUserUpdate).not.toHaveBeenCalled();

    // audit log: requested com outcome=already_scheduled
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'lgpd_deletion_requested',
        metadata: expect.objectContaining({ outcome: 'already_scheduled' }),
      }),
    );
  });

  it('lança erro se user não existe', async () => {
    mockUserFindUnique.mockResolvedValue(null);
    const { softDeleteAccount } = await import('../delete-account');

    await expect(
      softDeleteAccount({ auth: { id: 'ghost', email: 'x', name: 'X' } }),
    ).rejects.toThrow('User não encontrado');
  });
});

describe('hardDeleteAccount (Wave 8.3 refatorado)', () => {
  it('deleta quando caller é o próprio user (owner)', async () => {
    mockUserFindUnique.mockResolvedValue({
      id: 'u-3',
      email: 'a@b.c',
    });
    mockUserDelete.mockResolvedValue({ id: 'u-3' });

    const { hardDeleteAccount } = await import('../delete-account');
    const result = await hardDeleteAccount({
      auth: { id: 'u-3', email: 'a@b.c', name: 'A' },
      actorRole: 'MEMBER',
      targetUserId: 'u-3',
    });

    expect(result.success).toBe(true);
    expect(mockUserDelete).toHaveBeenCalledWith({ where: { id: 'u-3' } });

    const actions = mockAuditLog.mock.calls.map((c) => c[0].action);
    expect(actions).toContain('profile_delete_requested');
    expect(actions).toContain('profile_delete_completed');
  });

  it('deleta quando caller é ADMIN mesmo sem ser owner', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'u-victim', email: 'v@x.com' });
    mockUserDelete.mockResolvedValue({ id: 'u-victim' });

    const { hardDeleteAccount } = await import('../delete-account');
    await hardDeleteAccount({
      auth: { id: 'admin-1', email: 'admin@x', name: 'Admin' },
      actorRole: 'ADMIN',
      targetUserId: 'u-victim',
    });

    expect(mockUserDelete).toHaveBeenCalledWith({ where: { id: 'u-victim' } });
  });

  it('rejeita MEMBER tentando deletar OUTRO user', async () => {
    const { hardDeleteAccount } = await import('../delete-account');
    await expect(
      hardDeleteAccount({
        auth: { id: 'u-attacker', email: 'a@x', name: 'Attacker' },
        actorRole: 'MEMBER',
        targetUserId: 'u-victim',
      }),
    ).rejects.toThrow(/Acesso negado/);

    expect(mockUserDelete).not.toHaveBeenCalled();
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'profile_delete_failed' }),
    );
  });

  it('lança erro se target user não existe', async () => {
    mockUserFindUnique.mockResolvedValue(null);
    const { hardDeleteAccount } = await import('../delete-account');

    await expect(
      hardDeleteAccount({
        auth: { id: 'u-self', email: 's@x', name: 'S' },
        actorRole: 'ADMIN',
        targetUserId: 'ghost',
      }),
    ).rejects.toThrow(/não encontrado/);
  });
});

describe('verifyPasswordConfirmation', () => {
  it('confere hash bcrypt válido', async () => {
    const hashStr = await hash('correct-password', 10);
    mockUserFindUnique.mockResolvedValue({ passwordHash: hashStr });

    const { verifyPasswordConfirmation } = await import('../delete-account');
    const result = await verifyPasswordConfirmation('u-1', 'correct-password');
    expect(result.ok).toBe(true);
  });

  it('rejeita senha errada', async () => {
    const hashStr = await hash('correct-password', 10);
    mockUserFindUnique.mockResolvedValue({ passwordHash: hashStr });

    const { verifyPasswordConfirmation } = await import('../delete-account');
    const result = await verifyPasswordConfirmation('u-1', 'WRONG');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('mismatch');
  });

  it('rejeita se header ausente', async () => {
    const { verifyPasswordConfirmation } = await import('../delete-account');
    const result = await verifyPasswordConfirmation('u-1', null);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('missing');
  });

  it('rejeita se user não tem passwordHash (login social)', async () => {
    mockUserFindUnique.mockResolvedValue({ passwordHash: null });
    const { verifyPasswordConfirmation } = await import('../delete-account');
    const result = await verifyPasswordConfirmation('u-1', 'anything');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('no_password_set');
  });
});

describe('countCascadedData', () => {
  it('conta models diretas (userId) E multi-tenant (zeladorId)', async () => {
    const { countCascadedData } = await import('../delete-account');
    const result = await countCascadedData('u-zelador');

    // Models diretas
    expect(result.birthChart).toBe(1);
    expect(result.manifesto).toBe(1);
    expect(result.creditEntries).toBe(2);
    expect(result.dailyReadings).toBe(5);

    // Multi-tenant (zeladorId)
    expect(result.caminhantes).toBe(1);
    expect(result.caminhadas).toBe(2);
    expect(result.sessoes).toBe(3);
    expect(result.sessaoChunks).toBe(10);

    // Total > 0 (sanity check)
    const total =
      result.birthChart +
      result.manifesto +
      result.creditEntries +
      result.dailyReadings +
      result.caminhantes +
      result.caminhadas +
      result.sessoes +
      result.sessaoChunks;
    expect(total).toBeGreaterThan(0);
  });
});

describe('cancelDeletion (LGPD Art. 18 §3 — revogação)', () => {
  it('zera deletedAt + deleteGracePeriodEndsAt quando user está em grace', async () => {
    const prev = new Date('2026-07-01T00:00:00Z');
    mockUserFindUnique.mockResolvedValue({
      deletedAt: new Date('2026-06-01T00:00:00Z'),
      deleteGracePeriodEndsAt: prev,
    });
    mockUserUpdate.mockResolvedValue({ id: 'u-cancel' });

    const { cancelDeletion } = await import('../delete-account');
    const result = await cancelDeletion({
      auth: { id: 'u-cancel', email: 'c@x', name: 'C' },
    });

    expect(result.cancelled).toBe(true);
    expect(result.previouslyScheduledFor).toEqual(prev);

    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'u-cancel' },
      data: { deletedAt: null, deleteGracePeriodEndsAt: null },
    });

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'lgpd_deletion_cancelled' }),
    );
  });

  it('lança erro se user NÃO está em grace', async () => {
    mockUserFindUnique.mockResolvedValue({
      deletedAt: null,
      deleteGracePeriodEndsAt: null,
    });

    const { cancelDeletion } = await import('../delete-account');
    await expect(
      cancelDeletion({ auth: { id: 'u-active', email: 'a@x', name: 'A' } }),
    ).rejects.toThrow(/não está em processo/);
  });
});
