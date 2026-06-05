// tests/integration/api/forgot-password.test.ts
// SEC-01: Verifica que o token de reset NUNCA aparece em console.info.
// O token é uma credencial de alto privilégio — logging violaria o
// princípio de menor privilégio de log.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================
// Mocked modules
// ============================================================

const mockOperatorFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: (...args: unknown[]) => mockOperatorFindUnique(...args),
    },
  },
}));

const mockGenerateResetToken = vi.fn();

vi.mock('@/lib/auth/password-reset', () => ({
  generateResetToken: (...args: unknown[]) => mockGenerateResetToken(...args),
}));

const mockEnforceAuthRateLimit = vi.fn();
const mockApplyRateLimitHeaders = vi.fn();

vi.mock('@/lib/auth/rate-limit', () => ({
  enforceAuthRateLimit: (...args: unknown[]) => mockEnforceAuthRateLimit(...args),
  applyRateLimitHeaders: (...args: unknown[]) => mockApplyRateLimitHeaders(...args),
}));

const mockLogSecurityEvent = vi.fn();

vi.mock('@/lib/auth/audit-service', () => ({
  logSecurityEvent: (...args: unknown[]) => mockLogSecurityEvent(...args),
}));

// ============================================================
// Helpers
// ============================================================

const TEST_OPERATOR = {
  id: 'op-test-123',
  email: 'ramiro@cabala.com',
  name: 'Ramiro',
};

/** Synthetic NextRequest aligned with the subset the route actually reads. */
function makeRequest(body: object, extraHeaders: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/operator/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.0.2.1',
      'user-agent': 'test-agent/1.0',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

// ============================================================
// Tests
// ============================================================

describe('POST /api/operator/auth/forgot-password — SEC-01 token sanitization', () => {
  beforeEach(() => {
    mockOperatorFindUnique.mockReset();
    mockGenerateResetToken.mockReset();
    mockEnforceAuthRateLimit.mockReset();
    mockApplyRateLimitHeaders.mockReset();
    mockLogSecurityEvent.mockReset();

    // Always allow the request through rate-limit.
    mockEnforceAuthRateLimit.mockResolvedValue({
      kind: 'ok',
      result: {
        allowed: true,
        remaining: 4,
        resetIn: 900,
        limit: 5,
      },
    });
    mockApplyRateLimitHeaders.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // SEC-01: raw token must NEVER appear in console output
  // -------------------------------------------------------------------------

  it('NÃO loga o token de reset em console.info', async () => {
    const rawToken = 'a'.repeat(64); // 64 hex chars
    mockOperatorFindUnique.mockResolvedValue(TEST_OPERATOR);
    mockGenerateResetToken.mockResolvedValue(rawToken);

    const consoleInfoSpy = vi.spyOn(console, 'info').mockReturnValue();

    // Dynamically import to ensure mocks are set up first.
    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const request = makeRequest({ email: TEST_OPERATOR.email });
    await POST(request);

    // Assert: token never appears in ANY console.info call.
    for (const [msg] of consoleInfoSpy.mock.calls) {
      const msgStr = typeof msg === 'string' ? msg : String(msg);
      expect(msgStr).not.toContain(rawToken);
      // Also assert the 64-char hex pattern doesn't leak.
      expect(msgStr).not.toMatch(/^[a-f0-9]{64}$/);
      // Sanity: if the message contains "token", it should be a sanitized reference.
      if (msgStr.toLowerCase().includes('token')) {
        expect(msgStr).toMatch(/operator=|id=/);
        // The token itself must not be embedded.
        expect(msgStr).not.toContain('token=');
        expect(msgStr).not.toContain('token%3D'); // URL-encoded variant
      }
    }

    consoleInfoSpy.mockRestore();
  });

  it('log de sucesso contém operator email e id, mas não o token', async () => {
    const rawToken = 'deadbeef'.repeat(8); // 64 hex chars
    mockOperatorFindUnique.mockResolvedValue(TEST_OPERATOR);
    mockGenerateResetToken.mockResolvedValue(rawToken);

    const consoleInfoSpy = vi.spyOn(console, 'info').mockReturnValue();

    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const request = makeRequest({ email: TEST_OPERATOR.email });
    await POST(request);

    // Positive assertion: sanitized metadata IS logged (FixSec01: no token in logs).
    const loggedMessages = consoleInfoSpy.mock.calls
      .map(([msg]) => (typeof msg === 'string' ? msg : String(msg)))
      .filter((m) => m.includes('password-reset'));

    expect(loggedMessages).toHaveLength(1);
    // New message: "[password-reset] Reset solicitado para operator=... id=..."
    expect(loggedMessages[0]).toContain('[password-reset] Reset solicitado');
    expect(loggedMessages[0]).toContain(TEST_OPERATOR.email);
    expect(loggedMessages[0]).toContain(TEST_OPERATOR.id);
    // Negative: token is absent.
    expect(loggedMessages[0]).not.toContain(rawToken);
    expect(loggedMessages[0]).not.toContain('token=');
    expect(loggedMessages[0]).not.toContain('Reset URL:');

    consoleInfoSpy.mockRestore();
  });

  it('retorna 200 mesmo quando operator existe (não revela enumeração)', async () => {
    mockOperatorFindUnique.mockResolvedValue(TEST_OPERATOR);
    mockGenerateResetToken.mockResolvedValue('b'.repeat(64));
    vi.spyOn(console, 'info').mockReturnValue(); // suppress log in test output

    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const request = makeRequest({ email: TEST_OPERATOR.email });
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('retorna 200 mesmo quando operator NÃO existe (não revela enumeração)', async () => {
    mockOperatorFindUnique.mockResolvedValue(null);
    vi.spyOn(console, 'info').mockReturnValue(); // no log expected

    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const request = makeRequest({ email: 'naoexiste@cabala.com' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockGenerateResetToken).not.toHaveBeenCalled();
  });
  it('rate-limit bloqueante retorna 429 sem chamar prisma', async () => {
    mockEnforceAuthRateLimit.mockResolvedValue({
      kind: 'blocked',
      response: {
        status: 429,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Muitas tentativas' }),
      } as unknown as Response,
    });
    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const request = makeRequest({ email: 'bloqueado@cabala.com' });
    const response = await POST(request);
    expect(response.status).toBe(429);
    expect(mockOperatorFindUnique).not.toHaveBeenCalled();
  });
});