// vitest.config.local.mjs — worktree-local, NOT the repo's vitest.config.ts
// Keeps the dream-journal-engine isolated from main app deps.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["dream-journal-engine.spec.ts"],
    environment: "node",
    testTimeout: 20_000,
    globals: false,
    isolate: true,
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});