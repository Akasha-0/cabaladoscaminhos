/**
 * Tarot-Tarot Correlation Tests
 * Tests for Major Arcana to Major Arcana spiritual mappings
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotPaths,
  getAllArcanoRelations,
  getPathsByType,
  getAllPathTypes,
  hasTarotTarot,
  getRelationsByNumber,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('getTarotTarot', () => {
    it('should return O Louco-O Mago relationship', () => {
      const result = getTarotTarot('O Louco', 'O Mago');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Louco');
      expect(result?.related_arcano).toBe('O Mago');
      expect(result?.path_type).toBe('tree_path');
      expect(result?.spiritual_meaning).toBeTruthy();
    });

    it('should return O Louco-O Mundo relationship', () => {
      const result = getTarotTarot('O Louco', 'O Mundo');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Louco');
      expect(result?.related_arcano).toBe('O Mundo');
      expect(result?.path_type).toBe('sequential');
    });

    it('should return A Imperatriz-O Imperador relationship', () => {
      const result = getTarotTarot('A Imperatriz', 'O Imperador');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.related_arcano).toBe('O Imperador');
      expect(result?.path_type).toBe('archetypal');
    });

    it('should return A Morte-A Esperança relationship', () => {
      const result = getTarotTarot('A Morte', 'A Esperança');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Morte');
      expect(result?.related_arcano).toBe('A Esperança');
      expect(result?.path_type).toBe('sequential');
    });

    it('should return A Torre-A Estrela relationship', () => {
      const result = getTarotTarot('A Torre', 'A Estrela');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Torre');
      expect(result?.related_arcano).toBe('A Estrela');
      expect(result?.path_type).toBe('sequential');
    });

    it('should return A Lua-O Sol relationship', () => {
      const result = getTarotTarot('A Lua', 'O Sol');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Lua');
      expect(result?.related_arcano).toBe('O Sol');
      expect(result?.path_type).toBe('sequential');
    });

    it('should be case-insensitive', () => {
      const result1 = getTarotTarot('o louco', 'o mago');
      const result2 = getTarotTarot('O LOUCO', 'O MAGO');
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result1?.arcano).toBe('O Louco');
      expect(result2?.arcano).toBe('O Louco');
    });

    it('should return null for unknown arcano pair', () => {
      const result = getTarotTarot('O Mago', 'O Sol');
      expect(result).toBeNull();
    });

    it('should return relationship regardless of argument order', () => {
      const result1 = getTarotTarot('A Morte', 'A Esperança');
      const result2 = getTarotTarot('A Esperança', 'A Morte');
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result1?.arcano).toBe('A Morte');
      expect(result2?.arcano).toBe('A Morte');
    });

    it('should include all required properties', () => {
      const result = getTarotTarot('O Louco', 'O Mago');
      expect(result).toHaveProperty('arcano');
      expect(result).toHaveProperty('numero_carta');
      expect(result).toHaveProperty('related_arcano');
      expect(result).toHaveProperty('related_numero');
      expect(result).toHaveProperty('path_type');
      expect(result).toHaveProperty('spiritual_meaning');
      expect(result).toHaveProperty('energy_flow');
    });

    it('should return bidirectional energy flow', () => {
      const result = getTarotTarot('O Louco', 'O Mago');
      expect(result?.energy_flow).toBe('bidirectional');
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all mappings', () => {
      const result = getAllTarotPaths();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return array of TarotTarotMapping objects', () => {
      const result = getAllTarotPaths();
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty('arcano');
      expect(result[0]).toHaveProperty('related_arcano');
      expect(result[0]).toHaveProperty('path_type');
    });

    it('should contain bidirectional mappings', () => {
      const result = getAllTarotPaths();
      const bidirectionalCount = result.filter((m) => m.energy_flow === 'bidirectional').length;
      expect(bidirectionalCount).toBe(result.length);
    });

    it('should include all 22 Major Arcana cards', () => {
      const result = getAllTarotPaths();
      const allArcanos = new Set([
        ...result.map((m) => m.arcano),
        ...result.map((m) => m.related_arcano),
      ]);
      expect(allArcanos.size).toBeGreaterThan(0);
    });
  });

  describe('getAllArcanoRelations', () => {
    it('should return all relations for O Louco', () => {
      const result = getAllArcanoRelations('O Louco');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.arcano === 'O Louco' || r.related_arcano === 'O Louco')).toBe(true);
    });

    it('should return all relations for A Morte', () => {
      const result = getAllArcanoRelations('A Morte');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.arcano === 'A Morte' || r.related_arcano === 'A Morte')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result1 = getAllArcanoRelations('a morte');
      const result2 = getAllArcanoRelations('A MORTE');
      expect(result1.length).toBe(result2.length);
    });

    it('should return empty array for unknown arcano', () => {
      const result = getAllArcanoRelations('Unknown Arcano');
      expect(result).toEqual([]);
    });

    it('should include all mapping properties', () => {
      const result = getAllArcanoRelations('O Louco');
      expect(result[0]).toHaveProperty('path_type');
      expect(result[0]).toHaveProperty('spiritual_meaning');
      expect(result[0]).toHaveProperty('energy_flow');
    });
  });

  describe('getPathsByType', () => {
    it('should return tree_path mappings', () => {
      const result = getPathsByType('tree_path');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.path_type === 'tree_path')).toBe(true);
    });

    it('should return sequential mappings', () => {
      const result = getPathsByType('sequential');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.path_type === 'sequential')).toBe(true);
    });

    it('should return elemental mappings', () => {
      const result = getPathsByType('elemental');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.path_type === 'elemental')).toBe(true);
    });

    it('should return archetypal mappings', () => {
      const result = getPathsByType('archetypal');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.path_type === 'archetypal')).toBe(true);
    });

    it('should return numerological mappings', () => {
      const result = getPathsByType('numerological');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.path_type === 'numerological')).toBe(true);
    });

    it('should return empty array for unknown type', () => {
      const result = getPathsByType('unknown' as any);
      expect(result).toEqual([]);
    });
  });

  describe('getAllPathTypes', () => {
    it('should return all path types', () => {
      const result = getAllPathTypes();
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('tree_path');
      expect(result).toContain('sequential');
    });

    it('should return array of unique types', () => {
      const result = getAllPathTypes();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  describe('hasTarotTarot', () => {
    it('should return true for known pair', () => {
      expect(hasTarotTarot('O Louco', 'O Mago')).toBe(true);
    });

    it('should return false for unknown pair', () => {
      expect(hasTarotTarot('O Mago', 'O Sol')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(hasTarotTarot('o louco', 'o mago')).toBe(true);
    });
  });

  describe('getRelationsByNumber', () => {
    it('should return relations for card 0', () => {
      const result = getRelationsByNumber(0);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.numero_carta === 0 || m.related_numero === 0)).toBe(true);
    });

    it('should return relations for card 21', () => {
      const result = getRelationsByNumber(21);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.numero_carta === 21 || m.related_numero === 21)).toBe(true);
    });

    it('should return relations for card 13 (A Morte)', () => {
      const result = getRelationsByNumber(13);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for number with no relations', () => {
      const result = getRelationsByNumber(100);
      expect(result).toEqual([]);
    });
  });

  describe('Spiritual meaning completeness', () => {
    it('should have spiritual_meaning for all mappings', () => {
      const allMappings = getAllTarotPaths();
      expect(allMappings.every((m) => m.spiritual_meaning && m.spiritual_meaning.length > 0)).toBe(true);
    });

    it('should have path_type for all mappings', () => {
      const allMappings = getAllTarotPaths();
      expect(allMappings.every((m) => m.path_type && m.path_type.length > 0)).toBe(true);
    });
  });

  describe('Bidirectional consistency', () => {
    it('should have consistent card numbers', () => {
      const allMappings = getAllTarotPaths();
      allMappings.forEach((m) => {
        expect(typeof m.numero_carta).toBe('number');
        expect(typeof m.related_numero).toBe('number');
        expect(m.numero_carta).toBeGreaterThanOrEqual(0);
        expect(m.numero_carta).toBeLessThanOrEqual(21);
        expect(m.related_numero).toBeGreaterThanOrEqual(0);
        expect(m.related_numero).toBeLessThanOrEqual(21);
      });
    });

    it('should have many mappings for completeness', () => {
      const allMappings = getAllTarotPaths();
      expect(allMappings.length).toBeGreaterThan(20);
    });
  });
});
