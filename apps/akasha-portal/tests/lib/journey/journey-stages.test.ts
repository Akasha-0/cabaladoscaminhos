import { describe, it, expect } from 'vitest';
import { getStages } from '../../../src/lib/journey/journey-stages';

describe('journey-stages', () => {
  it('returns array of journey stages', () => {
    const stages = getStages();
    expect(Array.isArray(stages)).toBe(true);
    expect(stages.length).toBeGreaterThan(0);
  });

  it('each stage has required fields', () => {
    const stages = getStages();
    const stage = stages[0];
    expect(stage).toHaveProperty('id');
    expect(stage).toHaveProperty('name');
    expect(stage).toHaveProperty('description');
    expect(stage).toHaveProperty('sephiroth');
    expect(stage).toHaveProperty('symbols');
    expect(stage).toHaveProperty('practices');
    expect(stage).toHaveProperty('completionWeight');
  });

  it('first stage is birth with Malkuth sephiroth', () => {
    const stages = getStages();
    expect(stages[0].id).toBe('birth');
    expect(stages[0].sephiroth).toContain('Malkuth');
  });
});
