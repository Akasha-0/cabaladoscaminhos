// Worktree-local vitest config — avoids repo's vitest.config.ts which
// imports @vitejs/plugin-react (cabaladoscaminhos has full React setup).
// This config is ISOLATED to w67 worktree and ignores the repo's vite plugins.

import { defineConfig } from "vitest/config";

export default defineConfig({
  root: ".",
  test: {
    environment: "node",
    include: ["**/cigano-spread-visualizer.spec.ts"],
    globals: false,
    typeCheck: false,
    reporters: ["verbose"],
  },
  esbuild: {
    target: "es2022",
  },
});
