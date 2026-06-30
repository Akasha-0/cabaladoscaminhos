// achievements-badges.spec.ts
// Self-running spec — NO vitest framework at runtime (cycle 73 lesson).
// Pattern: it() registry that collects tests, runs them at the end, exits 0/1.

import {
  TRADITIONS,
  HIERARCHY_LEVELS,
  SACRED_ACTIONS,
  VANITY_ACTION_SIGNATURES,
  isTradition,
  isVanityAction,
  hierarchyRank,
  hierarchyAtLeast,
  badgeId,
  userId,
  awardId,
  registerBadge,
  getBadge,
  listBadges,
  listBadgesByTradition,
  awardBadge,
  revokeBadge,
  listEarnedBadges,
  checkEarnedBadges,
  isTraditionRespected,
  getBadgeHierarchyLevel,
  isVanityMetric,
  blocksSacredPractice,
  listTopUsersByBadgeCount,
  rankUsersByXp,
  getGlobalUserLevel,
  getUserXp,
  seedCatalog,
  exportAudit,
  _resetAuditForTests,
  some,
  none,
  ok,
  err,
  type Badge,
  type BadgeId,
  type UserId,
  type Tradition,
  type HierarchyLevel,
  type SacredAction,
  type UserState,
  type AwardContext,
} from './achievements-badges.ts';

import { sha256Hex, sha256HexSync, canonicalJson, hashCanonical } from './achievements-badges.hash.ts';

// ============================================================================
// Self-running test harness (cycle 60-77 pattern)
// ============================================================================

interface TestEntry {
  readonly name: string;
  readonly fn: () => void | Promise<void>;
}

const _tests: TestEntry[] = [];
let _describeName = '';

export function describe(name: string, fn: () => void): void {
  const prev = _describeName;
  _describeName = prev ? prev + ' > ' + name : name;
  try {
    fn();
  } finally {
    _describeName = prev;
  }
}

export function it(name: string, fn: () => void | Promise<void>): void {
  const fullName = _describeName ? _describeName + ' > ' + name : name;
  _tests.push({ name: fullName, fn });
}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (!Object.is(actual, expected)) {
    const msg = `FAIL: ${label}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`;
    throw new Error(msg);
  }
}

function expectTrue(cond: boolean, label: string): void {
  if (!cond) {
    throw new Error(`FAIL: ${label} (expected true, got false)`);
  }
}

function expectFalse(cond: boolean, label: string): void {
  if (cond) {
    throw new Error(`FAIL: ${label} (expected false, got true)`);
  }
}

function expectThrows(fn: () => unknown, pattern: RegExp | string, label: string): void {
  let thrown: unknown = null;
  try {
    fn();
  } catch (e) {
    thrown = e;
  }
  if (thrown === null) {
    throw new Error(`FAIL: ${label} (expected throw, got none)`);
  }
  const msg = (thrown as Error).message;
  if (typeof pattern === 'string') {
    if (!msg.includes(pattern)) {
      throw new Error(`FAIL: ${label} (throw message missing "${pattern}", got "${msg}")`);
    }
  } else {
    if (!pattern.test(msg)) {
      throw new Error(`FAIL: ${label} (throw message did not match ${pattern}, got "${msg}")`);
    }
  }
}

// ============================================================================
// Fixtures
// ============================================================================

function makeUser(
  id: string,
  tradition: Tradition,
  hierarchy: HierarchyLevel = 'cigano',
  extraTraditions: ReadonlyArray<Tradition> = [],
): UserState {
  return Object.freeze({
    id: userId(id),
    knownTraditions: Object.freeze([tradition, ...extraTraditions]),
    currentHierarchyLevel: hierarchy,
  });
}

function makeAction(
  type: SacredAction['type'],
  tradition: Tradition,
  hierarchy: HierarchyLevel = 'cigano',
  opts: Partial<{
    intent: SacredAction['intent'];
    durationMinutes: number;
    intention: string;
    witness: string;
  }> = {},
): SacredAction {
  return Object.freeze({
    type,
    intent: opts.intent ?? 'genuine',
    tradition,
    hierarchy,
    intention: opts.intention ?? 'estudo sério e devocional',
    durationMinutes: opts.durationMinutes ?? 30,
    witness: opts.witness ?? 'mestre testemunha',
    occurredAt: new Date('2026-06-30T06:00:00Z').toISOString(),
  });
}

