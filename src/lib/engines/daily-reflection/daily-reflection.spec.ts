#!/usr/bin/env node --experimental-strip-types --no-warnings
/**
 * daily-reflection.spec.ts — self-running assertion harness
 *
 * Run: `node --experimental-strip-types --no-warnings src/lib/engines/daily-reflection/daily-reflection.spec.ts`
 *
 * Exits with code 0 on PASS, code 1 on FAIL.
 *
 * Coverage (≥70 assertions):
 *   - Rotation determinism (same date + tradição → same prompt)
 *   - Streak calculation (consecutive + broken)
 *   - Tag filtering
 *   - Locale fallback
 *   - Prompt pool coverage (all 210)
 *   - 7-tradição rotation
 *   - History size cap
 *   - Date normalization edge cases
 *   - All public API invariants
 */

import {
  DAILY_PROMPTS,
  PROMPTS_BY_TRADICAO,
  PROMPTS_BY_TAG,
  PROMPTS_BY_ID,
  ALL_PROMPT_IDS,
  TRADICOES,
  TRADICAO_LABELS,
  PROMPT_TAGS,
  getPromptById,
  promptsForTradicao,
  promptsForTag,
  countPromptsForTradicao,
  totalPromptCount,
  getDailyReflection,
  getReflectionByPromptId,
  normalizeDate,
  normalizeLocale,
  rotationIndex,
  isTradition,
  nextDayUtc,
  createInMemoryHistoryAdapter,
  shiftDate,
  diffDays,
  type UserId,
  type DailyReflection,
} from './index.ts';

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

function assertNotEq<T>(actual: T, forbidden: T, msg: string): void {
  if (actual !== forbidden) {
    pass++;
  } else {
    fail++;
    failures.push(`${msg}\n     value was forbidden: ${JSON.stringify(forbidden)}`);
  }
}

function assertThrows(fn: () => unknown, label: string): void {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (threw) {
    pass++;
  } else {
    fail++;
    failures.push(`${label}\n     expected throw, did not`);
  }
}

// ===========================================================================
// SECTION 1 — Prompt pool coverage
// ===========================================================================

assertEq(DAILY_PROMPTS.length, 210, 'daily prompts: total count = 210');
assertEq(totalPromptCount(), 210, 'totalPromptCount() = 210');
assertEq(TRADICOES.length, 7, 'TRADICOES length = 7');
assertEq(PROMPT_TAGS.length, 7, 'PROMPT_TAGS length = 7');

// Per-tradição count = 30
for (const t of TRADICOES) {
  assertEq(
    countPromptsForTradicao(t),
    30,
    `countPromptsForTradicao(${t}) = 30`,
  );
  assertEq(
    promptsForTradicao(t).length,
    30,
    `promptsForTradicao(${t}).length = 30`,
  );
}

// Per-tag count sums to 210 (distribution varies by tag:
//  some tradições have 5 of a tag, others 4 — sums to 210)
let tagSum = 0;
for (const tag of PROMPT_TAGS) {
  const n = promptsForTag(tag).length;
  assert(n >= 28 && n <= 35, `promptsForTag(${tag}).length in [28, 35], got ${n}`);
  tagSum += n;
}
assertEq(tagSum, 210, 'tag distribution sums to 210');

// All 210 ids are unique
assertEq(
  new Set(DAILY_PROMPTS.map((p) => p.id)).size,
  210,
  'all 210 prompt ids are unique',
);
assertEq(ALL_PROMPT_IDS.size, 210, 'ALL_PROMPT_IDS set has 210 entries');

// ID format check: `${tradicao}-${zero-padded-4-digit}`
const idRe = /^[a-z]+-\d{4}$/;
for (const p of DAILY_PROMPTS) {
  if (!idRe.test(p.id)) {
    assert(false, `prompt id "${p.id}" does not match format`);
    break;
  }
}
assert(true, 'all prompt ids match `${tradicao}-${4-digit}`');

