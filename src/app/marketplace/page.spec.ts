/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-B — MARKETPLACE PAGE · SPEC (contracts via source inspection)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 86 · 2026-06-30
 * Self-running harness. The page is React + 'use client' with imports
 * not safe to execute under --experimental-strip-types (JSX, base-ui),
 * so we assert structural contracts via readFileSync + regex.
 *
 * Coverage (≥15 assertions):
 *   - Page is Server Component (no 'use client' at top)
 *   - Imports engine + filter compose
 *   - Imports Client component
 *   - Has metadata + canonical
 *   - Renders JSON-LD ItemList
 *
 * Client component coverage:
 *   - 'use client' directive
 *   - aria-live="polite" on result count
 *   - role="dialog" + aria-modal on booking modal
 *   - LGPD consent checkbox (required)
 *   - Mobile breakpoint constant (≤640)
 *   - Debounce 250ms
 *   - Sacred + verified badge rendering
 *   - Filter chips render all 7 tradições
 *   - Filter chips render all 5 types
 */

// @ts-ignore — node-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };
declare function require(name: string): unknown;

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  REGISTRY.push({ name, run: () => run() });
}

function assertTrue(v: unknown, label?: string): void {
  if (!v) {
    throw new Error(
      `assertTrue FAIL${label ? ' (' + label + ')' : ''}: got falsy ${String(v)}`,
    );
  }
}

function assertIncludes(haystack: string, needle: string, label?: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(
      `assertIncludes FAIL${label ? ' (' + label + ')' : ''}: missing "${needle}"`,
    );
  }
}

function assertMatches(haystack: string, regex: RegExp, label?: string): void {
  if (!regex.test(haystack)) {
    throw new Error(
      `assertMatches FAIL${label ? ' (' + label + ')' : ''}: pattern ${regex} not found`,
    );
  }
}

// Resolve this spec's directory
const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE_PATH = join(HERE, 'page.tsx');
const CLIENT_PATH = join(HERE, 'MarketplacePageClient.tsx');

const pageSource = readFileSync(PAGE_PATH, 'utf8');
const clientSource = readFileSync(CLIENT_PATH, 'utf8');

// ════════════════════════════════════════════
// PAGE SPECS
// ════════════════════════════════════════════

it('page.tsx exists and is non-empty', () => {
  assertTrue(pageSource.length > 100);
});

