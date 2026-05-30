import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/transmutation/transmutation-data';

describe('transmutation/transmutation-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
