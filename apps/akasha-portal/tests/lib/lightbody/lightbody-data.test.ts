import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/lightbody/lightbody-data';

describe('lightbody/lightbody-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
