import { describe, it, expect } from 'vitest';
import { getTechniques } from '@/lib/breathwork/breathing-techniques';

describe('breathing-techniques', () => {
  it('returns array of techniques', () => {
    const techniques = getTechniques();
    expect(Array.isArray(techniques)).toBe(true);
    expect(techniques.length).toBeGreaterThan(0);
  });

  it('each technique has required fields', () => {
    const techniques = getTechniques();
    const tech = techniques[0];
    expect(tech).toHaveProperty('id');
    expect(tech).toHaveProperty('title');
    expect(tech).toHaveProperty('type');
    expect(tech).toHaveProperty('intensity');
  });

  it('includes box-breathing technique', () => {
    const techniques = getTechniques();
    const box = techniques.find((t) => t.type === 'box-breathing');
    expect(box).toBeDefined();
  });
});
