import { runCirclesSpec, logCirclesSpec } from "./circles.spec.ts";
import { runMembershipSpec, logMembershipSpec } from "./membership.spec.ts";
import { runFeedSpec, logFeedSpec } from "./feed.spec.ts";
import { runGovernanceSpec, logGovernanceSpec } from "./governance.spec.ts";

const r1 = runCirclesSpec();
console.log("\n========= circles.spec.ts =========\n" + logCirclesSpec().join("\n"));
console.log(`circles: ${r1.passed}/${r1.passed + r1.failed} passed`);

const r2 = runMembershipSpec();
console.log("\n========= membership.spec.ts =========\n" + logMembershipSpec().join("\n"));
console.log(`membership: ${r2.passed}/${r2.passed + r2.failed} passed`);

const r3 = runFeedSpec();
console.log("\n========= feed.spec.ts =========\n" + logFeedSpec().join("\n"));
console.log(`feed: ${r3.passed}/${r3.passed + r3.failed} passed`);

const r4 = runGovernanceSpec();
console.log("\n========= governance.spec.ts =========\n" + logGovernanceSpec().join("\n"));
console.log(`governance: ${r4.passed}/${r4.passed + r4.failed} passed`);

const totalPassed = r1.passed + r2.passed + r3.passed + r4.passed;
const totalFailed = r1.failed + r2.failed + r3.failed + r4.failed;
console.log(`\n==== TOTAL: ${totalPassed}/${totalPassed + totalFailed} ====`);
if (totalFailed > 0) process.exit(1);
