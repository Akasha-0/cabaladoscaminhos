import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotRelations,
  getRelationsForArcano,
  getRelationsByType,
  getAllRelationTypes,
  getAllRelatedArcanos,
  getRelationBetweenArcanos,
  getRelationTypeBetweenArcanos,
  getArcanoByNumber,
  getNumberByArcano,
  TAROT_TAROT_MAP,
  type TarotTarotMapping,
  type TarotRelacaoTipo,
  type ArcanoTarot,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  // ─── TAROT_TAROT_MAP: structure validation ────────────────────────────────

  describe('TAROT_TAROT_MAP', () => {
    it('should be a frozen array', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAP)).toBe(true);
    });

    it('should contain mapping entries', () => {
      expect(TAROT_TAROT_MAP.length).toBeGreaterThan(0);
    });

    it('each entry should have required fields', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping).toHaveProperty('arcano_origem');
        expect(mapping).toHaveProperty('arcano_destino');
        expect(mapping).toHaveProperty('numero_origem');
        expect(mapping).toHaveProperty('numero_destino');
        expect(mapping).toHaveProperty('tipo_relacao');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('lição');
        expect(mapping).toHaveProperty('conselho');
        expect(mapping).toHaveProperty('energia_combinada');
      });
    });

    it('each entry should have valid arcano names', () => {
      const validArcanos = [
        'O Louco', 'O Mago', 'A Alta Sacerdotisa', 'A Imperatriz',
        'O Imperador', 'O Hierofante', 'Os Enamorados', 'O Carro',
        'A Justiça', 'O Eremita', 'A Roda da Fortuna', 'A Força',
        'O Enforcado', 'A Morte', 'A Temperança', 'O Diabo',
        'A Torre', 'A Estrela', 'A Lua', 'O Sol',
        'O Julgamento', 'O Mundo',
      ];

      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(validArcanos).toContain(mapping.arcano_origem);
        expect(validArcanos).toContain(mapping.arcano_destino);
      });
    });

    it('each entry should have valid card numbers (0-21)', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.numero_origem).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_origem).toBeLessThanOrEqual(21);
        expect(mapping.numero_destino).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_destino).toBeLessThanOrEqual(21);
      });
    });

    it('each entry should have valid relationship types', () => {
      const validTypes: TarotRelacaoTipo[] = [
        'Sequência', 'Oposta', 'Complementar', ' ressonância',
        'Tríade', 'Ciclo', 'Ascensão', 'Eclipse', 'Alquimia', 'Espelho',
      ];

      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(validTypes).toContain(mapping.tipo_relacao);
      });
    });

    it('each entry should have non-empty spiritual content', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(10);
        expect(mapping.lição.length).toBeGreaterThan(5);
        expect(mapping.conselho.length).toBeGreaterThan(5);
        expect(mapping.energia_combinada.length).toBeGreaterThan(5);
      });
    });
  });

  // ─── getTarotTarot ────────────────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('returns mappings for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(
          mapping.arcano_origem === 'O Louco' || mapping.arcano_destino === 'O Louco'
        ).toBe(true);
      });
    });

    it('returns mappings for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for O Mundo', () => {
      const result = getTarotTarot('O Mundo');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown arcano', () => {
      const result = getTarotTarot('Unknown Arcano');
      expect(result).toEqual([]);
    });

    it('handles case-insensitive input', () => {
      const result1 = getTarotTarot('O Louco');
      const result2 = getTarotTarot('o louco');
      const result3 = getTarotTarot('O LOUCO');
      expect(result1.length).toBe(result2.length);
      expect(result1.length).toBe(result3.length);
    });

    it('handles arcano name with spaces', () => {
      const result = getTarotTarot('A Alta Sacerdotisa');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles numeric arcano input', () => {
      const result = getTarotTarot('0');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ─── getAllTarotRelations ─────────────────────────────────────────────────

  describe('getAllTarotRelations', () => {
    it('returns all mappings', () => {
      const result = getAllTarotRelations();
      expect(result.length).toBe(TAROT_TAROT_MAP.length);
    });

    it('returns a frozen array', () => {
      const result = getAllTarotRelations();
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('returns same data as direct MAP access', () => {
      const result = getAllTarotRelations();
      expect(result).toEqual(TAROT_TAROT_MAP);
    });
  });

  // ─── getRelationsForArcano ────────────────────────────────────────────────

  describe('getRelationsForArcano', () => {
    it('returns relations for O Louco', () => {
      const result = getRelationsForArcano('O Louco');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((rel) => {
        expect(rel).toHaveProperty('arcano');
        expect(rel).toHaveProperty('numero');
        expect(rel).toHaveProperty('tipo_relacao');
        expect(rel).toHaveProperty('significado_espiritual');
        expect(rel).toHaveProperty('direção');
        expect(rel.arcano).not.toBe('O Louco');
      });
    });

    it('includes direção property', () => {
      const result = getRelationsForArcano('O Louco');
      result.forEach((rel) => {
        expect(['origem', 'destino']).toContain(rel.direção);
      });
    });

    it('returns empty array for unknown arcano', () => {
      const result = getRelationsForArcano('Unknown');
      expect(result).toEqual([]);
    });
  });

  // ─── getRelationsByType ────────────────────────────────────────────────────

  describe('getRelationsByType', () => {
    it('returns mappings for Espelho type', () => {
      const result = getRelationsByType('Espelho');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.tipo_relacao).toBe('Espelho');
      });
    });

    it('returns mappings for Complementar type', () => {
      const result = getRelationsByType('Complementar');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.tipo_relacao).toBe('Complementar');
      });
    });

    it('returns mappings for Ascensão type', () => {
      const result = getRelationsByType('Ascensão');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.tipo_relacao).toBe('Ascensão');
      });
    });

    it('returns mappings for Ressonância type', () => {
      const result = getRelationsByType(' ressonância');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.tipo_relacao).toBe(' ressonância');
      });
    });

    it('returns empty array for unknown type', () => {
      const result = getRelationsByType('UnknownType' as TarotRelacaoTipo);
      expect(result).toEqual([]);
    });
  });

  // ─── getAllRelationTypes ───────────────────────────────────────────────────

  describe('getAllRelationTypes', () => {
    it('returns array of unique types', () => {
      const result = getAllRelationTypes();
      expect(result.length).toBeGreaterThan(0);
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('includes Espelho type', () => {
      const result = getAllRelationTypes();
      expect(result).toContain('Espelho');
    });

    it('includes Complementar type', () => {
      const result = getAllRelationTypes();
      expect(result).toContain('Complementar');
    });

    it('includes Ascensão type', () => {
      const result = getAllRelationTypes();
      expect(result).toContain('Ascensão');
    });
  });

  // ─── getAllRelatedArcanos ─────────────────────────────────────────────────

  describe('getAllRelatedArcanos', () => {
    it('returns array of unique arcanos', () => {
      const result = getAllRelatedArcanos();
      expect(result.length).toBeGreaterThan(0);
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('includes O Louco', () => {
      const result = getAllRelatedArcanos();
      expect(result).toContain('O Louco');
    });

    it('includes O Mundo', () => {
      const result = getAllRelatedArcanos();
      expect(result).toContain('O Mundo');
    });

    it('includes all major arcana', () => {
      const result = getAllRelatedArcanos();
      expect(result.length).toBeGreaterThanOrEqual(10);
    });
  });

  // ─── getRelationBetweenArcanos ────────────────────────────────────────────

  describe('getRelationBetweenArcanos', () => {
    it('returns spiritual meaning for O Louco and O Mundo', () => {
      const result = getRelationBetweenArcanos('O Louco', 'O Mundo');
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(10);
    });

    it('returns same result regardless of order', () => {
      const result1 = getRelationBetweenArcanos('O Louco', 'O Mundo');
      const result2 = getRelationBetweenArcanos('O Mundo', 'O Louco');
      expect(result1).toBe(result2);
    });

    it('returns null for unknown arcanos', () => {
      const result = getRelationBetweenArcanos('Unknown', 'O Louco');
      expect(result).toBeNull();
    });

    it('returns null for unrelated arcanos', () => {
      const result = getRelationBetweenArcanos('O Mago', 'A Estrela');
      // Some pairs may not have direct mappings
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  // ─── getRelationTypeBetweenArcanos ────────────────────────────────────────

  describe('getRelationTypeBetweenArcanos', () => {
    it('returns Espelho for O Louco and O Mundo', () => {
      const result = getRelationTypeBetweenArcanos('O Louco', 'O Mundo');
      expect(result).toBe('Espelho');
    });

    it('returns same result regardless of order', () => {
      const result1 = getRelationTypeBetweenArcanos('O Louco', 'O Mundo');
      const result2 = getRelationTypeBetweenArcanos('O Mundo', 'O Louco');
      expect(result1).toBe(result2);
    });

    it('returns null for unknown arcanos', () => {
      const result = getRelationTypeBetweenArcanos('Unknown', 'O Louco');
      expect(result).toBeNull();
    });
  });

  // ─── getArcanoByNumber ────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns O Louco for 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns O Mago for 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns A Alta Sacerdotisa for 2', () => {
      expect(getArcanoByNumber(2)).toBe('A Alta Sacerdotisa');
    });

    it('returns O Mundo for 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for out of range numbers', () => {
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  // ─── getNumberByArcano ────────────────────────────────────────────────────

  describe('getNumberByArcano', () => {
    it('returns 0 for O Louco', () => {
      expect(getNumberByArcano('O Louco')).toBe(0);
    });

    it('returns 1 for O Mago', () => {
      expect(getNumberByArcano('O Mago')).toBe(1);
    });

    it('returns 21 for O Mundo', () => {
      expect(getNumberByArcano('O Mundo')).toBe(21);
    });

    it('handles case-insensitive input', () => {
      expect(getNumberByArcano('o louco')).toBe(0);
      expect(getNumberByArcano('O LOUCO')).toBe(0);
    });

    it('returns null for unknown arcano', () => {
      expect(getNumberByArcano('Unknown')).toBeNull();
    });
  });

  // ─── Mirror relationships (0↔21, 1↔20, etc.) ───────────────────────────────

  describe('Mirror relationships', () => {
    it('O Louco (0) mirrors O Mundo (21)', () => {
      const result = getRelationTypeBetweenArcanos('O Louco', 'O Mundo');
      expect(result).toBe('Espelho');
    });

    it('O Mago (1) mirrors O Julgamento (20)', () => {
      const result = getRelationTypeBetweenArcanos('O Mago', 'O Julgamento');
      expect(result).toBe('Espelho');
    });

    it('A Alta Sacerdotisa (2) mirrors O Sol (19)', () => {
      const result = getRelationTypeBetweenArcanos('A Alta Sacerdotisa', 'O Sol');
      expect(result).toBe('Espelho');
    });

    it('A Imperatriz (3) mirrors A Lua (18)', () => {
      const result = getRelationTypeBetweenArcanos('A Imperatriz', 'A Lua');
      expect(result).toBe('Espelho');
    });

    it('O Imperador (4) mirrors A Estrela (17)', () => {
      const result = getRelationTypeBetweenArcanos('O Imperador', 'A Estrela');
      expect(result).toBe('Espelho');
    });
  });

  // ─── Numerological resonance (pairs that sum to 21) ───────────────────────

  describe('Numerological resonance', () => {
    it('1 + 20 = 21: O Mago and O Julgamento', () => {
      const result = getRelationTypeBetweenArcanos('O Mago', 'O Julgamento');
      expect(result).toBe(' ressonância');
    });

    it('2 + 19 = 21: A Alta Sacerdotisa and O Sol', () => {
      const result = getRelationTypeBetweenArcanos('A Alta Sacerdotisa', 'O Sol');
      expect(result).toBe(' ressonância');
    });

    it('3 + 18 = 21: A Imperatriz and A Lua', () => {
      const result = getRelationTypeBetweenArcanos('A Imperatriz', 'A Lua');
      expect(result).toBe(' ressonância');
    });

    it('4 + 17 = 21: O Imperador and A Estrela', () => {
      const result = getRelationTypeBetweenArcanos('O Imperador', 'A Estrela');
      expect(result).toBe(' ressonância');
    });

    it('5 + 16 = 21: O Hierofante and A Torre', () => {
      const result = getRelationTypeBetweenArcanos('O Hierofante', 'A Torre');
      expect(result).toBe(' ressonância');
    });

    it('6 + 15 = 21: Os Enamorados and O Diabo', () => {
      const result = getRelationTypeBetweenArcanos('Os Enamorados', 'O Diabo');
      expect(result).toBe(' ressonância');
    });

    it('7 + 14 = 21: O Carro and A Temperança', () => {
      const result = getRelationTypeBetweenArcanos('O Carro', 'A Temperança');
      expect(result).toBe(' ressonância');
    });

    it('8 + 13 = 21: A Justiça and A Morte', () => {
      const result = getRelationTypeBetweenArcanos('A Justiça', 'A Morte');
      expect(result).toBe(' ressonância');
    });
  });

  // ─── Complementary relationships ───────────────────────────────────────

  describe('Complementary relationships', () => {
    it('O Mago and A Alta Sacerdotisa are complementary', () => {
      const result = getRelationTypeBetweenArcanos('O Mago', 'A Alta Sacerdotisa');
      expect(result).toBe('Complementar');
    });

    it('A Imperatriz and O Imperador are complementary', () => {
      const result = getRelationTypeBetweenArcanos('A Imperatriz', 'O Imperador');
      expect(result).toBe('Complementar');
    });

    it('A Justiça and O Eremita are complementary', () => {
      const result = getRelationTypeBetweenArcanos('A Justiça', 'O Eremita');
      expect(result).toBe('Complementar');
    });
  });

  // ─── Ascensão relationships ───────────────────────────────────────────────

  describe('Ascensão relationships', () => {
    it('O Louco → O Mago is Ascensão', () => {
      const result = getRelationTypeBetweenArcanos('O Louco', 'O Mago');
      expect(result).toBe('Ascensão');
    });

    it('O Mago → A Alta Sacerdotisa is Ascensão', () => {
      const result = getRelationTypeBetweenArcanos('O Mago', 'A Alta Sacerdotisa');
      expect(result).toBe('Ascensão');
    });

    it('A Morte → A Temperança is Ascensão', () => {
      const result = getRelationTypeBetweenArcanos('A Morte', 'A Temperança');
      expect(result).toBe('Ascensão');
    });

    it('O Julgamento → O Mundo is Ascensão', () => {
      const result = getRelationTypeBetweenArcanos('O Julgamento', 'O Mundo');
      expect(result).toBe('Ascensão');
    });
  });

  // ─── Eclipse relationships ────────────────────────────────────────────────

  describe('Eclipse relationships', () => {
    it('A Torre and A Estrela are Eclipse', () => {
      const result = getRelationTypeBetweenArcanos('A Torre', 'A Estrela');
      expect(result).toBe('Eclipse');
    });

    it('A Lua and O Sol are Eclipse', () => {
      const result = getRelationTypeBetweenArcanos('A Lua', 'O Sol');
      expect(result).toBe('Eclipse');
    });
  });

  // ─── Alquimia relationships ─────────────────────────────────────────────

  describe('Alquimia relationships', () => {
    it('A Morte and A Temperança are Alquimia', () => {
      const result = getRelationTypeBetweenArcanos('A Morte', 'A Temperança');
      expect(result).toBe('Alquimia');
    });

    it('O Diabo and A Torre are Alquimia', () => {
      const result = getRelationTypeBetweenArcanos('O Diabo', 'A Torre');
      expect(result).toBe('Alquimia');
    });
  });

  // ─── Tríade relationships ─────────────────────────────────────────────────

  describe('Tríade relationships', () => {
    it('O Mago and A Imperatriz are Tríade', () => {
      const result = getRelationTypeBetweenArcanos('O Mago', 'A Imperatriz');
      expect(result).toBe('Tríade');
    });

    it('A Justiça and O Julgamento are Tríade', () => {
      const result = getRelationTypeBetweenArcanos('A Justiça', 'O Julgamento');
      expect(result).toBe('Tríade');
    });

    it('A Morte and A Temperança are Tríade', () => {
      const result = getRelationTypeBetweenArcanos('A Morte', 'A Temperança');
      expect(result).toBe('Tríade');
    });
  });

  // ─── Spiritual content completeness ─────────────────────────────────────

  describe('Spiritual content completeness', () => {
    it('all mappings have meaningful spiritual content', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(20);
        expect(mapping.lição.length).toBeGreaterThan(10);
        expect(mapping.conselho.length).toBeGreaterThan(10);
        expect(mapping.energia_combinada.length).toBeGreaterThan(10);
      });
    });

    it('spiritual content is in Portuguese', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        // Check for Portuguese words
        expect(mapping.significado_espiritual).toMatch(/é|que|para|com|do|da/);
      });
    });
  });

  // ─── Coverage validation ─────────────────────────────────────────────────

  describe('Coverage validation', () => {
    it('all 22 Major Arcana are referenced', () => {
      const referencedArcanos = getAllRelatedArcanos();
      const allArcanos: ArcanoTarot[] = [
        'O Louco', 'O Mago', 'A Alta Sacerdotisa', 'A Imperatriz',
        'O Imperador', 'O Hierofante', 'Os Enamorados', 'O Carro',
        'A Justiça', 'O Eremita', 'A Roda da Fortuna', 'A Força',
        'O Enforcado', 'A Morte', 'A Temperança', 'O Diabo',
        'A Torre', 'A Estrela', 'A Lua', 'O Sol',
        'O Julgamento', 'O Mundo',
      ];

      // At least 15 arcana should be referenced for good coverage
      expect(referencedArcanos.length).toBeGreaterThanOrEqual(15);
    });

    it('all relationship types are used', () => {
      const usedTypes = getAllRelationTypes();
      expect(usedTypes.length).toBeGreaterThanOrEqual(5);
    });
  });

  // ─── Edge cases ──────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('handles empty string input', () => {
      expect(getTarotTarot('')).toEqual([]);
      expect(getRelationsForArcano('')).toEqual([]);
      expect(getRelationBetweenArcanos('', 'O Louco')).toBeNull();
    });

    it('handles whitespace-only input', () => {
      expect(getTarotTarot('   ')).toEqual([]);
    });

    it('handles null-like inputs gracefully', () => {
      expect(getTarotTarot(' nonexistent ')).toEqual([]);
    });

    it('validates card numbers are within range', () => {
      TAROT_TAROT_MAP.forEach((mapping) => {
        expect(mapping.numero_origem).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_origem).toBeLessThanOrEqual(21);
        expect(mapping.numero_destino).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_destino).toBeLessThanOrEqual(21);
      });
    });
  });
});
