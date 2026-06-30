// Type definitions for the self-running test harness.
// Allows spec files to declare `const h = buildHarness()` typed correctly.

declare global {
  // Self-running harness entry-points. Each spec exports a runXxxSpec function.
  function runFrequenciesSpec(h: import("./harness.ts").Harness): Promise<void>;
  function runMantrasSpec(h: import("./harness.ts").Harness): Promise<void>;
  function runPlaySessionSpec(h: import("./harness.ts").Harness): Promise<void>;
  function runHealingProtocolSpec(h: import("./harness.ts").Harness): Promise<void>;
}

export {};