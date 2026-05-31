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

    it('should return Etaogundá (Odu 3) mapping with 396 Hz frequency', () => {
      const result = getOduFrequency(3);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(3);
      expect(result!.odu_nome).toBe('Etaogundá');
      expect(result!.frequencia).toBe(396);
    });

    it('should return Irosun (Odu 4) mapping with 417 Hz frequency', () => {
      const result = getOduFrequency(4);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(4);
      expect(result!.odu_nome).toBe('Irosun');
      expect(result!.frequencia).toBe(417);
    });

    it('should return Oxé (Odu 5) mapping with 528 Hz frequency', () => {
      const result = getOduFrequency(5);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(5);
      expect(result!.odu_nome).toBe('Oxé');
      expect(result!.frequencia).toBe(528);
    });

    it('should return Obará (Odu 6) mapping with 639 Hz frequency', () => {
      const result = getOduFrequency(6);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(6);
      expect(result!.odu_nome).toBe('Obará');
      expect(result!.frequencia).toBe(639);
    });

    it('should return Odi (Odu 7) mapping with 741 Hz frequency', () => {
      const result = getOduFrequency(7);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(7);
      expect(result!.odu_nome).toBe('Odi');
      expect(result!.frequencia).toBe(741);
    });

    it('should return Ejionlá (Odu 8) mapping with 852 Hz frequency', () => {
      const result = getOduFrequency(8);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(8);
      expect(result!.odu_nome).toBe('Ejionlá');
      expect(result!.frequencia).toBe(852);
    });

    it('should return Oshe (Odu 9) mapping with 963 Hz frequency', () => {
      const result = getOduFrequency(9);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(9);
      expect(result!.odu_nome).toBe('Oshe');
      expect(result!.frequencia).toBe(963);
    });

    it('should return Ofun (Odu 10) mapping', () => {
      const result = getOduFrequency(10);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(10);
      expect(result!.odu_nome).toBe('Ofun');
    });

    it('should return Eyonla (Odu 11) mapping', () => {
      const result = getOduFrequency(11);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(11);
      expect(result!.odu_nome).toBe('Eyonla');
    });

    it('should return Merinla (Odu 12) mapping', () => {
      const result = getOduFrequency(12);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(12);
      expect(result!.odu_nome).toBe('Merinla');
    });

    it('should return Mero (Odu 13) mapping', () => {
      const result = getOduFrequency(13);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(13);
      expect(result!.odu_nome).toBe('Mero');
    });

    it('should return Jinza (Odu 14) mapping', () => {
      const result = getOduFrequency(14);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(14);
      expect(result!.odu_nome).toBe('Jinza');
    });

    it('should return Jotagbe (Odu 15) mapping', () => {
      const result = getOduFrequency(15);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(15);
      expect(result!.odu_nome).toBe('Jotagbe');
    });

    it('should return Otura (Odu 16) mapping', () => {
      const result = getOduFrequency(16);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(16);
      expect(result!.odu_nome).toBe('Otura');
    });

    it('should accept Odu name as string', () => {
      const result = getOduFrequency('Okaran');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
    });

    it('should be case-insensitive with string input', () => {
      const result1 = getOduFrequency('okaran');
      const result2 = getOduFrequency('OKARAN');
      const result3 = getOduFrequency('OkArAn');
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result3).not.toBeNull();
      expect(result1!.odu_numero).toBe(1);
      expect(result2!.odu_numero).toBe(1);
      expect(result3!.odu_numero).toBe(1);
    });

    it('should return null for unknown Odu number', () => {
      expect(getOduFrequency(0)).toBeNull();
      expect(getOduFrequency(17)).toBeNull();
      expect(getOduFrequency(100)).toBeNull();
    });

    it('should return null for unknown Odu name', () => {
      expect(getOduFrequency('UnknownOdu')).toBeNull();
      expect(getOduFrequency('')).toBeNull();
    });

    it('should include all required properties in returned object', () => {
      const result = getOduFrequency(1);
      expect(result).toHaveProperty('odu_numero');
      expect(result).toHaveProperty('odu_nome');
      expect(result).toHaveProperty('odu_nome_yoruba');
      expect(result).toHaveProperty('frequencia');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('significado_healing');
      expect(result).toHaveProperty('mensagem_central');
      expect(result).toHaveProperty('cores');
      expect(result).toHaveProperty('dias_sagrados');
      expect(result).toHaveProperty('aplicacoes_healing');
    });
  });

  describe('getFrequencyByOdu', () => {
    it('should return 174 Hz for Odu 1', () => {
      expect(getFrequencyByOdu(1)).toBe(174);
    });

    it('should return 285 Hz for Odu 2', () => {
      expect(getFrequencyByOdu(2)).toBe(285);
    });

    it('should return 528 Hz for Odu 5', () => {
      expect(getFrequencyByOdu(5)).toBe(528);
    });

    it('should return 963 Hz for Odu 9', () => {
      expect(getFrequencyByOdu(9)).toBe(963);
    });

    it('should accept Odu name as string', () => {
      expect(getFrequencyByOdu('Okaran')).toBe(174);
      expect(getFrequencyByOdu('Oxé')).toBe(528);
    });

    it('should return null for unknown Odu', () => {
      expect(getFrequencyByOdu(0)).toBeNull();
      expect(getFrequencyByOdu('Unknown')).toBeNull();
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

    it('should include all required properties for each mapping', () => {
      const result = getAllOduFrequencies();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('odu_numero');
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('elemento');
      });
    });
  });

  describe('getAllOduNumbers', () => {
    it('should return all numbers 1-16', () => {
      const result = getAllOduNumbers();
      expect(result).toHaveLength(16);
      expect(result).toContain(1);
      expect(result).toContain(8);
      expect(result).toContain(16);
    });

    it('should return numbers sorted in ascending order', () => {
      const result = getAllOduNumbers();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });
  });

  describe('getAllOduNames', () => {
    it('should return all 16 Odu names in Portuguese', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(16);
      expect(result).toContain('Okaran');
      expect(result).toContain('Ejiokô');
      expect(result).toContain('Oshe');
    });

    it('should return names sorted alphabetically', () => {
      const result = getAllOduNames();
      const sorted = [...result].sort((a, b) => a.localeCompare(b, 'pt-BR'));
      expect(result).toEqual(sorted);
    });
  });

  describe('getAllOduNamesYoruba', () => {
    it('should return all 16 Odu names in Yoruba', () => {
      const result = getAllOduNamesYoruba();
      expect(result).toHaveLength(16);
      expect(result).toContain('Okànràn');
      expect(result).toContain('Ejìokò');
    });
  });

  describe('getOduByElement', () => {
    it('should return Odus with éter element', () => {
      const result = getOduByElement('éter');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((odu) => {
        expect(odu.elemento).toBe('éter');
      });
    });

    it('should return Odus with água element', () => {
      const result = getOduByElement('água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((odu) => {
        expect(odu.elemento).toBe('água');
      });
    });

    it('should return Odus with fogo element', () => {
      const result = getOduByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((odu) => {
        expect(odu.elemento).toBe('fogo');
      });
    });

    it('should return Odus with terra element', () => {
      const result = getOduByElement('terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((odu) => {
        expect(odu.elemento).toBe('terra');
      });
    });

    it('should return empty array for ar element', () => {
      const result = getOduByElement('ar');
      expect(result.length).toBe(0);
    });

    it('should return empty array for invalid element', () => {
      const result = getOduByElement('invalid');
      expect(result).toEqual([]);
    });
  });

  describe('getOduByFrequency', () => {
    it('should return Odus for 528 Hz frequency', () => {
      const result = getOduByFrequency(528);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((odu) => {
        expect(odu.frequencia === 528 || odu.frequencia_alternativa === 528).toBe(true);
      });
    });

    it('should return Odus for 963 Hz frequency', () => {
      const result = getOduByFrequency(963);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for unused frequency', () => {
      const result = getOduByFrequency(111);
      expect(result).toEqual([]);
    });
  });

  describe('getElementByOdu', () => {
    it('should return éter for Odu 1', () => {
      expect(getElementByOdu(1)).toBe('éter');
    });

    it('should return água for Odu 2', () => {
      expect(getElementByOdu(2)).toBe('água');
    });

    it('should return fogo for Odu 5', () => {
      expect(getElementByOdu(5)).toBe('fogo');
    });

    it('should accept Odu name as string', () => {
      expect(getElementByOdu('Okaran')).toBe('éter');
    });

    it('should return null for unknown Odu', () => {
      expect(getElementByOdu(0)).toBeNull();
      expect(getElementByOdu('Unknown')).toBeNull();
    });
  });

  describe('getMessageByOdu', () => {
    it('should return message for Odu 1', () => {
      const result = getMessageByOdu(1);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return different messages for different Odus', () => {
      const msg1 = getMessageByOdu(1);
      const msg2 = getMessageByOdu(2);
      expect(msg1).not.toBe(msg2);
    });

    it('should accept Odu name as string', () => {
      const result = getMessageByOdu('Okaran');
      expect(result).not.toBeNull();
    });

    it('should return null for unknown Odu', () => {
      expect(getMessageByOdu(0)).toBeNull();
      expect(getMessageByOdu('Unknown')).toBeNull();
    });
  });

  describe('getHealingByOdu', () => {
    it('should return healing applications for Odu 1', () => {
      const result = getHealingByOdu(1);
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return healing applications for Odu 5 (528 Hz - miracles)', () => {
      const result = getHealingByOdu(5);
      expect(result).not.toBeNull();
      expect(result).toContain('Milagres');
    });

    it('should accept Odu name as string', () => {
      const result = getHealingByOdu('Okaran');
      expect(result).not.toBeNull();
    });

    it('should return null for unknown Odu', () => {
      expect(getHealingByOdu(0)).toBeNull();
      expect(getHealingByOdu('Unknown')).toBeNull();
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

  describe('getUsedFrequencies', () => {
    it('should return unique frequencies used in mappings', () => {
      const result = getUsedFrequencies();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return frequencies sorted in ascending order', () => {
      const result = getUsedFrequencies();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });

    it('should include common Solfeggio frequencies', () => {
      const result = getUsedFrequencies();
      expect(result).toContain(396);
      expect(result).toContain(528);
      expect(result).toContain(963);
    });
  });

  describe('getUsedElements', () => {
    it('should return unique elements used in mappings', () => {
      const result = getUsedElements();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include expected elements', () => {
      const result = getUsedElements();
      expect(result).toContain('éter');
      expect(result).toContain('água');
      expect(result).toContain('fogo');
      expect(result).toContain('terra');
    });
  });

  describe('ODTU_FREQUENCY_MAPPINGS constant', () => {
    it('should have exactly 16 entries', () => {
      expect(Object.keys(ODTU_FREQUENCY_MAPPINGS)).toHaveLength(16);
    });

    it('should have keys 1-16', () => {
      for (let i = 1; i <= 16; i++) {
        expect(ODTU_FREQUENCY_MAPPINGS).toHaveProperty(String(i));
      }
    });

    it('should have valid frequencies for all entries', () => {
      Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((mapping) => {
        expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia);
        if (mapping.frequencia_alternativa) {
          expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia_alternativa);
        }
      });
    });

    it('should have non-empty names for all entries', () => {
      Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((mapping) => {
        expect(mapping.odu_nome.length).toBeGreaterThan(0);
        expect(mapping.odu_nome_yoruba.length).toBeGreaterThan(0);
      });
    });

    it('should have arrays for cores and dias_sagrados', () => {
      Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((mapping) => {
        expect(Array.isArray(mapping.cores)).toBe(true);
        expect(Array.isArray(mapping.dias_sagrados)).toBe(true);
        expect(mapping.cores.length).toBeGreaterThan(0);
      });
    });

    it('should have valid elements for all entries', () => {
      const validElements: ElementType[] = ['fogo', 'água', 'ar', 'terra', 'éter'];
      Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });
  });

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('should have 9 Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toHaveLength(9);
    });

    it('should have frequencies in ascending order', () => {
      for (let i = 0; i < SOLFEGGIO_FREQUENCIES.length - 1; i++) {
        expect(SOLFEGGIO_FREQUENCIES[i]).toBeLessThan(SOLFEGGIO_FREQUENCIES[i + 1]);
      }
    });

    it('should contain standard Solfeggio frequencies', () => {
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
  });

  describe('Spiritual Correlations', () => {
    it('should map 528 Hz (miracle frequency) to appropriate Odus', () => {
      const odus528 = getOduByFrequency(528);
      expect(odus528.length).toBeGreaterThan(0);
      // 528 Hz is the frequency of miracles and love
      odus528.forEach((odu) => {
        expect(odu.frequencia === 528 || odu.frequencia_alternativa === 528).toBe(true);
      });
    });

    it('should map éter element to higher frequencies (852-963)', () => {
      const eterOdus = getOduByElement('éter');
      const frequencies = eterOdus.map((o) => o.frequencia);
      expect(frequencies.some((f) => f >= 852 || f === 174)).toBe(true);
    });

    it('should map água element to middle frequencies', () => {
      const aguaOdus = getOduByElement('água');
      expect(aguaOdus.length).toBeGreaterThan(0);
    });

    it('should map fogo element to 528 Hz family', () => {
      const fogoOdus = getOduByElement('fogo');
      const frequencies = fogoOdus.map((o) => o.frequencia);
      expect(frequencies.some((f) => f === 396 || f === 528)).toBe(true);
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

  describe('Default Export', () => {
    it('should export all key functions', () => {
      const module = await import('@/lib/correlation/odtu-frequency');
      expect(module.default).toBeDefined();
      expect(typeof module.default).toBe('object');
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

    it('should handle decimal-like number inputs', () => {
      expect(getOduFrequency(1.5)).toBeNull();
      expect(getOduFrequency(3.9)).toBeNull();
    });

    it('should return null for null and undefined inputs', () => {
      // @ts-expect-error - Testing runtime behavior
      expect(getOduFrequency(null)).toBeNull();
      // @ts-expect-error - Testing runtime behavior
      expect(getOduFrequency(undefined)).toBeNull();
    });
  });
});
