// Run all 4 specs and tally totals
import { runMentorshipScoringSpec } from "../mentorship-scoring.spec.mjs";
import { runMentorshipMatchingSpec } from "../mentorship-matching.spec.mjs";
import { runMentorshipAvailabilitySpec, clearAvailabilityStore } from "../mentorship-availability.spec.mjs";
import { runMentorshipEngineSpec } from "../mentorship-engine.spec.mjs";

clearAvailabilityStore();
const r1 = runMentorshipScoringSpec();
console.log(`mentorship-scoring:    ${r1.passed} passed, ${r1.failed} failed`);

clearAvailabilityStore();
const r2 = runMentorshipMatchingSpec();
console.log(`mentorship-matching:   ${r2.passed} passed, ${r2.failed} failed`);

clearAvailabilityStore();
const r3 = runMentorshipAvailabilitySpec();
console.log(`mentorship-availability: ${r3.passed} passed, ${r3.failed} failed`);

clearAvailabilityStore();
const r4 = runMentorshipEngineSpec();
console.log(`mentorship-engine:     ${r4.passed} passed, ${r4.failed} failed`);

const total = r1.passed + r2.passed + r3.passed + r4.passed;
const failed = r1.failed + r2.failed + r3.failed + r4.failed;
console.log(`\nTOTAL: ${total} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);