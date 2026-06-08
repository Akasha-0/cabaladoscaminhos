import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ogum-data';

describe('orixa/ogum-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
