// @ts-nocheck — orphan test file with unresolved imports (cycle 19 W19-Worker-A)
import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/herb/v2/herb-v2-data';

describe('herb-v2-data', () => {
  it('getData returns object', () => {
    const data = getData();
    expect(typeof data).toBe('object');
  });

  it('has herbs with categories', () => {
    const data = getData();
    const alecrim = data['alecrim'];
    expect(alecrim).toBeDefined();
    expect(alecrim).toHaveProperty('category');
  });

  it('herbs have namePt and nameEn', () => {
    const data = getData();
    const alecrim = data['alecrim'];
    expect(alecrim).toHaveProperty('namePt');
    expect(alecrim).toHaveProperty('nameEn');
  });
});