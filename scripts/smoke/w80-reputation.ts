/**
 * ════════════════════════════════════════════════════════════════════════════
 * W80-A — UNIVERSALIST REPUTATION ENGINE · SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Inline checks that mirror production engine logic — no vitest/jest import.
 * Run with: node --experimental-strip-types scripts/smoke/w80-reputation.ts
 *
 * Cycle 73 lesson: smoke covers edge cases that the formal spec alone doesn't.
 * ≥30 inline assertions.
 */

// @ts-ignore — node-stubs.d.ts provides globals.
import {
  recordAction,
  registerUser,
  listCatalog,
  listTraditions,
  listBadges,
  exportUserProfile,
  exportLeaderboard,
  userLevel,
  grantBadge,
  undoAction,
  hashCacheKey,
  sha256HexSync,
  canonicalJson,
  tierForMerit,
  isTraditionId,
  TRADITION_IDS,
  TRADITION_META,
  TIER_ORDER,
  TIER_THRESHOLDS,
  W80_A_VERSION,
  W80_A_CYCLE,
  W80_A_TRADITIONS_COVERED,
  W80_A_ACTIONS_SHIPPED,
  W80_A_BADGES_SHIPPED,
  W80_A_TIERS_SHIPPED,
  _resetForTests,
  _countUsersForTests,
  _catalogSizeForTests,
  _badgesSizeForTests,
  userId,
  actionId,
  badgeId,
  type SacredAction,
  type TraditionMeta,
} from '../../src/lib/w80/reputation-engine.ts';

declare const process: { exit(code: number): never };

let passes = 0;
let fails = 0;

