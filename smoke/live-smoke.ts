/**
 * W71-D: smoke/live-smoke.ts
 *
 * Aggregating smoke runner for all 4 livestream engines.
 * Mirrors vitest API 1:1 — passes when all runXxxSpec() return 0 failures.
 *
 * Usage: `node --experimental-strip-types ./smoke/live-smoke.ts`
 *
 * Cycle 60+ lesson: dynamic import() of sibling .spec.ts files via file:// URL.
 * Do NOT wrap in pathToFileURL() — that double-encodes the path.
 */

import { pathToFileURL } from 'url';

type SpecResult = {
  passed: number;
  failed: number;
  total: number;
  failures: readonly string[];
};

async function loadSpec(file: string): Promise<{ run: () => Promise<SpecResult> | SpecResult; name: string }> {
  const url = pathToFileURL(file).href;
  const mod = await import(url);
  // The spec exports runXxxSpec; pick the one matching the filename.
  const basename = file.split('/').pop()!.replace('.spec.ts', '');
  // The export name is a hand-maintained mapping because of mixed-case tokens
  // (e.g., 'WebRtc' → 'WebRtc', not 'Webrtc').
  const nameMap: Record<string, string> = {
    'stream-session': 'runStreamSessionSpec',
    'webrtc-peer': 'runWebRtcPeerSpec',
    'livestream-chat': 'runLivestreamChatSpec',
    'vod-recorder': 'runVodRecorderSpec',
  };
  const fnName = nameMap[basename];
  if (!fnName) throw new Error(`Spec ${file} has no nameMap entry for '${basename}'`);
  if (typeof mod[fnName] !== 'function') {
    throw new Error(`Spec ${file} does not export ${fnName}()`);
  }
  return { run: mod[fnName], name: basename };
}

async function main(): Promise<void> {
  console.log('═'.repeat(72));
  console.log('  W71-D: livestream-engine smoke runner');
  console.log('  Engines: stream-session, webrtc-peer, livestream-chat, vod-recorder');
  console.log('═'.repeat(72));
  console.log('');

  const specs = [
    { path: new URL('../spec/stream-session.spec.ts', import.meta.url).pathname, name: 'stream-session' },
    { path: new URL('../spec/webrtc-peer.spec.ts', import.meta.url).pathname, name: 'webrtc-peer' },
    { path: new URL('../spec/livestream-chat.spec.ts', import.meta.url).pathname, name: 'livestream-chat' },
    { path: new URL('../spec/vod-recorder.spec.ts', import.meta.url).pathname, name: 'vod-recorder' },
  ];

  let totalPassed = 0;
  let totalFailed = 0;
  let totalAssertions = 0;
  const allFailures: Array<{ spec: string; failures: readonly string[] }> = [];

  for (const spec of specs) {
    console.log(`▶ ${spec.name} (${spec.path})`);
    try {
      const loaded = await loadSpec(spec.path);
      const result = await loaded.run();
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalAssertions += result.total;
      const verdict = result.failed === 0 ? '✅ PASS' : `❌ FAIL (${result.failed}/${result.total})`;
      console.log(`  ${verdict} — ${result.passed}/${result.total} assertions passed`);
      if (result.failed > 0) {
        allFailures.push({ spec: spec.name, failures: result.failures });
      }
    } catch (e: any) {
      console.error(`  ❌ CRASH — ${e?.message ?? String(e)}`);
      totalFailed += 1;
      allFailures.push({ spec: spec.name, failures: [String(e?.stack ?? e)] });
    }
    console.log('');
  }

  console.log('═'.repeat(72));
  console.log('  SUMMARY');
  console.log('═'.repeat(72));
  console.log(`  specs:          ${specs.length}`);
  console.log(`  assertions:     ${totalAssertions}`);
  console.log(`  passed:         ${totalPassed}`);
  console.log(`  failed:         ${totalFailed}`);
  console.log(`  verdict:        ${totalFailed === 0 ? '✅ ALL PASS' : '❌ FAILURES PRESENT'}`);
  console.log('');

  if (totalFailed > 0) {
    console.error('Failures:');
    for (const { spec, failures } of allFailures) {
      console.error(`  [${spec}]`);
      for (const f of failures) console.error(`    - ${f}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Smoke runner crashed:', e);
  process.exit(1);
});