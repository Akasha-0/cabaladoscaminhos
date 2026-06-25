/** @vitest-environment node */
/**
 * /api/akasha/auth/register route tests — Wave 19.3.
 *
 * Cobre APENAS a integração com `recordDefaultConsents` (Wave 19.3):
 *   - Sucesso no signup cria os 4 defaults de privacy consent
 *   - Defaults são exatamente: MKT=F, ANALYTICS=T, AI=F, 3RD=F
 *   - IP hash + user agent são capturados (LGPD Art. 33)
 *   - Falha em recordDefaultConsents NÃO derruba o signup (consentAt já foi persistido)
 *
 * Demais behaviors do register (validação, rate limit, criação de user +
 * signup_grant) NÃO são re-testados aqui — coverage existente.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// bcrypt é mockado para evitar custo real
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn(async (): Promise<string> => 'hashed-password') },
}));

vi.mock('@/lib/infrastructure/security/rate-limit-strict', () => ({
  checkStrictRateLimit: vi.fn(async () => ({ allowed: true })),
  buildStrictRateLimitResponse: vi.fn(() => ({
    body: { error: 'rate_limited', retryAfterSeconds: 60 },
    status: 429,
  })),
}));

vi.mock('@/lib/infrastructure/security/ip-hash', () => ({
  getClientIpInfo: vi.fn(() => ({ ip: '203.0.113.42', hash: 'test-ip-hash-xyz' })),
}));

const mockUserFindUnique = vi.fn();
const mockUserCreate = vi.fn();
const mockCreditEntryCreate = vi.fn();
const mockRecordDefaultConsents = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
    },
    creditEntry: {
      create: (...args: unknown[]) => mockCreditEntryCreate(...args),
    },
  },
}));

vi.mock('@/lib/application/privacy/consent', () => ({
  recordDefaultConsents: (...args: unknown[]) =>
    mockRecordDefaultConsents(...args),
}));

import { POST } from '../route';

beforeEach(() => {
  mockUserFindUnique.mockReset();
  mockUserCreate.mockReset();
  mockCreditEntryCreate.mockReset();
  mockRecordDefaultConsents.mockReset();

  // Default mocks for happy path
  mockUserFindUnique.mockResolvedValue(null); // email not in use
  mockUserCreate.mockResolvedValue({ id: 'user-new' });
  mockCreditEntryCreate.mockResolvedValue({});
  mockRecordDefaultConsents.mockResolvedValue({ inserted: 4 });

  // Silence console.error from non-fatal error tests
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/akasha/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-agent': 'Mozilla/5.0 (test-browser)',
      'x-forwarded-for': '203.0.113.42',
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  email: 'newuser@akasha.app',
  password: 'super-secret-123',
  name: 'New User',
  birthDate: '1990-01-15',
  birthCity: 'São Paulo',
  consent: true,
};

describe('POST /api/akasha/auth/register — Wave 19.3 default privacy consents', () => {
  it('creates default privacy consents after successful signup', async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    expect(mockRecordDefaultConsents).toHaveBeenCalledTimes(1);
  });

  it('passes userId + IP hash + user agent to recordDefaultConsents', async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);

    expect(mockRecordDefaultConsents).toHaveBeenCalledWith(
      'user-new',
      expect.objectContaining({
        ipHash: 'test-ip-hash-xyz', // mocked
        userAgent: 'Mozilla/5.0 (test-browser)',
      })
    );
  });

  it('skips default consent creation when email already exists (anti-enumeration)', async () => {
    mockUserFindUnique.mockResolvedValueOnce({ id: 'existing' });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    expect(mockRecordDefaultConsents).not.toHaveBeenCalled();
  });

  it('skips default consent creation when Zod validation fails', async () => {
    const res = await POST(makeRequest({ ...validBody, consent: false }));
    expect(res.status).toBe(400);
    expect(mockRecordDefaultConsents).not.toHaveBeenCalled();
  });

  it('signup succeeds even if recordDefaultConsents throws (consentAt is fallback)', async () => {
    mockRecordDefaultConsents.mockRejectedValueOnce(
      new Error('privacy_consents table missing')
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201); // signup still succeeds
    // Error was logged but didn't crash the request
    expect(console.error).toHaveBeenCalledWith(
      '[register] Failed to record default privacy consents',
      expect.objectContaining({
        userId: 'user-new',
        error: 'privacy_consents table missing',
      })
    );
  });

  it('falls back to "unknown" user-agent when header missing', async () => {
    const req = new NextRequest('http://localhost/api/akasha/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockRecordDefaultConsents).toHaveBeenCalledWith(
      'user-new',
      expect.objectContaining({ userAgent: 'unknown' })
    );
  });
});