function check(label: string, cond: boolean): void {
  if (cond) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    fails++;
    console.log(`  ✗ ${label}`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SMOKE TESTS
// ════════════════════════════════════════════════════════════════════════════

console.log('W80-A Reputation Engine — Smoke Harness\n');

// Section 1 — Branded primitives & factories
_resetForTests();
check('userId("u_abc_001") validates', (() => { try { userId('u_abc_001'); return true; } catch { return false; } })());
check('userId("badprefix") rejects', (() => { try { userId('bad_abc_001'); return false; } catch { return true; } })());
check('userId("u_sh") rejects (too short)', (() => { try { userId('u_sh'); return false; } catch { return true; } })());
check('actionId("act_z_001") validates', (() => { try { actionId('act_z_001'); return true; } catch { return false; } })());
check('actionId("invalid") rejects', (() => { try { actionId('invalid'); return false; } catch { return true; } })());
check('badgeId("bdg_x_001") validates', (() => { try { badgeId('bdg_x_001'); return true; } catch { return false; } })());

// Section 2 — Tier math
check('tierForMerit(0) = INICIANTE', tierForMerit(0) === 'INICIANTE');
check('tierForMerit(100) = PRATICANTE', tierForMerit(100) === 'PRATICANTE');
check('tierForMerit(500) = MESTRE', tierForMerit(500) === 'MESTRE');
check('tierForMerit(2000) = SABIO', tierForMerit(2000) === 'SABIO');
check('TIER_THRESHOLDS has 4 entries', TIER_THRESHOLDS.length === 4);
check('TIER_ORDER has 4 tiers', TIER_ORDER.length === 4);
check('W80_A_TIERS_SHIPPED = 4', W80_A_TIERS_SHIPPED === 4);

// Section 3 — Tradition meta & catalog
const ts: readonly TraditionMeta[] = listTraditions();
check('TRADITION_IDS has 7 entries', TRADITION_IDS.length === 7);
check('listTraditions returns 7', ts.length === 7);
check('CANDOMBLE displayName = Candomblé', TRADITION_META.CANDOMBLE.displayName === 'Candomblé');
check('CIGANO displayName = Cigano', TRADITION_META.CIGANO.displayName === 'Cigano');
check('TANTRA lineage = Indiana', TRADITION_META.TANTRA.lineage === 'Indiana');
check('CANDOMBLE lineage = Afro-Brasileira', TRADITION_META.CANDOMBLE.lineage === 'Afro-Brasileira');
check('W80_A_TRADITIONS_COVERED = 7', W80_A_TRADITIONS_COVERED === 7);

// Section 4 — Catalog properties
const cat = listCatalog();
check('W80_A_ACTIONS_SHIPPED = 49', W80_A_ACTIONS_SHIPPED === 49);
check('_catalogSizeForTests = 49', _catalogSizeForTests() === 49);
check('Catalog action count matches', cat.length === 49);

// Per-tradition coverage ≥ 7
const counts = new Map<string, number>();
for (const a of cat) counts.set(a.tradition, (counts.get(a.tradition) ?? 0) + 1);
for (const t of TRADITION_IDS) {
  check(`Tradition ${t} has ≥7 actions`, (counts.get(t) ?? 0) >= 7);
}

// Section 5 — Action properties
let sumPoints = 0;
let cooldowned = 0;
for (const a of cat) {
  sumPoints += a.meritPoints;
  if (a.cooldownSeconds > 0) cooldowned++;
}
check('Sum of all action merit is > 1000 (long-tail)', sumPoints > 1000);
check(`At least 5 cooldowned actions (got ${cooldowned})`, cooldowned >= 5);
check('Catalog is frozen', Object.isFrozen(cat));
const first: SacredAction = cat[0]!;
check('First catalog item frozen', Object.isFrozen(first));

// Section 6 — recordAction + cooldown + tier promotion
_resetForTests();
const U = userId('u_smoke_001');
registerUser(U, 'Smoke User', 1700000000000);

let r = recordAction({
  userId: U,
  actionId: actionId('act_cigano_001'),
  nowMs: 1700000010000,
});
check('First action returns ok', r.kind === 'ok');
if (r.kind === 'ok') check('Merit after = 30', r.value.meritAfter === 30);

// Cooldown test — use act_candomble_001 (cooldownSeconds = 86400)
r = recordAction({
  userId: U,
  actionId: actionId('act_candomble_001'),
  nowMs: 1700000010100,
});
check('First cooldowned action ok', r.kind === 'ok');
r = recordAction({
  userId: U,
  actionId: actionId('act_candomble_001'),
  nowMs: 1700000010500, // 5s later, < 86400 cooldown
});
check('Cooldown blocks repeat', r.kind === 'err');
if (r.kind === 'err') check('Cooldown error code', r.code === 'COOLDOWN_ACTIVE');

// Unknown user
const ghost = userId('u_ghost_smoke');
r = recordAction({
  userId: ghost,
  actionId: actionId('act_cigano_001'),
});
check('Unknown user → err', r.kind === 'err');
if (r.kind === 'err') check('UNKNOWN_USER code', r.code === 'UNKNOWN_USER');

// Section 7 — Promotion across 100 merit (overall)
const V = userId('u_smoke_002');
registerUser(V, 'Voter', 1700000000000);

const acts: [string, number][] = [
  ['act_cigano_001', 1700000100000], // 30
  ['act_umbanda_004', 1700000100100], // 22 → 52
  ['act_ifa_005', 1700000100200], // 40 → 92
  ['act_cabala_002', 1700000100300], // 8 → 100
];
for (const [a, t] of acts) {
  const rr = recordAction({ userId: V, actionId: actionId(a), nowMs: t });
  if (rr.kind !== 'ok') break;
}
check('userLevel(V) overall = PRATICANTE', userLevel(V) === 'PRATICANTE');

// Section 8 — SHA-256 + cache key
check('sha256HexSync output is 64 hex chars', /^[0-9a-f]{64}$/.test(sha256HexSync('Akasha')));
const k = hashCacheKey({ user: V, action: 'cigano' });
check('hashCacheKey starts with w80a:', k.startsWith('w80a:'));
check('hashCacheKey tail is 32 hex chars', /^[0-9a-f]{32}$/.test(k.slice(5)));

// Section 9 — version constants
check('W80_A_VERSION = 1.0.0', W80_A_VERSION === '1.0.0');
check('W80_A_CYCLE = 80', W80_A_CYCLE === 80);
check('W80_A_BADGES_SHIPPED >= 20', W80_A_BADGES_SHIPPED >= 20);
check('_badgesSizeForTests matches W80_A_BADGES_SHIPPED', _badgesSizeForTests() === W80_A_BADGES_SHIPPED);

// Section 10 — Leaderboard + profile
_resetForTests();
const W = userId('u_smoke_003');
registerUser(W, 'Worker', 1700000000000);
recordAction({ userId: W, actionId: actionId('act_cigano_001'), nowMs: 1700000200000 });
const lb = exportLeaderboard(5);
check('Leaderboard returns one entry', lb.length === 1);
check('Leaderboard entry frozen', Object.isFrozen(lb[0]!));
check('Leaderboard rank 1 = Worker', lb[0]!.userId === W);
check('Leaderboard rank value', lb[0]!.rank === 1);

const prof = exportUserProfile(W);
check('Profile is ok', prof.kind === 'ok');
if (prof.kind === 'ok') {
  check('Profile userId match', prof.value.userId === W);
  check('Profile overall merit 30', prof.value.overallMerit === 30);
  check('Profile frozen', Object.isFrozen(prof.value));
}

// Section 11 — Undo
recordAction({ userId: W, actionId: actionId('act_cigano_006'), nowMs: 1700000210000 });
const pBefore = exportUserProfile(W);
if (pBefore.kind === 'ok') {
  check('Profile pre-undo overallMerit = 34', pBefore.value.overallMerit === 34);
}
const undo = undoAction(W, actionId('act_cigano_006'), 1700000220000);
check('Undo returns ok', undo.kind === 'ok');
const pAfter = exportUserProfile(W);
if (pAfter.kind === 'ok') {
  check('Profile post-undo overallMerit = 30', pAfter.value.overallMerit === 30);
}

// Section 12 — Badges list
const bs = listBadges();
check('listBadges returns ≥20 badges', bs.length >= 20);
check('Badges list frozen', Object.isFrozen(bs));

console.log(`\nW80-A Reputation Engine — Smoke Summary`);
console.log(`Pass: ${passes} / Fail: ${fails} / Total: ${passes + fails}`);
if (fails > 0) {
  process.exit(1);
}
process.exit(0);
