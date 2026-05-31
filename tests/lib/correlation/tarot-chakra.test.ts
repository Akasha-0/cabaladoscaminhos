/**
 * Tarot-Chakra Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotChakraMapping,
  getChakraByTarot,
  getAllTarotChakras,
  getAllArcanos,
  hasTarotChakra,
  getArcanoByNumber,
  getChakraByNumber,
  getChakraPtByTarot,
  getArcanosByChakra,
  TAROT_CHAKRA_MAPPINGS,
  type TarotChakraMapping,
} from '@/lib/correlation/tarot-chakra';

describe('Tarot-Chakra Correlation', () => {
  describe('getTarotChakraMapping', () => {
    it('should return O Louco mapping with Sahasrara', () => {
      const mapping = getTarotChakraMapping('O Louco');
      expect(mapping).toBeDefined();
      expect(mapping?.chakra).toBe('Sahasrara');
      expect(mapping?.numero_carta).toBe(0);
      expect(mapping?.chakra_pt).toBe('7º Coronário');
    });

    it('should return O Mago mapping with Muladhara', () => {
      const mapping = getTarotChakraMapping('O Mago');
      expect(mapping).toBeDefined();
      expect(mapping?.chakra).toBe('Muladhara');
      expect(mapping?.numero_carta).toBe(1);
      expect(mapping?.chakra_pt).toBe('1º Básico');
    });

    it('should return A Sacerdotisa mapping with Ajna', () => {
      const mapping = getTarotChakraMapping('A Sacerdotisa');
      expect(mapping).toBeDefined();
      expect(mapping?.chakra).toBe('Ajna');
      expect(mapping?.numero_carta).toBe(2);
      expect(mapping?.chakra_pt).toBe('6º Frontal');
    });

    it('should return A Imperatriz mapping with Svadhisthana', () => {
      const mapping = getTarotChakraMapping('A Imperatriz');
      expect(mapping).toBeDefined();
      expect(mapping?.chakra).toBe('Svadhisthana');
      expect(mapping?.numero_carta).toBe(3);
      expect(mapping?.chakra_pt).toBe('2º Sacro');
    });

    it('should return O Imperador mapping with Manipura', () => {
      const mapping = getTarotChakraMapping('O Imperador');
      expect(mapping).toBeDefined();
      expect(mapping?.chakra).toBe('Manipura');
      expect(mapping?.numero_carta).toBe(4);
      expect(mapping?.chakra_pt).toBe('3º Plexo Solar');
    });

    it('should return O Carro mapping with Vishuddha', () => {
      const mapping = getTarotChakraMapping('O Carro');
      expect(mapping).toBeDefined();
      expect(mapping?.chakra).toBe('Vishuddha');
      expect(mapping?.numero_carta).toBe(7);
      expect(mapping?.chakra_pt).toBe('5º Laríngeo');
    });

    it('should return A Estrela mapping with Anahata', () => {
      const mapping = getTarotChakraMapping('A Estrela');
      expect(mapping).toBeDefined();
      expect(mapping?.chakra).toBe('Anahata');
      expect(mapping?.numero_carta).toBe(17);
      expect(mapping?.chakra_pt).toBe('4º Cardíaco');
    });

    it('should return A Torre mapping with Svadhisthana', () => {
      const mapping = getTarotChakraMapping('A Torre');
      expect(mapping).toBeDefined();
      expect(mapping?.chakra).toBe('Svadhisthana');
      expect(mapping?.numero_carta).toBe(16);
      expect(mapping?.chakra_pt).toBe('2º Sacro');
    });

    it('should return A Roda da Fortuna mapping with Manipura', () => {
      const mapping = getTarotChakraMapping('A Roda da Fortuna');
      expect(mapping).toBeDefined();
      expect(mapping?.chakra).toBe('Manipura');
      expect(mapping?.numero_carta).toBe(10);
      expect(mapping?.chakra_pt).toBe('3º Plexo Solar');
    });

    it('should return null for non-existent arcano', () => {
      const mapping = getTarotChakraMapping('O Enforcado');
      expect(mapping).toBeNull();
    });

    it('should handle case-insensitive arcano names', () => {
      const mapping1 = getTarotChakraMapping('o louco');
      const mapping2 = getTarotChakraMapping('O LOUCO');
      expect(mapping1).toBeDefined();
      expect(mapping2).toBeDefined();
      expect(mapping1?.chakra).toBe(mapping2?.chakra);
    });
  });

  describe('getChakraByTarot', () => {
    it('should return Sahasrara for O Louco', () => {
      const chakra = getChakraByTarot('O Louco');
      expect(chakra).toBe('Sahasrara');
    });

    it('should return Muladhara for O Mago', () => {
      const chakra = getChakraByTarot('O Mago');
      expect(chakra).toBe('Muladhara');
    });

    it('should return Ajna for A Sacerdotisa', () => {
      const chakra = getChakraByTarot('A Sacerdotisa');
      expect(chakra).toBe('Ajna');
    });

    it('should return Vishuddha for O Carro', () => {
      const chakra = getChakraByTarot('O Carro');
      expect(chakra).toBe('Vishuddha');
    });

    it('should return Anahata for A Estrela', () => {
      const chakra = getChakraByTarot('A Estrela');
      expect(chakra).toBe('Anahata');
    });

    it('should return null for non-existent arcano', () => {
      const chakra = getChakraByTarot('O Julgamento');
      expect(chakra).toBeNull();
    });
  });

  describe('getAllTarotChakras', () => {
    it('should return all 9 tarot-chakra mappings', () => {
      const mappings = getAllTarotChakras();
      expect(mappings).toHaveLength(9);
    });

    it('should return mappings sorted by card number', () => {
      const mappings = getAllTarotChakras();
      const numbers = mappings.map(m => m.numero_carta);
      expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    });

    it('should contain expected arcano names', () => {
      const mappings = getAllTarotChakras();
      const arcanoNames = mappings.map(m => m.arcano);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('O Mago');
      expect(arcanoNames).toContain('A Sacerdotisa');
      expect(arcanoNames).toContain('O Carro');
      expect(arcanoNames).toContain('A Estrela');
    });
  });

  describe('getAllArcanos', () => {
    it('should return all 9 arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toHaveLength(9);
    });

    it('should contain expected arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toContain('O Louco');
      expect(arcanos).toContain('O Mago');
      expect(arcanos).toContain('A Sacerdotisa');
      expect(arcanos).toContain('A Imperatriz');
      expect(arcanos).toContain('O Imperador');
      expect(arcanos).toContain('O Carro');
      expect(arcanos).toContain('A Torre');
      expect(arcanos).toContain('A Roda da Fortuna');
      expect(arcanos).toContain('A Estrela');
    });
  });

  describe('hasTarotChakra', () => {
    it('should return true for existing arcano', () => {
      expect(hasTarotChakra('O Louco')).toBe(true);
      expect(hasTarotChakra('O Mago')).toBe(true);
      expect(hasTarotChakra('A Sacerdotisa')).toBe(true);
    });

    it('should return false for non-existent arcano', () => {
      expect(hasTarotChakra('O Enforcado')).toBe(false);
      expect(hasTarotChakra('A Justiça')).toBe(false);
    });

    it('should handle case-insensitive input', () => {
      expect(hasTarotChakra('o louco')).toBe(true);
      expect(hasTarotChakra('O LOUCO')).toBe(true);
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return O Louco for card 0', () => {
      const arcano = getArcanoByNumber(0);
      expect(arcano).toBe('O Louco');
    });

    it('should return O Mago for card 1', () => {
      const arcano = getArcanoByNumber(1);
      expect(arcano).toBe('O Mago');
    });

    it('should return A Sacerdotisa for card 2', () => {
      const arcano = getArcanoByNumber(2);
      expect(arcano).toBe('A Sacerdotisa');
    });

    it('should return O Carro for card 7', () => {
      const arcano = getArcanoByNumber(7);
      expect(arcano).toBe('O Carro');
    });

    it('should return A Estrela for card 17', () => {
      const arcano = getArcanoByNumber(17);
      expect(arcano).toBe('A Estrela');
    });

    it('should return null for card not in mapping', () => {
      const arcano = getArcanoByNumber(5);
      expect(arcano).toBeNull();
    });
  });

  describe('getChakraByNumber', () => {
    it('should return Sahasrara for card 0', () => {
      const chakra = getChakraByNumber(0);
      expect(chakra).toBe('Sahasrara');
    });

    it('should return Muladhara for card 1', () => {
      const chakra = getChakraByNumber(1);
      expect(chakra).toBe('Muladhara');
    });

    it('should return Ajna for card 2', () => {
      const chakra = getChakraByNumber(2);
      expect(chakra).toBe('Ajna');
    });

    it('should return Vishuddha for card 7', () => {
      const chakra = getChakraByNumber(7);
      expect(chakra).toBe('Vishuddha');
    });

    it('should return null for card not in mapping', () => {
      const chakra = getChakraByNumber(11);
      expect(chakra).toBeNull();
    });
  });

  describe('getChakraPtByTarot', () => {
    it('should return 7º Coronário for O Louco', () => {
      const chakraPt = getChakraPtByTarot('O Louco');
      expect(chakraPt).toBe('7º Coronário');
    });

    it('should return 1º Básico for O Mago', () => {
      const chakraPt = getChakraPtByTarot('O Mago');
      expect(chakraPt).toBe('1º Básico');
    });

    it('should return 6º Frontal for A Sacerdotisa', () => {
      const chakraPt = getChakraPtByTarot('A Sacerdotisa');
      expect(chakraPt).toBe('6º Frontal');
    });

    it('should return 5º Laríngeo for O Carro', () => {
      const chakraPt = getChakraPtByTarot('O Carro');
      expect(chakraPt).toBe('5º Laríngeo');
    });

    it('should return null for non-existent arcano', () => {
      const chakraPt = getChakraPtByTarot('O Sol');
      expect(chakraPt).toBeNull();
    });
  });

  describe('getArcanosByChakra', () => {
    it('should return O Louco for Sahasrara', () => {
      const arcanos = getArcanosByChakra('Sahasrara');
      expect(arcanos).toContain('O Louco');
    });

    it('should return O Mago for Muladhara', () => {
      const arcanos = getArcanosByChakra('Muladhara');
      expect(arcanos).toContain('O Mago');
    });

    it('should return A Sacerdotisa for Ajna', () => {
      const arcanos = getArcanosByChakra('Ajna');
      expect(arcanos).toContain('A Sacerdotisa');
    });

    it('should return O Carro for Vishuddha', () => {
      const arcanos = getArcanosByChakra('Vishuddha');
      expect(arcanos).toContain('O Carro');
    });

    it('should return A Estrela for Anahata', () => {
      const arcanos = getArcanosByChakra('Anahata');
      expect(arcanos).toContain('A Estrela');
    });

    it('should return A Imperatriz and A Torre for Svadhisthana', () => {
      const arcanos = getArcanosByChakra('Svadhisthana');
      expect(arcanos).toContain('A Imperatriz');
      expect(arcanos).toContain('A Torre');
    });

    it('should return O Imperador and A Roda da Fortuna for Manipura', () => {
      const arcanos = getArcanosByChakra('Manipura');
      expect(arcanos).toContain('O Imperador');
      expect(arcanos).toContain('A Roda da Fortuna');
    });

    it('should handle Portuguese chakra names', () => {
      const arcanos1 = getArcanosByChakra('7º Coronário');
      expect(arcanos1).toContain('O Louco');

      const arcanos2 = getArcanosByChakra('1º Básico');
      expect(arcanos2).toContain('O Mago');
    });

    it('should return empty array for non-existent chakra', () => {
      const arcanos = getArcanosByChakra('NonExistent');
      expect(arcanos).toHaveLength(0);
    });
  });

  describe('TAROT_CHAKRA_MAPPINGS constant', () => {
    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(TAROT_CHAKRA_MAPPINGS)).toBe(true);
    });

    it('should contain expected arcano entries', () => {
      expect(TAROT_CHAKRA_MAPPINGS['O Louco']).toBeDefined();
      expect(TAROT_CHAKRA_MAPPINGS['O Mago']).toBeDefined();
      expect(TAROT_CHAKRA_MAPPINGS['A Sacerdotisa']).toBeDefined();
      expect(TAROT_CHAKRA_MAPPINGS['A Imperatriz']).toBeDefined();
      expect(TAROT_CHAKRA_MAPPINGS['O Imperador']).toBeDefined();
      expect(TAROT_CHAKRA_MAPPINGS['O Carro']).toBeDefined();
      expect(TAROT_CHAKRA_MAPPINGS['A Torre']).toBeDefined();
      expect(TAROT_CHAKRA_MAPPINGS['A Roda da Fortuna']).toBeDefined();
      expect(TAROT_CHAKRA_MAPPINGS['A Estrela']).toBeDefined();
    });

    it('should have correct chakra-to-tarot parity with chakra-tarot.ts', () => {
      // Test inverse relationship
      const tarotMapping = getTarotChakraMapping('O Louco');
      expect(tarotMapping?.chakra).toBe('Sahasrara');

      const chakraMapping = getChakraByTarot('O Louco');
      expect(chakraMapping).toBe('Sahasrara');
    });

    it('should have correct structure for all entries', () => {
      for (const [arcano, mapping] of Object.entries(TAROT_CHAKRA_MAPPINGS)) {
        expect(mapping.arcano).toBe(arcano);
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
        expect(['Sahasrara', 'Ajna', 'Vishuddha', 'Anahata', 'Manipura', 'Svadhisthana', 'Muladhara']).toContain(mapping.chakra);
        expect(mapping.chakra_pt).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.alinhamento_energetico).toBeDefined();
      }
    });
  });

  describe('TarotChakraMapping interface', () => {
    it('should have all required properties', () => {
      const mapping = getTarotChakraMapping('O Louco') as TarotChakraMapping;
      expect(mapping.arcano).toBe('O Louco');
      expect(mapping.numero_carta).toBe(0);
      expect(mapping.chakra).toBe('Sahasrara');
      expect(mapping.chakra_pt).toBe('7º Coronário');
      expect(mapping.numero_chakra).toBe(7);
      expect(mapping.significado_espiritual).toBeDefined();
      expect(mapping.alinhamento_energetico).toBeDefined();
    });
  });

  describe('default export', () => {
    it('should export all functions', async () => {
      const module = await import('@/lib/correlation/tarot-chakra');
      const defaultExport = module.default;
      
      expect(defaultExport.getTarotChakraMapping).toBeDefined();
      expect(defaultExport.getChakraByTarot).toBeDefined();
      expect(defaultExport.getAllTarotChakras).toBeDefined();
      expect(defaultExport.getAllArcanos).toBeDefined();
      expect(defaultExport.hasTarotChakra).toBeDefined();
      expect(defaultExport.getArcanoByNumber).toBeDefined();
      expect(defaultExport.getChakraByNumber).toBeDefined();
      expect(defaultExport.getChakraPtByTarot).toBeDefined();
      expect(defaultExport.getArcanosByChakra).toBeDefined();
    });
  });
});