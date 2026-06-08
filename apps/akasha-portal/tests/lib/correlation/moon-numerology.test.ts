import { describe, it, expect } from 'vitest';
import {
  getMoonNumerology,
  getNumerologyMoon,
  getAllMoonNumerology,
  getMoonByNumerology,
  getElementFromMoonNumerology,
  getSecondaryElementFromMoonNumerology,
  getSpiritualMeaning,
  getNumerologicalCorrelations,
  getChakraFromMoon,
  getTarotFromMoon,
  getArchangelFromMoon,
  getAvailableMoonPhases,
  getMoonByElement,
  getMoonByChakra,
  MOON_NUMEROLOGY_MAPPINGS,
  type MoonNumerologyMapping,
 type FaseLua,
} from '@/lib/correlation/moon-numerology';

describe('Moon-Numerology Correlation', () => {
  describe('getMoonNumerology', () => {
    it('should return mapping for lua-nova', () => {
      const result = getMoonNumerology('lua-nova');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-nova');
      expect(result?.numero).toBe(1);
      expect(result?.nome_fase).toBe('Lua Nova');
    });

    it('should return mapping for lua-cheia', () => {
      const result = getMoonNumerology('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-cheia');
      expect(result?.numero).toBe(4);
      expect(result?.nome_fase).toBe('Lua Cheia');
    });

    it('should return mapping for lua-minguante', () => {
      const result = getMoonNumerology('lua-minguante');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-minguante');
      expect(result?.numero).toBe(6);
      expect(result?.nome_fase).toBe('Lua Minguante');
    });

    it('should handle case-insensitive input', () => {
      const result = getMoonNumerology('LUA-NOVA');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-nova');
    });

    it('should handle input with whitespace', () => {
      const result = getMoonNumerology('  lua-cheia  ');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-cheia');
    });

    it('should return null for unknown phase', () => {
      const result = getMoonNumerology('unknown-phase');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getMoonNumerology('');
      expect(result).toBeNull();
    });
  });

  describe('getNumerologyMoon', () => {
    it('should return number 1 for lua-nova', () => {
      const result = getNumerologyMoon('lua-nova');
      expect(result).toBe(1);
    });

    it('should return number 4 for lua-cheia', () => {
      const result = getNumerologyMoon('lua-cheia');
      expect(result).toBe(4);
    });

    it('should return number 8 for lua-velha', () => {
      const result = getNumerologyMoon('lua-velha');
      expect(result).toBe(8);
    });

    it('should return null for unknown phase', () => {
      const result = getNumerologyMoon('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getAllMoonNumerology', () => {
    it('should return all 8 moon phases', () => {
      const result = getAllMoonNumerology();
      expect(result).toHaveLength(8);
    });

    it('should include all expected phases', () => {
      const result = getAllMoonNumerology();
      const phases = result.map(m => m.fase);
 expect(phases).toContain('lua-nova');
      expect(phases).toContain('lua-crescente');
      expect(phases).toContain('quarto-crescente');
      expect(phases).toContain('lua-cheia');
      expect(phases).toContain('quarto-minguante');
      expect(phases).toContain('lua-minguante');
      expect(phases).toContain('quarto-descrescente');
      expect(phases).toContain('lua-velha');
    });

    it('should return valid mappings with all required fields', () => {
      const result = getAllMoonNumerology();
      result.forEach(mapping => {
        expect(mapping.fase).toBeDefined();
        expect(mapping.nome_fase).toBeDefined();
        expect(mapping.numero).toBeGreaterThanOrEqual(1);
        expect(mapping.numero).toBeLessThanOrEqual(8);
        expect(mapping.elemento_primario).toBeDefined();
        expect(mapping.elemento_secundario).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.correlacao_numerologica).toBeDefined();
      });
    });
  });

  describe('getMoonByNumerology', () => {
    it('should return lua-nova for number 1', () => {
      const result = getMoonByNumerology(1);
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-nova');
    });

    it('should return lua-cheia for number 4', () => {
      const result = getMoonByNumerology(4);
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-cheia');
    });

    it('should return lua-velha for number 8', () => {
      const result = getMoonByNumerology(8);
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-velha');
    });

    it('should return null for number outside range', () => {
      const result = getMoonByNumerology(9);
      expect(result).toBeNull();
    });

    it('should return null for number 0', () => {
      const result = getMoonByNumerology(0);
      expect(result).toBeNull();
    });
  });

  describe('getElementFromMoonNumerology', () => {
    it('should return Terra for lua-nova', () => {
      const result = getElementFromMoonNumerology('lua-nova');
      expect(result).toBe('Terra');
    });

    it('should return Água for lua-cheia', () => {
      const result = getElementFromMoonNumerology('lua-cheia');
      expect(result).toBe('Água');
    });

    it('should return Éter for lua-minguante', () => {
      const result = getElementFromMoonNumerology('lua-minguante');
      expect(result).toBe('Éter');
    });

    it('should return null for unknown phase', () => {
      const result = getElementFromMoonNumerology('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getSecondaryElementFromMoonNumerology', () => {
    it('should return Éter for lua-nova', () => {
      const result = getSecondaryElementFromMoonNumerology('lua-nova');
      expect(result).toBe('Éter');
    });

    it('should return Éter for lua-cheia', () => {
      const result = getSecondaryElementFromMoonNumerology('lua-cheia');
      expect(result).toBe('Éter');
    });

    it('should return null for unknown phase', () => {
      const result = getSecondaryElementFromMoonNumerology('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getSpiritualMeaning', () => {
    it('should return spiritual meaning for lua-nova', () => {
      const result = getSpiritualMeaning('lua-nova');
      expect(result).toBeDefined();
      expect(result?.palavra_chave).toBe('Iniciação');
      expect(result?.energia).toBeDefined();
      expect(result?.manifestacao).toBeDefined();
      expect(result?.lição_ciclica).toBeDefined();
    });

    it('should return spiritual meaning for lua-cheia', () => {
      const result = getSpiritualMeaning('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.palavra_chave).toBe('Culminação');
    });

    it('should return null for unknown phase', () => {
      const result = getSpiritualMeaning('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getNumerologicalCorrelations', () => {
    it('should return correlations for lua-nova', () => {
      const result = getNumerologicalCorrelations('lua-nova');
      expect(result).toBeDefined();
      expect(result?.arcanjo).toBe('Metatron');
      expect(result?.planeta_exaltação).toBe('Sol');
      expect(result?.chakra).toBe(1);
      expect(result?.tarot_carta).toBe('O Mago');
    });

    it('should return correlations for lua-cheia', () => {
      const result = getNumerologicalCorrelations('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.arcanjo).toBe('Rafael');
      expect(result?.planeta_exaltação).toBe('Júpiter');
      expect(result?.chakra).toBe(4);
      expect(result?.tarot_carta).toBe('O Imperador');
    });

    it('should return null for unknown phase', () => {
      const result = getNumerologicalCorrelations('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getChakraFromMoon', () => {
    it('should return chakra 1 for lua-nova', () => {
      const result = getChakraFromMoon('lua-nova');
      expect(result).toBe(1);
    });

    it('should return chakra4 for lua-cheia', () => {
      const result = getChakraFromMoon('lua-cheia');
      expect(result).toBe(4);
    });

    it('should return chakra 8 for lua-velha', () => {
      const result = getChakraFromMoon('lua-velha');
      expect(result).toBe(8);
    });

    it('should return null for unknown phase', () => {
      const result = getChakraFromMoon('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getTarotFromMoon', () => {
    it('should return O Mago for lua-nova', () => {
      const result = getTarotFromMoon('lua-nova');
      expect(result).toBe('O Mago');
    });

    it('should return O Imperador for lua-cheia', () => {
      const result = getTarotFromMoon('lua-cheia');
      expect(result).toBe('O Imperador');
    });

    it('should return A Justiça for lua-velha', () => {
      const result = getTarotFromMoon('lua-velha');
      expect(result).toBe('A Justiça');
    });

    it('should return null for unknown phase', () => {
      const result = getTarotFromMoon('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getArchangelFromMoon', () => {
    it('should return Metatron for lua-nova', () => {
      const result = getArchangelFromMoon('lua-nova');
      expect(result).toBe('Metatron');
    });

    it('should return Rafael for lua-cheia', () => {
      const result = getArchangelFromMoon('lua-cheia');
      expect(result).toBe('Rafael');
    });

    it('should return null for unknown phase', () => {
      const result = getArchangelFromMoon('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getAvailableMoonPhases', () => {
    it('should return all 8 phases', () => {
      const result = getAvailableMoonPhases();
      expect(result).toHaveLength(8);
    });

    it('should return valid FaseLua types', () => {
      const result = getAvailableMoonPhases();
      result.forEach(phase => {
        expect(typeof phase).toBe('string');
      });
    });
  });

  describe('getMoonByElement', () => {
    it('should return moon phases with Terra as primary element', () => {
      const result = getMoonByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.elemento_primario).toBe('Terra');
      });
    });

    it('should return moon phases with Água as primary element', () => {
      const result = getMoonByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.elemento_primario).toBe('Água');
      });
    });

    it('should return empty array for unknown element', () => {
      const result = getMoonByElement('UnknownElement');
      expect(result).toHaveLength(0);
    });
  });

  describe('getMoonByChakra', () => {
    it('should return moon phases with chakra 1', () => {
      const result = getMoonByChakra(1);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.correlacao_numerologica.chakra).toBe(1);
      });
    });

    it('should return moon phases with chakra 4', () => {
      const result = getMoonByChakra(4);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.correlacao_numerologica.chakra).toBe(4);
      });
    });

    it('should return empty array for unknown chakra', () => {
      const result = getMoonByChakra(99);
      expect(result).toHaveLength(0);
    });
  });

  describe('MOON_NUMEROLOGY_MAPPINGS structure', () => {
    it('should have8 entries', () => {
      expect(Object.keys(MOON_NUMEROLOGY_MAPPINGS)).toHaveLength(8);
    });

    it('should have unique numbers for each phase', () => {
      const numbers = Object.values(MOON_NUMEROLOGY_MAPPINGS).map(m => m.numero);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });

    it('should have correct element connections', () => {
      const mappings = Object.values(MOON_NUMEROLOGY_MAPPINGS);
      mappings.forEach(m => {
        expect(['Fogo', 'Água', 'Ar', 'Terra', 'Éter']).toContain(m.elemento_primario);
        expect(['Fogo', 'Água', 'Ar', 'Terra', 'Éter']).toContain(m.elemento_secundario);
      });
    });

    it('should have chakra numbers within valid range', () => {
      const mappings = Object.values(MOON_NUMEROLOGY_MAPPINGS);
      mappings.forEach(m => {
        expect(m.correlacao_numerologica.chakra).toBeGreaterThanOrEqual(1);
        expect(m.correlacao_numerologica.chakra).toBeLessThanOrEqual(8);
      });
    });

    it('should have valid numero_reduzido values', () => {
      const mappings = Object.values(MOON_NUMEROLOGY_MAPPINGS);
      mappings.forEach(m => {
        expect(m.numero_reduzido).toBeGreaterThanOrEqual(1);
        expect(m.numero_reduzido).toBeLessThanOrEqual(9);
      });
    });
  });
});
