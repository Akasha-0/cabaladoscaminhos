import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/maria-data';

describe('orixa/maria-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
