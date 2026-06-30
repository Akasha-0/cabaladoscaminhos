// achievements-badges.smoke.ts
// Sync smoke harness — fast sanity checks, no spec registry.
// Cycle 60+ pattern: check(label, cond) + expectThrow(label, fn, pattern).

import {
  TRADITIONS,
  HIERARCHY_LEVELS,
  SACRED_ACTIONS,
  isTradition,
  isVanityAction,
  hierarchyAtLeast,
  badgeId,
  userId,
  registerBadge,
  getBadge,
  listBadges,
  listBadgesByTradition,
  awardBadge,
  revokeBadge,
  listEarnedBadges,
  checkEarnedBadges,
  isTraditionRespected,
  isVanityMetric,
  blocksSacredPractice,
  listTopUsersByBadgeCount,
  rankUsersByXp,
  getGlobalUserLevel,
  getUserXp,
  seedCatalog,
  _resetAuditForTests,
  type Badge,
  type UserState,
  type SacredAction,
  type AwardContext,
  type Tradition,
  type HierarchyLevel,
} from './achievements-badges.ts';

import { sha256Hex, canonicalJson } from './achievements-badges.hash.ts';

// ============================================================================
// Sync smoke harness
// ============================================================================

let _passed = 0;
let _failed = 0;
const _failures: string[] = [];

function check(label: string, cond: boolean): void {
  if (cond) {
    _passed++;
    console.log(`  ✓  ${label}`);
  } else {
    _failed++;
    _failures.push(label);
    console.log(`  ✗  ${label}`);
  }
}

function expectThrow(label: string, fn: () => unknown, pattern: RegExp | string): void {
  let thrown: unknown = null;
  try {
    fn();
  } catch (e) {
    thrown = e;
  }
  if (thrown === null) {
    _failed++;
    _failures.push(label + ' (no throw)');
    console.log(`  ✗  ${label} (no throw)`);
    return;
  }
  const msg = (thrown as Error).message;
  const match = typeof pattern === 'string' ? msg.includes(pattern) : pattern.test(msg);
  if (!match) {
    _failed++;
    _failures.push(label + ' (message)');
    console.log(`  ✗  ${label} (message did not match, got: ${msg})`);
    return;
  }
  _passed++;
  console.log(`  ✓  ${label}`);
}

// ============================================================================
// Fixtures
// ============================================================================

function makeUser(id: string, tradition: Tradition, hierarchy: HierarchyLevel = 'cigano'): UserState {
  return Object.freeze({
    id: userId(id),
    knownTraditions: Object.freeze([tradition]),
    currentHierarchyLevel: hierarchy,
  });
}

function makeAction(
  type: SacredAction['type'],
  tradition: Tradition,
  hierarchy: HierarchyLevel = 'cigano',
  durationMinutes = 30,
): SacredAction {
  return Object.freeze({
    type,
    intent: 'genuine',
    tradition,
    hierarchy,
    intention: 'estudo sério',
    durationMinutes,
    witness: 'mestre',
    occurredAt: new Date('2026-06-30T06:00:00Z').toISOString(),
  });
}

function makeContext(user: UserState, action: SacredAction): AwardContext {
  return Object.freeze({ user, action, intentionHonest: true, witnessed: true });
}

// ============================================================================
// Smoke checks
// ============================================================================

console.log('=== Smoke: Branded types ===');
check('badgeId accepts valid', badgeId('b_test_xyz') === 'b_test_xyz');
expectThrow('badgeId rejects malformed', () => badgeId('xyz'), /invalid format/);
check('userId accepts valid', userId('u_test_xyz') === 'u_test_xyz');
expectThrow('userId rejects malformed', () => userId('user123'), /invalid format/);

