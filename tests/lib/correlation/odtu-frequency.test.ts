import { describe, it, expect } from 'vitest';
import {
  getOduFrequency,
  getFrequencyOdu,
  getAllOduFrequencies,
  getAllOduNumbers,
  getAllOduNames,
  hasOduFrequency,
  getOduByNumber,
  getOdusForElement,
  getFrequenciesForElement,
  getElementByOdu,
  getHealingProperties,
  getUsedFrequencies,
  ODTU_FREQUENCY_MAPPINGS,
  SOLFEGGIO_FREQUENCIES,
  type OdTuFrequency,
  type HealingProperties,
  type ElementType,
} from '@/lib/correlation/odtu-frequency';

describe('OdTuFrequency Correlation', () => {
  describe('Core Exports', () => {
    it('should export all required functions', () => {
      expect(typeof getOduFrequency).toBe('function');
      expect(typeof getFrequencyOdu).toBe('function');
      expect(typeof getAllOduFrequencies).toBe('function');
      expect(typeof getAllOduNumbers).toBe('function');
      expect(typeof getAllOduNames).toBe('function');
      expect(typeof hasOduFrequency).toBe('function');
      expect(typeof getOduByNumber).toBe('function');
      expect(typeof getOdusForElement).toBe('function');
      expect(typeof getFrequenciesForElement).toBe('function');
      expect(typeof getElementByOdu).toBe('function');
      expect(typeof getHealingProperties).toBe('function');
      expect(typeof getUsedFrequencies).toBe('function');
    });

    it('should export constants', () => {
      expect(SOLFEGGIO_FREQUENCIES).toBeDefined();
      expect(Array.isArray(SOLFEGGIO_FREQUENCIES)).toBe(true);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES.length).toBe(9);
      expect(ODTU_FREQUENCY_MAPPINGS).toBeDefined();
    });
  });

  describe('getOduFrequency', () => {
    it('should return mapping for valid Odu number', () => {
      const mapping = getOduFrequency(1);
      expect(mapping).not.toBeNull();
      expect(mapping?.odu_numero).toBe(1);
      expect(mapping?.odu_nome).toBe('Okaran');
      expect(mapping?.frequencia).toBe(174);
    });

    it('should return mapping for valid Odu name', () => {
      const mapping = getOduFrequency('Okaran');
      expect(mapping).not.toBeNull();
      expect(mapping?.frequencia).toBe(174);
    });

    it('should return null for invalid Odu', () => {
      expect(getOduFrequency(0)).toBeNull();
      expect(getOduFrequency(17)).toBeNull();
      expect(getOduFrequency('Invalid')).toBeNull();
    });
  });

  describe('getFrequencyOdu', () => {
    it('should return Odus for a given frequency', () => {
      const mappings = getFrequencyOdu(528);
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.every((m) => m.frequencia === 528)).toBe(true);
    });

    it('should return empty for unused frequency', () => {
      expect(getFrequencyOdu(999)).toEqual([]);
    });
  });

  describe('getAllOduFrequencies', () => {
    it('should return all 16 mappings', () => {
      const all = getAllOduFrequencies();
      expect(all.length).toBe(16);
    });
  });

  describe('getAllOduNumbers', () => {
    it('should return all 16 numbers 1-16', () => {
      const numbers = getAllOduNumbers();
      expect(numbers.length).toBe(16);
      expect(numbers[0]).toBe(1);
      expect(numbers[15]).toBe(16);
    });
  });

  describe('getAllOduNames', () => {
    it('should return all 16 names in Portuguese', () => {
      const names = getAllOduNames();
      expect(names.length).toBe(16);
      expect(names[0]).toBe('Okaran');
      expect(names[15]).toBe('Otura');
    });
  });

  describe('hasOduFrequency', () => {
    it('should return true for valid Odu numbers', () => {
      expect(hasOduFrequency(1)).toBe(true);
      expect(hasOduFrequency(16)).toBe(true);
    });
    it('should return false for invalid Odu numbers', () => {
      expect(hasOduFrequency(0)).toBe(false);
      expect(hasOduFrequency(17)).toBe(false);
    });
  });

  describe('getOduByNumber', () => {
    it('should return mapping for valid Odu number', () => {
      const mapping = getOduByNumber(5);
      expect(mapping).not.toBeNull();
      expect(mapping?.odu_nome).toBe('Oxé');
    });
    it('should return null for invalid Odu number', () => {
      expect(getOduByNumber(0)).toBeNull();
      expect(getOduByNumber(17)).toBeNull();
    });
  });

  describe('getOdusForElement', () => {
    it('should return Odus for fogo', () => {
      const odus = getOdusForElement('fogo');
      expect(odus.length).toBeGreaterThan(0);
    });
    it('should return Odus for água', () => {
      const odus = getOdusForElement('água');
      expect(odus.length).toBeGreaterThan(0);
    });
    it('should return empty for unused element', () => {
      expect(getOdusForElement('ar')).toEqual([]);
    });
  });

  describe('getFrequenciesForElement', () => {
    it('should return frequencies for fogo', () => {
      const freqs = getFrequenciesForElement('fogo');
      expect(freqs.length).toBeGreaterThan(0);
    });
    it('should return empty for unused element', () => {
      expect(getFrequenciesForElement('ar')).toEqual([]);
    });
  });

  describe('getElementByOdu', () => {
    it('should return element for valid Odu', () => {
      expect(getElementByOdu(1)).toBe('éter');
      expect(getElementByOdu(5)).toBe('fogo');
    });
    it('should return null for invalid Odu', () => {
      expect(getElementByOdu(0)).toBeNull();
    });
  });

  describe('getHealingProperties', () => {
    it('should return healing properties for valid Odu', () => {
      const props = getHealingProperties(1);
      expect(props).not.toBeNull();
      expect(props).toHaveProperty('fisico');
      expect(props).toHaveProperty('emocional');
      expect(props).toHaveProperty('espiritual');
    });
    it('should return null for invalid Odu', () => {
      expect(getHealingProperties(0)).toBeNull();
    });
  });

  describe('getUsedFrequencies', () => {
    it('should return unique frequencies', () => {
      const freqs = getUsedFrequencies();
      expect(freqs.length).toBeGreaterThan(0);
      const unique = [...new Set(freqs)];
      expect(freqs.length).toBe(unique.length);
    });
  });

  describe('ODTU_FREQUENCY_MAPPINGS', () => {
    it('should have 16 entries', () => {
      expect(Object.keys(ODTU_FREQUENCY_MAPPINGS).length).toBe(16);
    });
    it('should be frozen', () => {
      expect(Object.isFrozen(ODTU_FREQUENCY_MAPPINGS)).toBe(true);
    });
  });

  describe('SOLFEGGIO_FREQUENCIES', () => {
    it('should have 9 standard frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES.length).toBe(9);
    });
    it('should contain all standard frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toContain(174);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });
  });

  describe('Type Exports', () => {
    it('should export OdTuFrequency interface', () => {
      const mapping: OdTuFrequency = {
        odu_numero: 1,
        odu_nome: 'Test',
        odu_nome_yoruba: 'Test',
        frequencia: 174,
        elemento: 'éter',
        significado_espiritual: 'Test',
        propriedades_healing: { fisico: 'Test', emocional: 'Test', espiritual: 'Test' },
      };
      expect(mapping.odu_numero).toBe(1);
    });
    it('should export ElementType', () => {
      const elements: ElementType[] = ['fogo', 'água', 'ar', 'terra', 'éter'];
      elements.forEach((el) => expect(typeof el).toBe('string'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle Odu 16 (last)', () => {
      const mapping = getOduByNumber(16);
      expect(mapping).not.toBeNull();
      expect(mapping?.odu_nome).toBe('Otura');
    });
    it('should handle frequency 963 (highest)', () => {
      const mappings = getFrequencyOdu(963);
      expect(mappings.length).toBeGreaterThan(0);
    });
  });
});
