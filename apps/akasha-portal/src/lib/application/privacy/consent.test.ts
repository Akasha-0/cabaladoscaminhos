/** @vitest-environment node */
/**
 * Privacy consent application layer — helper tests — Wave 19.3.
 *
 * Cobre:
 *   - getUserConsentState: defaults quando sem rows
 *   - getUserConsentState: latest decision per type (mais recente vence)
 *   - getUserConsentState: rows múltiplas do mesmo tipo = só a última conta
 *   - getUserConsentHistory: ordenado DESC, limit aplicado
 *   - recordConsentDecision: cria nova row (append-only) — chave LGPD
 *   - recordDefaultConsents: insere os 4 defaults no signup
 *   - isConsentGranted: true se última decisão for grant, false se revoke
 *   - isConsentGranted: usa DEFAULT_SIGNUP_CONSENTS quando sem rows
 *   - extractConsentContext: extrai IP hash + user agent do request
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/infrastructure/security/ip-hash', () => ({
  getClientIpInfo: vi.fn(() => ({ ip: '127.0.0.1', hash: 'test-hash' })),
}));

const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockCreateMany = vi.fn();
const mockFindFirst = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    privacyConsent: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      createMany: (...args: unknown[]) => mockCreateMany(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

import {
  ALL_PRIVACY_CONSENT_TYPES,
  DEFAULT_SIGNUP_CONSENTS,
  extractConsentContext,
  getUserConsentState,
  getUserConsentHistory,
  isConsentGranted,
  recordConsentDecision,
  recordDefaultConsents,
} from './consent';
import type { PrivacyConsentType } from '@prisma/client';

beforeEach(() => {
  mockFindMany.mockReset();
  mockCreate.mockReset();
  mockCreateMany.mockReset();
  mockFindFirst.mockReset();
});

// ─── Constants ──────────────────────────────────────────────────────
describe('Constants', () => {
  it('exports 4 canonical types', () => {
    expect(ALL_PRIVACY_CONSENT_TYPES).toEqual([
      'MARKETING',
      'ANALYTICS',
      'AI_TRAINING',
      'THIRD_PARTY_SHARING',
    ]);
  });

  it('default consents match LGPD opt-in rules', () => {
    expect(DEFAULT_SIGNUP_CONSENTS.MARKETING).toBe(false);
    expect(DEFAULT_SIGNUP_CONSENTS.ANALYTICS).toBe(true);
    expect(DEFAULT_SIGNUP_CONSENTS.AI_TRAINING).toBe(false);
    expect(DEFAULT_SIGNUP_CONSENTS.THIRD_PARTY_SHARING).toBe(false);
  });
});

// ─── getUserConsentState ────────────────────────────────────────────
describe('getUserConsentState', () => {
  it('returns 4 defaults when user has no rows', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    const state = await getUserConsentState('user-1');
    expect(state).toHaveLength(4);
    const byType = new Map(state.map((s) => [s.type, s.granted]));
    expect(byType.get('MARKETING')).toBe(false);
    expect(byType.get('ANALYTICS')).toBe(true);
    expect(byType.get('AI_TRAINING')).toBe(false);
    expect(byType.get('THIRD_PARTY_SHARING')).toBe(false);
  });

  it('rejects empty userId', async () => {
    await expect(getUserConsentState('')).rejects.toThrow(/userId/);
  });

  it('uses latest decision per type (append-only honored)', async () => {
    // Mock returns rows in DESC grantedAt order (matches the orderBy
    // applied in getUserConsentState). The first MARKETING row in the
    // list is therefore the latest decision.
    mockFindMany.mockResolvedValueOnce([
      {
        type: 'MARKETING' as PrivacyConsentType,
        granted: true,
        grantedAt: new Date('2026-06-25T10:00:00Z'),
      },
      {
        type: 'MARKETING' as PrivacyConsentType,
        granted: false,
        grantedAt: new Date('2026-06-01T10:00:00Z'),
      },
      {
        type: 'ANALYTICS' as PrivacyConsentType,
        granted: true,
        grantedAt: new Date('2026-06-20T10:00:00Z'),
      },
    ]);
    const state = await getUserConsentState('user-1');
    const marketing = state.find((s) => s.type === 'MARKETING');
    expect(marketing?.granted).toBe(true);
    expect(marketing?.decidedAt).toBe('2026-06-25T10:00:00.000Z');
  });

  it('does not invent defaults for types with prior decisions', async () => {
    // Only MARKETING has a row (granted=true). Others should still return
    // their DEFAULTS (LGPD Art. 7º) since user has never toggled them.
    mockFindMany.mockResolvedValueOnce([
      {
        type: 'MARKETING' as PrivacyConsentType,
        granted: true,
        grantedAt: new Date('2026-06-25T10:00:00Z'),
      },
    ]);
    const state = await getUserConsentState('user-1');
    const ai = state.find((s) => s.type === 'AI_TRAINING');
    expect(ai?.granted).toBe(DEFAULT_SIGNUP_CONSENTS.AI_TRAINING);
  });

  it('uses orderBy grantedAt DESC + id DESC for stable latest selection', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getUserConsentState('user-1');
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ grantedAt: 'desc' }, { id: 'desc' }],
      select: expect.objectContaining({
        type: true,
        granted: true,
        grantedAt: true,
      }),
    });
  });
});

// ─── getUserConsentHistory ──────────────────────────────────────────
describe('getUserConsentHistory', () => {
  it('returns rows mapped to DTO', async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        id: 'pc-1',
        type: 'MARKETING' as PrivacyConsentType,
        granted: true,
        grantedAt: new Date('2026-06-25T10:00:00Z'),
      },
    ]);
    const history = await getUserConsentHistory('user-1');
    expect(history[0]).toEqual({
      id: 'pc-1',
      type: 'MARKETING',
      granted: true,
      decidedAt: '2026-06-25T10:00:00.000Z',
    });
  });

  it('applies limit', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getUserConsentHistory('user-1', 25);
    const args = mockFindMany.mock.calls[0]?.[0] as { take: number };
    expect(args.take).toBe(25);
  });

  it('default limit is 50', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    await getUserConsentHistory('user-1');
    const args = mockFindMany.mock.calls[0]?.[0] as { take: number };
    expect(args.take).toBe(50);
  });

  it('rejects invalid limit', async () => {
    await expect(getUserConsentHistory('user-1', 0)).rejects.toThrow(/limit/);
    await expect(getUserConsentHistory('user-1', 999)).rejects.toThrow(/limit/);
  });

  it('rejects empty userId', async () => {
    await expect(getUserConsentHistory('')).rejects.toThrow(/userId/);
  });
});

// ─── recordConsentDecision (APPEND-ONLY) ───────────────────────────
describe('recordConsentDecision (append-only — LGPD Art. 37)', () => {
  it('uses create (NOT update/upsert) — preserves history', async () => {
    mockCreate.mockResolvedValueOnce({
      id: 'pc-new',
      type: 'ANALYTICS' as PrivacyConsentType,
      granted: false,
      grantedAt: new Date('2026-06-25T15:00:00Z'),
    });

    await recordConsentDecision({
      userId: 'user-1',
      type: 'ANALYTICS',
      granted: false,
      ipHash: 'h-1',
      userAgent: 'browser/x',
    });

    // CRITICAL: must use `create` for append-only audit trail
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'ANALYTICS',
        granted: false,
        ipHash: 'h-1',
        userAgent: 'browser/x',
      },
      select: expect.any(Object),
    });
  });

  it('returns DTO with id and ISO timestamp', async () => {
    mockCreate.mockResolvedValueOnce({
      id: 'pc-99',
      type: 'MARKETING' as PrivacyConsentType,
      granted: true,
      grantedAt: new Date('2026-06-25T16:30:00Z'),
    });
    const dto = await recordConsentDecision({
      userId: 'user-1',
      type: 'MARKETING',
      granted: true,
      ipHash: 'h',
      userAgent: 'ua',
    });
    expect(dto).toEqual({
      id: 'pc-99',
      type: 'MARKETING',
      granted: true,
      decidedAt: '2026-06-25T16:30:00.000Z',
    });
  });

  it('rejects empty userId', async () => {
    await expect(
      recordConsentDecision({
        userId: '',
        type: 'MARKETING',
        granted: true,
        ipHash: 'h',
        userAgent: 'ua',
      })
    ).rejects.toThrow(/userId/);
  });

  it('rejects invalid type', async () => {
    await expect(
      recordConsentDecision({
        userId: 'u',
        type: 'BOGUS' as PrivacyConsentType,
        granted: true,
        ipHash: 'h',
        userAgent: 'ua',
      })
    ).rejects.toThrow(/type/);
  });

  it('rejects missing ipHash (LGPD)', async () => {
    await expect(
      recordConsentDecision({
        userId: 'u',
        type: 'MARKETING',
        granted: true,
        ipHash: '',
        userAgent: 'ua',
      })
    ).rejects.toThrow(/ipHash/);
  });

  it('rejects missing userAgent (LGPD)', async () => {
    await expect(
      recordConsentDecision({
        userId: 'u',
        type: 'MARKETING',
        granted: true,
        ipHash: 'h',
        userAgent: '',
      })
    ).rejects.toThrow(/userAgent/);
  });
});

// ─── recordDefaultConsents (signup) ─────────────────────────────────
describe('recordDefaultConsents (signup)', () => {
  it('inserts 4 defaults via createMany', async () => {
    mockCreateMany.mockResolvedValueOnce({ count: 4 });
    const result = await recordDefaultConsents('user-1', {
      ipHash: 'h',
      userAgent: 'ua',
    });
    expect(result.inserted).toBe(4);
    expect(mockCreateMany).toHaveBeenCalledTimes(1);
    const args = mockCreateMany.mock.calls[0]?.[0] as {
      data: Array<{
        userId: string;
        type: PrivacyConsentType;
        granted: boolean;
        ipHash: string;
        userAgent: string;
      }>;
    };
    expect(args.data).toHaveLength(4);
    const byType = new Map(args.data.map((d) => [d.type, d.granted]));
    expect(byType.get('MARKETING')).toBe(false);
    expect(byType.get('ANALYTICS')).toBe(true);
    expect(byType.get('AI_TRAINING')).toBe(false);
    expect(byType.get('THIRD_PARTY_SHARING')).toBe(false);
    // LGPD context propagated to every row
    for (const row of args.data) {
      expect(row.ipHash).toBe('h');
      expect(row.userAgent).toBe('ua');
      expect(row.userId).toBe('user-1');
    }
  });

  it('rejects empty userId', async () => {
    await expect(
      recordDefaultConsents('', { ipHash: 'h', userAgent: 'ua' })
    ).rejects.toThrow(/userId/);
  });
});

// ─── isConsentGranted ───────────────────────────────────────────────
describe('isConsentGranted', () => {
  it('returns default when no rows', async () => {
    mockFindFirst.mockResolvedValueOnce(null);
    const granted = await isConsentGranted('user-1', 'ANALYTICS');
    expect(granted).toBe(true); // default
  });

  it('returns true when latest decision is grant', async () => {
    mockFindFirst.mockResolvedValueOnce({ granted: true });
    const granted = await isConsentGranted('user-1', 'MARKETING');
    expect(granted).toBe(true);
  });

  it('returns false when latest decision is revoke', async () => {
    mockFindFirst.mockResolvedValueOnce({ granted: false });
    const granted = await isConsentGranted('user-1', 'MARKETING');
    expect(granted).toBe(false);
  });

  it('returns false for empty userId', async () => {
    expect(await isConsentGranted('', 'MARKETING')).toBe(false);
  });

  it('returns false for invalid type', async () => {
    expect(await isConsentGranted('user-1', 'BOGUS' as PrivacyConsentType)).toBe(
      false
    );
  });
});

// ─── extractConsentContext ──────────────────────────────────────────
describe('extractConsentContext', () => {
  it('extracts IP hash + user agent from request', () => {
    const request = {
      headers: {
        get(name: string) {
          if (name === 'user-agent') return 'Mozilla/5.0';
          return null;
        },
      },
    };
    const ctx = extractConsentContext(request);
    expect(ctx.ipHash).toBe('test-hash');
    expect(ctx.userAgent).toBe('Mozilla/5.0');
  });

  it('falls back to "unknown" when user-agent header missing', () => {
    const request = {
      headers: {
        get() {
          return null;
        },
      },
    };
    const ctx = extractConsentContext(request);
    expect(ctx.userAgent).toBe('unknown');
  });
});