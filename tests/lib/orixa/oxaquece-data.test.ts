import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/oxaquece-data';

describe('orixa/oxaquece-data', () => {
  it('has data', () => {
    expect(getData()).toBeDefined();
  });
});