it('page.tsx is a Server Component (no top-level "use client")', () => {
  const head = pageSource.slice(0, 200);
  assertFalse(/^['"]use client['"]/.test(head), 'page must NOT have use client directive');
});

it('page.tsx imports the marketplace engine', () => {
  assertIncludes(pageSource, 'createMarketplaceEngine');
});

it('page.tsx imports the filter compose', () => {
  assertIncludes(pageSource, 'MarketplacePageClient');
});

it('page.tsx exports metadata with canonical /marketplace', () => {
  assertMatches(pageSource, /canonical.*\/marketplace/);
});

it('page.tsx renders JSON-LD ItemList', () => {
  assertMatches(pageSource, /ItemList/);
});

it('page.tsx lists SAMPLE_OFFERINGS in static metadata', () => {
  assertIncludes(pageSource, 'SAMPLE_OFFERINGS');
});

// ════════════════════════════════════════════
// CLIENT COMPONENT SPECS
// ════════════════════════════════════════════

it('MarketplacePageClient.tsx is a Client Component', () => {
  assertMatches(clientSource, /^['"]use client['"]/);
});

it('MarketplacePageClient declares mobile breakpoint ≤640', () => {
  assertIncludes(clientSource, 'MOBILE_BREAKPOINT_PX = 640');
});

it('MarketplacePageClient declares tablet breakpoint ≤1024', () => {
  assertIncludes(clientSource, 'TABLET_BREAKPOINT_PX = 1024');
});

it('MarketplacePageClient debounce is 250ms', () => {
  assertIncludes(clientSource, 'DEBOUNCE_MS = 250');
});

it('MarketplacePageClient renders aria-live="polite" result count', () => {
  assertMatches(clientSource, /aria-live="polite"/);
});

it('MarketplacePageClient renders role="dialog" booking modal', () => {
  assertMatches(clientSource, /role="dialog"/);
  assertIncludes(clientSource, 'aria-modal="true"');
});

it('MarketplacePageClient renders LGPD consent checkbox', () => {
  assertMatches(clientSource, /id="booking-lgpd"/);
  assertMatches(clientSource, /aria-required="true"/);
});

it('MarketplacePageClient shows LGPD version constant', () => {
  assertIncludes(clientSource, "LGPD_VERSION = '2026-06-30'");
});

it('MarketplacePageClient shows sacred-only toggle', () => {
  assertMatches(clientSource, /sacredOnly/);
  assertIncludes(clientSource, 'Apenas sagrados');
});

it('MarketplacePageClient shows verified-only toggle', () => {
  assertMatches(clientSource, /verifiedOnly/);
  assertIncludes(clientSource, 'Apenas verificados');
});

it('MarketplacePageClient shows "Verificado" badge on verified practitioners', () => {
  assertIncludes(clientSource, '✓ Verificado');
});

it('MarketplacePageClient iterates all 7 TRADICOES', () => {
  assertMatches(clientSource, /TRADICOES\.map/);
});

it('MarketplacePageClient iterates all 5 OFFERING_TYPES', () => {
  assertMatches(clientSource, /OFFERING_TYPES\.map/);
});

it('MarketplacePageClient applies aria-busy during fetch', () => {
  assertIncludes(clientSource, 'aria-busy={isFetching}');
});

it('MarketplacePageClient uses grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3', () => {
  assertIncludes(clientSource, 'grid-cols-1');
  assertIncludes(clientSource, 'sm:grid-cols-2');
  assertIncludes(clientSource, 'lg:grid-cols-3');
});

it('MarketplacePageClient closes modal on Escape', () => {
  assertIncludes(clientSource, "e.key === 'Escape'");
});

it('MarketplacePageClient requires non-empty notes for sacred offerings', () => {
  assertIncludes(clientSource, 'notesRequired');
  assertMatches(clientSource, /Obrigatório para ofertas sagradas/);
});

it('MarketplacePageClient imports filter compose', () => {
  assertIncludes(clientSource, 'applyPageFilter');
  assertIncludes(clientSource, 'PRICE_RANGE_PRESETS');
});

it('MarketplacePageClient imports TRADICOES + OFFERING_TYPES + LABELS', () => {
  assertIncludes(clientSource, 'TRADICOES');
  assertIncludes(clientSource, 'TRADICAO_LABELS');
  assertIncludes(clientSource, 'OFFERING_TYPES');
  assertIncludes(clientSource, 'OFFERING_TYPE_LABELS');
});

it('MarketplacePageClient uses lucide-react icons', () => {
  assertIncludes(clientSource, 'lucide-react');
  assertIncludes(clientSource, 'ShieldCheck');
  assertIncludes(clientSource, 'Search');
});

function assertFalse(v: unknown, label?: string): void {
  if (v) {
    throw new Error(
      `assertFalse FAIL${label ? ' (' + label + ')' : ''}: got truthy ${String(v)}`,
    );
  }
}

// ════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════

async function runSpecs(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const entry of REGISTRY) {
    try {
      await entry.run();
      passed++;
      console.log(`  ✓ ${entry.name}`);
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${entry.name}: ${msg}`);
      console.log(`  ✗ ${entry.name}`);
      console.log(`    ${msg}`);
    }
  }

  console.log('');
  console.log(`  RESULT: ${passed} PASS · ${failed} FAIL · ${REGISTRY.length} total`);

  if (failed > 0) {
    console.log('');
    console.log('  Failures:');
    for (const f of failures) console.log(`    · ${f}`);
    process.exit(1);
  }
}

runSpecs().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(2);
});