function makeContext(user: UserState, action: SacredAction): AwardContext {
  return Object.freeze({
    user,
    action,
    intentionHonest: true,
    witnessed: true,
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('Branded types', () => {
  it('badgeId accepts valid format', () => {
    const id = badgeId('b_primeira_carta');
    expectEqual(id, 'b_primeira_carta' as BadgeId, 'badgeId roundtrip');
  });
  it('badgeId rejects malformed', () => {
    expectThrows(() => badgeId('primeira_carta'), /invalid format/, 'badgeId rejects no prefix');
    expectThrows(() => badgeId('b_x'), /invalid format/, 'badgeId rejects too short');
    expectThrows(() => badgeId('B_LUPCS'), /invalid format/, 'badgeId rejects uppercase');
  });
  it('userId accepts valid format', () => {
    const id = userId('u_jovem_consulente');
    expectEqual(id, 'u_jovem_consulente' as UserId, 'userId roundtrip');
  });
  it('userId rejects malformed', () => {
    expectThrows(() => userId('user123'), /invalid format/, 'userId rejects no prefix');
  });
  it('awardId accepts valid format', () => {
    const id = awardId('a_' + 'a'.repeat(24));
    expectEqual(typeof id, 'string', 'awardId is string');
  });
});

describe('Traditions & hierarchy', () => {
  it('TRADITIONS has exactly 7 entries', () => {
    expectEqual(TRADITIONS.length, 7, 'TRADITIONS length');
  });
  it('TRADITIONS contains all 7 sacred traditions', () => {
    expectTrue(TRADITIONS.includes('candomble'), 'candomble');
    expectTrue(TRADITIONS.includes('umbanda'), 'umbanda');
    expectTrue(TRADITIONS.includes('ifa'), 'ifa');
    expectTrue(TRADITIONS.includes('cabala'), 'cabala');
    expectTrue(TRADITIONS.includes('astrologia'), 'astrologia');
    expectTrue(TRADITIONS.includes('tantra'), 'tantra');
    expectTrue(TRADITIONS.includes('cigano_ramiro'), 'cigano_ramiro');
  });
  it('isTradition validates correctly', () => {
    expectTrue(isTradition('candomble'), 'valid tradition');
    expectFalse(isTradition('budismo'), 'invalid tradition');
    expectFalse(isTradition(42), 'non-string');
  });
  it('HIERARCHY_LEVELS is ordered correctly', () => {
    expectEqual(HIERARCHY_LEVELS[0], 'cigano', 'first level');
    expectEqual(HIERARCHY_LEVELS[1], 'orixa', 'second level');
    expectEqual(HIERARCHY_LEVELS[2], 'ifa', 'third level');
    expectEqual(HIERARCHY_LEVELS[3], 'mestre', 'fourth level');
  });
  it('hierarchyRank returns ordinals 0..3', () => {
    expectEqual(hierarchyRank('cigano'), 0, 'cigano=0');
    expectEqual(hierarchyRank('orixa'), 1, 'orixa=1');
    expectEqual(hierarchyRank('ifa'), 2, 'ifa=2');
    expectEqual(hierarchyRank('mestre'), 3, 'mestre=3');
  });
  it('hierarchyAtLeast respects ordering', () => {
    expectTrue(hierarchyAtLeast('mestre', 'cigano'), 'mestre≥cigano');
    expectTrue(hierarchyAtLeast('cigano', 'cigano'), 'cigano=cigano');
    expectFalse(hierarchyAtLeast('cigano', 'orixa'), 'cigano<orixa');
    expectFalse(hierarchyAtLeast('orixa', 'mestre'), 'orixa<mestre');
  });
});

describe('Vanity detection', () => {
  it('isVanityAction detects vanity signatures', () => {
    expectTrue(isVanityAction('login_streak'), 'login_streak');
    expectTrue(isVanityAction('post_count'), 'post_count');
    expectTrue(isVanityAction('days_active'), 'days_active');
    expectTrue(isVanityAction('fasted_days'), 'fasted_days');
  });
  it('isVanityAction does not flag sacred actions', () => {
    expectFalse(isVanityAction('consulta_realizada'), 'consulta_realizada sacred');
    expectFalse(isVanityAction('meditacao_completa'), 'meditacao_completa sacred');
  });
  it('VANITY_ACTION_SIGNATURES has 8 entries', () => {
    expectEqual(VANITY_ACTION_SIGNATURES.length, 8, 'VANITY length');
  });
});

describe('Option & Result helpers', () => {
  it('some() and none()', () => {
    const s: ReturnType<typeof some<number>> = some(42);
    expectTrue(s.some, 'some is true');
    if (s.some) expectEqual(s.value, 42, 'some value');
    const n: ReturnType<typeof none<number>> = none();
    expectFalse(n.some, 'none is false');
  });
  it('ok() and err()', () => {
    const o = ok('hi');
    expectTrue(o.ok, 'ok is true');
    const e = err({ code: 'x' as const, message: 'oops' });
    expectFalse(e.ok, 'err is false');
  });
});

describe('Hashing primitives', () => {
  it('sha256Hex of empty string is canonical', () => {
    expectEqual(
      sha256Hex(''),
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      'sha256("")',
    );
  });
  it('sha256Hex of abc is canonical', () => {
    expectEqual(
      sha256Hex('abc'),
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      'sha256("abc")',
    );
  });
  it('sha256HexSync matches sha256Hex', () => {
    expectEqual(sha256HexSync('test'), sha256Hex('test'), 'sync === async');
  });
  it('canonicalJson sorts keys', () => {
    const a = canonicalJson({ b: 1, a: 2 });
    const b = canonicalJson({ a: 2, b: 1 });
    expectEqual(a, b, 'key order does not matter');
    expectEqual(a, '{"a":2,"b":1}', 'sorted output');
  });
  it('hashCanonical is deterministic', () => {
    const a = hashCanonical({ a: 1, b: [1, 2, 3] });
    const b = hashCanonical({ b: [1, 2, 3], a: 1 });
    expectEqual(a, b, 'hash is order-independent');
  });
});

describe('Catalog — seed', () => {
  it('seedCatalog returns ≥25 badge ids', () => {
    _resetAuditForTests();
    const ids = seedCatalog();
    expectTrue(ids.length >= 25, `seeded ${ids.length} (≥25)`);
  });
  it('seeded catalog has ≥3 badges per tradition', () => {
    _resetAuditForTests();
    seedCatalog();
    for (const t of TRADITIONS) {
      const list = listBadgesByTradition(t);
      expectTrue(list.length >= 3, `${t} has ${list.length} badges (≥3)`);
    }
  });
  it('seeded catalog covers all 4 hierarchy levels', () => {
    _resetAuditForTests();
    seedCatalog();
    for (const h of HIERARCHY_LEVELS) {
      const list = listBadges({ hierarchy: h });
      expectTrue(list.length >= 1, `${h} has ${list.length} badges (≥1)`);
    }
  });
  it('every seeded badge has a respectNote ≥20 chars', () => {
    _resetAuditForTests();
    seedCatalog();
    for (const b of listBadges()) {
      expectTrue(b.respectNote.length >= 20, `${b.id} respectNote ${b.respectNote.length} chars`);
    }
  });
  it('every seeded badge has hierarchy + tradition fields', () => {
    _resetAuditForTests();
    seedCatalog();
    for (const b of listBadges()) {
      expectTrue(typeof b.tradition === 'string', `${b.id} has tradition`);
      expectTrue(typeof b.hierarchy === 'string', `${b.id} has hierarchy`);
      expectTrue(TRADITIONS.includes(b.tradition), `${b.id} tradition valid`);
      expectTrue(HIERARCHY_LEVELS.includes(b.hierarchy), `${b.id} hierarchy valid`);
    }
  });
  it('every seeded badge isTraditionRespected', () => {
    _resetAuditForTests();
    seedCatalog();
    let respected = 0;
    for (const b of listBadges()) {
      if (isTraditionRespected(b)) respected++;
    }
    expectTrue(respected === listBadges().length, `${respected}/${listBadges().length} respected`);
  });
  it('no seeded badge is a vanity metric', () => {
    _resetAuditForTests();
    seedCatalog();
    for (const b of listBadges()) {
      expectFalse(isVanityMetric(b), `${b.id} is not vanity`);
    }
  });
});

describe('Registration', () => {
  it('rejects badge with isVanity=true flag', () => {
    _resetAuditForTests();
    const r = registerBadge({
      id: badgeId('b_streak_infernal'),
      name: 'Streak Infernal',
      description: 'login 30 dias seguidos',
      tradition: 'cigano_ramiro',
      hierarchy: 'cigano',
      respectNote: 'Reconhece constância na prática contemplativa diária.',
      action: 'consulta_realizada',
      requires: [],
      minDurationMinutes: 0,
      crossTradition: true,
      blocksSacredPractice: false,
      isVanity: true,
    });
    expectFalse(r.ok, 'isVanity=true rejected');
  });
  it('rejects duplicate id', () => {
    _resetAuditForTests();
    seedCatalog();
    const r = registerBadge({
      id: badgeId('b_primeira_carta'),
      name: 'Outra Carta',
      description: 'duplicado',
      tradition: 'cigano_ramiro',
      hierarchy: 'cigano',
      respectNote: 'nota duplicada com pelo menos vinte caracteres',
      action: 'cigano_puxado',
      requires: [],
      minDurationMinutes: 1,
      crossTradition: true,
      blocksSacredPractice: false,
    });
    expectFalse(r.ok, 'duplicate rejected');
  });
  it('rejects too-short respectNote', () => {
    _resetAuditForTests();
    const r = registerBadge({
      id: badgeId('b_curto_nota'),
      name: 'Curto Nota',
      description: 'curto',
      tradition: 'cigano_ramiro',
      hierarchy: 'cigano',
      respectNote: 'curto',
      action: 'cigano_puxado',
      requires: [],
      minDurationMinutes: 1,
      crossTradition: true,
      blocksSacredPractice: false,
    });
    expectFalse(r.ok, 'short respect note rejected');
  });
  it('rejects malformed id', () => {
    _resetAuditForTests();
    const r = registerBadge({
      id: 'malformed' as BadgeId,
      name: 'Malformed ID',
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
    expectFalse(r.ok, 'malformed id rejected');
  });
  it('getBadge returns some/none correctly', () => {
    _resetAuditForTests();
    seedCatalog();
    const s = getBadge(badgeId('b_primeira_carta'));
    expectTrue(s.some, 'has badge');
    const n = getBadge(badgeId('b_inexistente_xxx'));
    expectFalse(n.some, 'no such badge');
  });
});

describe('Award — happy paths', () => {
  it('awards when all invariants pass', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_jovem_cigana', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 20 });
    const r = awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action));
    expectEqual(r.status, 'awarded', 'awarded');
    expectTrue(r.awardId !== undefined, 'has awardId');
    expectTrue(r.hash !== undefined, 'has hash');
  });
  it('rejects when intent is extractive', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_farmer', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', {
      intent: 'extractive',
      durationMinutes: 20,
    });
    const r = awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action));
    expectEqual(r.status, 'rejected', 'rejected');
  });
  it('rejects when tradition mismatches and not cross', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_ifa_user', 'ifa', 'ifa');
    // Use a cross-tradition badge
    const action = makeAction('meditacao_completa', 'candomble', 'orixa', { durationMinutes: 30 });
    const r = awardBadge(user, badgeId('b_orixa_recebido'), makeContext(user, action));
    expectEqual(r.status, 'rejected', 'tradition mismatch rejected');
  });
  it('rejects when hierarchy insufficient', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_novato', 'cigano_ramiro', 'cigano');
    // mestre-level badge (Kundalini)
    const action = makeAction('meditacao_completa', 'tantra', 'mestre', { durationMinutes: 120 });
    const r = awardBadge(user, badgeId('b_kundalini_desperta'), makeContext(user, action));
    expectEqual(r.status, 'rejected', 'hierarchy insufficient');
  });
  it('rejects when duration too short', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_curto', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 1 });
    const r = awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action));
    expectEqual(r.status, 'rejected', 'insufficient duration');
  });
  it('rejects when intentionHonest is false', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_desonesto', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 20 });
    const ctx = Object.freeze({ ...makeContext(user, action), intentionHonest: false });
    const r = awardBadge(user, badgeId('b_primeira_carta'), ctx);
    expectEqual(r.status, 'rejected', 'dishonest intention rejected');
  });
  it('rejects when not witnessed', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_sozinho', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 20 });
    const ctx = Object.freeze({ ...makeContext(user, action), witnessed: false });
    const r = awardBadge(user, badgeId('b_primeira_carta'), ctx);
    expectEqual(r.status, 'rejected', 'unwitnessed rejected');
  });
  it('rejects already-earned badge', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_ja_ganhou', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 20 });
    const ctx = makeContext(user, action);
    const r1 = awardBadge(user, badgeId('b_primeira_carta'), ctx);
    expectEqual(r1.status, 'awarded', 'first award ok');
    const r2 = awardBadge(user, badgeId('b_primeira_carta'), ctx);
    expectEqual(r2.status, 'rejected', 'second award rejected');
  });
  it('rejects nonexistent badge', () => {
    _resetAuditForTests();
    const user = makeUser('u_test', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 20 });
    const r = awardBadge(user, badgeId('b_inexistente'), makeContext(user, action));
    expectEqual(r.status, 'rejected', 'missing badge rejected');
  });
});

