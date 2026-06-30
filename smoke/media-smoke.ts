/**
 * media-smoke.ts — W71-C aggregating smoke runner
 *
 * Loads each spec dynamically via `import()`, runs runXxxSpec(), aggregates
 * (passed, failed, assertions, its). Exits 0 only if all sections pass.
 *
 * Mirrors the pattern from cycles 60-70: dynamic `import()` of sibling
 * `.spec.ts` files in this repo. Note: `import.meta.resolve()` is unreliable
 * in --experimental-strip-types, so we resolve siblings via `new URL(...)`.
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const specDir = resolve(__dirname, '..', 'spec');

type Section = {
  name: string;
  passed: number;
  failed: number;
  assertions: number;
  its: ReadonlyArray<{ name: string; ok: boolean; msg?: string }>;
};

const sections: Section[] = [];

function banner(s: string) {
  const bar = '═'.repeat(72);
  console.log(`\n${bar}\n${s}\n${bar}`);
}

async function loadSpec(name: string): Promise<{ runXxxSpec: () => Promise<any> }> {
  // Build a URL sibling to this smoke. NOTE: NOT wrapped in pathToFileURL
  // (cycle 60-70 lesson: pathToFileURL of a file: URL double-encodes).
  const url = new URL(`../spec/${name}`, import.meta.url);
  const mod: any = await import(url.href);
  const runFn = Object.values(mod).find((v: any) => typeof v === 'function' && v.name.startsWith('run'));
  if (!runFn) throw new Error(`No runXxxSpec() exported from ${name}`);
  return { runXxxSpec: runFn as any };
}

async function runSection(name: string, specFile: string) {
  banner(`▶ ${name}`);
  const start = Date.now();
  const { runXxxSpec } = await loadSpec(specFile);
  const result = await runXxxSpec();
  const ms = Date.now() - start;
  sections.push({ name, ...result });
  console.log(`✅ ${name}: passed=${result.passed} failed=${result.failed} assertions=${result.assertions} (${ms}ms)`);
  if (result.failed > 0) {
    for (const it of result.its) {
      if (!it.ok) console.error(`  ✗ [FAIL] ${it.name}: ${it.msg ?? '?'}`);
    }
  }
  return result;
}

async function main() {
  banner('W71-C — Audio + Video Posts smoke runner');

  await runSection('1. media-recorder (record states + save)', 'media-recorder.spec.ts');
  await runSection('2. media-player (playback + waveform + SVG)', 'media-player.spec.ts');
  await runSection('3. media-upload (chunked + retry + pause)', 'media-upload.spec.ts');
  await runSection('4. media-codec (magic bytes + 7 traditions)', 'media-codec.spec.ts');

  banner('Summary');

  let totalPassed = 0;
  let totalFailed = 0;
  let totalAssertions = 0;
  for (const s of sections) {
    totalPassed += s.passed;
    totalFailed += s.failed;
    totalAssertions += s.assertions;
    const mark = s.failed === 0 ? '✅' : '❌';
    console.log(`${mark} ${s.name}: ${s.passed}/${s.passed + s.failed} (${s.assertions} assertions)`);
  }
  console.log(`\nTotal: ${totalPassed}/${totalPassed + totalFailed} tests, ${totalAssertions} assertions across ${sections.length} sections.`);
  if (totalFailed > 0) {
    console.error('\n❌ SMOKE FAILED');
    process.exit(1);
  }
  console.log('\n✅ SMOKE PASSED');
  process.exit(0);
}

main().catch((e) => {
  console.error('Smoke runner crashed:', e?.stack ?? e?.message ?? e);
  process.exit(2);
});