console.log('=== Smoke: Traditions & hierarchy ===');
check('TRADITIONS has 7', TRADITIONS.length === 7);
check('all 7 traditions present',
  TRADITIONS.includes('candomble') &&
  TRADITIONS.includes('umbanda') &&
  TRADITIONS.includes('ifa') &&
  TRADITIONS.includes('cabala') &&
  TRADITIONS.includes('astrologia') &&
  TRADITIONS.includes('tantra') &&
  TRADITIONS.includes('cigano_ramiro'),
);
check('isTradition validates', isTradition('candomble') && !isTradition('budismo'));
check('HIERARCHY_LEVELS has 4', HIERARCHY_LEVELS.length === 4);
check('hierarchyAtLeast ordering',
  hierarchyAtLeast('mestre', 'cigano') &&
  hierarchyAtLeast('cigano', 'cigano') &&
  !hierarchyAtLeast('cigano', 'orixa'),
);

console.log('=== Smoke: Vanity detection ===');
check('SACRED_ACTIONS excludes login_streak', !(SACRED_ACTIONS as ReadonlyArray<string>).includes('login_streak'));
check('isVanityAction detects streaks', isVanityAction('login_streak') && isVanityAction('post_count'));
check('isVanityAction ignores sacred', !isVanityAction('consulta_realizada'));

