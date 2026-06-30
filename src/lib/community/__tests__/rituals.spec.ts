// ============================================================================
// RITUALS — Test suite (Wave 32, 2026-06-30)
// ============================================================================
// Cobre: 7 tipos, streak math, freeze tokens, milestones, weekly mission,
// ethics audit, LGPD opt-in.
// ============================================================================

import { describe, it, expect } from 'vitest';

import {
  RITUAL_TYPES,
  RITUAL_TYPE_META,
  STREAK_MILESTONES,
  DEFAULT_RITUAL_PROFILE,
  type RitualEntry,
  type UserRitualProfile,
  toLocalDate,
  daysBetweenLocal,
  currentMonthKey,
  recalcStreak,
  refillFreezeToken,
  grantFreezeToken,
  consumeFreezeToken,
  validateRitualEntry,
  RitualValidationError,
  computeWeeklyMission,
  summarizeStreak,
  auditRitualProfile,
} from '@/lib/community/rituals';

// ============================================================================
// Fixtures
// ============================================================================

function makeProfile(overrides: Partial<UserRitualProfile> = {}): UserRitualProfile {
  return {
    userId: 'user-1',
    optedIn: true,
    startedAt: new Date('2026-01-01T00:00:00Z'),
    timezone: 'America/Sao_Paulo',
    preferredTypes: ['MEDITATION', 'GRATITUDE'],
    freezeTokens: 0,
    freezeLastRefillMonth: null,
    currentStreak: 0,
    longestStreak: 0,
    totalRitualsCompleted: 0,
    lastRitualLocalDate: null,
    celebratedMilestones: [],
    ...overrides,
  };
}

function makeEntry(
  date: Date,
  overrides: Partial<RitualEntry> = {}
): RitualEntry {
  return {
    id: 'entry-1',
    userId: 'user-1',
    ritualType: 'MEDITATION',
    durationMin: 15,
    note: null,
    completedAt: date,
    localDate: toLocalDate(date, 'America/Sao_Paulo'),
    ...overrides,
  };
}

// ============================================================================
// 1. Constantes
// ============================================================================

describe('rituals — constants', () => {
  it('tem exatamente 7 tipos de rituais', () => {
    expect(RITUAL_TYPES).toHaveLength(7);
    expect(RITUAL_TYPES).toEqual([
      'MEDITATION',
      'READING',
      'REFLECTION',
      'GRATITUDE',
      'INTENTION',
      'PARTAGE',
      'SILENCE',
    ]);
  });

  it('cada tipo tem meta com label, emoji e duração', () => {
    for (const type of RITUAL_TYPES) {
      const meta = RITUAL_TYPE_META[type];
      expect(meta.id).toBe(type);
      expect(meta.labelPt.length).toBeGreaterThan(2);
      expect(meta.labelEn.length).toBeGreaterThan(2);
      expect(meta.emoji).toMatch(/\p{Emoji}/u);
      expect(meta.durationMin).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(10);
    }
  });

  it('milestones ordenados crescentemente', () => {
    for (let i = 1; i < STREAK_MILESTONES.length; i++) {
      expect(STREAK_MILESTONES[i].days).toBeGreaterThan(
        STREAK_MILESTONES[i - 1].days
      );
    }
  });

  it('milestones cobrem 1, 7, 30, 90, 180, 365', () => {
    const days = STREAK_MILESTONES.map((m) => m.days);
    expect(days).toEqual([1, 7, 30, 90, 180, 365]);
  });

  it('default profile tem optedIn=false (LGPD safe)', () => {
    expect(DEFAULT_RITUAL_PROFILE.optedIn).toBe(false);
  });
});

// ============================================================================
// 2. Helpers de tempo
// ============================================================================

