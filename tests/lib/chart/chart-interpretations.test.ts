import { describe, it, expect } from 'vitest';
import {
  getInterpretations,
  getPlanetSignInterpretation,
  getAspectInterpretation,
  getElementInterpretation,
  getSignInterpretation,
  getHouseInterpretation,
} from '~/lib/chart/chart-interpretations';

describe('chart-interpretations', () => {
  it('should return all interpretations', () => {
    const interpretations = getInterpretations();
    expect(interpretations).toBeDefined();
    expect(typeof interpretations).toBe('object');
  });

  it('should get aspect interpretation', () => {
    const aspect = getAspectInterpretation('conjunction');
    expect(aspect).toBeDefined();
  });

  it('should get house interpretation', () => {
    const house = getHouseInterpretation(1);
    expect(house).toBeDefined();
  });
});
