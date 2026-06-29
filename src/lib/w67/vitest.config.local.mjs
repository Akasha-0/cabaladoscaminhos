// vitest.config.local.mjs — worktree-local vitest for w67
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["**/orixa-calendar-engine.spec.ts"],
    globals: false,
    environment: "node",
    reporters: "default",
    pool: "forks",
    testTimeout: 30000,
    hookTimeout: 10000,
  },
});
