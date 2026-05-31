/**
 * Tarot-Tarot Correlation Tests
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
  getAllMappedArcanos,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('getTarotTarot', () => {
    it('should return O Louco-O Mago relationship', () => {
      const result = getTarotTarot('O Louco', 'O Mago');
      expect(result).toBeDefined();
      expect(result?.path_type).toBe('Sequência');
    });

    it('should return O Louco-O Mundo relationship', () => {
      const result = getTarotTarot('O Louco', 'O Mundo');
      expect(result).toBeDefined();
      expect(result?.path_type).toBe('Sequência');
    });

    it('should be case-insensitive', () => {
      const result = getTarotTarot('O LOUCO', 'o mago');
      expect(result).toBeDefined();
    });

    it('should return null for unknown arcano pair', () => {
      const result = getTarotTarot('Unknown', 'O Louco');
      expect(result).toBeNull();
    });

    it('should return relationship regardless of argument order', () => {
      const result1 = getTarotTarot('O Louco', 'O Mago');
      const result2 = getTarotTarot('O Mago', 'O Louco');
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1?.path_type).toBe(result2?.path_type);
    });

    it('should include all required properties', () => {
      const result = getTarotTarot('O Louco', 'O Mago');
      expect(result).toHaveProperty('arcano');
      expect(result).toHaveProperty('numero_carta');
      expect(result).toHaveProperty('related_arcano');
      expect(result).toHaveProperty('related_numero');
      expect(result).toHaveProperty('path_type');
      expect(result?.spiritual_meaning).toHaveProperty('significado');
      expect(result?.spiritual_meaning).toHaveProperty('crescimento');
      expect(result?.spiritual_meaning).toHaveProperty('desafio');
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all mappings', () => {
      const result = getAllTarotPaths();
      expect(result.length).toBeGreaterThan(20);
    });

    it('should include O Louco mappings', () => {
      const result = getAllTarotPaths();
      const hasFool = result.some(m => m.arcano === 'O Louco');
      expect(hasFool).toBe(true);
    });

    it('should have valid path types', () => {
      const result = getAllTarotPaths();
      const validTypes = ['Trino', 'Sextil', 'Quadratura', 'Oposição', 'Sequência', 'Complementar', 'Ancestral'];
      result.forEach(m => {
        expect(validTypes).toContain(m.path_type);
      });
    });
  });

  describe('getAllArcanoRelations', () => {
    it('should return relations for O Louco', () => {
      const result = getAllArcanoRelations('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const result = getAllArcanoRelations('O LOUCO');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getPathsByType', () => {
    it('should return Sequência mappings', () => {
      const result = getPathsByType('Sequência');
      expect(result.length).toBeGreaterThan(10);
    });

    it('should return empty for unknown type', () => {
      const result = getPathsByType('Unknown' as any);
      expect(result.length).toBe(0);
    });
  });

  describe('getAllPathTypes', () => {
    it('should return all path types', () => {
      const result = getAllPathTypes();
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Sequência');
    });
  });

  describe('hasTarotTarot', () => {
    it('should return true for related arcanos', () => {
      expect(hasTarotTarot('O Louco', 'O Mago')).toBe(true);
    });

    it('should return false for unrelated', () => {
      expect(hasTarotTarot('O Sol', 'O Louco')).toBe(false);
    });
  });

  describe('getRelationsByNumber', () => {
    it('should return mappings for O Louco (0)', () => {
      const result = getRelationsByNumber(0);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getAllMappedArcanos', () => {
    it('should return 22 unique arcanos', () => {
      const result = getAllMappedArcanos();
      expect(result.length).toBe(22);
    });

    it('should start with O Louco', () => {
      const result = getAllMappedArcanos();
      expect(result[0]).toBe('O Louco');
    });

    it('should end with O Mundo', () => {
      const result = getAllMappedArcanos();
      expect(result[21]).toBe('O Mundo');
    });
  });
});
