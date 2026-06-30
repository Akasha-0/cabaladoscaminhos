// ============================================================================
// W91s-B — REPUTATION LEADERBOARD ENGINE SPEC
// ============================================================================
// Source-inspection harness (no vitest, no jsdom). Imports the engine
// directly and registers assertions; the runner at the bottom executes
// them and prints pass/fail counts. Exits 0 on full PASS.
//
// Pattern: cycle 68 / 73 / 75 / 86 / 89 / 90s. Defensive regex crafting
// avoids esbuild nested-regex pitfalls (cycle 88 lesson).
// ============================================================================

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  calculateUniversalistaScore,
  scoreEntry,
  sortByScoreDesc,
  applyFilters,
  paginate,
  buildLeaderboard,
  topN,
  reputationLeaderboardEngine,
  TRADICAO_LABELS,
  TRADICAO_BADGES,
  TRADICAO_ACCENT_CLASSES,
  TRADITION_IDS,
  DEFAULT_WEIGHTS,
  asUserId,
  asDisplayName,
  asTraditionKey,
  asScore,
  asPageNumber,
  asPageSize,
  type LeaderboardEntry,
} from './reputation-leaderboard-engine.ts';

// @ts-ignore — node-stubs.d.ts provides process.exit
declare const process: { exit(code: number): never };

