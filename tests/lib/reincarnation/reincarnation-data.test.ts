import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/reincarnation/reincarnation-data';

describe('reincarnation/reincarnation-data', () => {
  it('returns data with reincarnation records', () => {
    const data = getData();
    expect(data).toBeDefined();
    expect(Array.isArray(data.reincarnationRecords)).toBe(true);
  });

  it('includes soul cycles', () => {
    const data = getData();
    expect(Array.isArray(data.soulCycles)).toBe(true);
  });

  it('includes archetypes', () => {
    const data = getData();
    expect(Array.isArray(data.archetypes)).toBe(true);
  });
});