import { describe, it, expect } from 'vitest';
import { getMethods } from '@/lib/divination/divination-methods';

describe('divination-methods', () => {
  it('getMethods returns array', () => {
    const methods = getMethods();
    expect(Array.isArray(methods)).toBe(true);
  });

  it('has expected divination methods', () => {
    const methods = getMethods();
    expect(methods.length).toBeGreaterThanOrEqual(3);
  });

  it('methods have id and name', () => {
    const methods = getMethods();
    expect(methods[0]).toHaveProperty('id');
    expect(methods[0]).toHaveProperty('name');
  });
});