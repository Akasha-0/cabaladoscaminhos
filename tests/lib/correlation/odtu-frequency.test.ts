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

    it('should export constant SOLFEGGIO_FREQUENCIES', () => {
      expect(SOLFEGGIO_FREQUENCIES).toBeDefined();
      expect(Array.isArray(SOLFEGGIO_FREQUENCIES)).toBe(true);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES.length).toBe(9);
    });

    it('should export constant ODTU_FREQUENCY_MAPPINGS', () => {
      expect(ODTU_FREQUENCY_MAPPINGS).toBeDefined();
      expect(typeof ODTU_FREQUENCY_MAPPINGS).toBe('object');
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

    it('should return mapping for valid Odu name (Portuguese)', () => {
      const mapping = getOduFrequency('Okaran');
      expect(mapping).not.toBeNull();
      expect(mapping?.odu_numero).toBe(1);
      expect(mapping?.frequencia).toBe(174);
    });

    it('should return mapping for valid Odu name (Yoruba)', () => {
      const mapping = getOduFrequency('Okànràn');
      expect(mapping).not.toBeNull();
      expect(mapping?.odu_numero).toBe(1);
    });

    it('should return mapping for Ofun', () => {
      const mapping = getOduFrequency('Ofun');
      expect(mapping).not.toBeNull();
      expect(mapping?.odu_numero).toBe(10);
      expect(mapping?.frequencia).toBe(528);
      expect(mapping?.elemento).toBe('éter');
    });

    it('should return mapping for Otura', () => {
      const mapping = getOduFrequency(16);
      expect(mapping).not.toBeNull();
      expect(mapping?.odu_nome).toBe('Otura');
      expect(mapping?.frequencia).toBe(174);
    });

    it('should return null for invalid Odu number', () => {
      expect(getOduFrequency(0)).toBeNull();
      expect(getOduFrequency(17)).toBeNull();
      expect(getOduFrequency(-1)).toBeNull();
    });

    it('should return null for invalid Odu name', () => {
      expect(getOduFrequency('InvalidOdu')).toBeNull();
      expect(getOduFrequency('')).toBeNull();
      expect(getOduFrequency('XXXXXXXX')).toBeNull();
    });

    it('should perform case-insensitive name search', () => {
      const lower = getOduFrequency('okaran');
      const upper = getOduFrequency('OKARAN');
      const mixed = getOduFrequency('OkArAn');
      expect(lower).not.toBeNull();
      expect(upper).not.toBeNull();
      expect(mixed).not.toBeNull();
      expect(lower?.odu_numero).toBe(upper?.odu_numero);
      expect(upper?.odu_numero).toBe(mixed?.odu_numero);
    });
  });

  describe('getFrequencyOdu', () => {
    it('should return all Odus for a given frequency', () => {
      const mappings = getFrequencyOdu(528);
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.every((m) => m.frequencia === 528)).toBe(true);
    });

    it('should return empty array for unused frequency', () => {
      const mappings = getFrequencyOdu(999);
      expect(mappings).toEqual([]);
    });

    it('should return multiple Odus for frequencies used by multiple Odus', () => {
      // 528 is used by Ofun (10) and Oxé (5)
      const mappings = getFrequencyOdu(528);
      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings.length).toBeGreaterThanOrEqual(2);
    });

    it('should return mappings sorted by Odu number', () => {
      const mappings = getFrequencyOdu(528);
      const numbers = mappings.map((m) => m.odu_numero);
      expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    });

    it('should work with frequency 174', () => {
      const mappings = getFrequencyOdu(174);
      expect(mappings.length).toBe(2); // Okaran (1) and Otura (16)
      expect(mappings.some((m) => m.odu_numero === 1)).toBe(true);
      expect(mappings.some((m) => m.odu_numero === 16)).toBe(true);
    });
  });

  describe('getAllOduFrequencies', () => {
    it('should return all mappings sorted by number', () => {
      const all = getAllOduFrequencies();
      expect(all.length).toBe(16);
      for (let i = 0; i < all.length - 1; i++) {
        expect(all[i].odu_numero).toBeLessThan(all[i + 1].odu_numero);
      }
    });

    it('should contain all 16 Odus', () => {
      const all = getAllOduFrequencies();
      const numbers = all.map((m) => m.odu_numero);
      for (let i = 1; i <= 16; i++) {
        expect(numbers).toContain(i);
      }
    });

    it('should return OdTuFrequency objects with required properties', () => {
      const all = getAllOduFrequencies();
      all.forEach((mapping) => {
        expect(mapping).toHaveProperty('odu_numero');
        expect(mapping).toHaveProperty('odu_nome');
        expect(mapping).toHaveProperty('odu_nome_yoruba');
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('propriedades_healing');
      });
    });
  });

  describe('getAllOduNumbers', () => {
    it('should return all 16 Odu numbers', () => {
      const numbers = getAllOduNumbers();
      expect(numbers.length).toBe(16);
    });

    it('should return numbers sorted in ascending order', () => {
      const numbers = getAllOduNumbers();
      expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    });

    it('should contain all numbers 1-16', () => {
      const numbers = getAllOduNumbers();
      for (let i = 1; i <= 16; i++) {
        expect(numbers).toContain(i);
      }
    });
  });

  describe('getAllOduNames', () => {
    it('should return all 16 Odu names in Portuguese', () => {
      const names = getAllOduNames();
      expect(names.length).toBe(16);
    });

    it('should return names sorted by Odu number', () => {
      const names = getAllOduNames();
      expect(names[0]).toBe('Okaran');
      expect(names[15]).toBe('Otura');
    });

    it('should return string array', () => {
      const names = getAllOduNames();
      names.forEach((name) => {
        expect(typeof name).toBe('string');
      });
    });
  });

  describe('hasOduFrequency', () => {
    it('should return true for valid Odu numbers', () => {
      expect(hasOduFrequency(1)).toBe(true);
      expect(hasOduFrequency(8)).toBe(true);
      expect(hasOduFrequency(16)).toBe(true);
    });

    it('should return false for invalid Odu numbers', () => {
      expect(hasOduFrequency(0)).toBe(false);
      expect(hasOduFrequency(17)).toBe(false);
      expect(hasOduFrequency(-1)).toBe(false);
    });
  });

  describe('getOduByNumber', () => {
    it('should return mapping for valid Odu number', () => {
      const mapping = getOduByNumber(5);
      expect(mapping).not.toBeNull();
      expect(mapping?.odu_numero).toBe(5);
      expect(mapping?.odu_nome).toBe('Oxé');
    });

    it('should return null for invalid Odu number', () => {
      expect(getOduByNumber(0)).toBeNull();
      expect(getOduByNumber(17)).toBeNull();
      expect(getOduByNumber(99)).toBeNull();
    });
  });

  describe('getOdusForElement', () => {
    it('should return Odus for fogo element', () => {
      const odus = getOdusForElement('fogo');
      expect(odus.length).toBeGreaterThan(0);
      odus.forEach((o) => {
        expect(o.elemento).toBe('fogo');
      });
    });

    it('should return Odus for água element', () => {
      const odus = getOdusForElement('água');
      expect(odus.length).toBeGreaterThan(0);
      odus.forEach((o) => {
        expect(o.elemento).toBe('água');
      });
    });

    it('should return Odus for terra element', () => {
      const odus = getOdusForElement('terra');
      expect(odus.length).toBeGreaterThan(0);
      odus.forEach((o) => {
        expect(o.elemento).toBe('terra');
      });
    });

    it('should return Odus for éter element', () => {
      const odus = getOdusForElement('éter');
      expect(odus.length).toBeGreaterThan(0);
      odus.forEach((o) => {
        expect(o.elemento).toBe('éter');
      });
    });

    it('should return empty array for unused element', () => {
      const odus = getOdusForElement('ar');
      expect(Array.isArray(odus)).toBe(true);
    });

    it('should return mappings sorted by Odu number', () => {
      const odus = getOdusForElement('fogo');
      const numbers = odus.map((o) => o.odu_numero);
      expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    });
  });

  describe('getFrequenciesForElement', () => {
    it('should return frequencies for fogo element', () => {
      const freqs = getFrequenciesForElement('fogo');
      expect(freqs.length).toBeGreaterThan(0);
      freqs.forEach((f) => {
        expect(SOLFEGGIO_FREQUENCIES).toContain(f);
      });
    });

    it('should return unique frequencies', () => {
      const freqs = getFrequenciesForElement('água');
      const unique = [...new Set(freqs)];
      expect(freqs.length).toBe(unique.length);
    });

    it('should return frequencies sorted in ascending order', () => {
      const freqs = getFrequenciesForElement('éter');
      expect(freqs).toEqual([...freqs].sort((a, b) => a - b));
    });

    it('should return empty array for unused element', () => {
      const freqs = getFrequenciesForElement('ar');
      expect(freqs).toEqual([]);
    });
  });

  describe('getElementByOdu', () => {
    it('should return element for valid Odu number', () => {
      expect(getElementByOdu(1)).toBe('éter');
      expect(getElementByOdu(5)).toBe('fogo');
      expect(getElementByOdu(8)).toBe('água');
    });

    it('should return null for invalid Odu number', () => {
      expect(getElementByOdu(0)).toBeNull();
      expect(getElementByOdu(17)).toBeNull();
    });
  });

  describe('getHealingProperties', () => {
    it('should return healing properties for valid Odu number', () => {
      const props = getHealingProperties(1);
      expect(props).not.toBeNull();
      expect(props).toHaveProperty('fisico');
      expect(props).toHaveProperty('emocional');
      expect(props).toHaveProperty('espiritual');
    });

    it('should return properties with string values', () => {
      const props = getHealingProperties(5);
      expect(typeof props?.fisico).toBe('string');
      expect(typeof props?.emocional).toBe('string');
      expect(typeof props?.espiritual).toBe('string');
    });

    it('should return null for invalid Odu number', () => {
      expect(getHealingProperties(0)).toBeNull();
      expect(getHealingProperties(17)).toBeNull();
    });
  });

  describe('getUsedFrequencies', () => {
    it('should return unique frequencies used by all Odus', () => {
      const freqs = getUsedFrequencies();
      expect(freqs.length).toBeGreaterThan(0);
      expect(freqs.length).toBeLessThanOrEqual(9); // Max 9 Solfeggio frequencies
    });

    it('should return frequencies sorted in ascending order', () => {
      const freqs = getUsedFrequencies();
      expect(freqs).toEqual([...freqs].sort((a, b) => a - b));
    });

    it('should not contain duplicates', () => {
      const freqs = getUsedFrequencies();
      const unique = [...new Set(freqs)];
      expect(freqs.length).toBe(unique.length);
    });

    it('should only contain valid Solfeggio frequencies', () => {
      const freqs = getUsedFrequencies();
      freqs.forEach((f) => {
        expect(SOLFEGGIO_FREQUENCIES).toContain(f);
      });
    });
  });

  describe('ODTU_FREQUENCY_MAPPINGS constant', () => {
    it('should have exactly 16 entries', () => {
      expect(Object.keys(ODTU_FREQUENCY_MAPPINGS).length).toBe(16);
    });

    it('should have keys 1-16', () => {
      for (let i = 1; i <= 16; i++) {
        expect(ODTU_FREQUENCY_MAPPINGS).toHaveProperty(i);
      }
    });

    it('should have OdTuFrequency values with all required fields', () => {
      Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((mapping) => {
        expect(mapping).toHaveProperty('odu_numero');
        expect(mapping).toHaveProperty('odu_nome');
        expect(mapping).toHaveProperty('odu_nome_yoruba');
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('propriedades_healing');
      });
    });

    it('should be immutable (frozen)', () => {
      expect(Object.isFrozen(ODTU_FREQUENCY_MAPPINGS)).toBe(true);
    });
  });

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('should have exactly 9 standard Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES.length).toBe(9);
    });

    it('should contain standard frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toContain(174);
      expect(SOLFEGGIO_FREQUENCIES).toContain(285);
      expect(SOLFEGGIO_FREQUENCIES).toContain(396);
      expect(SOLFEGGIO_FREQUENCIES).toContain(417);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(639);
      expect(SOLFEGGIO_FREQUENCIES).toContain(741);
      expect(SOLFEGGIO_FREQUENCIES).toContain(852);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });

    it('should be in ascending order', () => {
      expect(SOLFEGGIO_FREQUENCIES).toEqual([...SOLFEGGIO_FREQUENCIES].sort((a, b) => a - b));
    });

    it('should be immutable (frozen)', () => {
      expect(Object.isFrozen(SOLFEGGIO_FREQUENCIES)).toBe(true);
    });
  });

  describe('Spiritual Correlations', () => {
    it('should have éter element for Odu 1 (Okaran)', () => {
      const mapping = getOduByNumber(1);
      expect(mapping?.elemento).toBe('éter');
      expect(mapping?.significado_espiritual).toContain('coragem');
    });

    it('should have água element for Odu 2 (Ejiokô)', () => {
      const mapping = getOduByNumber(2);
      expect(mapping?.elemento).toBe('água');
      expect(mapping?.significado_espiritual).toContain('escolha');
    });

    it('should have fogo element for Odu 5 (Oxé)', () => {
      const mapping = getOduByNumber(5);
      expect(mapping?.elemento).toBe('fogo');
      expect(mapping?.significado_espiritual).toContain('justiça');
    });

    it('should have fogo element for Odu 14 (Jinza)', () => {
      const mapping = getOduByNumber(14);
      expect(mapping?.elemento).toBe('fogo');
      expect(mapping?.significado_espiritual).toContain('guerra');
    });

    it('should have healing properties with Portuguese content', () => {
      const props = getHealingProperties(1);
      expect(props?.fisico).toContain('físico');
      expect(props?.emocional).toContain('emocional');
      expect(props?.espiritual).toContain('espiritual');
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
        propriedades_healing: {
          fisico: 'Test',
          emocional: 'Test',
          espiritual: 'Test',
        },
      };
      expect(mapping.odu_numero).toBe(1);
    });

    it('should export HealingProperties interface', () => {
      const props: HealingProperties = {
        fisico: 'Test',
        emocional: 'Test',
        espiritual: 'Test',
      };
      expect(props.fisico).toBe('Test');
    });

    it('should export ElementType union', () => {
      const elements: ElementType[] = ['fogo', 'água', 'ar', 'terra', 'éter'];
      elements.forEach((el) => {
        expect(typeof el).toBe('string');
      });
    });
  });

  describe('Default Export', () => {
    it('should export default with all functions', () => {
      const mod = require('@/lib/correlation/odtu-frequency').default;
      expect(typeof mod.getOduFrequency).toBe('function');
      expect(typeof mod.getFrequencyOdu).toBe('function');
      expect(typeof mod.getAllOduFrequencies).toBe('function');
    });

    it('should export constants via default', () => {
      const mod = require('@/lib/correlation/odtu-frequency').default;
      expect(mod.ODTU_FREQUENCY_MAPPINGS).toBeDefined();
      expect(mod.SOLFEGGIO_FREQUENCIES).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle Odu number 16 (last)', () => {
      const mapping = getOduByNumber(16);
      expect(mapping).not.toBeNull();
      expect(mapping?.odu_nome).toBe('Otura');
    });

    it('should handle frequency 963 (highest)', () => {
      const mappings = getFrequencyOdu(963);
      expect(mappings.length).toBeGreaterThan(0);
    });

    it('should handle empty string as invalid', () => {
      expect(getOduFrequency('')).toBeNull();
    });

    it('should handle special characters in Yoruba names', () => {
      const mapping = getOduFrequency('Okànràn');
      expect(mapping).not.toBeNull();
      expect(mapping?.odu_nome).toBe('Okaran');
    });
  });
});