/**
 * Cross-Engine — F-244 test coverage
 *
 * crossAnalyze combina inputs de 5 Pilares e devolve análise cruzada:
 * tensionPoint, syncPoint, dailyRitual, dailyAlert, climate.
 *
 * Cobertura: ~0% → ~40% (com este test file).
 */

import { describe, it, expect, vi } from 'vitest';

// Mock odu-data to avoid DB dependency
vi.mock('./odu-data', () => ({
  getOduByName: vi.fn((name: string) => {
    const map: Record<string, unknown> = {
      Ogbe: { oduName: 'Ogbe', oduNumber: 1, elementalForce: 'Fogo', prohibitions: [], orixas: ['Ogum'], description: 'Clareza' },
      Oyeku: { oduName: 'Oyeku', oduNumber: 2, elementalForce: 'Terra', prohibitions: [], orixas: ['Iemanjá'], description: 'Mistério' },
    };
    return map[name];
  }),
  getSignElement: vi.fn((sign: string) => {
    const map: Record<string, string> = {
      Escorpião: 'water', Leao: 'fire', Touro: 'earth', Libra: 'air',
      Cancer: 'water', Aries: 'fire', Capricornio: 'earth', Aquario: 'air',
      Peixes: 'water', Gemeos: 'air', Sagitario: 'fire', Virgem: 'earth',
    };
    return map[sign] ?? null;
  }),
}));

import { crossAnalyze } from './cross-engine';

const TODAY = new Date('2026-06-15T12:00:00Z');

describe('crossAnalyze (F-244)', () => {
  it('retorna 5 campos: tensionPoint, syncPoint, dailyRitual, dailyAlert, climate', () => {
    const result = crossAnalyze(
      { sunSign: 'Escorpião', moonSign: 'Peixes', dominantElement: 'water' },
      { lifePath: 11, birthday: 7, expression: 5, sephira: 'Tiphereth' },
      { corpoPredominante: 4, trigemeo: 'astral' },
      { oduPrincipal: 'Ogbe' },
      TODAY
    );
    expect(result.tensionPoint).toBeDefined();
    expect(result.syncPoint).toBeDefined();
    expect(result.dailyRitual).toBeDefined();
    expect(result.dailyAlert).toBeTruthy();
    expect(result.climate).toBeTruthy();
  });

  it('tensionPoint tem pillar, theme, intensity (0-100)', () => {
    const result = crossAnalyze(
      { sunSign: 'Escorpião' },
      { lifePath: 11, birthday: 7, expression: 5 },
      { corpoPredominante: 4 },
      { oduPrincipal: 'Ogbe' },
      TODAY
    );
    expect(result.tensionPoint.pillar).toBeTruthy();
    expect(result.tensionPoint.theme).toBeTruthy();
    expect(result.tensionPoint.intensity).toBeGreaterThanOrEqual(0);
    expect(result.tensionPoint.intensity).toBeLessThanOrEqual(100);
  });

  it('syncPoint tem theme + color', () => {
    const result = crossAnalyze(
      { sunSign: 'Escorpião' },
      { lifePath: 11 },
      { corpoPredominante: 4 },
      { oduPrincipal: 'Ogbe' },
      TODAY
    );
    expect(result.syncPoint.theme).toBeTruthy();
    expect(result.syncPoint.color).toBeTruthy();
  });

  it('dailyRitual tem 5 campos: titulo, instrucao, cor, elemento, herbs?', () => {
    const result = crossAnalyze(
      { sunSign: 'Escorpião' },
      { lifePath: 11 },
      { corpoPredominante: 4 },
      { oduPrincipal: 'Ogbe' },
      TODAY
    );
    expect(result.dailyRitual.titulo).toBeTruthy();
    expect(result.dailyRitual.instrucao).toBeTruthy();
    expect(result.dailyRitual.cor).toBeTruthy();
    expect(result.dailyRitual.elemento).toBeTruthy();
    // herbs é opcional mas se presente deve ser array
    if (result.dailyRitual.herbs) {
      expect(Array.isArray(result.dailyRitual.herbs)).toBe(true);
    }
  });

  it('climate é string não-vazia', () => {
    const result = crossAnalyze(
      { sunSign: 'Leão' },
      { lifePath: 1 },
      { corpoPredominante: 1 },
      { oduPrincipal: 'Ogbe' },
      TODAY
    );
    expect(typeof result.climate).toBe('string');
    expect(result.climate.length).toBeGreaterThan(5);
  });
});

describe('crossAnalyze — graceful fallback', () => {
  it('nunca throws com inputs vazios', () => {
    expect(() =>
      crossAnalyze({}, {}, {}, {}, TODAY)
    ).not.toThrow();
  });

  it('nunca throws com inputs null', () => {
    expect(() =>
      crossAnalyze(
        null as any, null as any, null as any, null as any, TODAY
      )
    ).not.toThrow();
  });

  it('sempre retorna tensionPoint mesmo com dados faltando', () => {
    const result = crossAnalyze({}, {}, {}, {}, TODAY);
    expect(result.tensionPoint).toBeDefined();
    expect(result.tensionPoint.pillar).toBeTruthy();
  });
});
