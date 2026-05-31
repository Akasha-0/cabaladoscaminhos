/**
 * Tarot-Chakra Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotChakra,
  getChakraTarot,
  getAllTarotChakras,
  getAllArcanos,
  hasTarotChakra,
  hasChakraTarot,
  getTarotChakrasByElement,
  TAROT_CHAKRA_MAPPINGS,
} from '@/lib/correlation/tarot-chakra';

describe('Tarot-Chakra Correlation', () => {
  describe('getTarotChakra', () => {
    it('should return O Louco mapping with Sahasrara chakra', () => {
      const result = getTarotChakra('O Louco');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Louco');
      expect(result?.chakra).toBe('Sahasrara');
    });

    it('should return O Mago mapping with Sahasrara chakra', () => {
      const result = getTarotChakra('O Mago');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.chakra).toBe('Sahasrara');
    });

    it('should return A Sacerdotisa mapping with Ajna chakra', () => {
      const result = getTarotChakra('A Sacerdotisa');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Sacerdotisa');
      expect(result?.chakra).toBe('Ajna');
    });

    it('should return A Imperatriz mapping with Anahata chakra', () => {
      const result = getTarotChakra('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.chakra).toBe('Anahata');
    });

    it('should return O Imperador mapping with Ajna chakra', () => {
      const result = getTarotChakra('O Imperador');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Imperador');
      expect(result?.chakra).toBe('Ajna');
    });

    it('should return O Carro mapping with Manipura chakra', () => {
      const result = getTarotChakra('O Carro');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Carro');
      expect(result?.chakra).toBe('Manipura');
    });

    it('should return A Morte mapping with Svadhisthana chakra', () => {
      const result = getTarotChakra('A Morte');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Morte');
      expect(result?.chakra).toBe('Svadhisthana');
    });

    it('should return O Diabo mapping with Muladhara chakra', () => {
      const result = getTarotChakra('O Diabo');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Diabo');
      expect(result?.chakra).toBe('Muladhara');
    });

    it('should return A Torre mapping with Muladhara chakra', () => {
      const result = getTarotChakra('A Torre');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Torre');
      expect(result?.chakra).toBe('Muladhara');
    });

    it('should return null for invalid arcano', () => {
      const result = getTarotChakra('Invalid Card');
      expect(result).toBeNull();
    });

    it('should be case-insensitive', () => {
      const result = getTarotChakra('o louco');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Louco');
    });

    it('should accept English names', () => {
      const result = getTarotChakra('the fool');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Louco');
    });
  });

  describe('getChakraTarot', () => {
    it('should return all tarot cards for Sahasrara', () => {
      const result = getChakraTarot('Sahasrara');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.chakra === 'Sahasrara')).toBe(true);
    });

    it('should return all tarot cards for Ajna', () => {
      const result = getChakraTarot('Ajna');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.chakra === 'Ajna')).toBe(true);
    });

    it('should return all tarot cards for Muladhara', () => {
      const result = getChakraTarot('Muladhara');
      expect(result).toBeDefined();
      expect(result.length).toBe(2); // O Diabo and A Torre
      expect(result.every((r) => r.chakra === 'Muladhara')).toBe(true);
    });

    it('should return all tarot cards for Svadhisthana', () => {
      const result = getChakraTarot('Svadhisthana');
      expect(result).toBeDefined();
      expect(result.length).toBe(3); // A Morte, A Temperança, A Lua
      expect(result.every((r) => r.chakra === 'Svadhisthana')).toBe(true);
    });

    it('should accept English chakra names', () => {
      const result = getChakraTarot('third eye');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid chakra', () => {
      const result = getChakraTarot('Invalid Chakra');
      expect(result).toEqual([]);
    });
  });

  describe('getAllTarotChakras', () => {
    it('should return all tarot-chakra mappings', () => {
      const result = getAllTarotChakras();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return 21 Major Arcana cards', () => {
      const result = getAllTarotChakras();
      expect(result.length).toBe(21);
    });

    it('should not return modified array', () => {
      const result1 = getAllTarotChakras();
      const result2 = getAllTarotChakras();
      expect(result1).not.toBe(result2);
    });
  });

  describe('getAllArcanos', () => {
    it('should return all Major Arcana names', () => {
      const result = getAllArcanos();
      expect(result).toBeDefined();
      expect(result.length).toBe(21);
    });

    it('should include O Louco', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Louco');
    });

    it('should include O Mundo', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Mundo');
    });
  });

  describe('hasTarotChakra', () => {
    it('should return true for valid arcano', () => {
      expect(hasTarotChakra('O Louco')).toBe(true);
    });

    it('should return true for case variations', () => {
      expect(hasTarotChakra('O CARRO')).toBe(true);
    });

    it('should return false for invalid arcano', () => {
      expect(hasTarotChakra('Invalid')).toBe(false);
    });
  });

  describe('hasChakraTarot', () => {
    it('should return true for valid chakra', () => {
      expect(hasChakraTarot('Sahasrara')).toBe(true);
    });

    it('should return true for English chakra names', () => {
      expect(hasChakraTarot('crown')).toBe(true);
    });

    it('should return false for invalid chakra', () => {
      expect(hasChakraTarot('Invalid')).toBe(false);
    });
  });

  describe('getTarotChakrasByElement', () => {
    it('should return mappings grouped by element', () => {
      const result = getTarotChakrasByElement();
      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should include Fogo element', () => {
      const result = getTarotChakrasByElement();
      expect(result['Fogo']).toBeDefined();
      expect(result['Fogo'].length).toBeGreaterThan(0);
    });

    it('should include Água element', () => {
      const result = getTarotChakrasByElement();
      expect(result['Água']).toBeDefined();
      expect(result['Água'].length).toBeGreaterThan(0);
    });

    it('should include Terra element', () => {
      const result = getTarotChakrasByElement();
      expect(result['Terra']).toBeDefined();
      expect(result['Terra'].length).toBeGreaterThan(0);
    });
  });

  describe('TAROT_CHAKRA_MAPPINGS constant', () => {
    it('should have all 21 Major Arcana cards', () => {
      expect(Object.keys(TAROT_CHAKRA_MAPPINGS).length).toBe(21);
    });

    it('should have card numbers 0-21', () => {
      const numbers = Object.values(TAROT_CHAKRA_MAPPINGS).map((m) => m.numero_carta);
      expect(numbers).toContain(0); // O Louco
      expect(numbers).toContain(21); // O Mundo
    });

    it('should have all 7 chakras represented', () => {
      const chakras = Object.values(TAROT_CHAKRA_MAPPINGS).map((m) => m.chakra);
      const uniqueChakras = [...new Set(chakras)];
      expect(uniqueChakras).toContain('Sahasrara');
      expect(uniqueChakras).toContain('Ajna');
      expect(uniqueChakras).toContain('Anahata');
      expect(uniqueChakras).toContain('Vishuddha');
      expect(uniqueChakras).toContain('Manipura');
      expect(uniqueChakras).toContain('Svadhisthana');
      expect(uniqueChakras).toContain('Muladhara');
    });
  });

  describe('Spiritual content completeness', () => {
    it('should have temas_espirituais for all cards', () => {
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(mapping.temas_espirituais).toBeDefined();
        expect(mapping.temas_espirituais.length).toBeGreaterThan(0);
      }
    });

    it('should have qualidade_emocional for all cards', () => {
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(mapping.qualidade_emocional).toBeDefined();
        expect(mapping.qualidade_emocional.length).toBeGreaterThan(0);
      }
    });

    it('should have sombra_psicologica for all cards', () => {
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(mapping.sombra_psicologica).toBeDefined();
        expect(mapping.sombra_psicologica.length).toBeGreaterThan(0);
      }
    });

    it('should have afirmacao for all cards', () => {
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        expect(mapping.afirmacao).toBeDefined();
        expect(mapping.afirmacao.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Chakra distribution', () => {
    it('should distribute cards across all 7 chakras', () => {
      const distribution: Record<string, number> = {};
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        distribution[mapping.chakra] = (distribution[mapping.chakra] || 0) + 1;
      }
      expect(Object.keys(distribution).length).toBe(7);
    });

    it('should have at least 2 cards per chakra', () => {
      const distribution: Record<string, number> = {};
      for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
        distribution[mapping.chakra] = (distribution[mapping.chakra] || 0) + 1;
      }
      for (const count of Object.values(distribution)) {
        expect(count).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
