import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/transcendence/transcendence-data';

describe('transcendence/transcendence-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
