import { describe, it, expect } from 'vitest';
import {
  getZodiacSephirot,
  getSephirotZodiac,
  getAllZodiacSephiroth,
  getZodiacsBySephirot,
  getAllSephiroth,
  hasZodiacSephirot,
  getZodiacsByElement,
  getPathBySigno,
  getSephirotByPath,
  ZODIAC_SEPHIROT_MAPPINGS,
  type ZodiacSephirot,
  type Sephirah,
} from '@/lib/correlation/zodiac-sephirot';

describe('zodiac-sephirot', () => {
  // ─── getZodiacSephirot: valid signs ─────────────────────────────────────────

  describe('getZodiacSephirot', () => {
    it('returns mapping for Áries', () => {
      const result = getZodiacSephirot('Áries');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Áries');
      expect(result?.sephirah).toBe('Kether');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(1);
    });

    it('returns mapping for Touro', () => {
      const result = getZodiacSephirot('Touro');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Touro');
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(2);
    });

    it('returns mapping for Gémeos', () => {
      const result = getZodiacSephirot('Gémeos');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Gémeos');
      expect(result?.sephirah).toBe('Binah');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(3);
    });

    it('returns mapping for Câncer', () => {
      const result = getZodiacSephirot('Câncer');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Câncer');
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(4);
    });

    it('returns mapping for Leão', () => {
      const result = getZodiacSephirot('Leão');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Leão');
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(5);
    });

    it('returns mapping for Virgem', () => {
      const result = getZodiacSephirot('Virgem');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Virgem');
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(6);
    });

    it('returns mapping for Balança', () => {
      const result = getZodiacSephirot('Balança');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Balança');
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(7);
    });

    it('returns mapping for Escorpião', () => {
      const result = getZodiacSephirot('Escorpião');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Escorpião');
      expect(result?.sephirah).toBe('Hod');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(8);
    });

    it('returns mapping for Sagitário', () => {
      const result = getZodiacSephirot('Sagitário');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Sagitário');
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(9);
    });

    it('returns mapping for Capricórnio', () => {
      const result = getZodiacSephirot('Capricórnio');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Capricórnio');
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(10);
    });

    it('returns mapping for Aquário', () => {
      const result = getZodiacSephirot('Aquário');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Aquário');
      expect(result?.sephirah).toBe('Kether');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(11);
    });

    it('returns mapping for Peixes', () => {
      const result = getZodiacSephirot('Peixes');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Peixes');
      expect(result?.sephirah).toBe('Binah');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(12);
    });
  });

  // ─── getZodiacSephirot: case-insensitive ───────────────────────────────────

  describe('getZodiacSephirot case handling', () => {
    it('handles lowercase input', () => {
      const result = getZodiacSephirot('aries');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Áries');
    });

    it('handles uppercase input', () => {
      const result = getZodiacSephirot('LEÃO');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Leão');
    });

    it('handles mixed case input', () => {
      const result = getZodiacSephirot('ToUrO');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Touro');
    });

    it('handles accent variations (Caránguejo vs Câncer)', () => {
      const result1 = getZodiacSephirot('Caránguejo');
      const result2 = getZodiacSephirot('Cancer');
      expect(result1?.signo).toBe('Câncer');
      expect(result2?.signo).toBe('Câncer');
    });

    it('handles Libra as Balança alias', () => {
      const result = getZodiacSephirot('Libra');
      expect(result?.signo).toBe('Balança');
    });

    it('handles Gémeos variation (Gemes)', () => {
      const result = getZodiacSephirot('Gemes');
      expect(result?.signo).toBe('Gémeos');
    });
  });

  // ─── getZodiacSephirot: invalid input ────────────────────────────────────────

  describe('getZodiacSephirot invalid input', () => {
    it('returns null for unknown sign', () => {
      const result = getZodiacSephirot('Orion');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getZodiacSephirot('');
      expect(result).toBeNull();
    });

    it('returns null for non-zodiac input', () => {
      const result = getZodiacSephirot('Planeta');
      expect(result).toBeNull();
    });
  });

  // ─── getSephirotZodiac ──────────────────────────────────────────────────────

  describe('getSephirotZodiac', () => {
    it('returns Áries for Kether', () => {
      const result = getSephirotZodiac('Kether');
      expect(result).toBe('Áries');
    });

    it('returns Touro for Chokmah', () => {
      const result = getSephirotZodiac('Chokmah');
      expect(result).toBe('Touro');
    });

    it('returns Gémeos for Binah', () => {
      const result = getSephirotZodiac('Binah');
      expect(result).toBe('Gémeos');
    });

    it('returns Câncer for Chesed', () => {
      const result = getSephirotZodiac('Chesed');
      expect(result).toBe('Câncer');
    });

    it('returns Leão for Geburah', () => {
      const result = getSephirotZodiac('Geburah');
      expect(result).toBe('Leão');
    });

    it('returns Virgem for Tiphereth', () => {
      const result = getSephirotZodiac('Tiphereth');
      expect(result).toBe('Virgem');
    });

    it('returns Balança for Netzach', () => {
      const result = getSephirotZodiac('Netzach');
      expect(result).toBe('Balança');
    });

    it('returns Escorpião for Hod', () => {
      const result = getSephirotZodiac('Hod');
      expect(result).toBe('Escorpião');
    });

    it('returns Sagitário for Yesod', () => {
      const result = getSephirotZodiac('Yesod');
      expect(result).toBe('Sagitário');
    });

    it('returns Capricórnio for Malkuth', () => {
      const result = getSephirotZodiac('Malkuth');
      expect(result).toBe('Capricórnio');
    });

    it('returns null for non-existent Sephirah', () => {
      const result = getSephirotZodiac('Ain');
      expect(result).toBeNull();
    });
  });

  // ─── getSephirotZodiac: case-insensitive ────────────────────────────────────

  describe('getSephirotZodiac case handling', () => {
    it('handles lowercase input', () => {
      const result = getSephirotZodiac('kether');
      expect(result).toBe('Áries');
    });

    it('handles uppercase input', () => {
      const result = getSephirotZodiac('GEBURAH');
      expect(result).toBe('Leão');
    });
  });

  // ─── getAllZodiacSephiroth ───────────────────────────────────────────────────

  describe('getAllZodiacSephiroth', () => {
    it('returns all 12 zodiac signs', () => {
      const result = getAllZodiacSephiroth();
      expect(result).toHaveLength(12);
    });

    it('contains all standard zodiac signs', () => {
      const result = getAllZodiacSephiroth();
      const signNames = result.map(m => m.signo);
      expect(signNames).toContain('Áries');
      expect(signNames).toContain('Touro');
      expect(signNames).toContain('Gémeos');
      expect(signNames).toContain('Câncer');
      expect(signNames).toContain('Leão');
      expect(signNames).toContain('Virgem');
      expect(signNames).toContain('Balança');
      expect(signNames).toContain('Escorpião');
      expect(signNames).toContain('Sagitário');
      expect(signNames).toContain('Capricórnio');
      expect(signNames).toContain('Aquário');
      expect(signNames).toContain('Peixes');
    });

    it('returns objects with all required properties', () => {
      const result = getAllZodiacSephiroth();
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('significado_espiritual');
      });
    });

    it('returns unique entries', () => {
      const result = getAllZodiacSephiroth();
      const unique = new Set(result.map(m => m.signo));
      expect(unique.size).toBe(12);
    });
  });

  // ─── getZodiacsBySephirot ─────────────────────────────────────────────────────

  describe('getZodiacsBySephirot', () => {
    it('returns single zodiac for most Sephiroth', () => {
      const result = getZodiacsBySephirot('Chokmah');
      expect(result).toEqual(['Touro']);
    });

    it('returns multiple zodiacs for Kether', () => {
      const result = getZodiacsBySephirot('Kether');
      expect(result).toContain('Áries');
      expect(result).toContain('Aquário');
    });

    it('returns multiple zodiacs for Binah', () => {
      const result = getZodiacsBySephirot('Binah');
      expect(result).toContain('Gémeos');
      expect(result).toContain('Peixes');
    });

    it('returns empty array for non-existent Sephirah', () => {
      const result = getZodiacsBySephirot('Ain');
      expect(result).toEqual([]);
    });
  });

  // ─── getAllSephiroth ─────────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns unique Sephirah names', () => {
      const result = getAllSephiroth();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('contains all 10 standard Sephiroth', () => {
      const result = getAllSephiroth();
      expect(result).toContain('Kether');
      expect(result).toContain('Chokmah');
      expect(result).toContain('Binah');
      expect(result).toContain('Chesed');
      expect(result).toContain('Geburah');
      expect(result).toContain('Tiphereth');
      expect(result).toContain('Netzach');
      expect(result).toContain('Hod');
      expect(result).toContain('Yesod');
      expect(result).toContain('Malkuth');
    });

    it('returns array, not object keys', () => {
      const result = getAllSephiroth();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ─── hasZodiacSephirot ──────────────────────────────────────────────────────

  describe('hasZodiacSephirot', () => {
    it('returns true for valid signs', () => {
      expect(hasZodiacSephirot('Áries')).toBe(true);
      expect(hasZodiacSephirot('Leão')).toBe(true);
      expect(hasZodiacSephirot('Sagitário')).toBe(true);
    });

    it('returns true for case variations', () => {
      expect(hasZodiacSephirot('ARIES')).toBe(true);
      expect(hasZodiacSephirot('touro')).toBe(true);
    });

    it('returns false for invalid signs', () => {
      expect(hasZodiacSephirot('Orion')).toBe(false);
      expect(hasZodiacSephirot('')).toBe(false);
      expect(hasZodiacSephirot('Planeta')).toBe(false);
    });
  });

  // ─── getZodiacsByElement ─────────────────────────────────────────────────────

  describe('getZodiacsByElement', () => {
    it('returns fire signs', () => {
      const result = getZodiacsByElement('Fogo');
      expect(result).toContain('Áries');
      expect(result).toContain('Leão');
      expect(result).toContain('Sagitário');
      expect(result).toHaveLength(3);
    });

    it('returns earth signs', () => {
      const result = getZodiacsByElement('Terra');
      expect(result).toContain('Touro');
      expect(result).toContain('Virgem');
      expect(result).toContain('Capricórnio');
      expect(result).toHaveLength(3);
    });

    it('returns air signs', () => {
      const result = getZodiacsByElement('Ar');
      expect(result).toContain('Gémeos');
      expect(result).toContain('Balança');
      expect(result).toContain('Aquário');
      expect(result).toHaveLength(3);
    });

    it('returns water signs', () => {
      const result = getZodiacsByElement('Água');
      expect(result).toContain('Câncer');
      expect(result).toContain('Escorpião');
      expect(result).toContain('Peixes');
      expect(result).toHaveLength(3);
    });

    it('is case-insensitive', () => {
      const result1 = getZodiacsByElement('fogo');
      const result2 = getZodiacsByElement('FOGO');
      expect(result1).toEqual(result2);
    });

    it('returns empty array for non-existent element', () => {
      const result = getZodiacsByElement('Éter');
      expect(result).toEqual([]);
    });
  });

  // ─── getPathBySigno ──────────────────────────────────────────────────────────

  describe('getPathBySigno', () => {
    it('returns correct paths for all signs', () => {
      expect(getPathBySigno('Áries')).toBe(1);
      expect(getPathBySigno('Touro')).toBe(2);
      expect(getPathBySigno('Gémeos')).toBe(3);
      expect(getPathBySigno('Câncer')).toBe(4);
      expect(getPathBySigno('Leão')).toBe(5);
      expect(getPathBySigno('Virgem')).toBe(6);
      expect(getPathBySigno('Balança')).toBe(7);
      expect(getPathBySigno('Escorpião')).toBe(8);
      expect(getPathBySigno('Sagitário')).toBe(9);
      expect(getPathBySigno('Capricórnio')).toBe(10);
      expect(getPathBySigno('Aquário')).toBe(11);
      expect(getPathBySigno('Peixes')).toBe(12);
    });

    it('returns null for unknown sign', () => {
      expect(getPathBySigno('Orion')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getPathBySigno('aries')).toBe(1);
      expect(getPathBySigno('LEÃO')).toBe(5);
    });
  });

  // ─── getSephirotByPath ──────────────────────────────────────────────────────

  describe('getSephirotByPath', () => {
    it('returns correct Sephiroth for paths 1-12', () => {
      expect(getSephirotByPath(1)).toBe('Kether');
      expect(getSephirotByPath(2)).toBe('Chokmah');
      expect(getSephirotByPath(3)).toBe('Binah');
      expect(getSephirotByPath(4)).toBe('Chesed');
      expect(getSephirotByPath(5)).toBe('Geburah');
      expect(getSephirotByPath(6)).toBe('Tiphereth');
      expect(getSephirotByPath(7)).toBe('Netzach');
      expect(getSephirotByPath(8)).toBe('Hod');
      expect(getSephirotByPath(9)).toBe('Yesod');
      expect(getSephirotByPath(10)).toBe('Malkuth');
      expect(getSephirotByPath(11)).toBe('Kether');
      expect(getSephirotByPath(12)).toBe('Binah');
    });

    it('returns null for non-existent path', () => {
      expect(getSephirotByPath(13)).toBeNull();
      expect(getSephirotByPath(0)).toBeNull();
      expect(getSephirotByPath(-1)).toBeNull();
    });
  });

  // ─── ZODIAC_SEPHIROT_MAPPINGS constant ───────────────────────────────────────

  describe('ZODIAC_SEPHIROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(ZODIAC_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('has 12 entries', () => {
      expect(Object.keys(ZODIAC_SEPHIROT_MAPPINGS)).toHaveLength(12);
    });

    it('can be accessed directly by Portuguese name', () => {
      const mapping = ZODIAC_SEPHIROT_MAPPINGS['Áries'];
      expect(mapping).toBeDefined();
      expect(mapping.sephirah).toBe('Kether');
    });

    it('nested objects are frozen', () => {
      const mapping = ZODIAC_SEPHIROT_MAPPINGS['Áries'];
      expect(Object.isFrozen(mapping)).toBe(true);
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('ZodiacSephirot interface completeness', () => {
    it('all mappings have signo property', () => {
      const all = getAllZodiacSephiroth();
      all.forEach(m => {
        expect(typeof m.signo).toBe('string');
        expect(m.signo.length).toBeGreaterThan(0);
      });
    });

    it('all mappings have sephirah property', () => {
      const all = getAllZodiacSephiroth();
      all.forEach(m => {
        expect(typeof m.sephirah).toBe('string');
        expect(['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth']).toContain(m.sephirah);
      });
    });

    it('all mappings have elemento property', () => {
      const all = getAllZodiacSephiroth();
      all.forEach(m => {
        expect(['Fogo', 'Água', 'Terra', 'Ar']).toContain(m.elemento);
      });
    });

    it('all mappings have numero_caminho property (1-22)', () => {
      const all = getAllZodiacSephiroth();
      all.forEach(m => {
        expect(typeof m.numero_caminho).toBe('number');
        expect(m.numero_caminho).toBeGreaterThanOrEqual(1);
        expect(m.numero_caminho).toBeLessThanOrEqual(22);
      });
    });

    it('all mappings have significado_espiritual property', () => {
      const all = getAllZodiacSephiroth();
      all.forEach(m => {
        expect(typeof m.significado_espiritual).toBe('string');
        expect(m.significado_espiritual.length).toBeGreaterThan(10);
      });
    });
  });

  // ─── Element distribution ────────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('each element has exactly 3 signs', () => {
      const fogo = getZodiacsByElement('Fogo');
      const terra = getZodiacsByElement('Terra');
      const ar = getZodiacsByElement('Ar');
      const agua = getZodiacsByElement('Água');

      expect(fogo).toHaveLength(3);
      expect(terra).toHaveLength(3);
      expect(ar).toHaveLength(3);
      expect(agua).toHaveLength(3);
    });

    it('fire signs are Áries, Leão, Sagitário', () => {
      const fogo = getZodiacsByElement('Fogo');
      expect(fogo).toContain('Áries');
      expect(fogo).toContain('Leão');
      expect(fogo).toContain('Sagitário');
    });

    it('earth signs are Touro, Virgem, Capricórnio', () => {
      const terra = getZodiacsByElement('Terra');
      expect(terra).toContain('Touro');
      expect(terra).toContain('Virgem');
      expect(terra).toContain('Capricórnio');
    });

    it('air signs are Gémeos, Balança, Aquário', () => {
      const ar = getZodiacsByElement('Ar');
      expect(ar).toContain('Gémeos');
      expect(ar).toContain('Balança');
      expect(ar).toContain('Aquário');
    });

    it('water signs are Câncer, Escorpião, Peixes', () => {
      const agua = getZodiacsByElement('Água');
      expect(agua).toContain('Câncer');
      expect(agua).toContain('Escorpião');
      expect(agua).toContain('Peixes');
    });
  });

  // ─── Path number consistency ────────────────────────────────────────────────

  describe('Path number consistency', () => {
    it('path numbers are unique for each zodiac sign', () => {
      const paths = getAllZodiacSephiroth().map(m => m.numero_caminho);
      const unique = new Set(paths);
      expect(unique.size).toBe(paths.length);
    });

    it('paths cover 1-12 without gaps', () => {
      const paths = getAllZodiacSephiroth().map(m => m.numero_caminho).sort((a, b) => a - b);
      expect(paths).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });
  });
});