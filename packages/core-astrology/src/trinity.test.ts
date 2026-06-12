/**
 * F-209: Tríade Sombra/Dom/Graça — tests
 *
 * Cobertura:
 * - classifyAspect: quadratura/oposição → Sombra
 * - classifyAspect: trígono/sextil → Dom
 * - classifyAspect: conjunção exata Sol/Lua → Graça
 * - countTrinity: contagem correta
 * - dominantTrinity: maioria determina
 * - Edge case: empate entre níveis
 */

import { describe, it, expect } from 'vitest';
import { classifyAspect, countTrinity, dominantTrinity } from './trinity';
import type { Aspecto } from './tipos';

function makeAspect(overrides: Partial<Aspecto>): Aspecto {
  return {
    planeta1: 'sol',
    planeta2: 'venus',
    tipo: 'trino',
    orb: 2.0,
    nature: 'harmony',
    ...overrides,
  } as Aspecto;
}

describe('F-209: Tríade Sombra/Dom/Graça', () => {
  describe('classifyAspect', () => {
    it('quadratura → Sombra', () => {
      expect(classifyAspect(makeAspect({ tipo: 'quadratura' }))).toBe('sombra');
    });

    it('oposição → Sombra', () => {
      expect(classifyAspect(makeAspect({ tipo: 'oposição' }))).toBe('sombra');
    });

    it('trígono → Dom', () => {
      expect(classifyAspect(makeAspect({ tipo: 'trino' }))).toBe('dom');
    });

    it('sextil → Dom', () => {
      expect(classifyAspect(makeAspect({ tipo: 'sextil' }))).toBe('dom');
    });

    it('conjunção exata Sol-Lua (orbe < 1°) → Graça', () => {
      expect(
        classifyAspect(
          makeAspect({ tipo: 'conjunção', orb: 0.5, planeta1: 'sol', planeta2: 'lua' }),
        ),
      ).toBe('graca');
    });

    it('conjunção Sol-Vênus com orbe grande → Dom (não Graça)', () => {
      expect(
        classifyAspect(
          makeAspect({ tipo: 'conjunção', orb: 3.0, planeta1: 'sol', planeta2: 'venus' }),
        ),
      ).toBe('dom');
    });

    it('conjunção Mercúrio-Marte (não luminares) → Dom', () => {
      expect(
        classifyAspect(
          makeAspect({ tipo: 'conjunção', orb: 0.3, planeta1: 'mercurio', planeta2: 'marte' }),
        ),
      ).toBe('dom');
    });
  });

  describe('countTrinity', () => {
    it('conta corretamente em cada nível', () => {
      const aspects: Aspecto[] = [
        makeAspect({ tipo: 'quadratura' }),
        makeAspect({ tipo: 'oposição' }),
        makeAspect({ tipo: 'trino' }),
        makeAspect({ tipo: 'sextil' }),
        makeAspect({ tipo: 'conjunção', orb: 0.5, planeta1: 'sol', planeta2: 'lua' }),
      ];
      const count = countTrinity(aspects);
      expect(count.sombra).toBe(2);
      expect(count.dom).toBe(2);
      expect(count.graca).toBe(1);
    });

    it('lista vazia → tudo zero', () => {
      expect(countTrinity([])).toEqual({ sombra: 0, dom: 0, graca: 0 });
    });
  });

  describe('dominantTrinity', () => {
    it('Graça domina quando mais frequente', () => {
      expect(dominantTrinity({ sombra: 1, dom: 2, graca: 5 })).toBe('graca');
    });

    it('Dom domina quando mais frequente', () => {
      expect(dominantTrinity({ sombra: 1, dom: 10, graca: 0 })).toBe('dom');
    });

    it('Sombra domina quando mais frequente', () => {
      expect(dominantTrinity({ sombra: 5, dom: 1, graca: 0 })).toBe('sombra');
    });

    it('empate Dom/Sombra (zero Graca) → Dom', () => {
      expect(dominantTrinity({ sombra: 3, dom: 3, graca: 0 })).toBe('dom');
    });
  });

  it('nomenclatura Akasha: sombra/dom/graca (não shadow/gift/siddhi)', () => {
    const result = classifyAspect(makeAspect({ tipo: 'trino' }));
    expect(['sombra', 'dom', 'graca']).toContain(result);
  });
});
