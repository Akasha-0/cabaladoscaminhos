import { describe, it, expect, beforeEach } from 'vitest';
import { getMilestones, getMilestonesByCategory, getMilestoneProgress } from '../../../src/lib/journey/milestones';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('milestones', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('getMilestones returns array', () => {
    const milestones = getMilestones();
    expect(Array.isArray(milestones)).toBe(true);
    expect(milestones.length).toBeGreaterThan(0);
  });

  it('getMilestonesByCategory filters correctly', () => {
    const practiceMilestones = getMilestonesByCategory('prática');
    expect(practiceMilestones.every(m => m.category === 'prática')).toBe(true);
  });

  it('getMilestoneProgress returns progress object', () => {
    const progress = getMilestoneProgress();
    expect(progress).toHaveProperty('total');
    expect(progress).toHaveProperty('completed');
    expect(progress).toHaveProperty('byCategory');
  });
});
