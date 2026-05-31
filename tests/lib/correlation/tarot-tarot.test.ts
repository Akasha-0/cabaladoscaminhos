import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotRelations,
  getRelationsByType,
  getRelationsByElement,
  getRelationBetweenCards,
  getAllRelationTypes,
  getAllCards,
  getRelatedCards,
  getArcanoElement,
  TAROT_TAROT_MAP,
  type TarotTarotMapping,
  type TarotRelType,
  type ArcanoMaior,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarot ──────────────────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('should return relations for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return relations for O Imperador', () => {
      const result = getTarotTarot('O Imperador');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) =>
        r.source_card === 'O Mago' || r.target_card === 'O Mago'
      )).toBe(true);
    });

    it('should return relations for sequential cards', () => {
      const result = getTarotTarot('A Hierofante');
      expect(result.some((r) => r.relation_type === 'Sequencial')).toBe(true);
    });

    it('should return empty array for non-existent card', () => {
      const result = getTarotTarot('Não existe');
      expect(result).toHaveLength(0);
    });

    it('should find O Louco relations (card 0)', () => {
      const result = getTarotTarot('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should find O Mundo relations (card 21)', () => {
      const result = getTarotTarot('O Mundo');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return relations as TarotTarotMapping type', () => {
      const result = getTarotTarot('O Carro');
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('source_card');
        expect(mapping).toHaveProperty('target_card');
        expect(mapping).toHaveProperty('relation_type');
        expect(mapping).toHaveProperty('spiritual_meaning');
      });
    });

    it('should include elemental relations for fire cards', () => {
      const result = getTarotTarot('A Força');
      expect(result.some((r) => r.relation_type === 'Elemental')).toBe(true);
    });
  });

  // ─── getAllTarotRelations ───────────────────────────────────────────────────

  describe('getAllTarotRelations', () => {
    it('should return all relations', () => {
      const result = getAllTarotRelations();
      expect(result.length).toBeGreaterThan(10);
    });

    it('should return readonly array', () => {
      const result = getAllTarotRelations();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include all major arcana cards', () => {
      const result = getAllTarotRelations();
      const cards = result.flatMap((r) => [r.source_card, r.target_card]);
      expect(cards).toContain('O Louco');
      expect(cards).toContain('O Mago');
      expect(cards).toContain('A Imperatriz');
      expect(cards).toContain('O Mundo');
    });

    it('should have no duplicate pairs in same direction', () => {
      const result = getAllTarotRelations();
      const pairs = result.map((r) => `${r.source_card}|${r.target_card}`);
      const uniquePairs = new Set(pairs);
      expect(pairs.length).toBe(uniquePairs.size);
    });
  });

  // ─── getRelationsByType ────────────────────────────────────────────────────

  describe('getRelationsByType', () => {
    it('should return elemental relations', () => {
      const result = getRelationsByType('Elemental');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.relation_type === 'Elemental')).toBe(true);
    });

    it('should return sequential relations', () => {
      const result = getRelationsByType('Sequencial');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.relation_type === 'Sequencial')).toBe(true);
    });

    it('should return opposite relations', () => {
      const result = getRelationsByType('Oposto');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.relation_type === 'Oposto')).toBe(true);
    });

    it('should return complementary relations', () => {
      const result = getRelationsByType('Complementar');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.relation_type === 'Complementar')).toBe(true);
    });

    it('should return evolutivo relations', () => {
      const result = getRelationsByType('Evolutivo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.relation_type === 'Evolutivo')).toBe(true);
    });

    it('should return numérico relations', () => {
      const result = getRelationsByType('Numérico');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.relation_type === 'Numérico')).toBe(true);
    });

    it('should return empty array for non-existent type', () => {
      const result = getRelationsByType('Inexistente' as TarotRelType);
      expect(result).toHaveLength(0);
    });
  });

  // ─── getRelationsByElement ─────────────────────────────────────────────────

  describe('getRelationsByElement', () => {
    it('should return fire element relations', () => {
      const result = getRelationsByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.shared_element === 'Fogo')).toBe(true);
    });

    it('should return water element relations', () => {
      const result = getRelationsByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.shared_element === 'Água')).toBe(true);
    });

    it('should return earth element relations', () => {
      const result = getRelationsByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.shared_element === 'Terra')).toBe(true);
    });

    it('should return air element relations', () => {
      const result = getRelationsByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.shared_element === 'Ar')).toBe(true);
    });

    it('should return empty array for non-existent element', () => {
      const result = getRelationsByElement('Éter');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getRelationBetweenCards ────────────────────────────────────────────────

  describe('getRelationBetweenCards', () => {
    it('should return spiritual meaning between O Mago and O Imperador', () => {
      const result = getRelationBetweenCards('O Mago', 'O Imperador');
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
    });

    it('should return spiritual meaning regardless of order', () => {
      const result1 = getRelationBetweenCards('O Mago', 'O Imperador');
      const result2 = getRelationBetweenCards('O Imperador', 'O Mago');
      expect(result1).toBe(result2);
    });

    it('should return null for non-existent pair', () => {
      const result = getRelationBetweenCards('O Mago', 'Não existe');
      expect(result).toBeNull();
    });

    it('should return spiritual meaning for sequential cards', () => {
      const result = getRelationBetweenCards('A Hierofante', 'Os Enamorados');
      expect(result).not.toBeNull();
    });

    it('should return spiritual meaning for opposite cards', () => {
      const result = getRelationBetweenCards('O Carro', 'O Eremita');
      expect(result).not.toBeNull();
    });

    it('should return spiritual meaning for complementary cards', () => {
      const result = getRelationBetweenCards('O Louco', 'O Mundo');
      expect(result).not.toBeNull();
    });
  });

  // ─── getAllRelationTypes ───────────────────────────────────────────────────

  describe('getAllRelationTypes', () => {
    it('should return all relation types', () => {
      const result = getAllRelationTypes();
      expect(result.length).toBeGreaterThanOrEqual(6);
      expect(result).toContain('Elemental');
      expect(result).toContain('Sequencial');
      expect(result).toContain('Oposto');
      expect(result).toContain('Complementar');
      expect(result).toContain('Evolutivo');
      expect(result).toContain('Numérico');
    });

    it('should return unique types only', () => {
      const result = getAllRelationTypes();
      const unique = new Set(result);
      expect(result.length).toBe(unique.size);
    });
  });

  // ─── getAllCards ───────────────────────────────────────────────────────────

  describe('getAllCards', () => {
    it('should return all major arcana cards', () => {
      const result = getAllCards();
      expect(result.length).toBeGreaterThan(10);
    });

    it('should include O Louco (0) and O Mundo (21)', () => {
      const result = getAllCards();
      expect(result).toContain('O Louco');
      expect(result).toContain('O Mundo');
    });

    it('should return cards in numerical order', () => {
      const result = getAllCards();
      const firstCard = result[0];
      const lastCard = result[result.length - 1];
      expect(firstCard).toBe('O Louco');
      expect(lastCard).toBe('O Mundo');
    });

    it('should not have duplicates', () => {
      const result = getAllCards();
      const unique = new Set(result);
      expect(result.length).toBe(unique.size);
    });
  });

  // ─── getRelatedCards ───────────────────────────────────────────────────────

  describe('getRelatedCards', () => {
    it('should return related cards for O Mago', () => {
      const result = getRelatedCards('O Mago');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return relation_type and spiritual_meaning', () => {
      const result = getRelatedCards('O Carro');
      expect(result.length).toBeGreaterThan(0);
      const related = result[0];
      expect(related).toHaveProperty('card');
      expect(related).toHaveProperty('relation_type');
      expect(related).toHaveProperty('spiritual_meaning');
    });

    it('should not include the input card', () => {
      const result = getRelatedCards('A Morte');
      result.forEach((related) => {
        expect(related.card).not.toBe('A Morte');
      });
    });

    it('should return empty array for non-existent card', () => {
      const result = getRelatedCards('Não existe');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getArcanoElement ──────────────────────────────────────────────────────

  describe('getArcanoElement', () => {
    it('should return fire element for O Louco', () => {
      const result = getArcanoElement('O Louco');
      expect(result).toBe('Fogo');
    });

    it('should return water element for A Morte', () => {
      const result = getArcanoElement('A Morte');
      expect(result).toBe('Água');
    });

    it('should return earth element for A Imperatriz', () => {
      const result = getArcanoElement('A Imperatriz');
      expect(result).toBe('Terra');
    });

    it('should return air element for A Justiça', () => {
      const result = getArcanoElement('A Justiça');
      expect(result).toBe('Ar');
    });

    it('should return undefined for non-existent card', () => {
      const result = getArcanoElement('Não existe');
      expect(result).toBeUndefined();
    });
  });

  // ─── TAROT_TAROT_MAP constant ─────────────────────────────────────────────

  describe('TAROT_TAROT_MAP', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAP)).toBe(true);
    });

    it('should contain mappings with required properties', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping).toHaveProperty('source_card');
        expect(mapping).toHaveProperty('target_card');
        expect(mapping).toHaveProperty('relation_type');
        expect(mapping).toHaveProperty('source_number');
        expect(mapping).toHaveProperty('target_number');
        expect(mapping).toHaveProperty('source_element');
        expect(mapping).toHaveProperty('target_element');
        expect(mapping).toHaveProperty('spiritual_meaning');
        expect(mapping).toHaveProperty('lição');
        expect(mapping).toHaveProperty('afirmação');
      });
    });

    it('should have valid card numbers (0-21)', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.source_number).toBeGreaterThanOrEqual(0);
        expect(mapping.source_number).toBeLessThanOrEqual(21);
        expect(mapping.target_number).toBeGreaterThanOrEqual(0);
        expect(mapping.target_number).toBeLessThanOrEqual(21);
      });
    });

    it('should have spiritual_meaning with content', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.spiritual_meaning.length).toBeGreaterThan(10);
      });
    });

    it('should have lição with content', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.lição.length).toBeGreaterThan(5);
      });
    });

    it('should have afirmação with content', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.afirmação.length).toBeGreaterThan(5);
      });
    });
  });

  // ─── Spiritual content completeness ───────────────────────────────────────

  describe('Spiritual content completeness', () => {
    it('should cover all major arcana in relationships', () => {
      const allCards = getAllCards();
      const keyCards = [
        'O Louco', 'O Mago', 'A Alta Sacerdotisa', 'A Imperatriz', 'O Imperador',
        'A Hierofante', 'Os Enamorados', 'O Carro', 'A Justiça', 'O Eremita',
        'A Roda da Fortuna', 'A Força', 'O Enforcado', 'A Morte', 'A Temperança',
        'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol', 'O Julgamento', 'O Mundo'
      ];
      keyCards.forEach((card) => {
        expect(allCards).toContain(card);
      });
    });

    it('should have all relation types represented', () => {
      const types = getAllRelationTypes();
      expect(types).toContain('Elemental');
      expect(types).toContain('Numérico');
      expect(types).toContain('Sequencial');
      expect(types).toContain('Oposto');
      expect(types).toContain('Complementar');
      expect(types).toContain('Evolutivo');
    });
  });

  // ─── Element distribution ──────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('should have fire card relationships', () => {
      const fireRelations = getRelationsByElement('Fogo');
      expect(fireRelations.length).toBeGreaterThan(0);
    });

    it('should have water card relationships', () => {
      const waterRelations = getRelationsByElement('Água');
      expect(waterRelations.length).toBeGreaterThan(0);
    });

    it('should have earth card relationships', () => {
      const earthRelations = getRelationsByElement('Terra');
      expect(earthRelations.length).toBeGreaterThan(0);
    });

    it('should have air card relationships', () => {
      const airRelations = getRelationsByElement('Ar');
      expect(airRelations.length).toBeGreaterThan(0);
    });
  });

  // ─── Arcano number coverage ──────────────────────────────────────────────

  describe('Arcano number coverage', () => {
    it('should include card 0 (O Louco) in relationships', () => {
      const result = getTarotTarot('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include card 21 (O Mundo) in relationships', () => {
      const result = getTarotTarot('O Mundo');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have relationship between O Louco and O Mundo', () => {
      const result = getRelationBetweenCards('O Louco', 'O Mundo');
      expect(result).not.toBeNull();
    });

    it('should have sequential relationships for mid-series cards', () => {
      const hierofante = getTarotTarot('A Hierofante');
      expect(hierofante.some((r) => r.relation_type === 'Sequencial')).toBe(true);
    });
  });
});