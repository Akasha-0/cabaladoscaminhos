import { describe, it, expect } from 'vitest';
import { getData, getKundaliniDataById } from '@/lib/kundalini/kundalini-data';
import { performPractice } from '@/lib/kundalini/kundalini-practice';

describe('kundalini-data', () => {
  it('getData returns array of kundalini data entries', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('getKundaliniDataById returns entry by id', () => {
    const entry = getKundaliniDataById('dormant');
    expect(entry).toBeDefined();
    expect(entry?.id).toBe('dormant');
  });

  it('getKundaliniDataById returns undefined for unknown id', () => {
    expect(getKundaliniDataById('nonexistent')).toBeUndefined();
  });
});

describe('kundalini-practice', () => {
  it('performPractice returns result with completed true', async () => {
    const result = await performPractice({ intensity: 5, duration: 30 });
    expect(result.completed).toBe(true);
    expect(result.energyLevel).toBeGreaterThanOrEqual(0);
  });

  it('performPractice activates correct number of chakras', async () => {
    const result = await performPractice({ intensity: 10, duration: 60 });
    expect(result.activatedChakras.length).toBeGreaterThan(0);
  });
});