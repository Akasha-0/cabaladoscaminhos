import { describe, it, expect } from 'vitest';
import { getData, getDataByType, getDataById } from '@/lib/shadow/shadow-data';

describe('shadow-data', () => {
  it('returns array of shadow data', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('filters by type', () => {
    const aspects = getDataByType('aspect');
    expect(Array.isArray(aspects)).toBe(true);
    aspects.forEach((item) => {
      expect(item.type).toBe('aspect');
    });
  });

  it('gets entry by id', () => {
    const data = getData();
    const id = data[0].id;
    const entry = getDataById(id);
    expect(entry).toBeDefined();
    expect(entry?.id).toBe(id);
  });
});