describe('Award — cross-tradition', () => {
  it('crossTradition badge accepts other traditions', () => {
    _resetAuditForTests();
    seedCatalog();
    // Cabala badge is crossTradition — Candomblé user with mestre hierarchy
    // can earn it
    const user = makeUser('u_ebami_cabalista', 'candomble', 'mestre');
    const action = makeAction('leitura_concluida', 'cabala', 'mestre', { durationMinutes: 90 });
    const r = awardBadge(user, badgeId('b_arvore_vida_mapeada'), makeContext(user, action));
    expectEqual(r.status, 'awarded', 'cross-tradition awarded');
  });
  it('non-cross badge rejects other traditions', () => {
    _resetAuditForTests();
    seedCatalog();
    // Candomblé badge is NOT crossTradition
    const user = makeUser('u_ifa_user', 'ifa', 'mestre');
    const action = makeAction('oferenda_feita', 'candomble', 'orixa', { durationMinutes: 120 });
    const r = awardBadge(user, badgeId('b_orixa_recebido'), makeContext(user, action));
    expectEqual(r.status, 'rejected', 'non-cross rejected');
  });
});

describe('List earned + check', () => {
  it('listEarnedBadges returns earned', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_lista', 'cigano_ramiro', 'cigano');
    expectEqual(listEarnedBadges(user.id).length, 0, 'initially empty');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 20 });
    awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action));
    expectEqual(listEarnedBadges(user.id).length, 1, 'has 1 earned');
  });
  it('checkEarnedBadges returns candidates without awarding', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_check', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 20 });
    const candidates = checkEarnedBadges(user, action);
    expectTrue(candidates.length >= 1, `${candidates.length} candidates`);
    expectEqual(listEarnedBadges(user.id).length, 0, 'not yet earned');
  });
});

