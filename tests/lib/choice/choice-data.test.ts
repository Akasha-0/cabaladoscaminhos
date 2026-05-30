import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/choice/choice-data';

describe('choice/choice-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
