/**
 * Numerology-Day Spiritual Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getNumerologyDay,
  getDayNumerology,
  getAllNumerologyDays,
  getDayByNumero,
  getElementByNumero,
  getPlanetByNumero,
  getSpiritualMeaningByNumero,
} from '@/lib/correlation/numerology-day';

describe('Numerology-Day Correlation', () => {
  describe('getNumerologyDay', () => {
    it('should return number 1 mapping with Sunday (Domingo)', () => {
      const result = getNumerologyDay(1);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(1);
      expect(result?.dia).toBe('Sunday');
      expect(result?.dia_portugues).toBe('Domingo');
      expect(result?.indice).toBe(0);
    });

    it('should return number 2 mapping with Monday (Segunda-feira)', () => {
      const result = getNumerologyDay(2);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(2);
      expect(result?.dia).toBe('Monday');
      expect(result?.dia_portugues).toBe('Segunda-feira');
      expect(result?.indice).toBe(1);
    });

    it('should return number 3 mapping with Thursday (Quinta-feira)', () => {
      const result = getNumerologyDay(3);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(3);
      expect(result?.dia).toBe('Thursday');
      expect(result?.dia_portugues).toBe('Quinta-feira');
      expect(result?.indice).toBe(4);
    });

    it('should return number 4 mapping with Saturday (Sábado)', () => {
      const result = getNumerologyDay(4);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(4);
      expect(result?.dia).toBe('Saturday');
      expect(result?.dia_portugues).toBe('Sábado');
      expect(result?.indice).toBe(6);
    });

    it('should return number 5 mapping with Wednesday (Quarta-feira)', () => {
      const result = getNumerologyDay(5);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(5);
      expect(result?.dia).toBe('Wednesday');
      expect(result?.dia_portugues).toBe('Quarta-feira');
      expect(result?.indice).toBe(3);
    });

    it('should return number 6 mapping with Friday (Sexta-feira)', () => {
      const result = getNumerologyDay(6);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(6);
      expect(result?.dia).toBe('Friday');
      expect(result?.dia_portugues).toBe('Sexta-feira');
      expect(result?.indice).toBe(5);
    });

    it('should return number 7 mapping with Sunday (Domingo)', () => {
      const result = getNumerologyDay(7);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(7);
      expect(result?.dia).toBe('Sunday');
      expect(result?.dia_portugues).toBe('Domingo');
      expect(result?.indice).toBe(0);
    });

    it('should return number 8 mapping with Saturday (Sábado)', () => {
      const result = getNumerologyDay(8);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(8);
      expect(result?.dia).toBe('Saturday');
      expect(result?.dia_portugues).toBe('Sábado');
      expect(result?.indice).toBe(6);
    });

    it('should return number 9 mapping with Tuesday (Terça-feira)', () => {
      const result = getNumerologyDay(9);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(9);
      expect(result?.dia).toBe('Tuesday');
      expect(result?.dia_portugues).toBe('Terça-feira');
      expect(result?.indice).toBe(2);
    });

    it('should return null for invalid numbers (0)', () => {
      const result = getNumerologyDay(0);
      expect(result).toBeNull();
    });

    it('should return null for numbers greater than 9', () => {
      const result = getNumerologyDay(10);
      expect(result).toBeNull();
    });

    it('should return null for negative numbers', () => {
      const result = getNumerologyDay(-1);
      expect(result).toBeNull();
    });

    it('should include all required interface properties', () => {
      const result = getNumerologyDay(1);
      expect(result).toHaveProperty('numero');
      expect(result).toHaveProperty('dia');
      expect(result).toHaveProperty('dia_portugues');
      expect(result).toHaveProperty('indice');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('qualidade_energetica');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('significado_numerologico');
      expect(result).toHaveProperty('arquétipo');
      expect(result).toHaveProperty('palavras_chave');
      expect(result).toHaveProperty('qualidade');
      expect(result).toHaveProperty('praticas_espirituais');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('cor');
    });
  });

  describe('getAllNumerologyDays', () => {
    it('should return all 9 numerology-day mappings', () => {
      const result = getAllNumerologyDays();
      expect(result).toHaveLength(9);
    });

    it('should return sorted by numero in ascending order', () => {
      const result = getAllNumerologyDays();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero).toBeLessThan(result[i + 1].numero);
      }
    });

    it('should include valid elements for all entries', () => {
      const result = getAllNumerologyDays();
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      result.forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });

    it('should have valid numerology numbers (1-9)', () => {
      const result = getAllNumerologyDays();
      result.forEach((mapping) => {
        expect(mapping.numero).toBeGreaterThanOrEqual(1);
        expect(mapping.numero).toBeLessThanOrEqual(9);
      });
    });

    it('should have valid day indices (0-6)', () => {
      const result = getAllNumerologyDays();
      result.forEach((mapping) => {
        expect(mapping.indice).toBeGreaterThanOrEqual(0);
        expect(mapping.indice).toBeLessThanOrEqual(6);
      });
    });

    it('should have palavras_chave as non-empty arrays', () => {
      const result = getAllNumerologyDays();
      result.forEach((mapping) => {
        expect(Array.isArray(mapping.palavras_chave)).toBe(true);
        expect(mapping.palavras_chave.length).toBeGreaterThan(0);
      });
    });

    it('should have praticas_espirituais as non-empty arrays', () => {
      const result = getAllNumerologyDays();
      result.forEach((mapping) => {
        expect(Array.isArray(mapping.praticas_espirituais)).toBe(true);
        expect(mapping.praticas_espirituais.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getDayNumerology', () => {
    it('should return same result as getAllNumerologyDays', () => {
      const result = getDayNumerology();
      const allResult = getAllNumerologyDays();
      expect(result).toEqual(allResult);
    });

    it('should return array with 9 entries', () => {
      const result = getDayNumerology();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(9);
    });
  });

  describe('getDayByNumero', () => {
    it('should return Domingo for numero 1', () => {
      expect(getDayByNumero(1)).toBe('Domingo');
    });

    it('should return Segunda-feira for numero 2', () => {
      expect(getDayByNumero(2)).toBe('Segunda-feira');
    });

    it('should return Terça-feira for numero 9', () => {
      expect(getDayByNumero(9)).toBe('Terça-feira');
    });

    it('should return null for invalid numero', () => {
      expect(getDayByNumero(0)).toBeNull();
      expect(getDayByNumero(10)).toBeNull();
    });
  });

  describe('getElementByNumero', () => {
    it('should return Fogo for numero 1', () => {
      expect(getElementByNumero(1)).toBe('Fogo');
    });

    it('should return Água for numero 2', () => {
      expect(getElementByNumero(2)).toBe('Água');
    });

    it('should return Ar for numero 5', () => {
      expect(getElementByNumero(5)).toBe('Ar');
    });

    it('should return Terra for numero 4', () => {
      expect(getElementByNumero(4)).toBe('Terra');
    });

    it('should return null for invalid numero', () => {
      expect(getElementByNumero(0)).toBeNull();
      expect(getElementByNumero(10)).toBeNull();
    });
  });

  describe('getPlanetByNumero', () => {
    it('should return Sol for numero 1', () => {
      expect(getPlanetByNumero(1)).toBe('Sol');
    });

    it('should return Lua for numero 2', () => {
      expect(getPlanetByNumero(2)).toBe('Lua');
    });

    it('should return Júpiter for numero 3', () => {
      expect(getPlanetByNumero(3)).toBe('Júpiter');
    });

    it('should return Saturno for numero 4', () => {
      expect(getPlanetByNumero(4)).toBe('Saturno');
    });

    it('should return null for invalid numero', () => {
      expect(getPlanetByNumero(0)).toBeNull();
      expect(getPlanetByNumero(10)).toBeNull();
    });
  });

  describe('getSpiritualMeaningByNumero', () => {
    it('should return a string for valid numbers', () => {
      const result = getSpiritualMeaningByNumero(1);
      expect(typeof result).toBe('string');
      expect(result?.length).toBeGreaterThan(0);
    });

    it('should return null for invalid numbers', () => {
      expect(getSpiritualMeaningByNumero(0)).toBeNull();
      expect(getSpiritualMeaningByNumero(10)).toBeNull();
    });
  });

  describe('Element connections', () => {
    it('should map elements correctly to days', () => {
      expect(getElementByNumero(1)).toBe('Fogo'); // Domingo - Sol
      expect(getElementByNumero(2)).toBe('Água'); // Segunda-feira - Lua
      expect(getElementByNumero(3)).toBe('Água'); // Quinta-feira - Júpiter
      expect(getElementByNumero(4)).toBe('Terra'); // Sábado - Saturno
      expect(getElementByNumero(5)).toBe('Ar'); // Quarta-feira - Mercúrio
      expect(getElementByNumero(6)).toBe('Terra'); // Sexta-feira - Vênus
      expect(getElementByNumero(7)).toBe('Fogo'); // Domingo - Sol
      expect(getElementByNumero(8)).toBe('Éter'); // Sábado - Saturno
      expect(getElementByNumero(9)).toBe('Fogo'); // Terça-feira - Marte
    });
  });

  describe('Planet connections', () => {
    it('should map planets correctly to numerology numbers', () => {
      expect(getPlanetByNumero(1)).toBe('Sol');
      expect(getPlanetByNumero(2)).toBe('Lua');
      expect(getPlanetByNumero(3)).toBe('Júpiter');
      expect(getPlanetByNumero(4)).toBe('Saturno');
      expect(getPlanetByNumero(5)).toBe('Mercúrio');
      expect(getPlanetByNumero(6)).toBe('Vênus');
      expect(getPlanetByNumero(7)).toBe('Sol');
      expect(getPlanetByNumero(8)).toBe('Saturno');
      expect(getPlanetByNumero(9)).toBe('Marte');
    });
  });

  describe('Archetypes', () => {
    it('should include archetype information for each number', () => {
      const result = getAllNumerologyDays();
      result.forEach((mapping) => {
        expect(mapping.arquétipo).toBeDefined();
        expect(typeof mapping.arquétipo).toBe('string');
        expect(mapping.arquétipo.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Quality types', () => {
    it('should have valid quality values', () => {
      const validQualities = ['cardinal', 'fixed', 'mutable'];
      const result = getAllNumerologyDays();
      result.forEach((mapping) => {
        expect(validQualities).toContain(mapping.qualidade);
      });
    });

    it('should have valid energy quality types', () => {
      const validTypes = ['Quente', 'Frio', 'Neutro'];
      const validPolarities = ['Yang', 'Yin', 'Equilibrado'];
      const result = getAllNumerologyDays();
      result.forEach((mapping) => {
        expect(validTypes).toContain(mapping.qualidade_energetica.tipo);
        expect(validPolarities).toContain(mapping.qualidade_energetica.polaridade);
        expect(typeof mapping.qualidade_energetica.vibração).toBe('string');
      });
    });
  });
});