#!/usr/bin/env node
/**
 * Wave 12.4 — Per-route bundle size budget check.
 *
 * Reads the .next/build-manifest.json + .next/app-build-manifest.json
 * files emitted by `next build` and reports the "First Load JS" size
 * for every static App Router route.
 *
 * Fails the process (non-zero exit) if any route exceeds the budget
 * (default 250 KB, matching `maxEntrypointSize` in next.config.ts).
 *
 * Run: `pnpm --filter akasha-portal budget:check`
 *
 * The 250 KB threshold lines up with the "First Load JS" column in
 * the build report; on a 4G mobile target we want TTI under 1.5 s
 * for the auth + dashboard surfaces.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const BUDGET_BYTES = Number(process.env.BUNDLE_BUDGET_BYTES ?? 250 * 1024);
const BUILD_DIR = path.resolve('.next');

if (!existsSync(BUILD_DIR)) {
  console.error(`✗ No .next/ directory found. Run \`next build\` first.`);
  process.exit(1);
}

// App Router static route manifest (Next.js 14+).
const APP_MANIFEST = path.join(BUILD_DIR, 'app-build-manifest.json');
const PAGES_MANIFEST = path.join(BUILD_DIR, 'build-manifest.json');

const manifestSources = [APP_MANIFEST, PAGES_MANIFEST].filter((p) => existsSync(p));

if (manifestSources.length === 0) {
  console.error(`✗ Neither app-build-manifest.json nor build-manifest.json found in ${BUILD_DIR}.`);
  process.exit(1);
}

/** Sum the gzipped byte size of every chunk referenced by a route. */
async function measureRoute(route, chunks) {
  let total = 0;
  for (const chunk of chunks) {
    const chunkPath = path.join(BUILD_DIR, chunk);
    if (!existsSync(chunkPath)) continue;
    const buf = await readFile(chunkPath);
    total += zlib.gzipSync(buf).length; // closer to what the wire actually costs
  }
  return total;
}

const routeMap = new Map();
for (const source of manifestSources) {
  const raw = await readFile(source, 'utf8');
  const parsed = JSON.parse(raw);
  // App Router manifest shape: { pages: { "/route": { chunks: [...] } } }
  if (parsed.pages) {
    for (const [route, def] of Object.entries(parsed.pages)) {
      if (routeMap.has(route)) continue;
      routeMap.set(route, def.chunks ?? []);
    }
  }
}

if (routeMap.size === 0) {
  console.error('✗ No routes discovered in build manifest.');
  process.exit(1);
}

const rows = [];
for (const [route, chunks] of routeMap) {
  const size = await measureRoute(route, chunks);
  rows.push({ route, size, chunks: chunks.length });
}

rows.sort((a, b) => b.size - a.size);

const fmtKb = (b) => `${(b / 1024).toFixed(1)} KB`;
const fmtPct = (b) => `${((b / BUDGET_BYTES) * 100).toFixed(0)}%`;

console.log(
  `\nFirst Load JS budget check — ${rows.length} routes, ` +
    `budget ${fmtKb(BUDGET_BYTES)} per route\n`,
);
console.log('Route'.padEnd(48), 'Size'.padStart(10), 'Budget'.padStart(10), 'Status');
console.log('-'.repeat(82));

let violations = 0;
for (const row of rows) {
  const over = row.size > BUDGET_BYTES;
  if (over) violations += 1;
  const status = over ? '✗ OVER' : '✓ ok';
  console.log(
    row.route.padEnd(48),
    fmtKb(row.size).padStart(10),
    fmtPct(row.size).padStart(10),
    ` ${status}`,
  );
}

console.log();
if (violations > 0) {
  console.error(
    `✗ ${violations} route(s) exceed the ${fmtKb(BUDGET_BYTES)} budget. ` +
      `See https://nextjs.org/docs/app/api-reference/next-config-js for tuning.`,
  );
  process.exit(1);
}
console.log(`✓ All ${rows.length} routes within budget.`);
