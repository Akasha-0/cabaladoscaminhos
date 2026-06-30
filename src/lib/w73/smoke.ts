// W73-B: smoke harness — 7 sections, 30+ assertions
import {
  getDailyPrompt,
  getWeeklyPromptSet,
  getMonthlyPromptCalendar,
  getPromptByTradition,
  lunarPhase,
  determineIntensity,
  auditPromptRotation,
  auditLunarPhase,
  TRADITIONS,
} from './prompt-rotation.ts';
import {
  createReflection,
  updateReflection,
  shareReflectionToCircle,
  getCurrentStreak,
  setHmacSecret,
  _resetForTest,
  _addCircleMemberForTest,
  asUserId,
  asPromptId,
  asCircleId,
  auditReflectionRules,
} from './reflection-log.ts';
import type { UserContext, Tradition } from './prompt-rotation.ts';
import type { Mood, Result } from './reflection-log.ts';

let passed = 0;
let failed = 0;
const fails: string[] = [];
function ok(cond: boolean, msg: string): void {
  if (cond) passed++;
  else { failed++; fails.push(msg); }
}
function unwrap<T>(r: Result<T, any>): T {
  if (!r.ok) throw new Error('unwrap: ' + JSON.stringify(r));
  return r.value as T;
}

setHmacSecret('smoke-hmac-secret-007');
_resetForTest();

const alice: UserContext = { userId: 'alice-smoke', timezone: 'America/Sao_Paulo', locale: 'pt-BR' };
const bob: UserContext = { userId: 'bob-smoke', timezone: 'America/New_York', locale: 'en-US' };

// ══════════════════════════════════════════════════════════════
// 1. PROMPT_DETERMINISM (5)
// ══════════════════════════════════════════════════════════════
{
  const a1 = getDailyPrompt(alice, new Date('2026-06-15T08:00:00Z'));
  const a2 = getDailyPrompt(alice, new Date('2026-06-15T08:00:00Z'));
  ok(a1.id === a2.id, 'SMOKE/PROMPT_DETERMINISM same id');
  ok(a1.tradition === a2.tradition, 'SMOKE/PROMPT_DETERMINISM same trad');

  const b1 = getDailyPrompt(bob, new Date('2026-06-15T08:00:00Z'));
  ok(TRADITIONS.includes(b1.tradition), 'SMOKE/PROMPT_DETERMINISM bob valid trad');

  const c1 = getDailyPrompt(alice, new Date('2026-06-16T08:00:00Z'));
  ok(c1.id !== a1.id, 'SMOKE/PROMPT_DETERMINISM different date → different');

  const alpha = getDailyPrompt(alice, new Date('2026-06-15T05:00:00Z'));
  ok(alpha.body.length > 0 && alpha.body.length <= 280, `SMOKE/PROMPT_DETERMINISM body len ≤280 (${alpha.body.length})`);
}

// ══════════════════════════════════════════════════════════════
// 2. WEEKLY_SET (3)
// ══════════════════════════════════════════════════════════════
{
  const week = getWeeklyPromptSet(alice, new Date('2026-06-29T12:00:00Z'));
  ok(week.length === 7, 'SMOKE/WEEKLY_SET 7 entries');
  const tradSet = new Set(week.map((w) => w.tradition));
  ok(tradSet.size === 7, `SMOKE/WEEKLY_SET covers 7 trads (got ${tradSet.size})`);
  const idSet = new Set(week.map((w) => w.id));
  ok(idSet.size === 7, `SMOKE/WEEKLY_SET no dup ids (${idSet.size})`);
}

// ══════════════════════════════════════════════════════════════
// 3. MONTHLY_CALENDAR (2)
// ══════════════════════════════════════════════════════════════
{
  const jan = getMonthlyPromptCalendar(alice, new Date('2025-01-15T12:00:00Z'));
  ok(Object.keys(jan).length === 31, `SMOKE/MONTHLY Jan31 (${Object.keys(jan).length})`);
  const feb = getMonthlyPromptCalendar(alice, new Date('2024-02-15T12:00:00Z'));
  ok(Object.keys(feb).length === 29, `SMOKE/MONTHLY Feb2024=29 (${Object.keys(feb).length})`);
}

// ══════════════════════════════════════════════════════════════
// 4. LUNAR_PHASE (4)
// ══════════════════════════════════════════════════════════════
{
  const full = lunarPhase(new Date('2024-12-15T00:00:00Z'));
  ok(full.phase === 'full', `SMOKE/LUNAR 2024-12-15=full (${full.phase})`);
  const newM = lunarPhase(new Date('2024-12-30T00:00:00Z'));
  ok(newM.phase === 'new', `SMOKE/LUNAR 2024-12-30=new (${newM.phase})`);
  const mid = lunarPhase(new Date('2024-12-22T00:00:00Z'));
  ok(mid.phase === 'last-quarter', `SMOKE/LUNAR 2024-12-22=last-q (${mid.phase})`);
  const intensity = determineIntensity(new Date('2024-12-15T00:00:00Z'));
  ok(intensity === 'intense', `SMOKE/LUNAR full moon → intense (${intensity})`);
}

