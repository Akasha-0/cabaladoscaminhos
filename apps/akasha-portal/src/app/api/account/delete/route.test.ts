/**
 * /api/account/delete — testes (Wave 19.2)
 *
 * Cobre:
 *   - 401 sem auth
 *   - 400 sem header X-Confirm-Password
 *   - 403 senha incorreta
 *   - 400 se user não tem passwordHash (login social)
 *   - 200 soft-delete agendado + cookies cleared
 *   - Audit log: lgpd_password_confirm_failed em tentativas erradas
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

const mockRequireAkashaApi = vi.fn();
const mockAuditLog = vi.fn();
const mockUserFindUnique = vi.fn();
const mockUserUpdate = vi.fn();
const mockSoftDeleteAccount = vi.fn();

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: (...args: unknown[]) => mockRequireAkashaApi(...args),
}));

vi.mock('@/lib/application/auth/akasha-jwt', () => ({
  AKASHA_TOKEN_COOKIE: '__Host-akasha_session',
  AKASHA_REFRESH_COOKIE: '__Host-akasha_refresh',
}));

vi.mock('@/lib/infrastructure/audit-log', () => ({
  auditLog: (...args: unknown[]) => mockAuditLog(...args),
  hashIpForAudit: () => 'hashed-ip',
  extractClientIp: () => '127.0.0.1',
}));

vi.mock('@/lib/application/lgpd/delete-account', () => ({
  softDeleteAccount: (...args: unknown[]) => mockSoftDeleteAccount(...args),
  verifyPasswordConfirmation: vi.fn(async (userId: string, provided: string | null) => {
    if (!provided) return { ok: false, reason: 'missing' };
    const user = await mockUserFindUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash) return { ok: false, reason: 'no_password_set' };
    const bcrypt = await import('bcryptjs');
    const matches = await bcrypt.compare(provided, user.passwordHash);
    return matches ? { ok: true } : { ok: false, reason: 'mismatch' };
  }),
  hardDeleteAccount: vi.fn(),
  countCascadedData: vi.fn(),
}));

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/account/delete', {
    method: 'DELETE',
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DELETE /api/account/delete (Wave 19.2)', () => {
  it('retorna 401 quando requireAkashaApi rejeita', async () => {
    mockRequireAkashaApi.mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    );

    const { DELETE } = await import('./route');
    const res = await DELETE(makeRequest({ 'x-confirm-password': 'anything' }));
    expect(res.status).toBe(401);
    expect(mockSoftDeleteAccount).not.toHaveBeenCalled();
  });

  it('retorna 400 sem header X-Confirm-Password', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'u-1',
      email: 'a@b.c',
      name: 'A',
    });

    const { DELETE } = await import('./route');
    const res = await DELETE(makeRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('confirm_required');
    expect(mockSoftDeleteAccount).not.toHaveBeenCalled();
  });

  it('retorna 403 quando senha não confere (audita tentativa)', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'u-2',
      email: 'b@c.d',
      name: 'B',
    });
    const hashStr = await hash('correct-password', 4);
    mockUserFindUnique.mockResolvedValue({ passwordHash: hashStr });

    const { DELETE } = await import('./route');
    const res = await DELETE(makeRequest({ 'x-confirm-password': 'WRONG' }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe('password_mismatch');
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'lgpd_password_confirm_failed',
        userId: 'u-2',
      }),
    );
    expect(mockSoftDeleteAccount).not.toHaveBeenCalled();
  });

  it('retorna 400 (não 403) quando user não tem passwordHash (login social)', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'u-social',
      email: 'social@x.com',
      name: 'Social',
    });
    mockUserFindUnique.mockResolvedValue({ passwordHash: null });

    const { DELETE } = await import('./route');
    const res = await DELETE(makeRequest({ 'x-confirm-password': 'any' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('no_password_set');
  });

  it('retorna 200 + soft delete agendado + cookies cleared quando senha confere', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'u-3',
      email: 'c@d.e',
      name: 'C',
    });
    const hashStr = await hash('correct-password', 4);
    mockUserFindUnique.mockResolvedValue({ passwordHash: hashStr });

    const scheduledAt = new Date('2026-06-25T00:00:00Z');
    const graceEndsAt = new Date('2026-07-25T00:00:00Z');
    mockSoftDeleteAccount.mockResolvedValue({
      success: true,
      deletedAt: scheduledAt,
      gracePeriodEndsAt: graceEndsAt,
      graceDays: 30,
      cascadePreview: {
        birthChart: 1,
        manifesto: 1,
        creditEntries: 2,
        // etc — não precisa ser exaustivo aqui
      },
    });

    const { DELETE } = await import('./route');
    const res = await DELETE(
      makeRequest({ 'x-confirm-password': 'correct-password' }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.scheduled).toBe(true);
    expect(body.deletedAt).toBe(scheduledAt.toISOString());
    expect(body.gracePeriodEndsAt).toBe(graceEndsAt.toISOString());
    expect(body.graceDays).toBe(30);
    expect(body.message).toMatch(/30 dias/);

    // Cookies de sessão devem ser limpos
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('__Host-akasha_session');
    expect(setCookie).toContain('Max-Age=0');
    expect(setCookie).toContain('__Host-akasha_refresh');
  });

  it('retorna 500 se softDeleteAccount throws', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'u-4',
      email: 'd@e.f',
      name: 'D',
    });
    const hashStr = await hash('correct', 4);
    mockUserFindUnique.mockResolvedValue({ passwordHash: hashStr });
    mockSoftDeleteAccount.mockRejectedValue(new Error('DB down'));

    const { DELETE } = await import('./route');
    const res = await DELETE(makeRequest({ 'x-confirm-password': 'correct' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.code).toBe('internal_error');
  });
});
