import { describe, it, expect } from 'vitest';
import {
  getOduNumerology,
  getNumerologyForOdu,
  getAllOduNumerology,
  getAllOduNames,
  hasOduNumerology,
  getOduByNumber,
  getElementOdu,
  getOdusForNumber,
  getNumerologyElement,
  getNumerologyEnergy,
  ODU_NUMEROLOGY_MAPPINGS,
} from '@/lib/correlation/odu-numerology';

describe('correlation/odu-numerology', () => {
  describe('getOduNumerology', () => {
    it('returns mapping for valid Odu name', () => {
      const result = getOduNumerology('Ogbe');
      expect(result).toBeTruthy();
      expect(result?.odu).toBe('Ogbe');
      expect(result?.numero).toBe(1);
    });

    it('returns null for invalid Odu name', () => {
      const result = getOduNumerology('InvalidOdu');
      expect(result).toBeNull();
    });

    it('each mapping has required fields', () => {
      const result = getOduNumerology('Ofun');
      expect(result?.odu).toBeTruthy();
      expect(result?.numero).toBeTruthy();
      expect(result?.numeros).toBeTruthy();
      expect(result?.elemento).toBeTruthy();
      expect(result?.alinhamento_energetico).toBeTruthy();
      expect(result?.significado_espiritual).toBeTruthy();
      expect(result?.orixa).toBeTruthy();
      expect(result?.dia_sagrado).toBeTruthy();
      expect(result?.cores).toBeTruthy();
      expect(result?.qualidades).toBeTruthy();
    });

    it('returns mapping for all available Odus', () => {
      const allMappings = getAllOduNumerology();
      allMappings.forEach(mapping => {
        const result = getOduNumerology(mapping.odu);
        expect(result).not.toBeNull();
        expect(result?.odu).toBe(mapping.odu);
      });
    });
  });

  describe('getNumerologyForOdu', () => {
    it('returns numerology numbers array for valid Odu', () => {
      const result = getNumerologyForOdu('Ogbe');
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result?.length).toBeGreaterThan(0);
    });

    it('each number has numero and interpretacao', () => {
      const result = getNumerologyForOdu('Ogbe');
      result?.forEach(n => {
        expect(n.numero).toBeTruthy();
        expect(typeof n.numero).toBe('number');
        expect(n.interpretacao).toBeTruthy();
      });
    });

    it('returns null for invalid Odu', () => {
      const result = getNumerologyForOdu('InvalidOdu');
      expect(result).toBeNull();
    });
  });

  describe('getAllOduNumerology', () => {
    it('returns all Odu mappings', () => {
      const result = getAllOduNumerology();
      expect(result.length).toBeGreaterThan(0);
    });

    it('all mappings have unique Odu names', () => {
      const result = getAllOduNumerology();
      const names = result.map(m => m.odu);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('all mappings have unique Odu numbers', () => {
      const result = getAllOduNumerology();
      const numbers = result.map(m => m.numero);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });

    it('mappings are sorted by number', () => {
      const result = getAllOduNumerology();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].numero).toBeGreaterThan(result[i - 1].numero);
      }
    });
  });

  describe('getAllOduNames', () => {
    it('returns all Odu names', () => {
      const result = getAllOduNames();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns names sorted by number', () => {
      const result = getAllOduNames();
      const allMappings = getAllOduNumerology();
      const sorted = allMappings.map(m => m.odu);
      expect(result).toEqual(sorted);
    });
  });

  describe('hasOduNumerology', () => {
    it('returns true for valid Odus', () => {
      expect(hasOduNumerology('Ogbe')).toBe(true);
      expect(hasOduNumerology('Ofun')).toBe(true);
      expect(hasOduNumerology('Alafia')).toBe(true);
      expect(hasOduNumerology('Okaran')).toBe(true);
      expect(hasOduNumerology('Ejilsebora')).toBe(true);
    });

    it('returns false for invalid Odu', () => {
      expect(hasOduNumerology('InvalidOdu')).toBe(false);
      expect(hasOduNumerology('')).toBe(false);
    });
  });

  describe('getOduByNumber', () => {
    it('returns correct mapping for valid numbers', () => {
      const result1 = getOduByNumber(1);
      expect(result1?.odu).toBe('Ogbe');
      
      const result12 = getOduByNumber(12);
      expect(result12?.odu).toBe('Ejilsebora');

      const result16 = getOduByNumber(16);
      expect(result16?.odu).toBe('Alafia');
    });

    it('returns null for invalid number', () => {
      const result = getOduByNumber(99);
      expect(result).toBeNull();
    });

    it('returns null for 0 or negative numbers', () => {
      expect(getOduByNumber(0)).toBeNull();
      expect(getOduByNumber(-1)).toBeNull();
    });
  });

  describe('getElementOdu', () => {
    it('returns Odus for Fogo element', () => {
      const result = getElementOdu('Fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(odu => {
        expect(odu.elemento).toBe('Fogo');
      });
    });

    it('returns Odus for Água element', () => {
      const result = getElementOdu('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(odu => {
        expect(odu.elemento).toBe('Água');
      });
    });

    it('returns Odus for Ar element', () => {
      const result = getElementOdu('Ar');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(odu => {
        expect(odu.elemento).toBe('Ar');
      });
    });

    it('returns Odus for Terra element', () => {
      const result = getElementOdu('Terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(odu => {
        expect(odu.elemento).toBe('Terra');
      });
    });

    it('returns empty array for invalid element', () => {
      const result = getElementOdu('InvalidElement');
      expect(result).toHaveLength(0);
    });
  });

  describe('getOdusForNumber', () => {
    it('returns Odus that have number 2', () => {
      const result = getOdusForNumber(2);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(oduName => {
        const mapping = getOduNumerology(oduName);
        expect(mapping?.numeros.some(n => n.numero === 2)).toBe(true);
      });
    });

    it('returns Odus that have number 11', () => {
      const result = getOdusForNumber(11);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(oduName => {
        const mapping = getOduNumerology(oduName);
        expect(mapping?.numeros.some(n => n.numero === 11)).toBe(true);
      });
    });

    it('returns empty array for number not in any Odu', () => {
      const result = getOdusForNumber(99);
      expect(result).toHaveLength(0);
    });
  });

  describe('getNumerologyElement', () => {
    it('returns element for valid Odu', () => {
      const ogbe = getNumerologyElement('Ogbe');
      expect(ogbe).toBe('Água');

      const ejilsebora = getNumerologyElement('Ejilsebora');
      expect(ejilsebora).toBe('Fogo');
    });

    it('returns null for invalid Odu', () => {
      const result = getNumerologyElement('InvalidOdu');
      expect(result).toBeNull();
    });
  });

  describe('getNumerologyEnergy', () => {
    it('returns energy alignment for valid Odu', () => {
      const ogbe = getNumerologyEnergy('Ogbe');
      expect(ogbe).toBe('Neutra');

      const ejilsebora = getNumerologyEnergy('Ejilsebora');
      expect(ejilsebora).toBe('Neutra');
    });

    it('returns null for invalid Odu', () => {
      const result = getNumerologyEnergy('InvalidOdu');
      expect(result).toBeNull();
    });
  });

  describe('element distribution', () => {
    it('each element has multiple Odus', () => {
      const fogo = getElementOdu('Fogo');
      const agua = getElementOdu('Água');
      const ar = getElementOdu('Ar');
      const terra = getElementOdu('Terra');

      expect(fogo.length).toBeGreaterThan(0);
      expect(agua.length).toBeGreaterThan(0);
      expect(ar.length).toBeGreaterThan(0);
      expect(terra.length).toBeGreaterThan(0);
    });

    it('total Odus equals sum of all elements', () => {
      const fogo = getElementOdu('Fogo');
      const agua = getElementOdu('Água');
      const ar = getElementOdu('Ar');
      const terra = getElementOdu('Terra');

      const total = fogo.length + agua.length + ar.length + terra.length;
      const allMappings = getAllOduNumerology();
      expect(total).toBe(allMappings.length);
    });
  });

  describe('numerology number distribution', () => {
    it('Odus have multiple numerology associations', () => {
      const ogbe = getOduNumerology('Ogbe');
      expect(ogbe?.numeros.length).toBeGreaterThanOrEqual(2);
    });

    it('number 2 is common across multiple Odus', () => {
      const odus = getOdusForNumber(2);
      expect(odus.length).toBeGreaterThanOrEqual(2);
    });

    it('number 11 appears in master Odu connections', () => {
      const odus = getOdusForNumber(11);
      expect(odus.length).toBeGreaterThan(0);
    });
  });

  describe('spiritual meaning completeness', () => {
    it('all Odus have spiritual meaning', () => {
      const allOdus = getAllOduNumerology();
      allOdus.forEach(odu => {
        expect(odu.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('all Odus have associated Orixá', () => {
      const allOdus = getAllOduNumerology();
      allOdus.forEach(odu => {
        expect(odu.orixa.length).toBeGreaterThan(0);
      });
    });

    it('all Odus have sacred colors', () => {
      const allOdus = getAllOduNumerology();
      allOdus.forEach(odu => {
        expect(odu.cores.length).toBeGreaterThan(0);
      });
    });

    it('all Odus have key qualities', () => {
      const allOdus = getAllOduNumerology();
      allOdus.forEach(odu => {
        expect(odu.qualidades.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ODU_NUMEROLOGY_MAPPINGS constant', () => {
    it('is not null', () => {
      expect(ODU_NUMEROLOGY_MAPPINGS).toBeTruthy();
    });

    it('has all Odu entries', () => {
      const allMappings = getAllOduNumerology();
      expect(Object.keys(ODU_NUMEROLOGY_MAPPINGS).length).toBe(allMappings.length);
    });

    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(ODU_NUMEROLOGY_MAPPINGS)).toBe(true);
    });
  });
});