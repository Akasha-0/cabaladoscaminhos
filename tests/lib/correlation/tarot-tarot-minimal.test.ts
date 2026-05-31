import { describe, it, expect } from 'vitest';
import { getTarotTarot, getAllTarotPaths, getAllPathTypes, getAllMappedArcanos, getRelationsForArcano, getRelationsByPathType, getPathTypeBetween, getSpiritualMeaningBetween, hasRelation, getArcanoByNumber, ALL_MAJOR_ARCANOS, TAROT_TAROT_MAPPINGS, TOTAL_MAPPINGS, TOTAL_PATH_TYPES } from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot minimal', () => {
  it('TAROT_TAROT_MAPPINGS is defined', () => {
    expect(TAROT_TAROT_MAPPINGS).toBeDefined();
    expect(TAROT_TAROT_MAPPINGS.length).toBeGreaterThan(0);
  });

  it('ALL_MAJOR_ARCANOS is defined', () => {
    expect(ALL_MAJOR_ARCANOS).toBeDefined();
    expect(ALL_MAJOR_ARCANOS.length).toBe(22);
  });

  it('TOTAL_MAPPINGS is defined', () => {
    expect(TOTAL_MAPPINGS).toBeDefined();
    expect(TOTAL_PATH_TYPES).toBeDefined();
  });

  it('getAllTarotPaths works', () => {
    const result = getAllTarotPaths();
    expect(result).toBeDefined();
    expect(result.length).toBe(TAROT_TAROT_MAPPINGS.length);
  });

  it('getAllPathTypes works', () => {
    const result = getAllPathTypes();
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('getAllMappedArcanos works', () => {
    const result = getAllMappedArcanos();
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('getRelationsForArcano works', () => {
    const result = getRelationsForArcano('O Louco');
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('getRelationsByPathType works', () => {
    const result = getRelationsByPathType('sequential');
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('getTarotTarot works', () => {
    const result = getTarotTarot('O Louco', 'O Mago');
    expect(result).toBeDefined();
    expect(result?.arcano).toBe('O Louco');
    expect(result?.related_arcano).toBe('O Mago');
  });

  it('getPathTypeBetween works', () => {
    const result = getPathTypeBetween('O Louco', 'O Mago');
    expect(result).toBe('sequential');
  });

  it('getSpiritualMeaningBetween works', () => {
    const result = getSpiritualMeaningBetween('O Louco', 'O Mago');
    expect(result).toBeTruthy();
    expect(typeof result === 'string').toBe(true);
  });

  it('hasRelation works', () => {
    expect(hasRelation('O Louco', 'O Mago')).toBe(true);
    expect(hasRelation('O Louco', 'O Sol')).toBe(false);
  });

  it('getArcanoByNumber works', () => {
    expect(getArcanoByNumber(0)).toBe('0 - O Louco');
    expect(getArcanoByNumber(21)).toBe('XXI - O Mundo');
    expect(getArcanoByNumber(99)).toBeNull();
  });
});
