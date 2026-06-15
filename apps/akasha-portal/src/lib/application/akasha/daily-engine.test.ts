/**
 * Daily Engine — F-243 test coverage
 *
 * buildDailyContent é o orquestrador do conteúdo diário. Combina:
 * - buildDailyEnergy (transit-engine) → moon phase, aspects
 * - crossAnalyze → tensionPoint, ritual, alert
 * - glossarySection (optional)
 * - synthesis (optional, from synthesis-engine)
 *
 * Cobertura: ~30% → ~50% (com este test file).
 */

import { describe, it, expect, vi } from 'vitest';

// Mock heavy dependencies
vi.mock('@/lib/application/agents/transit-engine', () => ({
  buildDailyEnergy: vi.fn(() => ({
    date: '2026-06-15',
    moonPhase: { phase: 'cheia', name: 'Lua Cheia', energy: 'expansão', action: 'colher', avoid: 'forçar', rituals: [], favorableFor: [], illumination: 100 },
    retrogradePlanets: [],
    majorAspects: [],
    overallEnergy: 75,
    overallTheme: 'Dia de colheita',
    keyAdvice: 'Mova-se com a maré',
    luckyColor: '#FF9500',
    luckyNumber: 7,
    powerHour: '14:00',
  })),
}));

vi.mock('./cross-engine', () => ({
  crossAnalyze: vi.fn(() => ({
    tensionPoint: {
      pillar: 'astrologia',
      theme: 'Saturno em quadratura',
      intensity: 65,
      affectedBody: 4,
      affectedElement: 'earth',
    },
    syncPoint: { theme: 'Lua+Vênus', color: '#7C5CFF' },
    dailyRitual: {
      titulo: 'Ritual de água',
      instrucao: 'Beba um copo olhando para a lua',
      cor: '#2DD4BF',
      elemento: 'agua',
      herbs: ['manjericão', 'camomila'],
    },
    dailyAlert: 'Evite decisões impulsivas',
    climate: 'Dia de introspecção e cura',
  })),
}));

vi.mock('./glossary', () => ({
  buildOduGlossary: vi.fn(() => 'Glossário: Ogbe = clareza, ...'),
  formatGlossarySection: vi.fn(() => '## Glossário\n\nOgbe = clareza'),
}));

vi.mock('@/lib/domain/mapa/hologram-aggregator', () => ({
  aggregateHologram: vi.fn(() => ({
    vitalityEnergia: { chakra: 'manipura', dominantElement: 'fire', keyData: {} },
    conexoesAmor: { venus: null, moon: null, lilith: null, keyData: {} },
    carreiraProsperidade: { keyData: {} },
    oriCabecaQuizilas: { keyData: {} },
    missaoDestino: { keyData: {} },
    desafiosSombras: { keyData: {} },
  })),
}));

vi.mock('./synthesis-engine', () => ({
  buildAkashaSynthesis: vi.fn(() => ({
    akashaProfile: { dominantFrequency: 'gift', overallFrequencyScore: 60, transformationStage: 'deepening', activeSequence: 'heart' },
    oneProfile: null,
    lifePath: 1,
    areas: {
      vitalidadeEnergia: { title: 'Vitalidade', frequency: 'gift', intensity: 2 },
      conexoesAmor: { title: 'Conexões', frequency: 'gift', intensity: 2 },
      carreiraProsperidade: { title: 'Carreira', frequency: 'gift', intensity: 2 },
      oriCabecaQuizilas: { title: 'Ori', frequency: 'gift', intensity: 2 },
      missaoDestino: { title: 'Missão', frequency: 'gift', intensity: 2 },
      desafiosSombras: { title: 'Desafios', frequency: 'gift', intensity: 2 },
    },
    dailyDecision: { strategy: 'observe', strategyExplanation: '...', authority: 'mental', authorityQuestion: '...', recommendation: '...', avoid: '...' },
    synthesisParagraph: 'Você está em fase de deep dive.',
  })),
}));

import { buildDailyContent } from './daily-engine';

const TODAY = new Date('2026-06-15T12:00:00Z');

describe('buildDailyContent (F-243)', () => {
  it('retorna estrutura completa com 6 campos obrigatórios', () => {
    const content = buildDailyContent({}, {}, {}, {}, TODAY);
    expect(content.date).toBe('2026-06-15');
    expect(content.climate).toBeTruthy();
    expect(content.ritual).toBeDefined();
    expect(content.ritual.titulo).toBeTruthy();
    expect(content.ritual.instrucao).toBeTruthy();
    expect(content.alert).toBeTruthy();
    expect(content.tensionPoint).toBeDefined();
    expect(content.moonPhase).toBeTruthy();
    expect(content.overallTheme).toBeTruthy();
  });

  it('ritual tem 4 campos: titulo, instrucao, cor, elemento', () => {
    const content = buildDailyContent({}, {}, {}, {}, TODAY);
    expect(content.ritual).toHaveProperty('titulo');
    expect(content.ritual).toHaveProperty('instrucao');
    expect(content.ritual).toHaveProperty('cor');
    expect(content.ritual).toHaveProperty('elemento');
  });

  it('tensionPoint tem pillar, theme, intensity', () => {
    const content = buildDailyContent({}, {}, {}, {}, TODAY);
    expect(content.tensionPoint.pillar).toBeTruthy();
    expect(content.tensionPoint.theme).toBeTruthy();
    expect(content.tensionPoint.intensity).toBeGreaterThanOrEqual(0);
    expect(content.tensionPoint.intensity).toBeLessThanOrEqual(100);
  });

  it('date é ISO date (YYYY-MM-DD) do input', () => {
    const content = buildDailyContent({}, {}, {}, {}, new Date('2026-12-25T08:00:00Z'));
    expect(content.date).toBe('2026-12-25');
  });

  it('glossarySection é opcional (pode ser undefined)', () => {
    const content = buildDailyContent({}, {}, {}, {}, TODAY);
    // Pode ser string ou undefined
    expect(['string', 'undefined']).toContain(typeof content.glossarySection);
  });

  it('synthesis é opcional (pode ser undefined)', () => {
    const content = buildDailyContent({}, {}, {}, {}, TODAY);
    expect(['object', 'undefined']).toContain(typeof content.synthesis);
  });
});

describe('buildDailyContent — graceful fallback', () => {
  it('nunca throws com inputs vazios', () => {
    expect(() => buildDailyContent({}, {}, {}, {}, TODAY)).not.toThrow();
    expect(() => buildDailyContent(null, null, null, null, TODAY)).not.toThrow();
    expect(() => buildDailyContent(undefined, undefined, undefined, undefined, TODAY)).not.toThrow();
  });

  it('date sempre é string válida', () => {
    const content = buildDailyContent({}, {}, {}, {}, TODAY);
    expect(content.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('climate/overallTheme sempre são strings não-vazias', () => {
    const content = buildDailyContent({}, {}, {}, {}, TODAY);
    expect(typeof content.climate).toBe('string');
    expect(content.climate.length).toBeGreaterThan(0);
    expect(typeof content.overallTheme).toBe('string');
    expect(content.overallTheme.length).toBeGreaterThan(0);
  });
});