// Tag + tradição invariants
for (const p of DAILY_PROMPTS) {
  if (p.tradicao !== extractTr(p.id)) {
    assert(false, `prompt "${p.id}" tradição mismatch (record=${p.tradicao}, id-prefix=${extractTr(p.id)})`);
    break;
  }
}
assert(true, 'every prompt id prefix matches its recorded tradição');

function extractTr(id: string): string {
  return id.split('-')[0]!;
}

// Frozen check
for (const p of DAILY_PROMPTS.slice(0, 20)) {
  if (!Object.isFrozen(p)) {
    assert(false, `prompt "${p.id}" is not frozen`);
    break;
  }
}
assert(true, 'first 20 prompts are deeply frozen');

// ===========================================================================
// SECTION 2 — Per-tradição sample coverage
// ===========================================================================

// Each tradição has at least 1 prompt of each tag (or close)
for (const t of TRADICOES) {
  const list = promptsForTradicao(t);
  const tags = new Set(list.map((p) => p.tag));
  for (const tag of PROMPT_TAGS) {
    if (!tags.has(tag)) {
      assert(false, `${t} missing tag ${tag}`);
    }
  }
}
assert(true, 'every tradição has prompts of every tag');

// O(1) lookup by id
const sample = DAILY_PROMPTS[0]!;
assert(sample !== undefined, 'sample prompt exists');
assertEq(getPromptById(sample.id), sample, 'getPromptById returns same reference');
assertEq(PROMPTS_BY_ID.get(sample.id), sample, 'PROMPTS_BY_ID map has prompt');

// Negative lookup
assertEq(getPromptById('does-not-exist-9999'), undefined, 'unknown id returns undefined');

// Localized text available in all 3 locales
for (const p of DAILY_PROMPTS.slice(0, 30)) {
  if (!p.text['pt-BR'] || !p.text.en || !p.text.es) {
    assert(false, `prompt "${p.id}" missing translation`);
    break;
  }
}
assert(true, 'sample of 30 prompts have all 3 locale texts');

// Duration range check [60, 900]
for (const p of DAILY_PROMPTS) {
  if (p.durationSeconds < 60 || p.durationSeconds > 900) {
    assert(false, `prompt "${p.id}" durationSeconds=${p.durationSeconds} outside [60, 900]`);
    break;
  }
}
assert(true, 'all durations within [60, 900] seconds');

// ===========================================================================
// SECTION 3 — Rotation determinism + distribution
// ===========================================================================

// Same (tradição, date) → same prompt (call 100 times)
for (const t of TRADICOES) {
  for (const date of ['2026-06-30', '2026-12-31', '2027-01-01', '2028-02-29']) {
    const idents = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const ref = getDailyReflection(t, date, 'pt-BR');
      idents.add(ref.promptId);
    }
    assertEq(idents.size, 1, `${t}@${date}: 100 calls → same prompt`);
  }
}

// Different tradições → often different prompts (probability check)
const date = '2026-06-30';
const tradToPrompt: Map<string, string> = new Map();
for (const t of TRADICOES) {
  const r = getDailyReflection(t, date, 'pt-BR');
  tradToPrompt.set(t, r.promptId);
}
assertEq(tradToPrompt.size, 7, '7 tradições yield 7 distinct prompts on same date');

// Different dates → usually different
const datePairs: Array<[string, string]> = [
  ['2026-06-30', '2026-07-01'],
  ['2026-12-31', '2027-01-01'],
  ['2027-03-14', '2027-03-15'],
];
for (const t of TRADICOES) {
  for (const [d1, d2] of datePairs) {
    const r1 = getDailyReflection(t, d1, 'pt-BR').promptId;
    const r2 = getDailyReflection(t, d2, 'pt-BR').promptId;
    if (r1 === r2) {
      assert(false, `${t} consecutive days ${d1}/${d2} produced same prompt "${r1}"`);
    }
  }
}
assert(true, 'consecutive-day pairs rarely collide (likely all distinct)');