describe('rituals — time helpers', () => {
  it('toLocalDate retorna YYYY-MM-DD', () => {
    const d = new Date('2026-06-30T03:00:00Z'); // meia-noite SP
    expect(toLocalDate(d, 'America/Sao_Paulo')).toBe('2026-06-30');
  });

  it('daysBetweenLocal: 1 dia', () => {
    expect(daysBetweenLocal('2026-06-29', '2026-06-30')).toBe(1);
  });

  it('daysBetweenLocal: 7 dias', () => {
    expect(daysBetweenLocal('2026-06-23', '2026-06-30')).toBe(7);
  });

  it('daysBetweenLocal: 0 dias', () => {
    expect(daysBetweenLocal('2026-06-30', '2026-06-30')).toBe(0);
  });

  it('currentMonthKey retorna YYYY-MM', () => {
    const d = new Date('2026-06-30T12:00:00Z');
    expect(currentMonthKey(d, 'America/Sao_Paulo')).toMatch(/^\d{4}-\d{2}$/);
  });
});

// ============================================================================
// 3. Streak math
// ============================================================================

describe('rituals — recalcStreak', () => {
  it('primeiro ritual: streak = 1', () => {
    const profile = makeProfile();
    const today = new Date('2026-06-30T12:00:00Z');
    const result = recalcStreak({
      profile,
      todayEntries: [makeEntry(today)],
      todayLocal: '2026-06-30',
      yesterdayLocal: '2026-06-29',
    });
    expect(result.newCurrentStreak).toBe(1);
    expect(result.newLongestStreak).toBe(1);
    expect(result.newMilestoneHit).toEqual({ days: 1, badge: '🌱' });
    expect(result.freezeConsumed).toBe(false);
  });

  it('segundo dia consecutivo: streak += 1', () => {
    const profile = makeProfile({
      currentStreak: 5,
      longestStreak: 5,
      lastRitualLocalDate: '2026-06-29',
    });
    const today = new Date('2026-06-30T12:00:00Z');
    const result = recalcStreak({
      profile,
      todayEntries: [makeEntry(today)],
      todayLocal: '2026-06-30',
      yesterdayLocal: '2026-06-29',
    });
    expect(result.newCurrentStreak).toBe(6);
    expect(result.newLongestStreak).toBe(6);
    expect(result.freezeConsumed).toBe(false);
  });

  it('gap > 1 sem freeze: reset para 1', () => {
    const profile = makeProfile({
      currentStreak: 30,
      longestStreak: 30,
      lastRitualLocalDate: '2026-06-20',
      freezeTokens: 0,
    });
    const today = new Date('2026-06-30T12:00:00Z');
    const result = recalcStreak({
      profile,
      todayEntries: [makeEntry(today)],
      todayLocal: '2026-06-30',
      yesterdayLocal: '2026-06-29',
    });
    expect(result.newCurrentStreak).toBe(1);
    expect(result.newLongestStreak).toBe(30); // preserva record
    expect(result.freezeConsumed).toBe(false);
  });

  it('gap > 1 COM freeze: consome token, streak += 1', () => {
    const profile = makeProfile({
      currentStreak: 10,
      longestStreak: 10,
      lastRitualLocalDate: '2026-06-27',
      freezeTokens: 1,
    });
    const today = new Date('2026-06-30T12:00:00Z');
    const result = recalcStreak({
      profile,
      todayEntries: [makeEntry(today)],
      todayLocal: '2026-06-30',
      yesterdayLocal: '2026-06-29',
    });
    expect(result.newCurrentStreak).toBe(11);
    expect(result.freezeConsumed).toBe(true);
  });

  it('já tem entrada hoje: idempotente, sem mudança', () => {
    const profile = makeProfile({
      currentStreak: 5,
      lastRitualLocalDate: '2026-06-30',
    });
    const today = new Date('2026-06-30T12:00:00Z');
    const result = recalcStreak({
      profile,
      todayEntries: [makeEntry(today)],
      todayLocal: '2026-06-30',
      yesterdayLocal: '2026-06-29',
    });
    expect(result.newCurrentStreak).toBe(5);
    expect(result.freezeConsumed).toBe(false);
  });

  it('LGPD: opt-in false não computa streak', () => {
    const profile = makeProfile({ optedIn: false });
    const today = new Date('2026-06-30T12:00:00Z');
    const result = recalcStreak({
      profile,
      todayEntries: [makeEntry(today)],
      todayLocal: '2026-06-30',
      yesterdayLocal: '2026-06-29',
    });
    expect(result.newCurrentStreak).toBe(0);
  });

  it('sem entries hoje: mantém estado', () => {
    const profile = makeProfile({ currentStreak: 5 });
    const result = recalcStreak({
      profile,
      todayEntries: [],
      todayLocal: '2026-06-30',
      yesterdayLocal: '2026-06-29',
    });
    expect(result.newCurrentStreak).toBe(5);
    expect(result.newMilestoneHit).toBeNull();
  });

  it('atinge milestone 7 dias', () => {
    const profile = makeProfile({
      currentStreak: 6,
      longestStreak: 6,
      lastRitualLocalDate: '2026-06-29',
    });
    const today = new Date('2026-06-30T12:00:00Z');
    const result = recalcStreak({
      profile,
      todayEntries: [makeEntry(today)],
      todayLocal: '2026-06-30',
      yesterdayLocal: '2026-06-29',
    });
    expect(result.newCurrentStreak).toBe(7);
    expect(result.newMilestoneHit).toEqual({ days: 7, badge: '🌿' });
  });

  it('não re-celebra milestone já atingido', () => {
    const profile = makeProfile({
      currentStreak: 6,
      longestStreak: 7,
      lastRitualLocalDate: '2026-06-29',
      celebratedMilestones: ['🌱', '🌿'],
    });
    const today = new Date('2026-06-30T12:00:00Z');
    const result = recalcStreak({
      profile,
      todayEntries: [makeEntry(today)],
      todayLocal: '2026-06-30',
      yesterdayLocal: '2026-06-29',
    });
    expect(result.newCurrentStreak).toBe(7);
    expect(result.newMilestoneHit).toBeNull();
  });
});

