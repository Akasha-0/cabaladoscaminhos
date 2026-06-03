// tests/lib/auth/account-lockout.test.ts
// Fase 26 — Account Lockout Service Tests
//
// Testa:
//   - isLocked(): retorna locked=true quando conta está bloqueada
//   - recordFailedAttempt(): incrementa contador e define lockout
//   - recordSuccessfulLogin(): reseta contador
//   - unlockAccount(): unlock administrativo

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Constants (must match service) ───────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;

// ─── Prisma mock ─────────────────────────────────────────────────────────────
const mockOperatorUpdate = vi.fn();
const mockOperatorFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: vi.fn((...args: unknown[]) => mockOperatorFindUnique(...args)),
      update: vi.fn((...args: unknown[]) => mockOperatorUpdate(...args)),
    },
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeOperator(opts: {
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
}): { failedLoginAttempts: number; lockedUntil: Date | null } {
  return {
    failedLoginAttempts: opts.failedLoginAttempts ?? 0,
    lockedUntil: opts.lockedUntil ?? null,
  };
}

function futureDate(msFromNow: number): Date {
  return new Date(Date.now() + msFromNow);
}

function pastDate(msAgo: number): Date {
  return new Date(Date.now() - msAgo);
}

// ─── Tests ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
});

describe('isLocked', () => {
  it('returns locked:false when account has no lockout', async () => {
    mockOperatorFindUnique.mockResolvedValueOnce(makeOperator({ failedLoginAttempts: 0 }));

    const { isLocked } = await import('@/lib/auth/account-lockout');
    const result = await isLocked('test@example.com');

    expect(result.locked).toBe(false);
    expect(result.until).toBeUndefined();
  });

  it('returns locked:false when attempts < MAX_ATTEMPTS', async () => {
    mockOperatorFindUnique.mockResolvedValueOnce(makeOperator({ failedLoginAttempts: 3 }));

    const { isLocked } = await import('@/lib/auth/account-lockout');
    const result = await isLocked('test@example.com');

    expect(result.locked).toBe(false);
  });
  it('returns locked:true when lockedUntil is in the future', async () => {
    const lockUntil = futureDate(LOCKOUT_DURATION_MS);
    mockOperatorFindUnique.mockResolvedValueOnce(makeOperator({
      failedLoginAttempts: MAX_ATTEMPTS,
      lockedUntil: lockUntil,
    }));

    const { isLocked } = await import('@/lib/auth/account-lockout');
    const result = await isLocked('test@example.com');

    expect(result.locked).toBe(true);
    expect(result.until).toEqual(lockUntil);
  });

  it('returns locked:false when lockedUntil is in the past', async () => {
    mockOperatorFindUnique.mockResolvedValueOnce(makeOperator({
      failedLoginAttempts: MAX_ATTEMPTS,
      lockedUntil: pastDate(60_000),
    }));

    const { isLocked } = await import('@/lib/auth/account-lockout');
    const result = await isLocked('test@example.com');

    expect(result.locked).toBe(false);
  });

  it('returns locked:false when email does not exist (no enumeration)', async () => {
    mockOperatorFindUnique.mockResolvedValueOnce(null);

    const { isLocked } = await import('@/lib/auth/account-lockout');
    const result = await isLocked('nonexistent@example.com');

    expect(result.locked).toBe(false);
    expect(result.until).toBeUndefined();
  });
});

describe('recordFailedAttempt', () => {
  it('increments failedLoginAttempts counter', async () => {
    mockOperatorFindUnique.mockResolvedValueOnce(makeOperator({ failedLoginAttempts: 2 }));
    mockOperatorUpdate.mockResolvedValueOnce({});

    const { recordFailedAttempt } = await import('@/lib/auth/account-lockout');
    await recordFailedAttempt('test@example.com');

    expect(mockOperatorUpdate).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      data: { failedLoginAttempts: 3 },
    });
  });

  it('sets lockedUntil when reaching MAX_ATTEMPTS', async () => {
    mockOperatorFindUnique.mockResolvedValueOnce(makeOperator({ failedLoginAttempts: 4 }));
    mockOperatorUpdate.mockResolvedValueOnce({});

    const { recordFailedAttempt } = await import('@/lib/auth/account-lockout');
    await recordFailedAttempt('test@example.com');

    const updateCall = mockOperatorUpdate.mock.calls[0][0];
    expect(updateCall.data.failedLoginAttempts).toBe(5);
    expect(updateCall.data.lockedUntil).toBeInstanceOf(Date);
  });

  it('does not update if already locked', async () => {
    mockOperatorFindUnique.mockResolvedValueOnce(makeOperator({
      failedLoginAttempts: MAX_ATTEMPTS,
      lockedUntil: futureDate(LOCKOUT_DURATION_MS),
    }));

    const { recordFailedAttempt } = await import('@/lib/auth/account-lockout');
    await recordFailedAttempt('test@example.com');

    expect(mockOperatorUpdate).not.toHaveBeenCalled();
  });

  it('ignores nonexistent email', async () => {
    mockOperatorFindUnique.mockResolvedValueOnce(null);

    const { recordFailedAttempt } = await import('@/lib/auth/account-lockout');
    await recordFailedAttempt('nonexistent@example.com');

    expect(mockOperatorUpdate).not.toHaveBeenCalled();
  });
});

describe('recordSuccessfulLogin', () => {
  it('resets failedLoginAttempts to 0', async () => {
    mockOperatorUpdate.mockResolvedValueOnce({});

    const { recordSuccessfulLogin } = await import('@/lib/auth/account-lockout');
    await recordSuccessfulLogin('test@example.com');

    expect(mockOperatorUpdate).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  });

  it('handles nonexistent email gracefully', async () => {
    mockOperatorUpdate.mockRejectedValueOnce(new Error('Not found'));

    const { recordSuccessfulLogin } = await import('@/lib/auth/account-lockout');
    await expect(recordSuccessfulLogin('nonexistent@example.com')).resolves.toBeUndefined();
  });
});

describe('unlockAccount', () => {
  it('resets failedLoginAttempts and clears lockedUntil', async () => {
    mockOperatorUpdate.mockResolvedValueOnce({});

    const { unlockAccount } = await import('@/lib/auth/account-lockout');
    await unlockAccount('test@example.com');

    expect(mockOperatorUpdate).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  });

  it('handles nonexistent email gracefully', async () => {
    mockOperatorUpdate.mockRejectedValueOnce(new Error('Not found'));

    const { unlockAccount } = await import('@/lib/auth/account-lockout');
    await expect(unlockAccount('nonexistent@example.com')).resolves.toBeUndefined();
  });
});
