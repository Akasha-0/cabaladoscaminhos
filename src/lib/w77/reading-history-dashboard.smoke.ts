/**
 * W77-D — Reading History Dashboard SMOKE
 * Sync check() pattern (W75 smoke style, no top-level await / async main).
 *
 * ≥20 checks covering the integration paths an ops engineer would run
 * by hand to verify the engine before deploy.
 *
 * Usage:  node --experimental-strip-types reading-history-dashboard.smoke.ts
 * Exit:   0 on full PASS, 1 on any FAIL.
 */

import {
  recordReading,
  getUserHistory,
  getUserHistoryPaginated,
  getTraditionDistribution,
  getPatternInsights,
  exportAudit,
  hashCacheKey,
  verifyReadingIntegrity,
  canonicalJson,
  sha256HexSync,
  sacredMatch,
  userId as mkUserId,
  SACRED_TRADITIONS,
  _resetForTest,
  _userBucketSize,
  _auditSize,
  type ReadingRecordInput,
  type UserId,
  type SacredTradition,
  type MesaRealHouseNumber,
} from './reading-history-dashboard.ts';

// @ts-ignore — node-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };

// ─── Harness ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function check(label: string, cond: boolean, detail?: string): void {
  if (cond) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    const msg = detail ? `${label} :: ${detail}` : label;
    console.log(`  ❌ ${msg}`);
  }
}

