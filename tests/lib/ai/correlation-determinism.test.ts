// tests/lib/ai/correlation-determinism.test.ts
// AD-19.4 / Doc 06: Correlation injection must be deterministic and leak-free.
// House 34 (Peixes) only injects 2ª Casa + Venus + karma — NOT ascendant or moon.
// House 7 (Serpente) injects Lilith — NOT sun or moon.

import { describe, it, expect } from 'vitest';
import { CORRELATION_MAP, extractFromMap } from '@/lib/ai/correlation-map';

describe('Correlation determinism (Doc 06 / AD-19.4)', () => {
  it('House 34 (Peixes) only injects 2ª Casa + Venus + karma — NOT ascendant or moon', () => {
    const entry = CORRELATION_MAP[34];
    expect(entry.astrology.primaryHouses).toContain(2);
    expect(entry.astrology.primaryPlanets).toContain('venus');
    expect(entry.astrology.primaryPlanets).not.toContain('ascendant');
    expect(entry.astrology.primaryPlanets).not.toContain('moon');
  });

  it('House 7 (Serpente) injects Lilith — NOT sun or moon', () => {
    const entry = CORRELATION_MAP[7];
    expect(entry.astrology.primaryPlanets).toContain('lilith');
    expect(entry.astrology.primaryPlanets).not.toContain('sun');
    expect(entry.astrology.primaryPlanets).not.toContain('moon');
  });

  it('extractFromMap only returns keys that were requested (no leakage)', () => {
    // Simulate a map with extra fields
    const fakeMap = {
      ascendant: 'aries',
      sun: 'leo',
      moon: 'cancer',
      extraField: 'should not appear',
    };
    const result = extractFromMap(fakeMap as Record<string, unknown>, ['sun']);
    expect(Object.keys(result)).toEqual(['sun']);
    expect(result).not.toHaveProperty('extraField');
    expect(result).not.toHaveProperty('ascendant');
  });
});

// AD-20.6: CorrelationEntry must have source and rationale for provenance tracking.
describe('CorrelationEntry provenance (AD-20.6)', () => {
  it('has source and rationale for all 36 houses', () => {
    for (let i = 1; i <= 36; i++) {
      const entry = CORRELATION_MAP[i]!;
      expect(entry.astrology.source, `House ${i} astrology.source`).toBeDefined();
      expect(entry.astrology.rationale, `House ${i} astrology.rationale`).toBeDefined();
      expect(entry.kabalah.source, `House ${i} kabalah.source`).toBeDefined();
      expect(entry.tantric.source, `House ${i} tantric.source`).toBeDefined();
    }
 });
});
