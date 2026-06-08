import { describe, it, expect } from 'vitest';
import { getPlanetAspect, getAllPlanetAspects } from '@/lib/correlation/planet-aspect';

describe('correlation/planet-aspect', () => {
  it('has aspects', () => {
    expect(getAllPlanetAspects().length).toBeGreaterThan(0);
  });
  it('getPlanetAspect returns null for unknown', () => {
    expect(getPlanetAspect('unknown')).toBeNull();
  });
});
