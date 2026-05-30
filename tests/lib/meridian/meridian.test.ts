import { describe, it, expect } from 'vitest';
import { getData, getMeridianById, getMeridiansByElement } from '@/lib/meridian/meridian-data';
import { performPractice } from '@/lib/meridian/meridian-practice';

describe('meridian', () => {
  it('getData returns array of meridians', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('getMeridianById finds meridian by id', () => {
    const meridian = getMeridianById('lung');
    expect(meridian).toBeDefined();
    expect(meridian?.id).toBe('lung');
  });

  it('getMeridiansByElement filters correctly', () => {
    const metal = getMeridiansByElement('metal');
    expect(Array.isArray(metal)).toBe(true);
    metal.forEach(m => {
      expect(m.element).toBe('metal');
    });
  });

  it('performPractice returns practice result', () => {
    const result = performPractice();
    expect(result).toHaveProperty('completed');
    expect(result.completed).toBe(true);
  });
});