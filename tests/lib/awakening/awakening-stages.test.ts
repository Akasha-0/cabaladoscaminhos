import { describe, it, expect } from 'vitest';
import { getStages } from '@/lib/awakening/awakening-stages';

describe('awakening/awakening-stages', () => {
  it('has stages', () => {
    expect(getStages()).toBeDefined();
  });
});
