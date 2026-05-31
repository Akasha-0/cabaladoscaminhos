/**
 * Odú-Ifá Frequency Correlation Tests
 * Tests for the 16 Odú Ifá (Merindilogun) to Solfeggio frequency mappings
 */

import { describe, it, expect } from 'vitest';
import {
  getOduFrequency,
  getFrequencyByOdu,
  getAllOduFrequencies,
  getAllOduNumbers,
  getAllOduNames,
  getAllOduNamesYoruba,
  getOduByElement,
  getOduByFrequency,
  getElementByOdu,
  getMessageByOdu,
  getHealingByOdu,
  hasOduFrequency,
  getUsedFrequencies,
  getUsedElements,
  ODTU_FREQUENCY_MAPPINGS,
  SOLFEGGIO_FREQUENCIES,
  type OdTuFrequency,
  type ElementType,
} from '@/lib/correlation/odtu-frequency';

describe('OdTuFrequency Correlation', () => {
  describe('Core Exports', () => {
    it('should export ODTU_FREQUENCY_MAPPINGS constant', () => {
      expect(ODTU_FREQUENCY_MAPPINGS).toBeDefined();
      expect(typeof ODTU_FREQUENCY_MAPPINGS).toBe('object');
    });

    it('should export SOLFEGGIO_FREQUENCIES constant', () => {
      expect(SOLFEGGIO_FREQUENCIES).toBeDefined();
      expect(Array.isArray(SOLFEGGIO_FREQUENCIES)).toBe(true);
      expect(SOLFEGGIO_FREQUENCIES).toContain(174);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });

    it('should export all type definitions', () => {
      expect(typeof getOduFrequency).toBe('function');
      expect(typeof getFrequencyByOdu).toBe('function');
      expect(typeof getAllOduFrequencies).toBe('function');
      expect(typeof getAllOduNumbers).toBe('function');
      expect(typeof getAllOduNames).toBe('function');
      expect(typeof getAllOduNamesYoruba).toBe('function');
      expect(typeof getOduByElement).toBe('function');
      expect(typeof getOduByFrequency).toBe('function');
      expect(typeof getElementByOdu).toBe('function');
      expect(typeof getMessageByOdu).toBe('function');
      expect(typeof getHealingByOdu).toBe('function');
      expect(typeof hasOduFrequency).toBe('function');
      expect(typeof getUsedFrequencies).toBe('function');
      expect(typeof getUsedElements).toBe('function');
    });
  });

  describe('getOduFrequency', () => {
    it('should return Okaran (Odu 1) mapping with 174 Hz frequency', () => {
      const result = getOduFrequency(1);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
      expect(result!.odu_nome).toBe('Okaran');
      expect(result!.frequencia).toBe(174);
      expect(result!.elemento).toBe('éter');
    });

    it('should return Ejiokô (Odu 2) mapping with 285 Hz frequency', () => {
      const result = getOduFrequency(2);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(2);
      expect(result!.odu_nome).toBe('Ejiokô');
      expect(result!.frequencia).toBe(285);
    });

    it('should return Oxé (Odu 5) mapping with 528 Hz frequency', () => {
      const result = getOduFrequency(5);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(5);
      expect(result!.odu_nome).toBe('Oxé');
      expect(result!.frequencia).toBe(528);
    });

    it('should return Oshe (Odu 9) mapping with 963 Hz frequency', () => {
      const result = getOduFrequency(9);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(9);
      expect(result!.odu_nome).toBe('Oshe');
      expect(result!.frequencia).toBe(963);
    });

    it('should accept Odu name as string', () => {
      const result = getOduFrequency('Okaran');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
    });

    it('should be case-insensitive with string input', () => {
      const result1 = getOduFrequency('okaran');
      const result2 = getOduFrequency('OKARAN');
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result1!.odu_numero).toBe(1);
      expect(result2!.odu_numero).toBe(1);
    });

    it('should return null for unknown Odu number', () => {
      expect(getOduFrequency(0)).toBeNull();
      expect(getOduFrequency(17)).toBeNull();
    });

    it('should return null for unknown Odu name', () => {
      expect(getOduFrequency('UnknownOdu')).toBeNull();
      expect(getOduFrequency('')).toBeNull();
    });
  });

  describe('getFrequencyByOdu', () => {
    it('should return 174 Hz for Odu 1', () => {
      expect(getFrequencyByOdu(1)).toBe(174);
    });

    it('should return 528 Hz for Odu 5', () => {
      expect(getFrequencyByOdu(5)).toBe(528);
    });

    it('should accept Odu name as string', () => {
      expect(getFrequencyByOdu('Okaran')).toBe(174);
    });

    it('should return null for unknown Odu', () => {
      expect(getFrequencyByOdu(0)).toBeNull();
    });
  });

  describe('getAllOduFrequencies', () => {
    it('should return all 16 Odu mappings', () => {
      const result = getAllOduFrequencies();
      expect(result).toHaveLength(16);
    });

    it('should return mappings sorted by Odu number', () => {
      const result = getAllOduFrequencies();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].odu_numero).toBeLessThan(result[i + 1].odu_numero);
      }
    });
  });

  describe('getAllOduNumbers', () => {
    it('should return all numbers 1-16', () => {
      const result = getAllOduNumbers();
      expect(result).toHaveLength(16);
      expect(result).toContain(1);
      expect(result).toContain(16);
    });
  });

  describe('getAllOduNames', () => {
    it('should return all 16 Odu names in Portuguese', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(16);
      expect(result).toContain('Okaran');
      expect(result).toContain('Oshe');
    });
  });

  describe('getOduByElement', () => {
    it('should return Odus with éter element', () => {
      const result = getOduByElement('éter');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return Odus with fogo element', () => {
      const result = getOduByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getOduByFrequency', () => {
    it('should return Odus for 528 Hz frequency', () => {
      const result = getOduByFrequency(528);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getElementByOdu', () => {
    it('should return éter for Odu 1', () => {
      expect(getElementByOdu(1)).toBe('éter');
    });

    it('should return fogo for Odu 5', () => {
      expect(getElementByOdu(5)).toBe('fogo');
    });
  });

  describe('getMessageByOdu', () => {
    it('should return message for Odu 1', () => {
      const result = getMessageByOdu(1);
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(0);
    });
  });

  describe('getHealingByOdu', () => {
    it('should return healing applications for Odu 1', () => {
      const result = getHealingByOdu(1);
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return healing applications for Odu 5 (528 Hz - miracles)', () => {
      const result = getHealingByOdu(5);
      expect(result).toContain('Milagres');
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

  describe('getUsedFrequencies', () => {
    it('should return unique frequencies used in mappings', () => {
      const result = getUsedFrequencies();
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain(396);
      expect(result).toContain(528);
    });
  });

  describe('getUsedElements', () => {
    it('should return unique elements used in mappings', () => {
      const result = getUsedElements();
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('éter');
      expect(result).toContain('fogo');
    });
  });

  describe('ODTU_FREQUENCY_MAPPINGS constant', () => {
    it('should have exactly 16 entries', () => {
      expect(Object.keys(ODTU_FREQUENCY_MAPPINGS)).toHaveLength(16);
    });

    it('should have valid frequencies for all entries', () => {
      Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((mapping) => {
        expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia);
      });
    });
  });

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('should have 9 Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toHaveLength(9);
    });

    it('should contain standard Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toContain(174);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });
  });

  describe('Spiritual Correlations', () => {
    it('should map 528 Hz (miracle frequency) to appropriate Odus', () => {
      const odus528 = getOduByFrequency(528);
      expect(odus528.length).toBeGreaterThan(0);
    });

    it('should map fogo element to appropriate frequencies', () => {
      const fogoOdus = getOduByElement('fogo');
      expect(fogoOdus.length).toBeGreaterThan(0);
    });
  });

  describe('Type Exports', () => {
    it('should export OdTuFrequency interface', () => {
      const testMapping: OdTuFrequency = {
        odu_numero: 1,
        odu_nome: 'Test',
        odu_nome_yoruba: 'Test',
        frequencia: 174,
        elemento: 'éter',
        significado_healing: 'Test',
        mensagem_central: 'Test',
        cores: ['white'],
        dias_sagrados: ['Monday'],
        aplicacoes_healing: ['Test'],
      };
      expect(testMapping.odu_numero).toBe(1);
    });

    it('should export ElementType', () => {
      const testElement: ElementType = 'fogo';
      expect(testElement).toBe('fogo');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in Yoruba names', () => {
      const result = getOduFrequency('Okànràn');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
    });

    it('should handle accented characters in Portuguese names', () => {
      const result = getOduFrequency('Ejiokô');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(2);
    });
  });
});
