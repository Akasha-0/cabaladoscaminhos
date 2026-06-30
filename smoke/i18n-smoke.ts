/**
 * i18n-smoke.ts — Aggregating smoke runner (cycle 60+ canonical pattern).
 *
 * Dynamically imports each spec module and aggregates pass/fail.
 * Mirrors vitest API 1:1 — works without the vitest binary.
 *
 * Usage:
 *   node --experimental-strip-types ./smoke/i18n-smoke.ts
 */

import { runI18nCoreSpec } from '../spec/i18n-core.spec.ts';
import { runLocalesPluralizationSpec } from '../spec/locales-pluralization.spec.ts';
import { runFormattingSpec } from '../spec/formatting.spec.ts';
import { runNamespacesSpec } from '../spec/namespaces.spec.ts';

interface SpecResult {
  passed: number;
  failed: number;
  its: number;
}

const specs: Array<{ name: string; run: () => SpecResult }> = [
  { name: 'i18n-core', run: runI18nCoreSpec },
  { name: 'locales-pluralization', run: runLocalesPluralizationSpec },
  { name: 'formatting', run: runFormattingSpec },
  { name: 'namespaces', run: runNamespacesSpec },
];

let totalPassed = 0;
let totalFailed = 0;
let totalIts = 0;

console.log('\n═══════════════════════════════════════════════════════');
console.log('  W71-A i18n-multilang-engine SMOKE');
console.log('═══════════════════════════════════════════════════════');

for (const spec of specs) {
  const r = spec.run();
  totalPassed += r.passed;
  totalFailed += r.failed;
  totalIts += r.its;
  const status = r.failed === 0 ? '✅ PASS' : '❌ FAIL';
  console.log(`\n${status}  ${spec.name}: ${r.passed}/${r.its} (failed: ${r.failed})`);
}

console.log('\n───────────────────────────────────────────────────────');
console.log(`  TOTAL: ${totalPassed}/${totalIts} passed (failed: ${totalFailed})`);
console.log('───────────────────────────────────────────────────────\n');

if (totalFailed > 0) {
  console.log('SMOKE FAILED');
  process.exit(1);
}

console.log('ALL SMOKE PASS');
process.exit(0);