import { describe, it, expect } from 'vitest';
import { getCategories } from '@/lib/meditation/meditation-categories';

describe('meditation/meditation-categories', () => {
  it('has data', () => {
    expect(getCategories()).toBeDefined();
  });
});
