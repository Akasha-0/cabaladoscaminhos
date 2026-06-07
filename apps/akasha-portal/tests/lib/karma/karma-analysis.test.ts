import { describe, it, expect } from 'vitest';
import { analyze, type AnalysisInput } from '@/lib/karma/karma-analysis';

describe('karma/karma-analysis', () => {
  it('analyzes karmic state with basic input', () => {
    const input: AnalysisInput = {
      userId: 'user-123',
      currentKarma: 50,
    };
    const result = analyze(input);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('dominantPatterns');
    expect(result).toHaveProperty('severityScore');
    expect(result).toHaveProperty('cyclePhase');
  });

  it('filters patterns by numerology number', () => {
    const input: AnalysisInput = {
      userId: 'user-456',
      currentKarma: 30,
      numerologyNumber: 1,
    };
    const result = analyze(input);
    expect(result.severityScore).toBeDefined();
    expect(typeof result.severityScore).toBe('number');
  });

  it('includes insights and recommendations', () => {
    const input: AnalysisInput = {
      userId: 'user-789',
      currentKarma: 75,
      indicators: ['workplace', 'competition'],
    };
    const result = analyze(input);
    expect(Array.isArray(result.insights)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });
});