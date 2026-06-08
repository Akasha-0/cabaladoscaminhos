import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Static file-structure audit for the v0.0.4-T2 "shutdown formal do legacy-cockpit".
 *
 * Background: Doc 25 §11 records that `apps/legacy-cockpit/` was removed in the
 * Akasha v2 refactor (`53c8501c`, cycle 334). Cycle 351 (`00d4328a`) audited
 * `src/app/api/{operator,mesa-real,consult}/` and `src/app/cockpit/` and found
 * none. This test makes that audit reproducible so any regression is caught
 * by CI rather than a manual sweep.
 *
 * NOTE: This is a STRUCTURAL check, not a runtime 404 check. Runtime 404
 * requires a running dev server, which is deferred to v0.0.4-T1 (monorepo).
 */
const SRC_ROOT = join(process.cwd(), 'src');
const APP_DIR = join(SRC_ROOT, 'app');

function dirExistsSafe(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function listRouteFiles(dir: string): string[] {
  if (!dirExistsSafe(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listRouteFiles(full));
    } else if (entry === 'route.ts' || entry === 'route.tsx') {
      out.push(full);
    }
  }
  return out;
}

function listPageFiles(dir: string): string[] {
  if (!dirExistsSafe(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listPageFiles(full));
    } else if (entry === 'page.tsx' || entry === 'page.ts') {
      out.push(full);
    }
  }
  return out;
}

describe('v0.0.4-T2 — legacy B2B shutdown (structural audit)', () => {
  it('has no route.ts under src/app/api/operator (legacy B2B)', () => {
    const routes = listRouteFiles(join(APP_DIR, 'api', 'operator'));
    expect(routes).toEqual([]);
  });

  it('has no route.ts under src/app/api/mesa-real (legacy B2B)', () => {
    const routes = listRouteFiles(join(APP_DIR, 'api', 'mesa-real'));
    expect(routes).toEqual([]);
  });

  it('has no route.ts under src/app/api/consult (legacy B2B — distinct from /api/akasha/consult)', () => {
    const routes = listRouteFiles(join(APP_DIR, 'api', 'consult'));
    expect(routes).toEqual([]);
  });

  it('has no page.tsx under src/app/cockpit (legacy B2B)', () => {
    const pages = listPageFiles(join(APP_DIR, 'cockpit'));
    expect(pages).toEqual([]);
  });

  it('keeps src/middleware.ts removed (cycle 351 audit)', () => {
    const middleware = join(SRC_ROOT, 'middleware.ts');
    expect(existsSync(middleware)).toBe(false);
  });

  it('preserves B2C surface: /api/akasha/consult is the Akasha consulta endpoint, not legacy', () => {
    const akashaConsult = join(APP_DIR, 'api', 'akasha', 'consult');
    expect(dirExistsSafe(akashaConsult)).toBe(true);
  });
});
