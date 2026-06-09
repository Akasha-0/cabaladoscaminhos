/**
 * @akasha/core-iching — Testes para Práticas Integrativas
 */

import {
  PRACTICES,
  getPractice,
  getPracticesByElement,
  getPracticesByTradition,
  getPracticesByCategory,
  getPracticesByLifeArea,
  getAllPractices,
} from '../practices';

describe('Práticas Integrativas', () => {
  describe('getAllPractices', () => {
    it('deve retornar exatamente 20 práticas', () => {
      expect(getAllPractices()).toHaveLength(20);
    });

    it('deve retornar uma cópia do array original', () => {
      const all = getAllPractices();
      all.push({} as never);
      expect(getAllPractices()).toHaveLength(20);
    });
  });

  describe('getPractice', () => {
    it('deve retornar uma prática pelo ID', () => {
      const practice = getPractice('ewe-oxum');
      expect(practice).toBeDefined();
      expect(practice?.name).toBe('Ewé de Oxum');
      expect(practice?.tradition).toBe('Candomblé');
    });

    it('deve retornar undefined para ID inexistente', () => {
      expect(getPractice('inexistente')).toBeUndefined();
    });
  });

  describe('getPracticesByElement', () => {
    it('deve retornar práticas de água', () => {
      const waterPractices = getPracticesByElement('agua');
      expect(waterPractices.length).toBeGreaterThan(0);
      waterPractices.forEach((p) => {
        expect(p.associations.element).toBe('agua');
      });
    });

    it('deve retornar array vazio para elemento sem práticas', () => {
      const arPractices = getPracticesByElement('ar');
      expect(arPractices).toHaveLength(0);
    });
  });

  describe('getPracticesByTradition', () => {
    it('deve retornar práticas do Candomblé', () => {
      const candomble = getPracticesByTradition('Candomblé');
      expect(candomble.length).toBe(4);
      candomble.forEach((p) => {
        expect(p.tradition).toBe('Candomblé');
      });
    });

    it('deve retornar práticas do Ifá', () => {
      const ifa = getPracticesByTradition('Ifá');
      expect(ifa.length).toBe(1);
      ifa.forEach((p) => {
        expect(p.tradition).toBe('Ifá');
      });
    });

    it('deve retornar práticas da Cristaloterapia', () => {
      const cristais = getPracticesByTradition('Cristaloterapia');
      expect(cristais.length).toBe(5);
    });
  });

  describe('getPracticesByCategory', () => {
    it('deve retornar práticas de banho_de_ervas', () => {
      const banhos = getPracticesByCategory('banho_de_ervas');
      expect(banhos.length).toBe(2);
    });

    it('deve retornar práticas de cristal', () => {
      const cristais = getPracticesByCategory('cristal');
      expect(cristais.length).toBe(5);
    });
  });

  describe('getPracticesByLifeArea', () => {
    it('deve retornar práticas para área amor', () => {
      const amorPractices = getPracticesByLifeArea('amor');
      expect(amorPractices.length).toBeGreaterThan(0);
    });

    it('deve ser case insensitive', () => {
      const lower = getPracticesByLifeArea('amor');
      const upper = getPracticesByLifeArea('AMOR');
      expect(lower.length).toBe(upper.length);
    });
  });

  describe('integridade dos dados', () => {
    it('todas as práticas devem ter isSafe true', () => {
      PRACTICES.forEach((p) => {
        expect(p.isSafe).toBe(true);
      });
    });

    it('todas as práticas devem ter ID único', () => {
      const ids = PRACTICES.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(PRACTICES.length);
    });

    it('todas as práticas devem ter associações com hexagramas válidos (1-64)', () => {
      PRACTICES.forEach((p) => {
        const hexagrams = p.associations.hexagrams;
        if (hexagrams) {
          hexagrams.forEach((h) => {
            expect(h).toBeGreaterThanOrEqual(1);
            expect(h).toBeLessThanOrEqual(64);
          });
        }
      });
    });
  });
});
