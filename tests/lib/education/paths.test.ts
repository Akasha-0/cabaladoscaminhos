import { describe, it, expect } from 'vitest';
import { getLearningPaths, getLearningPath, getModule, getLesson } from '@/lib/education/paths';

describe('education/paths', () => {
  it('returns all learning paths', () => {
    const paths = getLearningPaths();
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0].id).toBe('cabala');
  });

  it('finds a learning path by id', () => {
    const path = getLearningPath('numerologia');
    expect(path).toBeDefined();
    expect(path?.title).toBe('Numerologia');
  });

  it('finds a module within a path', () => {
    const mod = getModule('cabala', 'cabala-intro');
    expect(mod).toBeDefined();
    expect(mod?.title).toBe('Fundamentos da Cabala');
  });
});
