import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/iron-data';

describe('orixa/iron-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
