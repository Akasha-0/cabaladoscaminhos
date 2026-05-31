/**
 * Orixá-Sephirah Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaSephirot,
  getSephirotOrixa,
  getAllOrixaSephiroths,
} from '@/lib/correlation/orixa-sephirot';

describe('Orixá-Sephirah Correlation', () => {
  describe('getOrixaSephirot', () => {
    it('should return Oxalá mapping with Kether as Sephirah', () => {
      const result = getOrixaSephirot('Oxalá');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.sephirah).toBe('Kether');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(1);
      expect(result?.sephirot_secundarias).toContain('Chokmah');
    });

    it('should return Iemanjá mapping with Binah as Sephirah', () => {
      const result = getOrixaSephirot('Iemanjá');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.sephirah).toBe('Binah');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(3);
    });

    it('should return Oxum mapping with Tiphereth as Sephirah', () => {
      const result = getOrixaSephirot('Oxum');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxum');
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(6);
    });

    it('should return Ogum mapping with Geburah as Sephirah', () => {
      const result = getOrixaSephirot('Ogum');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Ogum');
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(5);
    });

    it('should return Oxóssi mapping with Chesed as Sephirah', () => {
      const result = getOrixaSephirot('Oxóssi');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(4);
    });

    it('should return Xangô mapping with Tiphereth as Sephirah', () => {
      const result = getOrixaSephirot('Xangô');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Xangô');
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(6);
    });

    it('should return Iansã mapping with Netzach as Sephirah', () => {
      const result = getOrixaSephirot('Iansã');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iansã');
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(7);
    });

    it('should return Omolu mapping with Malkuth as Sephirah', () => {
      const result = getOrixaSephirot('Omolu');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Omolu');
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(10);
    });

    it('should return Nanã mapping with Binah as Sephirah', () => {
      const result = getOrixaSephirot('Nanã');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Nanã');
      expect(result?.sephirah).toBe('Binah');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(3);
    });

    it('should be case-insensitive', () => {
      expect(getOrixaSephirot('oxalá')).toBeDefined();
      expect(getOrixaSephirot('IEMANJÁ')).toBeDefined();
      expect(getOrixaSephirot('  Xangô  ')).toBeDefined();
    });

    it('should return undefined for unknown Orixá', () => {
      expect(getOrixaSephirot('UnknownOrixa')).toBeUndefined();
      expect(getOrixaSephirot('')).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaSephirot('Oxalá');
      
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('sephirah');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('numero_caminho');
      expect(typeof result?.significado_espiritual).toBe('string');
      expect(result?.significado_espiritual.length).toBeGreaterThan(0);
    });

    it('should have non-empty spiritual meaning for each Orixá', () => {
      const allOrixas = getAllOrixaSephiroths();
      allOrixas.forEach(orixa => {
        const result = getOrixaSephirot(orixa.orixa);
        expect(result?.significado_espiritual.length).toBeGreaterThan(10);
      });
    });
  });

  describe('getSephirotOrixa', () => {
    it('should return mapping with Kether connected to Oxalá', () => {
      const result = getSephirotOrixa();
      
      expect(result).toHaveProperty('Kether');
      expect(result.Kether).toContain('Oxalá');
    });

    it('should return mapping with Binah connected to Iemanjá and Nanã', () => {
      const result = getSephirotOrixa();
      
      expect(result).toHaveProperty('Binah');
      expect(result.Binah).toContain('Iemanjá');
      expect(result.Binah).toContain('Nanã');
    });

    it('should return mapping with Tiphereth connected to Oxum and Xangô', () => {
      const result = getSephirotOrixa();
      
      expect(result).toHaveProperty('Tiphereth');
      expect(result.Tiphereth).toContain('Oxum');
      expect(result.Tiphereth).toContain('Xangô');
    });

    it('should include secondary sephirot mappings', () => {
      const result = getSephirotOrixa();
      
      // Oxalá has secondary Chokmah
      expect(result).toHaveProperty('Chokmah');
      expect(result.Chokmah).toContain('Oxalá');
      
      // Ogum has secondary Hod
      expect(result).toHaveProperty('Hod');
      expect(result.Hod).toContain('Ogum');
    });

    it('should not have duplicate Orixás in the same Sephirah', () => {
      const result = getSephirotOrixa();
      
      for (const sephirah of Object.keys(result)) {
        const uniqueSet = new Set(result[sephirah]);
        expect(result[sephirah].length).toBe(uniqueSet.size);
      }
    });
  });

  describe('getAllOrixaSephiroths', () => {
    it('should return array of all Orixá-Sephirah mappings', () => {
      const result = getAllOrixaSephiroths();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(9);
    });

    it('should include all main Orixás', () => {
      const result = getAllOrixaSephiroths();
      const orixaNames = result.map(r => r.orixa);
      
      expect(orixaNames).toContain('Oxalá');
      expect(orixaNames).toContain('Iemanjá');
      expect(orixaNames).toContain('Oxum');
      expect(orixaNames).toContain('Ogum');
      expect(orixaNames).toContain('Oxóssi');
      expect(orixaNames).toContain('Xangô');
      expect(orixaNames).toContain('Iansã');
      expect(orixaNames).toContain('Omolu');
      expect(orixaNames).toContain('Nanã');
    });

    it('should have unique Orixá names', () => {
      const result = getAllOrixaSephiroths();
      const names = result.map(r => r.orixa);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });
  });

  describe('Element correlation consistency', () => {
    it('should have éter element for Oxalá (Kether connection)', () => {
      const result = getOrixaSephirot('Oxalá');
      expect(result?.elemento).toBe('Éter');
    });

    it('should have água element for water Orixás', () => {
      const waterOrixas = ['Iemanjá', 'Oxum', 'Nanã'];
      waterOrixas.forEach(orixa => {
        const result = getOrixaSephirot(orixa);
        expect(result?.elemento).toBe('Água');
      });
    });

    it('should have fogo element for fire Orixás', () => {
      const fireOrixas = ['Ogum', 'Xangô', 'Iansã'];
      fireOrixas.forEach(orixa => {
        const result = getOrixaSephirot(orixa);
        expect(result?.elemento).toBe('Fogo');
      });
    });

    it('should have terra element for earth Orixás', () => {
      const earthOrixas = ['Oxóssi', 'Omolu'];
      earthOrixas.forEach(orixa => {
        const result = getOrixaSephirot(orixa);
        expect(result?.elemento).toBe('Terra');
      });
    });

    it('should have valid path numbers (1-10) for all Orixás', () => {
      const result = getAllOrixaSephiroths();
      result.forEach(mapping => {
        expect(mapping.numero_caminho).toBeGreaterThanOrEqual(1);
        expect(mapping.numero_caminho).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('Cross-correlation with element-sephirot', () => {
    it('should map fire Orixás to fire-associated Sephiroth', () => {
      const fireOrixas = getAllOrixaSephiroths().filter(o => o.elemento === 'Fogo');
      
      fireOrixas.forEach(orixa => {
        expect(['Geburah', 'Tiphereth', 'Netzach']).toContain(orixa.sephirah);
      });
    });

    it('should map water Orixás to water-associated Sephiroth', () => {
      const waterOrixas = getAllOrixaSephiroths().filter(o => o.elemento === 'Água');
      
      waterOrixas.forEach(orixa => {
        expect(['Binah', 'Tiphereth']).toContain(orixa.sephirah);
      });
    });

    it('should map earth Orixás to Malkuth or Chesed', () => {
      const earthOrixas = getAllOrixaSephiroths().filter(o => o.elemento === 'Terra');
      
      earthOrixas.forEach(orixa => {
        expect(['Malkuth', 'Chesed']).toContain(orixa.sephirah);
      });
    });
  });

  describe('Integration with getOrixaSephirot and getSephirotOrixa', () => {
    it('should maintain consistency between forward and reverse lookups', () => {
      const orixaResult = getOrixaSephirot('Oxalá');
      const sephirotResult = getSephirotOrixa();
      
      if (orixaResult) {
        expect(sephirotResult[orixaResult.sephirah]).toContain('Oxalá');
      }
    });

    it('should find Orixá by primary or secondary Sephirah', () => {
      // Ogum has Geburah as primary and Hod as secondary
      const ogum = getOrixaSephirot('Ogum');
      expect(ogum?.sephirah).toBe('Geburah');
      expect(ogum?.sephirot_secundarias).toContain('Hod');
      
      // Check reverse mapping includes both
      const sephirotMap = getSephirotOrixa();
      expect(sephirotMap.Geburah).toContain('Ogum');
      expect(sephirotMap.Hod).toContain('Ogum');
    });
  });
});