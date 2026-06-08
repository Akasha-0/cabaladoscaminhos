import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ochosi-data';

describe('orixa/ochosi-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
