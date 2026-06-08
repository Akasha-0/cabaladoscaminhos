import { describe, it, expect } from 'vitest';
import { getGuide, getGuideByType } from '@/lib/offerings/offering-guide';

describe('offering-guide', () => {
  it('getGuide returns array of guides', () => {
    const guides = getGuide();
    expect(Array.isArray(guides)).toBe(true);
    expect(guides.length).toBeGreaterThan(0);
  });

  it('each guide has required fields', () => {
    const guides = getGuide();
    const guide = guides[0];
    expect(guide).toHaveProperty('tipo');
    expect(guide).toHaveProperty('nome');
    expect(guide).toHaveProperty('preparar');
    expect(guide).toHaveProperty('cuidados');
    expect(guide).toHaveProperty('horariostipicos');
  });

  it('getGuideByType returns guide for valid type', () => {
    const guide = getGuideByType('agua');
    expect(guide).toBeDefined();
    expect(guide?.tipo).toBe('agua');
  });

  it('getGuideByType returns undefined for invalid type', () => {
    const guide = getGuideByType('outro');
    expect(guide).toBeUndefined();
  });
});