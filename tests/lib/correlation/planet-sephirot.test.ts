import { describe, it, expect } from 'vitest';
import {
  getPlanetSephirot,
  getSephirotPlanet,
  getAllPlanetSephiroth,
  getAllPlanets,
  hasPlanetSephirot,
  getPlanetByPath,
  getPlanetsByElement,
  PLANET_SEPHIROT_MAPPINGS,
  type PlanetSephirot,
} from '@/lib/correlation/planet-sephirot';

describe('planet-sephirot', () => {
  // ─── getPlanetSephirot: valid planets ─────────────────────────────────────

  describe('getPlanetSephirot', () => {
    it('returns Kether mapping for Vênus', () => {
      const result = getPlanetSephirot('Vênus');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
      expect(result!.elemento).toBe('Ar / Éter');
      expect(result!.numero_caminho).toBe(11);
    });

    it('returns Binah mapping for Saturno', () => {
      const result = getPlanetSephirot('Saturno');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Binah');
      expect(result!.elemento).toBe('Ar / Terra');
      expect(result!.numero_caminho).toBe(3);
    });

    it('returns Chesed mapping for Júpiter', () => {
      const result = getPlanetSephirot('Júpiter');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.elemento).toBe('Fogo / Ar');
      expect(result!.numero_caminho).toBe(4);
    });

    it('returns Geburah mapping for Marte', () => {
      const result = getPlanetSephirot('Marte');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Geburah');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.numero_caminho).toBe(5);
    });

    it('returns Tiphereth mapping for Sol', () => {
      const result = getPlanetSephirot('Sol');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.elemento).toBe('Fogo / Luz');
      expect(result!.numero_caminho).toBe(6);
    });

    it('returns Hod mapping for Mercúrio', () => {
      const result = getPlanetSephirot('Mercúrio');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Hod');
      expect(result!.elemento).toBe('Ar / Mente');
      expect(result!.numero_caminho).toBe(8);
    });

    it('returns Yesod mapping for Lua', () => {
      const result = getPlanetSephirot('Lua');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.elemento).toBe('Água');
      expect(result!.numero_caminho).toBe(9);
    });

    it('returns Malkuth mapping for Terra', () => {
      const result = getPlanetSephirot('Terra');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.elemento).toBe('Terra');
      expect(result!.numero_caminho).toBe(10);
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetSephirot('Unknown')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getPlanetSephirot('')).toBeNull();
    });
  });

  // ─── getSephirotPlanet: reverse mapping ────────────────────────────────────

  describe('getSephirotPlanet', () => {
    it('returns Vênus for Kether', () => {
      expect(getSephirotPlanet('Kether')).toBe('Vênus');
    });

    it('returns Saturno for Binah', () => {
      expect(getSephirotPlanet('Binah')).toBe('Saturno');
    });

    it('returns Júpiter for Chesed', () => {
      expect(getSephirotPlanet('Chesed')).toBe('Júpiter');
    });

    it('returns Marte for Geburah', () => {
      expect(getSephirotPlanet('Geburah')).toBe('Marte');
    });

    it('returns Sol for Tiphereth', () => {
      expect(getSephirotPlanet('Tiphereth')).toBe('Sol');
    });

    it('returns Mercúrio for Hod', () => {
      expect(getSephirotPlanet('Hod')).toBe('Mercúrio');
    });

    it('returns Lua for Yesod', () => {
      expect(getSephirotPlanet('Yesod')).toBe('Lua');
    });

    it('returns Terra for Malkuth', () => {
      expect(getSephirotPlanet('Malkuth')).toBe('Terra');
    });

    it('returns null for unknown Sephirah', () => {
      expect(getSephirotPlanet('Unknown')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getSephirotPlanet('')).toBeNull();
    });
  });

  // ─── getAllPlanetSephiroth ─────────────────────────────────────────────────

  describe('getAllPlanetSephiroth', () => {
    it('returns all 8 planet mappings', () => {
      const result = getAllPlanetSephiroth();
      expect(result).toHaveLength(8);
    });

    it('contains all expected planets', () => {
      const result = getAllPlanetSephiroth();
      const names = result.map((r) => r.planeta);
      expect(names).toContain('Vênus');
      expect(names).toContain('Saturno');
      expect(names).toContain('Júpiter');
      expect(names).toContain('Marte');
      expect(names).toContain('Sol');
      expect(names).toContain('Mercúrio');
      expect(names).toContain('Lua');
      expect(names).toContain('Terra');
    });

    it('returns unique mappings', () => {
      const result = getAllPlanetSephiroth();
      const ids = result.map((r) => r.planeta);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(8);
    });
  });

  // ─── getAllPlanets ────────────────────────────────────────────────────────

  describe('getAllPlanets', () => {
    it('returns all 8 planet names', () => {
      const result = getAllPlanets();
      expect(result).toHaveLength(8);
    });

    it('returns array of strings', () => {
      const result = getAllPlanets();
      expect(result.every((name) => typeof name === 'string')).toBe(true);
    });
  });

  // ─── hasPlanetSephirot ────────────────────────────────────────────────────

  describe('hasPlanetSephirot', () => {
    it('returns true for Vênus', () => {
      expect(hasPlanetSephirot('Vênus')).toBe(true);
    });

    it('returns true for Sol', () => {
      expect(hasPlanetSephirot('Sol')).toBe(true);
    });

    it('returns false for unknown planet', () => {
      expect(hasPlanetSephirot('Unknown')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasPlanetSephirot('')).toBe(false);
    });
  });

  // ─── getPlanetByPath ─────────────────────────────────────────────────────

  describe('getPlanetByPath', () => {
    it('returns Vênus for path 11', () => {
      const result = getPlanetByPath(11);
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Vênus');
    });

    it('returns Sol for path 6', () => {
      const result = getPlanetByPath(6);
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Sol');
    });

    it('returns Terra for path 10', () => {
      const result = getPlanetByPath(10);
      expect(result).not.toBeNull();
      expect(result!.planeta).toBe('Terra');
    });

    it('returns null for non-existent path', () => {
      expect(getPlanetByPath(99)).toBeNull();
    });
  });

  // ─── getPlanetsByElement ─────────────────────────────────────────────────

  describe('getPlanetsByElement', () => {
    it('returns Vênus for Fogo element', () => {
      const result = getPlanetsByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((p) => p.planeta === 'Júpiter')).toBe(true);
    });

    it('returns Lua for Água element', () => {
      const result = getPlanetsByElement('Água');
      expect(result).toHaveLength(1);
      expect(result[0].planeta).toBe('Lua');
    });

    it('returns multiple planets for Ar element', () => {
      const result = getPlanetsByElement('Ar');
      expect(result.length).toBeGreaterThan(1);
    });

    it('returns empty array for non-existent element', () => {
      const result = getPlanetsByElement('Unknown');
      expect(result).toHaveLength(0);
    });
  });

  // ─── PLANET_SEPHIROT_MAPPINGS constant ────────────────────────────────────

  describe('PLANET_SEPHIROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(PLANET_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('contains 8 entries', () => {
      expect(Object.keys(PLANET_SEPHIROT_MAPPINGS)).toHaveLength(8);
    });
  });

  // ─── Interface completeness ───────────────────────────────────────────────

  describe('PlanetSephirot interface completeness', () => {
    it('has all required fields for Vênus', () => {
      const result = getPlanetSephirot('Vênus');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('sephirah');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('numero_caminho');
    });

    it('has correct types for Vênus', () => {
      const result = getPlanetSephirot('Vênus')!;
      expect(typeof result.planeta).toBe('string');
      expect(typeof result.sephirah).toBe('string');
      expect(typeof result.elemento).toBe('string');
      expect(typeof result.numero_caminho).toBe('number');
    });
  });

  // ─── Path number uniqueness ────────────────────────────────────────────────

  describe('Path number uniqueness', () => {
    it('each planet has a unique path number', () => {
      const result = getAllPlanetSephiroth();
      const paths = result.map((r) => r.numero_caminho);
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(result.length);
    });

    it('paths are within valid range 1-22', () => {
      const result = getAllPlanetSephiroth();
      const paths = result.map((r) => r.numero_caminho);
      expect(paths.every((p) => p >= 1 && p <= 22)).toBe(true);
    });
  });

  // ─── Reverse mapping consistency ──────────────────────────────────────────

  describe('Reverse mapping consistency', () => {
    it('getSephirotPlanet is inverse of getPlanetSephirot', () => {
      const allMappings = getAllPlanetSephiroth();
      for (const mapping of allMappings) {
        const reverse = getSephirotPlanet(mapping.sephirah);
        expect(reverse).toBe(mapping.planeta);
      }
    });
  });
});
