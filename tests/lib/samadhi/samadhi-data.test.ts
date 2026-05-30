import { describe, it, expect } from 'vitest';
import { getData, getLevelById } from '@/lib/samadhi/samadhi-data';

describe('samadhi-data', () => {
  it('returns samadhi data object', () => {
    const data = getData();
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('levels');
    expect(Array.isArray(data.levels)).toBe(true);
  });

  it('has at least one level', () => {
    const data = getData();
    expect(data.levels.length).toBeGreaterThan(0);
  });

  it('gets level by id', () => {
    const data = getData();
    const id = data.levels[0].id;
    const level = getLevelById(id);
    expect(level).toBeDefined();
    expect(level?.id).toBe(id);
  });
});
