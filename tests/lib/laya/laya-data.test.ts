import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/laya/laya-data';

describe('laya/laya-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
