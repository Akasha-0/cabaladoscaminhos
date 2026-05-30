import { describe, it, expect } from 'vitest';
import { getMeanings, getByElement, getByChakra } from '@/lib/garden/plant-meanings';

describe('garden/plant-meanings', () => {
  it('returns all plant meanings', () => {
    const meanings = getMeanings();
    expect(Array.isArray(meanings)).toBe(true);
    expect(meanings.length).toBeGreaterThan(0);
  });

  it('filters by plant name', () => {
    const meanings = getMeanings('rose');
    expect(Array.isArray(meanings)).toBe(true);
  });

  it('filters by element', () => {
    const meanings = getByElement('fire');
    expect(Array.isArray(meanings)).toBe(true);
  });

  it('filters by chakra', () => {
    const meanings = getByChakra(1);
    expect(Array.isArray(meanings)).toBe(true);
  });
});