// W73-B: Prompt Rotation Engine — self-running spec harness
// 28 assertions covering determinism, weekly/monthly coverage, lunar phase, sacred content.

import {
  getDailyPrompt,
  getWeeklyPromptSet,
  getMonthlyPromptCalendar,
  getPromptByTradition,
  getAvailableTraditions,
  getAvailableArchetypes,
  determineIntensity,
  lunarPhase,
  auditPromptRotation,
  auditLunarPhase,
  TRADITIONS,
  ARCHETYPES,
} from './prompt-rotation.ts';
import type { UserContext, Tradition, Archetype } from './prompt-rotation.ts';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(cond: boolean, msg: string): void {
  if (cond) {
    passed += 1;
  } else {
    failed += 1;
    failures.push(msg);
  }
}

const alice: UserContext = { userId: 'alice', timezone: 'America/Sao_Paulo', locale: 'pt-BR' };
const bob: UserContext = { userId: 'bob', timezone: 'America/New_York', locale: 'en-US' };
const carol: UserContext = { userId: 'carol', timezone: 'Europe/Lisbon', locale: 'pt-BR' };

// ── Determinism (5) ──────────────────────────────────────────
const p1a = getDailyPrompt(alice, new Date('2026-06-30T12:00:00Z'));
const p1b = getDailyPrompt(alice, new Date('2026-06-30T12:00:00Z'));
assert(p1a.id === p1b.id, 'deterministic for same user+date (id match)');
assert(p1a.tradition === p1b.tradition, 'deterministic tradition');
assert(p1a.body === p1b.body, 'deterministic body');

const p2 = getDailyPrompt(bob, new Date('2026-06-30T12:00:00Z'));
assert((p2.tradition as string) !== '', 'different user gets valid tradition');

const p3 = getDailyPrompt(alice, new Date('2026-07-01T12:00:00Z'));
assert(p3.id !== p1a.id, 'different date → different prompt for same user');

// ── Weekly set (4) ───────────────────────────────────────────
const week = getWeeklyPromptSet(alice, new Date('2026-06-29T12:00:00Z'));
assert(week.length === 7, 'weekly set has 7 entries');
const traditionsInWeek = new Set(week.map((w) => w.tradition));
assert(traditionsInWeek.size === 7, 'weekly set covers all 7 traditions');
const daysHave7 = week.every((w) => typeof w.body === 'string' && w.body.length > 0);
assert(daysHave7, 'all 7 weekly prompts have non-empty body');
const noDupesWeek = new Set(week.map((w) => w.id)).size === week.length;
assert(noDupesWeek, 'no duplicate prompts in weekly set');

// ── Monthly calendar (3) ─────────────────────────────────────
const jan = getMonthlyPromptCalendar(alice, new Date('2025-01-01T12:00:00Z'));
assert(Object.keys(jan).length === 31, 'Jan 2025 has 31 entries');
const feb2024 = getMonthlyPromptCalendar(alice, new Date('2024-02-01T12:00:00Z'));
assert(Object.keys(feb2024).length === 29, 'Feb 2024 has 29 entries (leap)');
const apr = getMonthlyPromptCalendar(alice, new Date('2025-04-01T12:00:00Z'));
assert(Object.keys(apr).length === 30, 'Apr 2025 has 30 entries');

// ── Lunar phase (4) ──────────────────────────────────────────
const full = lunarPhase(new Date('2024-12-15T00:00:00Z'));
assert(full.phase === 'full', `2024-12-15 is full moon (got ${full.phase})`);
const newMoon = lunarPhase(new Date('2024-12-30T00:00:00Z'));
assert(newMoon.phase === 'new', `2024-12-30 is new moon (got ${newMoon.phase})`);
const between = lunarPhase(new Date('2024-12-22T00:00:00Z'));
assert(between.phase === 'last-quarter', `2024-12-22 is last-quarter (got ${between.phase})`);
const edge = lunarPhase(new Date('2024-12-08T00:00:00Z'));
assert(edge.phase === 'first-quarter' || edge.phase === 'waxing-gibbous', `2024-12-08 around first quarter (got ${edge.phase})`);

