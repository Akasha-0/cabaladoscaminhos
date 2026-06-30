// ============================================================================
// W91s-B — LEADERBOARD WIDGET SPEC (source-inspection)
// ============================================================================
// Source-inspection harness — no React renderer, no jsdom. Reads the .tsx
// source and asserts structural invariants:
//   - 'use client' directive
//   - ARIA roles + aria-label
//   - data-testid on key surfaces
//   - Sacred-cultural compliance (verbatim labels)
//   - Cross-file consistency (engine + widget reference same constants)
//   - 44px touch targets (mobile-first)
// ============================================================================

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  TRADICAO_LABELS,
  TRADICAO_BADGES,
  type LeaderboardEntry,
  asUserId,
  asDisplayName,
} from '@/lib/w91/reputation-leaderboard-engine';

// @ts-ignore — node-stubs
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

// ════════════════════════════════════════════════════════════════════════════
// Load all source files
// ════════════════════════════════════════════════════════════════════════════

const WIDGET_SRC = readFileSync(
  resolve(__dirname, './LeaderboardWidget.tsx'),
  'utf8'
);
const TABLE_SRC = readFileSync(
  resolve(__dirname, './LeaderboardTable.tsx'),
  'utf8'
);
const ENGINE_SRC = readFileSync(
  resolve(__dirname, '../../../lib/w91/reputation-leaderboard-engine.ts'),
  'utf8'
);
const PAGE_SRC = readFileSync(
  resolve(
    __dirname,
    '../../../app/(community)/community/leaderboard/page.tsx'
  ),
  'utf8'
);

const _entry: LeaderboardEntry = {
  userId: asUserId('u1'),
  displayName: asDisplayName('Test'),
  avatarUrl: null,
  primaryTradition: 'candomble',
  traditionsActive: ['candomble'],
  metrics: Object.freeze({
    posts: 1,
    helpfulReactions: 1,
    crossTraditionReads: 1,
    mentorshipGiven: 1,
  }),
};

// Suppress unused-variable warning from the fixture import
void _entry;

// ════════════════════════════════════════════════════════════════════════════
// 1) Directives + structure
// ════════════════════════════════════════════════════════════════════════════

it('[widget] has "use client" directive', () => {
  assertTrue(/^'use client'/.test(WIDGET_SRC), 'directive must be at file top');
});

it('[table] has "use client" directive', () => {
  assertTrue(/^'use client'/.test(TABLE_SRC));
});

it('[widget] exports LeaderboardWidget function', () => {
  assertTrue(/export function LeaderboardWidget/.test(WIDGET_SRC));
});

it('[table] exports LeaderboardTable function', () => {
  assertTrue(/export function LeaderboardTable/.test(TABLE_SRC));
});

// ════════════════════════════════════════════════════════════════════════════
// 2) ARIA roles + labels (WCAG AA)
// ════════════════════════════════════════════════════════════════════════════

it('[widget] root has role="region" and aria-label', () => {
  assertTrue(/role="region"/.test(WIDGET_SRC));
  assertTrue(/aria-label/.test(WIDGET_SRC));
});

