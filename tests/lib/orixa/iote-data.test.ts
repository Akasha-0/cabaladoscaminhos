import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/iote-data';

describe('orixa/iote-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
