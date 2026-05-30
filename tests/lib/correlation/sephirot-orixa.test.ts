/**
 * Sephirot-Orixá Spiritual Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getSephirotOrixá,
  getOrixáSephirot,
  getAllSephirotOrixás,
  SEPHIROT_ORIXÁ_MAPPINGS,
  type SephirotOrixá,
} from '@/lib/correlation/sephirot-orixa';

describe('sephirot-orixa', () => {
  // ─── getSephirotOrixá: valid Sephiroth ─────────────────────────────────────

  describe('getSephirotOrixá', () => {
    it('returns Kether mapping with Oxalá', () => {
      const result = getSephirotOrixá('Kether');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
      expect(result!.orixá).toBe('Oxalá');
      expect(result!.elemento).toBe('Éter');
      expect(result!.numero_caminho).toBe(1);
    });

    it('returns Chokmah mapping with Obatalá', () => {
      const result = getSephirotOrixá('Chokmah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chokmah');
      expect(result!.orixá).toBe('Obatalá');
      expect(result!.elemento).toBe('Éter');
      expect(result!.numero_caminho).toBe(2);
    });

    it('returns Binah mapping with Iemanjá', () => {
      const result = getSephirotOrixá('Binah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Binah');
      expect(result!.orixá).toBe('Iemanjá');
      expect(result!.elemento).toBe('Água');
      expect(result!.numero_caminho).toBe(3);
    });

    it('returns Chesed mapping with Oxum', () => {
      const result = getSephirotOrixá('Chesed');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.orixá).toBe('Oxum');
      expect(result!.elemento).toBe('Água');
      expect(result!.numero_caminho).toBe(4);
    });

    it('returns Geburah mapping with Xangô', () => {
      const result = getSephirotOrixá('Geburah');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Geburah');
      expect(result!.orixá).toBe('Xangô');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.numero_caminho).toBe(5);
    });

    it('returns Tiphereth mapping with Oxóssi', () => {
      const result = getSephirotOrixá('Tiphereth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.orixá).toBe('Oxóssi');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.numero_caminho).toBe(6);
    });

    it('returns Netzach mapping with Iansã', () => {
      const result = getSephirotOrixá('Netzach');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Netzach');
      expect(result!.orixá).toBe('Iansã');
      expect(result!.elemento).toBe('Fogo');
      expect(result!.numero_caminho).toBe(7);
    });

    it('returns Hod mapping with Ogum', () => {
      const result = getSephirotOrixá('Hod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Hod');
      expect(result!.orixá).toBe('Ogum');
      expect(result!.elemento).toBe('Ar');
      expect(result!.numero_caminho).toBe(8);
    });

    it('returns Yesod mapping with Nanã', () => {
      const result = getSephirotOrixá('Yesod');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.orixá).toBe('Nanã');
      expect(result!.elemento).toBe('Água');
      expect(result!.numero_caminho).toBe(9);
    });

    it('returns Malkuth mapping with Omolu', () => {
      const result = getSephirotOrixá('Malkuth');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.orixá).toBe('Omolu');
      expect(result!.elemento).toBe('Terra');
      expect(result!.numero_caminho).toBe(10);
    });

    it('returns null for unknown Sephirah', () => {
      expect(getSephirotOrixá('UnknownSephirah')).toBeNull();
      expect(getSephirotOrixá('TestSephirah')).toBeNull();
      expect(getSephirotOrixá('')).toBeNull();
    });

    it('is case-sensitive for Sephirah names', () => {
      expect(getSephirotOrixá('kether')).toBeNull();
      expect(getSephirotOrixá('KETHER')).toBeNull();
      expect(getSephirotOrixá('Malkuth')).not.toBeNull();
    });
  });

  // ─── getOrixáSephirot: reverse lookup ─────────────────────────────────────

  describe('getOrixáSephirot', () => {
    it('returns Oxalá mapping for Kether', () => {
      const result = getOrixáSephirot('Oxalá');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Oxalá');
      expect(result!.sephirah).toBe('Kether');
      expect(result!.numero_caminho).toBe(1);
    });

    it('returns Iemanjá mapping for Binah', () => {
      const result = getOrixáSephirot('Iemanjá');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Iemanjá');
      expect(result!.sephirah).toBe('Binah');
      expect(result!.numero_caminho).toBe(3);
    });

    it('returns Xangô mapping for Geburah', () => {
      const result = getOrixáSephirot('Xangô');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Xangô');
      expect(result!.sephirah).toBe('Geburah');
      expect(result!.numero_caminho).toBe(5);
    });

    it('returns Omolu mapping for Malkuth', () => {
      const result = getOrixáSephirot('Omolu');
      expect(result).not.toBeNull();
      expect(result!.orixá).toBe('Omolu');
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.numero_caminho).toBe(10);
    });

    it('is case-insensitive for Orixá names', () => {
      expect(getOrixáSephirot('oxalá')).not.toBeNull();
      expect(getOrixáSephirot('OXALÁ')).not.toBeNull();
      expect(getOrixáSephirot('Iemanjá')).not.toBeNull();
    });

    it('returns null for unknown Orixá', () => {
      expect(getOrixáSephirot('UnknownOrixá')).toBeNull();
      expect(getOrixáSephirot('Exu')).toBeNull();
      expect(getOrixáSephirot('')).toBeNull();
    });
  });

  // ─── getAllSephirotOrixás ─────────────────────────────────────────────────

  describe('getAllSephirotOrixás', () => {
    it('returns all 10 Sephiroth mappings', () => {
      const result = getAllSephirotOrixás();
      expect(result).toHaveLength(10);
    });

    it('returns sorted by path number (1-10)', () => {
      const result = getAllSephirotOrixás();
      const numbers = result.map((m) => m.numero_caminho);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('contains all required properties for each mapping', () => {
      const result = getAllSephirotOrixás();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('orixá');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('energia_espiritual');
      }
    });

    it('contains all 10 Sephiroth names', () => {
      const result = getAllSephirotOrixás();
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

    it('contains all expected Orixás', () => {
      const result = getAllSephirotOrixás();
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
  });

  // ─── SEPHIROT_ORIXÁ_MAPPINGS constant ─────────────────────────────────────

  describe('SEPHIROT_ORIXÁ_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(SEPHIROT_ORIXÁ_MAPPINGS)).toBe(true);
    });

    it('has exactly 10 entries', () => {
      expect(Object.keys(SEPHIROT_ORIXÁ_MAPPINGS)).toHaveLength(10);
    });

    it('contains all 10 Sephiroth keys', () => {
      const keys = Object.keys(SEPHIROT_ORIXÁ_MAPPINGS);
      expect(keys).toContain('Kether');
      expect(keys).toContain('Chokmah');
      expect(keys).toContain('Binah');
      expect(keys).toContain('Chesed');
      expect(keys).toContain('Geburah');
      expect(keys).toContain('Tiphereth');
      expect(keys).toContain('Netzach');
      expect(keys).toContain('Hod');
      expect(keys).toContain('Yesod');
      expect(keys).toContain('Malkuth');
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────

  describe('SephirotOrixá interface completeness', () => {
    it('returns complete mapping objects with all fields', () => {
      const result = getSephirotOrixá('Kether');
      expect(result).toEqual({
        sephirah: 'Kether',
        orixá: 'Oxalá',
        elemento: 'Éter',
        numero_caminho: 1,
        energia_espiritual: 'Pureza Primordial / Criação Divina / Aláà / Pai dos Orixás',
      });
    });

    it('each mapping has non-empty energia_espiritual', () => {
      const all = getAllSephirotOrixás();
      for (const mapping of all) {
        expect(mapping.energia_espiritual.length).toBeGreaterThan(0);
      }
    });

    it('each mapping has valid element types', () => {
      const validElements = ['Fogo', 'Terra', 'Ar', 'Água', 'Éter'];
      const all = getAllSephirotOrixás();
      for (const mapping of all) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  // ─── Element distribution ────────────────────────────────────────────────
  describe('Element distribution', () => {
    it('maps correct element distribution', () => {
      const all = getAllSephirotOrixás();
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

    it('Éter maps to Kether and Chokmah', () => {
      const etherMappings = getAllSephirotOrixás().filter((m) => m.elemento === 'Éter');
      const sephiroth = etherMappings.map((m) => m.sephirah).sort();
      expect(sephiroth).toEqual(['Chokmah', 'Kether']);
    });

    it('Fogo maps to Geburah, Tiphereth, and Netzach', () => {
      const fireMappings = getAllSephirotOrixás().filter((m) => m.elemento === 'Fogo');
      const sephiroth = fireMappings.map((m) => m.sephirah).sort();
      expect(sephiroth).toEqual(['Geburah', 'Netzach', 'Tiphereth']);
    });

    it('Água maps to Binah, Chesed, Yesod', () => {
      const waterMappings = getAllSephirotOrixás().filter((m) => m.elemento === 'Água');
      const sephiroth = waterMappings.map((m) => m.sephirah).sort();
      expect(sephiroth).toEqual(['Binah', 'Chesed', 'Yesod']);
    });

    it('Terra maps to Malkuth', () => {
      const earthMappings = getAllSephirotOrixás().filter((m) => m.elemento === 'Terra');
      expect(earthMappings).toHaveLength(1);
      expect(earthMappings[0].sephirah).toBe('Malkuth');
    });

    it('Ar maps to Hod', () => {
      const airMappings = getAllSephirotOrixás().filter((m) => m.elemento === 'Ar');
      expect(airMappings).toHaveLength(1);
      expect(airMappings[0].sephirah).toBe('Hod');
    });
  });

  // ─── Path number verification ────────────────────────────────────────────

  describe('Path number verification', () => {
    it('Kether has path number 1', () => {
      const result = getSephirotOrixá('Kether');
      expect(result!.numero_caminho).toBe(1);
    });

    it('Chokmah has path number 2', () => {
      const result = getSephirotOrixá('Chokmah');
      expect(result!.numero_caminho).toBe(2);
    });

    it('Binah has path number 3', () => {
      const result = getSephirotOrixá('Binah');
      expect(result!.numero_caminho).toBe(3);
    });

    it('Chesed has path number 4', () => {
      const result = getSephirotOrixá('Chesed');
      expect(result!.numero_caminho).toBe(4);
    });

    it('Geburah has path number 5', () => {
      const result = getSephirotOrixá('Geburah');
      expect(result!.numero_caminho).toBe(5);
    });

    it('Tiphereth has path number 6', () => {
      const result = getSephirotOrixá('Tiphereth');
      expect(result!.numero_caminho).toBe(6);
    });

    it('Netzach has path number 7', () => {
      const result = getSephirotOrixá('Netzach');
      expect(result!.numero_caminho).toBe(7);
    });

    it('Hod has path number 8', () => {
      const result = getSephirotOrixá('Hod');
      expect(result!.numero_caminho).toBe(8);
    });

    it('Yesod has path number 9', () => {
      const result = getSephirotOrixá('Yesod');
      expect(result!.numero_caminho).toBe(9);
    });

    it('Malkuth has path number 10', () => {
      const result = getSephirotOrixá('Malkuth');
      expect(result!.numero_caminho).toBe(10);
    });
  });

  // ─── Consistency between forward and reverse lookups ─────────────────────

  describe('Forward/reverse lookup consistency', () => {
    it('getSephirotOrixá and getOrixáSephirot are inverse operations', () => {
      const all = getAllSephirotOrixás();
      for (const mapping of all) {
        const forward = getSephirotOrixá(mapping.sephirah);
        const reverse = getOrixáSephirot(mapping.orixá);
        
        expect(forward).toEqual(reverse);
      }
    });

    it('each Sephirah maps to exactly one Orixá', () => {
      const sephirothCounts: Record<string, number> = {};
      for (const mapping of getAllSephirotOrixás()) {
        sephirothCounts[mapping.sephirah] = (sephirothCounts[mapping.sephirah] || 0) + 1;
      }
      for (const count of Object.values(sephirothCounts)) {
        expect(count).toBe(1);
      }
    });

    it('each Orixá maps to exactly one Sephirah', () => {
      const orixaCounts: Record<string, number> = {};
      for (const mapping of getAllSephirotOrixás()) {
        orixaCounts[mapping.orixá] = (orixaCounts[mapping.orixá] || 0) + 1;
      }
      for (const count of Object.values(orixaCounts)) {
        expect(count).toBe(1);
      }
    });
  });
});