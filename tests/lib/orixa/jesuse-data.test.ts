import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/jesuse-data';

describe('orixa/jesuse-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
