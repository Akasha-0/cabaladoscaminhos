import { describe, it, expect } from 'vitest';
import {
  getElementNumerology,
  getAllElementNumerologies,
  getNumerologyByElement,
  getNumerologyElement,
  getArquetipoByElement,
  getQualidadesByElement,
  getSignificadoByElement,
  getEnergiaByElement,
  getPolaridadeByElement,
  getAllElementTypes,
  getAllNumerologyNumbers,
  ELEMENT_NUMEROLOGY_MAP,
  type ElementNumerology,
} from '@/lib/correlation/element-numerology';

describe('ElementNumerology Correlation', () => {
  describe('getElementNumerology', () => {
    it('should return mapping for fogo', () => {
      const result = getElementNumerology('fogo');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('fogo');
      expect(result?.elemento_nome).toBe('Fogo');
      expect(result?.elemento_english).toBe('Fire');
    });

    it('should return mapping for água with accent normalization', () => {
      const result = getElementNumerology('agua');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('água');
    });

    it('should return mapping for terra', () => {
      const result = getElementNumerology('terra');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('terra');
    });

    it('should return mapping for ar', () => {
      const result = getElementNumerology('ar');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('ar');
    });

    it('should return mapping for éter with accent normalization', () => {
      const result = getElementNumerology('eter');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('éter');
    });

    it('should return undefined for invalid element', () => {
      const result = getElementNumerology('invalid');
      expect(result).toBeUndefined();
    });

    it('should handle case insensitive input', () => {
      const result = getElementNumerology('FOGO');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('fogo');
    });
  });

  describe('getAllElementNumerologies', () => {
    it('should return all 5 elements', () => {
      const result = getAllElementNumerologies();
      expect(result).toHaveLength(5);
    });

    it('should contain all expected elements', () => {
      const result = getAllElementNumerologies();
      const elementos = result.map((e) => e.elemento);
      expect(elementos).toContain('fogo');
      expect(elementos).toContain('água');
      expect(elementos).toContain('terra');
      expect(elementos).toContain('ar');
      expect(elementos).toContain('éter');
    });

    it('should have correct numerology numbers for each element', () => {
      const result = getAllElementNumerologies();
      const fogo = result.find((e) => e.elemento === 'fogo');
      const agua = result.find((e) => e.elemento === 'água');
      const terra = result.find((e) => e.elemento === 'terra');
      const ar = result.find((e) => e.elemento === 'ar');
      const eter = result.find((e) => e.elemento === 'éter');

      expect(fogo?.numeros).toEqual([1, 3, 6, 12]);
      expect(agua?.numeros).toEqual([2, 5, 9]);
      expect(terra?.numeros).toEqual([4, 10, 13]);
      expect(ar?.numeros).toEqual([7, 8]);
      expect(eter?.numeros).toEqual([11]);
    });
  });

  describe('ELEMENT_NUMEROLOGY_MAP', () => {
    it('should have all 5 elements mapped', () => {
      expect(ELEMENT_NUMEROLOGY_MAP).toHaveProperty('fogo');
      expect(ELEMENT_NUMEROLOGY_MAP).toHaveProperty('água');
      expect(ELEMENT_NUMEROLOGY_MAP).toHaveProperty('terra');
      expect(ELEMENT_NUMEROLOGY_MAP).toHaveProperty('ar');
      expect(ELEMENT_NUMEROLOGY_MAP).toHaveProperty('éter');
    });

    it('should have required properties for each element', () => {
      for (const elemento of Object.values(ELEMENT_NUMEROLOGY_MAP)) {
        expect(elemento.elemento).toBeDefined();
        expect(elemento.elemento_nome).toBeDefined();
        expect(elemento.elemento_english).toBeDefined();
        expect(elemento.numeros).toBeDefined();
        expect(Array.isArray(elemento.numeros)).toBe(true);
        expect(elemento.numeros.length).toBeGreaterThan(0);
        expect(elemento.significado_espiritual).toBeDefined();
        expect(elemento.arquetipo).toBeDefined();
        expect(elemento.orixa).toBeDefined();
        expect(elemento.sephirah).toBeDefined();
        expect(elemento.chakra).toBeDefined();
        expect(elemento.planeta).toBeDefined();
        expect(elemento.cor).toBeDefined();
        expect(elemento.direcao).toBeDefined();
        expect(elemento.qualidades).toBeDefined();
        expect(elemento.qualidades.forca).toBeDefined();
        expect(elemento.qualidades.desafio).toBeDefined();
        expect(elemento.qualidades.licao).toBeDefined();
        expect(elemento.qualidades.afirmacao).toBeDefined();
        expect(elemento.energia).toBeDefined();
        expect(elemento.energia.tipo).toBeDefined();
        expect(elemento.energia.polaridade).toBeDefined();
      }
    });

    it('should have unique numbers for each element', () => {
      const allNumbers: number[] = [];
      for (const elemento of Object.values(ELEMENT_NUMEROLOGY_MAP)) {
        allNumbers.push(...elemento.numeros);
      }
      const uniqueNumbers = new Set(allNumbers);
      expect(uniqueNumbers.size).toBe(allNumbers.length);
    });
  });

  describe('getNumerologyByElement', () => {
    it('should return correct numbers for each element', () => {
      expect(getNumerologyByElement('fogo')).toEqual([1, 3, 6, 12]);
      expect(getNumerologyByElement('água')).toEqual([2, 5, 9]);
      expect(getNumerologyByElement('terra')).toEqual([4, 10, 13]);
      expect(getNumerologyByElement('ar')).toEqual([7, 8]);
      expect(getNumerologyByElement('éter')).toEqual([11]);
    });

    it('should return null for invalid element', () => {
      expect(getNumerologyByElement('invalid')).toBeNull();
    });
  });

  describe('getNumerologyElement', () => {
    it('should return correct element for fogo numbers', () => {
      expect(getNumerologyElement(1)).toBe('Fogo');
      expect(getNumerologyElement(3)).toBe('Fogo');
      expect(getNumerologyElement(6)).toBe('Fogo');
      expect(getNumerologyElement(12)).toBe('Fogo');
    });

    it('should return correct element for água numbers', () => {
      expect(getNumerologyElement(2)).toBe('Água');
      expect(getNumerologyElement(5)).toBe('Água');
      expect(getNumerologyElement(9)).toBe('Água');
    });

    it('should return correct element for terra numbers', () => {
      expect(getNumerologyElement(4)).toBe('Terra');
      expect(getNumerologyElement(10)).toBe('Terra');
      expect(getNumerologyElement(13)).toBe('Terra');
    });

    it('should return correct element for ar numbers', () => {
      expect(getNumerologyElement(7)).toBe('Ar');
      expect(getNumerologyElement(8)).toBe('Ar');
    });

    it('should return correct element for éter numbers', () => {
      expect(getNumerologyElement(11)).toBe('Éter');
    });

    it('should return null for unmapped number', () => {
      expect(getNumerologyElement(14)).toBeNull();
      expect(getNumerologyElement(0)).toBeNull();
    });
  });

  describe('getArquetipoByElement', () => {
    it('should return correct archetype for each element', () => {
      expect(getArquetipoByElement('fogo')).toBe('O Guerreiro da Luz / O Purificador');
      expect(getArquetipoByElement('água')).toBe('O Guardião das Emoções / O Sábio Compassivo');
      expect(getArquetipoByElement('terra')).toBe('O Fundador / O Ancestral');
      expect(getArquetipoByElement('ar')).toBe('O Mensageiro / O Filósofo');
      expect(getArquetipoByElement('éter')).toBe('O Canalizador / O Desperto');
    });

    it('should return null for invalid element', () => {
      expect(getArquetipoByElement('invalid')).toBeNull();
    });
  });

  describe('getQualidadesByElement', () => {
    it('should return qualities for fogo', () => {
      const qualities = getQualidadesByElement('fogo');
      expect(qualities).toBeDefined();
      expect(qualities?.forca).toContain('Determinação');
      expect(qualities?.desafio).toContain('Impaciência');
      expect(qualities?.licao).toContain('Canalizar');
      expect(qualities?.afirmacao).toContain('transformo');
    });

    it('should return qualities for água', () => {
      const qualities = getQualidadesByElement('água');
      expect(qualities).toBeDefined();
      expect(qualities?.forca).toContain('Intuição');
      expect(qualities?.desafio).toContain('limites');
    });

    it('should return null for invalid element', () => {
      expect(getQualidadesByElement('invalid')).toBeNull();
    });
  });

  describe('getSignificadoByElement', () => {
    it('should return spiritual meaning for fogo', () => {
      const significado = getSignificadoByElement('fogo');
      expect(significado).toBeDefined();
      expect(significado).toContain('Fogo');
      expect(significado).toContain('chama');
    });

    it('should return null for invalid element', () => {
      expect(getSignificadoByElement('invalid')).toBeNull();
    });
  });

  describe('getEnergiaByElement', () => {
    it('should return correct energy type for each element', () => {
      expect(getEnergiaByElement('fogo')).toBe('Quente');
      expect(getEnergiaByElement('água')).toBe('Frio');
      expect(getEnergiaByElement('terra')).toBe('Quente');
      expect(getEnergiaByElement('ar')).toBe('Neutro');
      expect(getEnergiaByElement('éter')).toBe('Neutro');
    });

    it('should return null for invalid element', () => {
      expect(getEnergiaByElement('invalid')).toBeNull();
    });
  });

  describe('getPolaridadeByElement', () => {
    it('should return correct polarity for each element', () => {
      expect(getPolaridadeByElement('fogo')).toBe('Yang');
      expect(getPolaridadeByElement('água')).toBe('Yin');
      expect(getPolaridadeByElement('terra')).toBe('Yang');
      expect(getPolaridadeByElement('ar')).toBe('Equilibrado');
      expect(getPolaridadeByElement('éter')).toBe('Equilibrado');
    });

    it('should return null for invalid element', () => {
      expect(getPolaridadeByElement('invalid')).toBeNull();
    });
  });

  describe('getAllElementTypes', () => {
    it('should return all 5 element types', () => {
      const result = getAllElementTypes();
      expect(result).toHaveLength(5);
      expect(result).toContain('fogo');
      expect(result).toContain('água');
      expect(result).toContain('terra');
      expect(result).toContain('ar');
      expect(result).toContain('éter');
    });
  });

  describe('getAllNumerologyNumbers', () => {
    it('should return all 13 unique numbers', () => {
      const result = getAllNumerologyNumbers();
      expect(result).toHaveLength(13);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result).toContain(4);
      expect(result).toContain(5);
      expect(result).toContain(6);
      expect(result).toContain(7);
      expect(result).toContain(8);
      expect(result).toContain(9);
      expect(result).toContain(10);
      expect(result).toContain(11);
      expect(result).toContain(12);
      expect(result).toContain(13);
    });

    it('should return sorted numbers', () => {
      const result = getAllNumerologyNumbers();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      }
    });
  });

  describe('spiritual consistency', () => {
    it('should align element-numerology with element-orixa correlations', () => {
      const fogo = getElementNumerology('fogo');
      expect(fogo?.orixa).toBe('Xangô');
      expect(fogo?.planeta).toBe('Marte');

      const agua = getElementNumerology('água');
      expect(agua?.orixa).toBe('Iemanjá');
      expect(agua?.planeta).toBe('Lua');

      const terra = getElementNumerology('terra');
      expect(terra?.orixa).toBe('Oxóssi');
      expect(terra?.planeta).toBe('Saturno');
    });

    it('should align energy types with numerology-element patterns', () => {
      // Fogo numbers (1,3,6,12) should have Quente energy
      const fogo = getElementNumerology('fogo');
      expect(fogo?.energia.tipo).toBe('Quente');
      expect(fogo?.energia.polaridade).toBe('Yang');

      // Água numbers (2,5,9) should have Frio energy
      const agua = getElementNumerology('água');
      expect(agua?.energia.tipo).toBe('Frio');
      expect(agua?.energia.polaridade).toBe('Yin');

      // Éter number (11) should have Neutro/Equilibrado energy
      const eter = getElementNumerology('éter');
      expect(eter?.energia.tipo).toBe('Neutro');
      expect(eter?.energia.polaridade).toBe('Equilibrado');
    });

    it('should have correct number distribution', () => {
      const fogo = getElementNumerology('fogo');
      const agua = getElementNumerology('água');
      const terra = getElementNumerology('terra');
      const ar = getElementNumerology('ar');
      const eter = getElementNumerology('éter');

      // Total numbers should be 13 (1-13)
      const allNumbers = [
        ...(fogo?.numeros || []),
        ...(agua?.numeros || []),
        ...(terra?.numeros || []),
        ...(ar?.numeros || []),
        ...(eter?.numeros || []),
      ];

      expect(allNumbers).toHaveLength(13);
      expect(allNumbers.sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    });
  });
});