/**
 * Tarot-Tarot Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotPaths,
  getRelatedArcano,
  getAllRelatedArcanos,
  getPathsByType,
  getAllArcanos,
  hasTarotTarot,
  getArcanoByNumber,
  getPathType,
  getAllPathTypes,
  getMappingByNumber,
  getBidirectionalPaths,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('getTarotTarot', () => {
    it('should return Fool-Magician initiation path', () => {
      const result = getTarotTarot('O Louco');

      expect(result).toBeDefined();
      expect(result?.related_arcano).toBe('O Mago');
      expect(result?.path_type).toBe('iniciacao');
      expect(result?.spiritual_meaning).toContain('inicia');
      expect(result?.spiritual_meaning).toContain('jornada');
    });

    it('should return Magician-High Priestess polarity path', () => {
      const result = getTarotTarot('O Mago');

      expect(result).toBeDefined();
      expect(result?.related_arcano).toBe('A Sacerdotisa');
      expect(result?.path_type).toBe('polaridade');
      expect(result?.spiritual_meaning).toContain('vontade');
      expect(result?.spiritual_meaning).toContain('inconsciente');
    });

    it('should return Empress-Star culmination path', () => {
      const result = getTarotTarot('A Imperatriz');

      expect(result).toBeDefined();
      expect(result?.related_arcano).toBe('A Estrela');
      expect(result?.path_type).toBe('culminacao');
      expect(result?.spiritual_meaning).toContain('fertilidade');
      expect(result?.spiritual_meaning).toContain('esperança');
    });

    it('should return Hierophant-Lovers transformation path', () => {
      const result = getTarotTarot('O Hierofante');

      expect(result).toBeDefined();
      expect(result?.related_arcano).toBe('Os Enamorados');
      expect(result?.path_type).toBe('transformacao');
    });

    it('should return Chariot-Tower transformation path', () => {
      const result = getTarotTarot('O Carro');

      expect(result).toBeDefined();
      expect(result?.path_type).toBe('transformacao');
    });

    it('should return Justice-Judgment ascension path', () => {
      const result = getTarotTarot('A Justiça');

      expect(result).toBeDefined();
      expect(result?.related_arcano).toBe('O Julgamento');
      expect(result?.path_type).toBe('ascensao');
    });

    it('should return Temperance-Devil shadow path', () => {
      const result = getTarotTarot('A Temperança');

      expect(result).toBeDefined();
      expect(result?.related_arcano).toBe('O Diabo');
      expect(result?.path_type).toBe('sombra');
    });

    it('should return Devil-Tower light path', () => {
      const result = getTarotTarot('O Diabo');

      expect(result).toBeDefined();
      expect(result?.related_arcano).toBe('A Torre');
      expect(result?.path_type).toBe('luz');
      expect(result?.spiritual_meaning).toContain('libertação');
    });

    it('should return Tower-Star light path', () => {
      const result = getTarotTarot('A Torre');

      expect(result).toBeDefined();
      expect(result?.related_arcano).toBe('A Estrela');
      expect(result?.path_type).toBe('luz');
      expect(result?.spiritual_meaning).toContain('esperança');
    });

    it('should return Moon-Sun light path', () => {
      const result = getTarotTarot('A Lua');

      expect(result).toBeDefined();
      expect(result?.related_arcano).toBe('O Sol');
      expect(result?.path_type).toBe('luz');
      expect(result?.spiritual_meaning).toContain('luz reflexa');
      expect(result?.spiritual_meaning).toContain('luz própria');
    });

    it('should return World-Fool cycle path', () => {
      const result = getTarotTarot('O Mundo');

      expect(result).toBeDefined();
      expect(result?.related_arcano).toBe('O Louco');
      expect(result?.path_type).toBe('ciclo');
      expect(result?.spiritual_meaning).toContain('completa o ciclo');
    });

    it('should be case-insensitive', () => {
      expect(getTarotTarot('O LOUCO')).toBeDefined();
      expect(getTarotTarot('  o mago  ')).toBeDefined();
      expect(getTarotTarot('A IMPERATRIZ')).toBeDefined();
    });

    it('should return null for unknown arcano', () => {
      expect(getTarotTarot('Unknown Card')).toBeNull();
      expect(getTarotTarot('')).toBeNull();
    });

    it('should include all required properties', () => {
      const result = getTarotTarot('O Sol');

      expect(result).toHaveProperty('arcano');
      expect(result).toHaveProperty('numero_carta');
      expect(result).toHaveProperty('related_arcano');
      expect(result).toHaveProperty('related_numero');
      expect(result).toHaveProperty('path_type');
      expect(result).toHaveProperty('spiritual_meaning');
      expect(typeof result?.spiritual_meaning).toBe('string');
      expect(result?.spiritual_meaning.length).toBeGreaterThan(10);
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all Tarot-Tarot mappings', () => {
      const result = getAllTarotPaths();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(20);
    });

    it('should include Fool journey mappings', () => {
      const result = getAllTarotPaths();

      const hasFool = result.some(m => m.arcano === 'O Louco');
      const hasMagician = result.some(m => m.arcano === 'O Mago');
      const hasWorld = result.some(m => m.arcano === 'O Mundo');

      expect(hasFool).toBe(true);
      expect(hasMagician).toBe(true);
      expect(hasWorld).toBe(true);
    });

    it('should have valid path types for all mappings', () => {
      const result = getAllTarotPaths();

      result.forEach(m => {
        expect(m.path_type).toMatch(
          /^(jornada|transformacao|equilibrio|polaridade|culminacao|iniciacao|sombra|luz|ciclo|ascensao)$/
        );
      });
    });

    it('should have complete mapping properties', () => {
      const result = getAllTarotPaths();

      result.forEach(m => {
        expect(m.arcano).toBeTruthy();
        expect(typeof m.numero_carta).toBe('number');
        expect(m.numero_carta).toBeGreaterThanOrEqual(0);
        expect(m.numero_carta).toBeLessThanOrEqual(21);
        expect(m.related_arcano).toBeTruthy();
        expect(typeof m.related_numero).toBe('number');
        expect(m.spiritual_meaning).toBeTruthy();
        expect(m.spiritual_meaning.length).toBeGreaterThan(10);
      });
    });

    it('should have consistent arcano and numero_carta', () => {
      const result = getAllTarotPaths();

      result.forEach(m => {
        const numMap = getMappingByNumber(m.numero_carta);
        expect(numMap?.arcano).toBe(m.arcano);
      });
    });
  });

  describe('getRelatedArcano', () => {
    it('should return related arcano name', () => {
      expect(getRelatedArcano('O Louco')).toBe('O Mago');
      expect(getRelatedArcano('O Mundo')).toBe('O Louco');
      expect(getRelatedArcano('A Lua')).toBe('O Sol');
    });

    it('should return null for unknown arcano', () => {
      expect(getRelatedArcano('Unknown')).toBeNull();
    });
  });

  describe('getAllRelatedArcanos', () => {
    it('should return all relationships for an arcano', () => {
      const result = getAllRelatedArcanos('O Mago');

      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.arcano === 'O Mago' || m.related_arcano === 'O Mago').toBe(true);
      });
    });

    it('should return multiple relationships for Magician', () => {
      const result = getAllRelatedArcanos('O Mago');

      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for unknown arcano', () => {
      expect(getAllRelatedArcanos('Unknown').length).toBe(0);
    });
  });

  describe('getPathsByType', () => {
    it('should return all journey path mappings', () => {
      const result = getPathsByType('jornada');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => expect(m.path_type).toBe('jornada'));
    });

    it('should return all transformation path mappings', () => {
      const result = getPathsByType('transformacao');

      expect(Array.isArray(result)).toBe(true);
      result.forEach(m => expect(m.path_type).toBe('transformacao'));
    });

    it('should return all light path mappings', () => {
      const result = getPathsByType('luz');

      expect(Array.isArray(result)).toBe(true);
      result.forEach(m => expect(m.path_type).toBe('luz'));
    });

    it('should return all ciclo path mappings', () => {
      const result = getPathsByType('ciclo');

      expect(Array.isArray(result)).toBe(true);
      expect(result.some(m => m.arcano === 'O Eremita')).toBe(true);
      expect(result.some(m => m.arcano === 'O Mundo')).toBe(true);
    });

    it('should return empty array for unknown path type', () => {
      expect(getPathsByType('unknown').length).toBe(0);
    });
  });

  describe('getAllArcanos', () => {
    it('should return all unique arcano names', () => {
      const result = getAllArcanos();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(22);
    });

    it('should include all Major Arcana cards', () => {
      const result = getAllArcanos();

      const majorArcanas = [
        'O Louco',
        'O Mago',
        'A Sacerdotisa',
        'A Imperatriz',
        'O Imperador',
        'O Hierofante',
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

      majorArcanas.forEach(arcano => {
        expect(result).toContain(arcano);
      });
    });

    it('should be sorted by card number', () => {
      const result = getAllArcanos();

      const order = [
        'O Louco',
        'O Mago',
        'A Sacerdotisa',
        'A Imperatriz',
        'O Imperador',
        'O Hierofante',
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

      order.forEach((arcano, index) => {
        const resultIndex = result.indexOf(arcano);
        expect(resultIndex).toBeGreaterThanOrEqual(index);
      });
    });
  });

  describe('hasTarotTarot', () => {
    it('should return true for existing arcano', () => {
      expect(hasTarotTarot('O Louco')).toBe(true);
      expect(hasTarotTarot('O Sol')).toBe(true);
      expect(hasTarotTarot('O Mundo')).toBe(true);
    });

    it('should return false for unknown arcano', () => {
      expect(hasTarotTarot('Unknown')).toBe(false);
      expect(hasTarotTarot('')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(hasTarotTarot('O LOUCO')).toBe(true);
      expect(hasTarotTarot('o mago')).toBe(true);
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return arcano by card number', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
      expect(getArcanoByNumber(1)).toBe('O Mago');
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return null for invalid card number', () => {
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  describe('getPathType', () => {
    it('should return path type for arcano', () => {
      expect(getPathType('O Louco')).toBe('iniciacao');
      expect(getPathType('O Mago')).toBe('polaridade');
      expect(getPathType('A Morte')).toBe('transformacao');
      expect(getPathType('O Mundo')).toBe('ciclo');
    });

    it('should return null for unknown arcano', () => {
      expect(getPathType('Unknown')).toBeNull();
    });
  });

  describe('getAllPathTypes', () => {
    it('should return all path types', () => {
      const result = getAllPathTypes();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('jornada');
      expect(result).toContain('transformacao');
      expect(result).toContain('equilibrio');
      expect(result).toContain('polaridade');
      expect(result).toContain('culminacao');
      expect(result).toContain('iniciacao');
      expect(result).toContain('sombra');
      expect(result).toContain('luz');
      expect(result).toContain('ciclo');
      expect(result).toContain('ascensao');
    });
  });

  describe('getMappingByNumber', () => {
    it('should return mapping by card number', () => {
      const result = getMappingByNumber(0);

      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Louco');
      expect(result?.numero_carta).toBe(0);
    });

    it('should return null for invalid card number', () => {
      expect(getMappingByNumber(22)).toBeNull();
    });
  });

  describe('getBidirectionalPaths', () => {
    it('should return mappings with reverse relationships', () => {
      const result = getBidirectionalPaths();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should include Fool journey mappings', () => {
      const result = getBidirectionalPaths();

      const hasFoolMagician = result.some(
        m => m.arcano === 'O Louco' && m.related_arcano === 'O Mago'
      );
      expect(hasFoolMagician).toBe(true);
    });
  });

  describe("Fool's Journey spiritual consistency", () => {
    it('should follow the major arcana sequence progression', () => {
      const arcanoSequence = [
        'O Louco',
        'O Mago',
        'A Sacerdotisa',
        'A Imperatriz',
        'O Imperador',
        'O Hierofante',
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

      arcanoSequence.forEach((arcano, index) => {
        const mapping = getTarotTarot(arcano);
        expect(mapping).toBeDefined();
        expect(mapping?.numero_carta).toBe(index);
      });
    });

    it('should represent transformation themes correctly', () => {
      const transformationCards = ['A Morte', 'A Torre', 'O Enforcado', 'A Temperança'];

      transformationCards.forEach(arcano => {
        const mapping = getTarotTarot(arcano);
        expect(mapping?.path_type).toMatch(/^(transformacao|sombra|luz)$/);
      });
    });

    it('should complete the cycle with World returning to Fool', () => {
      const worldMapping = getTarotTarot('O Mundo');

      expect(worldMapping?.related_arcano).toBe('O Louco');
      expect(worldMapping?.path_type).toBe('ciclo');

      const foolMapping = getTarotTarot('O Louco');
      expect(foolMapping?.related_arcano).toBe('O Mago');
    });
  });

  describe('Cross-reference consistency', () => {
    it('should maintain consistent related arcano numbers', () => {
      const allPaths = getAllTarotPaths();

      allPaths.forEach(m => {
        const relatedMapping = getMappingByNumber(m.related_numero);
        expect(relatedMapping?.arcano).toBe(m.related_arcano);
      });
    });

    it('should have meaningful spiritual meanings for all paths', () => {
      const allPaths = getAllTarotPaths();

      allPaths.forEach(m => {
        expect(m.spiritual_meaning.length).toBeGreaterThan(50);
        expect(m.spiritual_meaning).toMatch(/[áéíóúãõàèìòùâêîôû]/);
      });
    });
  });
});
