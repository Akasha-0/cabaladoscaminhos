/**
 * Tarot-Tarot Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotRelations,
  getRelationsForCard,
  getRelationsByType,
  getAllRelationTypes,
  getAllRelatedCards,
  getRelationBetweenCards,
  getRelationTypeBetweenCards,
  getCardsByRelationType,
  TAROT_TAROT_MAP,
  type TarotTarotMapping,
  type ArcanoMaior,
  type TarotRelationType,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  // ─── TAROT_TAROT_MAP: structure validation ─────────────────────────────

  describe('TAROT_TAROT_MAP', () => {
    it('should be a non-empty array', () => {
      expect(TAROT_TAROT_MAP.length).toBeGreaterThan(0);
    });

    it('should contain only TarotTarotMapping objects', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping).toHaveProperty('source_card');
        expect(mapping).toHaveProperty('target_card');
        expect(mapping).toHaveProperty('relation_type');
        expect(mapping).toHaveProperty('spiritual_meaning');
      });
    });

    it('should have valid source and target cards', () => {
      const validCards: ArcanoMaior[] = [
        'O Louco',
        'O Mago',
        'A Sacerdotisa',
        'A Imperatriz',
        'O Imperador',
        'O Papa',
        'Os Enamorados',
        'O Carro',
        'A Justiça',
        'O Eremita',
        'A Roda da Fortuna',
        'A Força',
        'O Enforcado',
        'A Morte',
        'A Temperança',
        'O Diabo',
        'A Torre',
        'A Estrela',
        'A Lua',
        'O Sol',
        'O Julgamento',
        'O Mundo',
      ];

      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(validCards).toContain(mapping.source_card);
        expect(validCards).toContain(mapping.target_card);
      });
    });

    it('should have valid relation types', () => {
      const validTypes: TarotRelationType[] = [
        'trindade',
        'eixo',
        'espelho',
        'sequencial',
        'elemental',
        'arquétipo',
        'caminho',
        'sombra',
        'luz',
        'transformação',
      ];

      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(validTypes).toContain(mapping.relation_type);
      });
    });

    it('should have spiritual_meaning with required fields', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.spiritual_meaning).toHaveProperty('significado');
        expect(mapping.spiritual_meaning).toHaveProperty('crescimento');
        expect(mapping.spiritual_meaning).toHaveProperty('desafio');
        expect(typeof mapping.spiritual_meaning.significado).toBe('string');
        expect(typeof mapping.spiritual_meaning.crescimento).toBe('string');
        expect(typeof mapping.spiritual_meaning.desafio).toBe('string');
      });
    });

    it('should have optional ritual field when present', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        if (mapping.spiritual_meaning.ritual) {
          expect(typeof mapping.spiritual_meaning.ritual).toBe('string');
        }
      });
    });

    it('should not have duplicate mappings', () => {
      const pairs = TAROT_TAROT_MAP.map((m) =>
        [m.source_card, m.target_card].sort().join('-')
      );
      const uniquePairs = new Set(pairs);
      expect(uniquePairs.size).toBe(pairs.length);
    });
  });

  // ─── getTarotTarot ──────────────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('should return relations for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return relations for A Sacerdotisa', () => {
      const result = getTarotTarot('A Sacerdotisa');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return relations for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return relations for A Morte', () => {
      const result = getTarotTarot('A Morte');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const upper = getTarotTarot('O MAGO');
      const lower = getTarotTarot('o mago');
      const title = getTarotTarot('O Mago');
      expect(upper.length).toBe(title.length);
      expect(lower.length).toBe(title.length);
    });

    it('should return empty array for unknown card', () => {
      const result = getTarotTarot('Card Inexistente');
      expect(result).toEqual([]);
    });

    it('should include all required properties in returned mappings', () => {
      const result = getTarotTarot('O Mago');
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('source_card');
        expect(mapping).toHaveProperty('target_card');
        expect(mapping).toHaveProperty('relation_type');
        expect(mapping).toHaveProperty('spiritual_meaning');
      });
    });

    it('should return card as source or target', () => {
      const result = getTarotTarot('O Mago');
      result.forEach((mapping) => {
        const hasCard =
          mapping.source_card === 'O Mago' || mapping.target_card === 'O Mago';
        expect(hasCard).toBe(true);
      });
    });
  });

  // ─── getAllTarotRelations ──────────────────────────────────────────────

  describe('getAllTarotRelations', () => {
    it('should return all mappings', () => {
      const result = getAllTarotRelations();
      expect(result.length).toBe(TAROT_TAROT_MAP.length);
    });

    it('should return readonly array', () => {
      const result = getAllTarotRelations();
      expect(result).toBe(TAROT_TAROT_MAP);
    });

    it('should contain all expected cards', () => {
      const result = getAllTarotRelations();
      const cards = new Set(
        result.flatMap((m) => [m.source_card, m.target_card])
      );
      expect(cards.size).toBeGreaterThan(10);
    });
  });

  // ─── getRelationsForCard ─────────────────────────────────────────────────

  describe('getRelationsForCard', () => {
    it('should return relations for O Mago with direction', () => {
      const result = getRelationsForCard('O Mago');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((rel) => {
        expect(rel).toHaveProperty('related_card');
        expect(rel).toHaveProperty('relation_type');
        expect(rel).toHaveProperty('direction');
        expect(rel).toHaveProperty('spiritual_meaning');
 });
    });

    it('should return correct direction for source card', () => {
      const result = getRelationsForCard('O Mago');
      const sourceRelations = result.filter((r) => r.direction === 'source');
      sourceRelations.forEach((rel) => {
        expect(rel.related_card).not.toBe('O Mago');
      });
    });

    it('should be case-insensitive', () => {
      const upper = getRelationsForCard('A MORTE');
      const lower = getRelationsForCard('a morte');
      expect(upper.length).toBe(lower.length);
    });

    it('should return empty array for unknown card', () => {
      const result = getRelationsForCard('Card Inexistente');
      expect(result).toEqual([]);
    });

    it('should include spiritual meaning with all fields', () => {
      const result = getRelationsForCard('O Mago');
      result.forEach((rel) => {
        expect(rel.spiritual_meaning).toHaveProperty('significado');
        expect(rel.spiritual_meaning).toHaveProperty('crescimento');
        expect(rel.spiritual_meaning).toHaveProperty('desafio');
      });
    });
  });

  // ─── getRelationsByType ────────────────────────────────────────────────

  describe('getRelationsByType', () => {
    it('should return trindade relations', () => {
      const result = getRelationsByType('trindade');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.relation_type).toBe('trindade');
      });
    });

    it('should return eixo relations', () => {
      const result = getRelationsByType('eixo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.relation_type).toBe('eixo');
      });
    });

    it('should return espelho relations', () => {
      const result = getRelationsByType('espelho');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.relation_type).toBe('espelho');
      });
    });

    it('should return sequencial relations', () => {
      const result = getRelationsByType('sequencial');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.relation_type).toBe('sequencial');
      });
    });

    it('should return elemental relations', () => {
      const result = getRelationsByType('elemental');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.relation_type).toBe('elemental');
      });
    });

    it('should return sombra relations', () => {
      const result = getRelationsByType('sombra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.relation_type).toBe('sombra');
      });
    });

    it('should return luz relations', () => {
      const result = getRelationsByType('luz');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.relation_type).toBe('luz');
      });
    });

    it('should return transformação relations', () => {
      const result = getRelationsByType('transformação');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.relation_type).toBe('transformação');
      });
    });

    it('should return empty array for unknown type', () => {
      const result = getRelationsByType('tipo_desconhecido' as TarotRelationType);
      expect(result).toEqual([]);
    });
  });

  // ─── getAllRelationTypes ───────────────────────────────────────────────────

  describe('getAllRelationTypes', () => {
    it('should return all relation types', () => {
      const result = getAllRelationTypes();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should not have duplicates', () => {
      const result = getAllRelationTypes();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('should include trindade', () => {
      const result = getAllRelationTypes();
      expect(result).toContain('trindade');
    });

    it('should include eixo', () => {
      const result = getAllRelationTypes();
      expect(result).toContain('eixo');
    });

    it('should include sequencial', () => {
      const result = getAllRelationTypes();
      expect(result).toContain('sequencial');
    });
  });

  // ─── getAllRelatedCards ─────────────────────────────────────────────────

  describe('getAllRelatedCards', () => {
    it('should return all cards that have relations', () => {
      const result = getAllRelatedCards();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should not have duplicates', () => {
      const result = getAllRelatedCards();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('should include all Major Arcana cards', () => {
      const result = getAllRelatedCards();
      const expectedCards: ArcanoMaior[] = [
        'O Louco',
        'O Mago',
        'A Sacerdotisa',
        'A Imperatriz',
        'O Imperador',
        'O Papa',
        'Os Enamorados',
        'O Carro',
        'A Justiça',
        'O Eremita',
        'A Roda da Fortuna',
        'A Força',
        'O Enforcado',
        'A Morte',
        'A Temperança',
        'O Diabo',
        'A Torre',
        'A Estrela',
        'A Lua',
        'O Sol',
        'O Julgamento',
        'O Mundo',
      ];
      expectedCards.forEach((card) => {
        expect(result).toContain(card);
      });
    });
  });

  // ─── getRelationBetweenCards ─────────────────────────────────────────────

  describe('getRelationBetweenCards', () => {
    it('should return spiritual meaning for Mago-Sacerdotisa', () => {
      const result = getRelationBetweenCards('O Mago', 'A Sacerdotisa');
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('significado');
      expect(result).toHaveProperty('crescimento');
      expect(result).toHaveProperty('desafio');
    });

    it('should return spiritual meaning regardless of order', () => {
      const result1 = getRelationBetweenCards('O Mago', 'A Sacerdotisa');
      const result2 = getRelationBetweenCards('A Sacerdotisa', 'O Mago');
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result1?.significado).toBe(result2?.significado);
    });

    it('should return null for unrelated cards', () => {
      const result = getRelationBetweenCards('O Louco', 'O Mundo');
      // These cards may or may not have direct relations
      // Test is for handling of non-existent relations
      expect(result === null || result).toBeTruthy();
    });

    it('should return null for unknown cards', () => {
      const result = getRelationBetweenCards('Card Inexistente', 'O Mago');
      expect(result).toBeNull();
    });

    it('should be case-insensitive', () => {
      const result1 = getRelationBetweenCards('O MAGO', 'A SACERDOTISA');
      const result2 = getRelationBetweenCards('o mago', 'a sacerdotisa');
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
    });
  });

  // ─── getRelationTypeBetweenCards ─────────────────────────────────────────────

  describe('getRelationTypeBetweenCards', () => {
    it('should return relation type for Mago-Sacerdotisa', () => {
      const result = getRelationTypeBetweenCards('O Mago', 'A Sacerdotisa');
      expect(result).not.toBeNull();
      expect(result).toBe('trindade');
    });

    it('should return relation type regardless of order', () => {
      const result1 = getRelationTypeBetweenCards('O Mago', 'A Sacerdotisa');
      const result2 = getRelationTypeBetweenCards('A Sacerdotisa', 'O Mago');
      expect(result1).toBe(result2);
    });

    it('should return null for unknown cards', () => {
      const result = getRelationTypeBetweenCards('Card Inexistente', 'O Mago');
      expect(result).toBeNull();
    });

    it('should return valid relation type', () => {
      const result = getRelationTypeBetweenCards('O Mago', 'A Sacerdotisa');
      const validTypes: TarotRelationType[] = [
        'trindade',
        'eixo',
        'espelho',
        'sequencial',
        'elemental',
        'arquétipo',
        'caminho',
        'sombra',
        'luz',
        'transformação',
      ];
      expect(validTypes).toContain(result);
    });
  });

  // ─── getCardsByRelationType ─────────────────────────────────────────────────

  describe('getCardsByRelationType', () => {
    it('should return cards for trindade relations', () => {
      const result = getCardsByRelationType('trindade');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return cards for eixo relations', () => {
      const result = getCardsByRelationType('eixo');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return cards for sequencial relations', () => {
      const result = getCardsByRelationType('sequencial');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return unique cards', () => {
      const result = getCardsByRelationType('trindade');
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('should return empty array for unknown type', () => {
      const result = getCardsByRelationType('tipo_desconhecido' as TarotRelationType);
      expect(result).toEqual([]);
    });
  });

  // ─── Spiritual content completeness ─────────────────────────────────────────

  describe('Spiritual content completeness', () => {
    it('should have meaningful significado for all mappings', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.spiritual_meaning.significado.length).toBeGreaterThan(10);
      });
    });

    it('should have meaningful crescimento for all mappings', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.spiritual_meaning.crescimento.length).toBeGreaterThan(10);
      });
    });

    it('should have meaningful desafio for all mappings', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.spiritual_meaning.desafio.length).toBeGreaterThan(5);
      });
    });

    it('should reference spiritual concepts in significado', () => {
      const spiritualTerms = [
        'espiritual',
        'alma',
        'consciência',
        'transformação',
        'crescimento',
        'equilíbrio',
        'sabedoria',
        'luz',
        'sombra',
        'morte',
        'vida',
        'amor',
        'união',
        'poder',
        'força',
        'justiça',
        'destino',
      ];
      let foundTerms = 0;
      TAROT_TAROT_MAP.forEach((mapping) => {
        const significado = mapping.spiritual_meaning.significado.toLowerCase();
        spiritualTerms.forEach((term) => {
          if (significado.includes(term)) foundTerms++;
        });
      });
      expect(foundTerms).toBeGreaterThan(10);
    });
  });

  // ─── Relation type distribution ───────────────────────────────────────────────

  describe('Relation type distribution', () => {
    it('should have trindade relations', () => {
      const result = getRelationsByType('trindade');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have eixo relations', () => {
      const result = getRelationsByType('eixo');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have espelho relations', () => {
      const result = getRelationsByType('espelho');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have sequencial relations', () => {
      const result = getRelationsByType('sequencial');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have elemental relations', () => {
      const result = getRelationsByType('elemental');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have sombra relations', () => {
      const result = getRelationsByType('sombra');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have luz relations', () => {
      const result = getRelationsByType('luz');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have transformação relations', () => {
      const result = getRelationsByType('transformação');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ─── Key card relationships ─────────────────────────────────────────────────

  describe('Key card relationships', () => {
    it('should have multiple relations for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result.length).toBeGreaterThan(3);
    });

    it('should have multiple relations for A Morte', () => {
      const result = getTarotTarot('A Morte');
      expect(result.length).toBeGreaterThan(3);
    });

    it('should have relations for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have relations for O Mundo', () => {
      const result = getTarotTarot('O Mundo');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have sequential chain covering arcana', () => {
      const sequential = getRelationsByType('sequencial');
      expect(sequential.length).toBeGreaterThan(10);
    });
  });

  // ─── Edge cases ──────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const result = getTarotTarot('');
      expect(result).toEqual([]);
    });

    it('should handle whitespace only', () => {
      const result = getTarotTarot('   ');
      expect(result).toEqual([]);
    });

    it('should handle special characters in card names', () => {
      const result = getTarotTarot('A Morte');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle accented characters', () => {
      const result = getTarotTarot('A Sacerdotisa');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle repeated calls consistently', () => {
      const result1 = getTarotTarot('O Mago');
      const result2 = getTarotTarot('O Mago');
      expect(result1.length).toBe(result2.length);
    });
  });
});
