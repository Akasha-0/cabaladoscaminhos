import { describe, it, expect } from 'vitest';
import { performReading, type ReadingResult } from '@/lib/aura/aura-reading';

describe('aura/aura-reading', () => {
  it('performReading returns ReadingResult', () => {
    const result = performReading();
    expect(result).toBeDefined();
    expect(typeof result.aura).toBe('string');
    expect(typeof result.description).toBe('string');
    expect(typeof result.strength).toBe('number');
    expect(Array.isArray(result.elements)).toBe(true);
  });

  it('ReadingResult has valid aura type', () => {
    const result = performReading() as ReadingResult;
    expect(['violet', 'blue', 'green', 'yellow', 'orange', 'red', 'pink', 'white', 'gold']).toContain(result.aura);
  });
});