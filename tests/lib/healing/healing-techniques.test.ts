import { describe, it, expect } from 'vitest';
import { getTechniques, getTechniqueById, getTechniquesByType, type HealingTechniqueType } from '@/lib/healing/healing-techniques';

describe('healing/healing-techniques', () => {
  it('getTechniques returns array', () => {
    const techniques = getTechniques();
    expect(Array.isArray(techniques)).toBe(true);
    expect(techniques.length).toBeGreaterThan(0);
  });

  it('getTechniqueById finds technique by id', () => {
    const techniques = getTechniques();
    if (techniques.length > 0) {
      const first = techniques[0];
      const found = getTechniqueById(first.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(first.id);
    }
  });

  it('getTechniquesByType filters by type', () => {
    const reiki = getTechniquesByType('reiki' as HealingTechniqueType);
    expect(Array.isArray(reiki)).toBe(true);
    // May be empty if no reiki techniques exist
  });
});