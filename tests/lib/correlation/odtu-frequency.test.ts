/**
 * Odú-Ifá Frequency Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import { getOduFrequency, getFrequencyByOdu, getAllOduFrequencies, getAllOduNumbers, getAllOduNames, getAllOduNamesYoruba, getOduByElement, getOduByFrequency, getElementByOdu, getMessageByOdu, getHealingByOdu, hasOduFrequency, getUsedFrequencies, getUsedElements, ODTU_FREQUENCY_MAPPINGS, SOLFEGGIO_FREQUENCIES, type OdTuFrequency, type ElementType } from '@/lib/correlation/odtu-frequency';

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
  });

  describe('getOduFrequency', () => {
    it('should return Okaran (Odu 1) mapping with 174 Hz frequency', () => {
      const result = getOduFrequency(1);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
      expect(result!.frequencia).toBe(174);
    });
    it('should return Ejiokô (Odu 2) mapping with 285 Hz frequency', () => {
      const result = getOduFrequency(2);
      expect(result).not.toBeNull();
      expect(result!.frequencia).toBe(285);
    });
    it('should return Oxé (Odu 5) mapping with 528 Hz frequency', () => {
      const result = getOduFrequency(5);
      expect(result).not.toBeNull();
      expect(result!.frequencia).toBe(528);
    });
    it('should accept Odu name as string', () => {
      const result = getOduFrequency('Okaran');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
    });
    it('should be case-insensitive', () => {
      expect(getOduFrequency('okaran')!.odu_numero).toBe(1);
      expect(getOduFrequency('OKARAN')!.odu_numero).toBe(1);
    });
    it('should return null for unknown Odu', () => {
      expect(getOduFrequency(0)).toBeNull();
      expect(getOduFrequency(17)).toBeNull();
      expect(getOduFrequency('Unknown')).toBeNull();
    });
  });

  describe('getFrequencyByOdu', () => {
    it('should return 174 Hz for Odu 1', () => { expect(getFrequencyByOdu(1)).toBe(174); });
    it('should return 528 Hz for Odu 5', () => { expect(getFrequencyByOdu(5)).toBe(528); });
    it('should accept Odu name as string', () => { expect(getFrequencyByOdu('Okaran')).toBe(174); });
    it('should return null for unknown Odu', () => { expect(getFrequencyByOdu(0)).toBeNull(); });
  });

  describe('getAllOduFrequencies', () => {
    it('should return all 16 Odu mappings', () => { expect(getAllOduFrequencies()).toHaveLength(16); });
    it('should return mappings sorted by Odu number', () => {
      const result = getAllOduFrequencies();
      for (let i = 0; i < result.length - 1; i++) { expect(result[i].odu_numero).toBeLessThan(result[i + 1].odu_numero); }
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
    it('should return Odus with éter element', () => { expect(getOduByElement('éter').length).toBeGreaterThan(0); });
    it('should return Odus with fogo element', () => { expect(getOduByElement('fogo').length).toBeGreaterThan(0); });
    it('should return Odus with água element', () => { expect(getOduByElement('água').length).toBeGreaterThan(0); });
    it('should return Odus with terra element', () => { expect(getOduByElement('terra').length).toBeGreaterThan(0); });
  });

  describe('getOduByFrequency', () => {
    it('should return Odus for 528 Hz frequency', () => { expect(getOduByFrequency(528).length).toBeGreaterThan(0); });
    it('should return Odus for 963 Hz frequency', () => { expect(getOduByFrequency(963).length).toBeGreaterThan(0); });
  });

  describe('getElementByOdu', () => {
    it('should return éter for Odu 1', () => { expect(getElementByOdu(1)).toBe('éter'); });
    it('should return fogo for Odu 5', () => { expect(getElementByOdu(5)).toBe('fogo'); });
  });

  describe('getMessageByOdu', () => {
    it('should return message for Odu 1', () => { expect(getMessageByOdu(1)!.length).toBeGreaterThan(0); });
  });

  describe('getHealingByOdu', () => {
    it('should return healing applications for Odu 1', () => { expect(getHealingByOdu(1)!.length).toBeGreaterThan(0); });
    it('should contain Milagres for Odu 5', () => { expect(getHealingByOdu(5)).toContain('Milagres'); });
  });

  describe('hasOduFrequency', () => {
    it('should return true for valid Odu numbers', () => { expect(hasOduFrequency(1)).toBe(true); expect(hasOduFrequency(16)).toBe(true); });
    it('should return false for invalid Odu numbers', () => { expect(hasOduFrequency(0)).toBe(false); expect(hasOduFrequency(17)).toBe(false); });
  });

  describe('getUsedFrequencies', () => {
    it('should return unique frequencies', () => { expect(getUsedFrequencies().length).toBeGreaterThan(0); });
    it('should contain standard frequencies', () => { expect(getUsedFrequencies()).toContain(396); expect(getUsedFrequencies()).toContain(528); });
  });

  describe('getUsedElements', () => {
    it('should return unique elements', () => { expect(getUsedElements().length).toBeGreaterThan(0); });
    it('should contain expected elements', () => { expect(getUsedElements()).toContain('éter'); expect(getUsedElements()).toContain('fogo'); });
  });

  describe('ODTU_FREQUENCY_MAPPINGS constant', () => {
    it('should have exactly 16 entries', () => { expect(Object.keys(ODTU_FREQUENCY_MAPPINGS)).toHaveLength(16); });
    it('should have valid frequencies for all entries', () => {
      Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((mapping) => { expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia); });
    });
  });

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('should have 9 Solfeggio frequencies', () => { expect(SOLFEGGIO_FREQUENCIES).toHaveLength(9); });
    it('should contain standard frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toContain(174);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });
  });

  describe('Spiritual Correlations', () => {
    it('should map 528 Hz to appropriate Odus', () => { expect(getOduByFrequency(528).length).toBeGreaterThan(0); });
  });

  describe('Type Exports', () => {
    it('should export OdTuFrequency interface', () => {
      const testMapping: OdTuFrequency = { odu_numero: 1, odu_nome: 'Test', odu_nome_yoruba: 'Test', frequencia: 174, elemento: 'éter', significado_healing: 'Test', mensagem_central: 'Test', cores: ['white'], dias_sagrados: ['Monday'], aplicacoes_healing: ['Test'] };
      expect(testMapping.odu_numero).toBe(1);
    });
    it('should export ElementType', () => { const testElement: ElementType = 'fogo'; expect(testElement).toBe('fogo'); });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in Yoruba names', () => { expect(getOduFrequency('Okànràn')!.odu_numero).toBe(1); });
    it('should handle accented characters in Portuguese names', () => { expect(getOduFrequency('Ejiokô')!.odu_numero).toBe(2); });
  });
});
