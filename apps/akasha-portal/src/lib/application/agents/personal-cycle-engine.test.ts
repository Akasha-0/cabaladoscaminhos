/**
 * Personal Cycle Engine — test coverage
 *
 * Covers the dynamic personal cycles calculator:
 * - buildCycleSnapshot: full integration (personal day/month/year + universal year,
 *   pinnacles, challenges, karmic lessons, maturity)
 * - Personal Day energy, keywords, and master-number detection
 * - Edge case: empty fullName still produces a valid snapshot
 */
import { describe, it, expect } from 'vitest';
import {
  buildCycleSnapshot,
  type PersonalCycleSnapshot,
  type PersonalDay,
} from './personal-cycle-engine';

const BIRTH = new Date('1990-05-15T00:00:00Z');
const NOW = new Date('2026-06-15T12:00:00Z');

// ─── buildCycleSnapshot — full integration ───────────────────────────────

describe('buildCycleSnapshot — integração completa', () => {
  it('retorna snapshot com todas as seções obrigatórias', () => {
    const snapshot: PersonalCycleSnapshot = buildCycleSnapshot(
      BIRTH,
      11, // lifePath
      5, // expression
      'Maria Silva',
      NOW
    );

    // Meta
    expect(snapshot.birthDate).toBe('1990-05-15');
    expect(snapshot.currentDate).toBe('2026-06-15');
    expect(snapshot.lifePath).toBe(11);
    expect(typeof snapshot.age).toBe('number');
    expect(snapshot.age).toBeGreaterThanOrEqual(35);
    expect(snapshot.age).toBeLessThan(50);

    // Ciclos pessoais
    expect(snapshot.personalDay).toBeDefined();
    expect(snapshot.personalMonth).toBeDefined();
    expect(snapshot.personalYear).toBeDefined();
    expect(snapshot.universalYear).toBeDefined();
    expect(snapshot.universalYear.year).toBe(2026);

    // Estrutura da vida
    expect(snapshot.pinnacles).toHaveLength(4);
    expect(snapshot.currentPinnacle).toBeDefined();
    expect(snapshot.challenges).toHaveLength(4);
    expect(Array.isArray(snapshot.karmicLessons)).toBe(true);
    expect(snapshot.maturity).toBeDefined();
    expect(typeof snapshot.maturity.number).toBe('number');

    // Synthesis
    expect(snapshot.synthesis).toBeTruthy();
    expect(snapshot.synthesis).toContain('HOJE');
    expect(snapshot.overallEnergy).toBeGreaterThanOrEqual(50);
    expect(snapshot.overallEnergy).toBeLessThanOrEqual(100);
  });

  it('personalDay contém energy, keywords, masterNumber e combined', () => {
    const snapshot = buildCycleSnapshot(BIRTH, 11, 5, 'Maria Silva', NOW);
    const pd: PersonalDay = snapshot.personalDay;

    expect(pd.number).toBeGreaterThanOrEqual(1);
    expect(pd.number).toBeLessThanOrEqual(33);
    expect(pd.universalDay).toBeGreaterThanOrEqual(1);
    expect(pd.combined).toBeGreaterThanOrEqual(1);

    expect([
      'leadership',
      'diplomacy',
      'creativity',
      'foundation',
      'change',
      'nurturing',
      'introspection',
      'power',
      'completion',
      'spiritual',
    ]).toContain(pd.energy);

    expect(Array.isArray(pd.keywords)).toBe(true);
    expect(pd.keywords.length).toBeGreaterThan(0);
    expect(pd.chakra).toBeTruthy();
    expect(pd.color).toBeTruthy();
    expect(pd.affirmation).toBeTruthy();
    expect(pd.action).toBeTruthy();
    expect(pd.avoid).toBeTruthy();
    expect(pd.favorable).toBeTruthy();
  });

  it('4 pináculos cobrem toda a vida (0→+∞)', () => {
    const snapshot = buildCycleSnapshot(BIRTH, 11, 5, 'Maria Silva', NOW);
    const [p1, p2, p3, p4] = snapshot.pinnacles;

    expect(p1.startAge).toBe(0);
    expect(p1.endAge).not.toBeNull();
    expect(p2.startAge).toBe(p1.endAge);
    expect(p2.endAge).toBe(p1.endAge! + 9);
    expect(p3.startAge).toBe(p2.endAge);
    expect(p3.endAge).toBe(p2.endAge! + 9);
    expect(p4.startAge).toBe(p3.endAge);
    expect(p4.endAge).toBeNull();
  });
});

// ─── Master numbers ──────────────────────────────────────────────────────

describe('buildCycleSnapshot — master numbers', () => {
  it('masterNumber flag coerente com o número do personalDay', () => {
    const snapshot = buildCycleSnapshot(BIRTH, 11, 5, 'Maria Silva', NOW);
    const pd = snapshot.personalDay;

    if ([11, 22, 33].includes(pd.number)) {
      expect(pd.masterNumber).toBe(true);
    } else {
      expect(pd.masterNumber).toBe(false);
    }
  });

  it('maturity.number = reduce(lifePath + expression)', () => {
    const snapshot = buildCycleSnapshot(BIRTH, 11, 5, 'Maria Silva', NOW);
    // 11 + 5 = 16 → 1+6 = 7
    expect(snapshot.maturity.number).toBe(7);
    expect(snapshot.maturity.year).toBeGreaterThanOrEqual(35);
  });
});

// ─── Edge case: empty fullName ───────────────────────────────────────────

describe('buildCycleSnapshot — edge cases', () => {
  it('fullName vazio não quebra o snapshot e ainda retorna karmicLessons', () => {
    const snapshot = buildCycleSnapshot(BIRTH, 7, 3, '', NOW);

    // Sem nome, todos os dígitos 1-9 viram potencialmente karmic lessons
    expect(Array.isArray(snapshot.karmicLessons)).toBe(true);

    // Snapshot completo mesmo sem nome
    expect(snapshot.personalDay).toBeDefined();
    expect(snapshot.pinnacles).toHaveLength(4);
    expect(snapshot.challenges).toHaveLength(4);
    expect(snapshot.synthesis).toBeTruthy();

    // Karmic lessons devem ter estrutura válida
    for (const lesson of snapshot.karmicLessons) {
      expect(lesson.missing).toBeGreaterThanOrEqual(1);
      expect(lesson.missing).toBeLessThanOrEqual(9);
      expect(lesson.description).toBeTruthy();
      expect(lesson.howToLearn).toBeTruthy();
      expect(lesson.lifeArea).toBeTruthy();
    }
  });

  it('challenges sempre produz 4 desafios com estrutura válida', () => {
    const snapshot = buildCycleSnapshot(BIRTH, 5, 3, 'Joao', NOW);
    expect(snapshot.challenges).toHaveLength(4);

    const levels = snapshot.challenges.map((c) => c.level);
    expect(levels).toEqual([1, 2, 3, 4]);

    for (const challenge of snapshot.challenges) {
      expect(challenge.name).toBeTruthy();
      expect(challenge.number).toBeGreaterThanOrEqual(0);
      expect(challenge.number).toBeLessThanOrEqual(9);
      expect(challenge.description).toBeTruthy();
    }
  });

  it('currentDate default = hoje (snapshot funciona sem NOW explícito)', () => {
    // Sem currentDate, deve usar new Date() — pelo menos não deve lançar
    expect(() => buildCycleSnapshot(BIRTH, 7, 3, 'Joao')).not.toThrow();
  });
});
