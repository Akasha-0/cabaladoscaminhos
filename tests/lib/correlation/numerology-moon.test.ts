import { describe, it, expect } from 'vitest';
import {
  getNumerologyMoon,
  getMoonNumerology,
  getAllNumerologyMoons,
  getMoonByNumero,
  getElementByNumero,
  getSecondaryElementByNumero,
  getChakraByNumero,
  getSpiritualMeaningByNumero,
  getAvailableMoonPhases,
  getNumerologyByElement,
  getNumerologyByChakra,
  NUMERO_LUA_MAP,
  type NumerologyMoonMapping,
  type FaseLua,
} from '@/lib/correlation/numerology-moon';

describe('Numerology-Moon Correlation', () => {
  describe('getNumerologyMoon', () => {
    it('should return mapping for number 1', () => {
      const result = getNumerologyMoon(1);
      expect(result).toBeDefined();
      expect(result.numero).toBe(1);
      expect(result.fase).toBe('lua-nova');
      expect(result.nome_fase).toBe('Lua Nova');
    });

    it('should return mapping for number 4', () => {
      const result = getNumerologyMoon(4);
      expect(result).toBeDefined();
      expect(result.numero).toBe(4);
      expect(result.fase).toBe('lua-cheia');
      expect(result.nome_fase).toBe('Lua Cheia');
    });

    it('should return mapping for number 8', () => {
      const result = getNumerologyMoon(8);
      expect(result).toBeDefined();
      expect(result.numero).toBe(8);
      expect(result.fase).toBe('lua-velha');
      expect(result.nome_fase).toBe('Lua Velha');
    });

    it('should return mapping for number 13', () => {
      const result = getNumerologyMoon(13);
      expect(result).toBeDefined();
      expect(result.numero).toBe(13);
      expect(result.fase).toBe('lua-minguante');
      expect(result.nome_fase).toBe('Lua Minguante');
    });

    it('should throw error for number less than 1', () => {
      expect(() => getNumerologyMoon(0)).toThrow('Número fora do intervalo válido (1-13)');
    });

    it('should throw error for number greater than 13', () => {
      expect(() => getNumerologyMoon(14)).toThrow('Número fora do intervalo válido (1-13)');
    });

    it('should throw error for non-integer numbers', () => {
      expect(() => getNumerologyMoon(3.5)).toThrow('Número fora do intervalo válido (1-13)');
    });

    it('should throw error for negative numbers', () => {
      expect(() => getNumerologyMoon(-1)).toThrow('Número fora do intervalo válido (1-13)');
    });

    it('should include element connection', () => {
      const result = getNumerologyMoon(1);
      expect(result.elemento).toBe('Terra');
      expect(result.elemento_secundario).toBe('Éter');
    });

    it('should include spiritual meaning', () => {
      const result = getNumerologyMoon(1);
      expect(result.significado_espiritual).toBeDefined();
      expect(result.significado_espiritual.palavra_chave).toBe('Iniciação');
    });

    it('should include correlations', () => {
      const result = getNumerologyMoon(1);
      expect(result.correlacoes).toBeDefined();
      expect(result.correlacoes.orixa).toBe('Oxalá');
      expect(result.correlacoes.chakra).toBe(1);
      expect(result.correlacoes.arcanjo).toBe('Metatron');
      expect(result.correlacoes.sephirah).toBe('Kether');
    });
  });

  describe('getAllNumerologyMoons', () => {
    it('should return all 13 numbers', () => {
      const result = getAllNumerologyMoons();
      expect(result).toHaveLength(13);
    });

    it('should return sorted by numero', () => {
      const result = getAllNumerologyMoons();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero).toBeLessThan(result[i + 1].numero);
      }
    });

    it('should include all required fields for each mapping', () => {
      const result = getAllNumerologyMoons();
      result.forEach(mapping => {
        expect(mapping.numero).toBeDefined();
        expect(mapping.fase).toBeDefined();
        expect(mapping.nome_fase).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.elemento_secundario).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.correlacoes).toBeDefined();
      });
    });
  });

  describe('getMoonNumerology', () => {
    it('should return numbers associated with lua-nova', () => {
      const result = getMoonNumerology('lua-nova');
      expect(result).toBeDefined();
      const numbers = result.map(m => m.numero);
      expect(numbers).toContain(1);
      expect(numbers).toContain(10);
    });

    it('should return numbers associated with lua-cheia', () => {
      const result = getMoonNumerology('lua-cheia');
      expect(result).toBeDefined();
      const numbers = result.map(m => m.numero);
      expect(numbers).toContain(4);
      expect(numbers).toContain(9);
    });

    it('should return numbers associated with lua-minguante', () => {
      const result = getMoonNumerology('lua-minguante');
      expect(result).toBeDefined();
      const numbers = result.map(m => m.numero);
      expect(numbers).toContain(6);
      expect(numbers).toContain(13);
    });

    it('should handle case-insensitive input', () => {
      const result = getMoonNumerology('LUA-NOVA');
      expect(result).toBeDefined();
      expect(result[0].fase).toBe('lua-nova');
    });

    it('should handle input with whitespace', () => {
      const result = getMoonNumerology('  lua-cheia  ');
      expect(result).toBeDefined();
      expect(result[0].fase).toBe('lua-cheia');
    });

    it('should return empty array for unknown phase', () => {
      const result = getMoonNumerology('unknown-phase');
      expect(result).toEqual([]);
    });
  });

  describe('getMoonByNumero', () => {
    it('should return lua-nova for number 1', () => {
      const result = getMoonByNumero(1);
      expect(result).toBe('lua-nova');
    });

    it('should return lua-cheia for number 4', () => {
      const result = getMoonByNumero(4);
      expect(result).toBe('lua-cheia');
    });

    it('should return lua-velha for number 8', () => {
      const result = getMoonByNumero(8);
      expect(result).toBe('lua-velha');
    });

    it('should return null for number outside range', () => {
      expect(getMoonByNumero(0)).toBeNull();
      expect(getMoonByNumero(14)).toBeNull();
    });
  });

  describe('getElementByNumero', () => {
    it('should return Terra for number 1', () => {
      const result = getElementByNumero(1);
      expect(result).toBe('Terra');
    });

    it('should return Água for number 2', () => {
      const result = getElementByNumero(2);
      expect(result).toBe('Água');
    });

    it('should return Fogo for number 3', () => {
      const result = getElementByNumero(3);
      expect(result).toBe('Fogo');
    });

    it('should return null for number outside range', () => {
      expect(getElementByNumero(0)).toBeNull();
      expect(getElementByNumero(14)).toBeNull();
    });
  });

  describe('getSecondaryElementByNumero', () => {
    it('should return Éter for number 1', () => {
      const result = getSecondaryElementByNumero(1);
      expect(result).toBe('Éter');
    });

    it('should return Terra for number 2', () => {
      const result = getSecondaryElementByNumero(2);
      expect(result).toBe('Terra');
    });

    it('should return null for number outside range', () => {
      expect(getSecondaryElementByNumero(0)).toBeNull();
      expect(getSecondaryElementByNumero(14)).toBeNull();
    });
  });

  describe('getChakraByNumero', () => {
    it('should return chakra 1 for number 1', () => {
      const result = getChakraByNumero(1);
      expect(result).toBe(1);
    });

    it('should return chakra 2 for number 2', () => {
      const result = getChakraByNumero(2);
      expect(result).toBe(2);
    });

    it('should return chakra 4 for number 4', () => {
      const result = getChakraByNumero(4);
      expect(result).toBe(4);
    });

    it('should return null for number outside range', () => {
      expect(getChakraByNumero(0)).toBeNull();
      expect(getChakraByNumero(14)).toBeNull();
    });
  });

  describe('getSpiritualMeaningByNumero', () => {
    it('should return spiritual meaning for number 1', () => {
      const result = getSpiritualMeaningByNumero(1);
      expect(result).toBeDefined();
      expect(result?.palavra_chave).toBe('Iniciação');
      expect(result?.energia).toBeDefined();
      expect(result?.conexao_lunar).toBeDefined();
      expect(result?.lição_ciclica).toBeDefined();
    });

    it('should return spiritual meaning for number 4', () => {
      const result = getSpiritualMeaningByNumero(4);
      expect(result).toBeDefined();
      expect(result?.palavra_chave).toBe('Culminação');
    });

    it('should return null for number outside range', () => {
      expect(getSpiritualMeaningByNumero(0)).toBeNull();
      expect(getSpiritualMeaningByNumero(14)).toBeNull();
    });
  });

  describe('getAvailableMoonPhases', () => {
    it('should return all 8 moon phases', () => {
      const result = getAvailableMoonPhases();
      expect(result).toHaveLength(8);
    });

    it('should include all expected phases', () => {
      const result = getAvailableMoonPhases();
      expect(result).toContain('lua-nova');
      expect(result).toContain('lua-crescente');
      expect(result).toContain('quarto-crescente');
      expect(result).toContain('lua-cheia');
      expect(result).toContain('quarto-minguante');
      expect(result).toContain('lua-minguante');
      expect(result).toContain('quarto-descrescente');
      expect(result).toContain('lua-velha');
    });
  });

  describe('getNumerologyByElement', () => {
    it('should return numbers with Terra element', () => {
      const result = getNumerologyByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.elemento).toBe('Terra');
      });
    });

    it('should return numbers with Água element', () => {
      const result = getNumerologyByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.elemento).toBe('Água');
      });
    });

    it('should return numbers with Fogo element', () => {
      const result = getNumerologyByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.elemento).toBe('Fogo');
      });
    });

    it('should handle case-insensitive input', () => {
      const result = getNumerologyByElement('TERRA');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle input with accents normalized', () => {
      const result = getNumerologyByElement('agua');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown element', () => {
      const result = getNumerologyByElement('unknown');
      expect(result).toEqual([]);
    });
  });

  describe('getNumerologyByChakra', () => {
    it('should return numbers with chakra 1', () => {
      const result = getNumerologyByChakra(1);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.correlacoes.chakra).toBe(1);
      });
    });

    it('should return numbers with chakra 4', () => {
      const result = getNumerologyByChakra(4);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.correlacoes.chakra).toBe(4);
      });
    });

    it('should return empty array for chakra without mappings', () => {
      const result = getNumerologyByChakra(10);
      expect(result).toEqual([]);
    });
  });

  describe('NUMERO_LUA_MAP structure', () => {
    it('should have all 13 numbers', () => {
      const keys = Object.keys(NUMERO_LUA_MAP).map(Number);
      expect(keys).toHaveLength(13);
      for (let i = 1; i <= 13; i++) {
        expect(keys).toContain(i);
      }
    });

    it('should have valid fase values', () => {
      const validFases: FaseLua[] = [
        'lua-nova', 'lua-crescente', 'quarto-crescente', 'lua-cheia',
        'quarto-minguante', 'lua-minguante', 'quarto-descrescente', 'lua-velha'
      ];
      Object.values(NUMERO_LUA_MAP).forEach(mapping => {
        expect(validFases).toContain(mapping.fase);
      });
    });

    it('should have valid element values', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      Object.values(NUMERO_LUA_MAP).forEach(mapping => {
        expect(validElements).toContain(mapping.elemento);
        expect(validElements).toContain(mapping.elemento_secundario);
      });
    });

    it('should have chakra values in range 1-8', () => {
      Object.values(NUMERO_LUA_MAP).forEach(mapping => {
        expect(mapping.correlacoes.chakra).toBeGreaterThanOrEqual(1);
        expect(mapping.correlacoes.chakra).toBeLessThanOrEqual(8);
      });
    });
  });
});