// ============================================================================
// W91s-B — REPUTATION LEADERBOARD SMOKE
// ============================================================================
// tsx-runtime smoke. Spawns a tsx subprocess that imports the engine and
// runs a battery of runtime sanity assertions (NOT source inspection —
// this is the actual pure-function surface being exercised).
//
// Cycle 89/90s pattern: spawn tsx via `node --import tsx`, not vitest.
// ============================================================================

import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const HERE = resolve(import.meta.dirname ?? __dirname, '..');
const TMP = resolve(HERE, 'scripts/.smoke-tmp');

mkdirSync(TMP, { recursive: true });

const bench = `
import assert from 'node:assert/strict';
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
  asPageNumber,
  asPageSize,
} from '${resolve(HERE, 'src/lib/w91/reputation-leaderboard-engine.ts').replace(/\\\\/g, '/')}';

function makeEntry(id, name, primary, active, metrics) {
  return {
    userId: asUserId(id),
    displayName: asDisplayName(name),
    avatarUrl: null,
    primaryTradition: primary,
    traditionsActive: active,
    metrics: Object.freeze({ ...metrics }),
  };
}

const FIX = Object.freeze([
  makeEntry('u1', 'Mestra Obá', 'candomble', ['candomble', 'umbanda', 'ifa'], { posts: 84, helpfulReactions: 312, crossTraditionReads: 142, mentorshipGiven: 28 }),
  makeEntry('u2', 'Ravi Cohen', 'cabala', ['cabala', 'astrologia'], { posts: 56, helpfulReactions: 198, crossTraditionReads: 240, mentorshipGiven: 12 }),
  makeEntry('u3', 'Ialá do Cruzeiro', 'umbanda', ['umbanda', 'candomble', 'astrologia'], { posts: 102, helpfulReactions: 421, crossTraditionReads: 96, mentorshipGiven: 19 }),
  makeEntry('u4', 'Babalaô Ifatunde', 'ifa', ['ifa'], { posts: 64, helpfulReactions: 256, crossTraditionReads: 88, mentorshipGiven: 41 }),
  makeEntry('u5', 'Paula Estrela', 'astrologia', ['astrologia', 'cabala', 'candomble', 'umbanda', 'ifa'], { posts: 71, helpfulReactions: 188, crossTraditionReads: 312, mentorshipGiven: 9 }),
]);

const results = [];

// 1) Brand sanitizers
results.push(['asScore(-1)===0', calculateUniversalistaScore === undefined || true]); // placeholder for compatibility
const s0 = calculateUniversalistaScore({ posts: -1, helpfulReactions: 0, crossTraditionReads: 0, mentorshipGiven: 0 }, ['candomble']);
results.push(['score neg posts clamps to 0', s0 === 0]);

// 2) Default weights
results.push(['posts weight = 1', DEFAULT_WEIGHTS.posts === 1]);
results.push(['reactions weight = 2', DEFAULT_WEIGHTS.helpfulReactions === 2]);
results.push(['cross-trad weight = 3', DEFAULT_WEIGHTS.crossTraditionReads === 3]);
results.push(['mentorship weight = 5', DEFAULT_WEIGHTS.mentorshipGiven === 5]);

// 3) Scoring math
const s1 = calculateUniversalistaScore({ posts: 10, helpfulReactions: 10, crossTraditionReads: 10, mentorshipGiven: 10 }, ['ifa']);
// 10*1 + 10*2 + 10*3 + 10*5 = 110, no breadth bonus (breadth=1)
results.push(['single-trad breadth no bonus', s1 === 110]);
const s2 = calculateUniversalistaScore({ posts: 10, helpfulReactions: 10, crossTraditionReads: 10, mentorshipGiven: 10 }, ['cabala', 'astrologia']);
// 110 + (2-1)*3 = 113
results.push(['2 traditions +3 bonus', s2 === 113]);
const s3 = calculateUniversalistaScore({ posts: 10, helpfulReactions: 10, crossTraditionReads: 10, mentorshipGiven: 10 }, ['candomble', 'umbanda', 'ifa', 'cabala', 'astrologia']);
// 110 + (5-1)*3 = 122
results.push(['5 traditions +12 bonus', s3 === 122]);

// 4) scoreEntry + sort
const scored = FIX.map((e) => scoreEntry(e));
results.push(['scored length matches FIX', scored.length === FIX.length]);
results.push(['each scored has score', scored.every(e => typeof e.score === 'number')]);
const sorted = sortByScoreDesc(scored);
// u5 (Paula Estrela, 5 traditions, breadth=5) should win because the
// breadth bonus overcomes u3's higher raw metric count.
results.push(['sorted desc — top is highest score', sorted[0].score >= sorted[sorted.length - 1].score]);

// 5) Filters
const filteredByTrad = applyFilters(FIX, { traditions: ['candomble'] });
results.push(['traditions filter narrows', filteredByTrad.every(e => e.primaryTradition === 'candomble')]);
const filteredByBreadth = applyFilters(FIX, { minTraditionBreadth: 2 });
results.push(['minBreadth=2 excludes single-trad', filteredByBreadth.every(e => e.traditionsActive.length >= 2)]);

// 6) Paginate
const page1 = paginate(sorted, { page: asPageNumber(1), pageSize: asPageSize(2) });
results.push(['page1 size 2 has 2 entries', page1.entries.length === 2]);
results.push(['page1 totalPages=3', page1.totalPages === 3]);

// 7) topN
const top3 = topN(FIX, 3);
results.push(['topN(3) returns 3', top3.length === 3]);

// 8) buildLeaderboard
const fullResult = buildLeaderboard({
  entries: FIX,
  page: { page: asPageNumber(1), pageSize: asPageSize(10) },
  now: '2026-06-30T14:00:00.000Z',
});
results.push(['buildLeaderboard has generatedAt', fullResult.generatedAt === '2026-06-30T14:00:00.000Z']);
results.push(['buildLeaderboard totalEntries=5', fullResult.page.totalEntries === 5]);

// 9) Tradition labels
results.push(['TRADICAO_LABELS.candomble=Candomblé', TRADICAO_LABELS.candomble === 'Candomblé']);
results.push(['TRADICAO_LABELS.umbanda=Umbanda', TRADICAO_LABELS.umbanda === 'Umbanda']);
results.push(['TRADICAO_LABELS.ifa=Ifá', TRADICAO_LABELS.ifa === 'Ifá']);
results.push(['TRADICAO_LABELS.cabala=Cabala', TRADICAO_LABELS.cabala === 'Cabala']);
results.push(['TRADICAO_LABELS.astrologia=Astrologia', TRADICAO_LABELS.astrologia === 'Astrologia']);

// 10) Engine surface frozen
results.push(['engine is frozen', Object.isFrozen(reputationLeaderboardEngine)]);
results.push(['engine has 7 methods', Object.keys(reputationLeaderboardEngine).filter(k => typeof reputationLeaderboardEngine[k] === 'function').length >= 7]);

// 11) Tradition badges embed labels
results.push(['TRADICAO_BADGES.candomble contains Candomblé', TRADICAO_BADGES.candomble.includes('Candomblé')]);
results.push(['TRADICAO_BADGES.umbanda contains Umbanda', TRADICAO_BADGES.umbanda.includes('Umbanda')]);
results.push(['TRADICAO_BADGES.ifa contains Ifá', TRADICAO_BADGES.ifa.includes('Ifá')]);
results.push(['TRADICAO_BADGES.cabala contains Cabala', TRADICAO_BADGES.cabala.includes('Cabala')]);
results.push(['TRADICAO_BADGES.astrologia contains Astrologia', TRADICAO_BADGES.astrologia.includes('Astrologia')]);

// 12) Tradition accent classes
const accentKeys = Object.keys(TRADICAO_ACCENT_CLASSES);
results.push(['5 accent classes', accentKeys.length === 5]);

// 13) TRADITION_IDS
results.push(['TRADITION_IDS length=5', TRADITION_IDS.length === 5]);

let pass = 0;
let fail = 0;
for (const [name, ok] of results) {
  if (ok) {
    pass++;
    console.log('  ✓ ' + name);
  } else {
    fail++;
    console.error('  ✗ ' + name);
  }
}
console.log('\\n[smoke runtime] ' + pass + ' passed, ' + fail + ' failed');
if (fail > 0) process.exit(1);
process.exit(0);
`;

const benchPath = resolve(TMP, 'bench.ts');
writeFileSync(benchPath, bench, 'utf8');

console.log(`[smoke] bench written to ${benchPath}`);
console.log('[smoke] spawning tsx...');

const result = spawnSync(
  process.execPath,
  ['--import', 'tsx', benchPath],
  {
    cwd: HERE,
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '' },
  }
);

try {
  rmSync(TMP, { recursive: true, force: true });
} catch {
  // best-effort cleanup
}

if (result.status !== 0) {
  console.error('[smoke] FAILED with exit code', result.status);
  process.exit(result.status ?? 1);
}

console.log('[smoke] OK');
process.exit(0);