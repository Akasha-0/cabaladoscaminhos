import { describe, it, expect } from 'vitest';
import { PREDICTION_TYPES, ALL_PREDICTION_TYPES, TYPE_LABELS, DEFAULT_PERIOD, MIN_PERIOD, MAX_PERIOD } from '@/lib/predictions/constants';

describe('predictions/constants', () => {
  it('PREDICTION_TYPES has values', () => {
    expect(PREDICTION_TYPES.length).toBeGreaterThan(0);
  });

  it('ALL_PREDICTION_TYPES matches PREDICTION_TYPES', () => {
    expect(ALL_PREDICTION_TYPES).toEqual(PREDICTION_TYPES);
  });

  it('TYPE_LABELS covers all types', () => {
    for (const type of PREDICTION_TYPES) {
      expect(TYPE_LABELS[type]).toBeTruthy();
    }
  });

  it('period bounds are valid', () => {
    expect(DEFAULT_PERIOD).toBeGreaterThanOrEqual(MIN_PERIOD);
    expect(DEFAULT_PERIOD).toBeLessThanOrEqual(MAX_PERIOD);
    expect(MIN_PERIOD).toBeLessThan(MAX_PERIOD);
  });
});