console.log('=== Smoke: Hash ===');
check('sha256 empty is canonical',
  sha256Hex('') === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
);
check('sha256 abc is canonical',
  sha256Hex('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
);
check('canonicalJson sorts keys', canonicalJson({ b: 1, a: 2 }) === canonicalJson({ a: 2, b: 1 }));

console.log('=== Smoke: Catalog ===');
_resetAuditForTests();
seedCatalog();
const allBadges = listBadges();
check('catalog has ≥37 badges', allBadges.length >= 37);
check('catalog has ≥3 per tradition',
  TRADITIONS.every((t) => listBadgesByTradition(t).length >= 3),
);
check('catalog has 4 hierarchy levels covered',
  HIERARCHY_LEVELS.every((h) => listBadges({ hierarchy: h }).length >= 1),
);
check('every badge has tradition field',
  allBadges.every((b) => typeof b.tradition === 'string'),
);
check('every badge has hierarchy field',
  allBadges.every((b) => typeof b.hierarchy === 'string'),
);
check('every badge has respectNote ≥20 chars',
  allBadges.every((b) => b.respectNote.length >= 20),
);
check('every badge isTraditionRespected',
  allBadges.every((b) => isTraditionRespected(b)),
);
check('no badge is vanity',
  allBadges.every((b) => !isVanityMetric(b)),
);

console.log('=== Smoke: Registration guards ===');
_resetAuditForTests();
{
  const r = registerBadge({
    id: badgeId('b_smoke_streak'),
    name: 'Smoke Streak',
    description: 'test',
    tradition: 'cigano_ramiro',
    hierarchy: 'cigano',
    respectNote: 'nota válida com pelo menos vinte caracteres',
    action: 'consulta_realizada',
    requires: [],
    minDurationMinutes: 1,
    crossTradition: true,
    blocksSacredPractice: false,
    isVanity: true,
  });
  check('register rejects vanity flag', !r.ok && r.error.code === 'vanity_metric');
}
{
  seedCatalog();
  const r = registerBadge({
    id: badgeId('b_primeira_carta'),
    name: 'Dup Test',
    description: 'test',
    tradition: 'cigano_ramiro',
    hierarchy: 'cigano',
    respectNote: 'nota válida com pelo menos vinte caracteres',
    action: 'cigano_puxado',
    requires: [],
    minDurationMinutes: 1,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  check('register rejects duplicate', !r.ok && r.error.code === 'duplicate_id');
}
{
  const r = registerBadge({
    id: badgeId('b_short_note'),
    name: 'Short Note',
    description: 'test',
    tradition: 'cigano_ramiro',
    hierarchy: 'cigano',
    respectNote: 'curto',
    action: 'cigano_puxado',
    requires: [],
    minDurationMinutes: 1,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  check('register rejects short respectNote', !r.ok && r.error.code === 'no_respect_note');
}

console.log('=== Smoke: getBadge / list ===');
_resetAuditForTests();
seedCatalog();
check('getBadge returns some for valid', getBadge(badgeId('b_primeira_carta')).some === true);
check('getBadge returns none for missing', getBadge(badgeId('b_inexistente_xx')).some === false);
check('listBadgesByTradition(candomble) ≥3', listBadgesByTradition('candomble').length >= 3);
check('listBadgesByTradition(ifa) ≥3', listBadgesByTradition('ifa').length >= 3);
check('listBadgesByTradition(cabala) ≥3', listBadgesByTradition('cabala').length >= 3);

console.log('=== Smoke: Award happy path ===');
_resetAuditForTests();
seedCatalog();
{
  const user = makeUser('u_smoke_cigana', 'cigano_ramiro', 'cigano');
  const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', 20);
  const r = awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action));
  check('award succeeded', r.status === 'awarded');
  check('award has awardId', typeof r.awardId === 'string');
  check('award has hash', typeof r.hash === 'string' && r.hash.length === 64);
  check('listEarnedBadges has 1', listEarnedBadges(user.id).length === 1);
}

console.log('=== Smoke: Award rejections ===');
{
  const user = makeUser('u_smoke_reject', 'cigano_ramiro', 'cigano');
  // extractive intent
  const action1 = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', 20);
  const ctx1 = Object.freeze({ ...makeContext(user, action1), action: Object.freeze({ ...action1, intent: 'extractive' as const }) });
  const r1 = awardBadge(user, badgeId('b_primeira_carta'), ctx1);
  check('rejects extractive intent', r1.status === 'rejected');

  // insufficient duration
  const action2 = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', 1);
  const r2 = awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action2));
  check('rejects insufficient duration', r2.status === 'rejected');

  // unwitnessed
  const action3 = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', 20);
  const ctx3 = Object.freeze({ ...makeContext(user, action3), witnessed: false });
  const r3 = awardBadge(user, badgeId('b_primeira_carta'), ctx3);
  check('rejects unwitnessed', r3.status === 'rejected');

  // dishonest intention
  const action4 = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', 20);
  const ctx4 = Object.freeze({ ...makeContext(user, action4), intentionHonest: false });
  const r4 = awardBadge(user, badgeId('b_primeira_carta'), ctx4);
  check('rejects dishonest', r4.status === 'rejected');

  // hierarchy too low
  const userLow = makeUser('u_smoke_low', 'cigano_ramiro', 'cigano');
  const action5 = makeAction('meditacao_completa', 'tantra', 'mestre', 120);
  const r5 = awardBadge(userLow, badgeId('b_kundalini_desperta'), makeContext(userLow, action5));
  check('rejects hierarchy insufficient', r5.status === 'rejected');

  // already earned
  const action6 = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', 20);
  const userWin = makeUser('u_smoke_win', 'cigano_ramiro', 'cigano');
  const a1 = awardBadge(userWin, badgeId('b_primeira_carta'), makeContext(userWin, action6));
  const a2 = awardBadge(userWin, badgeId('b_primeira_carta'), makeContext(userWin, action6));
  check('first award ok', a1.status === 'awarded');
  check('second award rejected', a2.status === 'rejected');
}

console.log('=== Smoke: Revoke ===');
_resetAuditForTests();
seedCatalog();
{
  const user = makeUser('u_smoke_revoke', 'cigano_ramiro', 'cigano');
  const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', 20);
  awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action));
  check('badge earned', listEarnedBadges(user.id).length === 1);
  const r = revokeBadge(user.id, badgeId('b_primeira_carta'), 'user_request');
  check('revoke ok', r.status === 'revoked');
  check('badge removed', listEarnedBadges(user.id).length === 0);
}

