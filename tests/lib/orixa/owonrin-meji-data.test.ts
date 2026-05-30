import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/owonrin-meji-data';

describe('orixa/owonrin-meji-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
