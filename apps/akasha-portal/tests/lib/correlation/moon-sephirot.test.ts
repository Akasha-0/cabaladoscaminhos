import { describe, it, expect } from 'vitest';
import {
  getMoonSephirot,
  getSephirotMoon,
  getAllMoonSephiroth,
  getMoonPhasesBySephirah,
  getMoonPhasesByElement,
  getPathNumberByPhase,
  getHebrewLetterByPhase,
  MOON_SEPHIROT_MAP,
  type MoonSephirot,
} from '@/lib/correlation/moon-sephirot';

describe('Moon-Sephirot Correlation', () => {
  describe('getMoonSephirot', () => {
    it('should return Netzach mapping for lua-nova', () => {
      const result = getMoonSephirot('lua-nova');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(7);
      expect(result?.letra_hebraica).toBe('Vav');
    });

    it('should return Hod mapping for lua-crescente', () => {
      const result = getMoonSephirot('lua-crescente');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Hod');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(8);
    });

    it('should return Chesed mapping for quarto-crescente', () => {
      const result = getMoonSephirot('quarto-crescente');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(4);
    });

    it('should return Tiphereth mapping for lua-cheia', () => {
      const result = getMoonSephirot('lua-cheia');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(6);
    });

    it('should return Geburah mapping for quarto-minguante', () => {
      const result = getMoonSephirot('quarto-minguante');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(5);
    });

    it('should return Binah mapping for lua-minguante', () => {
      const result = getMoonSephirot('lua-minguante');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Binah');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(3);
    });

    it('should return Chokmah mapping for quarto-descrescente', () => {
      const result = getMoonSephirot('quarto-descrescente');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(12);
    });

    it('should return Yesod mapping for lua-velha', () => {
      const result = getMoonSephirot('lua-velha');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(9);
    });

    it('should handle case-insensitive input', () => {
      const result1 = getMoonSephirot('LUA-NOVA');
      const result2 = getMoonSephirot('Lua Nova');
      const result3 = getMoonSephirot('  lua-nova  ');

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result3).not.toBeNull();

      expect(result1?.sephirah).toBe('Netzach');
      expect(result2?.sephirah).toBe('Netzach');
      expect(result3?.sephirah).toBe('Netzach');
    });

    it('should return null for unknown phase', () => {
      const result = getMoonSephirot('fase-desconhecida');
      expect(result).toBeNull();
    });
  });

  describe('getSephirotMoon', () => {
    it('should return Netzach for lua-nova', () => {
      expect(getSephirotMoon('lua-nova')).toBe('Netzach');
    });

    it('should return Tiphereth for lua-cheia', () => {
      expect(getSephirotMoon('lua-cheia')).toBe('Tiphereth');
    });

    it('should return null for unknown phase', () => {
      expect(getSephirotMoon('invalid-phase')).toBeNull();
    });
  });

  describe('getAllMoonSephiroth', () => {
    it('should return all 8 moon-sephirot mappings', () => {
      const result = getAllMoonSephiroth();
      expect(result).toHaveLength(8);
    });

    it('should contain all expected Sephiroth', () => {
      const result = getAllMoonSephiroth();
      const sephiroth = result.map((r) => r.sephirah);

      expect(sephiroth).toContain('Netzach');
      expect(sephiroth).toContain('Hod');
      expect(sephiroth).toContain('Chesed');
      expect(sephiroth).toContain('Tiphereth');
      expect(sephiroth).toContain('Geburah');
      expect(sephiroth).toContain('Binah');
      expect(sephiroth).toContain('Chokmah');
      expect(sephiroth).toContain('Yesod');
    });

    it('should have no duplicate Sephiroth', () => {
      const result = getAllMoonSephiroth();
      const sephiroth = result.map((r) => r.sephirah);
      const unique = new Set(sephiroth);
      expect(unique.size).toBe(sephiroth.length);
    });
  });

  describe('getMoonPhasesBySephirah', () => {
    it('should return phases associated with Tiphereth', () => {
      const result = getMoonPhasesBySephirah('Tiphereth');
      expect(result).toHaveLength(1);
      expect(result[0].fase).toBe('Lua Cheia');
    });

    it('should be case-insensitive', () => {
      const result1 = getMoonPhasesBySephirah('tiphereth');
      const result2 = getMoonPhasesBySephirah('TIPHERETH');
      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
    });

    it('should return empty array for non-existent Sephirah', () => {
      const result = getMoonPhasesBySephirah('Kether');
      expect(result).toHaveLength(0);
    });
  });

  describe('getMoonPhasesByElement', () => {
    it('should return phases aligned with Água', () => {
      const result = getMoonPhasesByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.elemento).toBe('Água');
      });
    });

    it('should return phases aligned with Fogo', () => {
      const result = getMoonPhasesByElement('Fogo');
      expect(result).toHaveLength(2);
      result.forEach((r) => {
        expect(r.elemento).toBe('Fogo');
      });
    });

    it('should return phases aligned with Ar', () => {
      const result = getMoonPhasesByElement('Ar');
      expect(result).toHaveLength(2);
      result.forEach((r) => {
        expect(r.elemento).toBe('Ar');
      });
    });

    it('should return phases aligned with Éter', () => {
      const result = getMoonPhasesByElement('Éter');
      expect(result).toHaveLength(1);
      expect(result[0].fase).toBe('Quarto Descrescente');
    });

    it('should return empty array for Terra', () => {
      const result = getMoonPhasesByElement('Terra');
      expect(result).toHaveLength(0);
    });
  });

  describe('getPathNumberByPhase', () => {
    it('should return correct path number for lua-cheia', () => {
      expect(getPathNumberByPhase('lua-cheia')).toBe(6);
    });

    it('should return correct path number for lua-nova', () => {
      expect(getPathNumberByPhase('lua-nova')).toBe(7);
    });

    it('should return null for unknown phase', () => {
      expect(getPathNumberByPhase('invalid')).toBeNull();
    });
  });

  describe('getHebrewLetterByPhase', () => {
    it('should return correct Hebrew letter for lua-cheia', () => {
      expect(getHebrewLetterByPhase('lua-cheia')).toBe('Vav');
    });

    it('should return correct Hebrew letter for lua-nova', () => {
      expect(getHebrewLetterByPhase('lua-nova')).toBe('Vav');
    });

    it('should return null for unknown phase', () => {
      expect(getHebrewLetterByPhase('invalid')).toBeNull();
    });
  });

  describe('MOON_SEPHIROT_MAP structure', () => {
    it('should have all 8 moon phases defined', () => {
      const phases = Object.keys(MOON_SEPHIROT_MAP);
      expect(phases).toContain('lua-nova');
      expect(phases).toContain('lua-crescente');
      expect(phases).toContain('quarto-crescente');
      expect(phases).toContain('lua-cheia');
      expect(phases).toContain('quarto-minguante');
      expect(phases).toContain('lua-minguante');
      expect(phases).toContain('quarto-descrescente');
      expect(phases).toContain('lua-velha');
      expect(phases).toHaveLength(8);
    });

    it('should have all required fields for each mapping', () => {
      const phases = getAllMoonSephiroth();

      phases.forEach((mapping) => {
        expect(mapping).toHaveProperty('fase');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('qualidade_energetica');
        expect(mapping).toHaveProperty('simbolismo');
        expect(mapping).toHaveProperty('letra_hebraica');
      });
    });

    it('should have valid path numbers (3-12 range)', () => {
      const phases = getAllMoonSephiroth();

      phases.forEach((mapping) => {
        expect(mapping.numero_caminho).toBeGreaterThanOrEqual(3);
        expect(mapping.numero_caminho).toBeLessThanOrEqual(12);
      });
    });

    it('should have valid element values', () => {
      const validElements = ['Fogo', 'Terra', 'Ar', 'Água', 'Éter'];
      const phases = getAllMoonSephiroth();

      phases.forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });
  });
});