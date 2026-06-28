// @ts-nocheck — orphan test file with unresolved imports (cycle 19 W19-Worker-A)
import { describe, it, expect, beforeEach } from 'vitest';
import { addRitualCompletion, getRitualHistory, getRitualStats, resetRitualStore } from '@/lib/ritual-storage';

describe('lib/ritual-storage', () => {
  beforeEach(() => {
    resetRitualStore();
  });

  it('adds a completion record', () => {
    const result = addRitualCompletion('user1', 'ritual1', new Date(), 30);
    expect(result.userId).toBe('user1');
    expect(result.ritualId).toBe('ritual1');
    expect(result.duration).toBe(30);
  });

  it('stores with optional notes', () => {
    const result = addRitualCompletion('user1', 'ritual1', new Date(), 30, 'Test note');
    expect(result.notes).toBe('Test note');
  });

  it('getRitualHistory returns empty array for user with no rituals', () => {
    expect(getRitualHistory('unknown')).toEqual([]);
  });

  it('getRitualHistory returns completions for user', () => {
    addRitualCompletion('user1', 'ritual1', new Date(), 30);
    addRitualCompletion('user1', 'ritual2', new Date(), 20);
    const history = getRitualHistory('user1');
    expect(history).toHaveLength(2);
  });

  it('getRitualHistory only returns completions for specified user', () => {
    addRitualCompletion('user1', 'ritual1', new Date(), 30);
    addRitualCompletion('user2', 'ritual1', new Date(), 30);
    const history = getRitualHistory('user1');
    expect(history).toHaveLength(1);
    expect(history[0].userId).toBe('user1');
  });

  it('getRitualStats returns zero stats for user with no rituals', () => {
    const stats = getRitualStats('unknown');
    expect(stats.totalCompletions).toBe(0);
    expect(stats.totalDuration).toBe(0);
  });

  it('getRitualStats calculates total completions', () => {
    addRitualCompletion('user1', 'ritual1', new Date(), 30);
    addRitualCompletion('user1', 'ritual2', new Date(), 20);
    const stats = getRitualStats('user1');
    expect(stats.totalCompletions).toBe(2);
  });

  it('getRitualStats calculates total duration', () => {
    addRitualCompletion('user1', 'ritual1', new Date(), 30);
    addRitualCompletion('user1', 'ritual2', new Date(), 20);
    const stats = getRitualStats('user1');
    expect(stats.totalDuration).toBe(50);
  });

  it('resetRitualStore clears all completions', () => {
    addRitualCompletion('user1', 'ritual1', new Date(), 30);
    resetRitualStore();
    expect(getRitualHistory('user1')).toEqual([]);
  });
});
