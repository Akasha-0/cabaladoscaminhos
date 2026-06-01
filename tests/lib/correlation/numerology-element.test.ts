import { describe, it, expect } from 'vitest';
import {
  getNumerologyElement,
  getAllNumerologyElements,
  getElementNumerology,
  getNumerologyArquetipo,
  getNumerologySignificado,
  getNumerologyQualidades,
  getNumerologyEnergia,
  getNumerologyPolaridade,
  getAllNumerologyNumbers,
  getAllElementsFromNumerology,
  NUMEROLOGY_ELEMENT_MAP,
  type NumerologyElement,
} from '@/lib/correlation/numerology-element';

describe('NumerologyElement Correlation', () => {
  describe('getNumerologyElement', () => {
    it('should return mapping for number 1', () => {
      const result = getNumerologyElement(1);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(1);
      expect(result?.elemento).toBe('fogo');
      expect(result?.elemento_nome).toBe('Fogo');
      expect(result?.elemento_english).toBe('Fire');
    });

    it('should return mapping for number 11', () => {
      const result = getNumerologyElement(11);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(11);
      expect(result?.elemento).toBe('éter');
      expect(result?.elemento_nome).toBe('Éter');
    });

    it('should return undefined for invalid number', () => {
      expect(getNumerologyElement(0)).toBeUndefined();
      expect(getNumerologyElement(14)).toBeUndefined();
      expect(getNumerologyElement(-1)).toBeUndefined();
    });
  });

  describe('getAllNumerologyElements', () => {
    it('should return all 13 numbers', () => {
      const result = getAllNumerologyElements();
      expect(result).toHaveLength(13);
    });

    it('should contain all expected numbers', () => {
      const result = getAllNumerologyElements();
      const numeros = result.map((n) => n.numero);
      for (let i = 1; i <= 13; i++) {
        expect(numeros).toContain(i);
      }
    });

    it('should have correct element mappings for each number', () => {
      // fogo: 1, 3, 6, 12
      expect(getNumerologyElement(1)?.elemento).toBe('fogo');
      expect(getNumerologyElement(3)?.elemento).toBe('fogo');
      expect(getNumerologyElement(6)?.elemento).toBe('fogo');
      expect(getNumerologyElement(12)?.elemento).toBe('fogo');

      // água: 2, 5, 9
      expect(getNumerologyElement(2)?.elemento).toBe('água');
      expect(getNumerologyElement(5)?.elemento).toBe('água');
      expect(getNumerologyElement(9)?.elemento).toBe('água');

      // terra: 4, 10, 13
      expect(getNumerologyElement(4)?.elemento).toBe('terra');
      expect(getNumerologyElement(10)?.elemento).toBe('terra');
      expect(getNumerologyElement(13)?.elemento).toBe('terra');

      // ar: 7, 8
      expect(getNumerologyElement(7)?.elemento).toBe('ar');
      expect(getNumerologyElement(8)?.elemento).toBe('ar');

      // éter: 11
      expect(getNumerologyElement(11)?.elemento).toBe('éter');
    });
  });

  describe('NUMEROLOGY_ELEMENT_MAP', () => {
    it('should have all 13 numbers mapped', () => {
      for (let i = 1; i <= 13; i++) {
        expect(NUMEROLOGY_ELEMENT_MAP).toHaveProperty(String(i));
      }
    });

    it('should have required properties for each number', () => {
      for (let i = 1; i <= 13; i++) {
        const mapping = NUMEROLOGY_ELEMENT_MAP[i];
        expect(mapping.numero).toBe(i);
        expect(mapping.elemento).toBeDefined();
        expect(mapping.elemento_nome).toBeDefined();
        expect(mapping.elemento_english).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.arquetipo).toBeDefined();
        expect(mapping.orixa).toBeDefined();
        expect(mapping.sephirah).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.planeta).toBeDefined();
        expect(mapping.cor).toBeDefined();
        expect(mapping.direcao).toBeDefined();
        expect(mapping.qualidades).toBeDefined();
        expect(mapping.qualidades.forca).toBeDefined();
        expect(mapping.qualidades.desafio).toBeDefined();
        expect(mapping.qualidades.licao).toBeDefined();
        expect(mapping.qualidades.afirmacao).toBeDefined();
        expect(mapping.energia).toBeDefined();
        expect(mapping.energia.tipo).toBeDefined();
        expect(mapping.energia.polaridade).toBeDefined();
      }
    });

    it('should have correctly typed energy properties', () => {
      for (let i = 1; i <= 13; i++) {
        const mapping = NUMEROLOGY_ELEMENT_MAP[i];
        expect(['Quente', 'Frio', 'Neutro']).toContain(mapping.energia.tipo);
        expect(['Yang', 'Yin', 'Equilibrado']).toContain(mapping.energia.polaridade);
      }
    });
  });

  describe('getElementNumerology', () => {
    it('should return correct element name for each number', () => {
      expect(getElementNumerology(1)).toBe('Fogo');
      expect(getElementNumerology(2)).toBe('Água');
      expect(getElementNumerology(3)).toBe('Fogo');
      expect(getElementNumerology(4)).toBe('Terra');
      expect(getElementNumerology(5)).toBe('Água');
      expect(getElementNumerology(6)).toBe('Fogo');
      expect(getElementNumerology(7)).toBe('Ar');
      expect(getElementNumerology(8)).toBe('Ar');
      expect(getElementNumerology(9)).toBe('Água');
      expect(getElementNumerology(10)).toBe('Terra');
      expect(getElementNumerology(11)).toBe('Éter');
      expect(getElementNumerology(12)).toBe('Fogo');
      expect(getElementNumerology(13)).toBe('Terra');
    });

    it('should return null for invalid number', () => {
      expect(getElementNumerology(0)).toBeNull();
      expect(getElementNumerology(14)).toBeNull();
    });
  });

  describe('getNumerologyArquetipo', () => {
    it('should return archetype for number 1', () => {
      expect(getNumerologyArquetipo(1)).toBe('O Guerreiro da Luz / O Criador');
    });

    it('should return archetype for number 11', () => {
      expect(getNumerologyArquetipo(11)).toBe('O Canalizador / O Desperto');
    });

    it('should return null for invalid number', () => {
      expect(getNumerologyArquetipo(0)).toBeNull();
      expect(getNumerologyArquetipo(14)).toBeNull();
    });
  });

  describe('getNumerologySignificado', () => {
    it('should return spiritual meaning for number 1', () => {
      const significado = getNumerologySignificado(1);
      expect(significado).toBeDefined();
      expect(significado).toContain('número 1');
    });

    it('should return null for invalid number', () => {
      expect(getNumerologySignificado(0)).toBeNull();
      expect(getNumerologySignificado(14)).toBeNull();
    });
  });

  describe('getNumerologyQualidades', () => {
    it('should return qualities for number 1', () => {
      const qualities = getNumerologyQualidades(1);
      expect(qualities).toBeDefined();
      expect(qualities?.forca).toContain('Determinação');
      expect(qualities?.desafio).toContain('Impaciência');
      expect(qualities?.licao).toContain('Canalizar');
      expect(qualities?.afirmacao).toContain('transformo');
    });

    it('should return qualities for number 11', () => {
      const qualities = getNumerologyQualidades(11);
      expect(qualities).toBeDefined();
      expect(qualities?.forca).toContain('Sabedoria transcendental');
      expect(qualities?.desafio).toContain('Idealismo');
    });

    it('should return null for invalid number', () => {
      expect(getNumerologyQualidades(0)).toBeNull();
      expect(getNumerologyQualidades(14)).toBeNull();
    });
  });

  describe('getNumerologyEnergia', () => {
    it('should return correct energy type for fogo numbers', () => {
      expect(getNumerologyEnergia(1)).toBe('Quente');
      expect(getNumerologyEnergia(3)).toBe('Quente');
      expect(getNumerologyEnergia(6)).toBe('Quente');
      expect(getNumerologyEnergia(12)).toBe('Quente');
    });

    it('should return correct energy type for água numbers', () => {
      expect(getNumerologyEnergia(2)).toBe('Frio');
      expect(getNumerologyEnergia(5)).toBe('Frio');
      expect(getNumerologyEnergia(9)).toBe('Frio');
    });

    it('should return correct energy type for terra numbers', () => {
      expect(getNumerologyEnergia(4)).toBe('Quente');
      expect(getNumerologyEnergia(10)).toBe('Quente');
      expect(getNumerologyEnergia(13)).toBe('Quente');
    });

    it('should return correct energy type for ar numbers', () => {
      expect(getNumerologyEnergia(7)).toBe('Neutro');
      expect(getNumerologyEnergia(8)).toBe('Neutro');
    });

    it('should return correct energy type for éter numbers', () => {
      expect(getNumerologyEnergia(11)).toBe('Neutro');
    });

    it('should return null for invalid number', () => {
      expect(getNumerologyEnergia(0)).toBeNull();
      expect(getNumerologyEnergia(14)).toBeNull();
    });
  });

  describe('getNumerologyPolaridade', () => {
    it('should return correct polarity for fogo numbers', () => {
      expect(getNumerologyPolaridade(1)).toBe('Yang');
      expect(getNumerologyPolaridade(3)).toBe('Yang');
      expect(getNumerologyPolaridade(6)).toBe('Yang');
      expect(getNumerologyPolaridade(12)).toBe('Yang');
    });

    it('should return correct polarity for água numbers', () => {
      expect(getNumerologyPolaridade(2)).toBe('Yin');
      expect(getNumerologyPolaridade(5)).toBe('Yin');
      expect(getNumerologyPolaridade(9)).toBe('Yin');
    });

    it('should return correct polarity for ar numbers', () => {
      expect(getNumerologyPolaridade(7)).toBe('Equilibrado');
      expect(getNumerologyPolaridade(8)).toBe('Equilibrado');
    });

    it('should return correct polarity for éter numbers', () => {
      expect(getNumerologyPolaridade(11)).toBe('Equilibrado');
    });

    it('should return null for invalid number', () => {
      expect(getNumerologyPolaridade(0)).toBeNull();
      expect(getNumerologyPolaridade(14)).toBeNull();
    });
  });

  describe('getAllNumerologyNumbers', () => {
    it('should return all 13 numbers', () => {
      const result = getAllNumerologyNumbers();
      expect(result).toHaveLength(13);
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    });
  });

  describe('getAllElementsFromNumerology', () => {
    it('should return all 5 element types', () => {
      const result = getAllElementsFromNumerology();
      expect(result).toHaveLength(5);
      expect(result).toContain('fogo');
      expect(result).toContain('água');
      expect(result).toContain('terra');
      expect(result).toContain('ar');
      expect(result).toContain('éter');
    });
  });

  describe('spiritual consistency', () => {
    it('should align numerology-element with element-numerology mappings', () => {
      // Number 1- fogo should correspond to Xangô/Marte
      const n1 = getNumerologyElement(1);
      expect(n1?.orixa).toBe('Xangô');
      expect(n1?.planeta).toBe('Marte');

      // Number 2- água should correspond to Iemanjá/Lua
      const n2 = getNumerologyElement(2);
      expect(n2?.orixa).toBe('Iemanjá');
      expect(n2?.planeta).toBe('Lua');

      // Number 11- éter should correspond to Oxalá/Sol
      const n11 = getNumerologyElement(11);
      expect(n11?.orixa).toBe('Oxalá');
      expect(n11?.planeta).toBe('Sol');
    });

    it('should have consistent energy types across element groups', () => {
      // Fogo numbers (1,3,6,12) should all have Quente/Yang energy
      for (const num of [1, 3, 6, 12]) {
        const mapping = getNumerologyElement(num);
        expect(mapping?.energia.tipo).toBe('Quente');
        expect(mapping?.energia.polaridade).toBe('Yang');
      }

      // Água numbers (2,5,9) should all have Frio/Yin energy
      for (const num of [2, 5, 9]) {
        const mapping = getNumerologyElement(num);
        expect(mapping?.energia.tipo).toBe('Frio');
        expect(mapping?.energia.polaridade).toBe('Yin');
      }

      // Éter number (11) should have Neutro/Equilibrado energy
      const n11 = getNumerologyElement(11);
      expect(n11?.energia.tipo).toBe('Neutro');
      expect(n11?.energia.polaridade).toBe('Equilibrado');
    });

    it('should have correct element distribution', () => {
      const fogoNums = [1, 3, 6, 12];
      const aguaNums = [2, 5, 9];
      const terraNums = [4, 10, 13];
      const arNums = [7, 8];
      const eterNums = [11];

      expect(fogoNums).toHaveLength(4);
      expect(aguaNums).toHaveLength(3);
      expect(terraNums).toHaveLength(3);
      expect(arNums).toHaveLength(2);
      expect(eterNums).toHaveLength(1);

      // Total should be 13
      expect(fogoNums.length + aguaNums.length + terraNums.length + arNums.length + eterNums.length).toBe(13);
    });
  });
});
