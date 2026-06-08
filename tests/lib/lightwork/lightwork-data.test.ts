import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/lightwork/lightwork-data';

describe('lightwork/lightwork-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
