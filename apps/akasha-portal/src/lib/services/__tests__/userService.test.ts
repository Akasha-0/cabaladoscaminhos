import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/infrastructure/prisma';
import { getUserById, updateUserIchingEnabled } from '../userService';

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserById should call findUnique with correct parameters', async () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    const result = await getUserById('1');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      select: expect.any(Object),
    });
    expect(result).toEqual(mockUser);
  });

  it('updateUserIchingEnabled should call update with correct parameters', async () => {
    const mockUpdatedUser = { ichingEnabled: true };
    vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as any);

    const result = await updateUserIchingEnabled('1', true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      select: { ichingEnabled: true },
      data: { ichingEnabled: true },
    });
    expect(result).toEqual(mockUpdatedUser);
  });

  it('getUserById should return null if user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const result = await getUserById('non-existent');
    expect(result).toBeNull();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'non-existent' },
      select: expect.any(Object),
    });
  });

  it('updateUserIchingEnabled should handle database errors', async () => {
    vi.mocked(prisma.user.update).mockRejectedValue(new Error('Database error'));
    await expect(updateUserIchingEnabled('1', true)).rejects.toThrow('Database error');
  });
});
