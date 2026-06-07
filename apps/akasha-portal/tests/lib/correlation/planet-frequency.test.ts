import { describe, it, expect } from 'vitest';
import {
  getPlanetFrequency,
  getFrequencyPlanet,
  getFrequencyByPlanet,
  getFrequencyMapping,
  getAllPlanetFrequencies,
  getAllPlanets,
  hasPlanetFrequency,
  getFrequenciesByElement,
  getPlanetByFrequency,
  getAllFrequencies,
  PLANET_FREQUENCY_MAPPINGS,
  type PlanetFrequencyMapping,
} from '@/lib/correlation/planet-frequency';

describe('planet-frequency', () => {
  // ─── getPlanetFrequency: valid planets ─────────────────────────────────────

  describe('getPlanetFrequency', () => {
    it('returns mapping for Sol', () => {
      const result = getPlanetFrequency('Sol');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Sol');
      expect(result?.frequencia).toBe(528);
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.chakra).toBe('Plexo Solar');
      expect(result?.orixa).toBe('Oxum');
      expect(result?.sephirah).toBe('Tiferet');
    });

    it('returns mapping for Lua', () => {
      const result = getPlanetFrequency('Lua');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Lua');
      expect(result?.frequencia).toBe(417);
      expect(result?.elemento_conexao).toBe('Água');
      expect(result?.chakra).toBe('Plexo Solar');
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.sephirah).toBe('Yesod');
    });

    it('returns mapping for Marte', () => {
      const result = getPlanetFrequency('Marte');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Marte');
      expect(result?.frequencia).toBe(396);
      expect(result?.elemento_conexao).toBe('Fogo');
      expect(result?.chakra).toBe('Raiz');
      expect(result?.orixa).toBe('Ogum');
      expect(result?.sephirah).toBe('Hod');
    });

    it('returns mapping for Mercurio', () => {
      const result = getPlanetFrequency('Mercurio');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.frequencia).toBe(741);
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.chakra).toBe('Pescoço');
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.sephirah).toBe('Hesed');
    });

    it('returns mapping for Jupiter', () => {
      const result = getPlanetFrequency('Jupiter');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.frequencia).toBe(639);
      expect(result?.elemento_conexao).toBe('Ar');
      expect(result?.chakra).toBe('Coração');
      expect(result?.orixa).toBe('Xangô');
      expect(result?.sephirah).toBe('Gevurah');
    });

    it('returns mapping for Venus', () => {
      const result = getPlanetFrequency('Venus');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.frequencia).toBe(852);
      expect(result?.elemento_conexao).toBe('Terra');
      expect(result?.chakra).toBe('Terceiro Olho');
      expect(result?.orixa).toBe('Iansã');
      expect(result?.sephirah).toBe('Netzah');
    });

    it('returns mapping for Saturno', () => {
      const result = getPlanetFrequency('Saturno');
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.frequencia).toBe(963);
      expect(result?.elemento_conexao).toBe('Terra');
      expect(result?.chakra).toBe('Coroa');
      expect(result?.orixa).toBe('Nanã');
      expect(result?.sephirah).toBe('Keter');
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetFrequency('Plutão')).toBeNull();
      expect(getPlanetFrequency('Netuno')).toBeNull();
      expect(getPlanetFrequency('Urano')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getPlanetFrequency('')).toBeNull();
    });
  });

  // ─── getFrequencyPlanet ───────────────────────────────────────────────────

  describe('getFrequencyPlanet', () => {
    it('returns Sol for frequency 528', () => {
      expect(getFrequencyPlanet(528)).toBe('Sol');
    });

    it('returns Lua for frequency 417', () => {
      expect(getFrequencyPlanet(417)).toBe('Lua');
    });

    it('returns Marte for frequency 396', () => {
      expect(getFrequencyPlanet(396)).toBe('Marte');
    });

    it('returns Mercurio for frequency 741', () => {
      expect(getFrequencyPlanet(741)).toBe('Mercúrio');
    });

    it('returns Jupiter for frequency 639', () => {
      expect(getFrequencyPlanet(639)).toBe('Júpiter');
    });

    it('returns Venus for frequency 852', () => {
      expect(getFrequencyPlanet(852)).toBe('Vênus');
    });

    it('returns Saturno for frequency 963', () => {
      expect(getFrequencyPlanet(963)).toBe('Saturno');
    });

    it('returns null for unknown frequency', () => {
      expect(getFrequencyPlanet(100)).toBeNull();
      expect(getFrequencyPlanet(432)).toBeNull();
      expect(getFrequencyPlanet(999)).toBeNull();
    });
  });

  // ─── getFrequencyByPlanet ─────────────────────────────────────────────────

  describe('getFrequencyByPlanet', () => {
    it('returns 528 for Sol', () => {
      expect(getFrequencyByPlanet('Sol')).toBe(528);
    });

    it('returns 417 for Lua', () => {
      expect(getFrequencyByPlanet('Lua')).toBe(417);
    });

    it('returns 396 for Marte', () => {
      expect(getFrequencyByPlanet('Marte')).toBe(396);
    });

    it('returns 741 for Mercurio', () => {
      expect(getFrequencyByPlanet('Mercurio')).toBe(741);
    });

    it('returns 639 for Jupiter', () => {
      expect(getFrequencyByPlanet('Jupiter')).toBe(639);
    });

    it('returns 852 for Venus', () => {
      expect(getFrequencyByPlanet('Venus')).toBe(852);
    });

    it('returns 963 for Saturno', () => {
      expect(getFrequencyByPlanet('Saturno')).toBe(963);
    });

    it('returns null for unknown planet', () => {
      expect(getFrequencyByPlanet('Plutão')).toBeNull();
    });
  });

  // ─── getFrequencyMapping ──────────────────────────────────────────────────

  describe('getFrequencyMapping', () => {
    it('returns full mapping for frequency 528', () => {
      const result = getFrequencyMapping(528);
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Sol');
      expect(result?.frequencia).toBe(528);
    });

    it('returns full mapping for frequency 963', () => {
      const result = getFrequencyMapping(963);
      expect(result).not.toBeNull();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.frequencia).toBe(963);
    });

    it('returns null for unknown frequency', () => {
      expect(getFrequencyMapping(432)).toBeNull();
    });
  });

  // ─── getAllPlanetFrequencies ────────────────────────────────────────────────

  describe('getAllPlanetFrequencies', () => {
    it('returns all 7 mappings', () => {
      const result = getAllPlanetFrequencies();
      expect(result).toHaveLength(7);
    });

    it('contains all expected planets', () => {
      const result = getAllPlanetFrequencies();
      const planetNames = result.map(m => m.planeta);
      expect(planetNames).toContain('Sol');
      expect(planetNames).toContain('Lua');
      expect(planetNames).toContain('Marte');
      expect(planetNames).toContain('Mercúrio');
      expect(planetNames).toContain('Júpiter');
      expect(planetNames).toContain('Vênus');
      expect(planetNames).toContain('Saturno');
    });

    it('returns array of PlanetFrequencyMapping objects', () => {
      const result = getAllPlanetFrequencies();
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('elemento_conexao');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('sephirah');
      });
    });

    it('contains all Solfeggio frequencies', () => {
      const result = getAllPlanetFrequencies();
      const frequencies = result.map(m => m.frequencia);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(963);
    });
  });

  // ─── getAllPlanets ─────────────────────────────────────────────────────────

  describe('getAllPlanets', () => {
    it('returns array of planet names', () => {
      const result = getAllPlanets();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('contains all 7 classical planets', () => {
      const result = getAllPlanets();
      expect(result).toContain('Sol');
      expect(result).toContain('Lua');
      expect(result).toContain('Marte');
      expect(result).toContain('Mercurio');
      expect(result).toContain('Jupiter');
      expect(result).toContain('Venus');
      expect(result).toContain('Saturno');
    });

    it('has 7 elements', () => {
      const result = getAllPlanets();
      expect(result).toHaveLength(7);
    });
  });

  // ─── hasPlanetFrequency ────────────────────────────────────────────────────

  describe('hasPlanetFrequency', () => {
    it('returns true for Sol', () => {
      expect(hasPlanetFrequency('Sol')).toBe(true);
    });

    it('returns true for Lua', () => {
      expect(hasPlanetFrequency('Lua')).toBe(true);
    });

    it('returns true for Marte', () => {
      expect(hasPlanetFrequency('Marte')).toBe(true);
    });

    it('returns true for Mercurio', () => {
      expect(hasPlanetFrequency('Mercurio')).toBe(true);
    });

    it('returns true for Jupiter', () => {
      expect(hasPlanetFrequency('Jupiter')).toBe(true);
    });

    it('returns true for Venus', () => {
      expect(hasPlanetFrequency('Venus')).toBe(true);
    });

    it('returns true for Saturno', () => {
      expect(hasPlanetFrequency('Saturno')).toBe(true);
    });

    it('returns false for unknown planet', () => {
      expect(hasPlanetFrequency('Plutão')).toBe(false);
      expect(hasPlanetFrequency('Netuno')).toBe(false);
      expect(hasPlanetFrequency('Urano')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasPlanetFrequency('')).toBe(false);
    });
  });

  // ─── getFrequenciesByElement ───────────────────────────────────────────────

  describe('getFrequenciesByElement', () => {
    it('returns 2 mappings for Fogo (Sol, Marte)', () => {
      const result = getFrequenciesByElement('Fogo');
      expect(result).toHaveLength(2);
      const planets = result.map(m => m.planeta);
      expect(planets).toContain('Sol');
      expect(planets).toContain('Marte');
    });

    it('returns 1 mapping for Água (Lua)', () => {
      const result = getFrequenciesByElement('Água');
      expect(result).toHaveLength(1);
      expect(result[0]?.planeta).toBe('Lua');
    });

    it('returns 2 mappings for Ar (Mercurio, Jupiter)', () => {
      const result = getFrequenciesByElement('Ar');
      expect(result).toHaveLength(2);
      const planets = result.map(m => m.planeta);
      expect(planets).toContain('Mercúrio');
      expect(planets).toContain('Júpiter');
    });

    it('returns 2 mappings for Terra (Venus, Saturno)', () => {
      const result = getFrequenciesByElement('Terra');
      expect(result).toHaveLength(2);
      const planets = result.map(m => m.planeta);
      expect(planets).toContain('Vênus');
      expect(planets).toContain('Saturno');
    });

    it('is case insensitive', () => {
      expect(getFrequenciesByElement('fogo')).toHaveLength(2);
      expect(getFrequenciesByElement('FOGO')).toHaveLength(2);
      expect(getFrequenciesByElement('Água')).toHaveLength(1);
    });

    it('returns empty array for unknown element', () => {
      expect(getFrequenciesByElement('Éter')).toHaveLength(0);
      expect(getFrequenciesByElement('FogoTerra')).toHaveLength(0);
    });
  });

  // ─── getPlanetByFrequency ─────────────────────────────────────────────────

  describe('getPlanetByFrequency', () => {
    it('returns Sol for 528', () => {
      expect(getPlanetByFrequency(528)).toBe('Sol');
    });

    it('returns Lua for 417', () => {
      expect(getPlanetByFrequency(417)).toBe('Lua');
    });

    it('returns null for unknown frequency', () => {
      expect(getPlanetByFrequency(432)).toBeNull();
    });
  });

  // ─── getAllFrequencies ───────────────────────────────────────────────────

  describe('getAllFrequencies', () => {
    it('returns array of frequencies sorted in ascending order', () => {
      const result = getAllFrequencies();
      expect(result).toEqual([396, 417, 528, 639, 741, 852, 963]);
    });

    it('has 7 unique frequencies', () => {
      const result = getAllFrequencies();
      expect(result).toHaveLength(7);
    });
  });

  // ─── PLANET_FREQUENCY_MAPPINGS constant ────────────────────────────────────

  describe('PLANET_FREQUENCY_MAPPINGS', () => {
    it('is defined and frozen', () => {
      expect(PLANET_FREQUENCY_MAPPINGS).toBeDefined();
      expect(Object.isFrozen(PLANET_FREQUENCY_MAPPINGS)).toBe(true);
    });

    it('has 7 planet keys', () => {
      expect(Object.keys(PLANET_FREQUENCY_MAPPINGS)).toHaveLength(7);
    });

    it('all values are frozen', () => {
      Object.values(PLANET_FREQUENCY_MAPPINGS).forEach(mapping => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });
  });

  // ─── Interface completeness ──────────────────────────────────────────────

  describe('PlanetFrequencyMapping interface completeness', () => {
    it('all mappings have required fields', () => {
      const mappings = getAllPlanetFrequencies();
      mappings.forEach(mapping => {
        expect(typeof mapping.planeta).toBe('string');
        expect(typeof mapping.frequencia).toBe('number');
        expect(typeof mapping.elemento_conexao).toBe('string');
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(typeof mapping.chakra).toBe('string');
        expect(typeof mapping.orixa).toBe('string');
        expect(typeof mapping.sephirah).toBe('string');
      });
    });

    it('frequencies are valid Solfeggio frequencies', () => {
      const mappings = getAllPlanetFrequencies();
      const validSolfeggio = [396, 417, 528, 639, 741, 852, 963];
      mappings.forEach(mapping => {
        expect(validSolfeggio).toContain(mapping.frequencia);
      });
    });
  });

  // ─── Planet distribution ─────────────────────────────────────────────────

  describe('Planet distribution', () => {
    it('maps all 7 classical planets', () => {
      const planets = getAllPlanets();
      expect(planets).toContain('Sol');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Marte');
      expect(planets).toContain('Mercurio');
      expect(planets).toContain('Jupiter');
      expect(planets).toContain('Venus');
      expect(planets).toContain('Saturno');
    });

    it('distributes planets across 4 elements', () => {
      const fireCount = getFrequenciesByElement('Fogo').length;
      const waterCount = getFrequenciesByElement('Água').length;
      const airCount = getFrequenciesByElement('Ar').length;
      const earthCount = getFrequenciesByElement('Terra').length;
      
      expect(fireCount).toBe(2);
      expect(waterCount).toBe(1);
      expect(airCount).toBe(2);
      expect(earthCount).toBe(2);
    });
  });

  // ─── Default export ──────────────────────────────────────────────────────

  describe('default export', () => {
    it('exports all required functions', async () => {
      const mod = await import('@/lib/correlation/planet-frequency');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default.getPlanetFrequency).toBe('function');
      expect(typeof mod.default.getFrequencyPlanet).toBe('function');
      expect(typeof mod.default.getAllPlanetFrequencies).toBe('function');
    });
  });
});