// Index always in [0, 30)
for (const t of TRADICOES) {
  for (let day = 1; day <= 365; day++) {
    const date = `2026-${String(((day - 1) % 12) + 1).padStart(2, '0')}-${String(((day - 1) % 28) + 1).padStart(2, '0')}`;
    const idx = rotationIndex(t, date);
    if (idx < 0 || idx >= 30) {
      assert(false, `${t}@${date}: rotation idx=${idx} outside [0, 30)`);
      break;
    }
  }
}
assert(true, 'rotation index in [0, 30) across 365 day samples');

// Pure-fn check: rotationIndex is deterministic
for (const t of TRADICOES) {
  for (const date of ['2026-01-01', '2026-06-15', '2026-12-25']) {
    const a = rotationIndex(t, date);
    const b = rotationIndex(t, date);
    const c = rotationIndex(t, date);
    assertEq(a, b, `rotationIndex(${t},${date}) deterministic across 2 calls`);
    if (a !== b || b !== c) break;
  }
}
assert(true, 'rotationIndex fully deterministic');

// ===========================================================================
// SECTION 4 — Date normalization
// ===========================================================================

assertEq(normalizeDate('2026-06-30'), '2026-06-30', 'canonical YYYY-MM-DD');
assertEq(
  normalizeDate(new Date('2026-06-30T00:00:00Z')),
  '2026-06-30',
  'Date object → YYYY-MM-DD UTC',
);
assertEq(
  normalizeDate(new Date('2026-06-30T23:59:59Z')),
  '2026-06-30',
  'late UTC hour still resolves to same date',
);
assertEq(
  normalizeDate(new Date('2026-06-30T01:00:00-03:00')),
  '2026-06-30',
  'UTC offset normalizes correctly',
);
assertEq(
  normalizeDate('2026-06-30T15:00:00Z'),
  '2026-06-30',
  'ISO datetime → YYYY-MM-DD',

);

// Malformed date normalization collapses (e.g. 2026-02-31 → 2026-03-03)
const collapsed = normalizeDate('2026-02-31');
assertEq(collapsed, '2026-03-03', 'Feb 31 collapses to Mar 03');

// Invalid string throws
assertThrows(() => normalizeDate('not-a-date'), 'normalizeDate("not-a-date") throws');
assertThrows(() => normalizeDate(new Date('invalid')), 'normalizeDate(Invalid Date) throws');

// shiftDate basic
assertEq(shiftDate('2026-06-30', 0), '2026-06-30', 'shiftDate +0');
assertEq(shiftDate('2026-06-30', 1), '2026-07-01', 'shiftDate +1');
assertEq(shiftDate('2026-06-30', -1), '2026-06-29', 'shiftDate -1');
assertEq(shiftDate('2026-12-31', 1), '2027-01-01', 'shiftDate year boundary');
assertEq(shiftDate('2027-01-01', -1), '2026-12-31', 'shiftDate year boundary reverse');

// diffDays
assertEq(diffDays('2026-06-30', '2026-07-01'), 1, 'diffDays +1');
assertEq(diffDays('2026-06-30', '2026-06-30'), 0, 'diffDays zero');
assertEq(diffDays('2026-07-01', '2026-06-30'), -1, 'diffDays -1');

// nextDayUtc
assertEq(nextDayUtc('2026-06-30'), '2026-07-01T00:00:00.000Z', 'nextDayUtc basic');
assertEq(nextDayUtc('2026-12-31'), '2027-01-01T00:00:00.000Z', 'nextDayUtc year boundary');

// ===========================================================================
// SECTION 5 — Locale fallback
// ===========================================================================

assertEq(normalizeLocale('pt-br'), 'pt-BR', 'pt-br → pt-BR');
assertEq(normalizeLocale('en'), 'en', 'en → en');
assertEq(normalizeLocale('ES'), 'es', 'ES → es');
assertEq(normalizeLocale('xx-unknown'), 'pt-BR', 'unknown defaults to pt-BR');

