/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-A — EVENTS PAGE · SPEC (contracts via source inspection)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 87 (B2 retry of W86-D) · 2026-06-30
 *
 * Self-running harness (no vitest/jsdom). The page is React + 'use client'
 * with JSX/Next.js imports not safe to execute under --experimental-strip-types,
 * so we assert structural contracts via readFileSync + regex (W86-B lesson).
 *
 * Coverage (≥25 assertions):
 *   - Page is a Client Component ('use client' directive at top)
 *   - Imports engine + adapter from @/engine/events barrel
 *   - aria-live="polite" on filter result count
 *   - role="dialog" + aria-modal on RSVP modal
 *   - LGPD consent checkbox (required) — gate via disabled={!canSubmit}
 *   - data-testid="event-card" on each EventCard
 *   - data-testid="rsvp-name" / "rsvp-guests" / "rsvp-lgpd" / "rsvp-submit"
 *   - 7 tradição filter chips rendered via ALL_TRADIÇÕES.map
 *   - 4 event type chips rendered via ALL_TYPES.map
 *   - 3 modality icons (◆ ◉ ◐) for presencial/online/hibrido
 *   - mobile-first grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
 *   - 7 tradição symbols (✦🪶☩◈☸☉☬) via TRADIÇÃO_SYMBOL map
 *   - Mobile filter chips render via isDesktop check
 *   - Capacity bar with role="progressbar"
 *   - aria-pressed on chips (toggle state)
 *   - ESC key handler closes modal
 *   - Free/Paid/Todos price filter
 *   - Date range filter (from/to)
 *   - Waitlist visual when isFull=true
 *   - Layout uses buildPageMetadata + SeoJsonLd
 *
 * Sacred-cultural sensitivity:
 *   - 7 tradição symbols preserved verbatim (✦🪶☩◈☸☉☬)
 *   - Sacred terms preserved: Tradição, Caboclo, Orixá, Axé (not banned vocabulary)
 *   - LGPD consent checkbox is REQUIRED before submit
 */

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

