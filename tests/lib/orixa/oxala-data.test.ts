import { describe, it, expect } from 'vitest';
import { getData, getDataById, searchData, getOxalaByElement } from '../../../src/lib/orixa/oxala-data';

describe('oxala-data', () => {
  it('getData returns array of Oxalá data', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each Oxalá entry has required fields', () => {
    const data = getData();
    const entry = data[0];
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('element');
    expect(entry).toHaveProperty('colors');
    expect(entry).toHaveProperty('qualities');
  });

  it('getDataById returns entry by id', () => {
    const data = getData();
    const entry = data[0];
    const found = getDataById(entry.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(entry.id);
  });

  it('getOxalaByElement filters by element', () => {
    const waterEntries = getOxalaByElement('water');
    expect(waterEntries.every(e => e.element.toLowerCase() === 'water')).toBe(true);
  });
});
