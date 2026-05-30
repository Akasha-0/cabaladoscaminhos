import { describe, it, expect } from 'vitest';
import { performPractice } from '@/lib/bhakti/bhakti-practice';

describe('bhakti-practice', () => {
  it('performPractice returns result with required fields', async () => {
    const result = await performPractice();

    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('practice');
    expect(result).toHaveProperty('duration');
    expect(result).toHaveProperty('completed');
    expect(result).toHaveProperty('insights');
  });

  it('performPractice returns success as true', async () => {
    const result = await performPractice();

    expect(result.success).toBe(true);
  });

  it('performPractice returns practice name', async () => {
    const result = await performPractice();

    expect(result.practice).toBe('Bhakti Practice');
  });

  it('performPractice returns duration as a number', async () => {
    const result = await performPractice();

    expect(typeof result.duration).toBe('number');
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it('performPractice returns completed as Date', async () => {
    const result = await performPractice();

    expect(result.completed).toBeInstanceOf(Date);
  });

  it('performPractice returns insights as array', async () => {
    const result = await performPractice();

    expect(Array.isArray(result.insights)).toBe(true);
    expect(result.insights.length).toBeGreaterThan(0);
  });

  it('performPractice returns insights with devotional content', async () => {
    const result = await performPractice();

    expect(result.insights).toContain('Cultivate unwavering devotion to the divine');
    expect(result.insights).toContain('Offer heartfelt prayers with sincere love');
  });
});
