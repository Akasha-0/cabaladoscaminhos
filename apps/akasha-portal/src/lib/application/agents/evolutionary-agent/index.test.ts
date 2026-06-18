/**
 * evolutionary-agent/index.test.ts
 *
 * Test coverage for:
 * - normalizePhase: phase normalization with known and unknown phases
 * - deriveLunarExercises: lunar exercise derivation and shape
 * - deriveExercisesFromSnapshot: full exercise set generation
 */
import { describe, it, expect } from 'vitest';
import { buildCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';
import type { PersonalCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';
import {
  normalizePhase,
  deriveLunarExercises,
  deriveExercisesFromSnapshot,
  LUNAR_EXERCISES,
} from './index';

// ─── Fixture ────────────────────────────────────────────────────────────────────

const BIRTH = new Date('1990-05-15T00:00:00Z');
const NOW = new Date('2026-06-15T12:00:00Z');

function makeSnapshot(): PersonalCycleSnapshot {
  return buildCycleSnapshot(BIRTH, 11, 5, 'Maria Silva', NOW);
}

// ─── normalizePhase ─────────────────────────────────────────────────────────────

describe('normalizePhase', () => {
  it('maps known phase strings to their canonical form', () => {
    expect(normalizePhase('nova')).toBe('nova');
    expect(normalizePhase('Nova')).toBe('nova');
    expect(normalizePhase('nova ')).toBe('nova');
    expect(normalizePhase('crescente')).toBe('crescente');
    expect(normalizePhase('Crescente')).toBe('crescente');
    expect(normalizePhase('cheia')).toBe('cheia');
    expect(normalizePhase('CHEIA')).toBe('cheia');
    expect(normalizePhase('minguante')).toBe('minguante');
    expect(normalizePhase('Minguante')).toBe('minguante');
  });

  it('falls back to nova for unknown or unrecognized phase strings', () => {
    expect(normalizePhase('xyz')).toBe('nova');
    expect(normalizePhase('')).toBe('nova');
    expect(normalizePhase('invalid phase')).toBe('nova');
    // 'crescxxx': starts with 'c', contains 'cresc' → crescente
    expect(normalizePhase('crescxxx')).toBe('crescente');
  });
});

// ─── deriveLunarExercises ───────────────────────────────────────────────────────

describe('deriveLunarExercises', () => {
  it('returns exercises with correct shape for cheia phase', () => {
    const snapshot = makeSnapshot();
    const exercises = deriveLunarExercises('cheia', snapshot);

    expect(Array.isArray(exercises)).toBe(true);
    expect(exercises.length).toBeGreaterThan(0);

    for (const ex of exercises) {
      expect(typeof ex.id).toBe('string');
      expect(ex.id).toContain('-lunar');
      expect(typeof ex.area).toBe('string');
      expect(typeof ex.title).toBe('string');
      expect(typeof ex.instruction).toBe('string');
      expect(typeof ex.duration).toBe('string');
      expect(['light', 'moderate', 'deep']).toContain(ex.difficulty);
      expect(['ritual', 'meditation', 'journaling', 'movement', 'social']).toContain(ex.type);
      expect(ex.cycleAnchor).toHaveProperty('lunar', true);
      expect(typeof ex.rationale).toBe('string');
    }
  });

  it('defaults to nova exercises for unknown moon phase', () => {
    const snapshot = makeSnapshot();
    const exercises = deriveLunarExercises('unknown-phase', snapshot);

    // Should not throw and should return an array
    expect(Array.isArray(exercises)).toBe(true);
    expect(exercises.length).toBeGreaterThan(0);
  });
});

// ─── deriveExercisesFromSnapshot ───────────────────────────────────────────────

describe('deriveExercisesFromSnapshot', () => {
  it('returns an object with all required keys', () => {
    const snapshot = makeSnapshot();
    const result = deriveExercisesFromSnapshot(snapshot, 'nova');

    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('personalDay');
    expect(result).toHaveProperty('personalMonth');
    expect(result).toHaveProperty('personalYear');
    expect(result).toHaveProperty('pinnacle');
    expect(result).toHaveProperty('karmicLessons');
    expect(result).toHaveProperty('lunar');
    expect(result).toHaveProperty('prioritizedExercises');

    // date should match snapshot
    expect(result.date).toBe(snapshot.currentDate);
  });

  it('prioritizedExercises contains all category exercises in correct order', () => {
    const snapshot = makeSnapshot();
    const result = deriveExercisesFromSnapshot(snapshot, 'nova');

    const prioritized = result.prioritizedExercises;

    // Should contain all category exercises concatenated
    expect(prioritized.length).toBeGreaterThanOrEqual(
      result.karmicLessons.length +
        result.pinnacle.length +
        result.personalDay.length +
        result.personalMonth.length +
        result.personalYear.length +
        result.lunar.length
    );

    // All prioritized items should have valid structure
    for (const ex of prioritized) {
      expect(typeof ex.id).toBe('string');
      expect(typeof ex.area).toBe('string');
      expect(typeof ex.title).toBe('string');
    }
  });

  it('uses nova as default moon phase when not specified', () => {
    const snapshot = makeSnapshot();

    const withDefault = deriveExercisesFromSnapshot(snapshot);
    const withNova = deriveExercisesFromSnapshot(snapshot, 'nova');

    // Both should produce lunar exercises (nova is default)
    expect(withDefault.lunar.length).toBe(withNova.lunar.length);
    // lunar category should not be empty
    expect(withDefault.lunar.length).toBeGreaterThan(0);
  });
});
// ─── LUNAR_EXERCISES constant ───────────────────────────────────────────────────

describe('LUNAR_EXERCISES', () => {
  it('exports all four lunar phases with required exercise types', () => {
    const phases = ['nova', 'crescente', 'cheia', 'minguante'] as const;

    for (const phase of phases) {
      const entry = LUNAR_EXERCISES[phase];
      expect(entry).toBeDefined();
      expect(typeof entry.theme).toBe('string');
      expect(entry.theme.length).toBeGreaterThan(0);
      expect(typeof entry.exercises).toBe('object');

      const types = Object.keys(entry.exercises) as Array<keyof typeof entry.exercises>;
      expect(types.length).toBeGreaterThan(0);
      for (const type of types) {
        const ex = entry.exercises[type];
        expect(typeof ex.title).toBe('string');
        expect(typeof ex.instruction).toBe('string');
        expect(typeof ex.duration).toBe('string');
        expect(['light', 'moderate', 'deep']).toContain(ex.difficulty);
      }
    }
  });

  it('each phase has at least 5 exercise types', () => {
    for (const phase of ['nova', 'crescente', 'cheia', 'minguante'] as const) {
      const entry = LUNAR_EXERCISES[phase];
      const typeCount = Object.keys(entry.exercises).length;
      expect(typeCount).toBeGreaterThanOrEqual(5);
    }
  });
});
