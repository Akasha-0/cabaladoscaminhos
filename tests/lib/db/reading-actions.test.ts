// tests/lib/db/reading-actions.test.ts
// Cobre: getReadingsByOperator — wiring de `opts.limit` e `opts.status`
// (Fase X: cycle-187 — bug fix de opts param não honrado).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getReadingsByOperator } from '@/lib/db/reading-actions';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    reading: {
      findMany: vi.fn(),
    },
  },
}));

const mockReading = {
  id: 'reading-1',
  operatorId: 'op-1',
  clientId: 'client-1',
  status: 'COMPLETED' as const,
  createdAt: new Date('2026-05-01'),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.reading.findMany).mockResolvedValue([mockReading]);
});

describe('getReadingsByOperator', () => {
  it('passa apenas operatorId quando opts ausente', async () => {
    await getReadingsByOperator('op-1');

    expect(prisma.reading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { operatorId: 'op-1' },
        orderBy: { createdAt: 'desc' },
      })
    );
    const call = vi.mocked(prisma.reading.findMany).mock.calls[0][0];
    expect(call).not.toHaveProperty('take');
    expect((call?.where as Record<string, unknown>).status).toBeUndefined();
  });

  it('filtra por status quando opts.status fornecido', async () => {
    await getReadingsByOperator('op-1', { status: 'COMPLETED' });

    expect(prisma.reading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { operatorId: 'op-1', status: 'COMPLETED' },
      })
    );
  });

  it('aplica take quando opts.limit fornecido', async () => {
    await getReadingsByOperator('op-1', { limit: 5 });

    expect(prisma.reading.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
  });

  it('combina limit + status corretamente', async () => {
    await getReadingsByOperator('op-1', { limit: 10, status: 'PENDING' });

    expect(prisma.reading.findMany).toHaveBeenCalledWith({
      where: { operatorId: 'op-1', status: 'PENDING' },
      include: { client: true, report: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  });
});
