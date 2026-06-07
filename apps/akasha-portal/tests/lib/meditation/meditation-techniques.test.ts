import { describe, it, expect } from 'vitest';
import { getTechniques } from '@/lib/meditation/meditation-techniques';

describe('meditation/meditation-techniques', () => {
  it('has data', () => {
    expect(getTechniques()).toBeDefined();
  });
});
