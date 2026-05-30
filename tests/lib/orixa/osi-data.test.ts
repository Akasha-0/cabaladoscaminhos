import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/osi-data';

describe('orixa/osi-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
