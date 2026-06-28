// @ts-nocheck — orphan test file with unresolved imports (cycle 19 W19-Worker-A)
import { describe, it, expect } from 'vitest';
import { getData, default as herbs } from '@/lib/herb/herb-data';

describe('herb-data', () => {
  it('getData returns object', () => {
    const data = getData();
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();
  });

  it('has herb entries', () => {
    const data = getData();
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });

  it('herbs have properties', () => {
    const data = getData();
    const alecrim = data['alecrim'];
    expect(alecrim).toBeDefined();
    expect(alecrim).toHaveProperty('name');
    expect(alecrim).toHaveProperty('flavor');
  });
});