// ══════════════════════════════════════════════════════════════
// 5. REFLECTION_HAPPY_PATH (5)
// ══════════════════════════════════════════════════════════════
const aliceUid = asUserId('smoke-alice-001');
const smokeCircle = asCircleId('smoke-circle');
_addCircleMemberForTest(smokeCircle, aliceUid);
{
  const r = await createReflection(
    aliceUid,
    asPromptId('p-smoke-001'),
    'A cabala de hoje se revelou na meditação.',
    'radiant' as Mood,
    { tradition: 'cabala', archetype: 'morning', sacredTags: ['Kether', 'centelha'], dateISO: '2026-06-30' },
  );
  const v = unwrap(r);
  ok(v.encrypted.algo === 'HMAC-SHA256', 'SMOKE/HAPPY HMAC algo');
  ok(v.encrypted.hmac.length === 64, 'SMOKE/HAPPY hmac length=64');
  ok(v.body.length > 0, 'SMOKE/HAPPY body present');
  const upd = await updateReflection(v.id, 'Reflexão revisitada.', 'clear' as Mood, aliceUid);
  ok(unwrap(upd).body === 'Reflexão revisitada.', 'SMOKE/HAPPY update ok');
  const share = await shareReflectionToCircle(v.id, smokeCircle, aliceUid);
  ok(unwrap(share).sharedToCircles.length === 1, 'SMOKE/HAPPY share ok');
}

// ══════════════════════════════════════════════════════════════
// 6. REFLECTION_STREAK (4)
// ══════════════════════════════════════════════════════════════
{
  _resetForTest();
  const u0 = asUserId('zero-001');
  const s0 = getCurrentStreak(u0, new Date('2026-06-30T20:00:00Z'));
  ok(unwrap(s0).days === 0, `SMOKE/STREAK 0-day (${unwrap(s0).days})`);

  const u3 = asUserId('streak-3-001');
  await createReflection(u3, asPromptId('p'), 'd1', 'clear' as Mood, { tradition: 'tarot', dateISO: '2026-06-28' });
  await createReflection(u3, asPromptId('p'), 'd2', 'clear' as Mood, { tradition: 'tarot', dateISO: '2026-06-29' });
  await createReflection(u3, asPromptId('p'), 'd3', 'clear' as Mood, { tradition: 'tarot', dateISO: '2026-06-30' });
  const s3 = getCurrentStreak(u3, new Date('2026-06-30T20:00:00Z'));
  ok(unwrap(s3).days === 3, `SMOKE/STREAK 3-day (${unwrap(s3).days})`);

  const u7 = asUserId('streak-7-001');
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(2026, 5, 24 + i, 12, 0, 0));
    const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    await createReflection(u7, asPromptId('p7'), `d-${i}`, 'radiant' as Mood, { tradition: 'tarot', dateISO: iso });
  }
  const s7 = getCurrentStreak(u7, new Date('2026-06-30T20:00:00Z'));
  ok(unwrap(s7).days === 7, `SMOKE/STREAK 7-day (${unwrap(s7).days})`);

  const uBroken = asUserId('broken-001');
  await createReflection(uBroken, asPromptId('pb'), 'd0', 'clear' as Mood, { tradition: 'tarot', dateISO: '2026-06-28' });
  await createReflection(uBroken, asPromptId('pb'), 'd2', 'clear' as Mood, { tradition: 'tarot', dateISO: '2026-06-30' });
  const sBroken = getCurrentStreak(uBroken, new Date('2026-06-30T20:00:00Z'));
  ok(unwrap(sBroken).days === 1, `SMOKE/STREAK broken=1 (${unwrap(sBroken).days})`);
}

// ══════════════════════════════════════════════════════════════
// 7. SACRED_CONTENT_AUDIT (7)
// ══════════════════════════════════════════════════════════════
{
  const audit = auditPromptRotation();
  ok(audit.length === 7, `SMOKE/AUDIT 7 traditions (${audit.length})`);
  for (const row of audit) {
    ok(row.promptCount >= 7, `SMOKE/AUDIT ${row.tradition} ≥7 prompts (${row.promptCount})`);
  }
  ok(audit.every((r) => r.archetypeCoverage >= 3), 'SMOKE/AUDIT all trads ≥3 archetypes');
}

// ── Bonus: audit layers and rule enforcement ──
{
  const rules = auditReflectionRules();
  ok(rules.length === 10, `SMOKE/RULES 10 (${rules.length})`);
  ok(rules.every((r) => r.isEnforced), 'SMOKE/RULES all enforced');
  const lunarAudit = auditLunarPhase();
  ok(lunarAudit.every((r) => r.isCorrect), `SMOKE/LUNAR_AUDIT all correct (${lunarAudit.filter(r=>r.isCorrect).length}/${lunarAudit.length})`);
}

// ── Output ──────────────────────────────────────────────────
console.log(`SMOKE W73-B: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  for (const f of fails) console.log(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