// ── Intensity (2) ────────────────────────────────────────────
const intensityFull = determineIntensity(new Date('2024-12-15T00:00:00Z'));
assert(intensityFull === 'intense', `full moon → intense (got ${intensityFull})`);
const intensityRetro = determineIntensity(new Date('2026-06-29T00:00:00Z'));
assert(intensityRetro === 'intense' || intensityRetro === 'moderate', `retrograde window → moderate/intense (got ${intensityRetro})`);

// ── Tradition/archetype lookup (5) ──────────────────────────
const trads = getAvailableTraditions();
assert(trads.length === 7, '7 traditions available');
const archs = getAvailableArchetypes();
assert(archs.length === 9, '9 archetypes available');
const sampleTraditions: Tradition[] = ['cigano', 'orixas', 'cabala', 'tantra', 'tarot'];
const sampleArchetypes: Archetype[] = ['morning', 'evening', 'full-moon'];
let sampleHits = 0;
for (const t of sampleTraditions) {
  for (const a of sampleArchetypes) {
    const p = getPromptByTradition(t, a);
    if (p.tradition === t && p.body.length > 0 && p.body.length <= 280) sampleHits++;
  }
}
assert(sampleHits === sampleTraditions.length * sampleArchetypes.length, `samples all valid (${sampleHits}/${sampleTraditions.length * sampleArchetypes.length})`);

// ── Sacred content audit (3) ────────────────────────────────
const audit = auditPromptRotation();
assert(audit.length === 7, 'audit returns 7 rows');
const everyTraditionHasEnough = audit.every((row) => row.promptCount >= 7);
assert(everyTraditionHasEnough, 'every tradition has ≥7 prompts');
const archetypeSpread = audit.every((row) => row.archetypeCoverage >= 1);
assert(archetypeSpread, 'every tradition has at least 1 archetype covered');

// ── Lunar audit (2) ──────────────────────────────────────────
const lunarAudit = auditLunarPhase();
assert(lunarAudit.length === 4, 'lunar audit has 4 fixture rows');
const allLunarCorrect = lunarAudit.every((row) => row.isCorrect);
assert(allLunarCorrect, `all lunar fixtures correct (${lunarAudit.filter(r => r.isCorrect).length}/${lunarAudit.length})`);

// ── Body length cap (1) ──────────────────────────────────────
assert(p1a.body.length <= 280, `daily prompt body ≤280 chars (got ${p1a.body.length})`);

// ── Audit collection (1) ─────────────────────────────────────
const auditTraditions = new Set(audit.map((r) => r.tradition));
assert(auditTraditions.size === 7, 'audit covers all 7 unique traditions');

// ── Sacred symbol presence (1) ───────────────────────────────
assert(p1a.sacredSymbols.length >= 1 && p1a.sacredSymbols.length <= 5, 'sacredSymbols 1-5 per prompt');

// ── Body length all weekly (1) ───────────────────────────────
const allWeeklyBodiesFit = week.every((w) => w.body.length <= 280);
assert(allWeeklyBodiesFit, 'all weekly prompts ≤280 chars');

// ── Reflection question presence (1) ─────────────────────────
assert(p1a.reflectionQuestion.length > 0 && p1a.reflectionQuestion.length <= 200, 'reflectionQuestion present and ≤200 chars');

// ── Intensity on daily prompt (1) ────────────────────────────
const allowedIntensities = ['gentle', 'moderate', 'intense'];
assert(allowedIntensities.includes(p1a.intensity), `daily prompt has valid intensity (${p1a.intensity})`);

// ── Monthly calendar entries have body (1) ────────────────────
const janAllNonEmpty = Object.values(jan).every((p) => p.body.length > 0);
assert(janAllNonEmpty, 'all monthly entries have non-empty body');

// ── Three users same date (1) ────────────────────────────────
const pa = getDailyPrompt(alice, new Date('2026-06-30T12:00:00Z'));
const pb = getDailyPrompt(bob, new Date('2026-06-30T12:00:00Z'));
const pc = getDailyPrompt(carol, new Date('2026-06-30T12:00:00Z'));
const distinct = new Set([pa.tradition, pb.tradition, pc.tradition]).size;
assert(distinct >= 2, `3 users, ≥2 distinct traditions (got ${distinct})`);

// ── Summary ──────────────────────────────────────────────────
console.log(`PROMPT-ROTATION: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
