#!/usr/bin/env node
// W70 Synastry — smoke aggregator. Loads each spec via dynamic import() and aggregates.
// Per cycle 69 lesson 6: `import()` of `file:` URL must NOT be wrapped in pathToFileURL.

const SPEC_NAMES = [
  'synastry',
  'aspects',
  'houses-overlay',
  'composite',
];

async function main() {
  const totals = { passed: 0, failed: 0, assertions: 0, sections: 0, files: 0 };
  const sectionLog = [];

  for (const name of SPEC_NAMES) {
    const url = new URL(`./../${name}.spec.ts`, import.meta.url);
    const label = `${name}.spec.ts`;
    let mod;
    try {
      mod = await import(url.href);
    } catch (err) {
      totals.failed += 1;
      sectionLog.push(`[${label}] ❌ import threw: ${err && err.message ? err.message : err}`);
      continue;
    }
    if (typeof mod.runXxxSpec !== 'function') {
      sectionLog.push(`[${label}] ⚠️ runXxxSpec export missing`);
      continue;
    }
    let result;
    try {
      result = await mod.runXxxSpec();
    } catch (err) {
      totals.failed += 1;
      sectionLog.push(`[${label}] ❌ threw: ${err && err.message ? err.message : err}`);
      continue;
    }
    totals.files += 1;
    totals.passed += result.passed;
    totals.failed += result.failed;
    totals.assertions += result.assertions;
    totals.sections += 1;
    if (result.failed > 0) {
      sectionLog.push(`[${label}] ❌ ${result.failed}/${result.assertions} FAIL — ${result.failures.length} failure(s) logged`);
      for (const f of result.failures.slice(0, 4)) {
        sectionLog.push(`   - ${f.assertion}: ${f.detail ?? ''}`);
      }
    } else {
      sectionLog.push(`[${label}] ✅ ${result.passed}/${result.assertions}`);
    }
  }

  console.log('═'.repeat(60));
  console.log('W70 Synastry — smoke aggregator');
  console.log('═'.repeat(60));
  for (const line of sectionLog) console.log(line);
  console.log('═'.repeat(60));
  console.log(`TOTAL: ${totals.passed}/${totals.assertions} PASS · ${totals.failed} FAIL · ${totals.sections} sections · ${totals.files} specs`);
  console.log('═'.repeat(60));
  if (totals.failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('smoke-runtime.mjs: fatal', err);
  process.exit(2);
});