// ════════════════════════════════════════════════════════════════════════════
// Tiny harness
// ════════════════════════════════════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok =
    Object.is(actual, expected) ||
    JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual failed${label ? ` (${label})` : ''}: expected ${JSON.stringify(
        expected
      )} got ${JSON.stringify(actual)}`
    );
  }
}

function assertTrue(cond: boolean, label?: string): void {
  if (!cond) {
    throw new Error(`assertTrue failed${label ? ` (${label})` : ''}`);
  }
}

function assertThrows(fn: () => unknown, label?: string): void {
  try {
    fn();
  } catch {
    return;
  }
  throw new Error(`assertThrows failed${label ? ` (${label})` : ''}: no throw`);
}

// ════════════════════════════════════════════════════════════════════════════
// Fixtures
// ════════════════════════════════════════════════════════════════════════════

function makeEntry(
  userId: string,
  displayName: string,
  primaryTradition: 'candomble' | 'umbanda' | 'ifa' | 'cabala' | 'astrologia',
  traditionsActive: ReadonlyArray<
    'candomble' | 'umbanda' | 'ifa' | 'cabala' | 'astrologia'
  >,
  metrics: {
    posts: number;
    helpfulReactions: number;
    crossTraditionReads: number;
    mentorshipGiven: number;
  }
): LeaderboardEntry {
  return {
    userId: asUserId(userId),
    displayName: asDisplayName(displayName),
    avatarUrl: null,
    primaryTradition,
    traditionsActive,
    metrics: Object.freeze({ ...metrics }),
  };
}

const FIX: ReadonlyArray<LeaderboardEntry> = Object.freeze([
  makeEntry('u1', 'Mestra Obá', 'candomble', ['candomble', 'umbanda', 'ifa'], {
    posts: 84,
    helpfulReactions: 312,
    crossTraditionReads: 142,
    mentorshipGiven: 28,
  }),
  makeEntry('u2', 'Ravi Cohen', 'cabala', ['cabala', 'astrologia'], {
    posts: 56,
    helpfulReactions: 198,
    crossTraditionReads: 240,
    mentorshipGiven: 12,
  }),
  makeEntry('u3', 'Ialá do Cruzeiro', 'umbanda', ['umbanda', 'candomble', 'astrologia'], {
    posts: 102,
    helpfulReactions: 421,
    crossTraditionReads: 96,
    mentorshipGiven: 19,
  }),
  makeEntry('u4', 'Babalaô Ifatunde', 'ifa', ['ifa'], {
    posts: 64,
    helpfulReactions: 256,
    crossTraditionReads: 88,
    mentorshipGiven: 41,
  }),
  makeEntry('u5', 'Paula Estrela', 'astrologia', ['astrologia', 'cabala', 'candomble', 'umbanda', 'ifa'], {
    posts: 71,
    helpfulReactions: 188,
    crossTraditionReads: 312,
    mentorshipGiven: 9,
  }),
]);

// ════════════════════════════════════════════════════════════════════════════
// 1) Branded types & sanitizers
// ════════════════════════════════════════════════════════════════════════════

it('[brand] asScore clamps negative to 0', () => {
  assertEqual(asScore(-5), 0, 'neg -> 0');
});

it('[brand] asScore floors fractions', () => {
  assertEqual(asScore(7.9), 7, 'floor');
});

it('[brand] asPageNumber clamps to >=1', () => {
  assertEqual(asPageNumber(0), 1);
  assertEqual(asPageNumber(-3), 1);
});

it('[brand] asPageSize clamps to 1..100', () => {
  assertEqual(asPageSize(0), 1);
  assertEqual(asPageSize(500), 100);
  assertEqual(asPageSize(20), 20);
});

// ════════════════════════════════════════════════════════════════════════════
// 2) Scoring formula — score math
// ════════════════════════════════════════════════════════════════════════════

it('[score] default weights: posts × 1', () => {
  assertEqual(DEFAULT_WEIGHTS.posts, 1);
});

it('[score] default weights: helpfulReactions × 2', () => {
  assertEqual(DEFAULT_WEIGHTS.helpfulReactions, 2);
});

it('[score] default weights: crossTraditionReads × 3', () => {
  assertEqual(DEFAULT_WEIGHTS.crossTraditionReads, 3);
});

it('[score] default weights: mentorshipGiven × 5', () => {
  assertEqual(DEFAULT_WEIGHTS.mentorshipGiven, 5);
});

it('[score] single-tradition breadth=1 has no bonus', () => {
  const s = calculateUniversalistaScore(
    { posts: 10, helpfulReactions: 10, crossTraditionReads: 10, mentorshipGiven: 10 },
    ['ifa']
  );
  // 10*1 + 10*2 + 10*3 + 10*5 = 110, no breadth bonus (breadth=1)
  assertEqual(s, 110);
});

it('[score] 2 traditions adds +3 breadth bonus', () => {
  const s = calculateUniversalistaScore(
    { posts: 10, helpfulReactions: 10, crossTraditionReads: 10, mentorshipGiven: 10 },
    ['cabala', 'astrologia']
  );
  // 110 + (2-1)*3 = 113
  assertEqual(s, 113);
});

it('[score] 5 traditions adds +12 breadth bonus', () => {
  const s = calculateUniversalistaScore(
    { posts: 10, helpfulReactions: 10, crossTraditionReads: 10, mentorshipGiven: 10 },
    ['candomble', 'umbanda', 'ifa', 'cabala', 'astrologia']
  );
  // 110 + (5-1)*3 = 122
  assertEqual(s, 122);
});

it('[score] custom weights override defaults', () => {
  const s = calculateUniversalistaScore(
    { posts: 5, helpfulReactions: 5, crossTraditionReads: 5, mentorshipGiven: 5 },
    ['candomble'],
    { posts: 2, helpfulReactions: 3, crossTraditionReads: 4, mentorshipGiven: 10 }
  );
  // 5*2 + 5*3 + 5*4 + 5*10 = 95
  assertEqual(s, 95);
});

it('[score] negative metrics treated as zero', () => {
  const s = calculateUniversalistaScore(
    { posts: -3, helpfulReactions: 10, crossTraditionReads: 10, mentorshipGiven: 10 },
    ['candomble']
  );
  // 0 + 20 + 30 + 50 = 100
  assertEqual(s, 100);
});

// ════════════════════════════════════════════════════════════════════════════
// 3) scoreEntry + sortByScoreDesc
// ════════════════════════════════════════════════════════════════════════════

it('[scoreEntry] freezes entry surface + attaches score + breadth', () => {
  const entry = FIX[0];
  if (!entry) throw new Error('fixture missing');
  const scored = scoreEntry(entry);
  assertEqual(scored.score > 0, true, 'positive score');
  assertEqual(scored.traditionBreadth, 3);
});

it('[scoreEntry] is immutable — Object.freeze applied', () => {
  const entry = FIX[0];
  if (!entry) throw new Error('fixture missing');
  const scored = scoreEntry(entry);
  assertThrows(() => {
    (scored as { score: number }).score = 999;
  }, 'cannot mutate score');
});

it('[sortByScoreDesc] highest score first — descending order verified', () => {
  const scored = FIX.map((e) => scoreEntry(e));
  const sorted = sortByScoreDesc(scored);
  // u5 (Paula Estrela) has breadth=5 → +12 bonus on top of base
  // u3 (Ialá) has breadth=3 → +6 bonus
  // u2 has breadth=2 → +3 bonus
  // We just assert descending monotonicity rather than fixed ordering,
  // because the breadth bonus interacts with raw metrics.
  for (let i = 1; i < sorted.length; i++) {
    assertTrue(
      sorted[i - 1]!.score >= sorted[i]!.score,
      `sorted[${i - 1}].score >= sorted[${i}].score`
    );
  }
});

it('[sortByScoreDesc] is stable — equal scores preserve alphabetical order', () => {
  const tieA = makeEntry('a', 'Zeta', 'candomble', ['candomble'], {
    posts: 0,
    helpfulReactions: 0,
    crossTraditionReads: 0,
    mentorshipGiven: 0,
  });
  const tieB = makeEntry('b', 'Alfa', 'candomble', ['candomble'], {
    posts: 0,
    helpfulReactions: 0,
    crossTraditionReads: 0,
    mentorshipGiven: 0,
  });
  const sorted = sortByScoreDesc([tieA, tieB]);
  // Both score 0 — alphabetical tiebreak: Alfa before Zeta
  assertEqual(sorted[0]?.userId, 'b');
  assertEqual(sorted[1]?.userId, 'a');
});

// ════════════════════════════════════════════════════════════════════════════
// 4) applyFilters — by tradition + minBreadth + minScore
// ════════════════════════════════════════════════════════════════════════════

it('[filter] traditions filter narrows by primaryTradition', () => {
  const filtered = applyFilters(FIX, { traditions: ['candomble'] });
  // Only u1 (Mestra Obá) has primaryTradition='candomble' in FIX
  assertEqual(filtered.length, 1);
  assertEqual(filtered.every((e) => e.primaryTradition === 'candomble'), true);
});

it('[filter] minTraditionBreadth excludes single-tradition entries', () => {
  const filtered = applyFilters(FIX, { minTraditionBreadth: 2 });
  // Babalaô (ifa only) excluded
  assertEqual(filtered.some((e) => e.userId === 'u4'), false);
});

it('[filter] empty filter returns all entries', () => {
  const filtered = applyFilters(FIX);
  assertEqual(filtered.length, FIX.length);
});

// ════════════════════════════════════════════════════════════════════════════
// 5) paginate + buildLeaderboard + topN
// ════════════════════════════════════════════════════════════════════════════

it('[paginate] first page of size 2', () => {
  const scored = FIX.map((e) => scoreEntry(e));
  const sorted = sortByScoreDesc(scored);
  const page = paginate(sorted, { page: asPageNumber(1), pageSize: asPageSize(2) });
  assertEqual(page.entries.length, 2);
  assertEqual(page.totalEntries, 5);
  assertEqual(page.totalPages, 3);
  assertEqual(page.page, 1);
});

it('[paginate] last page returns remainder', () => {
  const scored = FIX.map((e) => scoreEntry(e));
  const sorted = sortByScoreDesc(scored);
  const page = paginate(sorted, { page: asPageNumber(3), pageSize: asPageSize(2) });
  assertEqual(page.entries.length, 1);
});

it('[topN] returns at most N entries', () => {
  const top = topN(FIX, 3);
  assertEqual(top.length, 3);
});

it('[topN] N>total returns all sorted', () => {
  const top = topN(FIX, 50);
  assertEqual(top.length, FIX.length);
});

it('[buildLeaderboard] end-to-end produces frozen result', () => {
  const result = buildLeaderboard({
    entries: FIX,
    page: { page: asPageNumber(1), pageSize: asPageSize(10) },
    now: '2026-06-30T14:00:00.000Z',
  });
  assertEqual(result.generatedAt, '2026-06-30T14:00:00.000Z');
  assertEqual(result.weights.posts, 1);
  assertEqual(result.page.entries.length, FIX.length);
});

// ════════════════════════════════════════════════════════════════════════════
// 6) Tradition taxonomy — verbatim PT-BR labels
// ════════════════════════════════════════════════════════════════════════════

it('[tradition] TRADICAO_LABELS preserves Candomblé with é', () => {
  assertEqual(TRADICAO_LABELS.candomble, 'Candomblé');
});

it('[tradition] TRADICAO_LABELS preserves Umbanda', () => {
  assertEqual(TRADICAO_LABELS.umbanda, 'Umbanda');
});

it('[tradition] TRADICAO_LABELS preserves Ifá with á', () => {
  assertEqual(TRADICAO_LABELS.ifa, 'Ifá');
});

it('[tradition] TRADICAO_LABELS preserves Cabala', () => {
  assertEqual(TRADICAO_LABELS.cabala, 'Cabala');
});

it('[tradition] TRADICAO_LABELS preserves Astrologia', () => {
  assertEqual(TRADICAO_LABELS.astrologia, 'Astrologia');
});

it('[tradition] TRADICAO_BADGES embed sacred symbols', () => {
  assertEqual(TRADICAO_BADGES.candomble.includes('Candomblé'), true);
  assertEqual(TRADICAO_BADGES.umbanda.includes('Umbanda'), true);
  assertEqual(TRADICAO_BADGES.ifa.includes('Ifá'), true);
  assertEqual(TRADICAO_BADGES.cabala.includes('Cabala'), true);
  assertEqual(TRADICAO_BADGES.astrologia.includes('Astrologia'), true);
});

it('[tradition] TRADICAO_ACCENT_CLASSES has 5 entries', () => {
  const keys = Object.keys(TRADICAO_ACCENT_CLASSES);
  assertEqual(keys.length, 5);
});

it('[tradition] TRADITION_IDS has 5 entries in canonical order', () => {
  assertEqual(TRADITION_IDS.length, 5);
  assertEqual(TRADITION_IDS[0], 'candomble');
  assertEqual(TRADITION_IDS[4], 'astrologia');
});

// ════════════════════════════════════════════════════════════════════════════
// 7) Frozen surface container
// ════════════════════════════════════════════════════════════════════════════

it('[surface] reputationLeaderboardEngine is frozen', () => {
  assertEqual(Object.isFrozen(reputationLeaderboardEngine), true);
});

it('[surface] engine exposes all public methods', () => {
  assertEqual(typeof reputationLeaderboardEngine.calculateUniversalistaScore, 'function');
  assertEqual(typeof reputationLeaderboardEngine.scoreEntry, 'function');
  assertEqual(typeof reputationLeaderboardEngine.sortByScoreDesc, 'function');
  assertEqual(typeof reputationLeaderboardEngine.applyFilters, 'function');
  assertEqual(typeof reputationLeaderboardEngine.paginate, 'function');
  assertEqual(typeof reputationLeaderboardEngine.buildLeaderboard, 'function');
  assertEqual(typeof reputationLeaderboardEngine.topN, 'function');
});

// ════════════════════════════════════════════════════════════════════════════
// 8) Sacred-cultural compliance — banned vocabulary scan
// ════════════════════════════════════════════════════════════════════════════

it('[compliance] engine source has NO banned vocabulary (negative-binding practices)', () => {
  const engineSrc = readFileSync(
    resolve(__dirname, './reputation-leaderboard-engine.ts'),
    'utf8'
  );
  // Cycle 88 lesson: obfuscate banned-vocab strings so the spec itself
  // doesn't self-flag during text search. Use word-boundary regex.
  const banned1 = 'amarr' + 'ação';
  const banned2 = 'amarre';
  const banned3 = 'vincula' + 'ção';
  // Strip comment lines to allow JSDoc references to the policy itself.
  const codeOnly = engineSrc
    .split('\n')
    .filter((l) => !/^\s*\/\//.test(l) && !/^\s*\*/.test(l))
    .join('\n');
  const re1 = new RegExp('\\b' + banned1 + '\\b', 'i');
  const re2 = new RegExp('\\b' + banned2 + '\\b', 'i');
  const re3 = new RegExp('\\b' + banned3 + '\\b', 'i');
  assertEqual(re1.test(codeOnly), false, `must not contain ${banned1}`);
  assertEqual(re2.test(codeOnly), false, `must not contain ${banned2}`);
  assertEqual(re3.test(codeOnly), false, `must not contain ${banned3}`);
});

it('[compliance] engine uses positive framing — "Reconhecimento" / "Contribuição" / "Mérito"', () => {
  const engineSrc = readFileSync(
    resolve(__dirname, './reputation-leaderboard-engine.ts'),
    'utf8'
  );
  // At least one of the positive terms appears in the JSDoc header
  const has = (s: string) => engineSrc.includes(s);
  assertEqual(has('Reconhecimento') || has('Contribuição') || has('Mérito') || has('Universalista'), true);
});

// ════════════════════════════════════════════════════════════════════════════
// 9) Source-inspection — engine structure
// ════════════════════════════════════════════════════════════════════════════

it('[source] engine exports calculateUniversalistaScore function', () => {
  const src = readFileSync(
    resolve(__dirname, './reputation-leaderboard-engine.ts'),
    'utf8'
  );
  assertTrue(/export function calculateUniversalistaScore/.test(src));
});

it('[source] engine has Object.freeze on TRADICAO_LABELS', () => {
  const src = readFileSync(
    resolve(__dirname, './reputation-leaderboard-engine.ts'),
    'utf8'
  );
  // Allow Object.freeze on the same logical line OR the next non-empty line.
  const m =
    /TRADICAO_LABELS[\s\S]{0,80}Object\.freeze/.test(src) ||
    /Object\.freeze[\s\S]{0,40}TRADICAO_LABELS/.test(src);
  assertTrue(m, 'Object.freeze must wrap TRADICAO_LABELS');
});

it('[source] engine does NOT use built-in clock or RNG calls', () => {
  const src = readFileSync(
    resolve(__dirname, './reputation-leaderboard-engine.ts'),
    'utf8'
  );
  // Strip comment lines + JSDoc so the explanatory notes don't self-flag.
  const codeOnly = src
    .split('\n')
    .filter((l) => !/^\s*\/\//.test(l) && !/^\s*\*/.test(l))
    .join('\n');
  // Word-boundary regex on function-call form.
  const re1 = new RegExp('\\bDate\\.now\\s*\\(\\)', 'g');
  const re2 = new RegExp('\\bMath\\.random\\s*\\(\\)', 'g');
  assertEqual(re1.test(codeOnly), false, 'no Date.now() in code');
  assertEqual(re2.test(codeOnly), false, 'no Math.random() in code');
});

it('[source] engine has branded types via unique symbol', () => {
  const src = readFileSync(
    resolve(__dirname, './reputation-leaderboard-engine.ts'),
    'utf8'
  );
  assertTrue(/declare const __brand: unique symbol/.test(src));
});

// ════════════════════════════════════════════════════════════════════════════
// 10) Self-running runner
// ════════════════════════════════════════════════════════════════════════════

(async () => {
  let pass = 0;
  let fail = 0;
  const failures: Array<{ name: string; error: string }> = [];
  for (const entry of SPEC_REGISTRY) {
    try {
      await entry.run();
      pass++;
      // eslint-disable-next-line no-console
      console.log(`  ✓ ${entry.name}`);
    } catch (e) {
      fail++;
      const msg = e instanceof Error ? e.message : String(e);
      failures.push({ name: entry.name, error: msg });
      // eslint-disable-next-line no-console
      console.error(`  ✗ ${entry.name}\n      ${msg}`);
    }
  }
  // eslint-disable-next-line no-console
  console.log(`\n[W91s engine spec] ${pass} passed, ${fail} failed`);
  if (fail > 0) {
    // eslint-disable-next-line no-console
    console.error('\nFAILURES:');
    for (const f of failures) {
      // eslint-disable-next-line no-console
      console.error(`  - ${f.name}: ${f.error}`);
    }
    process.exit(1);
  }
  process.exit(0);
})();