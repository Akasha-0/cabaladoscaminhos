/**
 * Orixá-Frequency Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaFrequency,
  getFrequencyOrixa,
  getOrixaProperty,
  getAllOrixas,
  getOrixasByFrequency,
  getOrixasByElement,
  getOrixasByChakra,
  getAllOrixaFrequencies,
} from '@/lib/correlation/orixa-frequency';

describe('Orixá-Frequency Correlation', () => {
  describe('getOrixaFrequency', () => {
    it('should return Oxalufã mapping with 396 Hz frequency', () => {
      const result = getOrixaFrequency('Oxalufã');

      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalufã');
      expect(result?.frequencia).toBe(396);
      expect(result?.propriedade).toContain('Firmeza');
      expect(result?.elemento).toBe('Terra');
      expect(result?.chakra).toContain('Básico');
    });

    it('should return Oxum mapping with 417 Hz frequency', () => {
      const result = getOrixaFrequency('Oxum');

      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxum');
      expect(result?.frequencia).toBe(417);
      expect(result?.propriedade).toContain('Prosperidade');
      expect(result?.elemento).toBe('Água');
      expect(result?.chakra).toContain('Sacro');
    });

    it('should return Xangô mapping with 528 Hz frequency', () => {
      const result = getOrixaFrequency('Xangô');

      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Xangô');
      expect(result?.frequencia).toBe(528);
      expect(result?.propriedade).toContain('Justiça');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.chakra).toContain('Plexo Solar');
    });

    it('should return Oxóssi mapping with 639 Hz frequency', () => {
      const result = getOrixaFrequency('Oxóssi');

      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.frequencia).toBe(639);
      expect(result?.propriedade).toContain('Sabedoria');
      expect(result?.elemento).toBe('Ar');
      expect(result?.chakra).toContain('Cardíaco');
    });

    it('should return Iansã mapping with 741 Hz frequency', () => {
      const result = getOrixaFrequency('Iansã');

      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iansã');
      expect(result?.frequencia).toBe(741);
      expect(result?.propriedade).toContain('Libertação');
      expect(result?.elemento).toBe('Ar');
      expect(result?.chakra).toContain('Laríngeo');
    });

    it('should return Oxumaré mapping with 852 Hz frequency', () => {
      const result = getOrixaFrequency('Oxumaré');

      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxumaré');
      expect(result?.frequencia).toBe(852);
      expect(result?.propriedade).toContain('Transformação');
      expect(result?.elemento).toBe('Éter');
      expect(result?.chakra).toContain('Frontal');
    });

    it('should return Ori mapping with 963 Hz frequency', () => {
      const result = getOrixaFrequency('Ori');

      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Ori');
      expect(result?.frequencia).toBe(963);
      expect(result?.propriedade).toContain('Iluminação');
      expect(result?.elemento).toBe('Éter');
      expect(result?.chakra).toContain('Coronário');
    });

    it('should return Omulu mapping with 396 Hz frequency', () => {
      const result = getOrixaFrequency('Omulu');

      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Omulu');
      expect(result?.frequencia).toBe(396);
    });

    it('should return Iemanjá mapping with 417 Hz frequency', () => {
      const result = getOrixaFrequency('Iemanjá');

      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.frequencia).toBe(417);
    });

    it('should be case-insensitive', () => {
      expect(getOrixaFrequency('oxalufã')).toBeDefined();
      expect(getOrixaFrequency('OXUM')).toBeDefined();
      expect(getOrixaFrequency('Xangô')).toBeDefined();
    });

    it('should return undefined for unknown Orixá', () => {
      const result = getOrixaFrequency('Unknown Orixá');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getOrixaFrequency('');
      expect(result).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaFrequency('Oxum');

      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('frequencia');
      expect(result).toHaveProperty('propriedade');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('chakra');
    });
  });

  describe('getFrequencyOrixa', () => {
    it('should return 396 for Oxalufã', () => {
      expect(getFrequencyOrixa('Oxalufã')).toBe(396);
    });

    it('should return 417 for Oxum', () => {
      expect(getFrequencyOrixa('Oxum')).toBe(417);
    });

    it('should return 528 for Xangô', () => {
      expect(getFrequencyOrixa('Xangô')).toBe(528);
    });

    it('should return 639 for Oxóssi', () => {
      expect(getFrequencyOrixa('Oxóssi')).toBe(639);
    });

    it('should return 741 for Iansã', () => {
      expect(getFrequencyOrixa('Iansã')).toBe(741);
    });

    it('should return 852 for Oxumaré', () => {
      expect(getFrequencyOrixa('Oxumaré')).toBe(852);
    });

    it('should return 963 for Ori', () => {
      expect(getFrequencyOrixa('Ori')).toBe(963);
    });

    it('should return null for unknown Orixá', () => {
      expect(getFrequencyOrixa('Unknown')).toBeNull();
    });
  });

  describe('getOrixaProperty', () => {
    it('should return property for known Orixá', () => {
      const property = getOrixaProperty('Oxum');
      expect(property).toBeDefined();
      expect(typeof property).toBe('string');
      expect(property).toContain('Prosperidade');
    });

    it('should return null for unknown Orixá', () => {
      expect(getOrixaProperty('Unknown')).toBeNull();
    });
  });

  describe('getAllOrixas', () => {
    it('should return array of Orixá names', () => {
      const orixas = getAllOrixas();

      expect(Array.isArray(orixas)).toBe(true);
      expect(orixas.length).toBeGreaterThan(0);
    });

    it('should contain all known Orixás', () => {
      const orixas = getAllOrixas();

      expect(orixas).toContain('Oxalufã');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Iansã');
      expect(orixas).toContain('Oxumaré');
      expect(orixas).toContain('Ori');
    });

    it('should not contain duplicates', () => {
      const orixas = getAllOrixas();
      const unique = new Set(orixas);
      expect(unique.size).toBe(orixas.length);
    });
  });

  describe('getOrixasByFrequency', () => {
    it('should return Orixás for frequency 396', () => {
      const result = getOrixasByFrequency(396);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.frequencia === 396)).toBe(true);
    });

    it('should return Orixás for frequency 417', () => {
      const result = getOrixasByFrequency(417);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.frequencia === 417)).toBe(true);
    });

    it('should return empty array for unknown frequency', () => {
      const result = getOrixasByFrequency(999);
      expect(result).toEqual([]);
    });

    it('should include multiple Orixás per frequency', () => {
      const result417 = getOrixasByFrequency(417);
      const orixaNames = result417.map(r => r.orixa);

      expect(orixaNames).toContain('Oxum');
      expect(orixaNames).toContain('Iemanjá');
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Orixás for Terra element', () => {
      const result = getOrixasByElement('Terra');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.elemento === 'Terra')).toBe(true);
    });

    it('should return Orixás for Água element', () => {
      const result = getOrixasByElement('Água');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.elemento === 'Água')).toBe(true);
    });

    it('should return Orixás for Fogo element', () => {
      const result = getOrixasByElement('Fogo');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.elemento === 'Fogo')).toBe(true);
    });

    it('should return Orixás for Ar element', () => {
      const result = getOrixasByElement('Ar');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.elemento === 'Ar')).toBe(true);
    });

    it('should return Orixás for Éter element', () => {
      const result = getOrixasByElement('Éter');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.elemento === 'Éter')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result1 = getOrixasByElement('terra');
      const result2 = getOrixasByElement('Terra');

      expect(result1.length).toBe(result2.length);
    });

    it('should return empty array for unknown element', () => {
      const result = getOrixasByElement('UnknownElement');
      expect(result).toEqual([]);
    });
  });

  describe('getOrixasByChakra', () => {
    it('should return Orixás for Basic chakra', () => {
      const result = getOrixasByChakra('Básico');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.chakra.includes('Básico'))).toBe(true);
    });

    it('should return Orixás for Sacro chakra', () => {
      const result = getOrixasByChakra('Sacro');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.chakra.includes('Sacro'))).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result1 = getOrixasByChakra('básico');
      const result2 = getOrixasByChakra('Básico');

      expect(result1.length).toBe(result2.length);
    });

    it('should return empty array for unknown chakra', () => {
      const result = getOrixasByChakra('UnknownChakra');
      expect(result).toEqual([]);
    });
  });

  describe('getAllOrixaFrequencies', () => {
    it('should return array of all mappings', () => {
      const result = getAllOrixaFrequencies();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have all required properties for each mapping', () => {
      const result = getAllOrixaFrequencies();

      result.forEach(mapping => {
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('propriedade');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('chakra');
      });
    });

    it('should cover all Solfeggio frequencies', () => {
      const result = getAllOrixaFrequencies();
      const frequencies = result.map(r => r.frequencia);

      expect(frequencies).toContain(396);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(963);
    });

    it('should return same length as getAllOrixas', () => {
      const orixas = getAllOrixas();
      const mappings = getAllOrixaFrequencies();

      expect(mappings.length).toBe(orixas.length);
    });
  });

  describe('Frequency correlation consistency', () => {
    it('should have consistent frequency-element relationships', () => {
      const terraFreqs = getOrixasByElement('Terra').map(r => r.frequencia);
      const aguaFreqs = getOrixasByElement('Água').map(r => r.frequencia);
      const fogoFreqs = getOrixasByElement('Fogo').map(r => r.frequencia);
      const arFreqs = getOrixasByElement('Ar').map(r => r.frequencia);
      const eterFreqs = getOrixasByElement('Éter').map(r => r.frequencia);

      // Terra and Água should not overlap
      const overlapTerraAgua = terraFreqs.filter(f => aguaFreqs.includes(f));
      expect(overlapTerraAgua.length).toBe(0);

      // Fogo and Água should not overlap
      const overlapFogoAgua = fogoFreqs.filter(f => aguaFreqs.includes(f));
      expect(overlapFogoAgua.length).toBe(0);
    });

    it('should have valid Solfeggio frequency values', () => {
      const result = getAllOrixaFrequencies();
      const validFrequencies = [396, 417, 528, 639, 741, 852, 963];

      result.forEach(mapping => {
        expect(validFrequencies).toContain(mapping.frequencia);
      });
    });
  });
});