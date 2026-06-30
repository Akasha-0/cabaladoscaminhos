#!/usr/bin/env node
// ============================================================================
// smoke-comments-mention-autocomplete.mjs — Runtime smoke (W90s-D)
//
// Pattern (per W89-A lessons): spawn `tsx` as a subprocess to evaluate a
// tiny test bench that imports the engine + executes a deterministic set
// of pure-function calls. We capture the JSON output and assert against
// it. This avoids the vitest+jsdom sandbox issues while still exercising
// real TypeScript code paths.
//
// Run:    node scripts/smoke-comments-mention-autocomplete.mjs
//         (uses tsx internally — already installed via npm install)
// ============================================================================

import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const REPO_ROOT = process.cwd();
// Write the bench inside the worktree so tsx can resolve sibling imports
// and so the sandbox doesn't lose access to /tmp between writes and exec.
const SMOKE_DIR = join(REPO_ROOT, '.smoke-tmp');
import { mkdirSync } from 'node:fs';
mkdirSync(SMOKE_DIR, { recursive: true });

let pass = 0;
let fail = 0;

function check(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    fail++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('Smoke: comments-mention-autocomplete (W90s-D)');
console.log(`  cwd: ${REPO_ROOT}`);
console.log(`  tmp: ${SMOKE_DIR}\n`);

// ---------------------------------------------------------------------------
// Build the bench — imports the engine via tsx and emits a JSON result line.
// We split output on the marker line and parse only the final JSON.
// ---------------------------------------------------------------------------

const benchPath = join(SMOKE_DIR, 'bench.ts');
// Use a relative import so tsx can resolve it from the bench file's dir.
const benchSrc = `
import * as engine from '../src/lib/w90s/comments-mention-autocomplete.ts';

const users = [
  { id: engine.toUserId('u1'), handle: engine.toMentionHandle('joao'), displayName: 'João Silva' },
  { id: engine.toUserId('u2'), handle: engine.toMentionHandle('jose'), displayName: 'José Oliveira' },
  { id: engine.toUserId('u3'), handle: engine.toMentionHandle('maria'), displayName: 'Maria das Dores' },
  { id: engine.toUserId('u4'), handle: engine.toMentionHandle('mestreramiro'), displayName: 'Mestre Ramiro', tradição: 'cigano' },
  { id: engine.toUserId('u5'), handle: engine.toMentionHandle('yaradocipo'), displayName: 'Yara do Cipó', tradição: 'candomble' },
  { id: engine.toUserId('u6'), handle: engine.toMentionHandle('maeiara'), displayName: 'Mãe Iara', tradição: 'umbanda' },
];

const out = {
  // A. findActiveTrigger
  findActive_start: engine.findActiveTrigger('@jo', 3),
  findActive_mid: engine.findActiveTrigger('hello @jo', 9),
  findActive_no_at: engine.findActiveTrigger('plain text', 10),
  findActive_email: engine.findActiveTrigger('user@example.com', 17),

  // B. searchUsers
  searchUsers_prefix: engine.searchUsers(users, 'jo'),
  searchUsers_initials: engine.searchUsers(users, 'mr'),
  searchUsers_empty_dataset: engine.searchUsers([], 'anything'),
  searchUsers_no_match: engine.searchUsers(users, 'zzz'),

  // C. insertMention
  insertMention_mid: engine.insertMention(
    'hello @jo ',
    { startIndex: 6, endIndex: 9, query: 'jo' },
    users[0],
  ),
  insertMention_start: engine.insertMention(
    '@ra ',
    { startIndex: 0, endIndex: 3, query: 'ra' },
    users[3],
  ),

  // D. validateMention
  validateMention_valid: engine.validateMention('@joao'),
  validateMention_short: engine.validateMention('@ab'),
  validateMention_known_handle_yes: engine.validateMention('@joao', new Set(['joao', 'jose', 'maria'])),
  validateMention_known_handle_no: engine.validateMention('@zzz', new Set(['joao', 'jose', 'maria'])),

  // E. parseMentions
  parseMentions_dedup: engine.parseMentions('hello @joao and @maria and @joao again'),
  parseMentions_email: engine.parseMentions('email me at user@example.com'),
  parseMentions_start: engine.parseMentions('@ramiro oi'),

  // F. computeAutocompleteState
  ac_open: engine.computeAutocompleteState(
    engine.createInitialState({ nowMs: 100 }),
    'hello @jo',
    9,
    users,
    { nowMs: 100 },
  ),
  ac_closed: engine.computeAutocompleteState(
    engine.createInitialState({ nowMs: 100 }),
    'plain text',
    10,
    users,
    { nowMs: 100 },
  ),

  // G. moveActive + setActive
  moveActive_clamp: engine.moveActive({
    ...engine.createInitialState(),
    activeIndex: 0,
    suggestions: [{ user: users[0], score: 0, isExactMatch: false }],
  }, 5).activeIndex,
  setActive_clamp: engine.setActive({
    ...engine.createInitialState(),
    activeIndex: 0,
    suggestions: [{ user: users[0], score: 0, isExactMatch: false }],
  }, 999).activeIndex,

  // H. scoreUser
  scoreUser_exact: engine.scoreUser(users[0], 'joao'),
  scoreUser_no_match: engine.scoreUser(users[0], 'zzzzzzz'),

  // I. factory + constants
  engine_keys: Object.keys(engine.createMentionEngine()),
  mentionEngine_keys: Object.keys(engine.mentionEngine),
  constants_keys: Object.keys(engine.mentionEngine.constants),

  // J. tradição symbols present
  tradição_keys: Object.keys(engine.TRADIÇÃO_SYMBOLS),
};
console.log('---SMOKE-RESULT---');
console.log(JSON.stringify(out));
`;
writeFileSync(benchPath, benchSrc);

console.log('[1/3] Running tsx bench…');
let benchOut = '';
try {
  benchOut = execSync(`npx --yes tsx --no-warnings "${benchPath}"`, {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: SMOKE_DIR,
    timeout: 90_000,
  }).toString();
} catch (err) {
  console.error('  ✗ tsx bench failed to execute');
  console.error(`    ${err.message}`);
  if (err.stderr) console.error(`    stderr: ${err.stderr.toString().slice(0, 500)}`);
  process.exit(2);
}

const jsonLine = benchOut.split('---SMOKE-RESULT---').pop()?.trim();
if (!jsonLine) {
  console.error('  ✗ bench produced no JSON output');
  console.error('  bench stdout (first 500 chars):');
  console.error(`  ${benchOut.slice(0, 500)}`);
  process.exit(2);
}

let bench;
try {
  bench = JSON.parse(jsonLine);
} catch (err) {
  console.error('  ✗ failed to parse bench JSON:');
  console.error(`    ${err.message}`);
  console.error(`    line: ${jsonLine.slice(0, 200)}`);
  process.exit(2);
}

console.log('[2/3] Running 15+ runtime assertions…\n');

// ---------------------------------------------------------------------------
// A. findActiveTrigger (3 asserts)
// ---------------------------------------------------------------------------

check('A1 findActiveTrigger detects @ at start of text', () => {
  // text='@jo', cursor=3
  // '@' is at index 0; handle 'jo' at 1..2; trigger range = [0..3].
  const t = bench.findActive_start;
  assert.equal(t.startIndex, 0);
  assert.equal(t.endIndex, 3);
  assert.equal(t.query, 'jo');
});

check('A2 findActiveTrigger detects @ mid-text', () => {
  // text='hello @jo', cursor=9
  // '@' is at index 6; handle 'jo' at 7..8; trigger range = [6..9].
  const t = bench.findActive_mid;
  assert.equal(t.startIndex, 6);
  assert.equal(t.endIndex, 9);
  assert.equal(t.query, 'jo');
});

check('A3 findActiveTrigger excludes email-style @', () => {
  // `user@example.com` should NOT trigger because before `@` is `r`
  // which is a handle-continuation char, and even if not, the user is
  // mid-word so the regex/explicit rule rejects it.
  const t = bench.findActive_email;
  // Either null (no trigger detected) OR trigger but the cursor is right
  // after @. Our pure engine rejects because there's no word boundary.
  assert.ok(t === null || t.startIndex > 17);
});

// ---------------------------------------------------------------------------
// B. searchUsers (4 asserts)
// ---------------------------------------------------------------------------

check('B1 searchUsers ranks joao + jose for query "jo"', () => {
  const res = bench.searchUsers_prefix;
  assert.equal(res.length, 2);
  assert.ok(res.some((r) => r.user.handle === 'joao'));
  assert.ok(res.some((r) => r.user.handle === 'jose'));
});

check('B2 searchUsers matches by initials (mr -> Mestre Ramiro)', () => {
  const res = bench.searchUsers_initials;
  assert.equal(res.length, 1);
  assert.equal(res[0].user.handle, 'mestreramiro');
});

check('B3 searchUsers returns [] for empty dataset', () => {
  assert.equal(bench.searchUsers_empty_dataset.length, 0);
});

check('B4 searchUsers returns [] for no match', () => {
  assert.equal(bench.searchUsers_no_match.length, 0);
});

// ---------------------------------------------------------------------------
// C. insertMention (2 asserts)
// ---------------------------------------------------------------------------

check('C1 insertMention replaces partial @handle with full @handle + space (mid)', () => {
  // input text='hello @jo ', trigger replaces [6..9] (the '@jo' part) with
  // '@joao ', keeping the trailing space at text.slice(9)=' '.
  // nextCursorPos = before.length + replacement.length = 6 + 6 = 12.
  const r = bench.insertMention_mid;
  assert.equal(r.nextText, 'hello @joao  ');
  assert.equal(r.nextCursorPos, 12);
});

check('C2 insertMention at start of text works', () => {
  // input text='@ra ', trigger replaces [0..3] (the '@ra' part) with
  // '@mestreramiro ', keeping the trailing space at text.slice(3)=' '.
  const r = bench.insertMention_start;
  assert.equal(r.nextText, '@mestreramiro  ');
  assert.equal(r.nextCursorPos, 14);
});

// ---------------------------------------------------------------------------
// D. validateMention (4 asserts)
// ---------------------------------------------------------------------------

check('D1 validateMention accepts valid token', () => {
  const r = bench.validateMention_valid;
  assert.equal(r.valid, true);
  assert.equal(r.handle, 'joao');
});

check('D2 validateMention rejects too-short handle', () => {
  const r = bench.validateMention_short;
  assert.equal(r.valid, false);
  assert.match(r.reason, /ao menos/);
});

check('D3 validateMention with knownHandles accepts member', () => {
  const r = bench.validateMention_known_handle_yes;
  assert.equal(r.valid, true);
});

check('D4 validateMention with knownHandles rejects unknown', () => {
  const r = bench.validateMention_known_handle_no;
  assert.equal(r.valid, false);
  assert.match(r.reason, /não encontrado/);
});

// ---------------------------------------------------------------------------
// E. parseMentions (3 asserts)
// ---------------------------------------------------------------------------

check('E1 parseMentions dedupes repeated handles', () => {
  const handles = bench.parseMentions_dedup;
  assert.equal(handles.length, 2);
  assert.ok(handles.includes('joao'));
  assert.ok(handles.includes('maria'));
});

check('E2 parseMentions excludes email-style @', () => {
  assert.equal(bench.parseMentions_email.length, 0);
});

check('E3 parseMentions extracts handle at start of text', () => {
  const handles = bench.parseMentions_start;
  assert.equal(handles.length, 1);
  assert.equal(handles[0], 'ramiro');
});

// ---------------------------------------------------------------------------
// F. computeAutocompleteState (2 asserts)
// ---------------------------------------------------------------------------

check('F1 computeAutocompleteState opens popover with suggestions', () => {
  const state = bench.ac_open;
  assert.notEqual(state.trigger, null);
  assert.equal(state.trigger.query, 'jo');
  assert.ok(state.suggestions.length >= 1);
});

check('F2 computeAutocompleteState closes popover without trigger', () => {
  const state = bench.ac_closed;
  assert.equal(state.trigger, null);
  assert.equal(state.suggestions.length, 0);
});

// ---------------------------------------------------------------------------
// G. moveActive + setActive (2 asserts)
// ---------------------------------------------------------------------------

check('G1 moveActive clamps at end of list', () => {
  assert.equal(bench.moveActive_clamp, 0);
});

check('G2 setActive clamps at upper bound', () => {
  assert.equal(bench.setActive_clamp, 0);
});

// ---------------------------------------------------------------------------
// H. scoreUser (1 assert)
// ---------------------------------------------------------------------------

check('H1 scoreUser returns null for unrelated query', () => {
  assert.equal(bench.scoreUser_no_match, null);
});

// ---------------------------------------------------------------------------
// I. factory + tradição surface (3 asserts)
// ---------------------------------------------------------------------------

check('I1 createMentionEngine returns 9 methods + constants', () => {
  const keys = bench.engine_keys.sort();
  assert.ok(keys.includes('findActiveTrigger'));
  assert.ok(keys.includes('searchUsers'));
  assert.ok(keys.includes('insertMention'));
  assert.ok(keys.includes('validateMention'));
  assert.ok(keys.includes('parseMentions'));
  assert.ok(keys.includes('computeAutocompleteState'));
  assert.ok(keys.includes('moveActive'));
  assert.ok(keys.includes('setActive'));
  assert.ok(keys.includes('createInitialState'));
  assert.ok(keys.includes('constants'));
});

check('I2 default mentionEngine instance has same shape', () => {
  const keys = bench.mentionEngine_keys.sort();
  assert.equal(keys.length, 10);
});

check('I3 TRADIÇÃO_SYMBOLS contains all 7 traditions', () => {
  const keys = bench.tradição_keys.sort();
  assert.equal(keys.length, 7);
  const expected = ['astrologia', 'cabala', 'candomble', 'cigano', 'ifa', 'tantra', 'umbanda'];
  for (const k of expected) {
    assert.ok(keys.includes(k));
  }
});

// ---------------------------------------------------------------------------
// J. scoreUser exact match (1 assert)
// ---------------------------------------------------------------------------

check('J1 scoreUser returns exact match for full handle', () => {
  const r = bench.scoreUser_exact;
  assert.equal(r.score, 0);
  assert.equal(r.isExactMatch, true);
});

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

console.log('\n[3/3] Cleanup…');
try {
  rmSync(SMOKE_DIR, { recursive: true, force: true });
} catch {}

console.log(`\nResult: ${pass}/${pass + fail} passed.`);
if (fail > 0) {
  console.error(`\n❌ ${fail} assertion(s) failed.`);
  process.exit(1);
}
console.log('SMOKE OK');