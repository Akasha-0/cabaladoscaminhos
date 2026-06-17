import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi, requireAkashaUser } from './akasha-guard';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockVerifyAkashaToken = vi.fn();
const mockPrismaUserFindUnique = vi.fn();

vi.mock('./akasha-jwt', () => ({
  AKASHA_TOKEN_COOKIE: 'akasha_session',
  verifyAkashaToken: (...args: unknown[]) => mockVerifyAkashaToken(...args),
}));

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args) },
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequestWithCookie(cookieValue: string | null) {
  const cookies = new Map<string, string>();
  if (cookieValue !== null) {
    cookies.set('akasha_session', cookieValue);
  }
  return {
    cookies: {
      get: (name: string) => {
        const v = cookies.get(name);
        return v !== undefined ? { value: v } : undefined;
      },
    },
  } as unknown as NextRequest;
}

const MOCK_USER = { id: 'user-1', email: 'test@example.com', name: 'Test User' };

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('akasha-guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAkashaApi', () => {
    it('returns 401 when no session cookie is present', async () => {
      const request = makeRequestWithCookie(null);

      const result = await requireAkashaApi(request);

      expect(result).toBeInstanceOf(NextResponse);
      const resp = result as NextResponse;
      expect(resp.status).toBe(401);
    });

    it('returns 401 when token verification fails', async () => {
      mockVerifyAkashaToken.mockReturnValue(null);
      const request = makeRequestWithCookie('invalid-token');

      const result = await requireAkashaApi(request);

      expect(result).toBeInstanceOf(NextResponse);
      const resp = result as NextResponse;
      expect(resp.status).toBe(401);
    });

    it('returns 401 when user is not found in database', async () => {
      mockVerifyAkashaToken.mockReturnValue({ sub: 'user-1', email: 'test@example.com', type: 'access' });
      mockPrismaUserFindUnique.mockResolvedValue(null);
      const request = makeRequestWithCookie('valid-token');

      const result = await requireAkashaApi(request);

      expect(result).toBeInstanceOf(NextResponse);
      const resp = result as NextResponse;
      expect(resp.status).toBe(401);
    });

    it('returns user object when token is valid and user exists', async () => {
      mockVerifyAkashaToken.mockReturnValue({ sub: 'user-1', email: 'test@example.com', type: 'access' });
      mockPrismaUserFindUnique.mockResolvedValue(MOCK_USER);
      const request = makeRequestWithCookie('valid-token');

      const result = await requireAkashaApi(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
    });

    it('returns 401 when DB lookup throws', async () => {
      mockVerifyAkashaToken.mockReturnValue({ sub: 'user-1', email: 'test@example.com', type: 'access' });
      mockPrismaUserFindUnique.mockRejectedValue(new Error('DB connection failed'));
      const request = makeRequestWithCookie('valid-token');

      const result = await requireAkashaApi(request);

      expect(result).toBeInstanceOf(NextResponse);
      const resp = result as NextResponse;
      expect(resp.status).toBe(401);
    });
  });

  describe('requireAkashaUser', () => {
    it('throws Error when no session cookie is present', async () => {
      const request = makeRequestWithCookie(null);

      await expect(requireAkashaUser(request)).rejects.toThrow('Unauthorized');
    });

    it('throws Error when token verification fails', async () => {
      mockVerifyAkashaToken.mockReturnValue(null);
      const request = makeRequestWithCookie('bad-token');

      await expect(requireAkashaUser(request)).rejects.toThrow('Unauthorized');
    });

    it('throws Error when user is not found in database', async () => {
      mockVerifyAkashaToken.mockReturnValue({ sub: 'user-1', email: 'test@example.com', type: 'access' });
      mockPrismaUserFindUnique.mockResolvedValue(null);
      const request = makeRequestWithCookie('valid-token');

      await expect(requireAkashaUser(request)).rejects.toThrow('Unauthorized');
    });

    it('returns user object when authenticated', async () => {
      mockVerifyAkashaToken.mockReturnValue({ sub: 'user-1', email: 'test@example.com', type: 'access' });
      mockPrismaUserFindUnique.mockResolvedValue(MOCK_USER);
      const request = makeRequestWithCookie('valid-token');

      const result = await requireAkashaUser(request);

      expect(result).toEqual({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
    });
  });
});
