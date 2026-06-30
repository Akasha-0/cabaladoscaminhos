// ============================================================================
// Smoke tests W32 Quality (Wave 32 — 2026-06-30)
// ============================================================================
// Roda TODOS os selfCheck dos módulos W32 e exibe resultado.
// Use em CI ou manualmente: `node --experimental-strip-types scripts/smoke-w32-quality.mjs`
// ============================================================================

import { selfCheckCitation } from '../src/lib/ai/citation-system.ts';
import { selfCheckContext } from '../src/lib/ai/context-awareness.ts';
import { selfCheckMultiTradition } from '../src/lib/ai/multi-tradition.ts';
import { selfCheckSafety } from '../src/lib/ai/safety-rules.ts';
import { selfCheckMemory } from '../src/lib/ai/conversation-memory.ts';
import { selfCheckQuality } from '../src/lib/ai/quality-metrics.ts';
import { selfCheckW32Integration } from '../src/lib/ai/w32-integration.ts';
import { runConstitutionSmokeTests } from '../src/lib/ai/akasha-principles.ts';

const tests = [
  ['citation-system', selfCheckCitation],
  ['context-awareness', selfCheckContext],
  ['multi-tradition', selfCheckMultiTradition],
  ['safety-rules', selfCheckSafety],
  ['conversation-memory', selfCheckMemory],
  ['quality-metrics', selfCheckQuality],
  ['w32-integration', selfCheckW32Integration],
];

let allOk = true;
let totalPassed = 0;
const results = [];

for (const [name, fn] of tests) {
  try {
    const r = await fn();
    const ok = r.ok;
    if (ok) totalPassed++;
    results.push({ name, ok, errors: r.errors });
    if (ok) {
      console.log(`✓ ${name}: PASS (${r.errors.length} issues)`);
    } else {
      console.log(`✗ ${name}: FAIL (${r.errors.length} errors)`);
      r.errors.forEach((e) => console.log(`    - ${e}`));
      allOk = false;
    }
  } catch (err) {
    console.log(`✗ ${name}: CRASH`);
    console.log(`    ${err.message}`);
    allOk = false;
    results.push({ name, ok: false, errors: [err.message] });
  }
}

// Also run constitution tests
console.log('\n--- Constitution (W30-5) ---');
const constTests = runConstitutionSmokeTests();
const constPassed = constTests.filter((t) => t.pass).length;
constTests.forEach((t) => {
  console.log(`${t.pass ? '✓' : '✗'} ${t.name} — ${t.detail}`);
});
const allConstOk = constPassed === constTests.length;

console.log(`\n=== SUMMARY ===`);
console.log(`W32 modules: ${totalPassed}/${tests.length} PASS`);
console.log(`Constitution: ${constPassed}/${constTests.length} PASS`);

if (!allOk || !allConstOk) {
  process.exit(1);
}
console.log(`\n✓ ALL GREEN — W32 Quality ships.`);
