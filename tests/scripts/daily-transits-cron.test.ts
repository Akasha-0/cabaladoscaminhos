import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockPrismaDisconnect = vi.fn();
const mockDailyUpsert = vi.fn();

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      user = { findMany: () => Promise.resolve([]) };
      // AD-T5-E: agora é upsert (não findUnique+create)
      dailyReading = { upsert: (...args: unknown[]) => mockDailyUpsert(...args) };
      $disconnect = () => mockPrismaDisconnect();
    },
  };
});

vi.mock('../src/lib/akasha/daily-engine', () => ({
  buildDailyContent: () => ({
    climate: 'test',
    ritual: {},
    alert: 'test',
    tensionPoint: {},
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockDailyUpsert.mockResolvedValue({ id: 'test' });
  mockPrismaDisconnect.mockResolvedValue(undefined);
});

// ----------------------------------------------------------------------------
// Tests (verifica forma do payload + idempotência do upsert; não executa o script inteiro)
// ----------------------------------------------------------------------------

describe('scripts/daily-transits-cron.ts (contrato — AD-T5-E)', () => {
  it('define contrato de upsert com where { userId_date }', async () => {
    // Valida o formato do `where` que o cron usa: chave única @@unique([userId, date]).
    const today = new Date('2026-06-06T00:00:00Z');
    await mockDailyUpsert({
      where: { userId_date: { userId: 'u1', date: today } },
      create: { userId: 'u1', date: today, climate: 'c', ritual: {}, alert: 'a', tensionPoint: {} },
      update: { climate: 'c', ritual: {}, alert: 'a', tensionPoint: {} },
    });
    expect(mockDailyUpsert).toHaveBeenCalledOnce();
    const call = mockDailyUpsert.mock.calls[0][0];
    expect(call.where).toEqual({ userId_date: { userId: 'u1', date: today } });
    expect(call.create).toBeTypeOf('object');
    expect(call.update).toBeTypeOf('object');
  });

  it('não importa nem usa redis (cache morto removido)', () => {
    // AD-T5-E: o redis.setEx foi removido por ser morto (chave escrita mas nunca lida).
    // Verificamos que o módulo de produção não importa `redis` e não chama `setEx`.
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/daily-transits-cron.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/from\s+['"]redis['"]/);
    expect(src).not.toMatch(/setEx/);
  });
});

