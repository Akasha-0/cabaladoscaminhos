import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/osa-meji-data';

describe('orixa/osa-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
