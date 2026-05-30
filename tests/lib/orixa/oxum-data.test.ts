import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oxum-data';

describe('orixa/oxum-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
