import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/alignment/alignment-data';

describe('alignment-data', () => {
  it('getData returns array', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
  });

  it('entries have required fields', () => {
    const data = getData();
    expect(data.length).toBeGreaterThan(0);
    const entry = data[0];
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('traits');
  });

  it('has 8 alignment entries', () => {
    const data = getData();
    expect(data.length).toBe(8);
  });
});