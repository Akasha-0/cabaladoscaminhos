/**
 * @akasha/core-iching — Testes para Práticas Integrativas (lookup direto)
 *
 * Cobertura do módulo `practices-lookup.ts` (helpers de busca sobre
 * o banco `PRACTICES`). Testa diretamente o módulo, sem passar pelo
 * re-export em `practices.ts`.
 *
 * NOTA: `practices.ts` (re-importado transitivamente) tem exports
 * duplicados que provocam erro de parse em rolldown — usamos
 * `vi.mock` + `vi.hoisted` para fornecer um array de práticas em
 * memória, evitando o ciclo de parse e mantendo os testes isolados.
 */

import { describe, it, expect, vi } from 'vitest';
import type { IntegrativePractice } from './types';

const { fixture } = vi.hoisted(() => {
  const fixture: IntegrativePractice[] = [
    {
      id: 'ewe-oxum',
      name: 'Ewé de Oxum',
      tradition: 'Candomblé',
      category: 'banho_de_ervas',
      associations: { element: 'agua', orixa: 'Oxum', color: 'dourado' },
      lifeAreas: ['amor', 'prosperidade', 'fertilidade', 'autoestima'],
      howTo: 'Ferva folhas de oxum fresco em 1 litro de água por 15 minutos.',
      frequency: 'Semanalmente',
      isSafe: true,
    },
    {
      id: 'quartzo-rosa',
      name: 'Cristais de Quartzo Rosa',
      tradition: 'Cristaloterapia',
      category: 'cristal',
      associations: { element: 'agua', color: 'rosa' },
      lifeAreas: ['amor', 'autoestima', 'cura emocional'],
      howTo: 'Segure o quartzo rosa em cada mão durante 10 minutos.',
      frequency: 'Diariamente',
      isSafe: true,
    },
    {
      id: 'defumacao-palo-santo',
      name: 'Defumação de Palo Santo',
      tradition: 'Ifá',
      category: 'defumacao',
      associations: { element: 'fogo', color: 'branco' },
      lifeAreas: ['limpeza', 'proteção', 'espiritualidade'],
      howTo: 'Acenda o palo santo e passe a fumaça pelo ambiente.',
      frequency: 'Ao acordar',
      isSafe: true,
    },
    {
      id: 'banho-sal-alecrim',
      name: 'Banho de Sal e Alecrim',
      tradition: 'Candomblé',
      category: 'banho_de_ervas',
      associations: { element: 'terra', color: 'verde' },
      lifeAreas: ['proteção', 'purificação'],
      howTo: 'Misture 7 colheres de sal grosso com alecrim fresco.',
      frequency: 'Segunda e quinta, 21 dias',
      isSafe: true,
    },
  ];
  return { fixture };
});

vi.mock('./practices', () => ({ PRACTICES: fixture }));

// Importa depois do mock para que o módulo pegue o `PRACTICES` mockado.
import {
  getPractice,
  getPracticesByElement,
  getPracticesByTradition,
  getPracticesByCategory,
  getPracticesByLifeArea,
  getAllPractices,
} from './practices-lookup';

describe('practices-lookup', () => {
  describe('getPractice', () => {
    it('retorna prática existente pelo ID', () => {
      const p = getPractice('ewe-oxum');
      expect(p).toBeDefined();
      expect(p?.id).toBe('ewe-oxum');
      expect(p?.tradition).toBe('Candomblé');
    });

    it('retorna undefined para ID inexistente (edge case: lookup miss)', () => {
      expect(getPractice('nao-existe')).toBeUndefined();
      expect(getPractice('')).toBeUndefined();
    });
  });

  describe('getPracticesByElement', () => {
    it('filtra práticas de um elemento existente', () => {
      const agua = getPracticesByElement('agua');
      expect(agua.length).toBeGreaterThan(0);
      agua.forEach((p) => {
        expect(p.associations.element).toBe('agua');
      });
    });

    it('retorna array vazio para elemento sem práticas (edge case: empty bucket)', () => {
      expect(getPracticesByElement('ar')).toEqual([]);
      expect(getPracticesByElement('metal')).toEqual([]);
    });
  });

  describe('getPracticesByTradition', () => {
    it('retorna todas as práticas de uma tradição conhecida', () => {
      const candomble = getPracticesByTradition('Candomblé');
      expect(candomble.length).toBeGreaterThan(0);
      candomble.forEach((p) => expect(p.tradition).toBe('Candomblé'));
    });

    it('retorna array vazio para tradição desconhecida (edge case: tradition miss)', () => {
      expect(getPracticesByTradition('Xamanismo')).toEqual([]);
      expect(getPracticesByTradition('')).toEqual([]);
    });
  });

  describe('getPracticesByCategory', () => {
    it('filtra práticas por categoria válida', () => {
      const banhos = getPracticesByCategory('banho_de_ervas');
      expect(banhos.length).toBeGreaterThan(0);
      banhos.forEach((p) => expect(p.category).toBe('banho_de_ervas'));
    });

    it('retorna array vazio para categoria sem práticas (edge case: empty category)', () => {
      expect(getPracticesByCategory('protecao')).toEqual([]);
    });
  });

  describe('getPracticesByLifeArea', () => {
    it('encontra práticas para área de vida comum', () => {
      const amor = getPracticesByLifeArea('amor');
      expect(amor.length).toBeGreaterThan(0);
    });

    it('é case-insensitive e trim-safe (edge case: normalize input)', () => {
      const lower = getPracticesByLifeArea('amor');
      const upper = getPracticesByLifeArea('AMOR');
      const padded = getPracticesByLifeArea('  amor  ');
      expect(lower.length).toBe(upper.length);
      expect(lower.length).toBe(padded.length);
    });

    it('retorna array vazio para área de vida sem matches', () => {
      expect(getPracticesByLifeArea('voar')).toEqual([]);
    });
  });

  describe('getAllPractices', () => {
    it('retorna cópia do array (mutação não vaza)', () => {
      const a1 = getAllPractices();
      const a2 = getAllPractices();
      expect(a1).not.toBe(a2);
      expect(a1.length).toBe(a2.length);
      a1.push({} as never);
      expect(getAllPractices().length).toBe(a2.length);
    });
  });
});
