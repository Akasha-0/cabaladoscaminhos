import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ika-data';

describe('orixa/ika-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
