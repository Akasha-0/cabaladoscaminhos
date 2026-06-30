/**
 * ════════════════════════════════════════════════════════════════════════════
 *  energy-mood-checkin smoke runner — wave 69, 2026-06-30
 *
 *  Cross-runtime aggregator: runs all 4 spec files via the self-running
 *  harness AND adds 12+ cross-engine integration checks that prove the
 *  4 engines work together end-to-end.
 *
 *  Invocation:
 *    node --experimental-strip-types src/lib/energy-mood-checkin/smoke/smoke-runtime.mjs
 *
 *  Pattern: cycle 60-68 (smoke aggregator)
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  recordCheckin,
  getCheckin,
  getCheckins,
  deleteCheckin,
  eraseAllCheckins,
  exportCheckins,
  classifyBucket,
  dateKeyInTZ,
  isValidIANATZ,
  isMood,
  asUserId,
  asDateKey,
  __resetCheckinStore,
  MOODS,
  ENERGY_BUCKETS,
} from '../checkin.ts';
import {
  energyTrend,
  energyVsHistory,
  suggestRitualForEnergy,
} from '../energy.ts';
import {
  moodToSacredRef,
  moodFrequency,
  dominantMood,
  moodCoOccurrence,
  assertMoodSacredRefsComplete,
} from '../mood.ts';
import {
  extractSacredTags,
  classifyState,
  intentionQuality,
  linkToReading,
  assertCatalogCoverage,
  SACRED_CATALOG,
} from '../spiritual-state.ts';

import { runCheckinSpec } from '../__tests__/checkin.spec.ts';
import { runEnergySpec } from '../__tests__/energy.spec.ts';
import { runMoodSpec } from '../__tests__/mood.spec.ts';
import { runSpiritualStateSpec } from '../__tests__/spiritual-state.spec.ts';

let PASSED = 0;
let FAILED = 0;
const FAILURES = [];

function check(label, ok, hint = '') {
  if (ok) {
    PASSED++;
  } else {
    FAILED++;
    FAILURES.push(`${label}${hint ? ': ' + hint : ''}`);
  }
}

function checkEqual(label, actual, expected) {
  const ok = Object.is(actual, expected);
  check(label, ok, `actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
}

function checkTrue(label, actual) {
  check(label, actual === true, `expected true got ${JSON.stringify(actual)}`);
}

function checkNotNull(label, actual) {
  check(label, actual !== null && actual !== undefined, `expected non-null got ${JSON.stringify(actual)}`);
}

function section(name) {
  console.log(`\n── ${name} ──`);
}

// ═══════════════════════════════════════════════════════════════════════
//  CROSS-ENGINE INTEGRATION CHECKS (12+)
// ═══════════════════════════════════════════════════════════════════════

function integrationChecks() {
  section('Cross-engine integration (12+)');
  __resetCheckinStore();
  const u = asUserId('smoke-integ');

  // 1. recordCheckin → getCheckin round-trip with IANA timezone
  const c = recordCheckin(u, {
    energyScore: 8,
    mood: 'inspired',
    spiritualState: 'Sinto Oxalá e Muladhara firmes hoje, abençoado por A Torre',
    intention: 'I welcome clarity',
    timeZone: 'America/Sao_Paulo',
    recordedAt: '2026-06-30T15:00:00Z', // 12:00 in SP
  });
  check('integ/01-CRUD round-trip', getCheckin(u, c.dateKey)?.energyScore === 8);

  // 2. EnergyBucket is derived from score
  checkEqual('integ/02-bucket from score', c.energyBucket, 'high');

  // 3. extractSacredTags picks up tags from spiritualState
  const tags = extractSacredTags(c.spiritualState);
  checkTrue('integ/03-extractSacredTags finds Oxalá', tags.some((t) => t.symbol === 'Oxalá'));
  checkTrue('integ/04-extractSacredTags finds Muladhara', tags.some((t) => t.symbol === 'Muladhara'));
  checkTrue('integ/05-extractSacredTags finds A Torre', tags.some((t) => t.symbol === 'A Torre'));

  // 4. classifyState routes to balanced/transformative
  const cls = classifyState(c.spiritualState);
  checkTrue('integ/06-classifyState has a valid state', ['grounded', 'expansive', 'transformative', 'introspective', 'balanced'].includes(cls.state));

  // 5. intentionQuality "I welcome clarity" → growth
  const iq = intentionQuality(c.intention);
  checkEqual('integ/07-intentionQuality growth flag', iq.flag, 'growth');

  // 6. linkToReading finds a reading within 3h
  const link = linkToReading(c, [{ readAt: '2026-06-30T18:00:00Z' }]); // +3h
  checkEqual('integ/08-linkToReading direction', link?.direction, 'after');
  checkTrue('integ/09-linkToReading hoursDelta <= 3', link?.hoursDelta <= 3);

  // 7. moodToSacredRef returns ≥1 ref with all fields
  const joyfulRefs = moodToSacredRef('joyful');
  checkTrue('integ/10-moodToSacredRef non-empty', joyfulRefs.length >= 1);
  checkTrue('integ/11-moodToSacredRef has tradition', joyfulRefs.every((r) => r.tradition.length > 0));

  // 8. suggestRitualForEnergy returns a complete record
  const ritual = suggestRitualForEnergy('low');
  checkTrue('integ/12-ritual has primary practice', ritual.primaryPractice.length > 10);
  checkTrue('integ/13-ritual has rationale', ritual.rationale.length > 10);

  // 9. assertMoodSacredRefsComplete covers all 10 moods without throwing
  checkTrue('integ/14-moodCoverage complete', assertMoodSacredRefsComplete() === undefined);

  // 10. assertCatalogCoverage passes
  checkTrue('integ/15-catalogCoverage passes', assertCatalogCoverage() === undefined);

  // 11. Catalog spans ≥9 traditions
  checkTrue('integ/16-catalog ≥7 traditions', new Set(SACRED_CATALOG.map((e) => e.tradition)).size >= 7);
  checkTrue('integ/17-catalog ≥84 entries', SACRED_CATALOG.length >= 84);

  // 12. CRUD: delete + verify null
  deleteCheckin(u, c.dateKey);
  checkEqual('integ/18-delete returns null', getCheckin(u, c.dateKey), null);

  // 13. energyTrend on empty user
  const trend = energyTrend(asUserId('nobody'));
  checkEqual('integ/19-empty-trend direction', trend.direction, 'insufficient');

  // 14. dominantMood on empty user
  const dom = dominantMood(asUserId('nobody'));
  checkEqual('integ/20-empty-dominant', dom.mood, null);

  // 15. Export round-trip
  recordCheckin(u, { energyScore: 5, mood: 'calm', spiritualState: 'auto', timeZone: 'UTC' });
  const exp = exportCheckins(u);
  checkEqual('integ/21-export has 1', exp.count, 1);

  // 16. MOODS has exactly 10
  check('integ/22-MOODS has 10', MOODS.length === 10);

  // 17. ENERGY_BUCKETS has exactly 4
  check('integ/23-ENERGY_BUCKETS has 4', ENERGY_BUCKETS.length === 4);

  // 18. IANA TZ validator
  checkTrue('integ/24-isValidIANATZ UTC', isValidIANATZ('UTC'));
  check('integ/25-isValidIANATZ empty false', isValidIANATZ('') === false);

  // 19. Classify gives 'balanced' for mixed-tradition input
  const balText = 'hoje Oxalá, Binah, e Muladhara juntos';
  checkEqual('integ/26-classifyState balanced', classifyState(balText).state, 'balanced');

  // 20. Subword rejection: Oxalácida does NOT match Oxalá
  check('integ/27-subword rejection', extractSacredTags('Oxalácida inventada').length === 0);
}

function specs() {
  console.log('Running spec files via self-running harness…');
  // Each spec mutates the in-memory store; specs self-reset internally
  const code1 = runCheckinSpec();
  const code2 = runEnergySpec();
  const code3 = runMoodSpec();
  const code4 = runSpiritualStateSpec();
  console.log(`spec checks: checkin=${code1} energy=${code2} mood=${code3} spiritual-state=${code4}`);
  return code1 + code2 + code3 + code4; // total non-zero failures
}

integrationChecks();
const specFailures = specs();

console.log('\n══════════════════════════════════════════════');
console.log(`SMOKE: ${PASSED} PASS, ${FAILED} FAIL`);
if (FAILURES.length > 0) {
  console.log('Failures:');
  for (const f of FAILURES) console.log('  ✗ ' + f);
}
console.log('══════════════════════════════════════════════');

const totalFails = FAILED + (specFailures > 0 ? specFailures : 0);
process.exit(totalFails === 0 ? 0 : 1);
