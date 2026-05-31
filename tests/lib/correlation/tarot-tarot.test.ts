import { describe, it, expect } from 'vitest';
import {
  getTarotTarot, getAllTarotPaths, getAllPathTypes, getAllMappedArcanos,
  getRelationsForArcano, getRelationsByPathType, getPathTypeBetween,
  getSpiritualMeaningBetween, hasRelation, getArcanoByNumber,
  ALL_MAJOR_ARCANOS, TAROT_TAROT_MAPPINGS, TOTAL_MAPPINGS, TOTAL_PATH_TYPES,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  it('should have 22 Major Arcana cards', () => {
    expect(ALL_MAJOR_ARCANOS.length).toBe(22);
    expect(ALL_MAJOR_ARCANOS[0]).toBe('0 - O Louco');
    expect(ALL_MAJOR_ARCANOS[21]).toBe('XXI - O Mundo');
  });

  it('should export getTarotTarot', () => {
    expect(typeof getTarotTarot).toBe('function');
  });

  it('should return mappings for O Louco', () => {
    const result = getTarotTarot('0 - O Louco');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should export getAllTarotPaths', () => {
    expect(typeof getAllTarotPaths).toBe('function');
    expect(getAllTarotPaths().length).toBe(TOTAL_MAPPINGS);
  });

  it('should export getAllPathTypes', () => {
    expect(typeof getAllPathTypes).toBe('function');
    expect(getAllPathTypes().length).toBe(TOTAL_PATH_TYPES);
  });

  it('should export getAllMappedArcanos', () => {
    expect(typeof getAllMappedArcanos).toBe('function');
    expect(getAllMappedArcanos().length).toBeGreaterThan(0);
  });

  it('should export getPathTypeBetween', () => {
    expect(typeof getPathTypeBetween).toBe('function');
    const result = getPathTypeBetween('0 - O Louco', 'I - O Mago');
    expect(result).toBeTruthy();
  });

  it('should export getSpiritualMeaningBetween', () => {
    expect(typeof getSpiritualMeaningBetween).toBe('function');
    const result = getSpiritualMeaningBetween('0 - O Louco', 'I - O Mago');
    expect(result).toBeTruthy();
  });

  it('should export hasRelation', () => {
    expect(typeof hasRelation).toBe('function');
    expect(hasRelation('0 - O Louco', 'I - O Mago')).toBe(true);
  });

  it('should export getArcanoByNumber', () => {
    expect(typeof getArcanoByNumber).toBe('function');
    expect(getArcanoByNumber(0)).toBe('0 - O Louco');
    expect(getArcanoByNumber(21)).toBe('XXI - O Mundo');
  });

  it('should export TOTAL_MAPPINGS and TOTAL_PATH_TYPES', () => {
    expect(TOTAL_MAPPINGS).toBeTruthy();
    expect(TOTAL_PATH_TYPES).toBeTruthy();
  });
});