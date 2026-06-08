import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/xoro-data';

describe('orixa/xoro-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
