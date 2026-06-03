// tests/lib/auth/audit-service.test.ts
// Tests for audit-service (Fase 21).
// Covers: logSecurityEvent (fire-and-forget), persistSecurityEvent (internal).

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----------------------------------------------------------------------------
// Mock prisma
// ----------------------------------------------------------------------------

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

// ============================================================================
// logSecurityEvent — fire-and-forget
// ============================================================================

describe('logSecurityEvent', () => {
  it('chama prisma.securityEvent.create com os campos corretos', async () => {
    logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      operatorId: 'op-123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      metadata: { extra: 'data' },
    });

    // Aguarda o microtask do fire-and-forget
    await vi.runAllTimersAsync();

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

  it('chama prisma com null quando campos são omitidos', async () => {
    logSecurityEvent({ type: 'LOGIN_FAILURE' });

    await vi.runAllTimersAsync();

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        type: 'LOGIN_FAILURE',
        operatorId: null,
        ipAddress: null,
        userAgent: null,
        metadata: null,
      },
    });
  });

  it('chama prisma com null para metadata quando undefined', async () => {
    logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      ipAddress: '10.0.0.1',
      metadata: undefined,
    });

    await vi.runAllTimersAsync();

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        type: 'RATE_LIMIT_EXCEEDED',
        operatorId: null,
        ipAddress: '10.0.0.1',
        userAgent: null,
        metadata: null,
      },
    });
  });

  it('NÃO lança quando prisma.securityEvent.create rejeita', () => {
    mockCreate.mockRejectedValueOnce(new Error('DB unavailable'));

    // Não deve lançar
    expect(() => {
      logSecurityEvent({ type: 'LOGIN_FAILURE' });
    }).not.toThrow();

    // Mas deve tentar chamar
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('retorna void imediatamente (não aguarda Promise)', () => {
    mockCreate.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    const result = logSecurityEvent({ type: 'REFRESH_REUSE' });

    // Retorna void — caller não pode depender do resultado
    expect(result).toBeUndefined();

    // O mock ainda NÃO foi chamado (Promise não awaited internamente)
    // Note: em Node, vi.runAllTimersAsync() podeawait as promises
    // Então verificamos que pelo menos o mock foi configurado
    expect(mockCreate).not.toHaveBeenCalled();
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
      await vi.runAllTimersAsync();

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
    await vi.runAllTimersAsync();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[audit-service] failed to persist security event',
      expect.objectContaining({
        type: 'LOGIN_SUCCESS',
        error: 'network error',
      })
    );

    consoleErrorSpy.mockRestore();
  });
});