// ============================================================================
// 4. Freeze tokens
// ============================================================================

describe('rituals — freeze tokens', () => {
  it('refillFreezeToken: primeiro refill do mês', () => {
    const profile = makeProfile({ freezeTokens: 0 });
    const result = refillFreezeToken(profile, new Date('2026-06-30T12:00:00Z'));
    expect(result.shouldRefill).toBe(true);
    expect(result.newTokens).toBe(1);
  });

  it('refillFreezeToken: idempotente mesmo mês', () => {
    const profile = makeProfile({
      freezeTokens: 2,
      freezeLastRefillMonth: '2026-06',
    });
    const result = refillFreezeToken(profile, new Date('2026-06-30T12:00:00Z'));
    expect(result.shouldRefill).toBe(false);
    expect(result.newTokens).toBe(2);
  });

  it('refillFreezeToken: novo mês refilla', () => {
    const profile = makeProfile({
      freezeTokens: 0,
      freezeLastRefillMonth: '2026-05',
    });
    const result = refillFreezeToken(profile, new Date('2026-06-01T12:00:00Z'));
    expect(result.shouldRefill).toBe(true);
    expect(result.newTokens).toBe(1);
  });

  it('refillFreezeToken: cap em 3 tokens', () => {
    const profile = makeProfile({
      freezeTokens: 3,
      freezeLastRefillMonth: '2026-05',
    });
    const result = refillFreezeToken(profile, new Date('2026-06-15T12:00:00Z'));
    expect(result.shouldRefill).toBe(true);
    expect(result.newTokens).toBe(3); // não acumula além do cap
  });

  it('grantFreezeToken: adiciona até cap', () => {
    expect(grantFreezeToken(makeProfile({ freezeTokens: 0 }))).toBe(1);
    expect(grantFreezeToken(makeProfile({ freezeTokens: 2 }))).toBe(3);
    expect(grantFreezeToken(makeProfile({ freezeTokens: 3 }))).toBe(3);
  });

  it('consumeFreezeToken: sucesso', () => {
    const result = consumeFreezeToken(makeProfile({ freezeTokens: 2 }));
    expect(result.ok).toBe(true);
    expect(result.newTokens).toBe(1);
  });

  it('consumeFreezeToken: falha sem tokens', () => {
    const result = consumeFreezeToken(makeProfile({ freezeTokens: 0 }));
    expect(result.ok).toBe(false);
    expect(result.newTokens).toBe(0);
  });
});