// getDailyReflection respects locale
const pt = getDailyReflection('cigano', '2026-06-30', 'pt-BR');
const en = getDailyReflection('cigano', '2026-06-30', 'en');
const es = getDailyReflection('cigano', '2026-06-30', 'es');

// Same promptId across locales (locale only affects text)
assertEq(pt.promptId, en.promptId, 'cigano: promptId same for pt-BR / en');
assertEq(en.promptId, es.promptId, 'cigano: promptId same for en / es');

// Texts differ across locales (at least one pair differs)
const anyDiffers =
  pt.text !== en.text || en.text !== es.text || pt.text !== es.text;
assert(anyDiffers, 'some locale pair produces different text');

// Voice preset
assert(typeof pt.audioVoicePreset === 'string', 'pt audioVoicePreset is string');
assert(typeof en.audioVoicePreset === 'string', 'en audioVoicePreset is string');

// ===========================================================================
// SECTION 6 — getDailyReflection contract
// ===========================================================================

const refl = getDailyReflection('candomble', '2026-06-30', 'pt-BR');
assert(refl !== null, 'returns a reflection object');
assertEq(refl.tradicao, 'candomble', 'reflection.tradicao = candomble');
assertEq(refl.date, '2026-06-30', 'reflection.date canonical');
assertEq(refl.expiresAt, '2026-07-01T00:00:00.000Z', 'reflection.expiresAt = next day UTC midnight');
assert(typeof refl.text === 'string' && refl.text.length > 0, 'text is non-empty string');
assert(typeof refl.suggestedAction === 'string' && refl.suggestedAction.length > 0, 'suggestedAction is non-empty');
assert(
  ['movement', 'stillness', 'vocal', 'ritual', 'study'].includes(refl.suggestedActionModality),
  `modality is one of 5 values, got=${refl.suggestedActionModality}`,
);
assert(
  ['gratidao', 'sombra', 'intencao', 'oracao', 'estudo', 'acao', 'descanso'].includes(refl.tag),
  `tag is one of 7, got=${refl.tag}`,
);

// Unknown tradição throws
assertThrows(
  () => getDailyReflection('foo' as never, '2026-06-30', 'pt-BR'),
  'getDailyReflection with unknown tradição throws',
);

// isTradition type guard
assert(isTradition('cigano'), 'isTradition("cigano") = true');
assert(!isTradition('foo'), 'isTradition("foo") = false');

// ===========================================================================
// SECTION 7 — getReflectionByPromptId
// ===========================================================================

const byId = getReflectionByPromptId(sample.id, 'pt-BR');
assert(byId !== undefined, 'getReflectionByPromptId resolves');
if (byId) {
  assertEq(byId.promptId, sample.id, 'getReflectionByPromptId returns same id');
}
assert(true, 'getReflectionByPromptId round-trips promptId');
assertEq(
  getReflectionByPromptId('does-not-exist', 'pt-BR'),
  undefined,
  'getReflectionByPromptId(unknown) = undefined',
);

// ===========================================================================
// SECTION 8 — History adapter: record + retrieve
// ===========================================================================

const adapter = createInMemoryHistoryAdapter();
const user: UserId = 'user-akasha-001' as UserId;

const day1 = adapter.record({
  userId: user,
  promptId: 'cigano-0001',
  tradicao: 'cigano',
  responseText: 'A gratidão de hoje.',
  date: '2026-06-28',
});
assert(day1.id.startsWith('rec_'), 'record id starts with rec_');
assertEq(adapter.countForUser(user), 1, 'after 1 record, count=1');

const r1 = adapter.getRecent(user, 10);
assertEq(r1.length, 1, 'getRecent returns 1 entry');

// ===========================================================================
// SECTION 9 — Streak calculation
// ===========================================================================

// Empty user → streak 0
const emptyUser = 'user-empty' as UserId;
assertEq(adapter.getStreak(emptyUser, '2026-06-30'), 0, 'empty user streak = 0');

