// tests/lib/auth/audit-service.test.ts
// Tests for audit-service (Fase 21).

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    securityEvent: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

import { logSecurityEvent } from '@/lib/auth/audit-service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('logSecurityEvent', () => {
  it('chama prisma com campos completos', async () => {
    logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      operatorId: 'op-123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      metadata: { extra: 'data' },
    });
    await Promise.resolve();
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        type: 'LOGIN_SUCCESS',
        operatorId: 'op-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        metadata: { extra: 'data' },
      },
    });
  });

  it('omite metadata quando nao fornecido', async () => {
    logSecurityEvent({ type: 'LOGIN_FAILURE' });
    await Promise.resolve();
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        type: 'LOGIN_FAILURE',
        operatorId: null,
        ipAddress: null,
        userAgent: null,
      },
    });
  });

  it('NÃO lança quando prisma rejeita', async () => {
    mockCreate.mockRejectedValueOnce(new Error('DB unavailable'));
    expect(() => {
      logSecurityEvent({ type: 'LOGIN_FAILURE' });
    }).not.toThrow();
    await Promise.resolve();
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('retorna void — caller nao pode depender do resultado', () => {
    const result = logSecurityEvent({ type: 'REFRESH_REUSE' });
    expect(result).toBeUndefined();
  });

  it('suporta todos os tipos de evento', async () => {
    const eventTypes = [
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE',
      'REFRESH_REUSE',
      'RATE_LIMIT_EXCEEDED',
      'MFA_ENABLED',
      'MFA_DISABLED',
      'PASSWORD_CHANGED',
      'SESSION_REVOKED',
      'ACCOUNT_LOCKED',
    ] as const;
    for (const type of eventTypes) {
      mockCreate.mockClear();
      logSecurityEvent({ type });
      await Promise.resolve();
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({ type }),
      });
    }
  });

  it('logs error to console quando create falha', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue();
    mockCreate.mockRejectedValueOnce(new Error('network error'));
    logSecurityEvent({ type: 'LOGIN_SUCCESS' });
    await Promise.resolve();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[audit-service] failed to persist security event',
      expect.objectContaining({ type: 'LOGIN_SUCCESS', error: 'network error' })
    );
    consoleErrorSpy.mockRestore();
  });
});
