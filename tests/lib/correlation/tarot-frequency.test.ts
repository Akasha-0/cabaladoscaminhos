
/**
 * Tarot-Frequency Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotFrequency,
  getFrequencyFromTarot,
  getArcanoByNumber,
  getFrequencyByNumber,
  getAllTarotFrequencies,
  getAllArcanos,
  getAllFrequencies,
  hasTarotFrequency,
  getChakraByTarot,
  getChakraNameByTarot,
  getElementByTarot,
  getTarotsByElement,
  getTarotsByFrequency,
  getTarotsByChakra,
  getEnergiaEspiritual,
  getVibracao,
  TAROT_FREQUENCY_MAP,
} from '@/lib/correlation/tarot-frequency';

describe('Tarot-Frequency Correlation', () => {
  describe('getTarotFrequency', () => {
    it('should return O Louco mapping with 396 Hz frequency', () => {
      const mapping = getTarotFrequency('O Louco');
      expect(mapping).toBeDefined();
      expect(mapping?.frequencia).toBe(396);
      expect(mapping?.numero_carta).toBe(0);
      expect(mapping?.chakra_numero).toBe(1);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should return O Mago mapping with 417 Hz frequency', () => {
      const mapping = getTarotFrequency('O Mago');
      expect(mapping).toBeDefined();
      expect(mapping?.frequencia).toBe(417);
      expect(mapping?.numero_carta).toBe(1);
      expect(mapping?.chakra_numero).toBe(2);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should return A Sacerdotisa mapping with 528 Hz frequency', () => {
      const mapping = getTarotFrequency('A Sacerdotisa');
      expect(mapping).toBeDefined();
      expect(mapping?.frequencia).toBe(528);
      expect(mapping?.numero_carta).toBe(2);
      expect(mapping?.chakra_numero).toBe(3);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return A Imperatriz mapping with 639 Hz frequency', () => {
      const mapping = getTarotFrequency('A Imperatriz');
      expect(mapping).toBeDefined();
      expect(mapping?.frequencia).toBe(639);
      expect(mapping?.numero_carta).toBe(3);
      expect(mapping?.chakra_numero).toBe(4);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return O Imperador mapping with 741 Hz frequency', () => {
      const mapping = getTarotFrequency('O Imperador');
      expect(mapping).toBeDefined();
      expect(mapping?.frequencia).toBe(741);
      expect(mapping?.numero_carta).toBe(4);
      expect(mapping?.chakra_numero).toBe(5);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return O Hierofante mapping with 852 Hz frequency', () => {
      const mapping = getTarotFrequency('O Hierofante');
      expect(mapping).toBeDefined();
      expect(mapping?.frequencia).toBe(852);
      expect(mapping?.numero_carta).toBe(5);
      expect(mapping?.chakra_numero).toBe(6);
      expect(mapping?.elemento).toBe('Éter');
    });

    it('should return Os Enamorados mapping with 963 Hz frequency', () => {
      const mapping = getTarotFrequency('Os Enamorados');
      expect(mapping).toBeDefined();
      expect(mapping?.frequencia).toBe(963);
      expect(mapping?.numero_carta).toBe(6);
      expect(mapping?.chakra_numero).toBe(7);
      expect(mapping?.elemento).toBe('Éter');
    });

    it('should return A Torre mapping with 528 Hz frequency', () => {
      const mapping = getTarotFrequency('A Torre');
      expect(mapping).toBeDefined();
      expect(mapping?.frequencia).toBe(528);
      expect(mapping?.numero_carta).toBe(16);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return O Sol mapping with 852 Hz frequency', () => {
      const mapping = getTarotFrequency('O Sol');
      expect(mapping).toBeDefined();
      expect(mapping?.frequencia).toBe(852);
      expect(mapping?.numero_carta).toBe(19);
      expect(mapping?.elemento).toBe('Éter');
    });

    it('should return O Mundo mapping with 963 Hz frequency', () => {
      const mapping = getTarotFrequency('O Mundo');
      expect(mapping).toBeDefined();
      expect(mapping?.frequencia).toBe(963);
      expect(mapping?.numero_carta).toBe(21);
      expect(mapping?.chakra_numero).toBe(7);
      expect(mapping?.elemento).toBe('Éter');
    });

    it('should return null for unknown arcano', () => {
      expect(getTarotFrequency('Arcana Desconhecida')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(getTarotFrequency('')).toBeNull();
    });
  });

  describe('getFrequencyFromTarot', () => {
    it('should return 396 Hz for O Louco', () => {
      expect(getFrequencyFromTarot('O Louco')).toBe(396);
    });
    it('should return 417 Hz for O Mago', () => {
      expect(getFrequencyFromTarot('O Mago')).toBe(417);
    });
    it('should return 528 Hz for A Sacerdotisa', () => {
      expect(getFrequencyFromTarot('A Sacerdotisa')).toBe(528);
    });
    it('should return 639 Hz for A Imperatriz', () => {
      expect(getFrequencyFromTarot('A Imperatriz')).toBe(639);
    });
    it('should return 741 Hz for O Imperador', () => {
      expect(getFrequencyFromTarot('O Imperador')).toBe(741);
    });
    it('should return 852 Hz for O Hierofante', () => {
      expect(getFrequencyFromTarot('O Hierofante')).toBe(852);
    });
    it('should return 963 Hz for Os Enamorados', () => {
      expect(getFrequencyFromTarot('Os Enamorados')).toBe(963);
    });
    it('should return null for unknown arcano', () => {
      expect(getFrequencyFromTarot('Arcana Fantasma')).toBeNull();
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return O Louco for card number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });
    it('should return O Mago for card number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });
    it('should return A Imperatriz for card number 3', () => {
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
    });
    it('should return O Sol for card number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });
    it('should return O Mundo for card number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });
    it('should return null for out of range number', () => {
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  describe('getFrequencyByNumber', () => {
    it('should return 396 Hz for card number 0', () => {
      expect(getFrequencyByNumber(0)).toBe(396);
    });
    it('should return 417 Hz for card number 1', () => {
      expect(getFrequencyByNumber(1)).toBe(417);
    });
    it('should return 963 Hz for card number 21', () => {
      expect(getFrequencyByNumber(21)).toBe(963);
    });
    it('should return null for out of range number', () => {
      expect(getFrequencyByNumber(22)).toBeNull();
    });
  });

  describe('getAllTarotFrequencies', () => {
    it('should return all 22 Major Arcana cards', () => {
      const all = getAllTarotFrequencies();
      expect(all).toHaveLength(22);
    });
    it('should return cards sorted by card number', () => {
      const all = getAllTarotFrequencies();
      for (let i = 1; i < all.length; i++) {
        expect(all[i].numero_carta).toBeGreaterThan(all[i - 1].numero_carta);
      }
    });
    it('should include first and last cards', () => {
      const all = getAllTarotFrequencies();
      expect(all[0].arcano).toBe('O Louco');
      expect(all[21].arcano).toBe('O Mundo');
    });
  });

  describe('getAllArcanos', () => {
    it('should return all 22 arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toHaveLength(22);
    });
    it('should return arcanos sorted by card number', () => {
      const arcanos = getAllArcanos();
      expect(arcanos[0]).toBe('O Louco');
      expect(arcanos[21]).toBe('O Mundo');
    });
  });

  describe('getAllFrequencies', () => {
    it('should return all 7 Solfeggio frequencies', () => {
      const frequencies = getAllFrequencies();
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(963);
    });
  });

  describe('hasTarotFrequency', () => {
    it('should return true for existing arcano', () => {
      expect(hasTarotFrequency('O Louco')).toBe(true);
      expect(hasTarotFrequency('O Sol')).toBe(true);
      expect(hasTarotFrequency('O Mundo')).toBe(true);
    });
    it('should return false for unknown arcano', () => {
      expect(hasTarotFrequency('Arcana Inventada')).toBe(false);
    });
    it('should return false for empty string', () => {
      expect(hasTarotFrequency('')).toBe(false);
    });
  });

  describe('getChakraByTarot', () => {
    it('should return chakra 1 for O Louco', () => {
      expect(getChakraByTarot('O Louco')).toBe(1);
    });
    it('should return chakra 7 for Os Enamorados', () => {
      expect(getChakraByTarot('Os Enamorados')).toBe(7);
    });
    it('should return null for unknown arcano', () => {
      expect(getChakraByTarot('Arcana Fantasma')).toBeNull();
    });
  });

  describe('getChakraNameByTarot', () => {
    it('should return Muladhara for O Louco', () => {
      expect(getChakraNameByTarot('O Louco')).toBe('Muladhara');
    });
    it('should return Sahasrara for Os Enamorados', () => {
      expect(getChakraNameByTarot('Os Enamorados')).toBe('Sahasrara');
    });
    it('should return null for unknown arcano', () => {
      expect(getChakraNameByTarot('Arcana Fantasma')).toBeNull();
    });
  });

  describe('getElementByTarot', () => {
    it('should return Terra for O Louco', () => {
      expect(getElementByTarot('O Louco')).toBe('Terra');
    });
    it('should return Água for O Mago', () => {
      expect(getElementByTarot('O Mago')).toBe('Água');
    });
    it('should return Fogo for A Sacerdotisa', () => {
      expect(getElementByTarot('A Sacerdotisa')).toBe('Fogo');
    });
    it('should return Éter for O Hierofante', () => {
      expect(getElementByTarot('O Hierofante')).toBe('Éter');
    });
  });

  describe('getTarotsByElement', () => {
    it('should return all Terra cards', () => {
      const cards = getTarotsByElement('Terra');
      expect(cards.length).toBeGreaterThan(0);
      cards.forEach((card) => {
        expect(card.elemento).toBe('Terra');
      });
    });
    it('should return all Éter cards', () => {
      const cards = getTarotsByElement('Éter');
      expect(cards.length).toBeGreaterThan(0);
      cards.forEach((card) => {
        expect(card.elemento).toBe('Éter');
      });
    });
    it('should return empty array for unknown element', () => {
      expect(getTarotsByElement('Elemento Inventado')).toEqual([]);
    });
  });

  describe('getTarotsByFrequency', () => {
    it('should return all cards with 396 Hz frequency', () => {
      const cards = getTarotsByFrequency(396);
      expect(cards.length).toBeGreaterThan(0);
      cards.forEach((card) => {
        expect(card.frequencia).toBe(396);
      });
    });
    it('should return empty array for non-Solfeggio frequency', () => {
      expect(getTarotsByFrequency(440)).toEqual([]);
    });
  });

  describe('getTarotsByChakra', () => {
    it('should return all cards with chakra 1', () => {
      const cards = getTarotsByChakra(1);
      expect(cards.length).toBeGreaterThan(0);
      cards.forEach((card) => {
        expect(card.chakra_numero).toBe(1);
      });
    });
    it('should return empty array for invalid chakra', () => {
      expect(getTarotsByChakra(8)).toEqual([]);
    });
  });

  describe('getEnergiaEspiritual', () => {
    it('should return spiritual energy for O Louco', () => {
      const energia = getEnergiaEspiritual('O Louco');
      expect(energia).toBeDefined();
      expect(typeof energia).toBe('string');
    });
    it('should return null for unknown arcano', () => {
      expect(getEnergiaEspiritual('Arcana Fantasma')).toBeNull();
    });
  });

  describe('getVibracao', () => {
    it('should return vibration theme for O Louco', () => {
      const vibracao = getVibracao('O Louco');
      expect(vibracao).toBeDefined();
      expect(typeof vibracao).toBe('string');
    });
    it('should return null for unknown arcano', () => {
      expect(getVibracao('Arcana Fantasma')).toBeNull();
    });
  });

  describe('TAROT_FREQUENCY_MAP', () => {
    it('should be a frozen object', () => {
      expect(Object.isFrozen(TAROT_FREQUENCY_MAP)).toBe(true);
    });
    it('should have all 22 Major Arcana cards', () => {
      expect(Object.keys(TAROT_FREQUENCY_MAP)).toHaveLength(22);
    });
    it('should have O Louco at card number 0', () => {
      expect(TAROT_FREQUENCY_MAP['O Louco'].numero_carta).toBe(0);
    });
    it('should have O Mundo at card number 21', () => {
      expect(TAROT_FREQUENCY_MAP['O Mundo'].numero_carta).toBe(21);
    });
    it('should contain all Solfeggio frequencies', () => {
      const frequencies = new Set(Object.values(TAROT_FREQUENCY_MAP).map((m) => m.frequencia));
      expect(frequencies.has(396)).toBe(true);
      expect(frequencies.has(417)).toBe(true);
      expect(frequencies.has(528)).toBe(true);
      expect(frequencies.has(639)).toBe(true);
      expect(frequencies.has(741)).toBe(true);
      expect(frequencies.has(852)).toBe(true);
      expect(frequencies.has(963)).toBe(true);
    });
  });

  describe('Frequency correlation consistency', () => {
    it('should have unique card numbers for all 22 cards', () => {
      const numbers = Object.values(TAROT_FREQUENCY_MAP).map((m) => m.numero_carta);
      const unique = new Set(numbers);
      expect(unique.size).toBe(22);
    });
    it('should have valid chakra numbers (1-7)', () => {
      Object.values(TAROT_FREQUENCY_MAP).forEach((mapping) => {
        expect(mapping.chakra_numero).toBeGreaterThanOrEqual(1);
        expect(mapping.chakra_numero).toBeLessThanOrEqual(7);
      });
    });
    it('should have valid elements', () => {
      const validElements = ['Terra', 'Água', 'Fogo', 'Ar', 'Éter'];
      Object.values(TAROT_FREQUENCY_MAP).forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });
  });
});
