#!/usr/bin/env node --experimental-strip-types --no-warnings
/**
 * daily-reflection smoke — end-to-end probe
 *
 * Run: `node --experimental-strip-types --no-warnings scripts/smoke/daily-reflection.ts`
 *
 * Simulates: open page → view prompt → respond → streak updates
 *
 * Exits with code 0 on PASS, code 1 on FAIL.
 */

import {
  DAILY_PROMPTS,
  TRADICOES,
  getDailyReflection,
  getReflectionByPromptId,
  createInMemoryHistoryAdapter,
  type UserId,
  type DailyReflection,
} from '../../src/lib/engines/daily-reflection/index.ts';

// ---------------------------------------------------------------------------
// Mini test runner
// ---------------------------------------------------------------------------

let pass = 0;
let fail = 0;
const failures: string[] = [];

function assert(cond: unknown, msg: string): void {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(msg);
  }
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  if (actual === expected) {
    pass++;
  } else {
    fail++;
    failures.push(
      `${msg}\n     expected: ${JSON.stringify(expected)}\n     actual:   ${JSON.stringify(actual)}`,
    );
  }
}

// ===========================================================================
// SIM: open page on day 1 (cigano tradition)
// ===========================================================================

const day1 = '2026-06-28';
const day2 = '2026-06-29';
const day3 = '2026-06-30';
const today = day3;

const reflection: DailyReflection = getDailyReflection('cigano', today, 'pt-BR');
assert(reflection !== null, 'SMOKE: opened page, got daily reflection');
assertEq(reflection.tradicao, 'cigano', 'SMOKE: tradição is cigano');
assertEq(reflection.date, today, 'SMOKE: reflection date is today');
assert(reflection.text.length > 0, 'SMOKE: prompt text is non-empty');
assert(
  reflection.expiresAt === '2026-07-01T00:00:00.000Z',
  'SMOKE: expiresAt is next day UTC midnight',
);

// ===========================================================================
// SIM: respond → record to history
// ===========================================================================

const adapter = createInMemoryHistoryAdapter();
const userId: UserId = 'smoke-user-001' as UserId;

const recorded = adapter.record({
  userId,
  promptId: reflection.promptId,
  tradicao: reflection.tradicao,
  responseText: 'Hoje agradeço a clareza.',
  date: today,
});
assert(recorded.id.startsWith('rec_'), 'SMOKE: record id has expected prefix');
assertEq(recorded.userId, userId, 'SMOKE: record userId matches');
assertEq(recorded.promptId, reflection.promptId, 'SMOKE: record promptId matches page');
assertEq(recorded.responseText, 'Hoje agradeço a clareza.', 'SMOKE: responseText preserved');

// ===========================================================================
// SIM: continue for 2 more days to build streak
// ===========================================================================

const refl2 = getDailyReflection('cigano', day2, 'pt-BR');
adapter.record({
  userId,
  promptId: refl2.promptId,
  tradicao: refl2.tradicao,
  responseText: 'Continua.',
  date: day2,
});

const refl1 = getDailyReflection('cigano', day1, 'pt-BR');
adapter.record({
  userId,
  promptId: refl1.promptId,
  tradicao: refl1.tradicao,
  responseText: 'Mais um.',
  date: day1,
});

// ===========================================================================
// SIM: streak updates → 3
// ===========================================================================

assertEq(adapter.getStreak(userId, today), 3, 'SMOKE: streak = 3 after 3 consecutive days');

// ===========================================================================
// SIM: history drawer shows 3 entries newest-first
// ===========================================================================

const recent = adapter.getRecent(userId, 7);
assertEq(recent.length, 3, 'SMOKE: history drawer has 3 entries');
assertEq(
  recent[0]!.date,
  today,
  'SMOKE: most recent is today',
);
assertEq(
  recent[2]!.date,
  day1,
  'SMOKE: oldest is day1',
);

// ===========================================================================
// SIM: switching tradição yields different prompt
// ===========================================================================

const cabalaToday = getDailyReflection('cabala', today, 'pt-BR');
assert(cabalaToday.tradicao === 'cabala', 'SMOKE: switch tradição → cabala');
assert(cabalaToday.text.length > 0, 'SMOKE: cabala prompt has text');
assert(
  cabalaToday.tag !== reflection.tag,
  'SMOKE: cabala tag differs from cigano tag (probability > 50%)',
);

// ===========================================================================
// SIM: locale switch — en and es both render non-empty
// ===========================================================================

const enRefl = getDailyReflection('cigano', today, 'en');
assertEq(enRefl.promptId, reflection.promptId, 'SMOKE: en ↔ pt-BR same promptId');
assert(enRefl.text.length > 0, 'SMOKE: en text non-empty');
assert(
  enRefl.text !== reflection.text,
  'SMOKE: en text differs from pt-BR text',
);

const esRefl = getDailyReflection('cigano', today, 'es');
assertEq(esRefl.promptId, reflection.promptId, 'SMOKE: es ↔ pt-BR same promptId');
assert(esRefl.text.length > 0, 'SMOKE: es text non-empty');

// ===========================================================================
// SIM: getReflectionByPromptId round-trip
// ===========================================================================

const byId = getReflectionByPromptId(reflection.promptId, 'pt-BR');
assert(byId !== undefined, 'SMOKE: getReflectionByPromptId resolves');
if (byId) {
  assertEq(byId.promptId, reflection.promptId, 'SMOKE: promptId round-trips');
  assertEq(byId.text, reflection.text, 'SMOKE: text round-trips');
}

// ===========================================================================
// SIM: each tradição loaded independently (210 prompts total)
// ===========================================================================

assertEq(DAILY_PROMPTS.length, 210, 'SMOKE: pool has 210 entries');
assertEq(TRADICOES.length, 7, 'SMOKE: 7 tradições');

// ===========================================================================
// SMOKE final report
// ===========================================================================

const total = pass + fail;
const summary =
  `\n=== daily-reflection smoke — ${total} assertions, ${pass} PASS, ${fail} FAIL ===\n`;
if (fail > 0) {
  process.stderr.write(summary + failures.join('\n') + '\n');
  process.exit(1);
}
process.stdout.write(summary + 'All smoke checks passed.\n');
process.exit(0);
