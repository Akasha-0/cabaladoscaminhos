#!/usr/bin/env node
/**
 * Smoke tests for rituals engine — node:test (Vitest has Bus error in sandbox).
 * Run: node --experimental-strip-types scripts/smoke-rituals.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RITUAL_TYPES,
  RITUAL_TYPE_META,
  STREAK_MILESTONES,
  DEFAULT_RITUAL_PROFILE,
  toLocalDate,
  daysBetweenLocal,
  recalcStreak,
  refillFreezeToken,
  grantFreezeToken,
  consumeFreezeToken,
  validateRitualEntry,
  RitualValidationError,
  computeWeeklyMission,
  summarizeStreak,
  auditRitualProfile,
} from '../src/lib/community/rituals.ts';

let passed = 0;
let failed = 0;

function run(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`✗ ${name}`);
    console.error(`  ${e.message}`);
  }
}

const makeProfile = (over = {}) => ({
  userId: 'user-1',
  optedIn: true,
  startedAt: new Date('2026-01-01T00:00:00Z'),
  timezone: 'America/Sao_Paulo',
  preferredTypes: ['MEDITATION'],
  freezeTokens: 0,
  freezeLastRefillMonth: null,
  currentStreak: 0,
  longestStreak: 0,
  totalRitualsCompleted: 0,
  lastRitualLocalDate: null,
  celebratedMilestones: [],
  ...over,
});

const makeEntry = (date, over = {}) => ({
  id: 'e1',
  userId: 'user-1',
  ritualType: 'MEDITATION',
  durationMin: 15,
  note: null,
  completedAt: date,
  localDate: toLocalDate(date, 'America/Sao_Paulo'),
  ...over,
});

// Constants
run('RITUAL_TYPES tem 7 tipos', () => {
  assert.equal(RITUAL_TYPES.length, 7);
});

run('Milestones cobrem [1,7,30,90,180,365]', () => {
  assert.deepEqual(STREAK_MILESTONES.map((m) => m.days), [1, 7, 30, 90, 180, 365]);
});

run('Default profile optedIn=false', () => {
  assert.equal(DEFAULT_RITUAL_PROFILE.optedIn, false);
});

// Time helpers
run('toLocalDate retorna YYYY-MM-DD', () => {
  const d = new Date('2026-06-30T03:00:00Z');
  assert.equal(toLocalDate(d, 'America/Sao_Paulo'), '2026-06-30');
});

run('daysBetweenLocal: 1 dia', () => {
  assert.equal(daysBetweenLocal('2026-06-29', '2026-06-30'), 1);
});

// Streak math
run('primeiro ritual: streak = 1', () => {
  const profile = makeProfile();
  const today = new Date('2026-06-30T12:00:00Z');
  const r = recalcStreak({
    profile,
    todayEntries: [makeEntry(today)],
    todayLocal: '2026-06-30',
    yesterdayLocal: '2026-06-29',
  });
  assert.equal(r.newCurrentStreak, 1);
  assert.equal(r.newMilestoneHit?.badge, '🌱');
});

run('segundo dia consecutivo: streak += 1', () => {
  const profile = makeProfile({
    currentStreak: 5,
    longestStreak: 5,
    lastRitualLocalDate: '2026-06-29',
  });
  const today = new Date('2026-06-30T12:00:00Z');
  const r = recalcStreak({
    profile,
    todayEntries: [makeEntry(today)],
    todayLocal: '2026-06-30',
    yesterdayLocal: '2026-06-29',
  });
  assert.equal(r.newCurrentStreak, 6);
});

run('gap > 1 sem freeze: reset', () => {
  const profile = makeProfile({
    currentStreak: 30,
    longestStreak: 30,
    lastRitualLocalDate: '2026-06-20',
    freezeTokens: 0,
  });
  const today = new Date('2026-06-30T12:00:00Z');
  const r = recalcStreak({
    profile,
    todayEntries: [makeEntry(today)],
    todayLocal: '2026-06-30',
    yesterdayLocal: '2026-06-29',
  });
  assert.equal(r.newCurrentStreak, 1);
  assert.equal(r.newLongestStreak, 30);
});

run('gap > 1 COM freeze: consome', () => {
  const profile = makeProfile({
    currentStreak: 10,
    longestStreak: 10,
    lastRitualLocalDate: '2026-06-27',
    freezeTokens: 1,
  });
  const today = new Date('2026-06-30T12:00:00Z');
  const r = recalcStreak({
    profile,
    todayEntries: [makeEntry(today)],
    todayLocal: '2026-06-30',
    yesterdayLocal: '2026-06-29',
  });
  assert.equal(r.newCurrentStreak, 11);
  assert.equal(r.freezeConsumed, true);
});

run('idempotente se já tem entrada hoje', () => {
  const profile = makeProfile({
    currentStreak: 5,
    lastRitualLocalDate: '2026-06-30',
  });
  const today = new Date('2026-06-30T12:00:00Z');
  const r = recalcStreak({
    profile,
    todayEntries: [makeEntry(today)],
    todayLocal: '2026-06-30',
    yesterdayLocal: '2026-06-29',
  });
  assert.equal(r.newCurrentStreak, 5);
});

run('LGPD opt-out: streak = 0', () => {
  const profile = makeProfile({ optedIn: false });
  const today = new Date('2026-06-30T12:00:00Z');
  const r = recalcStreak({
    profile,
    todayEntries: [makeEntry(today)],
    todayLocal: '2026-06-30',
    yesterdayLocal: '2026-06-29',
  });
  assert.equal(r.newCurrentStreak, 0);
});

run('atinge milestone 7', () => {
  const profile = makeProfile({
    currentStreak: 6,
    longestStreak: 6,
    lastRitualLocalDate: '2026-06-29',
  });
  const today = new Date('2026-06-30T12:00:00Z');
  const r = recalcStreak({
    profile,
    todayEntries: [makeEntry(today)],
    todayLocal: '2026-06-30',
    yesterdayLocal: '2026-06-29',
  });
  assert.equal(r.newCurrentStreak, 7);
  assert.equal(r.newMilestoneHit?.days, 7);
});

run('não re-celebra milestone já atingido', () => {
  const profile = makeProfile({
    currentStreak: 6,
    longestStreak: 7,
    lastRitualLocalDate: '2026-06-29',
    celebratedMilestones: ['🌱', '🌿'],
  });
  const today = new Date('2026-06-30T12:00:00Z');
  const r = recalcStreak({
    profile,
    todayEntries: [makeEntry(today)],
    todayLocal: '2026-06-30',
    yesterdayLocal: '2026-06-29',
  });
  assert.equal(r.newMilestoneHit, null);
});

// Freeze
run('refill primeiro do mês', () => {
  const profile = makeProfile({ freezeTokens: 0 });
  const r = refillFreezeToken(profile, new Date('2026-06-30T12:00:00Z'));
  assert.equal(r.shouldRefill, true);
  assert.equal(r.newTokens, 1);
});

run('refill idempotente mesmo mês', () => {
  const profile = makeProfile({
    freezeTokens: 2,
    freezeLastRefillMonth: '2026-06',
  });
  const r = refillFreezeToken(profile, new Date('2026-06-30T12:00:00Z'));
  assert.equal(r.shouldRefill, false);
});

run('grantFreezeToken cap 3', () => {
  assert.equal(grantFreezeToken(makeProfile({ freezeTokens: 3 })), 3);
  assert.equal(grantFreezeToken(makeProfile({ freezeTokens: 0 })), 1);
});

run('consumeFreezeToken sucesso', () => {
  const r = consumeFreezeToken(makeProfile({ freezeTokens: 2 }));
  assert.equal(r.ok, true);
  assert.equal(r.newTokens, 1);
});

run('consumeFreezeToken falha sem tokens', () => {
  const r = consumeFreezeToken(makeProfile({ freezeTokens: 0 }));
  assert.equal(r.ok, false);
});

// Validation
run('validate aceita entrada válida', () => {
  validateRitualEntry({ ritualType: 'MEDITATION', durationMin: 15, note: null });
});

run('validate rejeita tipo inválido', () => {
  try {
    validateRitualEntry({ ritualType: 'NOPE', durationMin: 15, note: null });
    throw new Error('should have thrown');
  } catch (e) {
    assert.ok(e instanceof RitualValidationError);
  }
});

run('validate rejeita duração 0', () => {
  try {
    validateRitualEntry({ ritualType: 'MEDITATION', durationMin: 0, note: null });
    throw new Error('should have thrown');
  } catch (e) {
    assert.ok(e instanceof RitualValidationError);
  }
});

// Weekly mission
run('computeWeeklyMission: 5 rituais = 100%', () => {
  const entries = [
    makeEntry(new Date('2026-06-24T12:00:00Z')),
    makeEntry(new Date('2026-06-25T12:00:00Z')),
    makeEntry(new Date('2026-06-26T12:00:00Z')),
    makeEntry(new Date('2026-06-27T12:00:00Z')),
    makeEntry(new Date('2026-06-28T12:00:00Z')),
  ];
  const r = computeWeeklyMission(entries, '2026-06-23', '2026-06-29');
  assert.equal(r.targetMet, true);
  assert.equal(r.percent, 100);
});

// Summary
run('summarizeStreak: streak 5 → next 7', () => {
  const s = summarizeStreak(makeProfile({ currentStreak: 5 }));
  assert.equal(s.nextMilestone?.days, 7);
});

run('summarizeStreak: 365 sem próximo', () => {
  const s = summarizeStreak(makeProfile({ currentStreak: 365 }));
  assert.equal(s.nextMilestone, null);
});

// Ethics
run('audit OK sem flags', () => {
  const flags = auditRitualProfile(
    makeProfile({
      currentStreak: 5,
      longestStreak: 10,
      totalRitualsCompleted: 25,
      celebratedMilestones: ['🌱'],
    })
  );
  assert.equal(flags.length, 0);
});

run('audit: streak > total = BLOCK', () => {
  const flags = auditRitualProfile(
    makeProfile({ currentStreak: 10, totalRitualsCompleted: 3 })
  );
  assert.ok(flags.some((f) => f.code === 'STREAK_EXCEEDS_TOTAL'));
});

run('audit: badge sem streak = BLOCK', () => {
  const flags = auditRitualProfile(
    makeProfile({
      longestStreak: 5,
      celebratedMilestones: ['🌳'],
    })
  );
  assert.ok(flags.some((f) => f.code === 'UNJUSTIFIED_BADGE'));
});

console.log(`\n${passed}/${passed + failed} testes passaram`);
if (failed > 0) process.exit(1);