import { describe, it, expect } from 'vitest';
import {
  getSephirotPlanet,
  getAllSephirotPlanetMappings,
  getAllSephiroth,
  hasSephirotPlanet,
  getSephirotByPath,
  getSephirotByLetter,
  SEPHIROT_PLANET_MAPPINGS,
  getPlanetSephirot,
  getAllSephirotPlanets,
  type SephirotPlanet,
} from '@/lib/correlation/sephirot-planet';

describe('sephirot-planet', () => {
  // ─── getSephirotPlanet: valid Sephiroth ────────────────────────────────────

  describe('getSephirotPlanet', () => {
    it('returns Kether mapping with Vênus', () => {
      const result = getSephirotPlanet('Kether');
      expect(result).not.toBeNull();
      expect(result!.planeta_regente).toBe('Vênus');
      expect(result!.numero_caminho).toBe(11);
      expect(result!.letra_hebraica).toBe('א');
      expect(result!.qualidade_vibracional).toBe('Pureza / Conexão Divina');
    });

    it('returns Chokmah mapping with Vênus', () => {
      const result = getSephirotPlanet('Chokmah');
      expect(result).not.toBeNull();
      expect(result!.planeta_regente).toBe('Vênus');
      expect(result!.numero_caminho).toBe(12);
      expect(result!.letra_hebraica).toBe('ב');
    });

    it('returns Binah mapping with Saturno', () => {
      const result = getSephirotPlanet('Binah');
      expect(result).not.toBeNull();
      expect(result!.planeta_regente).toBe('Saturno');
      expect(result!.numero_caminho).toBe(3);
      expect(result!.letra_hebraica).toBe('ג');
    });

    it('returns Chesed mapping with Júpiter', () => {
      const result = getSephirotPlanet('Chesed');
      expect(result).not.toBeNull();
      expect(result!.planeta_regente).toBe('Júpiter');
      expect(result!.numero_caminho).toBe(4);
      expect(result!.letra_hebraica).toBe('ד');
    });

    it('returns Geburah mapping with Marte', () => {
      const result = getSephirotPlanet('Geburah');
      expect(result).not.toBeNull();
      expect(result!.planeta_regente).toBe('Marte');
      expect(result!.numero_caminho).toBe(5);
      expect(result!.letra_hebraica).toBe('ה');
    });

    it('returns Tiphereth mapping with Sol', () => {
      const result = getSephirotPlanet('Tiphereth');
      expect(result).not.toBeNull();
      expect(result!.planeta_regente).toBe('Sol');
      expect(result!.numero_caminho).toBe(6);
      expect(result!.letra_hebraica).toBe('ו');
    });

    it('returns Netzach mapping with Vênus', () => {
      const result = getSephirotPlanet('Netzach');
      expect(result).not.toBeNull();
      expect(result!.planeta_regente).toBe('Vênus');
      expect(result!.numero_caminho).toBe(7);
      expect(result!.letra_hebraica).toBe('ז');
    });

    it('returns Hod mapping with Mercúrio', () => {
      const result = getSephirotPlanet('Hod');
      expect(result).not.toBeNull();
      expect(result!.planeta_regente).toBe('Mercúrio');
      expect(result!.numero_caminho).toBe(8);
      expect(result!.letra_hebraica).toBe('ח');
    });

    it('returns Yesod mapping with Lua', () => {
      const result = getSephirotPlanet('Yesod');
      expect(result).not.toBeNull();
      expect(result!.planeta_regente).toBe('Lua');
      expect(result!.numero_caminho).toBe(9);
      expect(result!.letra_hebraica).toBe('ט');
    });

    it('returns Malkuth mapping with Terra', () => {
      const result = getSephirotPlanet('Malkuth');
      expect(result).not.toBeNull();
      expect(result!.planeta_regente).toBe('Terra');
      expect(result!.numero_caminho).toBe(10);
      expect(result!.letra_hebraica).toBe('י');
    });

    it('returns null for unknown Sephirah', () => {
      expect(getSephirotPlanet('Unknown')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getSephirotPlanet('')).toBeNull();
    });
  });

  // ─── getAllSephirotPlanetMappings ──────────────────────────────────────────

  describe('getAllSephirotPlanetMappings', () => {
    it('returns all 10 Sephiroth mappings', () => {
      const result = getAllSephirotPlanetMappings();
      expect(result).toHaveLength(10);
    });

    it('contains all expected Sephiroth', () => {
      const result = getAllSephirotPlanetMappings();
      const names = result.map((r) => r.sephirah);
      expect(names).toContain('Kether');
      expect(names).toContain('Chokmah');
      expect(names).toContain('Binah');
      expect(names).toContain('Chesed');
      expect(names).toContain('Geburah');
      expect(names).toContain('Tiphereth');
      expect(names).toContain('Netzach');
      expect(names).toContain('Hod');
      expect(names).toContain('Yesod');
      expect(names).toContain('Malkuth');
    });

    it('returns unique mappings', () => {
      const result = getAllSephirotPlanetMappings();
      const ids = result.map((r) => r.sephirah);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });

  // ─── getAllSephiroth ───────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns all 10 Sephirah names', () => {
      const result = getAllSephiroth();
      expect(result).toHaveLength(10);
    });

    it('returns array of strings', () => {
      const result = getAllSephiroth();
      expect(result.every((name) => typeof name === 'string')).toBe(true);
    });
  });

  // ─── hasSephirotPlanet ──────────────────────────────────────────────────────

  describe('hasSephirotPlanet', () => {
    it('returns true for Kether', () => {
      expect(hasSephirotPlanet('Kether')).toBe(true);
    });

    it('returns true for Malkuth', () => {
      expect(hasSephirotPlanet('Malkuth')).toBe(true);
    });

    it('returns false for unknown Sephirah', () => {
      expect(hasSephirotPlanet('Unknown')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasSephirotPlanet('')).toBe(false);
    });
  });

  // ─── getSephirotByPath ─────────────────────────────────────────────────────

  describe('getSephirotByPath', () => {
    it('returns Kether for path 11', () => {
      const result = getSephirotByPath(11);
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
    });

    it('returns Tiphereth for path 6', () => {
      const result = getSephirotByPath(6);
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
    });

    it('returns Malkuth for path 10', () => {
      const result = getSephirotByPath(10);
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
    });

    it('returns null for non-existent path', () => {
      expect(getSephirotByPath(99)).toBeNull();
    });
  });

  // ─── getSephirotByLetter ───────────────────────────────────────────────────

  describe('getSephirotByLetter', () => {
    it('returns Kether for א', () => {
      const result = getSephirotByLetter('א');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
    });

    it('returns Tiphereth for ו', () => {
      const result = getSephirotByLetter('ו');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
    });

    it('returns Malkuth for י', () => {
      const result = getSephirotByLetter('י');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
    });

    it('returns null for non-existent letter', () => {
      expect(getSephirotByLetter('צ')).toBeNull();
    });
  });

  // ─── SEPHIROT_PLANET_MAPPINGS constant ─────────────────────────────────────

  describe('SEPHIROT_PLANET_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(SEPHIROT_PLANET_MAPPINGS)).toBe(true);
    });

    it('contains 10 entries', () => {
      expect(Object.keys(SEPHIROT_PLANET_MAPPINGS)).toHaveLength(10);
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('SephirotPlanet interface completeness', () => {
    it('has all required fields for Kether', () => {
      const result = getSephirotPlanet('Kether');
      expect(result).toHaveProperty('sephirah');
      expect(result).toHaveProperty('planeta_regente');
      expect(result).toHaveProperty('numero_caminho');
      expect(result).toHaveProperty('letra_hebraica');
      expect(result).toHaveProperty('qualidade_vibracional');
    });

    it('has correct types for Kether', () => {
      const result = getSephirotPlanet('Kether')!;
      expect(typeof result.sephirah).toBe('string');
      expect(typeof result.planeta_regente).toBe('string');
      expect(typeof result.numero_caminho).toBe('number');
      expect(typeof result.letra_hebraica).toBe('string');
      expect(typeof result.qualidade_vibracional).toBe('string');
    });
  });

  // ─── Planet distribution ───────────────────────────────────────────────────

  describe('Planet distribution', () => {
    it('Vênus rules Kether, Chokmah, and Netzach', () => {
      const venusSephiroth = getAllSephirotPlanetMappings().filter(
        (s) => s.planeta_regente === 'Vênus'
      );
      expect(venusSephiroth).toHaveLength(3);
      const names = venusSephiroth.map((s) => s.sephirah);
      expect(names).toContain('Kether');
      expect(names).toContain('Chokmah');
      expect(names).toContain('Netzach');
    });

    it('only one Sephirah per planet for other planets', () => {
      const others = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Saturno', 'Terra'];
      for (const planet of others) {
        const count = getAllSephirotPlanetMappings().filter(
          (s) => s.planeta_regente === planet
        ).length;
        expect(count).toBe(1);
      }
    });
  });
  // ─── getPlanetSephirot ──────────────────────────────────────────────────────
  describe('getPlanetSephirot', () => {
    it('returns Vênus for Kether', () => {
      expect(getPlanetSephirot('Kether')).toBe('Vênus');
    });
    it('returns Saturno for Binah', () => {
      expect(getPlanetSephirot('Binah')).toBe('Saturno');
    });
    it('returns Sol for Tiphereth', () => {
      expect(getPlanetSephirot('Tiphereth')).toBe('Sol');
    });
    it('returns Lua for Yesod', () => {
      expect(getPlanetSephirot('Yesod')).toBe('Lua');
    });
    it('returns Terra for Malkuth', () => {
      expect(getPlanetSephirot('Malkuth')).toBe('Terra');
    });
    it('returns null for unknown Sephirah', () => {
      expect(getPlanetSephirot('Unknown')).toBeNull();
    });
    it('returns null for empty string', () => {
      expect(getPlanetSephirot('')).toBeNull();
    });
  });
  // ─── getAllSephirotPlanets ─────────────────────────────────────────────────
  describe('getAllSephirotPlanets', () => {
    it('returns all 10 Sephiroth mappings', () => {
      const result = getAllSephirotPlanets();
      expect(result).toHaveLength(10);
    });
    it('returns same result as getAllSephirotPlanetMappings', () => {
      expect(getAllSephirotPlanets()).toEqual(getAllSephirotPlanetMappings());
    });
    it('contains unique sephiroth names', () => {
      const result = getAllSephirotPlanets();
      const names = result.map((r) => r.sephirah);
      const unique = new Set(names);
      expect(unique.size).toBe(10);
    });
  });
});