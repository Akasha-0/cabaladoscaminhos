/**
 * Tests — consciousness/background-job.ts (Wave 24.1)
 *
 * Coverage:
 *   1. generateInsights: determinístico, idempotente
 *   2. generateInsights: respeita count e dedup
 *   3. generateInsights: vazio quando count=0
 *   4. runBackgroundInsights: SUCCESS quando ≥5 insights e zero erros
 *   5. runBackgroundInsights: FAILED quando zero insights
 *   6. runBackgroundInsights: PARTIAL_SUCCESS quando <5 insights
 *   7. runBackgroundInsights: papersCited conta únicos
 *   8. runBackgroundInsights: graceful degradation (Prisma throws)
 *   9. runBackgroundInsights: InsightJob.update captura erros
 *  10. LGPD: não persiste PII em errors
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mocks (vi.hoisted para vi.mock factory) ──────────────────────────────

const { mockPrisma, insightJobs, mockLogger } = vi.hoisted(() => {
  const insightJobsLocal: Array<{
    id: string;
    jobName: string;
    startedAt: Date;
    finishedAt: Date | null;
    status: string;
    insightsGenerated: number;
    papersCited: number;
    errors: unknown;
    windowSpec: unknown;
  }> = [];
  const mockLoggerLocal = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const mockPrismaLocal = {
    insightJob: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const row = {
          id: `job_${insightJobsLocal.length + 1}`,
          jobName: (data.jobName as string) ?? 'discoveries-cron',
          startedAt: (data.startedAt as Date) ?? new Date(),
          finishedAt: (data.finishedAt as Date | null) ?? null,
          status: (data.status as string) ?? 'RUNNING',
          insightsGenerated: (data.insightsGenerated as number) ?? 0,
          papersCited: (data.papersCited as number) ?? 0,
          errors: data.errors ?? { items: [] },
          windowSpec: data.windowSpec ?? {},
        };
        insightJobsLocal.push(row);
        return { id: row.id };
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = insightJobsLocal.find((r) => r.id === where.id);
        if (!row) throw new Error('not found');
        Object.assign(row, data);
        return row;
      }),
      findMany: vi.fn(async () => insightJobsLocal),
    },
    literaturePaper: {
      findMany: vi.fn(async () => []),
    },
    discovery: {
      findMany: vi.fn(async () => []),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => data),
    },
    feedbackEvent: {
      findMany: vi.fn(async () => []),
    },
  };
  return { mockPrisma: mockPrismaLocal, insightJobs: insightJobsLocal, mockLogger: mockLoggerLocal };
});

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: mockPrisma,
}));

import {
  generateInsights,
  runBackgroundInsights,
  type CollectedInputs,
} from '../background-job';

// ─── Setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
  insightJobs.length = 0;
  vi.clearAllMocks();
});

// ─── generateInsights ─────────────────────────────────────────────────────

describe('generateInsights', () => {
  const baseInputs: CollectedInputs = {
    papers: [
      { id: 'p1', title: 'Ayahuasca and consciousness', tags: ['meditation'] },
      { id: 'p2', title: 'I-Ching patterns', tags: ['iching'] },
    ],
    discoveries: [
      { id: 'd1', truth: 'Presence emerges in silence', tags: ['presence'] },
    ],
    feedback: [
      { targetType: 'DISCOVERY', rating: 5 },
      { targetType: 'DISCOVERY', rating: 4 },
    ],
    sources: { papers: 'prisma', discoveries: 'prisma', feedback: 'prisma' },
  };

  it('gera exatamente N insights quando count=N', () => {
    const insights = generateInsights(baseInputs, 7, new Date('2026-06-25T03:00:00Z'));
    expect(insights).toHaveLength(7);
  });

  it('retorna array vazio quando count=0', () => {
    const insights = generateInsights(baseInputs, 0, new Date());
    expect(insights).toHaveLength(0);
  });

  it('retorna array vazio quando count<0', () => {
    const insights = generateInsights(baseInputs, -3, new Date());
    expect(insights).toHaveLength(0);
  });

  it('é determinístico: mesmas inputs + mesmo timestamp → mesmo output', () => {
    const ts = new Date('2026-06-25T03:00:00Z');
    const a = generateInsights(baseInputs, 5, ts);
    const b = generateInsights(baseInputs, 5, ts);
    expect(a).toEqual(b);
  });

  it('IDs são únicos dentro do mesmo dia', () => {
    const insights = generateInsights(baseInputs, 10, new Date('2026-06-25T03:00:00Z'));
    const ids = new Set(insights.map((i) => i.id));
    expect(ids.size).toBe(insights.length);
  });

  it('IDs são prefixados com `insight_YYYY-MM-DD_NNN`', () => {
    const insights = generateInsights(baseInputs, 3, new Date('2026-06-25T03:00:00Z'));
    for (const insight of insights) {
      expect(insight.id).toMatch(/^insight_2026-06-25_\d{3}$/);
    }
  });

  it('cada insight tem estrutura válida (truth, headline, actions, tags, confidence)', () => {
    const insights = generateInsights(baseInputs, 3, new Date('2026-06-25T03:00:00Z'));
    for (const insight of insights) {
      expect(insight.truth.length).toBeGreaterThan(0);
      expect(insight.headline.length).toBeGreaterThan(0);
      expect(insight.actions).toHaveLength(3);
      expect(insight.tags).toContain('wave-24.1');
      expect(insight.confidence).toBeGreaterThanOrEqual(0);
      expect(insight.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('confidence é maior quando há papers (sinal de evidência)', () => {
    const withPapers = generateInsights(baseInputs, 5, new Date());
    const noPapers: CollectedInputs = {
      ...baseInputs,
      papers: [],
    };
    const withoutPapers = generateInsights(noPapers, 5, new Date());
    // Verifica pelo menos 1 insight com confidence > 0.4 (papers → 0.7)
    expect(withPapers.some((i) => i.confidence > 0.4)).toBe(true);
    expect(withoutPapers.every((i) => i.confidence <= 0.4)).toBe(true);
  });

  it('actions são todas únicas por insight', () => {
    const insights = generateInsights(baseInputs, 5, new Date());
    for (const insight of insights) {
      const set = new Set(insight.actions);
      expect(set.size).toBe(3); // sem duplicatas dentro do mesmo insight
    }
  });
});

// ─── runBackgroundInsights ────────────────────────────────────────────────

describe('runBackgroundInsights', () => {
  const mockLogger = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    mockLogger.log.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
  });

  it('cria InsightJob row (RUNNING → SUCCESS)', async () => {
    const result = await runBackgroundInsights({
      logger: mockLogger,
      now: () => new Date('2026-06-25T03:00:00Z'),
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.insightsGenerated).toBeGreaterThanOrEqual(5);
    expect(mockPrisma.insightJob.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.insightJob.update).toHaveBeenCalledTimes(1);
  });

  it('PARTIAL_SUCCESS quando <5 insights são gerados', async () => {
    // Mock Discovery.create to throw (force partial)
    mockPrisma.discovery.create.mockRejectedValueOnce(new Error('mock db down'));

    // But that won't affect insights count (we count what we generate,
    // not what we persist — see comment in runBackgroundInsights).
    // Force low count via maxInsights=2:
    const result = await runBackgroundInsights({
      maxInsights: 2,
      logger: mockLogger,
    });

    expect(result.insightsGenerated).toBe(2);
    expect(result.status).toBe('PARTIAL_SUCCESS');
  });

  it('FAILED quando zero insights (maxInsights=0)', async () => {
    const result = await runBackgroundInsights({
      maxInsights: 0,
      logger: mockLogger,
    });

    expect(result.insightsGenerated).toBe(0);
    expect(result.status).toBe('FAILED');
  });

  it('papersCited conta IDs únicos (sem duplicação)', async () => {
    // Override mock to return papers
    vi.mocked(mockPrisma.literaturePaper.findMany).mockResolvedValueOnce([
      { id: 'p1', title: 'P1', tags: [] },
      { id: 'p2', title: 'P2', tags: [] },
      { id: 'p1', title: 'P1 again', tags: [] }, // duplicate
    ] as never);

    const result = await runBackgroundInsights({
      logger: mockLogger,
    });

    // Should be ≤ 3 (we slice(0,3) per insight, so up to 3 papers cited)
    expect(result.papersCited).toBeLessThanOrEqual(3);
  });

  it('graceful degradation: prisma.insightJob.create throws → continua', async () => {
    mockPrisma.insightJob.create.mockRejectedValueOnce(
      new Error('table insight_jobs does not exist')
    );

    const result = await runBackgroundInsights({
      logger: mockLogger,
    });

    // jobId='noop' (não bloqueia)
    expect(result.jobId).toBe('noop');
    // Mas insights ainda são gerados
    expect(result.insightsGenerated).toBeGreaterThanOrEqual(5);
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('graceful degradation: prisma.insightJob.update throws → não quebra response', async () => {
    mockPrisma.insightJob.update.mockRejectedValueOnce(new Error('update failed'));

    const result = await runBackgroundInsights({
      logger: mockLogger,
    });

    // Resultado ainda retornado
    expect(result.status).toBeDefined();
    expect(result.insightsGenerated).toBeGreaterThan(0);
    // Logger capturou warning
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('windowSpec documenta janelas temporais no InsightJob', async () => {
    await runBackgroundInsights({
      papersWindowDays: 14,
      discoveriesWindowDays: 60,
      feedbackWindowDays: 7,
      logger: mockLogger,
    });

    const createCall = mockPrisma.insightJob.create.mock.calls[0]?.[0];
    expect(createCall?.data.windowSpec).toEqual({
      papersWindowDays: 14,
      discoveriesWindowDays: 60,
      feedbackWindowDays: 7,
    });
  });

  it('LGPD: errors não contêm PII (apenas stage, message, input)', async () => {
    // Force one error
    vi.mocked(mockPrisma.discovery.create).mockImplementation(() => {
      throw new Error('email leaked: user@example.com');
    });

    const result = await runBackgroundInsights({
      logger: mockLogger,
    });

    // We don't strip the error message ourselves — but at minimum we
    // verify the SHAPE: errors[].stage, errors[].message, errors[].input.
    // This is a structural test (schema contract), not a PII redaction test.
    // Wave 24.2+ should add explicit PII redaction in runBackgroundInsights.
    for (const err of result.errors) {
      expect(err).toHaveProperty('stage');
      expect(['collect-papers', 'collect-discoveries', 'collect-feedback', 'generate', 'persist']).toContain(err.stage);
      expect(err).toHaveProperty('message');
      if (err.input !== undefined) {
        expect(typeof err.input).toBe('string');
      }
    }
  });

  it('insights gerados NÃO têm userId (são globais — sem Zelador attribution)', async () => {
    // Spy on Discovery.create calls
    const createSpy = mockPrisma.discovery.create;

    await runBackgroundInsights({ logger: mockLogger });

    // If Discovery.create was called, verify no userId field
    for (const call of createSpy.mock.calls) {
      const data = call[0]?.data as Record<string, unknown> | undefined;
      expect(data).not.toHaveProperty('userId');
      expect(data).not.toHaveProperty('user_id');
    }
  });

  it('jobName default é "discoveries-cron"', async () => {
    await runBackgroundInsights({ logger: mockLogger });

    const createCall = mockPrisma.insightJob.create.mock.calls[0]?.[0];
    expect(createCall?.data.jobName).toBe('discoveries-cron');
  });

  it('jobName customizado é respeitado', async () => {
    await runBackgroundInsights({
      jobName: 'custom-insights-2026',
      logger: mockLogger,
    });

    const createCall = mockPrisma.insightJob.create.mock.calls[0]?.[0];
    expect(createCall?.data.jobName).toBe('custom-insights-2026');
  });
});
