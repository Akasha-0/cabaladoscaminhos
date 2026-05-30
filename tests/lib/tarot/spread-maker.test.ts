import { describe, it, expect } from 'vitest';
import { createSpread, validateSpreadOptions, createTwoCardSpread, createHorseshoeSpread } from '../../../src/lib/tarot/spread-maker';

describe('spread-maker', () => {
  it('createSpread creates a valid spread', () => {
    const spread = createSpread({
      name: 'Test Spread',
      description: 'A test spread',
      positions: [
        { name: 'Position 1', description: 'First position' },
        { name: 'Position 2', description: 'Second position' },
      ],
    });
    expect(spread.name).toBe('Test Spread');
    expect(spread.totalCards).toBe(2);
    expect(spread.isCustom).toBe(true);
  });

  it('createSpread throws for empty name', () => {
    expect(() => createSpread({
      name: '',
      description: 'Test',
      positions: [{ name: 'Pos', description: 'Desc' }],
    })).toThrow();
  });

  it('createSpread throws for empty positions', () => {
    expect(() => createSpread({
      name: 'Test',
      description: 'Test',
      positions: [],
    })).toThrow();
  });

  it('validateSpreadOptions returns errors for invalid input', () => {
    const errors = validateSpreadOptions({
      name: '',
      description: 'Test',
      positions: [],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('createTwoCardSpread creates2-card spread', () => {
    const spread = createTwoCardSpread();
    expect(spread.totalCards).toBe(2);
  });

  it('createHorseshoeSpread creates 7-card spread', () => {
    const spread = createHorseshoeSpread();
    expect(spread.totalCards).toBe(7);
  });
});