// ============================================================================
// 5. Validação de entrada
// ============================================================================

describe('rituals — validateRitualEntry', () => {
  it('aceita entrada válida', () => {
    expect(() =>
      validateRitualEntry({
        ritualType: 'MEDITATION',
        durationMin: 15,
        note: null,
      })
    ).not.toThrow();
  });

  it('rejeita tipo inválido', () => {
    expect(() =>
      validateRitualEntry({
        ritualType: 'INVALID',
        durationMin: 15,
        note: null,
      })
    ).toThrow(RitualValidationError);
  });

  it('rejeita duração < 1', () => {
    expect(() =>
      validateRitualEntry({
        ritualType: 'MEDITATION',
        durationMin: 0,
        note: null,
      })
    ).toThrow(/entre 1 e 480/);
  });

  it('rejeita duração > 480', () => {
    expect(() =>
      validateRitualEntry({
        ritualType: 'MEDITATION',
        durationMin: 600,
        note: null,
      })
    ).toThrow(/entre 1 e 480/);
  });

  it('rejeita nota > 1000 chars', () => {
    expect(() =>
      validateRitualEntry({
        ritualType: 'MEDITATION',
        durationMin: 15,
        note: 'x'.repeat(1001),
      })
    ).toThrow(/1000/);
  });

  it('aceita nota null', () => {
    expect(() =>
      validateRitualEntry({
        ritualType: 'GRATITUDE',
        durationMin: 5,
        note: null,
      })
    ).not.toThrow();
  });
});

// ============================================================================
// 6. Missão semanal
// ============================================================================

describe('rituals — computeWeeklyMission', () => {
  it('zero rituais: 0%', () => {
    const result = computeWeeklyMission([], '2026-06-23', '2026-06-29');
    expect(result.ritualsThisWeek).toBe(0);
    expect(result.targetMet).toBe(false);
    expect(result.percent).toBe(0);
  });

  it('3 rituais: 60%', () => {
    const entries = [
      makeEntry(new Date('2026-06-24T12:00:00Z')),
      makeEntry(new Date('2026-06-25T12:00:00Z')),
      makeEntry(new Date('2026-06-27T12:00:00Z')),
    ];
    const result = computeWeeklyMission(entries, '2026-06-23', '2026-06-29');
    expect(result.ritualsThisWeek).toBe(3);
    expect(result.percent).toBe(60);
    expect(result.targetMet).toBe(false);
  });

  it('5 rituais: 100%, target met', () => {
    const entries = [
      makeEntry(new Date('2026-06-24T12:00:00Z')),
      makeEntry(new Date('2026-06-25T12:00:00Z')),
      makeEntry(new Date('2026-06-26T12:00:00Z')),
      makeEntry(new Date('2026-06-27T12:00:00Z')),
      makeEntry(new Date('2026-06-28T12:00:00Z')),
    ];
    const result = computeWeeklyMission(entries, '2026-06-23', '2026-06-29');
    expect(result.ritualsThisWeek).toBe(5);
    expect(result.percent).toBe(100);
    expect(result.targetMet).toBe(true);
  });

  it('7 rituais: ainda 100% (cap)', () => {
    const entries = Array.from({ length: 7 }, (_, i) =>
      makeEntry(new Date(`2026-06-${23 + i}T12:00:00Z`))
    );
    const result = computeWeeklyMission(entries, '2026-06-23', '2026-06-29');
    expect(result.percent).toBe(100);
  });

  it('ignora rituais fora do range', () => {
    const entries = [
      makeEntry(new Date('2026-06-22T12:00:00Z')), // antes
      makeEntry(new Date('2026-06-30T12:00:00Z')), // depois
      makeEntry(new Date('2026-06-25T12:00:00Z')), // dentro
    ];
    const result = computeWeeklyMission(entries, '2026-06-23', '2026-06-29');
    expect(result.ritualsThisWeek).toBe(1);
  });
});

