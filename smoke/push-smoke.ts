/**
 * W71-B: Aggregating smoke runner for push-service / vapid-jwt / SW / permission-flow.
 *
 * Loads each spec, runs it, and prints a single summary. Mirrors vitest's output
 * shape so cycle-60+ tooling that parses `passed/failed/assertions/its` works.
 */

import { runPushServiceSpec } from '../spec/push-service.spec.ts';
import { runVapidJwtSpec } from '../spec/vapid-jwt.spec.ts';
import { runPermissionFlowSpec } from '../spec/permission-flow.spec.ts';
import { runServiceWorkerRegistrationSpecAsync } from '../spec/service-worker-registration.spec.ts';

interface SpecResult {
  name: string;
  passed: number;
  failed: number;
  assertions: Array<{ name: string; ok: boolean; detail?: string }>;
}

async function main(): Promise<void> {
  const results: SpecResult[] = [];

  console.log('🟣 W71-B push-smoke: starting 4 specs...\n');

  // Sync specs first
  results.push({ name: 'push-service', ...runPushServiceSpec() });
  results.push({ name: 'vapid-jwt', ...runVapidJwtSpec() });
  results.push({ name: 'permission-flow', ...runPermissionFlowSpec() });

  // Async spec
  results.push({ name: 'service-worker-registration', ...(await runServiceWorkerRegistrationSpecAsync()) });

  // ─── Summary ───
  let totalPassed = 0;
  let totalFailed = 0;
  let totalAssertions = 0;
  for (const r of results) {
    totalPassed += r.passed;
    totalFailed += r.failed;
    totalAssertions += r.assertions.length;
    const mark = r.failed === 0 ? '✅' : '❌';
    console.log(`  ${mark} ${r.name}: ${r.passed} passed / ${r.failed} failed / ${r.assertions.length} assertions`);
    if (r.failed > 0) {
      for (const a of r.assertions.filter((a) => !a.ok)) {
        console.log(`      ✗ ${a.name}: ${a.detail ?? ''}`);
      }
    }
  }

  console.log('');
  console.log('─── Totals ───');
  console.log(`  Specs:        ${results.length} (4 expected)`);
  console.log(`  Assertions:   ${totalAssertions}`);
  console.log(`  Passed:       ${totalPassed}`);
  console.log(`  Failed:       ${totalFailed}`);

  if (totalFailed > 0) {
    console.log('\n❌ push-smoke FAILED');
    process.exit(1);
  }
  console.log('\n✅ push-smoke PASSED');
  process.exit(0);
}

await main();