import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/choice/choice-data';

describe('choice/choice-data', () => {
  it('returns choice data with choices and types', () => {
    const data = getData();
    expect(data.choices.length).toBeGreaterThan(0);
    expect(data.types.length).toBeGreaterThan(0);
  });

  it('has valid choice structure', () => {
    const data = getData();
    const choice = data.choices[0];
    expect(choice.id).toBeDefined();
    expect(choice.name).toBeDefined();
    expect(choice.category).toBeDefined();
    expect(Array.isArray(choice.characteristics)).toBe(true);
  });
});
