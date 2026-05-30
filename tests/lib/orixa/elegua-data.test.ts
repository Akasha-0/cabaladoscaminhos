import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/elegua-data';

describe('orixa/elegua-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
