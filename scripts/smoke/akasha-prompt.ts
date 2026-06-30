/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-B — scripts/smoke/akasha-prompt.ts
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Runtime entry point. Mirrors the in-engine smoke but is reachable from
 * the repo root via `node --experimental-strip-types scripts/smoke/akasha-prompt.ts`.
 *
 * Self-importing: re-exports the smoke logic from the engine smoke file
 * via a dynamic import. Cycle 81 lesson: runtime is permissive about
 * types but TSC under Bundler resolution isn't. Use `@ts-nocheck` for
 * node:* imports — no node:* imports here, but we still keep the runtime
 * minimal.
 */

// @ts-nocheck — runtime entry; types are checked by the spec harness.
/* eslint-disable */

declare const process: { exit(code: number): never };

// Reuse the engine smoke logic verbatim.
async function main(): Promise<void> {
  const smokeMod = await import('../../src/lib/engines/akasha-prompt.smoke.ts');
  // The engine smoke runs at module-level when imported for side effects.
  void smokeMod;
  // If we got here without an exit(1), the smoke passed.
  console.log('  scripts/smoke/akasha-prompt.ts: SMOKE re-imported OK');
}

main().catch((err: unknown) => {
  console.error('  scripts/smoke/akasha-prompt.ts: FATAL', err);
  process.exit(2);
});
