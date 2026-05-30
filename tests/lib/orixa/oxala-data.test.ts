import { describe, it, expect } from 'vitest';
import { getData, getDataById, searchData, getOxalaByElement } from '@/lib/orixa/oxala-data';

describe('oxala-data', () => {
  it('should return array of oxala data', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should find oxala by id', () => {
    const first = getData()[0];
    const found = getDataById(first.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
  });

  it('should search data by query', () => {
    const results = searchData('creation');
    expect(Array.isArray(results)).toBe(true);
  });
});