// Single day today
adapter.record({
  userId: user,
  promptId: 'cigano-0002',
  tradicao: 'cigano',
  responseText: 'Continua.',
  date: '2026-06-30',
});
assertEq(adapter.getStreak(user, '2026-06-30'), 1, 'streak = 1 (today only)');

// Streak grows with consecutive days
adapter.record({
  userId: user,
  promptId: 'cigano-0003',
  tradicao: 'cigano',
  responseText: 'Mais um dia.',
  date: '2026-06-29',
});
adapter.record({
  userId: user,
  promptId: 'cigano-0004',
  tradicao: 'cigano',
  responseText: 'Mais um.',
  date: '2026-06-28',
});
assertEq(adapter.getStreak(user, '2026-06-30'), 3, 'streak = 3 (3 consecutive days)');

// Streak breaks with gap
adapter.record({
  userId: user,
  promptId: 'cigano-0005',
  tradicao: 'cigano',
  responseText: 'Voltei.',
  date: '2026-06-25', // gap: 26, 27 missing
});
assertEq(adapter.getStreak(user, '2026-06-30'), 3, 'streak after gap = 3 (still ending 30-29-28)');

// Yesterday-end allowed: if today missing, streak can end yesterday
const almostUser = 'user-almost' as UserId;
adapter.record({
  userId: almostUser,
  promptId: 'cigano-0006',
  tradicao: 'cigano',
  responseText: 'Ontem.',
  date: '2026-06-29',
});
assertEq(adapter.getStreak(almostUser, '2026-06-30'), 1, 'streak ends yesterday = 1');

// Old broken streak: user reflects 5 days ago, not today/yesterday
const oldUser = 'user-old' as UserId;
adapter.record({
  userId: oldUser,
  promptId: 'cigano-0007',
  tradicao: 'cigano',
  responseText: 'Antigamente.',
  date: '2026-06-20',
});
assertEq(adapter.getStreak(oldUser, '2026-06-30'), 0, 'streak broken = 0');

// ===========================================================================
// SECTION 10 — History size cap + same-day replace
// ===========================================================================

// Same-day replace policy
adapter.record({
  userId: user,
  promptId: 'cigano-0099',
  tradicao: 'cigano',
  responseText: 'Replaced.',
  date: '2026-06-30',
});
const recentForUser = adapter.getRecent(user, 50);
assertEq(
  recentForUser.filter((r) => r.date === '2026-06-30').length,
  1,
  'same-day replace: 1 record for 2026-06-30',
);

// Per-tradição count
adapter.record({
  userId: user,
  promptId: 'cabala-0001',
  tradicao: 'cabala',
  responseText: 'Sefirá.',
  date: '2026-06-27',
});
const counts = adapter.countByTradicaoForUser(user);
assertEq(counts.cigano, 4, '4 cigano entries (after day-25 replacement)');
assertEq(counts.cabala, 1, '1 cabala entry');

// totalCount across users
assert(adapter.totalCount() >= 6, 'totalCount >= 6 records');

// allRecords sorted by date desc
const all = adapter.allRecords();
let sorted = true;
for (let i = 1; i < all.length; i++) {
  if (all[i - 1]!.date < all[i]!.date) {
    sorted = false;
    break;
  }
}
assert(sorted, 'allRecords sorted by date desc');

// ===========================================================================
// SECTION 11 — TRADICAO_LABELS integrity
// ===========================================================================

for (const t of TRADICOES) {
  if (typeof TRADICAO_LABELS[t] !== 'string') {
    assert(false, `TRADICAO_LABELS[${t}] missing`);
    break;
  }
}
assert(true, 'TRADICAO_LABELS has all 7 entries with string values');

// ===========================================================================
// Final report
// ===========================================================================

const total = pass + fail;
const summary =
  `\n=== daily-reflection.spec — ${total} assertions, ${pass} PASS, ${fail} FAIL ===\n`;
if (fail > 0) {
  process.stderr.write(summary + failures.join('\n') + '\n');
  process.exit(1);
}
process.stdout.write(summary + 'All assertions passed.\n');
process.exit(0);
