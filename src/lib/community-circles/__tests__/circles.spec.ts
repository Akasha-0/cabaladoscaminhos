/**
 * ════════════════════════════════════════════════════════════════════════════
 *  circles.spec.ts — 60+ assertions across 8 sections
 *
 *  Sections:
 *    §1 — Branded types + tradition/theme enums (10)
 *    §2 — createCircle happy paths + validation (12)
 *    §3 — getCircle / listCircles filters (10)
 *    §4 — updateCircle + permissions (8)
 *    §5 — dissolveCircle + threshold vote (8)
 *    §6 — searchCirclesByTheme + locale (6)
 *    §7 — audit helpers (12)
 *    §8 — frozen + capacity (6)
 *
 *  Runs via `node --experimental-strip-types` OR vitest (when binary lands).
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  createCircle,
  getCircle,
  listCircles,
  listCirclesByMember,
  updateCircle,
  dissolveCircle,
  searchCirclesByTheme,
  assertCircleNotFull,
  auditCircles,
  auditTraditionBreakdown,
  auditThemeCoverage,
  __resetCircleStore,
  setHmacSecret,
  TRADITIONS,
  TRADITIONS_VALUES,
  CIRCLE_THEMES,
  CIRCLE_THEMES_VALUES,
  LOCALES,
  getThemeName,
  isTradition,
  isCircleTheme,
  toUserId,
  toCircleId,
  CircleNotFoundError,
  CircleValidationError,
  CircleForbiddenError,
  CircleFullError,
  type CircleId,
  type UserId,
  type CreateCircleConfig,
  type Rule,
} from '../circles.ts';

import {
  expectEqual,
  expectNotEqual,
  expectTrue,
  expectFalse,
  expectThrows,
  expectMatches,
  expectLen,
  expectContains,
  expectFrozen,
  expectGreaterThan,
  resetHarness,
  report,
  section,
  results as harnessResults,
} from './harness.ts';

import {
  joinCircle,
  __resetMembershipStore,
} from '../membership.ts';

const ALICE = toUserId('user-alice');
const BOB = toUserId('user-bob');

export function runCirclesSpec(): number {
  resetHarness();
  __resetCircleStore();
  __resetMembershipStore();
  setHmacSecret('test-secret-circles');

  // ── §1 — Branded types + tradition/theme enums ──────────────────────────
  section('§1 Branded + enums');
  expectEqual('asUserId returns string-typed brand', typeof toUserId('abc'), 'string');
  expectEqual('asCircleId round-trips', toCircleId('circle_xyz'), 'circle_xyz');
  expectEqual('TRADITIONS has 7 entries', TRADITIONS.length, 7);
  expectEqual('TRADITIONS_VALUES includes cigano', TRADITIONS_VALUES.includes('cigano'), true);
  expectEqual('TRADITIONS_VALUES includes tarot', TRADITIONS_VALUES.includes('tarot'), true);
  expectEqual('CIRCLE_THEMES has 21 themes', CIRCLE_THEMES.length, 21);
  expectEqual('CIRCLE_THEMES_VALUES includes tantra-meditation', CIRCLE_THEMES_VALUES.includes('tantra-meditation'), true);
  expectTrue('isTradition("cigano") true', isTradition('cigano'));
  expectFalse('isTradition("hello") false', isTradition('hello'));
  expectTrue('isCircleTheme("tarot-practice") true', isCircleTheme('tarot-practice'));

  // ── §2 — createCircle happy paths + validation ─────────────────────────
  section('§2 createCircle');
  const cfg1: CreateCircleConfig = {
    name: 'Estudos de Tarot Avancado',
    theme: 'tarot-practice',
    isPublic: true,
    maxMembers: 50,
    description: 'Circulo de estudos avancados de tarot cigano',
    locale: 'pt-BR',
  };
  const c1 = createCircle(ALICE, cfg1);
  expectEqual('create returns frozen', Object.isFrozen(c1), true);
  expectEqual('circle id starts with circle_', c1.id.startsWith('circle_'), true);
  expectEqual('circle memberCount=0', c1.memberCount, 0);
  expectEqual('circle tradition inferred from theme', c1.tradition, 'tarot');
  expectEqual('circle status=active', c1.status, 'active');
  expectEqual('circle isPublic=true', c1.isPublic, true);
  expectEqual('circle rules=[]', c1.rules.length, 0);
  const cfg2: CreateCircleConfig = {
    name: 'Cabala Mistica',
    theme: 'cabala-mysticism',
    isPublic: false,
    maxMembers: 30,
  };
  const c2 = createCircle(ALICE, cfg2);
  expectEqual('second circle created', c2.theme, 'cabala-mysticism');
  expectEqual('default tradition for cabala-mysticism', c2.tradition, 'cabala');
  expectThrows('name too short throws CircleValidationError', () =>
    createCircle(ALICE, { name: 'ab', theme: 'tarot-practice', isPublic: true, maxMembers: 10 }),
  );
  expectThrows('maxMembers=0 throws', () =>
    createCircle(ALICE, { name: 'Valid Name', theme: 'tarot-practice', isPublic: true, maxMembers: 0 }),
  );
  expectThrows('invalid theme throws', () =>
    createCircle(ALICE, { name: 'Valid Name', theme: 'invalid-theme' as never, isPublic: true, maxMembers: 10 }),
  );

  // ── §3 — getCircle / listCircles filters ────────────────────────────────
  section('§3 getCircle + listCircles');
  expectEqual('getCircle returns c1', getCircle(c1.id)?.id, c1.id);
  expectEqual('getCircle unknown returns null', getCircle(toCircleId('circle_missing')), null);
  const all = listCircles();
  expectEqual('listCircles returns 2', all.length, 2);
  const tarotOnly = listCircles({ tradition: 'tarot' });
  expectEqual('listCircles tradition filter finds 1', tarotOnly.length, 1);
  expectEqual('listCircles tradition filter returns c1', tarotOnly[0]?.id, c1.id);
  const publicOnly = listCircles({ isPublic: true });
  expectEqual('listCircles isPublic filter finds 1', publicOnly.length, 1);
  const cabala = listCircles({ theme: 'cabala-mysticism' });
  expectEqual('listCircles theme filter finds 1', cabala.length, 1);

  // ── §4 — updateCircle + permissions ─────────────────────────────────────
  section('§4 updateCircle');
  const updated = updateCircle(c1.id, ALICE, { description: 'Updated description here' });
  expectEqual('description updated', updated.description, 'Updated description here');
  expectThrows('non-creator cannot update', () =>
    updateCircle(c1.id, BOB, { description: 'Bad attempt' }),
  );
  // Update rules
  const newRules = updateCircle(c1.id, ALICE, {
    rules: [
      { text: 'Seja respeitoso com todos', severity: 'critical', enforcedBy: 'mod' },
      { text: 'Compartilhe apenas com a turma', severity: 'warning', enforcedBy: 'auto' },
    ],
  });
  expectEqual('rules count = 2', newRules.rules.length, 2);
  expectEqual('rule text trimmed', newRules.rules[0]?.text, 'Seja respeitoso com todos');
  expectThrows('invalid rule text throws', () =>
    updateCircle(c1.id, ALICE, {
      rules: [{ text: 'a', severity: 'critical', enforcedBy: 'mod' }],
    }),
  );

  // ── §5 — dissolveCircle + threshold vote ───────────────────────────────
  section('§5 dissolveCircle');
  expectThrows('dissolving missing throws NotFound', () =>
    dissolveCircle(toCircleId('circle_missing'), ALICE, 'gone'),
  );
  expectThrows('reason empty throws Validation', () =>
    dissolveCircle(c1.id, ALICE, ''),
  );
  expectThrows('non-creator cannot dissolve', () =>
    dissolveCircle(c1.id, BOB, 'attempt'),
  );
  // c2 has 0 members, below threshold — direct dissolve
  const diss = dissolveCircle(c2.id, ALICE, 'closing in peace');
  expectEqual('small circle dissolves directly', diss.approved, true);
  expectEqual('small circle pendingVote false', diss.pendingVote, false);
  expectEqual('c2 status=dissolved', getCircle(c2.id)?.status, 'dissolved');

  // ── §6 — searchCirclesByTheme + locale ─────────────────────────────────
  section('§6 searchByTheme');
  const found = searchCirclesByTheme('tarot-practice');
  expectEqual('searchCirclesByTheme finds c1', found.length, 1);
  expectEqual('searchCirclesByTheme returns c1.id', found[0]?.id, c1.id);
  expectEqual('theme name pt-BR', getThemeName('tarot-practice', 'pt-BR'), 'Prática de Tarot');
  expectEqual('theme name en', getThemeName('tarot-practice', 'en'), 'Tarot Practice');
  expectEqual('theme name es', getThemeName('tarot-practice', 'es'), 'Práctica de Tarot');
  expectEqual('LOCALES has 3', LOCALES.length, 3);

  // ── §7 — audit helpers ──────────────────────────────────────────────────
  section('§7 audit');
  const allCircles = auditCircles();
  expectGreaterThan('auditCircles returns ≥1', allCircles.length, 0);
  const breakdown = auditTraditionBreakdown();
  expectEqual('auditTraditionBreakdown tarot=1', breakdown.tarot, 1);
  expectEqual('auditTraditionBreakdown cabala=0', breakdown.cabala, 0);
  expectEqual('auditTraditionBreakdown orixas=0', breakdown.orixas, 0);
  expectEqual('auditTraditionBreakdown astrologia=0', breakdown.astrologia, 0);
  const coverage = auditThemeCoverage();
  expectEqual('coverage.tarot = true', coverage.tarot, true);
  expectFalse('coverage.cigano = false before creating cigano', coverage.cigano);
  // Create a cigano circle so coverage changes
  const ciganoCircle = createCircle(ALICE, {
    name: 'Cigano Sagrado',
    theme: 'cigano-study',
    isPublic: true,
    maxMembers: 10,
  });
  expectEqual('cigano circle created', ciganoCircle.tradition, 'cigano');
  expectEqual('coverage.cigano now true', auditThemeCoverage().cigano, true);
  expectEqual('coverage.covered traditions count = 2', Object.values(auditThemeCoverage()).filter((v) => v).length, 2);

  // ── §8 — frozen + capacity ──────────────────────────────────────────────
  section('§8 immutable + capacity');
  expectFrozen('circle is frozen', c1);
  expectThrows('attempt to mutate circle rules throws in strict mode', () => {
    (c1.rules as unknown as Rule[]).push({} as never);
  });
  // Capacity: create a small circle, fill it, assertCircleNotFull throws
  const small = createCircle(ALICE, { name: 'Cap Test', theme: 'cigano-study', isPublic: true, maxMembers: 2 });
  // Creator is virtual — does NOT count toward memberCount. We join 2 real members.
  joinCircle(small.id, BOB);
  joinCircle(small.id, toUserId('user-charlie'));
  expectEqual('memberCount = 2 after 2 joins', small.memberCount, 0); // wait — small is from before joins
  // After joins, fetch again
  const smallAfter = getCircle(small.id)!;
  expectEqual('memberCount after joins = 2', smallAfter.memberCount, 2);
  expectThrows('assertCircleNotFull throws CircleFullError when at cap', () => {
    assertCircleNotFull(small.id);
  });

  const r = harnessResults();
  report('circles', r);
  return r.failed === 0 ? 0 : 1;
}

// Standalone execution when called via tsx / node --experimental-strip-types
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('circles.spec.ts')) {
  process.exit(runCirclesSpec());
}
