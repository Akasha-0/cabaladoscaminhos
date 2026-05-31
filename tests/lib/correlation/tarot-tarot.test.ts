import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getAllMappedArcanos,
  getRelationsForArcano,
  getRelationsByPathType,
  getPathTypeBetween,
  getSpiritualMeaningBetween,
  hasRelation,
  getArcanoByNumber,
  ALL_MAJOR_ARCANOS,
  TAROT_TAROT_MAPPINGS,
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  it('should have 22 Major Arcana', () => {
    expect(ALL_MAJOR_ARCANOS.length).toBe(22);
  });

  it('should export functions', () => {
    expect(typeof getTarotTarot).toBe('function');
    expect(typeof getAllTarotPaths).toBe('function');
    expect(typeof getAllPathTypes).toBe('function');
  });

  it('should return mappings for O Louco', () => {
    const r = getTarotTarot('0 - O Louco');
    expect(r.length).toBeGreaterThan(0);
  });

  it('should return all paths', () => {
    expect(getAllTarotPaths().length).toBe(TOTAL_MAPPINGS);
  });

  it('should return path types', () => {
    expect(getAllPathTypes().length).toBe(TOTAL_PATH_TYPES);
  });

  it('should return mapped arcanos', () => {
    expect(getAllMappedArcanos().length).toBeGreaterThan(0);
  });

  it('should find path between related cards', () => {
    expect(getPathTypeBetween('0 - O Louco', 'I - O Mago')).toBeTruthy();
  });

  it('should find spiritual meaning', () => {
    expect(getSpiritualMeaningBetween('0 - O Louco', 'I - O Mago')).toBeTruthy();
  });

  it('should check relation', () => {
    expect(hasRelation('0 - O Louco', 'I - O Mago')).toBe(true);
  });

  it('should get arcano by number', () => {
    expect(getArcanoByNumber(0)).toBe('0 - O Louco');
    expect(getArcanoByNumber(21)).toBe('XXI - O Mundo');
  });

  it('should export constants', () => {
    expect(TOTAL_MAPPINGS).toBeTruthy();
    expect(TOTAL_PATH_TYPES).toBeTruthy();
  });
});