describe('Revoke', () => {
  it('revoke removes earned', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_revogar', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 20 });
    awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action));
    expectEqual(listEarnedBadges(user.id).length, 1, 'awarded');
    const r = revokeBadge(user.id, badgeId('b_primeira_carta'), 'user_request');
    expectEqual(r.status, 'revoked', 'revoked');
    expectEqual(listEarnedBadges(user.id).length, 0, 'removed');
  });
  it('revoke of non-earned returns not_found', () => {
    _resetAuditForTests();
    const r = revokeBadge(userId('u_nao_existe'), badgeId('b_primeira_carta'), 'user_request');
    expectEqual(r.status, 'not_found', 'not found');
  });
});

describe('Anti-pattern API throws by design', () => {
  it('listTopUsersByBadgeCount throws', () => {
    expectThrows(
      () => listTopUsersByBadgeCount(10),
      /Vanity metric rejected by design/,
      'top users throws',
    );
  });
  it('rankUsersByXp throws', () => {
    expectThrows(() => rankUsersByXp(10), /Vanity metric rejected by design/, 'rank throws');
  });
  it('getGlobalUserLevel throws', () => {
    expectThrows(
      () => getGlobalUserLevel(userId('u_test')),
      /Vanity metric rejected by design/,
      'level throws',
    );
  });
  it('getUserXp throws', () => {
    expectThrows(
      () => getUserXp(userId('u_test')),
      /Vanity metric rejected by design/,
      'xp throws',
    );
  });
});

