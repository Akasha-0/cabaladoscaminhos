import { describe, it, expect } from 'vitest';
import {
  getSephirotOrixa,
  getOrixaSephirot,
  getAllSephirotOrixas,
  getAllSephiroth,
  hasSephirotOrixa,
  getSephirotByPath,
  getAllOrixas,
  getOrixaBySephirah,
  getSephirahByOrixa,
  getSephirotOrixaByElement,
  getSephirotOrixaByDay,
  SEPHIROT_ORIXA_MAPPINGS,
  type SephirotOrixa,
} from '@/lib/correlation/sephirot-orixa';

describe('sephirot-orixa', () => {
  // ─── getSephirotOrixa: valid Sephiroth ───────────────────────────────────────

  describe('getSephirotOrixa', () => {
    it('should return correlation for Kether', () => {
      const result = getSephirotOrixa('Kether');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Kether');
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.numero_caminho).toBe(1);
      expect(result?.elemento).toBe('Éter');
    });

    it('should return correlation for Chokmah', () => {
      const result = getSephirotOrixa('Chokmah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.orixa).toBe('Oxumaré');
      expect(result?.numero_caminho).toBe(2);
    });

    it('should return correlation for Binah', () => {
      const result = getSephirotOrixa('Binah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Binah');
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.numero_caminho).toBe(3);
      expect(result?.elemento).toBe('Água');
    });

    it('should return correlation for Chesed', () => {
      const result = getSephirotOrixa('Chesed');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.numero_caminho).toBe(4);
    });

    it('should return correlation for Geburah', () => {
      const result = getSephirotOrixa('Geburah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.orixa).toBe('Iansã');
      expect(result?.numero_caminho).toBe(5);
      expect(result?.elemento).toBe('Fogo');
    });

    it('should return correlation for Tiphereth', () => {
      const result = getSephirotOrixa('Tiphereth');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.orixa).toBe('Xangô');
      expect(result?.numero_caminho).toBe(6);
    });

    it('should return correlation for Netzach', () => {
      const result = getSephirotOrixa('Netzach');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.orixa).toBe('Xangô');
      expect(result?.numero_caminho).toBe(7);
    });

    it('should return correlation for Hod', () => {
      const result = getSephirotOrixa('Hod');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Hod');
      expect(result?.orixa).toBe('Ogum');
      expect(result?.numero_caminho).toBe(8);
    });

    it('should return correlation for Yesod', () => {
      const result = getSephirotOrixa('Yesod');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.numero_caminho).toBe(9);
    });

    it('should return correlation for Malkuth', () => {
      const result = getSephirotOrixa('Malkuth');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.orixa).toBe('Omolu');
      expect(result?.numero_caminho).toBe(10);
      expect(result?.elemento).toBe('Terra');
    });

    it('should return null for invalid Sephirah', () => {
      const result = getSephirotOrixa('InvalidSephirah');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getSephirotOrixa('');
      expect(result).toBeNull();
    });

    it('should return null for undefined-like input', () => {
      const result = getSephirotOrixa('Daath');
      expect(result).toBeNull();
    });
  });

  // ─── getOrixaSephirot ───────────────────────────────────────────────────────

  describe('getOrixaSephirot', () => {
    it('should return reverse mapping with Oxalá to Kether', () => {
      const result = getOrixaSephirot();
      expect(result['Oxalá']).toBe('Kether');
    });

    it('should map Iemanjá to Binah', () => {
      const result = getOrixaSephirot();
      expect(result['Iemanjá']).toBe('Binah');
    });

    it('should map Xangô to Tiphereth (primary)', () => {
      const result = getOrixaSephirot();
      expect(result['Xangô']).toBe('Tiphereth');
    });

    it('should map secondary orixás to their sephirot', () => {
      const result = getOrixaSephirot();
      expect(result['Ori']).toBe('Kether');
      expect(result['Ossaim']).toBe('Chokmah');
      expect(result['Oxum']).toBe('Binah');
      expect(result['Nanã']).toBe('Chesed');
      expect(result['Ogum']).toBe('Geburah');
      expect(result['Logun Edé']).toBe('Tiphereth');
      expect(result['Nanã']).toBe('Malkuth');
    });

    it('should return an object with all primary mappings', () => {
      const result = getOrixaSephirot();
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(10);
    });
  });

  // ─── getAllSephirotOrixas ───────────────────────────────────────────────────

  describe('getAllSephirotOrixas', () => {
    it('should return array of all 10 mappings', () => {
      const result = getAllSephirotOrixas();
      expect(result).toHaveLength(10);
    });

    it('should contain all Sephiroth', () => {
      const result = getAllSephirotOrixas();
      const sephiroth = result.map(m => m.sephirah);
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

    it('should have correct path numbers 1-10', () => {
      const result = getAllSephirotOrixas();
      const paths = result.map(m => m.numero_caminho).sort((a, b) => a - b);
      expect(paths).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should have significado_espiritual for all entries', () => {
      const result = getAllSephirotOrixas();
      for (const mapping of result) {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      }
    });
  });

  // ─── getAllSephiroth ──────────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('should return array of 10 Sephirah names', () => {
      const result = getAllSephiroth();
      expect(result).toHaveLength(10);
    });

    it('should contain all standard Sephiroth names', () => {
      const result = getAllSephiroth();
      expect(result).toContain('Kether');
      expect(result).toContain('Malkuth');
    });
  });

  // ─── hasSephirotOrixa ───────────────────────────────────────────────────────

  describe('hasSephirotOrixa', () => {
    it('should return true for valid Sephiroth', () => {
      expect(hasSephirotOrixa('Kether')).toBe(true);
      expect(hasSephirotOrixa('Malkuth')).toBe(true);
    });

    it('should return false for invalid Sephiroth', () => {
      expect(hasSephirotOrixa('Invalid')).toBe(false);
      expect(hasSephirotOrixa('')).toBe(false);
    });
  });

  // ─── getSephirotByPath ─────────────────────────────────────────────────────

  describe('getSephirotByPath', () => {
    it('should return Kether for path 1', () => {
      const result = getSephirotByPath(1);
      expect(result?.sephirah).toBe('Kether');
    });

    it('should return Malkuth for path 10', () => {
      const result = getSephirotByPath(10);
      expect(result?.sephirah).toBe('Malkuth');
    });

    it('should return null for invalid path', () => {
      expect(getSephirotByPath(0)).toBeNull();
      expect(getSephirotByPath(11)).toBeNull();
      expect(getSephirotByPath(-1)).toBeNull();
    });
  });

  // ─── getAllOrixas ────────────────────────────────────────────────────────────

  describe('getAllOrixas', () => {
    it('should return array of unique Orixá names', () => {
      const result = getAllOrixas();
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Oxalá');
      expect(result).toContain('Iemanjá');
      expect(result).toContain('Xangô');
    });

    it('should return sorted array', () => {
      const result = getAllOrixas();
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });
  });

  // ─── getOrixaBySephirah ──────────────────────────────────────────────────────

  describe('getOrixaBySephirah', () => {
    it('should return Oxalá for Kether', () => {
      expect(getOrixaBySephirah('Kether')).toBe('Oxalá');
    });

    it('should return Iemanjá for Binah', () => {
      expect(getOrixaBySephirah('Binah')).toBe('Iemanjá');
    });

    it('should return null for invalid Sephirah', () => {
      expect(getOrixaBySephirah('Invalid')).toBeNull();
    });
  });

  // ─── getSephirahByOrixa ──────────────────────────────────────────────────────

  describe('getSephirahByOrixa', () => {
    it('should return Kether for Oxalá', () => {
      expect(getSephirahByOrixa('Oxalá')).toBe('Kether');
    });

    it('should return Binah for Iemanjá', () => {
      expect(getSephirahByOrixa('Iemanjá')).toBe('Binah');
    });

    it('should return null for invalid Orixá', () => {
      expect(getSephirahByOrixa('Invalid')).toBeNull();
    });
  });

  // ─── getSephirotOrixaByElement ───────────────────────────────────────────────

  describe('getSephirotOrixaByElement', () => {
    it('should return mappings for Fogo element', () => {
      const result = getSephirotOrixaByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(m => m.elemento === 'Fogo')).toBe(true);
    });

    it('should return mappings for Água element', () => {
      const result = getSephirotOrixaByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(m => m.elemento === 'Água')).toBe(true);
    });

    it('should return empty array for invalid element', () => {
      const result = getSephirotOrixaByElement('InvalidElement');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getSephirotOrixaByDay ──────────────────────────────────────────────────

  describe('getSephirotOrixaByDay', () => {
    it('should return mappings for Sexta-feira', () => {
      const result = getSephirotOrixaByDay('Sexta-feira');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(m => m.dia_sagrado.includes('Sexta-feira'))).toBe(true);
    });

    it('should return empty array for day with no mappings', () => {
      const result = getSephirotOrixaByDay('InvalidDay');
      expect(result).toHaveLength(0);
    });
  });

  // ─── SEPHIROT_ORIXA_MAPPINGS constant ──────────────────────────────────────

  describe('SEPHIROT_ORIXA_MAPPINGS', () => {
    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(SEPHIROT_ORIXA_MAPPINGS)).toBe(true);
    });

    it('should have all 10 Sephiroth keys', () => {
      const keys = Object.keys(SEPHIROT_ORIXA_MAPPINGS);
      expect(keys).toHaveLength(10);
    });
  });

  // ─── Interface completeness ───────────────────────────────────────────────

  describe('SephirotOrixa interface completeness', () => {
    it('should have all required fields', () => {
      const sample = getSephirotOrixa('Kether');
      expect(sample).toHaveProperty('sephirah');
      expect(sample).toHaveProperty('orixa');
      expect(sample).toHaveProperty('orixa_secundario');
      expect(sample).toHaveProperty('numero_caminho');
      expect(sample).toHaveProperty('elemento');
      expect(sample).toHaveProperty('dia_sagrado');
      expect(sample).toHaveProperty('chakra');
      expect(sample).toHaveProperty('cor');
      expect(sample).toHaveProperty('significado_espiritual');
    });

    it('should have valid elemento values', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      const result = getAllSephirotOrixas();
      for (const mapping of result) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  // ─── Cross-reference consistency ───────────────────────────────────────────

  describe('Cross-reference consistency', () => {
    it('should be consistent between getSephirotOrixa and getOrixaSephirot', () => {
      const orixaSephirot = getOrixaSephirot();
      for (const [sephirah, mapping] of Object.entries(SEPHIROT_ORIXA_MAPPINGS)) {
        expect(orixaSephirot[mapping.orixa]).toBe(sephirah);
      }
    });

    it('should be consistent between getOrixaBySephirah and getSephirahByOrixa', () => {
      const allSephiroth = getAllSephiroth();
      for (const sephirah of allSephiroth) {
        const orixa = getOrixaBySephirah(sephirah);
        if (orixa) {
          expect(getSephirahByOrixa(orixa)).toBe(sephirah);
        }
      }
    });

    it('should have Chakra mappings for all Sephiroth', () => {
      const result = getAllSephirotOrixas();
      for (const mapping of result) {
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra.length).toBeGreaterThan(0);
      }
    });
  });
});