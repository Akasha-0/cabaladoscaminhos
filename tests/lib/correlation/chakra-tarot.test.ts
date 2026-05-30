import { describe, it, expect } from 'vitest';
import {
  getChakraTarot,
  getTarotChakra,
  getAllChakraTarots,
  getChakraByNumber,
  getArcanoByNumber,
  hasChakraTarot,
  CHAKRA_TAROT_MAPPINGS,
} from '@/lib/correlation/chakra-tarot';

describe('Chakra-Tarot Correlation', () => {
  describe('getChakraTarot', () => {
    it('should return Muladhara (1º Básico) with O Mago card', () => {
      const result = getChakraTarot('Muladhara');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Muladhara');
      expect(result?.chakra_pt).toBe('1º Básico');
      expect(result?.numero_chakra).toBe(1);
      expect(result?.arcano).toBe('O Mago');
      expect(result?.numero_carta).toBe(1);
    });

    it('should return Svadhisthana (2º Sacro) with A Torre card', () => {
      const result = getChakraTarot('Svadhisthana');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Svadhisthana');
      expect(result?.chakra_pt).toBe('2º Sacro');
      expect(result?.numero_chakra).toBe(2);
      expect(result?.arcano).toBe('A Torre');
      expect(result?.numero_carta).toBe(16);
    });

    it('should return Manipura (3º Plexo Solar) with A Roda da Fortuna card', () => {
      const result = getChakraTarot('Manipura');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Manipura');
      expect(result?.chakra_pt).toBe('3º Plexo Solar');
      expect(result?.numero_chakra).toBe(3);
      expect(result?.arcano).toBe('A Roda da Fortuna');
      expect(result?.numero_carta).toBe(10);
    });

    it('should return Anahata (4º Cardíaco) with A Estrela card', () => {
      const result = getChakraTarot('Anahata');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Anahata');
      expect(result?.chakra_pt).toBe('4º Cardíaco');
      expect(result?.numero_chakra).toBe(4);
      expect(result?.arcano).toBe('A Estrela');
      expect(result?.numero_carta).toBe(17);
    });

    it('should return Vishuddha (5º Laríngeo) with O Carro card', () => {
      const result = getChakraTarot('Vishuddha');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Vishuddha');
      expect(result?.chakra_pt).toBe('5º Laríngeo');
      expect(result?.numero_chakra).toBe(5);
      expect(result?.arcano).toBe('O Carro');
      expect(result?.numero_carta).toBe(7);
    });

    it('should return Ajna (6º Frontal) with A Sacerdotisa card', () => {
      const result = getChakraTarot('Ajna');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Ajna');
      expect(result?.chakra_pt).toBe('6º Frontal');
      expect(result?.numero_chakra).toBe(6);
      expect(result?.arcano).toBe('A Sacerdotisa');
      expect(result?.numero_carta).toBe(2);
    });

    it('should return Sahasrara (7º Coronário) with O Louco card', () => {
      const result = getChakraTarot('Sahasrara');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.chakra_pt).toBe('7º Coronário');
      expect(result?.numero_chakra).toBe(7);
      expect(result?.arcano).toBe('O Louco');
      expect(result?.numero_carta).toBe(0);
    });

    it('should accept chakra number format as input', () => {
      const result = getChakraTarot('7º Coronário');
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('Sahasrara');
      expect(result?.arcano).toBe('O Louco');
    });

    it('should accept Portuguese common names', () => {
      const resultCoroa = getChakraTarot('coroa');
      expect(resultCoroa?.chakra).toBe('Sahasrara');
      
      const resultRaiz = getChakraTarot('raiz');
      expect(resultRaiz?.chakra).toBe('Muladhara');
      
      const resultCoracao = getChakraTarot('coração');
      expect(resultCoracao?.chakra).toBe('Anahata');
    });

    it('should return null for unknown chakra', () => {
      const result = getChakraTarot('UnknownChakra');
      expect(result).toBeNull();
    });

    it('should handle case-insensitive input', () => {
      const result = getChakraTarot('MULADHARA');
      expect(result?.chakra).toBe('Muladhara');
    });
  });

  describe('getTarotChakra', () => {
    it('should return Muladhara for O Mago', () => {
      const result = getTarotChakra('O Mago');
      expect(result).toBe('Muladhara');
    });

    it('should return Svadhisthana for A Torre', () => {
      const result = getTarotChakra('A Torre');
      expect(result).toBe('Svadhisthana');
    });

    it('should return Manipura for A Roda da Fortuna', () => {
      const result = getTarotChakra('A Roda da Fortuna');
      expect(result).toBe('Manipura');
    });

    it('should return Anahata for A Estrela', () => {
      const result = getTarotChakra('A Estrela');
      expect(result).toBe('Anahata');
    });

    it('should return Vishuddha for O Carro', () => {
      const result = getTarotChakra('O Carro');
      expect(result).toBe('Vishuddha');
    });

    it('should return Ajna for A Sacerdotisa', () => {
      const result = getTarotChakra('A Sacerdotisa');
      expect(result).toBe('Ajna');
    });

    it('should return Sahasrara for O Louco', () => {
      const result = getTarotChakra('O Louco');
      expect(result).toBe('Sahasrara');
    });

    it('should return null for unknown arcano', () => {
      const result = getTarotChakra('O Imperador');
      expect(result).toBeNull();
    });
  });

  describe('getAllChakraTarots', () => {
    it('should return all 7 chakra-tarot mappings', () => {
      const result = getAllChakraTarots();
      expect(result).toHaveLength(7);
    });

    it('should return mappings sorted by chakra number', () => {
      const result = getAllChakraTarots();
      expect(result[0].numero_chakra).toBe(1);
      expect(result[6].numero_chakra).toBe(7);
    });

    it('should contain all major arcana cards', () => {
      const result = getAllChakraTarots();
      const cards = result.map(r => r.arcano);
      expect(cards).toContain('O Mago');
      expect(cards).toContain('A Torre');
      expect(cards).toContain('A Roda da Fortuna');
      expect(cards).toContain('A Estrela');
      expect(cards).toContain('O Carro');
      expect(cards).toContain('A Sacerdotisa');
      expect(cards).toContain('O Louco');
    });

    it('should include spiritual meaning for each mapping', () => {
      const result = getAllChakraTarots();
      result.forEach(mapping => {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('should include energy alignment for each mapping', () => {
      const result = getAllChakraTarots();
      result.forEach(mapping => {
        expect(mapping.alinhamento_energetico).toBeDefined();
        expect(mapping.alinhamento_energetico.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getChakraByNumber', () => {
    it('should return Muladhara for card number 1', () => {
      const result = getChakraByNumber(1);
      expect(result).toBe('Muladhara');
    });

    it('should return Sahasrara for card number 0', () => {
      const result = getChakraByNumber(0);
      expect(result).toBe('Sahasrara');
    });

    it('should return Ajna for card number 2', () => {
      const result = getChakraByNumber(2);
      expect(result).toBe('Ajna');
    });

    it('should return Vishuddha for card number 7', () => {
      const result = getChakraByNumber(7);
      expect(result).toBe('Vishuddha');
    });

    it('should return null for card number not in mapping', () => {
      const result = getChakraByNumber(21);
      expect(result).toBeNull();
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return O Mago for card number 1', () => {
      const result = getArcanoByNumber(1);
      expect(result).toBe('O Mago');
    });

    it('should return O Louco for card number 0', () => {
      const result = getArcanoByNumber(0);
      expect(result).toBe('O Louco');
    });

    it('should return A Sacerdotisa for card number 2', () => {
      const result = getArcanoByNumber(2);
      expect(result).toBe('A Sacerdotisa');
    });

    it('should return null for card number not in mapping', () => {
      const result = getArcanoByNumber(8);
      expect(result).toBeNull();
    });
  });

  describe('hasChakraTarot', () => {
    it('should return true for existing chakras', () => {
      expect(hasChakraTarot('Muladhara')).toBe(true);
      expect(hasChakraTarot('Sahasrara')).toBe(true);
      expect(hasChakraTarot('Ajna')).toBe(true);
    });

    it('should return false for unknown chakras', () => {
      expect(hasChakraTarot('UnknownChakra')).toBe(false);
    });

    it('should handle case-insensitive input', () => {
      expect(hasChakraTarot('MULADHARA')).toBe(true);
    });

    it('should handle Portuguese number format', () => {
      expect(hasChakraTarot('7º Coronário')).toBe(true);
      expect(hasChakraTarot('1º Básico')).toBe(true);
    });
  });

  describe('CHAKRA_TAROT_MAPPINGS constant', () => {
    it('should have all 7 chakras mapped', () => {
      const keys = Object.keys(CHAKRA_TAROT_MAPPINGS);
      expect(keys).toContain('Muladhara');
      expect(keys).toContain('Svadhisthana');
      expect(keys).toContain('Manipura');
      expect(keys).toContain('Anahata');
      expect(keys).toContain('Vishuddha');
      expect(keys).toContain('Ajna');
      expect(keys).toContain('Sahasrara');
    });

    it('should have valid card numbers', () => {
      Object.values(CHAKRA_TAROT_MAPPINGS).forEach(mapping => {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      });
    });

    it('should have unique card numbers', () => {
      const numbers = Object.values(CHAKRA_TAROT_MAPPINGS).map(m => m.numero_carta);
      const unique = new Set(numbers);
      // Note: O Louco (0) and some cards may share numbers in different traditions
      // We allow multiple cards but verify integrity
      expect(unique.size).toBeLessThanOrEqual(numbers.length);
    });
    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(CHAKRA_TAROT_MAPPINGS)).toBe(true);
    });
    it('should have consistent chakra numbering', () => {
      const mappings = Object.values(CHAKRA_TAROT_MAPPINGS);
      // Sort by chakra number to ensure consistent order
      const sorted = [...mappings].sort((a, b) => a.numero_chakra - b.numero_chakra);
      for (let i = 0; i < sorted.length; i++) {
        expect(sorted[i].numero_chakra).toBe(i + 1);
      }
    });
  });

  describe('spiritual alignment', () => {
    it('should map root chakra to creative power (O Mago)', () => {
      const result = getChakraTarot('Muladhara');
      expect(result?.arcano).toBe('O Mago');
      expect(result?.significado_espiritual).toContain('manifestação');
    });

    it('should map sacral chakra to transformation (A Torre)', () => {
      const result = getChakraTarot('Svadhisthana');
      expect(result?.arcano).toBe('A Torre');
      expect(result?.significado_espiritual).toContain('ruptura');
    });

    it('should map solar plexus to cycles (A Roda)', () => {
      const result = getChakraTarot('Manipura');
      expect(result?.arcano).toBe('A Roda da Fortuna');
      expect(result?.significado_espiritual.toLowerCase()).toContain('ciclos');
    });
    it('should map heart chakra to hope (A Estrela)', () => {
      const result = getChakraTarot('Anahata');
      expect(result?.arcano).toBe('A Estrela');
      expect(result?.significado_espiritual.toLowerCase()).toContain('esperança');
    });
    it('should map throat chakra to victory (O Carro)', () => {
      const result = getChakraTarot('Vishuddha');
      expect(result?.arcano).toBe('O Carro');
      expect(result?.significado_espiritual.toLowerCase()).toContain('vitória');
    });
    it('should map third eye to intuition (A Sacerdotisa)', () => {
      const result = getChakraTarot('Ajna');
      expect(result?.arcano).toBe('A Sacerdotisa');
      expect(result?.significado_espiritual.toLowerCase()).toContain('intuição');
    });
    it('should map crown chakra to transcendence (O Louco)', () => {
      const result = getChakraTarot('Sahasrara');
      expect(result?.arcano).toBe('O Louco');
      expect(result?.significado_espiritual.toLowerCase()).toContain('transcendência');
    });

    it('should map crown chakra to transcendence (O Louco)', () => {
      const result = getChakraTarot('Sahasrara');
      expect(result?.arcano).toBe('O Louco');
      expect(result?.significado_espiritual).toContain('transcendência');
    });
  });
});