describe('Tradition-respect guards', () => {
  it('Candomblé badge with Orixá token passes', () => {
    _resetAuditForTests();
    seedCatalog();
    const b = getBadge(badgeId('b_orixa_recebido'));
    expectTrue(b.some, 'has b_orixa_recebido');
    if (b.some) expectTrue(isTraditionRespected(b.value), 'Orixá badge is respected');
  });
  it('Candomblé badge with NO Orixá token fails respect', () => {
    _resetAuditForTests();
    const r = registerBadge({
      id: badgeId('b_fake_candomble'),
      name: 'Fake Candomblé',
      description: 'fake',
      tradition: 'candomble',
      hierarchy: 'orixa',
      respectNote: 'descrição genérica sem token sagrado específico',
      action: 'oferenda_feita',
      requires: [],
      minDurationMinutes: 1,
      crossTradition: false,
      blocksSacredPractice: false,
    });
    expectTrue(r.ok, 'registered but disrespects');
    const b = getBadge(badgeId('b_fake_candomble'));
    if (b.some) expectFalse(isTraditionRespected(b.value), 'fake is not respected');
  });
  it('Ifá badge with Odu token passes', () => {
    _resetAuditForTests();
    seedCatalog();
    const b = getBadge(badgeId('b_odu_nascimento'));
    if (b.some) expectTrue(isTraditionRespected(b.value), 'Odu badge respected');
  });
  it('Cabala badge with Sephirah token passes', () => {
    _resetAuditForTests();
    seedCatalog();
    const b = getBadge(badgeId('b_arvore_vida_mapeada'));
    if (b.some) expectTrue(isTraditionRespected(b.value), 'Sephirah badge respected');
  });
});

