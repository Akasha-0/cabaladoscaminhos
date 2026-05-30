/**
 * Orixá-Sephirot Spiritual Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaSephirot,
  getSephirotOrixa,
  getAllOrixaSephiroths,
  ORIXÁ_SEPHIROT_MAPPINGS,
  type OrixáSephirot,
} from '@/lib/correlation/orixa-sephirot';

describe('orixa-sephirot', () => {
  // ─── getOrixaSephirot: valid Orixás ─────────────────────────────────────

  describe('getOrixaSephirot', () => {
    it('returns Oxalá mapping with Kether', () => {
      const result = getOrixaSephirot('Oxalá');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Oxalá');
      expect(result!.sephirah).toBe('Kether');
      expect(result!.elemento).toBe('Éter');
      expect(result!.numero_caminho).toBe(1);
    });

    it('returns Obatalá mapping with Chokmah', () => {
      const result = getOrixaSephirot('Obatalá');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Obatalá');
      expect(result!.sephirah).toBe('Chokmah');
      expect(result!.elemento).toBe('Éter');
      expect(result!.numero_caminho).toBe(2);
    });

    it('returns Iemanjá mapping with Binah', () => {
      const result = getOrixaSephirot('Iemanjá');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Iemanjá');
      expect(result!.sephirah).toBe('Binah');
      expect(result!.elemento).toBe('Água');
      expect(result!.numero_caminho).toBe(3);
    });

    it('returns Oxum mapping with Chesed', () => {
      const result = getOrixaSephirot('Oxum');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Oxum');
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.elemento).toBe('Água');
      expect(result!.numero_caminho).toBe(4);
    });

    it('returns Xangô mapping with Geburah', () => {
      const result = getOrixaSephirot('Xangô');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Xangô');
      expect(result!.sephirah).toBe('Geburah');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.numero_caminho).toBe(5);
    });

    it('returns Oxóssi mapping with Tiphereth', () => {
      const result = getOrixaSephirot('Oxóssi');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Oxóssi');
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.numero_caminho).toBe(6);
    });

    it('returns Iansã mapping with Netzach', () => {
      const result = getOrixaSephirot('Iansã');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Iansã');
      expect(result!.sephirah).toBe('Netzach');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.numero_caminho).toBe(7);
    });

    it('returns Ogum mapping with Hod', () => {
      const result = getOrixaSephirot('Ogum');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Ogum');
      expect(result!.sephirah).toBe('Hod');
      expect(result!.elemento).toBe('Ar');
      expect(result!.numero_caminho).toBe(8);
    });

    it('returns Nanã mapping with Yesod', () => {
      const result = getOrixaSephirot('Nanã');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Nanã');
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.elemento).toBe('Água');
      expect(result!.numero_caminho).toBe(9);
    });

    it('returns Omolu mapping with Malkuth', () => {
      const result = getOrixaSephirot('Omolu');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Omolu');
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.elemento).toBe('Terra');
      expect(result!.numero_caminho).toBe(10);
    });

    it('returns null for unknown Orixá', () => {
      expect(getOrixaSephirot('UnknownOrixá')).toBeNull();
      expect(getOrixaSephirot('Exu')).toBeNull();
      expect(getOrixaSephirot('')).toBeNull();
    });

    it('is case-sensitive for Orixá names', () => {
      expect(getOrixaSephirot('oxalá')).toBeNull();
      expect(getOrixaSephirot('OXALÁ')).toBeNull();
      expect(getOrixaSephirot('Oxalá')).not.toBeNull();
    });
  });

  // ─── getSephirotOrixa: reverse lookup ─────────────────────────────────────

  describe('getSephirotOrixa', () => {
    it('returns Kether mapping for Oxalá', () => {
      const result = getSephirotOrixa('Kether');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
      expect(result!.orixá).toBe('Oxalá');
      expect(result!.numero_caminho).toBe(1);
    });

    it('returns Binah mapping for Iemanjá', () => {
      const result = getSephirotOrixa('Binah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Binah');
      expect(result!.orixá).toBe('Iemanjá');
      expect(result!.numero_caminho).toBe(3);
    });

    it('returns Geburah mapping for Xangô', () => {
      const result = getSephirotOrixa('Geburah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Geburah');
      expect(result!.orixá).toBe('Xangô');
      expect(result!.numero_caminho).toBe(5);
    });

    it('returns Malkuth mapping for Omolu', () => {
      const result = getSephirotOrixa('Malkuth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.orixá).toBe('Omolu');
      expect(result!.numero_caminho).toBe(10);
    });

    it('is case-insensitive for Sephirah names', () => {
      expect(getSephirotOrixa('kether')).not.toBeNull();
      expect(getSephirotOrixa('KETHER')).not.toBeNull();
      expect(getSephirotOrixa('Binah')).not.toBeNull();
    });

    it('returns null for unknown Sephirah', () => {
      expect(getSephirotOrixa('UnknownSephirah')).toBeNull();
      expect(getSephirotOrixa('TestSephirah')).toBeNull();
      expect(getSephirotOrixa('')).toBeNull();
    });
  });

  // ─── getAllOrixaSephiroths ─────────────────────────────────────────────────

  describe('getAllOrixaSephiroths', () => {
    it('returns all 10 Orixá mappings', () => {
      const result = getAllOrixaSephiroths();
      expect(result).toHaveLength(10);
    });

    it('returns sorted by path number (1-10)', () => {
      const result = getAllOrixaSephiroths();
      const numbers = result.map((m) => m.numero_caminho);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('contains all required properties for each mapping', () => {
      const result = getAllOrixaSephiroths();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('orixá');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('energia_espiritual');
      }
    });

    it('contains all 10 Orixá names', () => {
      const result = getAllOrixaSephiroths();
      const orixas = result.map((m) => m.orixá);
      expect(orixas).toContain('Oxalá');
      expect(orixas).toContain('Obatalá');
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Iansã');
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Nanã');
      expect(orixas).toContain('Omolu');
    });

    it('contains all expected Sephiroth', () => {
      const result = getAllOrixaSephiroths();
      const sephiroth = result.map((m) => m.sephirah);
      expect(sephiroth).toContain('Kether');
      expect(sephiroth).toContain('Chokmah');
      expect(sephiroth).toContain('Binah');
      expect(sephiroth).toContain('Chesed');
      expect(sephiroth).toContain('Geburah');
      expect(sephiroth).toContain('Tiphereth');
      expect(sephiroth).toContain('Netzach');
      expect(sephiroth).toContain('Hod');
      expect(sephiroth).toContain('Yesod');
      expect(sephiroth).toContain('Malkuth');
    });
  });

  // ─── ORIXÁ_SEPHIROT_MAPPINGS constant ─────────────────────────────────────

  describe('ORIXÁ_SEPHIROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(ORIXÁ_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('has exactly 10 entries', () => {
      expect(Object.keys(ORIXÁ_SEPHIROT_MAPPINGS)).toHaveLength(10);
    });

    it('contains all 10 Orixá keys', () => {
      const keys = Object.keys(ORIXÁ_SEPHIROT_MAPPINGS);
      expect(keys).toContain('Oxalá');
      expect(keys).toContain('Obatalá');
      expect(keys).toContain('Iemanjá');
      expect(keys).toContain('Oxum');
      expect(keys).toContain('Xangô');
      expect(keys).toContain('Oxóssi');
      expect(keys).toContain('Iansã');
      expect(keys).toContain('Ogum');
      expect(keys).toContain('Nanã');
      expect(keys).toContain('Omolu');
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────

  describe('OrixáSephirot interface completeness', () => {
    it('returns complete mapping objects with all fields', () => {
      const result = getOrixaSephirot('Oxalá');
      expect(result).toEqual({
        orixá: 'Oxalá',
        sephirah: 'Kether',
        elemento: 'Éter',
        numero_caminho: 1,
        energia_espiritual: 'Pureza Primordial / Criação Divina / Aláà / Pai dos Orixás',
      });
    });

    it('each mapping has non-empty energia_espiritual', () => {
      const all = getAllOrixaSephiroths();
      for (const mapping of all) {
        expect(mapping.energia_espiritual.length).toBeGreaterThan(0);
      }
    });

    it('each mapping has valid element types', () => {
      const validElements = ['Fogo', 'Terra', 'Ar', 'Água', 'Éter'];
      const all = getAllOrixaSephiroths();
      for (const mapping of all) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  // ─── Element distribution ────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('maps correct element distribution', () => {
      const all = getAllOrixaSephiroths();
      const etherMappings = all.filter((m) => m.elemento === 'Éter');
      const fireMappings = all.filter((m) => m.elemento === 'Fogo');
      const waterMappings = all.filter((m) => m.elemento === 'Água');
      const earthMappings = all.filter((m) => m.elemento === 'Terra');
      const airMappings = all.filter((m) => m.elemento === 'Ar');
      expect(etherMappings).toHaveLength(2);
      expect(fireMappings).toHaveLength(3);
      expect(waterMappings).toHaveLength(3);
      expect(earthMappings).toHaveLength(1);
      expect(airMappings).toHaveLength(1);
    });

    it('Éter maps to Oxalá and Obatalá', () => {
      const etherMappings = getAllOrixaSephiroths().filter((m) => m.elemento === 'Éter');
      const orixas = etherMappings.map((m) => m.orixá).sort();
      expect(orixas).toEqual(['Obatalá', 'Oxalá']);
    });

    it('Fogo maps to Xangô, Oxóssi, and Iansã', () => {
      const fireMappings = getAllOrixaSephiroths().filter((m) => m.elemento === 'Fogo');
      const orixas = fireMappings.map((m) => m.orixá).sort();
      expect(orixas).toEqual(['Iansã', 'Oxóssi', 'Xangô']);
    });

    it('Água maps to Iemanjá, Oxum, and Nanã', () => {
      const waterMappings = getAllOrixaSephiroths().filter((m) => m.elemento === 'Água');
      const orixas = waterMappings.map((m) => m.orixá).sort();
      expect(orixas).toEqual(['Iemanjá', 'Nanã', 'Oxum']);
    });

    it('Terra maps to Omolu', () => {
      const earthMappings = getAllOrixaSephiroths().filter((m) => m.elemento === 'Terra');
      expect(earthMappings).toHaveLength(1);
      expect(earthMappings[0].orixá).toBe('Omolu');
    });

    it('Ar maps to Ogum', () => {
      const airMappings = getAllOrixaSephiroths().filter((m) => m.elemento === 'Ar');
      expect(airMappings).toHaveLength(1);
      expect(airMappings[0].orixá).toBe('Ogum');
    });
  });

  // ─── Path number verification ────────────────────────────────────────────

  describe('Path number verification', () => {
    it('each Orixá has a unique path number 1-10', () => {
      const all = getAllOrixaSephiroths();
      const pathNumbers = all.map((m) => m.numero_caminho);
      expect(pathNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('path 1 is Oxalá-Kether (Éter)', () => {
      const result = getOrixaSephirot('Oxalá');
      expect(result!.numero_caminho).toBe(1);
      expect(result!.sephirah).toBe('Kether');
      expect(result!.elemento).toBe('Éter');
    });

    it('path 10 is Omolu-Malkuth (Terra)', () => {
      const result = getOrixaSephirot('Omolu');
      expect(result!.numero_caminho).toBe(10);
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.elemento).toBe('Terra');
    });
  });

  // ─── Consistency between forward and reverse lookups ─────────────────────

  describe('Forward/reverse lookup consistency', () => {
    it('forward and reverse lookups return consistent data', () => {
      const all = getAllOrixaSephiroths();
      for (const mapping of all) {
        const byOrixá = getOrixaSephirot(mapping.orixá);
        const bySephirah = getSephirotOrixa(mapping.sephirah);
        expect(byOrixá).toEqual(bySephirah);
        expect(byOrixá!.orixá).toBe(mapping.orixá);
        expect(byOrixá!.sephirah).toBe(mapping.sephirah);
      }
    });

    it('all Sephiroth can be found via reverse lookup', () => {
      const sephiroth = ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];
      for (const sephirah of sephiroth) {
        const result = getSephirotOrixa(sephirah);
        expect(result).not.toBeNull();
      }
    });
  });
});