console.log('=== Smoke: checkEarnedBadges (no award) ===');
_resetAuditForTests();
seedCatalog();
{
  const user = makeUser('u_smoke_check', 'cigano_ramiro', 'cigano');
  const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', 20);
  const candidates = checkEarnedBadges(user, action);
  check('check returns ≥1 candidate', candidates.length >= 1);
  check('check does not award', listEarnedBadges(user.id).length === 0);
}

console.log('=== Smoke: Anti-pattern API ===');
expectThrow('listTopUsersByBadgeCount throws', () => listTopUsersByBadgeCount(10), /Vanity metric rejected by design/);
expectThrow('rankUsersByXp throws', () => rankUsersByXp(10), /Vanity metric rejected by design/);
expectThrow('getGlobalUserLevel throws', () => getGlobalUserLevel(userId('u_test')), /Vanity metric rejected by design/);
expectThrow('getUserXp throws', () => getUserXp(userId('u_test')), /Vanity metric rejected by design/);

console.log('=== Smoke: Cross-tradition ===');
_resetAuditForTests();
seedCatalog();
{
  // Cabala badge (crossTradition=true) earned by Candomblé user with mestre hierarchy
  const user = makeUser('u_smoke_cross', 'candomble', 'mestre');
  const action = makeAction('leitura_concluida', 'cabala', 'mestre', 90);
  const r = awardBadge(user, badgeId('b_arvore_vida_mapeada'), makeContext(user, action));
  check('cross-tradition awarded', r.status === 'awarded');

  // Candomblé badge (crossTradition=false) by Cabala user
  const user2 = makeUser('u_smoke_nocross', 'cabala', 'mestre');
  const action2 = makeAction('oferenda_feita', 'candomble', 'orixa', 120);
  const r2 = awardBadge(user2, badgeId('b_orixa_recebido'), makeContext(user2, action2));
  check('non-cross rejected for other tradition', r2.status === 'rejected');
}

console.log('=== Smoke: 7-tradition coverage ===');
_resetAuditForTests();
seedCatalog();
{
  const counts: Record<Tradition, number> = {
    candomble: 0, umbanda: 0, ifa: 0, cabala: 0,
    astrologia: 0, tantra: 0, cigano_ramiro: 0,
  };
  for (const b of listBadges()) counts[b.tradition]++;
  check('Candomblé ≥3', counts.candomble >= 3);
  check('Umbanda ≥3', counts.umbanda >= 3);
  check('Ifá ≥3', counts.ifa >= 3);
  check('Cabala ≥3', counts.cabala >= 3);
  check('Astrologia ≥3', counts.astrologia >= 3);
  check('Tantra ≥3', counts.tantra >= 3);
  check('Cigano Ramiro ≥3', counts.cigano_ramiro >= 3);
}

console.log('=== Smoke: Frozen output ===');
_resetAuditForTests();
seedCatalog();
{
  const list = listBadges();
  check('list is frozen', Object.isFrozen(list));
  const b = getBadge(badgeId('b_primeira_carta'));
  if (b.some) check('badge is frozen', Object.isFrozen(b.value));
  const user = makeUser('u_smoke_freeze', 'cigano_ramiro', 'cigano');
  const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', 20);
  awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action));
  const earned = listEarnedBadges(user.id);
  if (earned.length >= 1) check('EarnedBadge is frozen', Object.isFrozen(earned[0]));
}

console.log('=== Smoke: blocksSacredPractice ===');
{
  const b = getBadge(badgeId('b_primeira_carta'));
  if (b.some) check('primeira_carta does not block practice', !blocksSacredPractice(b.value));
}

// ============================================================================
// Summary
// ============================================================================

console.log('');
console.log(`Smoke: ${_passed} passed, ${_failed} failed, ${_passed + _failed} total`);
if (_failed > 0) {
  console.log('');
  console.log('--- Failures ---');
  for (const f of _failures) console.log('  ' + f);
  process.exit(1);
}
process.exit(0);