// ============================================================================
// 7. Resumo de streak
// ============================================================================

describe('rituals — summarizeStreak', () => {
  it('sem streak: nextMilestone é 1 dia', () => {
    const summary = summarizeStreak(makeProfile());
    expect(summary.current).toBe(0);
    expect(summary.nextMilestone).toEqual({
      days: 1,
      badge: '🌱',
      daysRemaining: 1,
    });
  });

  it('streak 5: próximo é 7', () => {
    const summary = summarizeStreak(makeProfile({ currentStreak: 5 }));
    expect(summary.nextMilestone?.days).toBe(7);
    expect(summary.nextMilestone?.daysRemaining).toBe(2);
  });

  it('streak 365: sem próximo milestone', () => {
    const summary = summarizeStreak(makeProfile({ currentStreak: 365 }));
    expect(summary.nextMilestone).toBeNull();
  });

  it('inclui freeze tokens e celebrated', () => {
    const summary = summarizeStreak(
      makeProfile({ freezeTokens: 2, celebratedMilestones: ['🌱'] })
    );
    expect(summary.freezeTokens).toBe(2);
    expect(summary.celebratedBadges).toContain('🌱');
  });
});

// ============================================================================
// 8. Ethics audit
// ============================================================================

describe('rituals — auditRitualProfile', () => {
  it('profile OK: sem flags', () => {
    const profile = makeProfile({
      currentStreak: 5,
      longestStreak: 10,
      totalRitualsCompleted: 25,
      celebratedMilestones: ['🌱'],
    });
    expect(auditRitualProfile(profile)).toHaveLength(0);
  });

  it('streak > total: BLOCK', () => {
    const flags = auditRitualProfile(
      makeProfile({ currentStreak: 10, totalRitualsCompleted: 3 })
    );
    expect(flags.some((f) => f.code === 'STREAK_EXCEEDS_TOTAL')).toBe(true);
    expect(flags.find((f) => f.code === 'STREAK_EXCEEDS_TOTAL')?.severity).toBe(
      'BLOCK'
    );
  });

  it('streak implausível: WARN', () => {
    const flags = auditRitualProfile(
      makeProfile({
        currentStreak: 400,
        totalRitualsCompleted: 50,
        longestStreak: 400,
      })
    );
    expect(flags.some((f) => f.code === 'IMPLAUSIBLE_LONG_STREAK')).toBe(true);
  });

  it('badge sem streak: BLOCK', () => {
    const flags = auditRitualProfile(
      makeProfile({
        longestStreak: 5,
        celebratedMilestones: ['🌳'], // 30 dias badge, mas longest < 30
      })
    );
    expect(flags.some((f) => f.code === 'UNJUSTIFIED_BADGE')).toBe(true);
  });

  it('opt-out com streak > 0: INFO', () => {
    const flags = auditRitualProfile(
      makeProfile({ optedIn: false, currentStreak: 10 })
    );
    expect(flags.some((f) => f.code === 'OPTOUT_WITH_STREAK')).toBe(true);
    expect(flags.find((f) => f.code === 'OPTOUT_WITH_STREAK')?.severity).toBe(
      'INFO'
    );
  });
});