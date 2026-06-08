import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockBuildDailyEnergy = vi.fn();
vi.mock('@/lib/agents/transit-engine', () => ({
  buildDailyEnergy: (...args: unknown[]) => mockBuildDailyEnergy(...args),
}));

const mockCrossAnalyze = vi.fn();
vi.mock('@/lib/akasha/cross-engine', () => ({
  crossAnalyze: (...args: unknown[]) => mockCrossAnalyze(...args),
}));

vi.mock('@/lib/akasha/glossary', () => ({
  buildOduGlossary: () => ({ oduName: 'ogbe', preceitos: ['Pureza'] }),
  formatGlossarySection: () => '## Glossário Odu\n- Odu: ogbe\n- Preceito: Pureza',
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockBuildDailyEnergy.mockReturnValue({
    date: '2026-06-06',
    moonPhase: { name: 'Lua Cheia', phase: 'full' },
    majorAspects: [{ type: 'trine', planets: ['Sun', 'Moon'], orb: 1.2 }],
    overallTheme: 'Iluminação',
    luckyColor: 'dourado',
    overallEnergy: 78,
  });

  mockCrossAnalyze.mockReturnValue({
    climate: 'Lua Cheia em Sagitário, signo da expansão e da verdade.',
    dailyRitual: {
      titulo: 'Banho de alecrim com sal grosso',
      instrucao: 'Ferver alecrim com sal grosso, tomar o banho de cima para baixo.',
      cor: 'dourado',
      elemento: 'Fogo',
      herbs: ['alecrim', 'sal-grosso'],
    },
    dailyAlert: 'Tensão no corpo 7 (corpo áurico) — proteja-se com erva-de-são-joão.',
    tensionPoint: {
      pillar: 'corpo-aurico',
      theme: 'Vulnerabilidade espiritual',
      intensity: 6,
      affectedBody: 7,
      affectedElement: 'Ar',
    },
  });
});

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('Daily Engine — RAG-fechado (Camada 3 anti-alucinação)', () => {
  it('inclui APENAS correspondências determinísticas (sem chamada LLM)', async () => {
    const { buildDailyContent } = await import('@/lib/akasha/daily-engine');

    const result = buildDailyContent(
      { sun: 'Leão', moon: 'Sagitário' },
      { lifePath: 5 },
      { activeBodies: [7] },
      { oduName: 'ogbe', orixaRegency: ['Ogum'] },
      new Date('2026-06-06')
    );

    // O resultado deve ser completamente determinístico
    expect(result.date).toBe('2026-06-06');
    expect(result.climate).toBeTruthy();
    expect(result.ritual.titulo).toBeTruthy();
    expect(result.alert).toBeTruthy();
    expect(result.tensionPoint.pillar).toBe('corpo-aurico');
  });

  it('NÃO cita fontes externas (Wikipedia, Google, livros) — RAG-fechado', async () => {
    const { buildDailyContent } = await import('@/lib/akasha/daily-engine');

    const result = buildDailyContent({}, {}, {}, {}, new Date('2026-06-06'));

    // Serializa o resultado completo e checa
    const text = JSON.stringify(result);
    expect(text).not.toMatch(/Wikipedia|google\.com|livro|book/i);
    // NUNCA cita URL
    expect(text).not.toMatch(/https?:\/\//);
  });

  it('inyeta o glossário-base do Odu (AD-T5-F / AD-20.2) — ancoragem da verdade', async () => {
    const { buildDailyContent } = await import('@/lib/akasha/daily-engine');

    const result = buildDailyContent({}, {}, {}, { oduName: 'ogbe' }, new Date('2026-06-06'));

    expect(result.glossarySection).toBeDefined();
    expect(result.glossarySection).toMatch(/Odu: ogbe/);
  });

  it('degrada graciosamente quando transit-engine falha (fallback determinístico)', async () => {
    mockBuildDailyEnergy.mockImplementationOnce(() => {
      throw new Error('Swiss Ephemeris offline');
    });

    const { buildDailyContent } = await import('@/lib/akasha/daily-engine');

    // Não deve quebrar — fallback interno
    const result = buildDailyContent({}, {}, {}, {}, new Date('2026-06-06'));

    // Fallback retorna Lua em transição
    expect(result.moonPhase).toMatch(/Lua/);
    // overallTheme do fallback
    expect(result.overallTheme).toBeTruthy();
  });

  it('chama crossAnalyze com os mapas enriquecidos do trânsito (interseção pilares)', async () => {
    const { buildDailyContent } = await import('@/lib/akasha/daily-engine');

    buildDailyContent(
      { sun: 'Leão', elementalChart: { Fogo: 0.7 } },
      { lifePath: 5 },
      { activeBodies: [7] },
      { oduName: 'ogbe' },
      new Date('2026-06-06')
    );

    // crossAnalyze foi chamado com mapa enriquecido
    expect(mockCrossAnalyze).toHaveBeenCalled();
    const callArgs = mockCrossAnalyze.mock.calls[0];
    const enrichedAstro = callArgs[0];
    // O enriquecimento deve incluir overallEnergy e luckyColor do transit-engine
    expect(enrichedAstro.overallEnergy).toBe(78);
    expect(enrichedAstro.luckyColor).toBe('dourado');
    expect(enrichedAstro.majorAspects).toHaveLength(1);
  });

  it('produz payload estruturado para injeção em prompt de IA (Camada 3)', async () => {
    const { buildDailyContent } = await import('@/lib/akasha/daily-engine');

    const result = buildDailyContent({}, {}, {}, {}, new Date('2026-06-06'));

    // Estrutura esperada (todos os campos para Camada 3 anti-alucinação)
    expect(result).toMatchObject({
      date: expect.any(String),
      climate: expect.any(String),
      ritual: expect.objectContaining({
        titulo: expect.any(String),
        instrucao: expect.any(String),
        cor: expect.any(String),
        elemento: expect.any(String),
      }),
      alert: expect.any(String),
      tensionPoint: expect.objectContaining({
        pillar: expect.any(String),
        theme: expect.any(String),
        intensity: expect.any(Number),
      }),
      moonPhase: expect.any(String),
      overallTheme: expect.any(String),
    });
  });
});
