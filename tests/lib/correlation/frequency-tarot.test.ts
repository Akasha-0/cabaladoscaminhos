import { describe, it, expect } from 'vitest';
import {
  getFrequencyTarot,
  getTarotFrequency,
  getFrequencyByNumber,
  getArcanoByFrequencyNumber,
  getAllFrequencyTarots,
  getAllFrequencies,
  hasFrequencyTarot,
  getAllArcanos,
  getChakraByFrequency,
  getElementByFrequency,
  FREQUENCY_TAROT_MAP,
  SOLFEGGIO_FREQUENCIES,
} from '@/lib/correlation/frequency-tarot';

describe('FrequencyTarot Correlation', () => {
  describe('getFrequencyTarot', () => {
    it('should return mapping for 396 Hz (O Louco)', () => {
      const result = getFrequencyTarot(396);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Louco');
      expect(result?.numero_carta).toBe(0);
      expect(result?.chakra).toBe('1º Básico');
      expect(result?.chakra_numero).toBe(1);
      expect(result?.elemento).toBe('Terra');
      expect(result?.significado_espiritual).toBeDefined();
      expect(result?.interpretacao).toBeDefined();
    });

    it('should return mapping for 417 Hz (O Mago)', () => {
      const result = getFrequencyTarot(417);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.numero_carta).toBe(1);
      expect(result?.chakra).toBe('2º Sacro');
      expect(result?.chakra_numero).toBe(2);
      expect(result?.elemento).toBe('Água');
    });

    it('should return mapping for 528 Hz (A Sacerdotisa)', () => {
      const result = getFrequencyTarot(528);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Sacerdotisa');
      expect(result?.numero_carta).toBe(2);
      expect(result?.chakra).toBe('3º Plexo Solar');
      expect(result?.chakra_numero).toBe(3);
      expect(result?.elemento).toBe('Fogo');
    });

    it('should return mapping for 639 Hz (A Imperatriz)', () => {
      const result = getFrequencyTarot(639);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.numero_carta).toBe(3);
      expect(result?.chakra).toBe('4º Cardíaco');
      expect(result?.chakra_numero).toBe(4);
      expect(result?.elemento).toBe('Ar / Água');
    });

    it('should return mapping for 741 Hz (O Hierofante)', () => {
      const result = getFrequencyTarot(741);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Hierofante');
      expect(result?.numero_carta).toBe(5);
      expect(result?.chakra).toBe('5º Laríngeo');
      expect(result?.chakra_numero).toBe(5);
      expect(result?.elemento).toBe('Ar');
    });

    it('should return mapping for 852 Hz (A Estrela)', () => {
      const result = getFrequencyTarot(852);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Estrela');
      expect(result?.numero_carta).toBe(17);
      expect(result?.chakra).toBe('6º Frontal');
      expect(result?.chakra_numero).toBe(6);
      expect(result?.elemento).toBe('Éter / Ar');
    });

    it('should return mapping for 963 Hz (O Sol)', () => {
      const result = getFrequencyTarot(963);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Sol');
      expect(result?.numero_carta).toBe(19);
      expect(result?.chakra).toBe('7º Coronário');
      expect(result?.chakra_numero).toBe(7);
      expect(result?.elemento).toBe('Éter (Quintessência)');
    });

    it('should return null for non-Solfeggio frequencies', () => {
      expect(getFrequencyTarot(440)).toBeNull();
      expect(getFrequencyTarot(100)).toBeNull();
      expect(getFrequencyTarot(1000)).toBeNull();
    });

    it('should have significado_espiritual for each frequency', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const result = getFrequencyTarot(freq);
        expect(result?.significado_espiritual).toBeDefined();
        expect(result?.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('should have interpretacao for each frequency', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const result = getFrequencyTarot(freq);
        expect(result?.interpretacao).toBeDefined();
        expect(result?.interpretacao.length).toBeGreaterThan(0);
      });
    });
  });

  describe('FREQUENCY_TAROT_MAP', () => {
    it('should have exactly 7 entries for the 7 Solfeggio frequencies', () => {
      expect(Object.keys(FREQUENCY_TAROT_MAP).length).toBe(7);
    });

    it('should contain all Solfeggio frequencies', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        expect(FREQUENCY_TAROT_MAP[freq]).toBeDefined();
      });
    });

    it('should have valid card numbers (0-21)', () => {
      Object.values(FREQUENCY_TAROT_MAP).forEach((mapping) => {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      });
    });

    it('should have unique card numbers', () => {
      const numbers = Object.values(FREQUENCY_TAROT_MAP).map((m) => m.numero_carta);
      const unique = new Set(numbers);
      expect(unique.size).toBe(numbers.length);
    });
  });

  describe('getTarotFrequency', () => {
    it('should return 396 for O Louco', () => {
      expect(getTarotFrequency('O Louco')).toBe(396);
    });

    it('should return 417 for O Mago', () => {
      expect(getTarotFrequency('O Mago')).toBe(417);
    });

    it('should return 528 for A Sacerdotisa', () => {
      expect(getTarotFrequency('A Sacerdotisa')).toBe(528);
    });

    it('should return 639 for A Imperatriz', () => {
      expect(getTarotFrequency('A Imperatriz')).toBe(639);
    });

    it('should return 741 for O Hierofante', () => {
      expect(getTarotFrequency('O Hierofante')).toBe(741);
    });

    it('should return 852 for A Estrela', () => {
      expect(getTarotFrequency('A Estrela')).toBe(852);
    });

    it('should return 963 for O Sol', () => {
      expect(getTarotFrequency('O Sol')).toBe(963);
    });

    it('should return null for non-existent arcano', () => {
      expect(getTarotFrequency('O Imperador')).toBeNull();
      expect(getTarotFrequency('A Morte')).toBeNull();
    });
  });

  describe('getFrequencyByNumber', () => {
    it('should return 396 for card number 0', () => {
      expect(getFrequencyByNumber(0)).toBe(396);
    });

    it('should return 417 for card number 1', () => {
      expect(getFrequencyByNumber(1)).toBe(417);
    });

    it('should return 528 for card number 2', () => {
      expect(getFrequencyByNumber(2)).toBe(528);
    });

    it('should return 852 for card number 17', () => {
      expect(getFrequencyByNumber(17)).toBe(852);
    });

    it('should return 963 for card number 19', () => {
      expect(getFrequencyByNumber(19)).toBe(963);
    });

    it('should return null for non-existent card number', () => {
      expect(getFrequencyByNumber(4)).toBeNull();
      expect(getFrequencyByNumber(21)).toBeNull();
    });
  });

  describe('getArcanoByFrequencyNumber', () => {
    it('should return O Louco for card number 0', () => {
      expect(getArcanoByFrequencyNumber(0)).toBe('O Louco');
    });

    it('should return O Sol for card number 19', () => {
      expect(getArcanoByFrequencyNumber(19)).toBe('O Sol');
    });

    it('should return null for non-existent card number', () => {
      expect(getArcanoByFrequencyNumber(4)).toBeNull();
    });
  });

  describe('getAllFrequencyTarots', () => {
    it('should return all 7 mappings', () => {
      const result = getAllFrequencyTarots();
      expect(result.length).toBe(7);
    });

    it('should return array with all required fields', () => {
      const result = getAllFrequencyTarots();
      result.forEach((mapping) => {
        expect(mapping.frequencia).toBeDefined();
        expect(mapping.arcano).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.interpretacao).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_numero).toBeDefined();
        expect(mapping.elemento).toBeDefined();
      });
    });
  });

  describe('getAllFrequencies', () => {
    it('should return all 7 frequencies', () => {
      const result = getAllFrequencies();
      expect(result.length).toBe(7);
    });

    it('should contain ascending frequencies', () => {
      const result = getAllFrequencies();
      expect(result).toEqual([396, 417, 528, 639, 741, 852, 963]);
    });
  });

  describe('hasFrequencyTarot', () => {
    it('should return true for valid Solfeggio frequencies', () => {
      expect(hasFrequencyTarot(396)).toBe(true);
      expect(hasFrequencyTarot(417)).toBe(true);
      expect(hasFrequencyTarot(528)).toBe(true);
      expect(hasFrequencyTarot(639)).toBe(true);
      expect(hasFrequencyTarot(741)).toBe(true);
      expect(hasFrequencyTarot(852)).toBe(true);
      expect(hasFrequencyTarot(963)).toBe(true);
    });

    it('should return false for non-Solfeggio frequencies', () => {
      expect(hasFrequencyTarot(440)).toBe(false);
      expect(hasFrequencyTarot(100)).toBe(false);
      expect(hasFrequencyTarot(1000)).toBe(false);
    });
  });

  describe('getAllArcanos', () => {
    it('should return all 7 arcano names', () => {
      const result = getAllArcanos();
      expect(result.length).toBe(7);
    });

    it('should contain the expected arcano names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Louco');
      expect(result).toContain('O Mago');
      expect(result).toContain('A Sacerdotisa');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Hierofante');
      expect(result).toContain('A Estrela');
      expect(result).toContain('O Sol');
    });
  });

  describe('getChakraByFrequency', () => {
    it('should return chakra number 1 for 396 Hz', () => {
      expect(getChakraByFrequency(396)).toBe(1);
    });

    it('should return chakra number 7 for 963 Hz', () => {
      expect(getChakraByFrequency(963)).toBe(7);
    });

    it('should return null for non-Solfeggio frequencies', () => {
      expect(getChakraByFrequency(440)).toBeNull();
    });
  });

  describe('getElementByFrequency', () => {
    it('should return Terra for 396 Hz', () => {
      expect(getElementByFrequency(396)).toBe('Terra');
    });

    it('should return Éter (Quintessência) for 963 Hz', () => {
      expect(getElementByFrequency(963)).toBe('Éter (Quintessência)');
    });

    it('should return null for non-Solfeggio frequencies', () => {
      expect(getElementByFrequency(440)).toBeNull();
    });
  });
});