/**
 * ════════════════════════════════════════════════════════════════════════════
 *  checkin.spec.ts — 45 assertions across 7 sections
 *
 *  Sections:
 *    §1 — Branded-type factory & validation (5)
 *    §2 — IANA TZ helpers + dateKeyInTZ behaviour (8)
 *    §3 — recordCheckin happy paths + replace same-day (10)
 *    §4 — recordCheckin validation throws (7)
 *    §5 — getCheckin / getCheckins filter + paginate (9)
 *    §6 — deleteCheckin + eraseAll + exportCheckins (8)
 *    §7 — Mood enum + helpers (8)
 *
 *  Runs via `node --experimental-strip-types` OR vitest (when binary lands).
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  recordCheckin,
  getCheckin,
  getCheckins,
  deleteCheckin,
  eraseAllCheckins,
  exportCheckins,
  validatePayload,
  generateCheckinId,
  setCheckinHmacSecret,
  dateKeyInTZ,
  isValidIANATZ,
  isMood,
  assertMood,
  isValidEnergyScore,
  classifyBucket,
  asUserId,
  asDateKey,
  asCheckinId,
  __resetCheckinStore,
  MOODS,
  ENERGY_BUCKETS,
} from '../checkin.ts';
import {
  expectEqual,
  expectNotEqual,
  expectTrue,
  expectFalse,
  expectThrows,
  expectMatches,
  expectLen,
  expectContains,
  resetHarness,
  report,
  section,
  results as harnessResults,
} from './harness.ts';

export function runCheckinSpec(): number {
  resetHarness();
  __resetCheckinStore();

  // ── §1 — Branded-type factory & validation ────────────────────────────
  section('§1 Branded-type factory');
  expectEqual('asUserId returns string-typed brand', typeof asUserId('abc'), 'string');
  expectEqual('asDateKey accepts YYYY-MM-DD', asDateKey('2026-06-30'), '2026-06-30');
  expectThrows('asDateKey rejects non-ISO format', () => asDateKey('30-06-2026'));
  expectThrows('asDateKey rejects empty string', () => asDateKey(''));
  expectEqual('asCheckinId round-trips', asCheckinId('chk_123'), 'chk_123');

  // ── §2 — IANA TZ helpers + dateKeyInTZ behaviour ──────────────────────
  section('§2 IANA TZ');
  expectTrue('UTC is valid IANA', isValidIANATZ('UTC'));
  expectTrue('America/Sao_Paulo is valid', isValidIANATZ('America/Sao_Paulo'));
  expectFalse('Empty string is NOT a valid IANA TZ', isValidIANATZ(''));
  expectFalse('Random string is NOT a valid IANA TZ', isValidIANATZ('Foobar/Nowhere'));
  expectEqual(
    'dateKeyInTZ UTC 03:00 → SP 2026-06-30',
    dateKeyInTZ(new Date('2026-06-30T03:00:00Z'), 'America/Sao_Paulo'),
    '2026-06-30',
  );
  expectEqual(
    'dateKeyInTZ UTC 06:00 → SP 2026-06-30 (after midnight UTC-3)',
    dateKeyInTZ(new Date('2026-06-30T06:00:00Z'), 'America/Sao_Paulo'),
    '2026-06-30',
  );
  expectEqual(
    'dateKeyInTZ UTC 02:00 → SP 2026-06-29 (before midnight UTC-3)',
    dateKeyInTZ(new Date('2026-06-30T02:00:00Z'), 'America/Sao_Paulo'),
    '2026-06-29',
  );
  expectEqual(
    'dateKeyInTZ invalid TZ falls back to UTC',
    dateKeyInTZ(new Date('2026-06-30T00:00:00Z'), 'XXX/YYY'),
    '2026-06-30',
  );

  // ── §3 — recordCheckin happy paths + replace same-day ─────────────────
  section('§3 recordCheckin happy paths');
  setCheckinHmacSecret('test-secret');
  const u = asUserId('u1');
  const c1 = recordCheckin(u, {
    energyScore: 7,
    mood: 'joyful',
    spiritualState: 'Sinto Oxalá e a Cigana',
    timeZone: 'UTC',
    recordedAt: '2026-06-30T12:00:00Z',
    intention: 'Eu recebo a paz',
  });
  expectEqual('First recordCheckin isFirstWrite=true', c1.isFirstWrite, true);
  expectEqual('Energy bucket derived from score', c1.energyBucket, 'high');
  expectEqual('Mood persisted', c1.mood, 'joyful');
  expectEqual('Intention persisted', c1.intention, 'Eu recebo a paz');
  expectTrue('ID has chk_ prefix', c1.id.startsWith('chk_'));

  const c2 = recordCheckin(u, {
    energyScore: 3,
    mood: 'anxious',
    spiritualState: 'Mudou, agora ansioso',
    timeZone: 'UTC',
    recordedAt: '2026-06-30T20:00:00Z',
  });
  expectEqual('Replace same day isFirstWrite=false', c2.isFirstWrite, false);
  expectEqual('Replaced score is new value', c2.energyScore, 3);
  expectEqual('Replaced mood', c2.mood, 'anxious');
  expectEqual('Get returns most-recent', getCheckin(u, asDateKey('2026-06-30'))?.energyScore, 3);

  // ── §4 — recordCheckin validation throws ──────────────────────────────
  section('§4 recordCheckin validation');
  expectThrows('energyScore=11 throws', () => recordCheckin(u, { energyScore: 11, mood: 'calm', spiritualState: 'x' }), 'ValidationError');
  expectThrows('energyScore=0 throws', () => recordCheckin(u, { energyScore: 0, mood: 'calm', spiritualState: 'x' }), 'ValidationError');
  expectThrows(
    'Unknown mood throws',
    () => recordCheckin(u, { energyScore: 5, mood: 'angry' as unknown as 'calm', spiritualState: 'x' }),
    'ValidationError',
  );
  expectThrows(
    'SpiritualState >280 chars throws',
    () => recordCheckin(u, { energyScore: 5, mood: 'calm', spiritualState: 'x'.repeat(281) }),
    'ValidationError',
  );
  expectThrows(
    'Invalid TZ throws',
    () => recordCheckin(u, { energyScore: 5, mood: 'calm', spiritualState: 'x', timeZone: 'XXX' }),
    'ValidationError',
  );
  expectThrows(
    'Invalid recordedAt throws',
    () => recordCheckin(u, { energyScore: 5, mood: 'calm', spiritualState: 'x', recordedAt: 'garbage' }),
    'ValidationError',
  );
  expectThrows(
    'Long intention throws',
    () =>
      validatePayload({
        energyScore: 5,
        mood: 'calm',
        spiritualState: '',
        intention: 'x'.repeat(141),
      }),
    'ValidationError',
  );

  // ── §5 — getCheckin / getCheckins filter + paginate ──────────────────
  section('§5 read + filter + paginate');
  for (let day = 1; day <= 5; day++) {
    recordCheckin(u, {
      energyScore: 3 + day,
      mood: day % 2 === 0 ? 'joyful' : 'reflective',
      spiritualState: `day ${day}`,
      recordedAt: `2026-06-${10 + day}T12:00:00Z`,
      timeZone: 'UTC',
    });
  }
  recordCheckin(asUserId('u2'), {
    energyScore: 8,
    mood: 'inspired',
    spiritualState: 'other user',
    recordedAt: '2026-06-15T12:00:00Z',
    timeZone: 'UTC',
  });
  expectLen('getCheckins u1 returned 6', getCheckins(u), 6);
  expectLen('limit=2 returns 2', getCheckins(u, { limit: 2 }), 2);
  expectLen('offset=1 limit=2 returns 2', getCheckins(u, { limit: 2, offset: 1 }), 2);
  expectLen('offset>total returns 0', getCheckins(u, { limit: 10, offset: 1000 }), 0);
  expectLen('moodFilter joyful >=2', getCheckins(u, { moodFilter: 'joyful' }), 2);
  expectLen('moodFilter array ≥3', getCheckins(u, { moodFilter: ['reflective', 'inspired'] }), 3);
  expectLen('since 2026-06-15 = 2', getCheckins(u, { since: asDateKey('2026-06-15') }), 2);
  expectLen('until 2026-06-12 = 2', getCheckins(u, { until: asDateKey('2026-06-12') }), 2);
  expectLen('user isolation: u2 only theirs', getCheckins(asUserId('u2')), 1);

  // ── §6 — deleteCheckin + eraseAll + exportCheckins ────────────────────
  section('§6 delete + erase + export');
  const deleted = deleteCheckin(u, asDateKey('2026-06-30'));
  expectEqual('deleteCheckin returns deleted record id starts with chk_', deleted?.id.startsWith('chk_'), true);
  expectEqual('deleteCheckin 2nd call returns null', deleteCheckin(u, asDateKey('2026-06-30')), null);
  expectLen('after delete count drops by 1', getCheckins(u), 5);

  const erased = eraseAllCheckins(u);
  expectEqual('eraseAllCheckins counts deleted', erased, 5);
  expectLen('after erase u1 has 0', getCheckins(u), 0);
  expectLen('u2 unaffected', getCheckins(asUserId('u2')), 1);

  const exp = exportCheckins(asUserId('u2'));
  expectEqual('export schemaVersion', exp.schemaVersion, 1);
  expectEqual('export count', exp.count, 1);
  expectEqual('export contains u2 check-in', exp.checkins[0]?.mood, 'inspired');
  expectEqual('exportCheckins u1 → 0', exportCheckins(u).count, 0);
  expectNotEqual('export deterministic exportedAt', exp.exportedAt, new Date().toISOString());

  // ── §7 — Mood enum + helpers ───────────────────────────────────────────
  section('§7 Mood helpers');
  expectLen('MOODS has 10', MOODS, 10);
  expectLen('ENERGY_BUCKETS has 4', ENERGY_BUCKETS, 4);
  expectTrue('isMood joyful', isMood('joyful'));
  expectFalse('isMood angry', isMood('angry'));
  expectEqual('assertMood round-trips', assertMood('calm'), 'calm');
  expectThrows('assertMood rejects unknown', () => assertMood('zzz'));
  expectTrue('classifyBucket 1=low', classifyBucket(1) === 'low');
  expectTrue('classifyBucket 4=steady', classifyBucket(4) === 'steady');
  expectTrue('classifyBucket 9=peak', classifyBucket(9) === 'peak');
  expectTrue('isValidEnergyScore 5', isValidEnergyScore(5));
  expectFalse('isValidEnergyScore 11', isValidEnergyScore(11));
  expectFalse('isValidEnergyScore 5.5', isValidEnergyScore(5.5));
  expectMatches('ID format', generateCheckinId(u, asDateKey('2026-06-30')), /^chk_/);
  expectEqual(
    'different user+date IDs differ',
    generateCheckinId(asUserId('u1'), asDateKey('2026-06-30')) !==
      generateCheckinId(asUserId('u2'), asDateKey('2026-06-30')),
    true,
  );
  expectContains('MOODS contains joyful', MOODS, 'joyful');
  expectContains('MOODS contains restless', MOODS, 'restless');

  return report('checkin.spec', harnessResults());
}

// CLI entry — invoked by smoke runner or directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const code = runCheckinSpec();
  process.exit(code);
}
