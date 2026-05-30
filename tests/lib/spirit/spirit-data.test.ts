import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/spirit/spirit-data';

describe('spirit/spirit-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
