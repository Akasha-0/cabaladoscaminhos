import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getTarotRelationships,
  getRelationshipsByType,
  getRelationshipsByElement,
  getRelationshipsByChakra,
  getAllTarotTarot,
  getRelatedArcanos,
  hasTarotRelationship,
  getAllRelationshipTypes,
  TAROT_TAROT_MAPPINGS,
  type TarotTarotMapping,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarot ────────────────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('returns mapping for O Sol and O Mundo (same chakra)', () => {
      const result = getTarotTarot('O Sol', 'O Mundo');
      expect(result).toBeDefined();
      expect(result?.tipo_relacionamento).toBe('mesmo_chakra');
      expect(result?.chakra_numero).toBe(7);
      expect(result?.numero_1).toBe(19);
      expect(result?.numero_2).toBe(21);
    });

    it('returns mapping for A Estrela and A Lua (same chakra)', () => {
      const result = getTarotTarot('A Estrela', 'A Lua');
      expect(result).toBeDefined();
      expect(result?.tipo_relacionamento).toBe('mesmo_chakra');
      expect(result?.chakra_numero).toBe(6);
    });

    it('returns mapping for same_elemento relationship', () => {
      const result = getTarotTarot('O Sol', 'O Julgamento');
      expect(result).toBeDefined();
      expect(result?.tipo_relacionamento).toBe('mesmo_elemento');
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns mapping for sequential relationship', () => {
      const result = getTarotTarot('O Louco', 'O Mago');
      expect(result).toBeDefined();
      expect(result?.tipo_relacionamento).toBe('sequencial');
      expect(result?.numero_1).toBe(0);
      expect(result?.numero_2).toBe(1);
    });

    it('returns mapping for transformation relationship', () => {
      const result = getTarotTarot('A Morte', 'A Temperança');
      expect(result).toBeDefined();
      expect(result?.tipo_relacionamento).toBe('transformacao');
    });

    it('returns mapping for complementary relationship', () => {
      const result = getTarotTarot('O Louco', 'O Mundo');
      expect(result).toBeDefined();
      expect(result?.tipo_relacionamento).toBe('complementar');
      expect(result?.numero_1).toBe(0);
      expect(result?.numero_2).toBe(21);
    });

    it('returns mapping regardless of order', () => {
      const result1 = getTarotTarot('O Imperador', 'O Carro');
      const result2 = getTarotTarot('O Carro', 'O Imperador');
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1?.arcano_1).toBe('O Imperador');
      expect(result2?.arcano_1).toBe('O Imperador');
    });

    it('returns null for unknown arcano pair', () => {
      expect(getTarotTarot('inexistente', 'O Sol')).toBeNull();
      expect(getTarotTarot('O Sol', 'Carta Inválida')).toBeNull();
    });

    it('returns null for empty strings', () => {
      expect(getTarotTarot('', 'O Sol')).toBeNull();
      expect(getTarotTarot('O Sol', '')).toBeNull();
    });
  });

  // ─── getTarotRelationships ───────────────────────────────────────────────

  describe('getTarotRelationships', () => {
    it('returns array of relationships for O Sol', () => {
      const result = getTarotRelationships('O Sol');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns relationships where arcano appears in either position', () => {
      const result = getTarotRelationships('A Morte');
      expect(result.some((m) => m.arcano_1 === 'A Morte' || m.arcano_2 === 'A Morte')).toBe(
        true
      );
    });

    it('returns empty array for non-existent arcano', () => {
      expect(getTarotRelationships('inexistente')).toEqual([]);
    });

    it('includes relationship type and spiritual meaning', () => {
      const result = getTarotRelationships('O Louco');
      result.forEach((mapping) => {
        expect(mapping.tipo_relacionamento).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.interpretacao_combinada).toBeDefined();
      });
    });
  });

  // ─── getRelationshipsByType ──────────────────────────────────────────────

  describe('getRelationshipsByType', () => {
    it('returns all mesmo_elemento relationships', () => {
      const result = getRelationshipsByType('mesmo_elemento');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.tipo_relacionamento).toBe('mesmo_elemento');
      });
    });

    it('returns all mesmo_chakra relationships', () => {
      const result = getRelationshipsByType('mesmo_chakra');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((m) => {
        expect(m.tipo_relacionamento).toBe('mesmo_chakra');
        expect(m.chakra_numero).toBeDefined();
      });
    });

    it('returns all sequencial relationships', () => {
      const result = getRelationshipsByType('sequencial');
      expect(Array.isArray(result)).toBe(true);
      result.forEach((m) => {
        expect(m.tipo_relacionamento).toBe('sequencial');
      });
    });

    it('returns all transformacao relationships', () => {
      const result = getRelationshipsByType('transformacao');
      expect(Array.isArray(result)).toBe(true);
      result.forEach((m) => {
        expect(m.tipo_relacionamento).toBe('transformacao');
      });
    });

    it('returns all complementar relationships', () => {
      const result = getRelationshipsByType('complementar');
      expect(Array.isArray(result)).toBe(true);
      result.forEach((m) => {
        expect(m.tipo_relacionamento).toBe('complementar');
      });
    });
  });

  // ─── getRelationshipsByElement ──────────────────────────────────────────

  describe('getRelationshipsByElement', () => {
    it('returns Fogo relationships', () => {
      const result = getRelationshipsByElement('Fogo');
      expect(Array.isArray(result)).toBe(true);
      result.forEach((m) => {
        expect(m.elemento).toBe('Fogo');
      });
    });

    it('returns Água relationships', () => {
      const result = getRelationshipsByElement('Água');
      expect(Array.isArray(result)).toBe(true);
      result.forEach((m) => {
        expect(m.elemento).toBe('Água');
      });
    });

    it('returns Terra relationships', () => {
      const result = getRelationshipsByElement('Terra');
      expect(Array.isArray(result)).toBe(true);
      result.forEach((m) => {
        expect(m.elemento).toBe('Terra');
      });
    });

    it('returns Ar relationships', () => {
      const result = getRelationshipsByElement('Ar');
      expect(Array.isArray(result)).toBe(true);
      result.forEach((m) => {
        expect(m.elemento).toBe('Ar');
      });
    });

    it('returns empty array for unknown element', () => {
      expect(getRelationshipsByElement('Inexistente')).toEqual([]);
    });
  });

  // ─── getRelationshipsByChakra ───────────────────────────────────────────

  describe('getRelationshipsByChakra', () => {
    it('returns chakra 1 relationships', () => {
      const result = getRelationshipsByChakra(1);
      expect(Array.isArray(result)).toBe(true);
      result.forEach((m) => {
        expect(m.chakra_numero).toBe(1);
      });
    });

    it('returns chakra 2 relationships', () => {
      const result = getRelationshipsByChakra(2);
      expect(Array.isArray(result)).toBe(true);
      result.forEach((m) => {
        expect(m.chakra_numero).toBe(2);
      });
    });

    it('returns chakra 7 relationships', () => {
      const result = getRelationshipsByChakra(7);
      expect(Array.isArray(result)).toBe(true);
      result.forEach((m) => {
        expect(m.chakra_numero).toBe(7);
      });
    });

    it('includes chakra relationships properly', () => {
      const chakraRelations = TAROT_TAROT_MAPPINGS.filter((m) => m.chakra_numero !== undefined);
      expect(chakraRelations.length).toBeGreaterThan(0);
    });
  });

  // ─── getAllTarotTarot ──────────────────────────────────────────────────────

  describe('getAllTarotTarot', () => {
    it('returns array of all mappings', () => {
      const result = getAllTarotTarot();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('all mappings have required properties', () => {
      const result = getAllTarotTarot();
      result.forEach((mapping) => {
        expect(mapping.arcano_1).toBeDefined();
        expect(mapping.arcano_2).toBeDefined();
        expect(mapping.tipo_relacionamento).toBeDefined();
        expect(mapping.numero_1).toBeDefined();
        expect(mapping.numero_2).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.interpretacao_combinada).toBeDefined();
      });
    });

    it('card numbers are valid Major Arcana numbers', () => {
      const result = getAllTarotTarot();
      result.forEach((mapping) => {
        expect(mapping.numero_1).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_1).toBeLessThanOrEqual(21);
        expect(mapping.numero_2).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_2).toBeLessThanOrEqual(21);
      });
    });
  });

  // ─── getRelatedArcanos ────────────────────────────────────────────────────

  describe('getRelatedArcanos', () => {
    it('returns related arcanos for O Sol', () => {
      const result = getRelatedArcanos('O Sol');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('O Mundo');
    });

    it('returns related arcanos filtered by type', () => {
      const result = getRelatedArcanos('A Estrela', 'mesmo_chakra');
      expect(Array.isArray(result)).toBe(true);
      result.forEach((arcano) => {
        const mapping = getTarotTarot('A Estrela', arcano);
        expect(mapping?.tipo_relacionamento).toBe('mesmo_chakra');
      });
    });

    it('returns empty array for non-existent arcano', () => {
      expect(getRelatedArcanos('inexistente')).toEqual([]);
    });

    it('does not include the input arcano in results', () => {
      const result = getRelatedArcanos('O Louco');
      expect(result).not.toContain('O Louco');
    });

    it('returns unique arcano names', () => {
      const result = getRelatedArcanos('O Sol');
      const unique = new Set(result);
      expect(result.length).toBe(unique.size);
    });
  });

  // ─── hasTarotRelationship ─────────────────────────────────────────────────

  describe('hasTarotRelationship', () => {
    it('returns true for related arcanos', () => {
      expect(hasTarotRelationship('O Sol', 'O Mundo')).toBe(true);
      expect(hasTarotRelationship('O Louco', 'O Mago')).toBe(true);
      expect(hasTarotRelationship('A Estrela', 'A Lua')).toBe(true);
    });

    it('returns true regardless of order', () => {
      expect(hasTarotRelationship('A Morte', 'A Temperança')).toBe(true);
      expect(hasTarotRelationship('A Temperança', 'A Morte')).toBe(true);
    });

    it('returns false for non-related arcanos', () => {
      expect(hasTarotRelationship('O Sol', 'inexistente')).toBe(false);
      expect(hasTarotRelationship('inexistente', 'O Sol')).toBe(false);
    });

    it('returns false for empty strings', () => {
      expect(hasTarotRelationship('', 'O Sol')).toBe(false);
      expect(hasTarotRelationship('O Sol', '')).toBe(false);
    });
  });

  // ─── getAllRelationshipTypes ─────────────────────────────────────────────

  describe('getAllRelationshipTypes', () => {
    it('returns array of unique relationship types', () => {
      const result = getAllRelationshipTypes();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('contains mesmo_elemento type', () => {
      expect(getAllRelationshipTypes()).toContain('mesmo_elemento');
    });

    it('contains mesmo_chakra type', () => {
      expect(getAllRelationshipTypes()).toContain('mesmo_chakra');
    });

    it('contains sequencial type', () => {
      expect(getAllRelationshipTypes()).toContain('sequencial');
    });

    it('contains transformacao type', () => {
      expect(getAllRelationshipTypes()).toContain('transformacao');
    });

    it('contains complementar type', () => {
      expect(getAllRelationshipTypes()).toContain('complementar');
    });

    it('returns unique values only', () => {
      const result = getAllRelationshipTypes();
      const unique = new Set(result);
      expect(result.length).toBe(unique.size);
    });
  });

  // ─── TAROT_TAROT_MAPPINGS constant ──────────────────────────────────────

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('is an array', () => {
      expect(Array.isArray(TAROT_TAROT_MAPPINGS)).toBe(true);
    });

    it('has at least 20 relationship mappings', () => {
      expect(TAROT_TAROT_MAPPINGS.length).toBeGreaterThanOrEqual(20);
    });

    it('contains Fire element relationships', () => {
      const fireMappings = TAROT_TAROT_MAPPINGS.filter((m) => m.elemento === 'Fogo');
      expect(fireMappings.length).toBeGreaterThan(0);
    });

    it('contains Water element relationships', () => {
      const waterMappings = TAROT_TAROT_MAPPINGS.filter((m) => m.elemento === 'Água');
      expect(waterMappings.length).toBeGreaterThan(0);
    });

    it('contains Earth element relationships', () => {
      const earthMappings = TAROT_TAROT_MAPPINGS.filter((m) => m.elemento === 'Terra');
      expect(earthMappings.length).toBeGreaterThan(0);
    });

    it('contains Air element relationships', () => {
      const airMappings = TAROT_TAROT_MAPPINGS.filter((m) => m.elemento === 'Ar');
      expect(airMappings.length).toBeGreaterThan(0);
    });
  });

  // ─── Relationship Type Distribution ────────────────────────────────────

  describe('Relationship type distribution', () => {
    it('has mesmo_elemento relationships for all four elements', () => {
      const elements = ['Fogo', 'Água', 'Terra', 'Ar'];
      elements.forEach((elemento) => {
        const mappings = getRelationshipsByElement(elemento);
        expect(mappings.length).toBeGreaterThan(0);
      });
    });

    it('has mesmo_chakra relationships for multiple chakras', () => {
      const chakraCounts: Record<number, number> = {};
      getRelationshipsByType('mesmo_chakra').forEach((m) => {
        if (m.chakra_numero) {
          chakraCounts[m.chakra_numero] = (chakraCounts[m.chakra_numero] || 0) + 1;
        }
      });
      expect(Object.keys(chakraCounts).length).toBeGreaterThanOrEqual(4);
    });

    it('has sequential relationships for journey cards', () => {
      const sequential = getRelationshipsByType('sequencial');
      expect(sequential.length).toBeGreaterThan(0);
      sequential.forEach((m) => {
        expect(Math.abs(m.numero_1 - m.numero_2)).toBe(1);
      });
    });
  });

  // ─── Mapping Interface Completeness ────────────────────────────────────

  describe('TarotTarotMapping interface completeness', () => {
    it('all mappings have spiritual meaning', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
      });
    });

    it('all mappings have combined interpretation', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(typeof mapping.interpretacao_combinada).toBe('string');
        expect(mapping.interpretacao_combinada.length).toBeGreaterThan(10);
      });
    });

    it('element relationships have matching element field', () => {
      const elementMappings = getRelationshipsByType('mesmo_elemento');
      elementMappings.forEach((mapping) => {
        expect(mapping.elemento).toBeDefined();
      });
    });

    it('chakra relationships have matching chakra fields', () => {
      const chakraMappings = getRelationshipsByType('mesmo_chakra');
      chakraMappings.forEach((mapping) => {
        expect(mapping.chakra_numero).toBeDefined();
        expect(mapping.chakra).toBeDefined();
      });
    });
  });
});
