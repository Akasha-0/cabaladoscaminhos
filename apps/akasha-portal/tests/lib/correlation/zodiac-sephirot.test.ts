import { describe, it, expect } from 'vitest';
import {
  getZodiacSephirot,
  getSephirotZodiac,
  getAllZodiacSephiroths,
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

  // ─── getAllZodiacSephiroths ─────────────────────────────────────────────────--

  describe('getAllZodiacSephiroths', () => {
    it('returns all 12 zodiac signs', () => {
      const result = getAllZodiacSephiroths();
      expect(result).toHaveLength(12);
    });

    it('contains all standard zodiac signs', () => {
      const result = getAllZodiacSephiroths();
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
      const result = getAllZodiacSephiroths();
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('significado_espiritual');
      });
    });

    it('returns unique entries', () => {
      const result = getAllZodiacSephiroths();
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

    it('returns null for unknown Sephirah', () => {
      const result = getZodiacsBySephirot('Unknown');
      expect(result).toEqual([]);
    });
  });

  // ─── getAllSephiroth ─────────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns an array of Sephirah names', () => {
      const result = getAllSephiroth();
      expect(Array.isArray(result)).toBe(true);
    });

    it('contains the core Sephiroth', () => {
      const result = getAllSephiroth();
      expect(result).toContain('Kether');
      expect(result).toContain('Chokmah');
      expect(result).toContain('Binah');
      expect(result).toContain('Malkuth');
    });
  });

  // ─── hasZodiacSephirot ─────────────────────────────────────────────────────

  describe('hasZodiacSephirot', () => {
    it('returns true for valid signs', () => {
      expect(hasZodiacSephirot('Áries')).toBe(true);
      expect(hasZodiacSephirot('Touro')).toBe(true);
    });

    it('returns false for invalid signs', () => {
      expect(hasZodiacSephirot('Invalid')).toBe(false);
    });
  });

  // ─── getZodiacsByElement ─────────────────────────────────────────────────────

  describe('getZodiacsByElement', () => {
    it('returns Fire signs', () => {
      const result = getZodiacsByElement('Fogo');
      expect(result).toContain('Áries');
      expect(result).toContain('Leão');
      expect(result).toContain('Sagitário');
    });

    it('returns Earth signs', () => {
      const result = getZodiacsByElement('Terra');
      expect(result).toContain('Touro');
      expect(result).toContain('Virgem');
      expect(result).toContain('Capricórnio');
    });

    it('returns Air signs', () => {
      const result = getZodiacsByElement('Ar');
      expect(result).toContain('Gémeos');
      expect(result).toContain('Balança');
      expect(result).toContain('Aquário');
    });

    it('returns Water signs', () => {
      const result = getZodiacsByElement('Água');
      expect(result).toContain('Câncer');
      expect(result).toContain('Escorpião');
      expect(result).toContain('Peixes');
    });

    it('returns empty array for unknown element', () => {
      const result = getZodiacsByElement('Unknown');
      expect(result).toEqual([]);
    });
  });

  // ─── getPathBySigno ──────────────────────────────────────────────────────────

  describe('getPathBySigno', () => {
    it('returns path number for valid sign', () => {
      expect(getPathBySigno('Áries')).toBe(1);
      expect(getPathBySigno('Touro')).toBe(2);
      expect(getPathBySigno('Gémeos')).toBe(3);
    });

    it('returns null for invalid sign', () => {
      expect(getPathBySigno('Invalid')).toBeNull();
    });
  });

  // ─── getSephirotByPath ──────────────────────────────────────────────────────

  describe('getSephirotByPath', () => {
    it('returns Sephirah for valid path', () => {
      expect(getSephirotByPath(1)).toBe('Kether');
      expect(getSephirotByPath(10)).toBe('Malkuth');
    });

    it('returns null for invalid path', () => {
      expect(getSephirotByPath(99)).toBeNull();
    });
  });

  // ─── ZODIAC_SEPHIROT_MAPPINGS constant ───────────────────────────────────────

  describe('ZODIAC_SEPHIROT_MAPPINGS', () => {
    it('is a non-null object', () => {
      expect(ZODIAC_SEPHIROT_MAPPINGS).toBeDefined();
      expect(typeof ZODIAC_SEPHIROT_MAPPINGS).toBe('object');
    });

    it('contains 12 sign entries', () => {
      expect(Object.keys(ZODIAC_SEPHIROT_MAPPINGS).length).toBe(12);
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('ZodiacSephirot interface completeness', () => {
    it('each mapping has required string fields', () => {
      const all = getAllZodiacSephiroths();
      all.forEach(mapping => {
        expect(typeof mapping.signo).toBe('string');
        expect(typeof mapping.sephirah).toBe('string');
        expect(typeof mapping.elemento).toBe('string');
        expect(typeof mapping.numero_caminho).toBe('number');
        expect(typeof mapping.significado_espiritual).toBe('string');
      });
    });

    it('all path numbers are positive', () => {
      const all = getAllZodiacSephiroths();
      all.forEach(mapping => {
        expect(mapping.numero_caminho).toBeGreaterThan(0);
      });
    });
  });

  // ─── Element distribution ────────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('has exactly 3 Fire signs', () => {
      const fire = getZodiacsByElement('Fogo');
      expect(fire.length).toBe(3);
    });

    it('has exactly 3 Earth signs', () => {
      const earth = getZodiacsByElement('Terra');
      expect(earth.length).toBe(3);
    });

    it('has exactly 3 Air signs', () => {
      const air = getZodiacsByElement('Ar');
      expect(air.length).toBe(3);
    });

    it('has exactly 3 Water signs', () => {
      const water = getZodiacsByElement('Água');
      expect(water.length).toBe(3);
    });

    it('Fire signs are Áries, Leão, Sagitário', () => {
      const fire = getZodiacsByElement('Fogo');
      expect(fire).toEqual(expect.arrayContaining(['Áries', 'Leão', 'Sagitário']));
    });

    it('Earth signs are Touro, Virgem, Capricórnio', () => {
      const earth = getZodiacsByElement('Terra');
      expect(earth).toEqual(expect.arrayContaining(['Touro', 'Virgem', 'Capricórnio']));
    });

    it('Air signs are Gémeos, Balança, Aquário', () => {
      const air = getZodiacsByElement('Ar');
      expect(air).toEqual(expect.arrayContaining(['Gémeos', 'Balança', 'Aquário']));
    });

    it('Water signs are Câncer, Escorpião, Peixes', () => {
      const water = getZodiacsByElement('Água');
      expect(water).toEqual(expect.arrayContaining(['Câncer', 'Escorpião', 'Peixes']));
    });
  });

  // ─── Path number consistency ────────────────────────────────────────────────

  describe('Path number consistency', () => {
    it('each sign has a unique path number', () => {
      const all = getAllZodiacSephiroths();
      const paths = all.map(m => m.numero_caminho);
      const unique = new Set(paths);
      expect(unique.size).toBe(all.length);
    });
  });
});
