import { describe, it, expect } from 'vitest';
import { getProphecies, getProphecyById, getSephirotList, getOriginsList, getThemesList } from '@/lib/prophecy/prophecy-data';

describe('prophecy/prophecy-data', () => {
  it('getProphecies returns array', () => {
    expect(Array.isArray(getProphecies())).toBe(true);
  });

  it('each prophecy has required fields', () => {
    for (const p of getProphecies()) {
      expect(p.id).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.origin).toBeTruthy();
    }
  });

  it('getProphecyById finds prophecy', () => {
    const prophecies = getProphecies();
    if (prophecies.length > 0) {
      const found = getProphecyById(prophecies[0].id);
      expect(found).toBeDefined();
    }
  });

  it('getSephirotList returns array', () => {
    expect(Array.isArray(getSephirotList())).toBe(true);
  });

  it('getOriginsList returns array', () => {
    expect(Array.isArray(getOriginsList())).toBe(true);
  });

  it('getThemesList returns array', () => {
    expect(Array.isArray(getThemesList())).toBe(true);
  });
});
