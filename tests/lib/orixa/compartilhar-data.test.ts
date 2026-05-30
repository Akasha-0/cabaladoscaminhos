import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/compartilhar-data';

describe('orixa/compartilhar-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
