import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/odara-data';

describe('orixa/odara-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
