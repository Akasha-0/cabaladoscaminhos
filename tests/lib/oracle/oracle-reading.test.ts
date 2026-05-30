import { describe, it, expect } from 'vitest';
import { getSpreads, getSpreadByName, performReading } from '../../../src/lib/oracle/oracle-reading';

describe('oracle-reading', () => {
  it('getSpreads returns array of spreads', () => {
    const spreads = getSpreads();
    expect(Array.isArray(spreads)).toBe(true);
    expect(spreads.length).toBeGreaterThan(0);
  });

  it('each spread has required fields', () => {
    const spreads = getSpreads();
    const spread = spreads[0];
    expect(spread).toHaveProperty('name');
    expect(spread).toHaveProperty('count');
    expect(spread).toHaveProperty('description');
  });

  it('getSpreadByName finds spread by name', () => {
    const spreads = getSpreads();
    const spread = spreads[0];
    const found = getSpreadByName(spread.name);
    expect(found).toBeDefined();
    expect(found?.name).toBe(spread.name);
  });

  it('performReading returns reading object', () => {
    const reading = performReading();
    expect(reading).toHaveProperty('id');
    expect(reading).toHaveProperty('cards');
    expect(reading).toHaveProperty('interpretation');
    expect(reading).toHaveProperty('affirmation');
  });
});