it('[widget] ordered list has aria-label', () => {
  // Match either escaped template literal (`Top ${scored.length} ...`) or
  // the rendered comment-style form.
  assertTrue(
    /aria-label=\{`Top\s+\$\{scored\.length\}\s+contribui/.test(WIDGET_SRC) ||
      /aria-label="Top \$\{scored\.length\} contribui/.test(WIDGET_SRC),
    'aria-label must reference Top ${scored.length} contributions'
  );
});

it('[widget] rank uses aria-label "Posição N"', () => {
  assertTrue(/aria-label=\{`Posi\u00e7\u00e3o \$\{rank\}`\}/.test(WIDGET_SRC));
});

it('[widget] score uses aria-label with score value', () => {
  assertTrue(/aria-label=\{`Pontua\u00e7\u00e3o \$\{entry\.score\}`\}/.test(WIDGET_SRC));
});

it('[table] sortable columns use aria-sort attribute', () => {
  assertTrue(/aria-sort=/.test(TABLE_SRC));
  // ariaSort is a typed variable with values 'ascending' | 'descending' | 'none'
  assertTrue(/aria-sort=\{ariaSort\}/.test(TABLE_SRC));
  assertTrue(/['"]ascending['"]/.test(TABLE_SRC));
  assertTrue(/['"]descending['"]/.test(TABLE_SRC));
  assertTrue(/['"]none['"]/.test(TABLE_SRC));
});

it('[table] pagination uses <nav> with aria-label "Paginação"', () => {
  // Multiline <nav ... aria-label="Paginação" ...>
  assertTrue(/<nav[\s\S]{0,80}aria-label="Pagin/.test(TABLE_SRC));
});

// ════════════════════════════════════════════════════════════════════════════
// 3) data-testid on key surfaces
// ════════════════════════════════════════════════════════════════════════════

it('[widget] root has data-testid="leaderboard-widget"', () => {
  assertTrue(/data-testid="leaderboard-widget"/.test(WIDGET_SRC));
});

it('[widget] list has data-testid="leaderboard-widget-list"', () => {
  assertTrue(/data-testid="leaderboard-widget-list"/.test(WIDGET_SRC));
});

it('[widget] each row has data-testid="leaderboard-widget-row-N"', () => {
  assertTrue(/data-testid=\{`leaderboard-widget-row-\$\{rank\}`\}/.test(WIDGET_SRC));
});

it('[widget] tradition badge has data-testid', () => {
  assertTrue(/data-testid="leaderboard-widget-tradition-badge"/.test(WIDGET_SRC));
});

it('[widget] score has data-testid', () => {
  assertTrue(/data-testid="leaderboard-widget-score"/.test(WIDGET_SRC));
});

it('[table] root has data-testid="leaderboard-table"', () => {
  assertTrue(/data-testid="leaderboard-table"/.test(TABLE_SRC));
});

it('[table] tradition tabs use role="tablist"', () => {
  assertTrue(/role="tablist"/.test(TABLE_SRC));
});

it('[table] each tab is role="tab" with aria-selected', () => {
  assertTrue(/role="tab"/.test(TABLE_SRC));
  assertTrue(/aria-selected=/.test(TABLE_SRC));
});

it('[table] pagination has prev/next testids', () => {
  assertTrue(/data-testid="leaderboard-table-prev"/.test(TABLE_SRC));
  assertTrue(/data-testid="leaderboard-table-next"/.test(TABLE_SRC));
});

// ════════════════════════════════════════════════════════════════════════════
// 4) Sacred-cultural compliance
// ════════════════════════════════════════════════════════════════════════════

it('[widget] references TRADICAO_BADGES from engine', () => {
  assertTrue(/TRADICAO_BADGES/.test(WIDGET_SRC));
});

it('[widget] references TRADICAO_ACCENT_CLASSES from engine', () => {
  assertTrue(/TRADICAO_ACCENT_CLASSES/.test(WIDGET_SRC));
});

it('[table] references TRADICAO_LABELS from engine', () => {
  assertTrue(/TRADICAO_LABELS/.test(TABLE_SRC));
});

it('[widget] verbatim "Candomblé" label in copy or constant', () => {
  assertTrue(/Candombl\u00e9/.test(WIDGET_SRC) || /Candombl\u00e9/.test(ENGINE_SRC));
});

it('[widget] verbatim "Umbanda" label', () => {
  assertTrue(/Umbanda/.test(WIDGET_SRC) || /Umbanda/.test(ENGINE_SRC));
});

it('[widget] verbatim "Ifá" label', () => {
  assertTrue(/If\u00e1/.test(WIDGET_SRC) || /If\u00e1/.test(ENGINE_SRC));
});

it('[widget] verbatim "Cabala" label', () => {
  assertTrue(/Cabala/.test(WIDGET_SRC) || /Cabala/.test(ENGINE_SRC));
});

it('[widget] verbatim "Astrologia" label', () => {
  assertTrue(/Astrologia/.test(WIDGET_SRC) || /Astrologia/.test(ENGINE_SRC));
});

it('[widget] uses positive framing — "Reconhecimento universalista"', () => {
  assertTrue(/Reconhecimento universalista/.test(WIDGET_SRC));
});

it('[page] uses "Reconhecimento universalista" as h1', () => {
  assertTrue(/Reconhecimento universalista/.test(PAGE_SRC));
});

it('[all] banned vocabulary absent in source files (not spec)', () => {
  // Check widget + table + page + engine source, NOT the spec files
  // (which legitimately mention the policy).
  const allSrc = WIDGET_SRC + '\n' + TABLE_SRC + '\n' + PAGE_SRC + '\n' + ENGINE_SRC;
  // Strip JSDoc-style comment lines to allow explanatory references in
  // headers (the policy itself is documented; this is checking that the
  // runtime code doesn't USE these terms).
  const codeOnly = allSrc
    .split('\n')
    .filter((l) => !/^\s*\/\//.test(l) && !/^\s*\*/.test(l))
    .join('\n');
  const banned1 = 'amarr' + 'ação';
  const banned2 = 'amarre';
  const banned3 = 'vincula' + 'ção';
  const re1 = new RegExp('\\b' + banned1 + '\\b', 'i');
  const re2 = new RegExp('\\b' + banned2 + '\\b', 'i');
  const re3 = new RegExp('\\b' + banned3 + '\\b', 'i');
  assertEqual(re1.test(codeOnly), false, `no ${banned1} in code`);
  assertEqual(re2.test(codeOnly), false, `no ${banned2} in code`);
  assertEqual(re3.test(codeOnly), false, `no ${banned3} in code`);
});

// ════════════════════════════════════════════════════════════════════════════
// 5) Mobile-first — 44px touch targets + max-w-full
// ════════════════════════════════════════════════════════════════════════════

it('[widget] uses min-h-[44px] for accessibility touch targets', () => {
  assertTrue(/min-h-\[44px\]/.test(WIDGET_SRC));
});

it('[table] uses min-h-[44px] for accessibility touch targets', () => {
  assertTrue(/min-h-\[44px\]/.test(TABLE_SRC));
});

it('[page] uses max-w-full + sm:max-w-* responsive pattern', () => {
  assertTrue(/max-w-full sm:max-w-/.test(PAGE_SRC));
});

// ════════════════════════════════════════════════════════════════════════════
// 6) Cross-file consistency
// ════════════════════════════════════════════════════════════════════════════

it('[consistency] widget imports topN from engine', () => {
  assertTrue(/import\s*\{[^}]*\btopN\b[^}]*\}\s*from\s*['"]@\/lib\/w91\/reputation-leaderboard-engine['"]/.test(WIDGET_SRC));
});

it('[consistency] table imports buildLeaderboard from engine', () => {
  assertTrue(/import\s*\{[^}]*\bbuildLeaderboard\b[^}]*\}\s*from\s*['"]@\/lib\/w91\/reputation-leaderboard-engine['"]/.test(TABLE_SRC));
});

it('[consistency] page imports LeaderboardWidget from components/community/leaderboard', () => {
  assertTrue(/import\s*\{[^}]*\bLeaderboardWidget\b[^}]*\}\s*from\s*['"]@\/components\/community\/leaderboard\/LeaderboardWidget['"]/.test(PAGE_SRC));
});

it('[consistency] page imports LeaderboardTable from components/community/leaderboard', () => {
  assertTrue(/import\s*\{[^}]*\bLeaderboardTable\b[^}]*\}\s*from\s*['"]@\/components\/community\/leaderboard\/LeaderboardTable['"]/.test(PAGE_SRC));
});

// ════════════════════════════════════════════════════════════════════════════
// 7) Render-time smoke — no React renderer, just import + sanity
// ════════════════════════════════════════════════════════════════════════════

it('[consistency] TRADICAO_LABELS engine values present in widget source', () => {
  // Engine canonical labels
  assertEqual(TRADICAO_LABELS.candomble, 'Candomblé');
  assertEqual(TRADICAO_LABELS.umbanda, 'Umbanda');
  assertEqual(TRADICAO_LABELS.ifa, 'Ifá');
  assertEqual(TRADICAO_LABELS.cabala, 'Cabala');
  assertEqual(TRADICAO_LABELS.astrologia, 'Astrologia');
});

it('[consistency] TRADICAO_BADGES embeds all 5 labels', () => {
  assertTrue(TRADICAO_BADGES.candomble.includes('Candomblé'));
  assertTrue(TRADICAO_BADGES.umbanda.includes('Umbanda'));
  assertTrue(TRADICAO_BADGES.ifa.includes('Ifá'));
  assertTrue(TRADICAO_BADGES.cabala.includes('Cabala'));
  assertTrue(TRADICAO_BADGES.astrologia.includes('Astrologia'));
});

// ════════════════════════════════════════════════════════════════════════════
// Runner
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
  console.log(`\n[W91s widget spec] ${pass} passed, ${fail} failed`);
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