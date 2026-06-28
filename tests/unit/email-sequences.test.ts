/**
 * Unit Tests — Email Sequences (Wave 26)
 *
 * Cobre:
 *   - src/lib/email/sequences.ts
 *     - scheduleWelcomeSeries (idempotência, 3 jobs: welcome/welcome-day2/welcome-day7)
 *     - cancelWelcomeSeries
 *     - getOrCreateUnsubscribeToken
 *
 * Prisma e email/db são mockados (sem DB real).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// MOCKS — antes dos imports
// ============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
    unsubscribeToken: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/email/db', () => ({
  enqueueBatch: vi.fn(),
  cancelCampaign: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { enqueueBatch, cancelCampaign } from '@/lib/email/db';
import {
  scheduleWelcomeSeries,
  cancelWelcomeSeries,
  getOrCreateUnsubscribeToken,
  type WelcomeSequenceUser,
} from '@/lib/email/sequences';

const mockedQueryRaw = vi.mocked(prisma.$queryRaw);
const mockedEnqueueBatch = vi.mocked(enqueueBatch);
const mockedCancelCampaign = vi.mocked(cancelCampaign);

beforeEach(() => {
  vi.clearAllMocks();
  // Default: nenhum job pré-existente (idempotência OK)
  mockedQueryRaw.mockResolvedValue([{ count: 0n }] as never);
  // Default: enqueueBatch retorna 3 IDs
  mockedEnqueueBatch.mockResolvedValue(['job-1', 'job-2', 'job-3']);
});

// =============================================================================
// Helpers
// =============================================================================

const baseUser: WelcomeSequenceUser = {
  id: 'user-123',
  email: 'caminhante@example.com',
  nomeCompleto: 'Maria Silva Santos',
  traditions: ['cabala', 'meditacao'],
  caminhoDeVida: 7,
  mainTradition: 'cabala',
};

// =============================================================================
// scheduleWelcomeSeries
// =============================================================================

describe('scheduleWelcomeSeries', () => {
  it('agenda 3 emails: welcome, welcome-day2, welcome-day7', async () => {
    const result = await scheduleWelcomeSeries(baseUser);

    expect(result.ok).toBe(true);
    expect(result.jobsScheduled).toBe(3);
    expect(result.jobIds).toEqual(['job-1', 'job-2', 'job-3']);
    expect(result.campaignId).toBe(`welcome:${baseUser.id}`);

    expect(mockedEnqueueBatch).toHaveBeenCalledTimes(1);
    const calls = mockedEnqueueBatch.mock.calls[0][0];
    expect(calls.length).toBe(3);
    expect(calls[0].templateId).toBe('welcome');
    expect(calls[1].templateId).toBe('welcome-day2');
    expect(calls[2].templateId).toBe('welcome-day7');
  });

  it('day2 e day7 são agendados no futuro relativo a now', async () => {
    const before = Date.now();
    await scheduleWelcomeSeries(baseUser);
    const after = Date.now();

    const calls = mockedEnqueueBatch.mock.calls[0][0];
    const day0 = calls[0].scheduledFor.getTime();
    const day2 = calls[1].scheduledFor.getTime();
    const day7 = calls[2].scheduledFor.getTime();

    // day0 ≈ now
    expect(day0).toBeGreaterThanOrEqual(before);
    expect(day0).toBeLessThanOrEqual(after);

    // day2 ≈ day0 + 2 dias
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    expect(day2 - day0).toBeGreaterThanOrEqual(twoDays - 5000);
    expect(day2 - day0).toBeLessThanOrEqual(twoDays + 5000);

    // day7 ≈ day0 + 7 dias
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    expect(day7 - day0).toBeGreaterThanOrEqual(sevenDays - 5000);
    expect(day7 - day0).toBeLessThanOrEqual(sevenDays + 5000);

    // day0 < day2 < day7
    expect(day0).toBeLessThan(day2);
    expect(day2).toBeLessThan(day7);
  });

  it('payload inclui firstName (primeiro nome)', async () => {
    await scheduleWelcomeSeries(baseUser);
    const calls = mockedEnqueueBatch.mock.calls[0][0];
    expect(calls[0].payload.displayName).toBe('Maria');
    expect(calls[1].payload.displayName).toBe('Maria');
    expect(calls[2].payload.displayName).toBe('Maria');
  });

  it('payload day7 inclui caminho de vida + tradição principal', async () => {
    await scheduleWelcomeSeries(baseUser);
    const calls = mockedEnqueueBatch.mock.calls[0][0];
    expect(calls[2].payload.caminhoDeVida).toBe(7);
    expect(calls[2].payload.mainTradition).toBe('cabala');
    expect(calls[2].payload.groupUrl).toContain('cabala');
  });

  it('payload day7 groupUrl é null se sem mainTradition', async () => {
    await scheduleWelcomeSeries({ ...baseUser, mainTradition: null });
    const calls = mockedEnqueueBatch.mock.calls[0][0];
    expect(calls[2].payload.groupUrl).toBeNull();
  });

  it('fallback "Caminhante" se nomeCompleto vazio', async () => {
    await scheduleWelcomeSeries({ ...baseUser, nomeCompleto: '' });
    const calls = mockedEnqueueBatch.mock.calls[0][0];
    expect(calls[0].payload.displayName).toBe('Caminhante');
  });

  it('idempotência: não duplica se já existe campanha PENDING', async () => {
    mockedQueryRaw.mockResolvedValue([{ count: 1n }] as never);
    const result = await scheduleWelcomeSeries(baseUser);

    expect(result.ok).toBe(false);
    expect(result.jobsScheduled).toBe(0);
    expect(result.jobIds).toEqual([]);
    expect(mockedEnqueueBatch).not.toHaveBeenCalled();
  });

  it('usa campaignId determinístico por userId', async () => {
    await scheduleWelcomeSeries(baseUser);
    expect(result_campaignIdFromCall()).toBe(`welcome:${baseUser.id}`);
  });

  it('campaignId propagado para todos os jobs', async () => {
    await scheduleWelcomeSeries(baseUser);
    const calls = mockedEnqueueBatch.mock.calls[0][0];
    for (const job of calls) {
      expect(job.campaignId).toBe(`welcome:${baseUser.id}`);
    }
  });
});

function result_campaignIdFromCall(): string {
  return mockedEnqueueBatch.mock.calls[0][0][0].campaignId;
}

// =============================================================================
// cancelWelcomeSeries
// =============================================================================

describe('cancelWelcomeSeries', () => {
  it('chama cancelCampaign com id correto', async () => {
    mockedCancelCampaign.mockResolvedValue(3);
    const cancelled = await cancelWelcomeSeries('user-abc');
    expect(mockedCancelCampaign).toHaveBeenCalledWith('welcome:user-abc');
    expect(cancelled).toBe(3);
  });

  it('retorna 0 quando não há jobs pendentes', async () => {
    mockedCancelCampaign.mockResolvedValue(0);
    const cancelled = await cancelWelcomeSeries('user-xyz');
    expect(cancelled).toBe(0);
  });
});

// =============================================================================
// getOrCreateUnsubscribeToken
// =============================================================================

describe('getOrCreateUnsubscribeToken', () => {
  beforeEach(() => {
    vi.mocked(prisma.unsubscribeToken.findFirst).mockReset();
    vi.mocked(prisma.unsubscribeToken.create).mockReset();
  });

  it('retorna token existente se ativo', async () => {
    vi.mocked(prisma.unsubscribeToken.findFirst).mockResolvedValue({
      token: 'existing-token',
    } as never);
    vi.mocked(prisma.unsubscribeToken.create).mockResolvedValue({} as never);

    const token = await getOrCreateUnsubscribeToken('user-1', 'welcome');
    expect(token).toBe('existing-token');
    expect(prisma.unsubscribeToken.create).not.toHaveBeenCalled();
  });

  it('cria novo token se não existe', async () => {
    vi.mocked(prisma.unsubscribeToken.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.unsubscribeToken.create).mockResolvedValue({
      token: 'new-uuid-token',
    } as never);

    const token = await getOrCreateUnsubscribeToken('user-1', 'welcome');
    expect(token).toBe('new-uuid-token');
    expect(prisma.unsubscribeToken.create).toHaveBeenCalledTimes(1);
    const call = vi.mocked(prisma.unsubscribeToken.create).mock.calls[0][0];
    expect(call.data.userId).toBe('user-1');
    expect(call.data.type).toBe('welcome');
  });

  it('token expira em 90 dias', async () => {
    vi.mocked(prisma.unsubscribeToken.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.unsubscribeToken.create).mockResolvedValue({
      token: 'new',
    } as never);

    const before = Date.now();
    await getOrCreateUnsubscribeToken('user-1', 'welcome');
    const after = Date.now();

    const call = vi.mocked(prisma.unsubscribeToken.create).mock.calls[0][0];
    const expiresAt = (call.data.expiresAt as Date).getTime();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    expect(expiresAt - before).toBeGreaterThanOrEqual(ninetyDays - 5000);
    expect(expiresAt - after).toBeLessThanOrEqual(ninetyDays + 5000);
  });

  it('aceita type=null (global unsubscribe)', async () => {
    vi.mocked(prisma.unsubscribeToken.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.unsubscribeToken.create).mockResolvedValue({
      token: 'global',
    } as never);

    await getOrCreateUnsubscribeToken('user-1', null);
    const call = vi.mocked(prisma.unsubscribeToken.create).mock.calls[0][0];
    expect(call.data.type).toBeNull();
  });
});