function assertFalse(v: unknown, label?: string): void {
  if (v) {
    throw new Error(
      `assertFalse FAIL${label ? ' (' + label + ')' : ''}: got truthy ${String(v)}`,
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
const LAYOUT_PATH = join(HERE, 'layout.tsx');

const pageSource = readFileSync(PAGE_PATH, 'utf8');
const layoutSource = readFileSync(LAYOUT_PATH, 'utf8');

// ════════════════════════════════════════════
// LAYOUT SPECS
// ════════════════════════════════════════════

it('layout.tsx exists and is non-empty', () => {
  assertTrue(layoutSource.length > 100);
});

it('layout.tsx exports metadata with title about events/círculos', () => {
  assertIncludes(layoutSource, 'buildPageMetadata');
  assertMatches(layoutSource, /title.*[Ee]vent/);
});

it('layout.tsx renders SeoJsonLd with WebPage schema', () => {
  assertIncludes(layoutSource, 'SeoJsonLd');
  assertIncludes(layoutSource, 'WebPage');
});

it('layout.tsx sets canonical /events path', () => {
  assertIncludes(layoutSource, "path: '/events'");
});

// ════════════════════════════════════════════
// PAGE SPECS — Client Component contract
// ════════════════════════════════════════════

it('page.tsx exists and is non-empty', () => {
  assertTrue(pageSource.length > 100);
});

it('page.tsx is a Client Component (top-level "use client")', () => {
  const head = pageSource.slice(0, 200);
  assertMatches(head, /^['"]use client['"]/);
});

it('page.tsx imports engine barrel from @/engine/events', () => {
  assertIncludes(pageSource, "from '@/engine/events'");
  assertIncludes(pageSource, 'createEventsEngine');
  assertIncludes(pageSource, 'InMemoryEventsAdapter');
});

it('page.tsx exports default EventsPage function', () => {
  assertMatches(pageSource, /export default function EventsPage/);
});

// ════════════════════════════════════════════
// ARIA contracts
// ════════════════════════════════════════════

it('page.tsx renders aria-live="polite" on result count', () => {
  assertMatches(pageSource, /aria-live="polite"/);
});

it('page.tsx renders role="dialog" + aria-modal on RSVP modal', () => {
  assertMatches(pageSource, /role="dialog"/);
  assertIncludes(pageSource, 'aria-modal="true"');
  assertIncludes(pageSource, 'aria-labelledby="rsvp-modal-title"');
});

it('page.tsx renders role="progressbar" on capacity bar', () => {
  assertMatches(pageSource, /role="progressbar"/);
});

it('page.tsx uses aria-pressed on tradição chips', () => {
  assertMatches(pageSource, /aria-pressed=\{active\}/);
});

it('page.tsx uses aria-label on filter chips with Tradição label', () => {
  assertMatches(pageSource, /aria-label=\{`Filtrar por \$\{TRADIÇÃO_LABEL/);
});

// ════════════════════════════════════════════
// LGPD gate (sacred-cultural safety)
// ════════════════════════════════════════════

it('page.tsx LGPD checkbox is REQUIRED (HTML required attr)', () => {
  assertMatches(pageSource, /type="checkbox"[\s\S]{0,200}required/);
});

it('page.tsx canSubmit requires lgpdConsent + name.trim().length >= 2', () => {
  assertMatches(
    pageSource,
    /canSubmit\s*=\s*name\.trim\(\)\.length\s*>=\s*2\s*&&\s*lgpdConsent/,
  );
});

it('page.tsx submit button is disabled when !canSubmit', () => {
  assertMatches(pageSource, /disabled=\{!canSubmit\}/);
});

it('page.tsx shows LGPD_VERSION in consent text', () => {
  assertMatches(pageSource, /LGPD[\s\S]{0,40}2026-01/);
});

// ════════════════════════════════════════════
// data-testid wiring
// ════════════════════════════════════════════

it('page.tsx has data-testid on EventCard', () => {
  assertIncludes(pageSource, 'data-testid="event-card"');
});

it('page.tsx has data-testid on events page wrapper', () => {
  assertIncludes(pageSource, 'data-testid="events-page"');
});

it('page.tsx has data-testid on events count banner', () => {
  assertIncludes(pageSource, 'data-testid="events-count"');
});

it('page.tsx has data-testid on RSVP form fields', () => {
  assertIncludes(pageSource, 'data-testid="rsvp-name"');
  assertIncludes(pageSource, 'data-testid="rsvp-guests"');
  assertIncludes(pageSource, 'data-testid="rsvp-lgpd"');
  assertIncludes(pageSource, 'data-testid="rsvp-submit"');
});

// ════════════════════════════════════════════
// 7 Tradições + symbols
// ════════════════════════════════════════════

it('page.tsx renders ALL_TRADIÇÕES.map with 7 entries', () => {
  assertMatches(pageSource, /ALL_TRADIÇÕES\.map/);
  assertMatches(
    pageSource,
    /'cigano',\s*'candomble',\s*'umbanda',\s*'ifa',\s*'cabala',\s*'astrologia',\s*'tantra'/,
  );
});

it('page.tsx uses TRADIÇÃO_SYMBOL for visual chips', () => {
  assertIncludes(pageSource, 'TRADIÇÃO_SYMBOL[tradição]');
});

it('page.tsx preserves all 7 tradição symbols verbatim', () => {
  const symbols = ['✦', '🪶', '☩', '◈', '☸', '☉', '☬'];
  for (const sym of symbols) {
    assertIncludes(pageSource, sym, `symbol ${sym}`);
  }
});

// ════════════════════════════════════════════
// 4 Event types + 3 modalities
// ════════════════════════════════════════════

it('page.tsx renders ALL_TYPES.map with 4 entries', () => {
  assertMatches(pageSource, /ALL_TYPES\.map/);
  assertMatches(
    pageSource,
    /'workshop',\s*'ceremony',\s*'circle',\s*'lecture'/,
  );
});

it('page.tsx renders modality icons (◆ ◉ ◐)', () => {
  assertMatches(pageSource, /MODALITY_ICON/);
  assertMatches(pageSource, /presencial:\s*'◆'[\s\S]*online:\s*'◉'[\s\S]*hibrido:\s*'◐'/);
});

// ════════════════════════════════════════════
// Mobile-first responsive
// ════════════════════════════════════════════

it('page.tsx uses grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for cards', () => {
  assertIncludes(pageSource, 'grid-cols-1');
  assertIncludes(pageSource, 'md:grid-cols-2');
  assertIncludes(pageSource, 'lg:grid-cols-3');
});

it('page.tsx uses matchMedia with min-width: 720px breakpoint', () => {
  assertMatches(pageSource, /min-width:\s*720px/);
});

it('page.tsx renders mobile filter chips when !isDesktop', () => {
  assertMatches(pageSource, /!isDesktop/);
  assertMatches(pageSource, /overflow-x-auto/);
});

// ════════════════════════════════════════════
// Modal interactions
// ════════════════════════════════════════════

it('page.tsx RSVP modal closes on Escape key', () => {
  assertIncludes(pageSource, "e.key === 'Escape'");
});

it('page.tsx RSVP modal closes on backdrop click', () => {
  assertMatches(pageSource, /e\.target === e\.currentTarget/);
});

it('page.tsx RSVP modal shows success status when result.kind === success', () => {
  assertIncludes(pageSource, "result?.kind === 'success'");
  assertIncludes(pageSource, 'role="status"');
});

it('page.tsx RSVP modal shows waitlist message when kind === waitlist', () => {
  assertIncludes(pageSource, "result?.kind === 'waitlist'");
  assertMatches(pageSource, /lista de espera/);
});

it('page.tsx RSVP modal shows error alert on failure', () => {
  assertIncludes(pageSource, 'role="alert"');
  assertIncludes(pageSource, 'aria-live="assertive"');
});

// ════════════════════════════════════════════
// Filters
// ════════════════════════════════════════════

it('page.tsx renders Price filter with Gratuito / Pago / Todos', () => {
  assertIncludes(pageSource, 'Gratuito');
  assertIncludes(pageSource, 'Pago');
  assertMatches(pageSource, /free:\s*undefined/);
});

it('page.tsx renders Date range filter (from/to inputs)', () => {
  assertMatches(pageSource, /type="date"/);
  assertMatches(pageSource, /filter\.from/);
  assertMatches(pageSource, /filter\.to/);
});

// ════════════════════════════════════════════
// Capacity + waitlist visual
// ════════════════════════════════════════════

it('page.tsx shows "Lotado · waitlist" badge when isFull=true', () => {
  assertIncludes(pageSource, 'Lotado · waitlist');
});

it('page.tsx shows "Vagas ilimitadas" when capacity=0', () => {
  assertIncludes(pageSource, 'Vagas ilimitadas');
});

it('page.tsx RSVP button text changes between "Confirmar" and "Entrar na lista"', () => {
  assertIncludes(pageSource, 'Confirmar presença');
  assertIncludes(pageSource, 'Entrar na lista de espera');
});

// ════════════════════════════════════════════
// Sacred-cultural sensitivity
// ════════════════════════════════════════════

it('page.tsx does NOT contain banned vocabulary (amarração/vinculação)', () => {
  const banned = ['amarração', 'amarre', 'vinculação', 'vincular', 'prejudicar'];
  for (const term of banned) {
    assertFalse(
      pageSource.toLowerCase().includes(term),
      `banned term "${term}" absent from page`,
    );
  }
});

it('page.tsx preserves Tradição accent in label map', () => {
  assertMatches(pageSource, /Tradição[A-Z][a-zA-Z]*/);
});

it('page.tsx shows formatDate with pt-BR locale', () => {
  assertMatches(pageSource, /pt-BR/);
});

// ════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════

async function runSpecs(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  W87-A · EVENTS PAGE SPEC (source-inspection)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Source: ${PAGE_PATH}`);
  console.log(`  Layout: ${LAYOUT_PATH}`);
  console.log('');

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
