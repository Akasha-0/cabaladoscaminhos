import { describe, it, expect } from 'vitest';
import { performBreathwork } from '@/lib/breath/breathwork';

describe('breathwork', () => {
  it('performs a breathwork session', () => {
    const result = performBreathwork('relaxing');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('session');
    expect(result).toHaveProperty('message');
  });

  it('session tracks cycles completed', () => {
    const result = performBreathwork('energizing');
    expect(result.session.cyclesCompleted).toBeGreaterThanOrEqual(0);
    expect(result.session.totalCycles).toBe(10); // from exercise data
  });
  it('returns failure for unknown exercise', () => {
    const result = performBreathwork('nonexistent');
    expect(result.success).toBe(false);
  });
});
