import { describe, it, expect } from 'vitest';
import {
  getMoonElement,
  getElementMoon,
  getAllMoonElements,
  getAvailablePhases,
  getSecondaryElements,
  getSpiritualQualities,
  getElementalPractices,
  getOrixaRegente,
  getMoonByElement,
  getElementByOrixa,
  getPolarity,
  MOON_ELEMENT_MAPPINGS,
  type MoonElementMapping,
  type Elemento,
  type FaseLua,
} from '@/lib/correlation/moon-element';

describe('Moon-Element Correlation', () => {
  describe('getMoonElement', () => {
    it('should return Terra/Éter mapping for lua-nova', () => {
      const result = getMoonElement('lua-nova');
      expect(result).toBeDefined();
      expect(result?.elemento_primario).toBe('Terra');
      expect(result?.elementos_secundarios).toContain('Éter');
      expect(result?.nome_fase).toBe('Lua Nova');
    });

    it('should return Água/Terra mapping for lua-crescente', () => {
      const result = getMoonElement('lua-crescente');
      expect(result).toBeDefined();
      expect(result?.elemento_primario).toBe('Água');
      expect(result?.elementos_secundarios).toContain('Terra');
      expect(result?.nome_fase).toBe('Lua Crescente');
    });

    it('should return Fogo/Ar mapping for quarto-crescente', () => {
      const result = getMoonElement('quarto-crescente');
      expect(result).toBeDefined();
      expect(result?.elemento_primario).toBe('Fogo');
      expect(result?.elementos_secundarios).toContain('Ar');
      expect(result?.nome_fase).toBe('Quarto Crescente');
    });

    it('should return Água/Éter mapping for lua-cheia', () => {
      const result = getMoonElement('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.elemento_primario).toBe('Água');
      expect(result?.elementos_secundarios).toContain('Éter');
      expect(result?.nome_fase).toBe('Lua Cheia');
    });

    it('should return Ar/Fogo mapping for quarto-minguante', () => {
      const result = getMoonElement('quarto-minguante');
      expect(result).toBeDefined();
      expect(result?.elemento_primario).toBe('Ar');
      expect(result?.elementos_secundarios).toContain('Fogo');
      expect(result?.nome_fase).toBe('Quarto Minguante');
    });

    it('should return Éter/Terra mapping for lua-minguante', () => {
      const result = getMoonElement('lua-minguante');
      expect(result).toBeDefined();
      expect(result?.elemento_primario).toBe('Éter');
      expect(result?.elementos_secundarios).toContain('Terra');
      expect(result?.nome_fase).toBe('Lua Minguante');
    });

    it('should return Terra/Água mapping for quarto-descrescente', () => {
      const result = getMoonElement('quarto-descrescente');
      expect(result).toBeDefined();
      expect(result?.elemento_primario).toBe('Terra');
      expect(result?.elementos_secundarios).toContain('Água');
      expect(result?.nome_fase).toBe('Quarto Descrescente');
    });

    it('should return Éter/Ar mapping for lua-velha', () => {
      const result = getMoonElement('lua-velha');
      expect(result).toBeDefined();
      expect(result?.elemento_primario).toBe('Éter');
      expect(result?.elementos_secundarios).toContain('Ar');
      expect(result?.nome_fase).toBe('Lua Velha');
    });

    it('should handle case-insensitive input', () => {
      const result = getMoonElement('LUA-NOVA');
      expect(result).toBeDefined();
      expect(result?.elemento_primario).toBe('Terra');
    });

    it('should handle input with extra whitespace', () => {
      const result = getMoonElement('  lua-nova  ');
      expect(result).toBeDefined();
      expect(result?.elemento_primario).toBe('Terra');
    });

    it('should return null for unknown phase', () => {
      const result = getMoonElement('fase-inventada');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getMoonElement('');
      expect(result).toBeNull();
    });
  });

  describe('getElementMoon', () => {
    it('should return Terra for lua-nova', () => {
      expect(getElementMoon('lua-nova')).toBe('Terra');
    });

    it('should return Água for lua-cheia', () => {
      expect(getElementMoon('lua-cheia')).toBe('Água');
    });

    it('should return Fogo for quarto-crescente', () => {
      expect(getElementMoon('quarto-crescente')).toBe('Fogo');
    });

    it('should return Ar for quarto-minguante', () => {
      expect(getElementMoon('quarto-minguante')).toBe('Ar');
    });

    it('should return Éter for lua-minguante', () => {
      expect(getElementMoon('lua-minguante')).toBe('Éter');
    });

    it('should return null for unknown phase', () => {
      expect(getElementMoon('fase-desconhecida')).toBeNull();
    });
  });

  describe('getSecondaryElements', () => {
    it('should return secondary elements for lua-nova', () => {
      const result = getSecondaryElements('lua-nova');
      expect(result).toEqual(['Éter']);
    });

    it('should return multiple secondary elements for lua-cheia', () => {
      const result = getSecondaryElements('lua-cheia');
      expect(result).toContain('Éter');
    });

    it('should return null for unknown phase', () => {
      expect(getSecondaryElements('fase-invalida')).toBeNull();
    });
  });

  describe('getSpiritualQualities', () => {
    it('should return spiritual qualities for lua-nova', () => {
      const result = getSpiritualQualities('lua-nova');
      expect(result).toBeDefined();
      expect(result?.energia).toBe('Receptiva e silenciosa');
      expect(result?.polaridade).toBe('Yin');
      expect(result?.vibração).toContain('Semente');
    });

    it('should return Equilibrado polarity for lua-cheia', () => {
      const result = getSpiritualQualities('lua-cheia');
      expect(result?.polaridade).toBe('Equilibrado');
    });

    it('should return Yang polarity for lua-crescente', () => {
      const result = getSpiritualQualities('lua-crescente');
      expect(result?.polaridade).toBe('Yang');
    });

    it('should return null for unknown phase', () => {
      expect(getSpiritualQualities('fase-desconhecida')).toBeNull();
    });
  });

  describe('getElementalPractices', () => {
    it('should return elemental practices for lua-nova', () => {
      const result = getElementalPractices('lua-nova');
      expect(result).toBeDefined();
      expect(result?.meditacao).toBeDefined();
      expect(result?.ritual).toBeDefined();
      expect(result?.cores).toContain('Marrom');
      expect(result?.cristais).toContain('Obsidiana');
    });

    it('should return crystals for lua-cheia', () => {
      const result = getElementalPractices('lua-cheia');
      expect(result?.cristais).toContain('Selenita');
      expect(result?.cristais).toContain('Quartzo lunar');
    });

    it('should return null for unknown phase', () => {
      expect(getElementalPractices('fase-invalida')).toBeNull();
    });
  });

  describe('getOrixaRegente', () => {
    it('should return Exu for lua-nova', () => {
      expect(getOrixaRegente('lua-nova')).toBe('Exu');
    });

    it('should return Oxalá for lua-cheia', () => {
      expect(getOrixaRegente('lua-cheia')).toBe('Oxalá');
    });

    it('should return null for unknown phase', () => {
      expect(getOrixaRegente('fase-desconhecida')).toBeNull();
    });
  });

  describe('getAllMoonElements', () => {
    it('should return all 8 moon phases', () => {
      const result = getAllMoonElements();
      expect(result).toHaveLength(8);
    });

    it('should contain all lunar phases', () => {
      const result = getAllMoonElements();
      const phases = result.map((r) => r.fase);
      expect(phases).toContain('lua-nova');
      expect(phases).toContain('lua-crescente');
      expect(phases).toContain('quarto-crescente');
      expect(phases).toContain('lua-cheia');
      expect(phases).toContain('quarto-minguante');
      expect(phases).toContain('lua-minguante');
      expect(phases).toContain('quarto-descrescente');
      expect(phases).toContain('lua-velha');
    });

    it('should return complete mappings', () => {
      const result = getAllMoonElements();
      result.forEach((mapping) => {
        expect(mapping.elemento_primario).toBeDefined();
        expect(mapping.elementos_secundarios).toBeDefined();
        expect(mapping.qualidades_espirituais).toBeDefined();
        expect(mapping.praticas_elementais).toBeDefined();
        expect(mapping.orixa_regente).toBeDefined();
      });
    });
  });

  describe('getAvailablePhases', () => {
    it('should return all 8 phase identifiers', () => {
      const result = getAvailablePhases();
      expect(result).toHaveLength(8);
    });

    it('should return FaseLua type values', () => {
      const result = getAvailablePhases();
      expect(result).toContain('lua-nova');
      expect(result).toContain('lua-cheia');
    });
  });

  describe('getMoonByElement', () => {
    it('should return all phases with Água as primary element', () => {
      const result = getMoonByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(
          mapping.elemento_primario === 'Água' ||
          mapping.elementos_secundarios.includes('Água')
        ).toBe(true);
      });
    });

    it('should return phases where element is secondary', () => {
      const result = getMoonByElement('Éter');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown element', () => {
      const result = getMoonByElement('ElementoFalso');
      expect(result).toEqual([]);
    });
  });

  describe('getElementByOrixa', () => {
    it('should return mapping for Oxalá', () => {
      const result = getElementByOrixa('Oxalá');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-cheia');
    });

    it('should return mapping for Exu', () => {
      const result = getElementByOrixa('Exu');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-nova');
    });

    it('should return null for unknown Orixá', () => {
      const result = getElementByOrixa('OrixáInexistente');
      expect(result).toBeNull();
    });
  });

  describe('getPolarity', () => {
    it('should return Yin for lua-nova', () => {
      expect(getPolarity('lua-nova')).toBe('Yin');
    });

    it('should return Yang for lua-crescente', () => {
      expect(getPolarity('lua-crescente')).toBe('Yang');
    });

    it('should return Equilibrado for lua-cheia', () => {
      expect(getPolarity('lua-cheia')).toBe('Equilibrado');
    });

    it('should return null for unknown phase', () => {
      expect(getPolarity('fase-invalida')).toBeNull();
    });
  });

  describe('MOON_ELEMENT_MAPPINGS structure', () => {
    it('should have all required fields for each mapping', () => {
      Object.values(MOON_ELEMENT_MAPPINGS).forEach((mapping) => {
        expect(mapping.fase).toBeDefined();
        expect(mapping.nome_fase).toBeDefined();
        expect(mapping.elemento_primario).toBeDefined();
        expect(['Fogo', 'Água', 'Ar', 'Terra', 'Éter']).toContain(mapping.elemento_primario);
        expect(mapping.elementos_secundarios).toBeDefined();
        expect(Array.isArray(mapping.elementos_secundarios)).toBe(true);
        expect(mapping.qualidades_espirituais).toBeDefined();
        expect(mapping.qualidades_espirituais.polaridade).toMatch(/^(Yang|Yin|Equilibrado)$/);
        expect(mapping.praticas_elementais).toBeDefined();
        expect(mapping.praticas_elementais.cores).toBeDefined();
        expect(mapping.praticas_elementais.cristais).toBeDefined();
        expect(mapping.orixa_regente).toBeDefined();
      });
    });

    it('should have unique phases', () => {
      const phases = Object.keys(MOON_ELEMENT_MAPPINGS);
      const uniquePhases = new Set(phases);
      expect(uniquePhases.size).toBe(phases.length);
    });

    it('should have correct phase keys matching fase field', () => {
      Object.entries(MOON_ELEMENT_MAPPINGS).forEach(([key, mapping]) => {
        expect(mapping.fase).toBe(key);
      });
    });
  });
});