describe('isVanityMetric and blocksSacredPractice', () => {
  it('streak-named badge is vanity', () => {
    _resetAuditForTests();
    // We can't register a real vanity badge (rejected), but we can test the
    // string-based heuristic by checking a hypothetical badge
    const fake: Badge = Object.freeze({
      id: badgeId('b_hypothetical'),
      name: 'Login Streak',
      description: 'test',
      tradition: 'cigano_ramiro',
      hierarchy: 'cigano',
      respectNote: 'qualquer nota aqui não importa para o teste de vanity',
      action: 'consulta_realizada',
      requires: [],
      minDurationMinutes: 0,
      crossTradition: true,
      blocksSacredPractice: false,
      isVanity: false,
    });
    expectTrue(isVanityMetric(fake), 'streak badge detected');
  });
  it('blocksSacredPractice flag respected', () => {
    const real = getBadge(badgeId('b_primeira_carta'));
    if (real.some) {
      expectFalse(blocksSacredPractice(real.value), 'primeira_carta does not block practice');
    }
  });
  it('getBadgeHierarchyLevel returns the level', () => {
    _resetAuditForTests();
    seedCatalog();
    const b = getBadge(badgeId('b_arvore_vida_mapeada'));
    if (b.some) {
      expectEqual(getBadgeHierarchyLevel(b.value), 'mestre', 'cabala is mestre');
    }
  });
});

describe('Audit log', () => {
  it('exportAudit returns audit entries', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_audit', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 20 });
    awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action));
    const log = exportAudit();
    expectTrue(log.length >= 2, `audit has ${log.length} entries`);
    expectTrue(log.some((e) => e.kind === 'register'), 'has register');
    expectTrue(log.some((e) => e.kind === 'award'), 'has award');
  });
});

