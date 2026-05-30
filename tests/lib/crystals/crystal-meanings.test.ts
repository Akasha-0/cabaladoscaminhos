import { describe, it, expect } from 'vitest';
import { getMeanings, getCrystalByName, getCrystalsByChakra } from '@/lib/crystals/crystal-meanings';

describe('crystal-meanings', () => {
  it('getMeanings returns array of crystals', () => {
    const meanings = getMeanings();
    expect(Array.isArray(meanings)).toBe(true);
    expect(meanings.length).toBeGreaterThan(0);
  });

  it('getCrystalByName finds crystal by name', () => {
    const crystal = getCrystalByName('Rose Quartz');
    expect(crystal).toBeDefined();
    expect(crystal?.name).toBe('Rose Quartz');
  });
  it('getCrystalsByChakra filters by chakra', () => {
    const crystals = getCrystalsByChakra('Coração');
    expect(Array.isArray(crystals)).toBe(true);
    expect(crystals.length).toBeGreaterThan(0);
    crystals.forEach(c => {
      expect(c.chakra).toContain('Coração');
    });
  });
});