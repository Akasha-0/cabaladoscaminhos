import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oturupon-meji-data';

describe('orixa/oturupon-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