describe('7-tradition coverage (mandatory)', () => {
  it('has at least 1 specific reference per tradition', () => {
    _resetAuditForTests();
    seedCatalog();
    const traditionsFound: Record<Tradition, number> = {
      candomble: 0,
      umbanda: 0,
      ifa: 0,
      cabala: 0,
      astrologia: 0,
      tantra: 0,
      cigano_ramiro: 0,
    };
    for (const b of listBadges()) {
      traditionsFound[b.tradition]++;
    }
    for (const t of TRADITIONS) {
      expectTrue(traditionsFound[t] >= 1, `${t} has ${traditionsFound[t]} badges (≥1)`);
    }
  });
  it('Candomblé respects notes mention Orixás', () => {
    _resetAuditForTests();
    seedCatalog();
    const notes = listBadgesByTradition('candomble').map((b) => b.respectNote).join(' ');
    expectTrue(notes.includes('Orixá') || notes.includes('axé') || notes.includes('terreiro'), 'Orixá token present');
  });
  it('Umbanda respects notes mention Umbanda-line entities', () => {
    _resetAuditForTests();
    seedCatalog();
    const notes = listBadgesByTradition('umbanda').map((b) => b.respectNote).join(' ');
    expectTrue(notes.includes('Caboclo') || notes.includes('Preto-Velho'), 'Umbanda entity token');
  });
  it('Ifá respects notes mention Odus', () => {
    _resetAuditForTests();
    seedCatalog();
    const notes = listBadgesByTradition('ifa').map((b) => b.respectNote).join(' ');
    expectTrue(notes.includes('Odu') || notes.includes('Ifá') || notes.includes('Orunmila'), 'Odu token');
  });
  it('Cabala respects notes mention Sephiroth', () => {
    _resetAuditForTests();
    seedCatalog();
    const notes = listBadgesByTradition('cabala').map((b) => b.respectNote).join(' ');
    expectTrue(notes.includes('Sefirá') || notes.includes('Keter') || notes.includes('Árvore'), 'Sephirah token');
  });
  it('Astrologia respects notes mention signs', () => {
    _resetAuditForTests();
    seedCatalog();
    const notes = listBadgesByTradition('astrologia').map((b) => b.respectNote).join(' ');
    expectTrue(
      notes.toLowerCase().includes('signo') ||
        notes.toLowerCase().includes('planeta') ||
        notes.toLowerCase().includes('lilith') ||
        notes.toLowerCase().includes('trânsito') ||
        notes.toLowerCase().includes('casa'),
      'astrologia token',
    );
  });
  it('Tantra respects notes mention prana/kundalini', () => {
    _resetAuditForTests();
    seedCatalog();
    const notes = listBadgesByTradition('tantra').map((b) => b.respectNote).join(' ');
    expectTrue(notes.includes('Prana') || notes.includes('Kundalini') || notes.includes('Chakra'), 'Tantra token');
  });
  it('Cigano Ramiro respects notes mention 36 cartas', () => {
    _resetAuditForTests();
    seedCatalog();
    const notes = listBadgesByTradition('cigano_ramiro').map((b) => b.respectNote).join(' ');
    expectTrue(
      notes.includes('Cigano') || notes.includes('carta') || notes.includes('Mesa Real') || notes.includes('naipe'),
      'Cigano token',
    );
  });
});

describe('Frozen output', () => {
  it('Badge is frozen', () => {
    _resetAuditForTests();
    seedCatalog();
    const b = getBadge(badgeId('b_primeira_carta'));
    if (b.some) {
      expectTrue(Object.isFrozen(b.value), 'badge is frozen');
    }
  });
  it('list output is frozen', () => {
    _resetAuditForTests();
    seedCatalog();
    const list = listBadges();
    expectTrue(Object.isFrozen(list), 'list frozen');
  });
  it('EarnedBadge is frozen', () => {
    _resetAuditForTests();
    seedCatalog();
    const user = makeUser('u_freeze', 'cigano_ramiro', 'cigano');
    const action = makeAction('cigano_puxado', 'cigano_ramiro', 'cigano', { durationMinutes: 20 });
    awardBadge(user, badgeId('b_primeira_carta'), makeContext(user, action));
    const earned = listEarnedBadges(user.id);
    expectTrue(earned.length >= 1, 'has earned');
    if (earned.length >= 1) {
      expectTrue(Object.isFrozen(earned[0]), 'EarnedBadge frozen');
    }
  });
});

// ============================================================================
// Runner
// ============================================================================

async function main(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];
  for (const t of _tests) {
    try {
      await t.fn();
      passed++;
      console.log(`  PASS  ${t.name}`);
    } catch (e) {
      failed++;
      const msg = (e as Error).message;
      failures.push(`${t.name}: ${msg}`);
      console.log(`  FAIL  ${t.name}`);
      console.log(`        ${msg}`);
    }
  }
  console.log('');
  console.log(`Tests: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failed > 0) {
    console.log('');
    console.log('--- Failures ---');
    for (const f of failures) console.log('  ' + f);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('HARNESS CRASH:', e);
  process.exit(2);
});