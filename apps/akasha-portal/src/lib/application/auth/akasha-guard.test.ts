import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi, requireAkashaUser } from './akasha-guard';
import { signAkashaAccessToken } from './akasha-jwt';

// Mock prisma
vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock verifyAkashaToken is used from akasha-jwt which we import directly
describe('akasha-guard', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  describe('requireAkashaApi', () => {
    it('should return user object when valid token is present', async () => {
      const { prisma } = await import('@/lib/infrastructure/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as Awaited<ReturnType<typeof prisma.user.findUnique>>);

      const token = signAkashaAccessToken({ id: mockUser.id, email: mockUser.email });
      const request = new NextRequest('http://localhost/api/test');
      request.cookies.set('akasha_session', token);

      const result = await requireAkashaApi(request);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should return 401 NextResponse when no token is present', async () => {
      const request = new NextRequest('http://localhost/api/test');

      const result = await requireAkashaApi(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(401);
    });

    it('should return 401 NextResponse when user is not found', async () => {
      const { prisma } = await import('@/lib/infrastructure/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const token = signAkashaAccessToken({ id: 'nonexistent', email: 'nonexistent@example.com' });
      const request = new NextRequest('http://localhost/api/test');
      request.cookies.set('akasha_session', token);

      const result = await requireAkashaApi(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(401);
    });
  });

  describe('requireAkashaUser', () => {
    it('should return user object when valid token is present', async () => {
      const { prisma } = await import('@/lib/infrastructure/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as Awaited<ReturnType<typeof prisma.user.findUnique>>);

      const token = signAkashaAccessToken({ id: mockUser.id, email: mockUser.email });
      const request = new NextRequest('http://localhost/api/test');
      request.cookies.set('akasha_session', token);

      const result = await requireAkashaUser(request);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should throw Error when no token is present', async () => {
      const request = new NextRequest('http://localhost/api/test');

      await expect(requireAkashaUser(request)).rejects.toThrow('Unauthorized');
    });

    it('should throw Error when user is not found in database', async () => {
      const { prisma } = await import('@/lib/infrastructure/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const token = signAkashaAccessToken({ id: 'nonexistent', email: 'nonexistent@example.com' });
      const request = new NextRequest('http://localhost/api/test');
      request.cookies.set('akasha_session', token);

      await expect(requireAkashaUser(request)).rejects.toThrow('Unauthorized');
    });
  });
});
