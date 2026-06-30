// ============================================================================
// SPIRITUAL JOURNAL — run-all-specs.mjs (Wave 70, 2026-06-30)
// Aggregating smoke runner that invokes all 4 spec files.
// Run via: node --experimental-strip-types __tests__/run-all-specs.mjs
// ============================================================================

import { runJournalSpec, logJournalSpec } from "./journal.spec.ts";
import { runPromptsSpec, logPromptsSpec } from "./prompts.spec.ts";
import { runTagsSpec, logTagsSpec } from "./tags.spec.ts";
import { runLinkingSpec, logLinkingSpec } from "./linking.spec.ts";

const r1 = runJournalSpec();
console.log("\n========= journal.spec.ts =========\n" + logJournalSpec().join("\n"));
console.log(`journal: ${r1.passed}/${r1.passed + r1.failed} passed`);

const r2 = runPromptsSpec();
console.log("\n========= prompts.spec.ts =========\n" + logPromptsSpec().join("\n"));
console.log(`prompts: ${r2.passed}/${r2.passed + r2.failed} passed`);

const r3 = runTagsSpec();
console.log("\n========= tags.spec.ts =========\n" + logTagsSpec().join("\n"));
console.log(`tags: ${r3.passed}/${r3.passed + r3.failed} passed`);

const r4 = runLinkingSpec();
console.log("\n========= linking.spec.ts =========\n" + logLinkingSpec().join("\n"));
console.log(`linking: ${r4.passed}/${r4.passed + r4.failed} passed`);

const totalPassed = r1.passed + r2.passed + r3.passed + r4.passed;
const totalFailed = r1.failed + r2.failed + r3.failed + r4.failed;
console.log(`\n==== TOTAL: ${totalPassed}/${totalPassed + totalFailed} ====`);
if (totalFailed > 0) process.exit(1);