function expectThrow(label: string, fn: () => unknown, pattern: RegExp): void {
  try {
    fn();
    failed++;
    console.log(`  ❌ ${label} :: did not throw`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (pattern.test(msg)) {
      passed++;
      console.log(`  ✅ ${label}`);
    } else {
      failed++;
      console.log(`  ❌ ${label} :: wrong error: ${msg}`);
    }
  }
}

// ─── SMOKE 1: Engine boots clean ────────────────────────────────────────────

console.log('\n═══ W77-D Reading History Dashboard — SMOKE ═══\n');
console.log('▸ Smoke 1: Engine boots clean');

_resetForTest();
check('engine starts with empty audit', _auditSize() === 0);
check('engine starts with empty buckets', _userBucketSize(mkUserId('u_alice_smoke')) === 0);

// ─── SMOKE 2: All 7 traditions accepted ─────────────────────────────────────

console.log('\n▸ Smoke 2: All 7 sacred traditions accepted');

_resetForTest();
const alice = mkUserId('u_alice_smoke');
for (const t of SACRED_TRADITIONS) {
  recordReading({
    userId: alice,
    timestamp: '2026-06-15T10:00:00Z',
    mesaRealHouseNumber: 1,
    topic: 'espiritualidade',
    traditionsUsed: [t],
  });
}
check('all 7 traditions record without throwing', _userBucketSize(alice) === 7);

// ─── SMOKE 3: All 12 houses accepted ─────────────────────────────────────────

console.log('\n▸ Smoke 3: All 12 Mesa Real houses accepted');

_resetForTest();
for (let h = 1; h <= 12; h++) {
  const id = recordReading({
    userId: mkUserId('u_alice_smoke'),
    timestamp: '2026-06-15T10:00:00Z',
    mesaRealHouseNumber: h as MesaRealHouseNumber,
    topic: 'trabalho',
    traditionsUsed: ['Cigano'],
  });
  check(`house ${h} records OK`, id.startsWith('r_'));
}
check('12 readings recorded', _userBucketSize(mkUserId('u_alice_smoke')) === 12);

// ─── SMOKE 4: Validation rejects bad data ───────────────────────────────────

console.log('\n▸ Smoke 4: Validation rejects bad data');

expectThrow('rejects invalid timestamp format',
  () => recordReading({
    userId: mkUserId('u_alice_smoke'),
    timestamp: 'not-a-date',
    mesaRealHouseNumber: 1,
    topic: 'trabalho',
    traditionsUsed: ['Cigano'],
  }), /timestamp/);

expectThrow('rejects out-of-range house',
  () => recordReading({
    userId: mkUserId('u_alice_smoke'),
    timestamp: '2026-06-15T10:00:00Z',
    mesaRealHouseNumber: 99 as MesaRealHouseNumber,
    topic: 'trabalho',
    traditionsUsed: ['Cigano'],
  }), /out of range/);

expectThrow('rejects non-existent topic',
  () => recordReading({
    userId: mkUserId('u_alice_smoke'),
    timestamp: '2026-06-15T10:00:00Z',
    mesaRealHouseNumber: 1,
    topic: 'lottery' as unknown as 'trabalho',
    traditionsUsed: ['Cigano'],
  }), /unknown topic/);

expectThrow('rejects reflection > 500 chars',
  () => recordReading({
    userId: mkUserId('u_alice_smoke'),
    timestamp: '2026-06-15T10:00:00Z',
    mesaRealHouseNumber: 1,
    topic: 'trabalho',
    traditionsUsed: ['Cigano'],
    userReflection: 'x'.repeat(501),
  }), /500 chars/);

// ─── SMOKE 5: Cache key + integrity ──────────────────────────────────────────

console.log('\n▸ Smoke 5: hashCacheKey + verifyReadingIntegrity');

_resetForTest();
const cacheInput: ReadingRecordInput = {
  userId: mkUserId('u_alice_smoke'),
  timestamp: '2026-06-15T10:00:00Z',
  mesaRealHouseNumber: 1,
  topic: 'trabalho',
  traditionsUsed: ['Cigano', 'Astrologia'],
};
const key1 = hashCacheKey(cacheInput);
const key2 = hashCacheKey(cacheInput);
check('hashCacheKey is deterministic', key1 === key2);
check('hashCacheKey returns 64 hex chars', /^[0-9a-f]{64}$/.test(key1));

recordReading(cacheInput);
const audit = exportAudit();
check('verifyReadingIntegrity passes for record', verifyReadingIntegrity(audit[0]!));

// ─── SMOKE 6: Distribution sums to 100% ──────────────────────────────────────

console.log('\n▸ Smoke 6: Tradition distribution');

_resetForTest();
const alice6 = mkUserId('u_alice_smoke');
const trads: SacredTradition[] = ['Cigano', 'Cigano', 'Cigano', 'Astrologia', 'Astrologia', 'Cabala'];
for (let i = 0; i < trads.length; i++) {
  recordReading({
    userId: alice6,
    timestamp: `2026-06-${(i + 1).toString().padStart(2, '0')}T10:00:00Z`,
    mesaRealHouseNumber: 1,
    topic: 'trabalho',
    traditionsUsed: [trads[i]!],
  });
}
const dist = getTraditionDistribution(alice6);
const cig = dist.find((d) => d.tradition === 'Cigano')!;
const ast = dist.find((d) => d.tradition === 'Astrologia')!;
const cab = dist.find((d) => d.tradition === 'Cabala')!;
check('Cigano 50%', cig.pct === 50);
check('Astrologia 33.3%', Math.abs(ast.pct - 33.3) < 0.1);
check('Cabala 16.7%', Math.abs(cab.pct - 16.7) < 0.1);
const total = dist.reduce((a, d) => a + d.pct, 0);
check('percentages sum to ~100', Math.abs(total - 100) < 0.5);

// ─── SMOKE 7: Pagination boundaries ─────────────────────────────────────────

console.log('\n▸ Smoke 7: Pagination');

_resetForTest();
const alice7 = mkUserId('u_alice_smoke');
for (let i = 0; i < 25; i++) {
  recordReading({
    userId: alice7,
    timestamp: `2026-06-${(i + 1).toString().padStart(2, '0')}T10:00:00Z`,
    mesaRealHouseNumber: 1,
    topic: 'trabalho',
    traditionsUsed: ['Cigano'],
  });
}
const paged = getUserHistoryPaginated(alice7, { page: 2, pageSize: 10 });
check('page 2 has 10 records', paged.records.length === 10);
check('total is 25', paged.total === 25);
check('totalPages is 3', paged.totalPages === 3);

const maxPage = getUserHistoryPaginated(alice7, { page: 999, pageSize: 10 });
check('out-of-range page returns empty', maxPage.records.length === 0);

// ─── SMOKE 8: Pattern insights fire correctly ───────────────────────────────

console.log('\n▸ Smoke 8: Pattern insights');

_resetForTest();
const alice8 = mkUserId('u_alice_smoke');
const trads8: SacredTradition[] = ['Cigano', 'Astrologia', 'Cabala', 'Tantra'];
for (let i = 0; i < trads8.length; i++) {
  recordReading({
    userId: alice8,
    timestamp: `2026-06-${(i + 1).toString().padStart(2, '0')}T10:00:00Z`,
    mesaRealHouseNumber: 10,
    topic: 'trabalho',
    traditionsUsed: [trads8[i]!],
  });
}
const insights8 = getPatternInsights(alice8);
const md = insights8.find((i) => i.kind === 'multidimensional-approach');
check('multidimensional-approach fires (4 traditions on trabalho)', md !== undefined);
check('multidimensional insight mentions trabalho', md?.description.toLowerCase().includes('trabalho') ?? false);

// ─── SMOKE 9: Sacred regex Unicode correctness ──────────────────────────────

console.log('\n▸ Smoke 9: Sacred regex Unicode');

check('Ogum matches with word boundary', sacredMatch('Ogum abre', 'Ogum'));
check('Ogumância does NOT match Ogum', !sacredMatch('Ogumância', 'Ogum'));
check('Oxalá matches with accent', sacredMatch('Oxalá rege', 'Oxalá'));
check('Oxalácio does NOT match Oxalá', !sacredMatch('Oxalácio', 'Oxalá'));
check('Yalorixá matches', sacredMatch('A Yalorixá falou', 'Yalorixá'));

// ─── SMOKE 10: 7-tradition balance insight ───────────────────────────────────

console.log('\n▸ Smoke 10: 7-tradition balance');

_resetForTest();
const alice10 = mkUserId('u_alice_smoke');
for (const t of SACRED_TRADITIONS) {
  recordReading({
    userId: alice10,
    timestamp: `2026-06-15T10:00:00Z`,
    mesaRealHouseNumber: 1,
    topic: 'espiritualidade',
    traditionsUsed: [t],
  });
}
const insights10 = getPatternInsights(alice10);
const tb = insights10.find((i) => i.kind === 'tradition-balance');
check('tradition-balance fires when all 7 used', tb !== undefined);
check('tradition-balance mentions all 7',
  ((tb?.description.includes('Candomblé') &&
    tb?.description.includes('Umbanda') &&
    tb?.description.includes('Ifá') &&
    tb?.description.includes('Cabala') &&
    tb?.description.includes('Astrologia') &&
    tb?.description.includes('Tantra') &&
    tb?.description.includes('Cigano')) ?? false));

// ─── DONE ──────────────────────────────────────────────────────────────────

console.log(`\n═══════════════════════════════════════════════════════════════════`);
console.log(`  Smoke result: ${passed} passed, ${failed} failed`);
console.log(`═══════════════════════════════════════════════════════════════════`);
if (failed > 0) process.exit(1);
process.exit(0);
