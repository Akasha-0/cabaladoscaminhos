import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oyanda-data';

describe('orixa/oyanda-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
