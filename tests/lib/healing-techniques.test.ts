import { describe, it, expect } from 'vitest';
import { getTechniques, getTechniqueById, getTechniquesByType } from '@/lib/healing/healing-techniques';

describe('healing-techniques', () => {
  it('getTechniques returns array', () => {
    const techniques = getTechniques();
    expect(Array.isArray(techniques)).toBe(true);
    expect(techniques.length).toBeGreaterThan(0);
  });

  it('getTechniqueById returns entry', () => {
    const techniques = getTechniques();
    const first = techniques[0];
    const found = getTechniqueById(first.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
  });

  it('getTechniquesByType filters', () => {
    const results = getTechniquesByType('reiki');
    expect(Array.isArray(results)).toBe(true);
  });
});